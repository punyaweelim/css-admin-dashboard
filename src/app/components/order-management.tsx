import { useState, useEffect, useMemo, useRef } from "react";
import { Package, Search, Filter, Eye, Edit, Trash2, Plus, X, Calendar, User, Store, Hash, CheckCircle2, Clock, XCircle, Loader2, ShoppingBag, Tag, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
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
  DialogFooter,
} from "@/app/components/ui/dialog";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Checkbox } from "@/app/components/ui/checkbox";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import { api } from "@/app/utils/api";
import { toast } from "sonner";

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
  customerId: string;
  customerName: string;
  lineId: string;
  lineAccount: string;
  storeId: string;
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
  defaultWithTax?: boolean;
}

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  tierPricing: any;
  storeId: string;
  imageUrl?: string;
  sku: string;
  category: string;
}

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

const ITEMS_PER_PAGE = 10;

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

  const currentStep = statusConfig[status]?.step || 1;

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

// ─────────────────────────────────────────────────────────────
// Sub-component: Order Form (Shared for Create/Edit)
// ─────────────────────────────────────────────────────────────
interface OrderFormProps {
  order?: Order;
  customers: Customer[];
  products: Product[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

function OrderForm({ order, customers, products, onSubmit, onCancel }: OrderFormProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<string>(order?.customerId || "");
  const [selectedAccount, setSelectedAccount] = useState<string>(order?.lineAccount || "");
  const [selectedProducts, setSelectedProducts] = useState<{productId: string, quantity: number}[]>(
    order?.items?.filter(i => (i.unitPrice || 0) > 0).map(i => ({ productId: i.productId, quantity: i.quantity })) || []
  );
  const [orderNotes, setOrderNotes] = useState(order?.notes || "");
  const [orderStatus, setOrderStatus] = useState<string>(order?.status || "pending");
  const [withTax, setWithTax] = useState<boolean>(false);

  useEffect(() => {
    if (selectedCustomer && orderStatus === "processing" && order?.status === "pending") {
      const customer = customers.find(c => c.id === selectedCustomer);
      if (customer) {
        setWithTax(!!customer.defaultWithTax);
      }
    }
  }, [selectedCustomer, orderStatus, customers, order?.status]);

  const selectedStoreProducts = useMemo(() => {
    if (!selectedAccount) return [];
    const storeId = selectedAccount === "Store 3A" ? "3a" : selectedAccount === "Store Tong 3" ? "tong3" : "4thit";
    return products.filter((p: any) => p.storeId === storeId);
  }, [selectedAccount, products]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !selectedAccount || selectedProducts.length === 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    const storeId = selectedAccount === "Store 3A" ? "3a" : selectedAccount === "Store Tong 3" ? "tong3" : "4thit";
    
    onSubmit({
      customerId: selectedCustomer,
      storeId: storeId,
      status: orderStatus,
      withTax: withTax,
      items: selectedProducts.filter(sp => sp.productId).map(sp => ({
        productId: sp.productId,
        quantity: sp.quantity
      })),
      notes: orderNotes
    });
  };

  const addProductRow = () => {
    setSelectedProducts([...selectedProducts, { productId: "", quantity: 1 }]);
  };

  const removeProductRow = (index: number) => {
    setSelectedProducts(selectedProducts.filter((_, i) => i !== index));
  };

  const updateProductRow = (index: number, productId: string, quantity: number) => {
    const updated = [...selectedProducts];
    updated[index] = { productId, quantity };
    setSelectedProducts(updated);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Customer *</Label>
          <Select value={selectedCustomer} onValueChange={setSelectedCustomer} disabled={!!order}>
            <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
            <SelectContent>
              {customers.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name} ({c.lineId})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Store Account *</Label>
          <Select value={selectedAccount} onValueChange={setSelectedAccount} disabled={!!order}>
            <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Store 3A">Store 3A</SelectItem>
              <SelectItem value="Store Tong 3">Store Tong 3</SelectItem>
              <SelectItem value="Store 4Thit">Store 4Thit</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {order && (
        <div className="space-y-4">
          <div>
            <Label>Order Status</Label>
            <Select value={orderStatus} onValueChange={setOrderStatus}>
              <SelectTrigger><SelectValue placeholder="Select Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {orderStatus === "processing" && order.status === "pending" && (
            <div className="flex items-center space-x-2 bg-blue-50 p-4 rounded-xl border border-blue-100">
              <Checkbox id="withTax" checked={withTax} onCheckedChange={(checked) => setWithTax(!!checked)} />
              <div className="grid gap-1.5 leading-none">
                <label htmlFor="withTax" className="text-sm font-bold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-blue-900">
                  Calculate VAT (7%) for this order
                </label>
                <p className="text-[10px] text-blue-600 font-medium italic">
                  * A billing invoice will be created once you click update.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <Label className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            Products *
          </Label>
          <Button type="button" variant="outline" size="sm" onClick={addProductRow} className="h-8">
            <Plus className="h-3 w-3 mr-1" /> Add Product
          </Button>
        </div>
        <div className="space-y-3">
          {selectedProducts.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-border rounded-2xl bg-gray-50/50">
              <ShoppingBag className="h-10 w-10 text-gray-200 mx-auto mb-2" />
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-widest">No products in this order</p>
            </div>
          ) : (
            selectedProducts.map((item, index) => {
              const currentProduct = selectedStoreProducts.find(p => p.id === item.productId);
              return (
                <div key={index} className="flex gap-3 items-center p-3 border border-border rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow">
                  {/* Product Selector with Image */}
                  <div className="flex-1 min-w-0">
                    <Select value={item.productId} onValueChange={(v) => updateProductRow(index, v, item.quantity)}>
                      <SelectTrigger className="h-14 py-1 px-3">
                        {currentProduct ? (
                          <div className="flex items-center gap-3 text-left">
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 border border-gray-100 shrink-0">
                              <ImageWithFallback src={currentProduct.imageUrl} alt={currentProduct.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-bold text-sm truncate">{currentProduct.name}</span>
                              <span className="text-[10px] text-muted-foreground font-mono">{currentProduct.sku} · ฿{currentProduct.tierPricing?.bronze?.toLocaleString()}</span>
                            </div>
                          </div>
                        ) : (
                          <SelectValue placeholder="Choose product..." />
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        {selectedStoreProducts.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            <div className="flex items-center gap-3 py-1">
                              <div className="w-8 h-8 rounded border border-gray-100 overflow-hidden shrink-0">
                                <ImageWithFallback src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="font-semibold text-xs truncate">{p.name}</span>
                                <span className="text-[9px] text-gray-400">฿{p.tierPricing?.bronze?.toLocaleString()}</span>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Quantity Input */}
                  <div className="w-24 shrink-0">
                    <Label className="text-[10px] uppercase font-bold text-gray-400 mb-1 block px-1">Qty</Label>
                    <Input
                      type="number"
                      min="1"
                      className="h-10 text-center font-bold"
                      value={item.quantity}
                      onChange={(e) => updateProductRow(index, item.productId, parseInt(e.target.value) || 1)}
                    />
                  </div>

                  {/* Row Delete */}
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeProductRow(index)} className="h-10 w-10 text-gray-300 hover:text-red-500 hover:bg-red-50 mt-5">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div>
        <Label className="flex items-center gap-2 mb-2">
          <Tag className="h-4 w-4" />
          Order Notes
        </Label>
        <Textarea
          placeholder="Shipping instructions, package details, etc..."
          value={orderNotes}
          onChange={(e) => setOrderNotes(e.target.value)}
          className="rounded-2xl border-gray-200"
          rows={3}
        />
      </div>

      <DialogFooter className="bg-gray-50 -mx-6 -mb-6 p-6 mt-6 border-t border-gray-100">
        <Button type="button" variant="outline" onClick={onCancel} className="rounded-xl">Cancel</Button>
        <Button type="submit" className="bg-black text-white hover:bg-gray-800 rounded-xl px-8 font-bold">
          {order ? "Update Order" : "Submit Order"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterAccount, setFilterAccount] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [ordersRes, customersRes, productsRes] = await Promise.all([
        api.get<any>("/orders?limit=1000"),
        api.get<any>("/customers?limit=1000"),
        api.get<any>("/products?limit=1000"),
      ]);
      setOrders(ordersRes.data || []);
      setCustomers(customersRes.data || []);
      setProducts(productsRes.data || []);
    } catch (err) {
      toast.error("Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.lineId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || order.status === filterStatus;
    const matchesAccount = filterAccount === "all" || order.lineAccount === filterAccount;
    return matchesSearch && matchesStatus && matchesAccount;
  });

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "pending": return "bg-amber-100 text-amber-800 border border-amber-200";
      case "processing": return "bg-blue-100 text-blue-800 border border-blue-200";
      case "completed": return "bg-green-100 text-green-800 border border-green-200";
      case "cancelled": return "bg-red-100 text-red-800 border border-red-200";
      default: return "bg-gray-200 text-black";
    }
  };

  const handleCreateOrder = async (data: any) => {
    try {
      await api.post("/orders", data);
      toast.success("Order created successfully (Pending review)");
      setIsCreateDialogOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to create order");
    }
  };

  const handleUpdateOrder = async (data: any) => {
    if (!editingOrder) return;
    try {
      await api.put(`/orders/${editingOrder.id}`, data);
      toast.success(data.status === "processing" ? "Order processing and Bill created" : "Order updated successfully");
      setEditingOrder(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to update order");
    }
  };

  const handleDeleteOrder = async () => {
    if (!deletingOrderId) return;
    try {
      await api.delete(`/orders/${deletingOrderId}`);
      toast.success("Order deleted and stock returned");
      setDeletingOrderId(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete order");
    }
  };

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    processing: orders.filter((o) => o.status === "processing").length,
    completed: orders.filter((o) => o.status === "completed").length,
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-sm border-gray-100"><CardHeader className="pb-2"><CardTitle className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Total Orders</CardTitle></CardHeader><CardContent><div className="text-3xl font-black">{stats.total}</div></CardContent></Card>
        <Card className="shadow-sm border-gray-100"><CardHeader className="pb-2"><CardTitle className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Pending</CardTitle></CardHeader><CardContent><div className="text-3xl font-black text-amber-600">{stats.pending}</div></CardContent></Card>
        <Card className="shadow-sm border-gray-100"><CardHeader className="pb-2"><CardTitle className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Processing</CardTitle></CardHeader><CardContent><div className="text-3xl font-black text-blue-600">{stats.processing}</div></CardContent></Card>
        <Card className="shadow-sm border-gray-100"><CardHeader className="pb-2"><CardTitle className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Completed</CardTitle></CardHeader><CardContent><div className="text-3xl font-black text-green-600">{stats.completed}</div></CardContent></Card>
      </div>

      {/* Orders Table */}
      <Card className="shadow-sm border-gray-100">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-black flex items-center gap-2">Order Management</CardTitle>
              <p className="text-sm text-muted-foreground mt-1 tracking-tight">Track, manage and edit bulk customer orders across all stores.</p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild><Button className="bg-black text-white hover:bg-gray-800 shadow-lg shadow-black/20 rounded-xl px-6"><Plus className="h-4 w-4 mr-2" />Create Order</Button></DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle className="text-xl font-bold">Create New Order</DialogTitle></DialogHeader>
                <OrderForm 
                  customers={customers} 
                  products={products} 
                  onCancel={() => setIsCreateDialogOpen(false)} 
                  onSubmit={handleCreateOrder} 
                />
              </DialogContent>
            </Dialog>
          </div>
          <div className="flex flex-col md:flex-row gap-4 mt-6">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search orders, customer, LINE ID..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="pl-10 h-12 bg-gray-50 border-gray-100 rounded-xl shadow-inner" /></div>
            <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v); setCurrentPage(1); }}><SelectTrigger className="w-full md:w-[180px] h-12 rounded-xl border-gray-100"><Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="Status" /></SelectTrigger><SelectContent className="bg-white text-black"><SelectItem value="all">All Status</SelectItem><SelectItem value="pending">Pending</SelectItem><SelectItem value="processing">Processing</SelectItem><SelectItem value="completed">Completed</SelectItem><SelectItem value="cancelled">Cancelled</SelectItem></SelectContent></Select>
          </div>
        </CardHeader>
        <CardContent className="p-0 border-t border-gray-50">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-black" />
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Fetching Orders...</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader className="bg-gray-50/50">
                  <TableRow>
                    <TableHead className="font-bold py-4">Order ID</TableHead>
                    <TableHead className="font-bold">Customer</TableHead>
                    <TableHead className="font-bold">Account</TableHead>
                    <TableHead className="font-bold">Products</TableHead>
                    <TableHead className="font-bold">Amount</TableHead>
                    <TableHead className="font-bold">Status</TableHead>
                    <TableHead className="font-bold">Date</TableHead>
                    <TableHead className="text-right font-bold pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedOrders.length === 0 ? (
                    <TableRow><TableCell colSpan={8} className="text-center py-24 text-gray-400 italic">No orders found</TableCell></TableRow>
                  ) : (
                    paginatedOrders.map((order) => (
                      <TableRow key={order.id} className="hover:bg-gray-50/50 transition-colors">
                        <TableCell className="font-mono font-bold text-black">{order.id}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-bold text-black">{order.customerName}</span>
                            <span className="text-[10px] text-gray-400 font-mono tracking-tighter uppercase">{order.lineId}</span>
                          </div>
                        </TableCell>
                        <TableCell><div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-green-500 rounded-full" /><span className="text-xs font-medium">{order.lineAccount}</span></div></TableCell>
                        <TableCell>
                          <div className="flex -space-x-2">
                            {order.items?.slice(0, 3).map((item, idx) => (
                              <div key={idx} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-gray-100 shrink-0"><ImageWithFallback src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" /></div>
                            ))}
                            {(order.items?.length || 0) > 3 && <div className="w-8 h-8 rounded-full border-2 border-white bg-black flex items-center justify-center text-[10px] font-bold text-white shrink-0">+{order.items.length - 3}</div>}
                          </div>
                        </TableCell>
                        <TableCell><span className="font-black text-black">฿{(order.totalAmount || 0).toLocaleString()}</span></TableCell>
                        <TableCell><Badge className={`${getStatusBadgeClass(order.status)} text-[9px] font-black uppercase py-0.5 px-2 h-5`} variant="secondary">{statusConfig[order.status]?.label}</Badge></TableCell>
                        <TableCell className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(order.orderDate).toLocaleDateString("th-TH", { day: '2-digit', month: 'short' })}</TableCell>
                        <TableCell className="text-right pr-6">
                          <div className="flex justify-end gap-1">
                            <Dialog>
                              <DialogTrigger asChild><Button variant="ghost" size="icon" className="h-9 w-9 text-gray-400 hover:text-black hover:bg-gray-100" onClick={() => setSelectedOrder(order)}><Eye className="h-4 w-4" /></Button></DialogTrigger>
                              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">{selectedOrder && (
                                <><div className="bg-black text-white px-6 pt-6 pb-5 rounded-t-lg shadow-xl shadow-black/10"><div className="flex items-start justify-between mb-4"><div><p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-60">Order Record</p><h2 className="text-2xl font-black font-mono">{selectedOrder.id}</h2></div><Badge className={`${getStatusBadgeClass(selectedOrder.status)} mt-1 border-0 h-6 px-3 font-black text-[10px] uppercase`} variant="secondary">{statusConfig[selectedOrder.status]?.label}</Badge></div><OrderStatusTimeline status={selectedOrder.status} /></div>
                                <div className="p-6 space-y-6"><div className="grid grid-cols-2 md:grid-cols-4 gap-4"><div className="bg-gray-50 rounded-2xl p-3 border border-gray-100"><div className="flex items-center gap-1.5 mb-1"><User className="h-3.5 w-3.5 text-gray-400" /><span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">ลูกค้า</span></div><p className="font-bold text-sm text-black truncate">{selectedOrder.customerName}</p></div><div className="bg-gray-50 rounded-2xl p-3 border border-gray-100"><div className="flex items-center gap-1.5 mb-1"><Hash className="h-3.5 w-3.5 text-gray-400" /><span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">LINE ID</span></div><p className="font-bold text-xs font-mono text-black">{selectedOrder.lineId}</p></div><div className="bg-gray-50 rounded-2xl p-3 border border-gray-100"><div className="flex items-center gap-1.5 mb-1"><Store className="h-3.5 w-3.5 text-gray-400" /><span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Store</span></div><p className="font-bold text-sm text-black truncate">{selectedOrder.lineAccount}</p></div><div className="bg-gray-50 rounded-2xl p-3 border border-gray-100"><div className="flex items-center gap-1.5 mb-1"><Calendar className="h-3.5 w-3.5 text-gray-400" /><span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">วันที่สั่ง</span></div><p className="font-bold text-sm text-black">{new Date(selectedOrder.orderDate).toLocaleDateString("th-TH")}</p></div></div>
                                <div><div className="flex items-center gap-2 mb-4"><ShoppingBag className="h-4 w-4 text-black" /><h3 className="font-black text-sm uppercase tracking-wider">รายการสินค้า ({selectedOrder.items?.length || 0})</h3></div><div className="space-y-3">{selectedOrder.items?.map((item, idx) => (<div key={idx} className="flex gap-4 items-center p-4 border border-gray-100 rounded-2xl bg-white hover:border-black/10 transition-colors shadow-sm"><div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 shrink-0 border border-gray-100"><ImageWithFallback src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" /></div><div className="flex-1 min-w-0"><p className="font-bold text-sm truncate text-black">{item.productName}</p><div className="flex items-center gap-2 mt-1"><span className="text-[10px] text-gray-400 font-mono tracking-tighter uppercase">{item.sku}</span><Badge variant="outline" className="text-[8px] font-black uppercase px-1.5 py-0 rounded-sm">{item.category}</Badge></div><p className="text-[10px] font-bold text-gray-500 mt-1">฿{(item.unitPrice || 0).toLocaleString()} × {(item.quantity || 0).toLocaleString()} ชิ้น</p></div><div className="text-right shrink-0"><p className="font-black text-sm text-black">฿{(item.subtotal || 0).toLocaleString()}</p><p className="text-[9px] uppercase font-bold text-gray-300">Total</p></div></div>))}</div></div>
                                <div className="bg-black rounded-2xl p-5 flex justify-between items-center text-white shadow-lg"><div className="flex flex-col"><span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-1">Total Quantity</span><span className="text-lg font-black">{(selectedOrder.quantity || 0).toLocaleString()} <span className="text-xs font-medium text-gray-400 uppercase tracking-widest ml-1">Items</span></span></div><div className="text-right flex flex-col"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-1">Net Total</p><p className="text-3xl font-black tracking-tighter">฿{(selectedOrder.totalAmount || 0).toLocaleString()}</p></div></div>
                                {selectedOrder.notes && <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3 items-start"><p className="text-lg shrink-0 mt-0.5">📝</p><div><p className="text-[10px] uppercase font-black text-amber-700 tracking-wider mb-1">Customer Notes</p><p className="text-sm text-amber-900 leading-relaxed font-medium">{selectedOrder.notes}</p></div></div>}</div></>
                              )}</DialogContent>
                            </Dialog>

                            {/* EDIT ORDER */}
                            <Dialog open={editingOrder?.id === order.id} onOpenChange={(open) => { if (!open) setEditingOrder(null); }}>
                              <DialogTrigger asChild><Button variant="ghost" size="icon" className="h-9 w-9 text-gray-400 hover:text-black hover:bg-gray-100" onClick={() => setEditingOrder(order)}><Edit className="h-4 w-4" /></Button></DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader><DialogTitle className="text-xl font-bold">Edit Order: {order.id}</DialogTitle></DialogHeader>
                                {editingOrder && (
                                  <OrderForm 
                                    order={editingOrder}
                                    customers={customers} 
                                    products={products} 
                                    onCancel={() => setEditingOrder(null)} 
                                    onSubmit={handleUpdateOrder} 
                                  />
                                )}
                              </DialogContent>
                            </Dialog>

                            {/* DELETE ORDER */}
                            <Dialog open={deletingOrderId === order.id} onOpenChange={(open) => { if (!open) setDeletingOrderId(null); }}>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => setDeletingOrderId(order.id)} disabled={order.status !== "pending"} className="h-9 w-9 text-gray-400 hover:text-red-600 hover:bg-red-50">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-sm">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2 text-red-600 font-black uppercase text-base">
                                    <AlertTriangle className="h-5 w-5" /> Confirm Delete
                                  </DialogTitle>
                                </DialogHeader>
                                <div className="py-6 text-sm text-gray-600 leading-relaxed">
                                  คุณแน่ใจหรือไม่ว่าต้องการลบคำสั่งซื้อ <span className="font-black text-black">{order.id}</span>? 
                                  <p className="mt-3 text-xs italic text-gray-400 bg-gray-50 p-3 rounded-lg border border-gray-100">* ระบบจะทำการคืนสต็อกสินค้าให้ร้านค้าโดยอัตโนมัติ</p>
                                </div>
                                <DialogFooter className="gap-2 pt-2 border-t border-gray-50">
                                  <Button type="button" variant="outline" onClick={() => setDeletingOrderId(null)} className="rounded-xl flex-1">Cancel</Button>
                                  <Button type="button" className="bg-red-600 text-white hover:bg-red-700 border-0 rounded-xl flex-1 font-bold" onClick={handleDeleteOrder}>Delete Order</Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* Pagination UI */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-50">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredOrders.length)} of {filteredOrders.length}
                  </p>
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 w-8 p-0 rounded-lg border-gray-100"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                      const isVisible = page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
                      if (!isVisible && Math.abs(page - currentPage) === 2) return <span key={page} className="px-1 text-gray-300">...</span>;
                      if (!isVisible) return null;
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          className={`h-8 w-8 p-0 rounded-lg text-xs font-bold transition-all ${
                            currentPage === page ? "bg-black text-white" : "border-gray-100 text-gray-400 hover:text-black"
                          }`}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      );
                    })}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 w-8 p-0 rounded-lg border-gray-100"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
