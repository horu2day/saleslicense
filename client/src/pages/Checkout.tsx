import { useEffect, useRef, useState } from 'react';
import { useRoute } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

// Toss Payments V2 SDK 타입 정의
declare global {
  interface Window {
    TossPayments: any;
  }
}

interface CheckoutProps {
  productId: number;
  productName: string;
  price: number;
  orderId: string;
}

export default function Checkout() {
  const [, params] = useRoute('/checkout/:productId');
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const widgetsRef = useRef<any>(null);
  const paymentMethodRef = useRef<HTMLDivElement>(null);
  const agreementRef = useRef<HTMLDivElement>(null);

  // 샘플 제품 정보 (실제로는 API에서 받아옴)
  const product = {
    id: parseInt(params?.productId || '1'),
    name: 'Pro Design Suite',
    price: 49.99,
    description: 'Professional design software with advanced features',
  };

  const orderId = `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  useEffect(() => {
    initializePaymentWidget();
  }, []);

  // 1️⃣ 결제 위젯 초기화
  const initializePaymentWidget = async () => {
    try {
      setLoading(true);

      // Toss Payments V2 SDK 로드
      if (!window.TossPayments) {
        const script = document.createElement('script');
        script.src = 'https://js.tosspayments.com/v2/standard';
        script.async = true;
        document.head.appendChild(script);

        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }

      // 클라이언트 키 (환경 변수에서 가져오기)
      const clientKey = import.meta.env.VITE_TOSS_CLIENT_KEY || 'test_ck_live_...';

      // Toss Payments 인스턴스 생성
      const tossPayments = window.TossPayments(clientKey);

      // 비회원 결제 (또는 회원 결제 시 customerKey 사용)
      const widgets = tossPayments.widgets({
        customerKey: window.TossPayments.ANONYMOUS,
      });

      widgetsRef.current = widgets;

      // 결제 금액 설정
      await widgets.setAmount({
        currency: 'KRW',
        value: Math.round(product.price * 1000), // 원화로 변환
      });

      // 결제 UI 렌더링
      await Promise.all([
        widgets.renderPaymentMethods({
          selector: '#payment-method',
          variantKey: 'DEFAULT',
        }),
        widgets.renderAgreement({
          selector: '#agreement',
          variantKey: 'AGREEMENT',
        }),
      ]);

      setLoading(false);
    } catch (error) {
      console.error('결제 위젯 초기화 실패:', error);
      setErrorMessage('결제 위젯 초기화에 실패했습니다.');
      setPaymentStatus('error');
      setLoading(false);
    }
  };

  // 2️⃣ 결제 요청 (결제 승인 전 단계)
  const handlePaymentRequest = async () => {
    try {
      setLoading(true);
      setPaymentStatus('processing');

      if (!widgetsRef.current) {
        throw new Error('결제 위젯이 초기화되지 않았습니다.');
      }

      // 결제 요청
      await widgetsRef.current.requestPayment({
        orderId: orderId,
        orderName: product.name,
        customerEmail: 'customer@example.com', // 실제로는 로그인한 사용자 정보 사용
        customerName: 'Customer Name',
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
      });

      // 성공 URL로 리다이렉트되면 결제 승인 API 호출
      // (successUrl에서 처리)
    } catch (error: any) {
      console.error('결제 요청 실패:', error);
      setErrorMessage(error.message || '결제 요청에 실패했습니다.');
      setPaymentStatus('error');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* 주문 정보 카드 */}
        <Card className="mb-8 border-2 border-pink-200">
          <CardHeader>
            <CardTitle className="text-2xl">주문 확인</CardTitle>
            <CardDescription>제품 구매를 완료하세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b">
              <div>
                <h3 className="font-semibold text-lg">{product.name}</h3>
                <p className="text-gray-600 text-sm">{product.description}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-pink-600">
                  ₩{Math.round(product.price * 1000).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">주문 ID</span>
                <span className="font-mono text-gray-900">{orderId}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">상품명</span>
                <span className="text-gray-900">{product.name}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold pt-2 border-t">
                <span>총 결제액</span>
                <span className="text-pink-600">₩{Math.round(product.price * 1000).toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 결제 위젯 카드 */}
        <Card className="mb-8 border-2 border-pink-200">
          <CardHeader>
            <CardTitle>결제 방법 선택</CardTitle>
            <CardDescription>원하는 결제 수단을 선택해주세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 에러 메시지 */}
            {paymentStatus === 'error' && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-red-900">결제 오류</p>
                  <p className="text-sm text-red-700">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* 결제 위젯 로딩 */}
            {loading && paymentStatus === 'idle' && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-pink-600" />
                <span className="ml-3 text-gray-600">결제 위젯 로드 중...</span>
              </div>
            )}

            {/* 결제 UI 렌더링 영역 */}
            {!loading && (
              <>
                <div
                  id="payment-method"
                  ref={paymentMethodRef}
                  className="min-h-[200px] border border-gray-200 rounded-lg p-4"
                />

                {/* 이용약관 UI 렌더링 영역 */}
                <div
                  id="agreement"
                  ref={agreementRef}
                  className="min-h-[100px] border border-gray-200 rounded-lg p-4"
                />
              </>
            )}
          </CardContent>
        </Card>

        {/* 결제 버튼 */}
        <Button
          onClick={handlePaymentRequest}
          disabled={loading || paymentStatus === 'processing'}
          className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 text-white rounded-lg transition-all duration-300"
        >
          {loading || paymentStatus === 'processing' ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              결제 처리 중...
            </>
          ) : (
            `₩${Math.round(product.price * 1000).toLocaleString()} 결제하기`
          )}
        </Button>

        {/* 안내 문구 */}
        <p className="text-center text-sm text-gray-500 mt-4">
          결제 후 라이선스 키가 자동으로 발급됩니다.
        </p>
      </div>
    </div>
  );
}
