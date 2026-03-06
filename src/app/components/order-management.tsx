import { useState } from "react";
import { Package, Search, Filter, Eye, Edit, Trash2, Plus, X, Calendar, User, Store, Hash, CheckCircle2, Clock, XCircle, Loader2, ShoppingBag, Tag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Separator } from "@/app/components/ui/separator";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";

interface OrderItem {
  productId: string;
  productName: string;
  sku: string;
  category: string;
  imageUrl: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface Order {
  id: string;
  customerName: string;
  lineId: string;
  lineAccount: string;
  products: string[];
  items: OrderItem[];
  quantity: number;
  totalAmount: number;
  status: "pending" | "processing" | "completed" | "cancelled";
  orderDate: string;
  notes?: string;
}

interface Customer {
  id: string;
  name: string;
  lineId: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

const mockCustomers: Customer[] = [
  { id: "CUST-001", name: "สมชาย ใจดี", lineId: "LINE-123456" },
  { id: "CUST-002", name: "สมหญิง รักสวย", lineId: "LINE-789012" },
  { id: "CUST-003", name: "วิชัย ประเสริฐ", lineId: "LINE-345678" },
  { id: "CUST-004", name: "นภา สุขใจ", lineId: "LINE-901234" },
];

const mockProducts: Product[] = [
  { id: "PROD-001", name: "Product A", price: 300, stock: 500 },
  { id: "PROD-002", name: "Product B", price: 150, stock: 200 },
  { id: "PROD-003", name: "Product C", price: 400, stock: 50 },
  { id: "PROD-004", name: "Product D", price: 250, stock: 100 },
];

const mockOrders: Order[] = [
  {
    id: "ORD-001",
    customerName: "สมชาย ใจดี",
    lineId: "LINE-123456",
    lineAccount: "Store Account 1",
    products: ["Product A", "Product B"],
    items: [
      {
        productId: "PROD-001",
        productName: "Product A - Premium Electronics",
        sku: "SKU-A001",
        category: "Electronics",
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
        quantity: 100,
        unitPrice: 300,
        subtotal: 30000,
      },
      {
        productId: "PROD-002",
        productName: "Product B - Home & Garden",
        sku: "SKU-B002",
        category: "Home & Garden",
        imageUrl: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400",
        quantity: 50,
        unitPrice: 150,
        subtotal: 7500,
      },
    ],
    quantity: 150,
    totalAmount: 37500,
    status: "pending",
    orderDate: "2026-01-20",
    notes: "กรุณาจัดส่งในเวลาราชการ",
  },
  {
    id: "ORD-002",
    customerName: "สมหญิง รักสวย",
    lineId: "LINE-789012",
    lineAccount: "Store Account 2",
    products: ["Product C"],
    items: [
      {
        productId: "PROD-003",
        productName: "Product C - Fashion Accessories",
        sku: "SKU-C003",
        category: "Fashion",
        imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
        quantity: 200,
        unitPrice: 400,
        subtotal: 80000,
      },
    ],
    quantity: 200,
    totalAmount: 80000,
    status: "processing",
    orderDate: "2026-01-19",
  },
  {
    id: "ORD-003",
    customerName: "วิชัย ประเสริฐ",
    lineId: "LINE-345678",
    lineAccount: "Store Account 3",
    products: ["Product A", "Product D"],
    items: [
      {
        productId: "PROD-001",
        productName: "Product A - Premium Electronics",
        sku: "SKU-A001",
        category: "Electronics",
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
        quantity: 50,
        unitPrice: 300,
        subtotal: 15000,
      },
      {
        productId: "PROD-004",
        productName: "Product D - Beauty Products",
        sku: "SKU-D004",
        category: "Beauty",
        imageUrl: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=400",
        quantity: 50,
        unitPrice: 250,
        subtotal: 12500,
      },
    ],
    quantity: 100,
    totalAmount: 27500,
    status: "completed",
    orderDate: "2026-01-18",
  },
  {
    id: "ORD-004",
    customerName: "นภา สุขใจ",
    lineId: "LINE-901234",
    lineAccount: "Store Account 1",
    products: ["Product B", "Product C", "Product D"],
    items: [
      {
        productId: "PROD-002",
        productName: "Product B - Home & Garden",
        sku: "SKU-B002",
        category: "Home & Garden",
        imageUrl: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400",
        quantity: 100,
        unitPrice: 150,
        subtotal: 15000,
      },
      {
        productId: "PROD-003",
        productName: "Product C - Fashion Accessories",
        sku: "SKU-C003",
        category: "Fashion",
        imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
        quantity: 100,
        unitPrice: 400,
        subtotal: 40000,
      },
      {
        productId: "PROD-004",
        productName: "Product D - Beauty Products",
        sku: "SKU-D004",
        category: "Beauty",
        imageUrl: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=400",
        quantity: 100,
        unitPrice: 250,
        subtotal: 25000,
      },
    ],
    quantity: 300,
    totalAmount: 80000,
    status: "processing",
    orderDate: "2026-01-17",
    notes: "แพ็คแยกตามประเภทสินค้า",
  },
  {
    id: "ORD-005",
    customerName: "ธนา มั่งมี",
    lineId: "LINE-567890",
    lineAccount: "Store Account 2",
    products: ["Product A"],
    items: [
      {
        productId: "PROD-001",
        productName: "Product A - Premium Electronics",
        sku: "SKU-A001",
        category: "Electronics",
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
        quantity: 50,
        unitPrice: 300,
        subtotal: 15000,
      },
    ],
    quantity: 50,
    totalAmount: 15000,
    status: "cancelled",
    orderDate: "2026-01-16",
  },
];

const statusConfig = {
  pending: {
    label: "Pending",
    color: "bg-amber-100 text-amber-800 border-amber-200",
    icon: Clock,
    step: 1,
  },
  processing: {
    label: "Processing",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: Loader2,
    step: 2,
  },
  completed: {
    label: "Completed",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle2,
    step: 3,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: XCircle,
    step: -1,
  },
};

function OrderStatusTimeline({ status }: { status: Order["status"] }) {
  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
        <XCircle className="h-5 w-5 text-red-500 shrink-0" />
        <span className="text-sm font-medium text-red-700">คำสั่งซื้อถูกยกเลิก</span>
      </div>
    );
  }

