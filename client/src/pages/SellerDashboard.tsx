import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Plus, Edit2, Trash2, Eye, Download, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { toast } from "sonner";

export default function SellerDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editData, setEditData] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
  });
  const [newProduct, setNewProduct] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    licenseType: "perpetual" as const,
  });

  // Fetch seller data
  const { data: sellerProducts = [] } = trpc.products.getMySelling.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const { data: sellerOrders = [] } = trpc.orders.getSellingOrders.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const { data: sellerProfile } = trpc.seller.getMyProfile.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Mutations
  const createProductMutation = trpc.products.create.useMutation({
    onSuccess: () => {
      toast.success("제품이 추가되었습니다");
      setIsAddProductOpen(false);
      setNewProduct({
        title: "",
        description: "",
        category: "",
        price: "",
        licenseType: "perpetual",
      });
    },
    onError: (error) => {
      toast.error("제품 추가 실패: " + error.message);
    },
  });

  const updateProductMutation = trpc.products.update.useMutation({
    onSuccess: () => {
      toast.success("제품이 수정되었습니다");
      setIsEditOpen(false);
      setEditingProduct(null);
    },
    onError: (error) => {
      toast.error("제품 수정 실패: " + error.message);
    },
  });

  const deleteProductMutation = trpc.products.delete.useMutation({
    onSuccess: () => {
      toast.success("제품이 삭제되었습니다");
    },
    onError: (error: any) => {
      toast.error("제품 삭제 실패: " + error.message);
    },
  });

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setEditData({
      title: product.title,
      description: product.description || "",
      category: product.category || "",
      price: product.price,
    });
    setIsEditOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editData.title || !editData.price) {
      toast.error("제목과 가격을 입력해주세요");
      return;
    }

    updateProductMutation.mutate({
      id: editingProduct.id,
      title: editData.title,
      description: editData.description,
      category: editData.category,
      price: editData.price,
    });
  };

  const handleDeleteProduct = (productId: number) => {
    if (confirm("정말로 이 제품을 삭제하시겠습니까?")) {
      deleteProductMutation.mutate({ id: productId });
    }
  };

  const handleAddProduct = () => {
    if (!newProduct.title || !newProduct.price) {
      toast.error("제목과 가격을 입력해주세요");
      return;
    }

    createProductMutation.mutate({
      title: newProduct.title,
      description: newProduct.description,
      category: newProduct.category,
      price: newProduct.price,
      licenseType: newProduct.licenseType,
    });
  };

  // Calculate statistics
  const totalRevenue = sellerOrders
    .filter((order: any) => order.status === "completed")
    .reduce((sum: number, order: any) => sum + parseFloat(order.totalPrice), 0);

  const totalSales = sellerOrders.filter(
    (order: any) => order.status === "completed"
  ).length;

  const activeProducts = sellerProducts.length;

  // Mock chart data - in real app, this would come from analytics
  const chartData = [
    { month: "1월", sales: 400, revenue: 2400 },
    { month: "2월", sales: 300, revenue: 1398 },
    { month: "3월", sales: 200, revenue: 9800 },
    { month: "4월", sales: 278, revenue: 3908 },
    { month: "5월", sales: 189, revenue: 4800 },
    { month: "6월", sales: 239, revenue: 3800 },
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">로그인 필요</h2>
          <p className="text-gray-600 mb-6">
            판매자 대시보드에 접근하려면 로그인해주세요.
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
            <h1 className="text-3xl font-bold text-black">판매자 대시보드</h1>
            <p className="text-gray-600 mt-1">
              {sellerProfile?.companyName || user?.name}님의 판매 현황
            </p>
          </div>
          <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
            <DialogTrigger asChild>
              <Button className="bg-pink-600 text-white hover:bg-pink-700 gap-2">
                <Plus className="w-4 h-4" />
                새 제품 추가
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>새 소프트웨어 제품 추가</DialogTitle>
                <DialogDescription>
                  판매할 소프트웨어 제품의 정보를 입력해주세요.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">제품명 *</label>
                  <Input
                    placeholder="예: Pro Design Suite"
                    value={newProduct.title}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, title: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">설명</label>
                  <Input
                    placeholder="제품 설명"
                    value={newProduct.description}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        description: e.target.value,
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">카테고리</label>
                  <Input
                    placeholder="예: Design Tools"
                    value={newProduct.category}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, category: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">가격 (USD) *</label>
                  <Input
                    placeholder="99.99"
                    type="number"
                    step="0.01"
                    value={newProduct.price}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, price: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">라이선스 타입</label>
                  <Select
                    value={newProduct.licenseType}
                    onValueChange={(value: any) =>
                      setNewProduct({ ...newProduct, licenseType: value })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="perpetual">영구 라이선스</SelectItem>
                      <SelectItem value="subscription">구독 라이선스</SelectItem>
                      <SelectItem value="trial">체험판</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleAddProduct}
                  disabled={createProductMutation.isPending}
                  className="w-full bg-black text-white hover:bg-gray-900"
                >
                  {createProductMutation.isPending ? "추가 중..." : "제품 추가"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit Product Dialog */}
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>제품 정보 수정</DialogTitle>
                <DialogDescription>
                  제품의 정보를 수정해주세요.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">제품명 *</label>
                  <Input
                    placeholder="제품명"
                    value={editData.title}
                    onChange={(e) =>
                      setEditData({ ...editData, title: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">설명</label>
                  <Input
                    placeholder="제품 설명"
                    value={editData.description}
                    onChange={(e) =>
                      setEditData({ ...editData, description: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">카테고리</label>
                  <Input
                    placeholder="카테고리"
                    value={editData.category}
                    onChange={(e) =>
                      setEditData({ ...editData, category: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">가격 (USD) *</label>
                  <Input
                    placeholder="99.99"
                    type="number"
                    step="0.01"
                    value={editData.price}
                    onChange={(e) =>
                      setEditData({ ...editData, price: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveEdit}
                    disabled={updateProductMutation.isPending}
                    className="flex-1 bg-black text-white hover:bg-gray-900"
                  >
                    {updateProductMutation.isPending ? "저장 중..." : "저장"}
                  </Button>
                  <Button
                    onClick={() => setIsEditOpen(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    취소
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Statistics Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-white border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">총 수익</p>
                <p className="text-3xl font-bold text-black mt-2">
                  ${totalRevenue.toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-pink-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">총 판매량</p>
                <p className="text-3xl font-bold text-black mt-2">
                  {totalSales}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Download className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">활성 제품</p>
                <p className="text-3xl font-bold text-black mt-2">
                  {activeProducts}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">평균 판매가</p>
                <p className="text-3xl font-bold text-black mt-2">
                  ${totalSales > 0 ? (totalRevenue / totalSales).toFixed(2) : "0"}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6 bg-white border border-gray-200">
            <h3 className="text-lg font-bold mb-4">판매 추이</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#E91E8C"
                  name="판매량"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6 bg-white border border-gray-200">
            <h3 className="text-lg font-bold mb-4">수익 추이</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#E91E8C" name="수익 ($)" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Products Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">내 제품</h2>
          {sellerProducts.length === 0 ? (
            <Card className="p-12 bg-white border border-gray-200 text-center">
              <p className="text-gray-600 mb-4">아직 등록된 제품이 없습니다.</p>
              <Button
                onClick={() => setIsAddProductOpen(true)}
                className="bg-black text-white hover:bg-gray-900"
              >
                첫 제품 추가하기
              </Button>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sellerProducts.map((product: any) => (
                <Card
                  key={product.id}
                  className="p-6 bg-white border border-gray-200 hover:shadow-lg transition-shadow"
                >
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-black">
                      {product.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {product.category}
                    </p>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-2xl font-bold text-black">
                        ${product.price}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {product.licenseType === "perpetual"
                          ? "영구 라이선스"
                          : product.licenseType === "subscription"
                          ? "구독"
                          : "체험판"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">상태</p>
                      <p className="text-lg font-bold text-green-600">
                        {product.active ? "활성" : "비활성"}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleEditProduct(product)}
                      variant="outline"
                      size="sm"
                      className="flex-1 border-gray-300"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      수정
                    </Button>
                    <Button
                      onClick={() => handleDeleteProduct(product.id)}
                      variant="outline"
                      size="sm"
                      className="flex-1 border-gray-300 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      삭제
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div>
          <h2 className="text-2xl font-bold mb-4">최근 주문</h2>
          {sellerOrders.length === 0 ? (
            <Card className="p-12 bg-white border border-gray-200 text-center">
              <p className="text-gray-600">아직 주문이 없습니다.</p>
            </Card>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-bold text-black">
                      주문 ID
                    </th>
                    <th className="text-left py-3 px-4 font-bold text-black">
                      제품
                    </th>
                    <th className="text-left py-3 px-4 font-bold text-black">
                      금액
                    </th>
                    <th className="text-left py-3 px-4 font-bold text-black">
                      상태
                    </th>
                    <th className="text-left py-3 px-4 font-bold text-black">
                      날짜
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sellerOrders.slice(0, 10).map((order: any) => (
                    <tr
                      key={order.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 text-sm text-gray-600">
                        #{order.id}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        제품 {order.productId}
                      </td>
                      <td className="py-3 px-4 text-sm font-bold text-black">
                        ${order.totalPrice}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
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
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString("ko-KR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
