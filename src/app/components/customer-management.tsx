import { useState } from "react";
import { Users, Search, UserPlus, Edit, Trash2, ArrowLeft, ShoppingCart, TrendingUp, Award, Eye, Package, Calendar, CreditCard } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import { Label } from "@/app/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";

type CustomerTier = "bronze" | "silver" | "gold" | "platinum";

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
  date: string;
  items: OrderItem[];
  totalQuantity: number;
  subtotal: number;
  totalDiscount: number;
  tax: number;
  totalAmount: number;
  status: "completed" | "processing" | "cancelled";
  paymentMethod: string;
  shippingAddress?: string;
  notes?: string;
}

interface TopProduct {
  productId: string;
  name: string;
  sku: string;
  imageUrl?: string;
  totalQuantity: number;
  orderCount: number;
  totalRevenue: number;
  averagePrice: number;
  lastOrderDate: string;
}

interface Customer {
  id: string;
  name: string;
  lineId: string;
  lineAccount: string;
  phone: string;
  email: string;
  tier: CustomerTier;
  totalOrders: number;
  totalSpent: number;
  totalDiscount: number;
  averageOrderValue: number;
  registeredDate: string;
  lastOrderDate: string;
  status: "active" | "inactive";
  recentOrders?: Order[];
  topProducts?: TopProduct[];
}

const tierInfo: Record<CustomerTier, { emoji: string; name: string; color: string; bg: string }> = {
  bronze: { emoji: "🥉", name: "Bronze", color: "text-orange-700", bg: "bg-orange-100" },
  silver: { emoji: "🥈", name: "Silver", color: "text-gray-700", bg: "bg-gray-100" },
  gold: { emoji: "🥇", name: "Gold", color: "text-yellow-700", bg: "bg-yellow-100" },
  platinum: { emoji: "💎", name: "Platinum", color: "text-purple-700", bg: "bg-purple-100" },
};

const mockCustomers: Customer[] = [
  {
    id: "CUST-001",
    name: "สมชาย ใจดี",
    lineId: "LINE-123456",
    lineAccount: "Store Account 1",
    phone: "081-234-5678",
    email: "somchai@example.com",
    tier: "gold",
    totalOrders: 5,
    totalSpent: 125000,
    totalDiscount: 15000,
    averageOrderValue: 25000,
    registeredDate: "2025-11-15",
    lastOrderDate: "2026-01-18",
    status: "active",
    recentOrders: [
      {
        id: "ORD-001",
        date: "2026-01-18",
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
        status: "completed",
        paymentMethod: "Bank Transfer",
        shippingAddress: "123 ถนนสุขุมวิท กรุงเทพฯ 10110",
        notes: "ขอใบกำกับภาษีด้วย",
      },
      {
        id: "ORD-002",
        date: "2026-01-10",
        items: [
          {
            productId: "PROD-003",
            productName: "Product C - Fashion Accessories",
            sku: "SKU-C003",
            imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
            quantity: 75,
            unitPrice: 350,
            originalPrice: 400,
            discount: 3750,
            subtotal: 26250,
          },
        ],
        totalQuantity: 75,
        subtotal: 26250,
        totalDiscount: 3750,
        tax: 1837.5,
        totalAmount: 28087.5,
        status: "completed",
        paymentMethod: "Credit Card",
      },
    ],
    topProducts: [
      {
        productId: "PROD-001",
        name: "Product A - Premium Electronics",
        sku: "SKU-A001",
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
        totalQuantity: 200,
        orderCount: 3,
        totalRevenue: 52000,
        averagePrice: 260,
        lastOrderDate: "2026-01-18",
      },
      {
        productId: "PROD-002",
        name: "Product B - Home & Garden",
        sku: "SKU-B002",
        imageUrl: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400",
        totalQuantity: 150,
        orderCount: 2,
        totalRevenue: 19500,
        averagePrice: 130,
        lastOrderDate: "2026-01-18",
      },
      {
        productId: "PROD-003",
        name: "Product C - Fashion Accessories",
        sku: "SKU-C003",
        imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
        totalQuantity: 75,
        orderCount: 1,
        totalRevenue: 26250,
        averagePrice: 350,
        lastOrderDate: "2026-01-10",
      },
    ],
  },
  {
    id: "CUST-002",
    name: "สมหญิง รักสวย",
    lineId: "LINE-789012",
    lineAccount: "Store Account 2",
    phone: "082-345-6789",
    email: "somying@example.com",
    tier: "platinum",
    totalOrders: 8,
    totalSpent: 240000,
    totalDiscount: 38400,
    averageOrderValue: 30000,
    registeredDate: "2025-10-20",
    lastOrderDate: "2026-01-20",
    status: "active",
  },
  {
    id: "CUST-003",
    name: "วิชัย ประเสริฐ",
    lineId: "LINE-345678",
    lineAccount: "Store Account 3",
    phone: "083-456-7890",
    email: "wichai@example.com",
    tier: "silver",
    totalOrders: 3,
    totalSpent: 85000,
    totalDiscount: 5950,
    averageOrderValue: 28333,
    registeredDate: "2025-12-01",
    lastOrderDate: "2026-01-15",
    status: "active",
  },
  {
    id: "CUST-004",
    name: "อรุณี สวัสดี",
    lineId: "LINE-901234",
    lineAccount: "Store Account 1",
    phone: "084-567-8901",
    email: "arunee@example.com",
    tier: "bronze",
    totalOrders: 1,
    totalSpent: 25000,
    totalDiscount: 0,
    averageOrderValue: 25000,
    registeredDate: "2026-01-10",
    lastOrderDate: "2026-01-10",
    status: "active",
  },
];

