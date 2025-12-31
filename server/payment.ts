import { z } from 'zod';
import { getDb } from './db';
import { orders, licenseKeys } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

/**
 * Toss Payments V2 API를 사용한 결제 승인 처리
 *
 * 흐름:
 * 1. 클라이언트에서 결제 위젯으로 결제 요청
 * 2. 결제 성공 시 successUrl로 리다이렉트 (paymentKey, orderId, amount 포함)
 * 3. 서버에서 결제 승인 API 호출
 * 4. 승인 완료 후 주문 및 라이선스 키 생성
 */

// 환경 변수에서 Toss Payments 시크릿 키 가져오기
const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY || '';
const TOSS_API_URL = 'https://api.tosspayments.com/v1/payments';

/**
 * 시크릿 키를 Base64로 인코딩하여 Basic 인증 헤더 생성
 */
export function getBasicAuthHeader(): string {
  // 시크릿 키 뒤에 콜론(:)을 추가하고 Base64로 인코딩
  const credentials = `${TOSS_SECRET_KEY}:`;
  const encoded = Buffer.from(credentials).toString('base64');
  return `Basic ${encoded}`;
}

/**
 * 2️⃣ 결제 승인 요청
 *
 * 클라이언트에서 받은 paymentKey, orderId, amount를 사용하여
 * Toss Payments API에 결제 승인을 요청합니다.
 */
export async function approvePayment(
  paymentKey: string,
  orderId: string,
  amount: number,
  userId: number
): Promise<{
  success: boolean;
  paymentId?: string;
  error?: string;
}> {
  try {
    console.log(`[결제 승인] 시작 - orderId: ${orderId}, amount: ${amount}`);

    const db = await getDb();
    if (!db) throw new Error('Database not available');

    // 1. 금액 검증 (클라이언트에서 조작되지 않았는지 확인)
    const orderIdNum = parseInt(orderId.split('-')[0]) || 0;
    const orderList = await db.select().from(orders).where(eq(orders.id, orderIdNum)).limit(1);
    const order = orderList[0];

    if (!order) {
      throw new Error('주문을 찾을 수 없습니다.');
    }

    // 금액이 일치하는지 확인 (보안) - totalPrice 사용
    const expectedAmount = Math.round(parseFloat(order.totalPrice));
    if (expectedAmount !== amount) {
      throw new Error('결제 금액이 일치하지 않습니다.');
    }

    // 2. Toss Payments API에 결제 승인 요청
    const response = await fetch(`${TOSS_API_URL}/${paymentKey}`, {
      method: 'POST',
      headers: {
        'Authorization': getBasicAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderId: orderId,
        amount: amount,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[결제 승인 실패]', errorData);
      throw new Error(errorData.message || '결제 승인에 실패했습니다.');
    }

    const paymentData = await response.json();

    console.log(`[결제 승인 성공] paymentKey: ${paymentKey}`);

    // 3. 결제 성공 후 처리
    // - 주문 상태 업데이트
    // - 라이선스 키 생성

    // 주문 상태를 'completed'로 업데이트
    await db
      .update(orders)
      .set({
        status: 'completed',
        transactionId: paymentKey,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, order.id));

    // 라이선스 키 생성
    const licenseKey = generateLicenseKey();
    await db.insert(licenseKeys).values({
      key: licenseKey,
      productId: order.productId,
      buyerId: userId,
      orderId: order.id,
      status: 'active',
      activatedAt: new Date(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1년 유효
    });

    console.log(`[라이선스 키 생성] key: ${licenseKey}`);

    return {
      success: true,
      paymentId: paymentData.paymentKey,
    };
  } catch (error) {
    console.error('[결제 승인 오류]', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
    };
  }
}

/**
 * 라이선스 키 생성 함수
 * 형식: SOFTHUB-XXXXXXXX-XXXXXXXX-XXXXXXXX
 */
function generateLicenseKey(): string {
  const segment1 = nanoid(8).toUpperCase();
  const segment2 = nanoid(8).toUpperCase();
  const segment3 = nanoid(8).toUpperCase();
  return `SOFTHUB-${segment1}-${segment2}-${segment3}`;
}

/**
 * 결제 실패 처리
 */
export async function handlePaymentFailure(
  orderId: string,
  errorCode: string,
  errorMessage: string
): Promise<void> {
  try {
    console.log(`[결제 실패] orderId: ${orderId}, code: ${errorCode}, message: ${errorMessage}`);

    const db = await getDb();
    if (!db) throw new Error('Database not available');

    // 주문 상태를 'failed'로 업데이트
    const orderIdNum = parseInt(orderId.split('-')[0]) || 0;
    const orderList = await db.select().from(orders).where(eq(orders.id, orderIdNum)).limit(1);
    const order = orderList[0];

    if (order) {
      await db
        .update(orders)
        .set({
          status: 'failed',
          updatedAt: new Date(),
        })
        .where(eq(orders.id, order.id));
    }

    // 에러 로깅 (실제로는 모니터링 서비스에 전송)
    console.error(`[결제 실패 기록] ${errorCode}: ${errorMessage}`);
  } catch (error) {
    console.error('[결제 실패 처리 오류]', error);
  }
}

/**
 * 결제 취소 처리
 */
export async function cancelPayment(
  paymentKey: string,
  cancelReason: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    console.log(`[결제 취소] paymentKey: ${paymentKey}, reason: ${cancelReason}`);

    // Toss Payments API에 결제 취소 요청
    const response = await fetch(`${TOSS_API_URL}/${paymentKey}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': getBasicAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cancelReason: cancelReason,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[결제 취소 실패]', errorData);
      throw new Error(errorData.message || '결제 취소에 실패했습니다.');
    }

    console.log(`[결제 취소 성공] paymentKey: ${paymentKey}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error('[결제 취소 오류]', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
    };
  }
}
