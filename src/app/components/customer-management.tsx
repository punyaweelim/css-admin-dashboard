import { useState } from "react";
import { Users, Search, UserPlus, Edit, Trash2, ArrowLeft, ShoppingCart, TrendingUp } from "lucide-react";
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

interface Order {
  id: string;
  date: string;
  products: string[];
  quantity: number;
  amount: number;
  status: string;
}

interface Customer {
  id: string;
  name: string;
  lineId: string;
  lineAccount: string;
  phone: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
  registeredDate: string;
  status: "active" | "inactive";
  recentOrders?: Order[];
  topProducts?: { name: string; quantity: number; times: number }[];
}

const mockCustomers: Customer[] = [
  {
    id: "CUST-001",
    name: "สมชาย ใจดี",
    lineId: "LINE-123456",
    lineAccount: "Store Account 1",
    phone: "081-234-5678",
    email: "somchai@example.com",
    totalOrders: 5,
    totalSpent: 125000,
    registeredDate: "2025-11-15",
    status: "active",
    recentOrders: [
      {
        id: "ORD-001",
        date: "2025-11-15",
        products: ["Product A", "Product B"],
        quantity: 2,
        amount: 50000,
        status: "completed",
      },
      {
        id: "ORD-002",
        date: "2025-11-16",
        products: ["Product C"],
        quantity: 1,
        amount: 25000,
        status: "completed",
      },
    ],
    topProducts: [
      {
        name: "Product A",
        quantity: 10,
        times: 2,
      },
      {
        name: "Product B",
        quantity: 5,
        times: 2,
      },
      {
        name: "Product C",
        quantity: 3,
        times: 1,
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
    totalOrders: 8,
    totalSpent: 240000,
    registeredDate: "2025-10-20",
    status: "active",
    recentOrders: [
      {
        id: "ORD-003",
        date: "2025-10-20",
        products: ["Product D", "Product E"],
        quantity: 3,
        amount: 75000,
        status: "completed",
      },
      {
        id: "ORD-004",
        date: "2025-10-21",
        products: ["Product F"],
        quantity: 1,
        amount: 45000,
        status: "completed",
      },
    ],
    topProducts: [
      {
        name: "Product D",
        quantity: 15,
        times: 3,
      },
      {
        name: "Product E",
        quantity: 10,
        times: 3,
      },
      {
        name: "Product F",
        quantity: 5,
        times: 1,
      },
    ],
  },
  {
    id: "CUST-003",
    name: "วิชัย ประเสริฐ",
    lineId: "LINE-345678",
    lineAccount: "Store Account 3",
    phone: "083-456-7890",
    email: "wichai@example.com",
    totalOrders: 3,
    totalSpent: 85000,
    registeredDate: "2025-12-01",
    status: "active",
    recentOrders: [
      {
        id: "ORD-005",
        date: "2025-12-01",
        products: ["Product G"],
        quantity: 1,
        amount: 25000,
        status: "completed",
      },
      {
        id: "ORD-006",
        date: "2025-12-02",
        products: ["Product H"],
        quantity: 1,
        amount: 30000,
        status: "completed",
      },
    ],
    topProducts: [
      {
        name: "Product G",
        quantity: 5,
        times: 1,
      },
      {
        name: "Product H",
        quantity: 4,
        times: 1,
      },
    ],
  },
  {
    id: "CUST-004",
    name: "นภา สุขใจ",
    lineId: "LINE-901234",
    lineAccount: "Store Account 1",
    phone: "084-567-8901",
    email: "napa@example.com",
    totalOrders: 12,
    totalSpent: 360000,
    registeredDate: "2025-09-10",
    status: "active",
    recentOrders: [
      {
        id: "ORD-007",
        date: "2025-09-10",
        products: ["Product I", "Product J"],
        quantity: 4,
        amount: 100000,
        status: "completed",
      },
      {
        id: "ORD-008",
        date: "2025-09-11",
        products: ["Product K"],
        quantity: 1,
        amount: 60000,
        status: "completed",
      },
    ],
    topProducts: [
      {
        name: "Product I",
        quantity: 20,
        times: 4,
      },
      {
        name: "Product J",
        quantity: 15,
        times: 4,
      },
      {
        name: "Product K",
        quantity: 10,
        times: 1,
      },
    ],
  },
  {
    id: "CUST-005",
    name: "ธนา มั่งมี",
    lineId: "LINE-567890",
    lineAccount: "Store Account 2",
    phone: "085-678-9012",
    email: "thana@example.com",
    totalOrders: 1,
    totalSpent: 15000,
    registeredDate: "2026-01-05",
    status: "inactive",
    recentOrders: [
      {
        id: "ORD-009",
        date: "2026-01-05",
        products: ["Product L"],
        quantity: 1,
        amount: 15000,
        status: "completed",
      },
    ],
    topProducts: [
      {
        name: "Product L",
        quantity: 5,
        times: 1,
      },
    ],
  },
];

export function CustomerManagement() {
  const [customers] = useState<Customer[]>(mockCustomers);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "detail">("list");
  const [customerDetail, setCustomerDetail] = useState<Customer | null>(null);

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.lineId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const stats = {
    total: customers.length,
    active: customers.filter((c) => c.status === "active").length,
    inactive: customers.filter((c) => c.status === "inactive").length,
    totalRevenue: customers.reduce((sum, c) => sum + c.totalSpent, 0),
  };

  const handleRowClick = (customer: Customer) => {
    setCustomerDetail(customer);
    setViewMode("detail");
  };

  const handleBackToList = () => {
    setViewMode("list");
    setCustomerDetail(null);
  };

  if (viewMode === "detail" && customerDetail) {
    return (
      <div className="space-y-6">
        {/* Back Button */}
        <Button variant="ghost" onClick={handleBackToList}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Customers
        </Button>

        {/* Customer Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{customerDetail.name}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {customerDetail.id} • {customerDetail.lineAccount}
                </p>
              </div>
              <Badge
                className={
                  customerDetail.status === "active"
                    ? "bg-black text-white"
                    : "bg-white text-black border border-black"
                }
                variant="secondary"
              >
                {customerDetail.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm text-muted-foreground mb-2">Contact Information</h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground">LINE ID</p>
                    <p className="font-mono">{customerDetail.lineId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p>{customerDetail.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p>{customerDetail.email}</p>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm text-muted-foreground mb-2">Statistics</h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Orders</p>
                    <p className="text-2xl font-bold">{customerDetail.totalOrders}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Spent</p>
                    <p className="text-2xl font-bold">฿{customerDetail.totalSpent.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Member Since</p>
                    <p>{customerDetail.registeredDate}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Recent Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customerDetail.recentOrders && customerDetail.recentOrders.length > 0 ? (
                  customerDetail.recentOrders.map((order) => (
                    <div key={order.id} className="border-b border-border pb-4 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-mono text-sm">{order.id}</p>
                        <Badge variant="secondary" className="bg-black text-white">
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{order.date}</p>
                      <p className="text-sm mt-1">{order.products.join(", ")}</p>
                      <p className="font-semibold mt-2">฿{order.amount.toLocaleString()}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No recent orders</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Most Ordered Products */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Most Ordered Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customerDetail.topProducts && customerDetail.topProducts.length > 0 ? (
                  customerDetail.topProducts.map((product, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Ordered {product.times} time{product.times > 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{product.quantity} units</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No product data</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Inactive</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inactive}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">฿{stats.totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Customer Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Customer Management
            </CardTitle>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Customer
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Customer</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Name</Label>
                    <Input placeholder="Customer name" />
                  </div>
                  <div>
                    <Label>LINE ID</Label>
                    <Input placeholder="LINE-XXXXXX" />
                  </div>
                  <div>
                    <Label>LINE Account</Label>
                    <Input placeholder="Select account" />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input placeholder="0XX-XXX-XXXX" />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input type="email" placeholder="email@example.com" />
                  </div>
                  <Button className="w-full">Save Customer</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="flex gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, LINE ID, phone, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>LINE ID</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow 
                  key={customer.id} 
                  onClick={() => handleRowClick(customer)}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <TableCell className="font-mono">{customer.id}</TableCell>
                  <TableCell>{customer.name}</TableCell>
                  <TableCell className="font-mono text-sm">{customer.lineId}</TableCell>
                  <TableCell>{customer.lineAccount}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.totalOrders}</TableCell>
                  <TableCell>฿{customer.totalSpent.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        customer.status === "active"
                          ? "bg-black text-white"
                          : "bg-white text-black border border-black"
                      }
                      variant="secondary"
                    >
                      {customer.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedCustomer(customer)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Customer: {selectedCustomer?.id}</DialogTitle>
                          </DialogHeader>
                          {selectedCustomer && (
                            <div className="space-y-4">
                              <div>
                                <Label>Name</Label>
                                <Input defaultValue={selectedCustomer.name} />
                              </div>
                              <div>
                                <Label>LINE ID</Label>
                                <Input defaultValue={selectedCustomer.lineId} />
                              </div>
                              <div>
                                <Label>LINE Account</Label>
                                <Input defaultValue={selectedCustomer.lineAccount} />
                              </div>
                              <div>
                                <Label>Phone</Label>
                                <Input defaultValue={selectedCustomer.phone} />
                              </div>
                              <div>
                                <Label>Email</Label>
                                <Input defaultValue={selectedCustomer.email} />
                              </div>
                              <Button className="w-full">Update Customer</Button>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
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