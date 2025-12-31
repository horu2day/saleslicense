import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Loader2, Copy, Download } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

export default function PaymentSuccess() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [paymentResult, setPaymentResult] = useState<{
    success: boolean;
    licenseKey?: string;
    productName?: string;
    error?: string;
  } | null>(null);

  const confirmPaymentMutation = trpc.payments.confirm.useMutation();

  useEffect(() => {
    const confirmPayment = async () => {
      // URL에서 결제 정보 추출
      const urlParams = new URLSearchParams(window.location.search);
      const paymentKey = urlParams.get('paymentKey');
      const orderId = urlParams.get('orderId');
      const amount = urlParams.get('amount');

      if (!paymentKey || !orderId || !amount) {
        setPaymentResult({
          success: false,
          error: '결제 정보가 올바르지 않습니다.',
        });
        setLoading(false);
        return;
      }

      try {
        // 서버에 결제 승인 요청
        const result = await confirmPaymentMutation.mutateAsync({
          paymentKey,
          orderId,
          amount: parseInt(amount),
        });

        setPaymentResult({
          success: true,
          licenseKey: result.licenseKey ?? undefined,
          productName: result.productName,
        });
      } catch (error: any) {
        console.error('결제 승인 실패:', error);
        setPaymentResult({
          success: false,
          error: error.message || '결제 승인에 실패했습니다.',
        });
      } finally {
        setLoading(false);
      }
    };

    confirmPayment();
  }, []);

  const copyLicenseKey = () => {
    if (paymentResult?.licenseKey) {
      navigator.clipboard.writeText(paymentResult.licenseKey);
      toast.success('라이선스 키가 클립보드에 복사되었습니다.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-white">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-pink-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600">결제 확인 중...</p>
        </div>
      </div>
    );
  }

  if (!paymentResult?.success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white px-4">
        <Card className="max-w-md w-full border-2 border-red-200">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">!</span>
            </div>
            <CardTitle className="text-2xl text-red-600">결제 실패</CardTitle>
            <CardDescription>{paymentResult?.error}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => setLocation('/')} className="w-full">
              홈으로 돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white px-4">
      <Card className="max-w-md w-full border-2 border-green-200">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-600">결제 완료!</CardTitle>
          <CardDescription>
            {paymentResult.productName} 구매가 완료되었습니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {paymentResult.licenseKey && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">라이선스 키</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-white p-3 rounded border font-mono text-sm break-all">
                  {paymentResult.licenseKey}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyLicenseKey}
                  title="복사"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Button
              onClick={() => setLocation('/mypage')}
              className="w-full bg-pink-600 hover:bg-pink-700"
            >
              <Download className="w-4 h-4 mr-2" />
              마이페이지에서 다운로드
            </Button>
            <Button
              variant="outline"
              onClick={() => setLocation('/')}
              className="w-full"
            >
              계속 쇼핑하기
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