export function CustomerManagement() {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.lineId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCustomer = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newCustomer: Customer = {
      id: `CUST-${String(customers.length + 1).padStart(3, "0")}`,
      name: formData.get("name") as string,
      lineId: formData.get("lineId") as string,
      lineAccount: formData.get("lineAccount") as string,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      tier: formData.get("tier") as CustomerTier,
      totalOrders: 0,
      totalSpent: 0,
      totalDiscount: 0,
      averageOrderValue: 0,
      registeredDate: new Date().toISOString().split("T")[0],
      lastOrderDate: "",
      status: "active",
    };
    setCustomers([...customers, newCustomer]);
    setIsAddDialogOpen(false);
  };

  const handleEditCustomer = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingCustomer) return;
    const formData = new FormData(e.currentTarget);
    const updatedCustomer: Customer = {
      ...editingCustomer,
      name: formData.get("name") as string,
      lineId: formData.get("lineId") as string,
      lineAccount: formData.get("lineAccount") as string,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      tier: formData.get("tier") as CustomerTier,
      status: formData.get("status") as "active" | "inactive",
    };
    setCustomers(
      customers.map((c) => (c.id === editingCustomer.id ? updatedCustomer : c))
    );
    setEditingCustomer(null);
  };

  const handleDeleteCustomer = (id: string) => {
    setCustomers(customers.filter((c) => c.id !== id));
  };

  const CustomerForm = ({ customer }: { customer?: Customer }) => (
    <form
      onSubmit={customer ? handleEditCustomer : handleAddCustomer}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            defaultValue={customer?.name}
            required
          />
        </div>
        <div>
          <Label htmlFor="lineId">LINE ID</Label>
          <Input
            id="lineId"
            name="lineId"
            defaultValue={customer?.lineId}
            required
          />
        </div>
      </div>
      <div>
        <Label htmlFor="lineAccount">LINE@ Account</Label>
        <Select
          name="lineAccount"
          defaultValue={customer?.lineAccount || "Store Account 1"}
        >
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
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            defaultValue={customer?.phone}
            required
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={customer?.email}
            required
          />
        </div>
      </div>
      <div>
        <Label htmlFor="tier">Membership Tier</Label>
        <Select name="tier" defaultValue={customer?.tier || "bronze"}>
          <SelectTrigger>
            <SelectValue placeholder="Select tier" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(tierInfo).map(([tier, info]) => (
              <SelectItem key={tier} value={tier}>
                <div className="flex items-center gap-2">
                  <span>{info.emoji}</span>
                  <span>{info.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {customer && (
        <div>
          <Label htmlFor="status">Status</Label>
          <Select name="status" defaultValue={customer.status}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setIsAddDialogOpen(false);
            setEditingCustomer(null);
          }}
        >
          Cancel
        </Button>
        <Button type="submit" className="bg-black text-white hover:bg-gray-800">
          {customer ? "Update" : "Add"} Customer
        </Button>
      </div>
    </form>
  );

  // Order Detail Dialog
  const OrderDetailDialog = ({ order }: { order: Order }) => (
    <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order Details - {order.id}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Order Header Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Order Date
              </p>
              <p className="font-semibold">{new Date(order.date).toLocaleDateString('th-TH')}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <Badge className={
                order.status === "completed" ? "bg-black text-white" :
                order.status === "processing" ? "bg-gray-400 text-white" :
                "bg-white text-black border border-black"
              }>
                {order.status}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <CreditCard className="h-3 w-3" />
                Payment
              </p>
              <p className="font-semibold text-sm">{order.paymentMethod}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Package className="h-3 w-3" />
                Total Items
              </p>
              <p className="font-semibold">{order.totalQuantity} units</p>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Order Items
            </h3>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex gap-4 p-3 border border-border rounded-lg hover:bg-gray-50">
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
                        <span className="text-muted-foreground">Unit Price:</span>
                        <span className="font-semibold ml-1">฿{item.unitPrice.toLocaleString()}</span>
                      </div>
                      {item.discount > 0 && (
                        <div className="text-green-600">
                          <span className="text-muted-foreground">Discount:</span>
                          <span className="font-semibold ml-1">-฿{item.discount.toLocaleString()}</span>
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
                    <p className="font-bold text-lg">
                      ฿{item.subtotal.toLocaleString()}
                    </p>
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
                <span className="font-semibold">฿{order.subtotal.toLocaleString()}</span>
              </div>
              {order.totalDiscount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Total Discount:</span>
                  <span className="font-semibold">-฿{order.totalDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax (7%):</span>
                <span className="font-semibold">฿{order.tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-border pt-2">
                <span>Total Amount:</span>
                <span>฿{order.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          {(order.shippingAddress || order.notes) && (
            <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
              {order.shippingAddress && (
                <div>
                  <p className="text-xs text-muted-foreground font-semibold mb-1">Shipping Address</p>
                  <p className="text-sm">{order.shippingAddress}</p>
                </div>
              )}
              {order.notes && (
                <div>
                  <p className="text-xs text-muted-foreground font-semibold mb-1">Notes</p>
                  <p className="text-sm">{order.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );

  if (selectedCustomer) {
    return (
      <div className="space-y-6">
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => setSelectedCustomer(null)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Customers
        </Button>

        {/* Customer Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Info */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Name</Label>
                <p className="font-semibold">{selectedCustomer.name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Membership Tier</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={`${tierInfo[selectedCustomer.tier].bg} ${tierInfo[selectedCustomer.tier].color} border-0`}>
                    <span className="mr-1">{tierInfo[selectedCustomer.tier].emoji}</span>
                    {tierInfo[selectedCustomer.tier].name}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">LINE ID</Label>
                <p className="font-semibold">{selectedCustomer.lineId}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">LINE@ Account</Label>
                <p className="font-semibold">{selectedCustomer.lineAccount}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Phone</Label>
                <p className="font-semibold">{selectedCustomer.phone}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Email</Label>
                <p className="font-semibold">{selectedCustomer.email}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Member Since</Label>
                <p className="font-semibold">
                  {new Date(selectedCustomer.registeredDate).toLocaleDateString('th-TH')}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Last Order</Label>
                <p className="font-semibold">
                  {selectedCustomer.lastOrderDate ? new Date(selectedCustomer.lastOrderDate).toLocaleDateString('th-TH') : 'N/A'}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Status</Label>
                <Badge
                  variant="secondary"
                  className={
                    selectedCustomer.status === "active"
                      ? "bg-black text-white"
                      : "bg-gray-400 text-white"
                  }
                >
                  {selectedCustomer.status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Stats and Orders */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-black/5 rounded-lg">
                      <ShoppingCart className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Orders</p>
                      <p className="text-2xl font-bold">{selectedCustomer.totalOrders}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-black/5 rounded-lg">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Spent</p>
                      <p className="text-2xl font-bold">
                        ฿{selectedCustomer.totalSpent.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <Award className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Saved</p>
                      <p className="text-2xl font-bold text-green-600">
                        ฿{selectedCustomer.totalDiscount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-black/5 rounded-lg">
                      <Package className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Order</p>
                      <p className="text-2xl font-bold">
                        ฿{selectedCustomer.averageOrderValue.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {selectedCustomer.recentOrders?.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">{order.id}</p>
                          <Badge className={
                            order.status === "completed" ? "bg-black text-white" :
                            order.status === "processing" ? "bg-gray-400 text-white" :
                            "bg-white text-black border border-black"
                          }>
                            {order.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.date).toLocaleDateString('th-TH')}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="text-muted-foreground">
                            {order.items.length} items • {order.totalQuantity} units
                          </span>
                          {order.totalDiscount > 0 && (
                            <span className="text-green-600 font-semibold">
                              Saved ฿{order.totalDiscount.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right mr-2">
                          {order.totalDiscount > 0 && (
                            <p className="text-xs text-muted-foreground line-through">
                              ฿{(order.totalAmount + order.totalDiscount).toLocaleString()}
                            </p>
                          )}
                          <p className="font-bold text-lg">฿{order.totalAmount.toLocaleString()}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Products */}
            <Card>
              <CardHeader>
                <CardTitle>Most Ordered Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {selectedCustomer.topProducts?.map((product, index) => (
                    <div
                      key={index}
                      className="flex gap-4 p-3 border border-border rounded-lg hover:bg-gray-50"
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
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{product.name}</h4>
                        <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                        <div className="mt-2 flex items-center gap-4 text-xs">
                          <Badge variant="secondary">{product.totalQuantity} units</Badge>
                          <span className="text-muted-foreground">
                            {product.orderCount} orders
                          </span>
                          <span className="text-muted-foreground">
                            Avg ฿{product.averagePrice.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">฿{product.totalRevenue.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Last: {new Date(product.lastOrderDate).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Order Detail Dialog */}
        {selectedOrder && <OrderDetailDialog order={selectedOrder} />}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Customer Management
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manage customers and their membership tiers
              </p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-black text-white hover:bg-gray-800">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Customer
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Customer</DialogTitle>
                </DialogHeader>
                <CustomerForm />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tier Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(tierInfo).map(([tier, info]) => {
          const count = customers.filter((c) => c.tier === tier).length;
          return (
            <Card key={tier}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{info.emoji}</span>
                    <div>
                      <p className="text-sm text-muted-foreground">{info.name}</p>
                      <p className="text-2xl font-bold">{count}</p>
                    </div>
                  </div>
                  <Award className="h-8 w-8 text-muted-foreground/20" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Customers Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer Info</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>LINE Info</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div>
                      <div className="font-semibold">{customer.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {customer.id}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${tierInfo[customer.tier].bg} ${tierInfo[customer.tier].color} border-0`}>
                      <span className="mr-1">{tierInfo[customer.tier].emoji}</span>
                      {tierInfo[customer.tier].name}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm font-semibold">{customer.lineId}</div>
                      <div className="text-xs text-muted-foreground">
                        {customer.lineAccount}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm">{customer.phone}</div>
                      <div className="text-xs text-muted-foreground">
                        {customer.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{customer.totalOrders}</TableCell>
                  <TableCell>฿{customer.totalSpent.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        customer.status === "active"
                          ? "bg-black text-white"
                          : "bg-gray-400 text-white"
                      }
                    >
                      {customer.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedCustomer(customer)}
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Dialog
                        open={editingCustomer?.id === customer.id}
                        onOpenChange={(open) => !open && setEditingCustomer(null)}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingCustomer(customer);
                            }}
                            title="Edit Customer"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Edit Customer</DialogTitle>
                          </DialogHeader>
                          <CustomerForm customer={customer} />
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCustomer(customer.id);
                        }}
                        title="Delete Customer"
                      >
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
