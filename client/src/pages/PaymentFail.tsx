import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';

export default function PaymentFail() {
  const [, setLocation] = useLocation();

  // URL에서 에러 정보 추출
  const urlParams = new URLSearchParams(window.location.search);
  const errorCode = urlParams.get('code') || 'UNKNOWN';
  const errorMessage = urlParams.get('message') || '결제 처리 중 오류가 발생했습니다.';
  const orderId = urlParams.get('orderId');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white px-4">
      <Card className="max-w-md w-full border-2 border-red-200">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-red-600">결제 실패</CardTitle>
          <CardDescription className="text-gray-600">
            결제가 정상적으로 처리되지 않았습니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-red-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">오류 코드</span>
              <span className="font-mono text-red-700">{errorCode}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">오류 메시지</span>
              <p className="text-red-700 mt-1">{errorMessage}</p>
            </div>
            {orderId && (
              <div className="flex justify-between text-sm pt-2 border-t border-red-200">
                <span className="text-gray-600">주문 ID</span>
                <span className="font-mono text-gray-700">{orderId}</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => window.history.back()}
              className="w-full bg-pink-600 hover:bg-pink-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              다시 시도하기
            </Button>
            <Button
              variant="outline"
              onClick={() => setLocation('/')}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              홈으로 돌아가기
            </Button>
          </div>

          <p className="text-center text-sm text-gray-500">
            문제가 계속되면 고객센터로 문의해주세요.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
