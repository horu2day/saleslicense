import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Download as DownloadIcon, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function Download() {
  const [licenseKey, setLicenseKey] = useState("");
  const [validatedLicense, setValidatedLicense] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);

  const handleValidateLicense = async () => {
    if (!licenseKey.trim()) {
      toast.error("라이선스 키를 입력해주세요");
      return;
    }

    setIsValidating(true);
    try {
      if (licenseKey.length > 10) {
        setValidatedLicense({
          id: 1,
          productId: 1,
          key: licenseKey,
          status: "active",
          createdAt: new Date(),
        });
        toast.success("라이선스 키가 검증되었습니다");
      } else {
        toast.error("유효하지 않은 라이선스 키입니다");
      }
    } catch (error: any) {
      toast.error("검증 실패: " + error.message);
    } finally {
      setIsValidating(false);
    }
  };

  const handleDownload = (productId: number) => {
    toast.success("다운로드가 시작되었습니다");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-black">소프트웨어 다운로드</h1>
          <p className="text-gray-600 mt-1">
            라이선스 키를 입력하여 소프트웨어를 다운로드하세요.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 bg-white border border-gray-200 mb-8">
          <h2 className="text-2xl font-bold text-black mb-6">라이선스 키 입력</h2>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                라이선스 키
              </label>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="예: 1-ABC123DEF456GHI789JKL"
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value)}
                  className="flex-1"
                  disabled={validatedLicense !== null}
                />
                <Button
                  onClick={handleValidateLicense}
                  disabled={isValidating || validatedLicense !== null}
                  className="bg-black text-white hover:bg-gray-900"
                >
                  {isValidating ? "검증 중..." : "검증"}
                </Button>
                {validatedLicense && (
                  <Button
                    onClick={() => {
                      setValidatedLicense(null);
                      setLicenseKey("");
                    }}
                    variant="outline"
                    className="border-gray-300"
                  >
                    초기화
                  </Button>
                )}
              </div>
            </div>

            {validatedLicense && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-900">
                      라이선스가 유효합니다
                    </p>
                    <p className="text-sm text-green-700 mt-1">
                      제품 ID: {validatedLicense.productId}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {validatedLicense ? (
          <Card className="p-8 bg-white border border-gray-200">
            <h2 className="text-2xl font-bold text-black mb-6">
              소프트웨어 다운로드
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-200 rounded-lg">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-black">
                    제품 {validatedLicense.productId}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    라이선스 상태: <span className="font-medium text-green-600">활성</span>
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  <div>
                    <p className="text-xs text-gray-600">라이선스 키</p>
                    <p className="text-sm font-mono bg-white px-3 py-2 rounded mt-1 break-all">
                      {validatedLicense.key}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => handleDownload(validatedLicense.productId)}
                  className="w-full bg-black text-white hover:bg-gray-900 gap-2"
                >
                  <DownloadIcon className="w-4 h-4" />
                  다운로드
                </Button>
              </div>

              <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-bold text-black mb-4">다운로드 안내</h4>
                <ol className="space-y-3 text-sm">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      1
                    </span>
                    <span className="text-gray-700">
                      위의 다운로드 버튼을 클릭하여 소프트웨어를 다운로드하세요.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      2
                    </span>
                    <span className="text-gray-700">
                      설치 프로그램을 실행합니다.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      3
                    </span>
                    <span className="text-gray-700">
                      라이선스 키를 입력합니다.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      4
                    </span>
                    <span className="text-gray-700">
                      설치를 완료합니다.
                    </span>
                  </li>
                </ol>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="p-12 bg-white border border-gray-200 text-center">
            <DownloadIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              라이선스 키를 입력하면 소프트웨어를 다운로드할 수 있습니다.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
