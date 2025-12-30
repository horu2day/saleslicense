import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Copy, Download, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export default function MyPage() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("orders");

  // Fetch buyer orders
  const { data: orders = [] } = trpc.orders.getMyOrders.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Fetch buyer licenses
  const { data: licenses = [] } = trpc.licenses.getMyLicenses.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const handleCopyLicense = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success("라이선스 키가 복사되었습니다");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">로그인 필요</h2>
          <p className="text-gray-600 mb-6">
            마이페이지에 접근하려면 로그인해주세요.
          </p>
          <Button className="w-full bg-black text-white hover:bg-gray-900">
            로그인
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-black">마이페이지</h1>
          <p className="text-gray-600 mt-1">
            {user?.name || "사용자"}님의 주문 및 라이선스 관리
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Profile Card */}
        <Card className="p-6 bg-white border border-gray-200 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-black">{user?.name}</h2>
              <p className="text-gray-600 mt-1">{user?.email}</p>
            </div>
            <Button
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              프로필 수정
            </Button>
          </div>
        </Card>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("orders")}
            className={`pb-4 px-2 font-medium transition-colors ${
              activeTab === "orders"
                ? "text-pink-600 border-b-2 border-pink-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            주문 내역 ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab("licenses")}
            className={`pb-4 px-2 font-medium transition-colors ${
              activeTab === "licenses"
                ? "text-pink-600 border-b-2 border-pink-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            라이선스 키 ({licenses.length})
          </button>
        </div>

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div>
            {orders.length === 0 ? (
              <Card className="p-12 bg-white border border-gray-200 text-center">
                <p className="text-gray-600 mb-4">주문 내역이 없습니다.</p>
                <Button className="bg-black text-white hover:bg-gray-900">
                  소프트웨어 둘러보기
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders.map((order: any) => (
                  <Card
                    key={order.id}
                    className="p-6 bg-white border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-black">
                          주문 #{order.id}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {new Date(order.createdAt).toLocaleDateString(
                            "ko-KR"
                          )}
                        </p>
                      </div>
                      <span
                        className={`px-4 py-2 rounded-full text-sm font-medium ${
                          order.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : order.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {order.status === "completed"
                          ? "완료"
                          : order.status === "pending"
                          ? "대기 중"
                          : "실패"}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">수량</p>
                        <p className="text-lg font-bold text-black">
                          {order.quantity}개
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">단가</p>
                        <p className="text-lg font-bold text-black">
                          {order.unitPrice}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">총액</p>
                        <p className="text-lg font-bold text-pink-600">
                          {order.totalPrice}
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      라이선스 키 보기
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Licenses Tab */}
        {activeTab === "licenses" && (
          <div>
            {licenses.length === 0 ? (
              <Card className="p-12 bg-white border border-gray-200 text-center">
                <p className="text-gray-600 mb-4">라이선스 키가 없습니다.</p>
                <Button className="bg-black text-white hover:bg-gray-900">
                  소프트웨어 구매하기
                </Button>
              </Card>
            ) : (
              <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-4 px-6 font-bold text-black">
                        라이선스 키
                      </th>
                      <th className="text-left py-4 px-6 font-bold text-black">
                        제품
                      </th>
                      <th className="text-left py-4 px-6 font-bold text-black">
                        상태
                      </th>
                      <th className="text-left py-4 px-6 font-bold text-black">
                        구매일
                      </th>
                      <th className="text-left py-4 px-6 font-bold text-black">
                        작업
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {licenses.map((license: any) => (
                      <tr
                        key={license.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                              {license.key.substring(0, 20)}...
                            </code>
                            <button
                              onClick={() => handleCopyLicense(license.key)}
                              className="p-1 hover:bg-gray-200 rounded transition-colors"
                            >
                              <Copy className="w-4 h-4 text-gray-600" />
                            </button>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">
                          제품 {license.productId}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              license.status === "active"
                                ? "bg-green-100 text-green-700"
                                : license.status === "inactive"
                                ? "bg-gray-100 text-gray-700"
                                : license.status === "expired"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {license.status === "active"
                              ? "활성"
                              : license.status === "inactive"
                              ? "비활성"
                              : license.status === "expired"
                              ? "만료됨"
                              : "취소됨"}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">
                          {new Date(license.createdAt).toLocaleDateString(
                            "ko-KR"
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex gap-2">
                            <button
                              className="p-2 hover:bg-gray-200 rounded transition-colors"
                              title="다운로드"
                            >
                              <Download className="w-4 h-4 text-gray-600" />
                            </button>
                            <button
                              className="p-2 hover:bg-gray-200 rounded transition-colors"
                              title="자세히"
                            >
                              <ExternalLink className="w-4 h-4 text-gray-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
