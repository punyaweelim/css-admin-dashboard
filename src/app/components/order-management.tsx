import { useState } from "react";
import { Package, Search, Filter, Eye, Edit, Trash2, Plus, ShoppingCart, X, Calendar, CreditCard, User } from "lucide-react";
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
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";

type CustomerTier = "bronze" | "silver" | "gold" | "platinum";

interface TierPricing {
  bronze: number;
  silver: number;
  gold: number;
  platinum: number;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  tierPricing: TierPricing;
  stock: number;
  minOrder: number;
  description: string;
  imageUrl?: string;
  status: "available" | "low stock" | "out of stock";
}

interface OrderItem {
  productId: string;
  productName: string;
  sku: string;
  imageUrl?: string;
  quantity: number;
  unitPrice: number;
  originalPrice: number;
  discount: number;
  subtotal: number;
}

interface Order {
  id: string;
  customerName: string;
  customerId: string;
  customerTier: CustomerTier;
  lineId: string;
  lineAccount: string;
  items: OrderItem[];
  totalQuantity: number;
  subtotal: number;
  totalDiscount: number;
  tax: number;
  totalAmount: number;
  status: "pending" | "processing" | "completed" | "cancelled";
  orderDate: string;
  paymentMethod?: string;
  shippingAddress?: string;
  notes?: string;
}

interface Customer {
  id: string;
  name: string;
  lineId: string;
  lineAccount: string;
  tier: CustomerTier;
  phone: string;
  email: string;
}

const tierInfo: Record<CustomerTier, { emoji: string; name: string }> = {
  bronze: { emoji: "🥉", name: "Bronze" },
  silver: { emoji: "🥈", name: "Silver" },
  gold: { emoji: "🥇", name: "Gold" },
  platinum: { emoji: "💎", name: "Platinum" },
};

const mockProducts: Product[] = [
  {
    id: "PROD-001",
    name: "Product A - Premium Electronics",
    sku: "SKU-A001",
    category: "Electronics",
    tierPricing: {
      bronze: 300,
      silver: 280,
      gold: 260,
      platinum: 240,
    },
    stock: 500,
    minOrder: 50,
    description: "High-quality electronic product suitable for bulk orders",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
    status: "available",
  },
  {
    id: "PROD-002",
    name: "Product B - Home & Garden",
    sku: "SKU-B002",
    category: "Home & Garden",
    tierPricing: {
      bronze: 150,
      silver: 140,
      gold: 130,
      platinum: 120,
    },
    stock: 200,
    minOrder: 100,
    description: "Popular home and garden item with excellent reviews",
    imageUrl: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400",
    status: "available",
  },
  {
    id: "PROD-003",
    name: "Product C - Fashion Accessories",
    sku: "SKU-C003",
    category: "Fashion",
    tierPricing: {
      bronze: 400,
      silver: 375,
      gold: 350,
      platinum: 325,
    },
    stock: 50,
    minOrder: 25,
    description: "Trendy fashion product perfect for resellers",
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
    status: "low stock",
  },
  {
    id: "PROD-004",
    name: "Product D - Beauty Care",
    sku: "SKU-D004",
    category: "Beauty",
    tierPricing: {
      bronze: 250,
      silver: 235,
      gold: 220,
      platinum: 205,
    },
    stock: 300,
    minOrder: 50,
    description: "Premium beauty product",
    imageUrl: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=400",
    status: "available",
  },
  {
    id: "PROD-005",
    name: "Product E - Smart Gadgets",
    sku: "SKU-E005",
    category: "Electronics",
    tierPricing: {
      bronze: 500,
      silver: 470,
      gold: 440,
      platinum: 410,
    },
    stock: 1000,
    minOrder: 30,
    description: "Best-selling electronic gadget with warranty",
    imageUrl: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400",
    status: "available",
  },
];

