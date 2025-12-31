import { useState } from 'react';
import { useRoute, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Loader2, AlertCircle, CreditCard, Building2, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

type PaymentMethod = 'card' | 'transfer' | 'virtual_account' | 'mobile';

export default function Checkout() {
  const [, params] = useRoute('/checkout/:productId');
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [errorMessage, setErrorMessage] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  // 샘플 제품 정보 (실제로는 API에서 받아옴)
  const product = {
    id: parseInt(params?.productId || '1'),
    name: 'Pro Design Suite',
    price: 49.99,
    description: 'Professional design software with advanced features',
  };

  const createOrderMutation = trpc.payments.createOrder.useMutation();

  // 결제 요청 (API 개별 연동 방식)
  const handlePaymentRequest = async () => {
    try {
      // 입력 검증
      if (!customerName.trim()) {
        toast.error('구매자 이름을 입력해주세요.');
        return;
      }
      if (!customerEmail.trim() || !customerEmail.includes('@')) {
        toast.error('올바른 이메일 주소를 입력해주세요.');
        return;
      }

      setLoading(true);
      setErrorMessage('');

      // 1. 서버에 주문 생성
      const orderData = await createOrderMutation.mutateAsync({
        productId: product.id,
      });

      // 2. 토스페이먼츠 결제 API 호출
      const response = await fetch('https://api.tosspayments.com/v1/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(import.meta.env.VITE_TOSS_CLIENT_KEY + ':')}`,
        },
        body: JSON.stringify({
          method: paymentMethod.toUpperCase(),
          amount: orderData.amount,
          orderId: orderData.orderId,
          orderName: orderData.productName,
          customerName: customerName,
          customerEmail: customerEmail,
          successUrl: `${window.location.origin}/payment/success`,
          failUrl: `${window.location.origin}/payment/fail`,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '결제 요청에 실패했습니다.');
      }

      const paymentData = await response.json();

      // 3. 결제 페이지로 리다이렉트
      if (paymentData.checkoutUrl) {
        window.location.href = paymentData.checkoutUrl;
      } else {
        throw new Error('결제 페이지 URL을 받지 못했습니다.');
      }
    } catch (error: any) {
      console.error('결제 요청 실패:', error);
      setErrorMessage(error.message || '결제 요청에 실패했습니다.');
      toast.error(error.message || '결제 요청에 실패했습니다.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-pink-50 to-white py-12 px-4">
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

        {/* 구매자 정보 입력 */}
        <Card className="mb-8 border-2 border-pink-200">
          <CardHeader>
            <CardTitle>구매자 정보</CardTitle>
            <CardDescription>결제에 필요한 정보를 입력해주세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">이름</Label>
              <Input
                id="customerName"
                placeholder="홍길동"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerEmail">이메일</Label>
              <Input
                id="customerEmail"
                type="email"
                placeholder="example@email.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                disabled={loading}
              />
            </div>
          </CardContent>
        </Card>

        {/* 결제 방법 선택 */}
        <Card className="mb-8 border-2 border-pink-200">
          <CardHeader>
            <CardTitle>결제 방법 선택</CardTitle>
            <CardDescription>원하는 결제 수단을 선택해주세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 에러 메시지 */}
            {errorMessage && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                <div>
                  <p className="font-semibold text-red-900">결제 오류</p>
                  <p className="text-sm text-red-700">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* 결제 수단 선택 */}
            <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
              <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <RadioGroupItem value="card" id="card" />
                <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer flex-1">
                  <CreditCard className="w-5 h-5 text-pink-600" />
                  <span>신용/체크카드</span>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <RadioGroupItem value="transfer" id="transfer" />
                <Label htmlFor="transfer" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Building2 className="w-5 h-5 text-pink-600" />
                  <span>계좌이체</span>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <RadioGroupItem value="virtual_account" id="virtual_account" />
                <Label htmlFor="virtual_account" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Building2 className="w-5 h-5 text-pink-600" />
                  <span>가상계좌</span>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <RadioGroupItem value="mobile" id="mobile" />
                <Label htmlFor="mobile" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Smartphone className="w-5 h-5 text-pink-600" />
                  <span>휴대폰 결제</span>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* 결제 버튼 */}
        <Button
          onClick={handlePaymentRequest}
          disabled={loading}
          className="w-full py-6 text-lg font-semibold bg-linear-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 text-white rounded-lg transition-all duration-300"
        >
          {loading ? (
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