  const steps = [
    { key: "pending", label: "รอดำเนินการ", icon: Clock },
    { key: "processing", label: "กำลังดำเนินการ", icon: Loader2 },
    { key: "completed", label: "เสร็จสิ้น", icon: CheckCircle2 },
  ];

  const currentStep = statusConfig[status].step;

  return (
    <div className="flex items-center gap-0">
      {steps.map((step, idx) => {
        const isCompleted = currentStep > idx + 1;
        const isCurrent = currentStep === idx + 1;
        const Icon = step.icon;
        return (
          <div key={step.key} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1 flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                  isCompleted
                    ? "bg-black border-black text-white"
                    : isCurrent
                    ? "bg-white border-black text-black"
                    : "bg-gray-100 border-gray-300 text-gray-400"
                }`}
              >
                <Icon className={`h-4 w-4 ${isCurrent && step.key === "processing" ? "animate-spin" : ""}`} />
              </div>
              <span className={`text-xs font-medium text-center leading-tight ${isCurrent ? "text-black" : isCompleted ? "text-gray-600" : "text-gray-400"}`}>
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`h-0.5 flex-1 mb-5 mx-1 transition-all ${isCompleted ? "bg-black" : "bg-gray-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterAccount, setFilterAccount] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Create Order Form States
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [selectedProducts, setSelectedProducts] = useState<{productId: string, quantity: number}[]>([]);
  const [orderNotes, setOrderNotes] = useState("");

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.lineId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || order.status === filterStatus;
    const matchesAccount = filterAccount === "all" || order.lineAccount === filterAccount;
    return matchesSearch && matchesStatus && matchesAccount;
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "pending": return "bg-amber-100 text-amber-800 border border-amber-200";
      case "processing": return "bg-blue-100 text-blue-800 border border-blue-200";
      case "completed": return "bg-green-100 text-green-800 border border-green-200";
      case "cancelled": return "bg-red-100 text-red-800 border border-red-200";
      default: return "bg-gray-200 text-black";
    }
  };

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    processing: orders.filter((o) => o.status === "processing").length,
    completed: orders.filter((o) => o.status === "completed").length,
  };

  const handleCreateOrder = () => {
    if (!selectedCustomer || !selectedAccount || selectedProducts.length === 0) {
      alert("Please fill in all required fields");
      return;
    }

    const customer = mockCustomers.find(c => c.id === selectedCustomer);
    if (!customer) return;

    const items: OrderItem[] = selectedProducts
      .filter(sp => sp.productId)
      .map(sp => {
        const product = mockProducts.find(p => p.id === sp.productId);
        return {
          productId: sp.productId,
          productName: product?.name || "",
          sku: `SKU-${sp.productId}`,
          category: "General",
          imageUrl: "",
          quantity: sp.quantity,
          unitPrice: product?.price || 0,
          subtotal: (product?.price || 0) * sp.quantity,
        };
      });

    const productNames = items.map(i => i.productName).filter(Boolean);
    const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);
    const totalAmount = items.reduce((sum, i) => sum + i.subtotal, 0);

    const newOrder: Order = {
      id: `ORD-${String(orders.length + 1).padStart(3, "0")}`,
      customerName: customer.name,
      lineId: customer.lineId,
      lineAccount: selectedAccount,
      products: productNames,
      items,
      quantity: totalQuantity,
      totalAmount,
      status: "pending",
      orderDate: new Date().toISOString().split("T")[0],
      notes: orderNotes || undefined,
    };

    setOrders([newOrder, ...orders]);
    setSelectedCustomer("");
    setSelectedAccount("");
    setSelectedProducts([]);
    setOrderNotes("");
    setIsCreateDialogOpen(false);
  };

  const addProduct = () => {
    setSelectedProducts([...selectedProducts, { productId: "", quantity: 1 }]);
  };

  const removeProduct = (index: number) => {
    setSelectedProducts(selectedProducts.filter((_, i) => i !== index));
  };

  const updateProduct = (index: number, productId: string, quantity: number) => {
    const updated = [...selectedProducts];
    updated[index] = { productId, quantity };
    setSelectedProducts(updated);
  };

  const calculateTotal = () => {
    return selectedProducts.reduce((sum, sp) => {
      const product = mockProducts.find(p => p.id === sp.productId);
      return sum + (product?.price || 0) * sp.quantity;
    }, 0);
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Processing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.processing}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Management
            </CardTitle>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-black text-white hover:bg-gray-800">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Order
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Order</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="customer">Customer *</Label>
                      <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockCustomers.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id}>
                              {customer.name} ({customer.lineId})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="account">Store Account *</Label>
                      <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select account" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Store Account 1">Store Account 1</SelectItem>
                          <SelectItem value="Store Account 2">Store Account 2</SelectItem>
                          <SelectItem value="Store Account 3">Store Account 3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Label>Products *</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addProduct}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Product
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {selectedProducts.length === 0 ? (
                        <div className="text-center py-8 border border-dashed border-border rounded-lg">
                          <p className="text-muted-foreground text-sm">No products added yet. Click "Add Product" to begin.</p>
                        </div>
                      ) : (
                        selectedProducts.map((item, index) => (
                          <div key={index} className="flex gap-3 items-start p-4 border border-border rounded-lg">
                            <div className="flex-1 grid grid-cols-2 gap-3">
                              <div>
                                <Label className="text-xs">Product</Label>
                                <Select value={item.productId} onValueChange={(value) => updateProduct(index, value, item.quantity)}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select product" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {mockProducts.map((product) => (
                                      <SelectItem key={product.id} value={product.id}>
                                        {product.name} - ฿{product.price} (Stock: {product.stock})
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label className="text-xs">Quantity</Label>
                                <Input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) => updateProduct(index, item.productId, parseInt(e.target.value) || 1)}
                                />
                              </div>
                            </div>
                            {item.productId && (
                              <div className="text-right pt-6">
                                <p className="text-sm font-semibold">
                                  ฿{((mockProducts.find(p => p.id === item.productId)?.price || 0) * item.quantity).toLocaleString()}
                                </p>
                              </div>
                            )}
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeProduct(index)} className="mt-6">
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">Order Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Add any special instructions or notes..."
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      rows={3}
                    />
                  </div>

                  {selectedProducts.length > 0 && (
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold">Total Amount:</span>
                        <span className="text-2xl font-bold">฿{calculateTotal().toLocaleString()}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 border-t pt-4">
                    <Button type="button" variant="outline" onClick={() => { setIsCreateDialogOpen(false); setSelectedCustomer(""); setSelectedAccount(""); setSelectedProducts([]); setOrderNotes(""); }}>
                      Cancel
                    </Button>
                    <Button type="button" className="bg-black text-white hover:bg-gray-800" onClick={handleCreateOrder}>
                      Create Order
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders, customer, LINE ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterAccount} onValueChange={setFilterAccount}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Account" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Accounts</SelectItem>
                <SelectItem value="Store Account 1">Store Account 1</SelectItem>
                <SelectItem value="Store Account 2">Store Account 2</SelectItem>
                <SelectItem value="Store Account 3">Store Account 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>LINE ID</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Total Qty</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono">{order.id}</TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell className="font-mono text-sm">{order.lineId}</TableCell>
                  <TableCell>{order.lineAccount}</TableCell>
                  <TableCell>
                    <div className="flex -space-x-2">
                      {order.items.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-gray-100 shrink-0">
                          <ImageWithFallback src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600 shrink-0">
                          +{order.items.length - 3}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{order.items.length} ประเภท</p>
                  </TableCell>
                  <TableCell>{order.quantity.toLocaleString()} ชิ้น</TableCell>
                  <TableCell className="font-semibold">฿{order.totalAmount.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className={`${getStatusBadgeClass(order.status)} text-xs`} variant="secondary">
                      {statusConfig[order.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(order.orderDate).toLocaleDateString("th-TH")}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {/* ORDER DETAILS MODAL */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(order)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
                          {selectedOrder && (
                            <>
                              {/* Header Banner */}
                              <div className="bg-black text-white px-6 pt-6 pb-5 rounded-t-lg">
                                <div className="flex items-start justify-between mb-4">
                                  <div>
                                    <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Order Details</p>
                                    <h2 className="text-2xl font-bold font-mono">{selectedOrder.id}</h2>
                                  </div>
                                  <Badge className={`${getStatusBadgeClass(selectedOrder.status)} mt-1`} variant="secondary">
                                    {statusConfig[selectedOrder.status].label}
                                  </Badge>
                                </div>

                                {/* Status Timeline */}
                                <OrderStatusTimeline status={selectedOrder.status} />
                              </div>

                              <div className="p-6 space-y-6">
                                {/* Order Info Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  <div className="bg-gray-50 rounded-lg p-3">
                                    <div className="flex items-center gap-1.5 mb-1">
                                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                                      <span className="text-xs text-muted-foreground">ลูกค้า</span>
                                    </div>
                                    <p className="font-semibold text-sm">{selectedOrder.customerName}</p>
                                  </div>
                                  <div className="bg-gray-50 rounded-lg p-3">
                                    <div className="flex items-center gap-1.5 mb-1">
                                      <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                                      <span className="text-xs text-muted-foreground">LINE ID</span>
                                    </div>
                                    <p className="font-semibold text-sm font-mono">{selectedOrder.lineId}</p>
                                  </div>
                                  <div className="bg-gray-50 rounded-lg p-3">
                                    <div className="flex items-center gap-1.5 mb-1">
                                      <Store className="h-3.5 w-3.5 text-muted-foreground" />
                                      <span className="text-xs text-muted-foreground">Store</span>
                                    </div>
                                    <p className="font-semibold text-sm">{selectedOrder.lineAccount}</p>
                                  </div>
                                  <div className="bg-gray-50 rounded-lg p-3">
                                    <div className="flex items-center gap-1.5 mb-1">
                                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                      <span className="text-xs text-muted-foreground">วันที่สั่ง</span>
                                    </div>
                                    <p className="font-semibold text-sm">
                                      {new Date(selectedOrder.orderDate).toLocaleDateString("th-TH", {
                                        day: "numeric", month: "short", year: "numeric"
                                      })}
                                    </p>
                                  </div>
                                </div>

                                {/* Products Section */}
                                <div>
                                  <div className="flex items-center gap-2 mb-3">
                                    <ShoppingBag className="h-4 w-4" />
                                    <h3 className="font-semibold">รายการสินค้า ({selectedOrder.items.length} ประเภท)</h3>
                                  </div>

                                  <div className="space-y-3">
                                    {selectedOrder.items.map((item, idx) => (
                                      <div
                                        key={idx}
                                        className="flex gap-4 items-center p-4 border border-border rounded-xl hover:bg-gray-50 transition-colors"
                                      >
                                        {/* Product Image */}
                                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                                          <ImageWithFallback
                                            src={item.imageUrl}
                                            alt={item.productName}
                                            className="w-full h-full object-cover"
                                          />
                                        </div>

                                        {/* Product Info */}
                                        <div className="flex-1 min-w-0">
                                          <p className="font-semibold text-sm truncate">{item.productName}</p>
                                          <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-muted-foreground font-mono">{item.sku}</span>
                                            <span className="text-muted-foreground">·</span>
                                            <Badge variant="outline" className="text-xs px-1.5 py-0">
                                              <Tag className="h-2.5 w-2.5 mr-1" />
                                              {item.category}
                                            </Badge>
                                          </div>
                                          <p className="text-xs text-muted-foreground mt-1">
                                            ฿{item.unitPrice.toLocaleString()} × {item.quantity.toLocaleString()} ชิ้น
                                          </p>
                                        </div>

                                        {/* Quantity Badge */}
                                        <div className="text-center shrink-0">
                                          <div className="bg-black text-white rounded-lg px-3 py-1.5 min-w-[60px]">
                                            <p className="text-lg font-bold leading-none">{item.quantity.toLocaleString()}</p>
                                            <p className="text-[10px] text-gray-300 mt-0.5">ชิ้น</p>
                                          </div>
                                        </div>

                                        {/* Subtotal */}
                                        <div className="text-right shrink-0">
                                          <p className="font-bold text-sm">฿{item.subtotal.toLocaleString()}</p>
                                          <p className="text-xs text-muted-foreground">ยอดรวม</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Summary */}
                                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                                  <h3 className="font-semibold text-sm">สรุปคำสั่งซื้อ</h3>
                                  <div className="space-y-2">
                                    {selectedOrder.items.map((item, idx) => (
                                      <div key={idx} className="flex justify-between text-sm">
                                        <span className="text-muted-foreground truncate max-w-[60%]">{item.productName}</span>
                                        <span>฿{item.subtotal.toLocaleString()}</span>
                                      </div>
                                    ))}
                                  </div>
                                  <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                                    <div>
                                      <span className="text-sm text-muted-foreground">รวมทั้งหมด </span>
                                      <span className="text-sm font-medium">{selectedOrder.quantity.toLocaleString()} ชิ้น</span>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-xs text-muted-foreground">ยอดสุทธิ</p>
                                      <p className="text-2xl font-bold">฿{selectedOrder.totalAmount.toLocaleString()}</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Notes */}
                                {selectedOrder.notes && (
                                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                                    <p className="text-xs font-semibold text-amber-700 mb-1">📝 หมายเหตุ</p>
                                    <p className="text-sm text-amber-800">{selectedOrder.notes}</p>
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </DialogContent>
                      </Dialog>

                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