const mockCustomers: Customer[] = [
  {
    id: "CUST-001",
    name: "สมชาย ใจดี",
    lineId: "LINE-123456",
    lineAccount: "Store Account 1",
    tier: "gold",
    phone: "081-234-5678",
    email: "somchai@example.com",
  },
  {
    id: "CUST-002",
    name: "สมหญิง รักสวย",
    lineId: "LINE-789012",
    lineAccount: "Store Account 2",
    tier: "platinum",
    phone: "082-345-6789",
    email: "somying@example.com",
  },
  {
    id: "CUST-003",
    name: "วิชัย ประเสริฐ",
    lineId: "LINE-345678",
    lineAccount: "Store Account 3",
    tier: "silver",
    phone: "083-456-7890",
    email: "wichai@example.com",
  },
  {
    id: "CUST-004",
    name: "อรุณี สวัสดี",
    lineId: "LINE-901234",
    lineAccount: "Store Account 1",
    tier: "bronze",
    phone: "084-567-8901",
    email: "arunee@example.com",
  },
];

const mockOrders: Order[] = [
  {
    id: "ORD-001",
    customerName: "สมชาย ใจดี",
    customerId: "CUST-001",
    customerTier: "gold",
    lineId: "LINE-123456",
    lineAccount: "Store Account 1",
    items: [
      {
        productId: "PROD-001",
        productName: "Product A - Premium Electronics",
        sku: "SKU-A001",
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
        quantity: 100,
        unitPrice: 260,
        originalPrice: 300,
        discount: 4000,
        subtotal: 26000,
      },
      {
        productId: "PROD-002",
        productName: "Product B - Home & Garden",
        sku: "SKU-B002",
        imageUrl: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400",
        quantity: 150,
        unitPrice: 130,
        originalPrice: 150,
        discount: 3000,
        subtotal: 19500,
      },
    ],
    totalQuantity: 250,
    subtotal: 45500,
    totalDiscount: 7000,
    tax: 3185,
    totalAmount: 48685,
    status: "pending",
    orderDate: "2026-01-20",
    paymentMethod: "Bank Transfer",
  },
  {
    id: "ORD-002",
    customerName: "สมหญิง รักสวย",
    customerId: "CUST-002",
    customerTier: "platinum",
    lineId: "LINE-789012",
    lineAccount: "Store Account 2",
    items: [
      {
        productId: "PROD-003",
        productName: "Product C - Fashion Accessories",
        sku: "SKU-C003",
        imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
        quantity: 100,
        unitPrice: 325,
        originalPrice: 400,
        discount: 7500,
        subtotal: 32500,
      },
    ],
    totalQuantity: 100,
    subtotal: 32500,
    totalDiscount: 7500,
    tax: 2275,
    totalAmount: 34775,
    status: "processing",
    orderDate: "2026-01-19",
    paymentMethod: "Credit Card",
  },
];

interface CreateOrderProps {
  onOrderCreated: (order: Order) => void;
}

