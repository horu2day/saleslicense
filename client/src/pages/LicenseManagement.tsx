import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Copy, RefreshCw, Lock, Unlock, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

export default function LicenseManagement() {
  const { user, isAuthenticated } = useAuth();
  const [filterStatus, setFilterStatus] = useState("all");
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [generateData, setGenerateData] = useState({
    productId: "",
    count: "1",
  });

  // Fetch seller products
  const { data: sellerProducts = [] } = trpc.products.getMySelling.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Fetch all licenses (we'll need to create this endpoint)
  const { data: allLicenses = [] } = trpc.licenses.getSellerLicenses.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Generate license mutation
  const generateLicenseMutation = trpc.licenses.generateForProduct.useMutation({
    onSuccess: (keys) => {
      toast.success(`${keys.length}개의 라이선스 키가 생성되었습니다`);
      setIsGenerateOpen(false);
      setGenerateData({ productId: "", count: "1" });
    },
    onError: (error: any) => {
      toast.error("라이선스 생성 실패: " + error.message);
    },
  });

  const updateStatusMutation = trpc.licenses.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("라이선스 상태가 변경되었습니다");
    },
    onError: (error: any) => {
      toast.error("상태 변경 실패: " + error.message);
    },
  });

  const handleGenerateLicenses = () => {
    if (!generateData.productId) {
      toast.error("제품을 선택해주세요");
      return;
    }

    generateLicenseMutation.mutate({
      productId: parseInt(generateData.productId),
      count: parseInt(generateData.count),
    });
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success("라이선스 키가 복사되었습니다");
  };

  const handleToggleLicenseStatus = (license: any) => {
    const newStatus = license.status === "active" ? "inactive" : "active";
    updateStatusMutation.mutate({
      licenseId: license.id,
      status: newStatus,
    });
  };

  // Filter licenses
  const filteredLicenses = allLicenses.filter((license: any) => {
    if (filterStatus === "all") return true;
    return license.status === filterStatus;
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">로그인 필요</h2>
          <p className="text-gray-600 mb-6">
            라이선스 관리에 접근하려면 로그인해주세요.
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
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black">라이선스 키 관리</h1>
            <p className="text-gray-600 mt-1">라이선스 키를 생성하고 관리하세요</p>
          </div>
          <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-pink-600 text-white hover:bg-pink-700 gap-2">
                <Plus className="w-4 h-4" />
                라이선스 생성
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>라이선스 키 생성</DialogTitle>
                <DialogDescription>
                  새로운 라이선스 키를 생성하세요.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">제품 선택 *</label>
                  <Select
                    value={generateData.productId}
                    onValueChange={(value) =>
                      setGenerateData({ ...generateData, productId: value })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="제품을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {sellerProducts.map((product: any) => (
                        <SelectItem key={product.id} value={product.id.toString()}>
                          {product.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">생성 개수</label>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={generateData.count}
                    onChange={(e) =>
                      setGenerateData({ ...generateData, count: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                <Button
                  onClick={handleGenerateLicenses}
                  disabled={generateLicenseMutation.isPending}
                  className="w-full bg-black text-white hover:bg-gray-900"
                >
                  {generateLicenseMutation.isPending ? "생성 중..." : "생성"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Statistics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-white border border-gray-200">
            <p className="text-gray-600 text-sm font-medium">총 라이선스</p>
            <p className="text-3xl font-bold text-black mt-2">
              {allLicenses.length}
            </p>
          </Card>

          <Card className="p-6 bg-white border border-gray-200">
            <p className="text-gray-600 text-sm font-medium">활성</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {allLicenses.filter((l: any) => l.status === "active").length}
            </p>
          </Card>

          <Card className="p-6 bg-white border border-gray-200">
            <p className="text-gray-600 text-sm font-medium">비활성</p>
            <p className="text-3xl font-bold text-gray-600 mt-2">
              {allLicenses.filter((l: any) => l.status === "inactive").length}
            </p>
          </Card>

          <Card className="p-6 bg-white border border-gray-200">
            <p className="text-gray-600 text-sm font-medium">만료됨</p>
            <p className="text-3xl font-bold text-red-600 mt-2">
              {allLicenses.filter((l: any) => l.status === "expired").length}
            </p>
          </Card>
        </div>

        {/* Filter */}
        <div className="mb-6 flex gap-4">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">모든 상태</SelectItem>
              <SelectItem value="active">활성</SelectItem>
              <SelectItem value="inactive">비활성</SelectItem>
              <SelectItem value="expired">만료됨</SelectItem>
              <SelectItem value="revoked">취소됨</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* License Table */}
        {filteredLicenses.length === 0 ? (
          <Card className="p-12 bg-white border border-gray-200 text-center">
            <p className="text-gray-600 mb-4">라이선스 키가 없습니다.</p>
            <Button
              onClick={() => setIsGenerateOpen(true)}
              className="bg-black text-white hover:bg-gray-900"
            >
              첫 라이선스 생성하기
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
                    생성일
                  </th>
                  <th className="text-left py-4 px-6 font-bold text-black">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLicenses.map((license: any) => (
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
                          onClick={() => handleCopyKey(license.key)}
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
                      {new Date(license.createdAt).toLocaleDateString("ko-KR")}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        {license.status === "active" ? (
                          <button
                            onClick={() => handleToggleLicenseStatus(license)}
                            className="p-2 hover:bg-gray-200 rounded transition-colors"
                            title="비활성화"
                          >
                            <Lock className="w-4 h-4 text-green-600" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleLicenseStatus(license)}
                            className="p-2 hover:bg-gray-200 rounded transition-colors"
                            title="활성화"
                          >
                            <Unlock className="w-4 h-4 text-gray-400" />
                          </button>
                        )}
                        <button
                          className="p-2 hover:bg-red-100 rounded transition-colors"
                          title="삭제"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
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
    </div>
  );
}
