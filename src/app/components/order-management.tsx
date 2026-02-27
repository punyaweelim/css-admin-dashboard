import { useState } from "react";
import { Package, Search, Filter, Eye, Edit, Trash2, Plus, X } from "lucide-react";
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

interface Order {
  id: string;
  customerName: string;
  lineId: string;
  lineAccount: string;
  products: string[];
  quantity: number;
  totalAmount: number;
  status: "pending" | "processing" | "completed" | "cancelled";
  orderDate: string;
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
    quantity: 150,
    totalAmount: 45000,
    status: "pending",
    orderDate: "2026-01-20",
  },
  {
    id: "ORD-002",
    customerName: "สมหญิง รักสวย",
    lineId: "LINE-789012",
    lineAccount: "Store Account 2",
    products: ["Product C"],
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
    quantity: 100,
    totalAmount: 35000,
    status: "completed",
    orderDate: "2026-01-18",
  },
  {
    id: "ORD-004",
    customerName: "นภา สุขใจ",
    lineId: "LINE-901234",
    lineAccount: "Store Account 1",
    products: ["Product B", "Product C", "Product D"],
    quantity: 300,
    totalAmount: 120000,
    status: "processing",
    orderDate: "2026-01-17",
  },
  {
    id: "ORD-005",
    customerName: "ธนา มั่งมี",
    lineId: "LINE-567890",
    lineAccount: "Store Account 2",
    products: ["Product A"],
    quantity: 50,
    totalAmount: 15000,
    status: "cancelled",
    orderDate: "2026-01-16",
  },
];

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-gray-200 text-black";
      case "processing":
        return "bg-gray-400 text-white";
      case "completed":
        return "bg-black text-white";
      case "cancelled":
        return "bg-white text-black border border-black";
      default:
        return "bg-gray-200 text-black";
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

    const productNames = selectedProducts.map(sp => {
      const product = mockProducts.find(p => p.id === sp.productId);
      return product?.name || "";
    }).filter(Boolean);

    const totalQuantity = selectedProducts.reduce((sum, sp) => sum + sp.quantity, 0);
    const totalAmount = selectedProducts.reduce((sum, sp) => {
      const product = mockProducts.find(p => p.id === sp.productId);
      return sum + (product?.price || 0) * sp.quantity;
    }, 0);

    const newOrder: Order = {
      id: `ORD-${String(orders.length + 1).padStart(3, "0")}`,
      customerName: customer.name,
      lineId: customer.lineId,
      lineAccount: selectedAccount,
      products: productNames,
      quantity: totalQuantity,
      totalAmount: totalAmount,
      status: "pending",
      orderDate: new Date().toISOString().split("T")[0],
    };

    setOrders([newOrder, ...orders]);
    
    // Reset form
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
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Processing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.processing}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
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
                  {/* Customer Selection */}
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

                  {/* Products Selection */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Label>Products *</Label>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={addProduct}
                      >
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
                                <Select
                                  value={item.productId}
                                  onValueChange={(value) => updateProduct(index, value, item.quantity)}
                                >
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
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeProduct(index)}
                              className="mt-6"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Order Notes */}
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

                  {/* Total */}
                  {selectedProducts.length > 0 && (
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold">Total Amount:</span>
                        <span className="text-2xl font-bold">฿{calculateTotal().toLocaleString()}</span>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-end gap-3 border-t pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsCreateDialogOpen(false);
                        setSelectedCustomer("");
                        setSelectedAccount("");
                        setSelectedProducts([]);
                        setOrderNotes("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      className="bg-black text-white hover:bg-gray-800"
                      onClick={handleCreateOrder}
                    >
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
                <TableHead>Quantity</TableHead>
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
                  <TableCell>{order.quantity}</TableCell>
                  <TableCell>฿{order.totalAmount.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(order.status)} variant="secondary">
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{order.orderDate}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Order Details: {selectedOrder?.id}</DialogTitle>
                          </DialogHeader>
                          {selectedOrder && (
                            <div className="space-y-6">
                              <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-4">
                                  <div>
                                    <p className="text-sm text-muted-foreground">Customer</p>
                                    <p className="font-medium text-lg">{selectedOrder.customerName}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">LINE ID</p>
                                    <p className="font-mono text-sm">{selectedOrder.lineId}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Account</p>
                                    <p className="font-medium">{selectedOrder.lineAccount}</p>
                                  </div>
                                </div>
                                <div className="space-y-4">
                                  <div>
                                    <p className="text-sm text-muted-foreground">Status</p>
                                    <Badge className={getStatusColor(selectedOrder.status)}>
                                      {selectedOrder.status}
                                    </Badge>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Quantity</p>
                                    <p className="font-medium text-lg">{selectedOrder.quantity} units</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Total Amount</p>
                                    <p className="font-medium text-lg">
                                      ฿{selectedOrder.totalAmount.toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="border-t pt-4">
                                <p className="text-sm text-muted-foreground mb-3">Products</p>
                                <div className="bg-gray-50 rounded-lg p-4">
                                  <ul className="space-y-2">
                                    {selectedOrder.products.map((product, idx) => (
                                      <li key={idx} className="flex items-center gap-2">
                                        <span className="w-2 h-2 bg-black rounded-full"></span>
                                        <span className="font-medium">{product}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>

                              <div className="border-t pt-4">
                                <p className="text-sm text-muted-foreground mb-2">Order Date</p>
                                <p className="font-medium">
                                  {new Date(selectedOrder.orderDate).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </p>
                              </div>
                            </div>
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