function CreateOrderDialog({ onOrderCreated }: CreateOrderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Map<string, number>>(new Map());
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");
  const [shippingAddress, setShippingAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [searchProduct, setSearchProduct] = useState("");

  const filteredProducts = mockProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchProduct.toLowerCase())
  );

  const getProductPrice = (product: Product) => {
    if (!selectedCustomer) return product.tierPricing.bronze;
    return product.tierPricing[selectedCustomer.tier];
  };

  const updateProductQuantity = (productId: string, quantity: number) => {
    const newMap = new Map(selectedProducts);
    if (quantity > 0) {
      newMap.set(productId, quantity);
    } else {
      newMap.delete(productId);
    }
    setSelectedProducts(newMap);
  };

  const calculateOrderSummary = () => {
    if (!selectedCustomer) return { subtotal: 0, discount: 0, tax: 0, total: 0, totalQty: 0 };

    let subtotal = 0;
    let discount = 0;
    let totalQty = 0;

    selectedProducts.forEach((quantity, productId) => {
      const product = mockProducts.find((p) => p.id === productId);
      if (product) {
        const unitPrice = getProductPrice(product);
        const originalPrice = product.tierPricing.bronze;
        subtotal += unitPrice * quantity;
        discount += (originalPrice - unitPrice) * quantity;
        totalQty += quantity;
      }
    });

    const tax = subtotal * 0.07;
    const total = subtotal + tax;

    return { subtotal, discount, tax, total, totalQty };
  };

  const handleSubmit = () => {
    if (!selectedCustomer || selectedProducts.size === 0) return;

    const summary = calculateOrderSummary();
    const items: OrderItem[] = [];

    selectedProducts.forEach((quantity, productId) => {
      const product = mockProducts.find((p) => p.id === productId);
      if (product) {
        const unitPrice = getProductPrice(product);
        const originalPrice = product.tierPricing.bronze;
        items.push({
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          imageUrl: product.imageUrl,
          quantity,
          unitPrice,
          originalPrice,
          discount: (originalPrice - unitPrice) * quantity,
          subtotal: unitPrice * quantity,
        });
      }
    });

    const newOrder: Order = {
      id: `ORD-${String(Math.floor(Math.random() * 10000)).padStart(3, "0")}`,
      customerName: selectedCustomer.name,
      customerId: selectedCustomer.id,
      customerTier: selectedCustomer.tier,
      lineId: selectedCustomer.lineId,
      lineAccount: selectedCustomer.lineAccount,
      items,
      totalQuantity: summary.totalQty,
      subtotal: summary.subtotal,
      totalDiscount: summary.discount,
      tax: summary.tax,
      totalAmount: summary.total,
      status: "pending",
      orderDate: new Date().toISOString().split("T")[0],
      paymentMethod,
      shippingAddress: shippingAddress || undefined,
      notes: notes || undefined,
    };

    onOrderCreated(newOrder);
    
    // Reset form
    setSelectedCustomer(null);
    setSelectedProducts(new Map());
    setPaymentMethod("Bank Transfer");
    setShippingAddress("");
    setNotes("");
    setIsOpen(false);
  };

  const summary = calculateOrderSummary();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-black text-white hover:bg-gray-800">
          <Plus className="h-4 w-4 mr-2" />
          Create Order
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Order</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side - Customer & Products Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Select Customer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={selectedCustomer?.id || ""}
                  onValueChange={(value) => {
                    const customer = mockCustomers.find((c) => c.id === value);
                    setSelectedCustomer(customer || null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a customer..." />
                  </SelectTrigger>
                  <SelectContent>
                    {mockCustomers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        <div className="flex items-center gap-2">
                          <span>{tierInfo[customer.tier].emoji}</span>
                          <div>
                            <div className="font-semibold">{customer.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {customer.lineId} • {tierInfo[customer.tier].name}
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedCustomer && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Tier:</span>
                        <span className="ml-2 font-semibold">
                          {tierInfo[selectedCustomer.tier].emoji} {tierInfo[selectedCustomer.tier].name}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Account:</span>
                        <span className="ml-2 font-semibold">{selectedCustomer.lineAccount}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Contact:</span>
                        <span className="ml-2">{selectedCustomer.phone}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Product Selection */}
            {selectedCustomer && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Select Products
                  </CardTitle>
                  <div className="mt-2">
                    <Input
                      placeholder="Search products..."
                      value={searchProduct}
                      onChange={(e) => setSearchProduct(e.target.value)}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {filteredProducts.map((product) => {
                      const quantity = selectedProducts.get(product.id) || 0;
                      const price = getProductPrice(product);
                      const originalPrice = product.tierPricing.bronze;
                      const hasDiscount = price < originalPrice;

                      return (
                        <div
                          key={product.id}
                          className="flex gap-3 p-3 border border-border rounded-lg hover:bg-gray-50"
                        >
                          <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                            {product.imageUrl && (
                              <ImageWithFallback
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm truncate">{product.name}</h4>
                            <p className="text-xs text-muted-foreground">{product.sku}</p>
                            <div className="mt-1 flex items-center gap-2">
                              <span className="font-bold text-sm">฿{price.toLocaleString()}</span>
                              {hasDiscount && (
                                <span className="text-xs text-muted-foreground line-through">
                                  ฿{originalPrice.toLocaleString()}
                                </span>
                              )}
                              <Badge variant="outline" className="text-xs">
                                Min: {product.minOrder}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateProductQuantity(product.id, Math.max(0, quantity - product.minOrder))}
                              disabled={quantity === 0}
                            >
                              -
                            </Button>
                            <Input
                              type="number"
                              value={quantity || ""}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                updateProductQuantity(product.id, val);
                              }}
                              className="w-20 text-center"
                              min={0}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateProductQuantity(product.id, quantity + product.minOrder)}
                            >
                              +
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Side - Order Summary */}
          <div className="space-y-6">
            {/* Selected Items */}
            {selectedProducts.size > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Selected Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {Array.from(selectedProducts.entries()).map(([productId, quantity]) => {
                      const product = mockProducts.find((p) => p.id === productId);
                      if (!product) return null;
                      const price = getProductPrice(product);
                      const subtotal = price * quantity;

                      return (
                        <div key={productId} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate">{product.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {quantity} × ฿{price.toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-sm">฿{subtotal.toLocaleString()}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateProductQuantity(productId, 0)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Items:</span>
                    <span className="font-semibold">{summary.totalQty} units</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="font-semibold">฿{summary.subtotal.toLocaleString()}</span>
                  </div>
                  {summary.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span className="font-semibold">-฿{summary.discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax (7%):</span>
                    <span className="font-semibold">฿{summary.tax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t border-border pt-2">
                    <span>Total:</span>
                    <span>฿{summary.total.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-3 border-t border-border pt-4">
                  <div>
                    <Label htmlFor="payment">Payment Method</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                        <SelectItem value="Credit Card">Credit Card</SelectItem>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="QR Payment">QR Payment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="shipping">Shipping Address (Optional)</Label>
                    <Textarea
                      id="shipping"
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      placeholder="Enter shipping address..."
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Additional notes..."
                      rows={2}
                    />
                  </div>
                </div>

                <Button
                  className="w-full bg-black text-white hover:bg-gray-800"
                  onClick={handleSubmit}
                  disabled={!selectedCustomer || selectedProducts.size === 0}
                >
                  Create Order (฿{summary.total.toLocaleString()})
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterAccount, setFilterAccount] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.lineId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || order.status === filterStatus;
    const matchesAccount = filterAccount === "all" || order.lineAccount === filterAccount;
    return matchesSearch && matchesStatus && matchesAccount;
  });

  const handleOrderCreated = (newOrder: Order) => {
    setOrders([newOrder, ...orders]);
    // Here you would also send this to billing system
    console.log("New order created for billing:", newOrder);
  };

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
    totalRevenue: orders
      .filter((o) => o.status === "completed")
      .reduce((sum, o) => sum + o.totalAmount, 0),
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">฿{stats.totalRevenue.toLocaleString()}</div>
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
            <CreateOrderDialog onOrderCreated={handleOrderCreated} />
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
                <TableHead>Tier</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Discount</TableHead>
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
                  <TableCell>
                    <div>
                      <div className="font-semibold">{order.customerName}</div>
                      <div className="text-xs text-muted-foreground">{order.lineId}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      <span className="mr-1">{tierInfo[order.customerTier].emoji}</span>
                      {tierInfo[order.customerTier].name}
                    </Badge>
                  </TableCell>
                  <TableCell>{order.items.length}</TableCell>
                  <TableCell>{order.totalQuantity}</TableCell>
                  <TableCell className="text-green-600 font-semibold">
                    ฿{order.totalDiscount.toLocaleString()}
                  </TableCell>
                  <TableCell className="font-semibold">
                    ฿{order.totalAmount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(order.status)} variant="secondary">
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(order.orderDate).toLocaleDateString('th-TH')}</TableCell>
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
                            <DialogTitle>Order Details - {selectedOrder?.id}</DialogTitle>
                          </DialogHeader>
                          {selectedOrder && (
                            <div className="space-y-6">
                              {/* Order Header */}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                                <div>
                                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    Order Date
                                  </p>
                                  <p className="font-semibold">{new Date(selectedOrder.orderDate).toLocaleDateString('th-TH')}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Status</p>
                                  <Badge className={getStatusColor(selectedOrder.status)}>
                                    {selectedOrder.status}
                                  </Badge>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <CreditCard className="h-3 w-3" />
                                    Payment
                                  </p>
                                  <p className="font-semibold text-sm">{selectedOrder.paymentMethod || "N/A"}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Package className="h-3 w-3" />
                                    Total Items
                                  </p>
                                  <p className="font-semibold">{selectedOrder.totalQuantity} units</p>
                                </div>
                              </div>

                              {/* Customer Info */}
                              <div className="p-4 bg-gray-50 rounded-lg">
                                <h3 className="font-semibold mb-2">Customer Information</h3>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">Name:</span>
                                    <span className="ml-2 font-semibold">{selectedOrder.customerName}</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Tier:</span>
                                    <span className="ml-2">
                                      {tierInfo[selectedOrder.customerTier].emoji} {tierInfo[selectedOrder.customerTier].name}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">LINE ID:</span>
                                    <span className="ml-2 font-mono text-xs">{selectedOrder.lineId}</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Account:</span>
                                    <span className="ml-2">{selectedOrder.lineAccount}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Order Items */}
                              <div>
                                <h3 className="font-semibold mb-3">Order Items</h3>
                                <div className="space-y-3">
                                  {selectedOrder.items.map((item, index) => (
                                    <div key={index} className="flex gap-4 p-3 border border-border rounded-lg">
                                      <div className="w-20 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                        {item.imageUrl && (
                                          <ImageWithFallback
                                            src={item.imageUrl}
                                            alt={item.productName}
                                            className="w-full h-full object-cover"
                                          />
                                        )}
                                      </div>
                                      <div className="flex-1">
                                        <h4 className="font-semibold text-sm">{item.productName}</h4>
                                        <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
                                        <div className="mt-2 flex items-center gap-4 text-sm">
                                          <div>
                                            <span className="text-muted-foreground">Qty:</span>
                                            <span className="font-semibold ml-1">{item.quantity}</span>
                                          </div>
                                          <div>
                                            <span className="text-muted-foreground">Unit:</span>
                                            <span className="font-semibold ml-1">฿{item.unitPrice.toLocaleString()}</span>
                                          </div>
                                          {item.discount > 0 && (
                                            <div className="text-green-600">
                                              <span>Saved:</span>
                                              <span className="font-semibold ml-1">฿{item.discount.toLocaleString()}</span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        {item.discount > 0 && (
                                          <p className="text-xs text-muted-foreground line-through">
                                            ฿{(item.originalPrice * item.quantity).toLocaleString()}
                                          </p>
                                        )}
                                        <p className="font-bold text-lg">฿{item.subtotal.toLocaleString()}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Order Summary */}
                              <div className="border-t border-border pt-4">
                                <div className="space-y-2 max-w-sm ml-auto">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal:</span>
                                    <span className="font-semibold">฿{selectedOrder.subtotal.toLocaleString()}</span>
                                  </div>
                                  {selectedOrder.totalDiscount > 0 && (
                                    <div className="flex justify-between text-sm text-green-600">
                                      <span>Total Discount:</span>
                                      <span className="font-semibold">-฿{selectedOrder.totalDiscount.toLocaleString()}</span>
                                    </div>
                                  )}
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Tax (7%):</span>
                                    <span className="font-semibold">฿{selectedOrder.tax.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between text-lg font-bold border-t border-border pt-2">
                                    <span>Total Amount:</span>
                                    <span>฿{selectedOrder.totalAmount.toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Additional Info */}
                              {(selectedOrder.shippingAddress || selectedOrder.notes) && (
                                <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                                  {selectedOrder.shippingAddress && (
                                    <div>
                                      <p className="text-xs text-muted-foreground font-semibold mb-1">Shipping Address</p>
                                      <p className="text-sm">{selectedOrder.shippingAddress}</p>
                                    </div>
                                  )}
                                  {selectedOrder.notes && (
                                    <div>
                                      <p className="text-xs text-muted-foreground font-semibold mb-1">Notes</p>
                                      <p className="text-sm">{selectedOrder.notes}</p>
                                    </div>
                                  )}
                                </div>
                              )}
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
