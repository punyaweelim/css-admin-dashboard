import { useState } from "react";
import { Users, Search, UserPlus, Edit, Trash2, ArrowLeft, ShoppingCart, TrendingUp, Award } from "lucide-react";
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

type CustomerTier = "bronze" | "silver" | "gold" | "platinum";

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
  tier: CustomerTier;
  totalOrders: number;
  totalSpent: number;
  registeredDate: string;
  status: "active" | "inactive";
  recentOrders?: Order[];
  topProducts?: { name: string; quantity: number; times: number }[];
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
    tier: "platinum",
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
    tier: "silver",
    totalOrders: 3,
    totalSpent: 85000,
    registeredDate: "2025-12-01",
    status: "active",
    recentOrders: [
      {
        id: "ORD-005",
        date: "2025-12-01",
        products: ["Product G"],
        quantity: 2,
        amount: 40000,
        status: "completed",
      },
    ],
    topProducts: [
      {
        name: "Product G",
        quantity: 8,
        times: 2,
      },
    ],
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
    registeredDate: "2026-01-10",
    status: "active",
    recentOrders: [
      {
        id: "ORD-006",
        date: "2026-01-10",
        products: ["Product H"],
        quantity: 1,
        amount: 25000,
        status: "completed",
      },
    ],
    topProducts: [
      {
        name: "Product H",
        quantity: 3,
        times: 1,
      },
    ],
  },
];

export function CustomerManagement() {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

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
      registeredDate: new Date().toISOString().split("T")[0],
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
                  {new Date(selectedCustomer.registeredDate).toLocaleDateString()}
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
            <div className="grid grid-cols-2 gap-4">
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
            </div>

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedCustomer.recentOrders?.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg"
                    >
                      <div>
                        <p className="font-semibold">{order.id}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.date).toLocaleDateString()}
                        </p>
                        <p className="text-sm mt-1">{order.products.join(", ")}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">฿{order.amount.toLocaleString()}</p>
                        <Badge variant="outline">{order.status}</Badge>
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
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-semibold">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Ordered {product.times} times
                        </p>
                      </div>
                      <Badge variant="secondary">{product.quantity} units</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
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
                <TableRow
                  key={customer.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => setSelectedCustomer(customer)}
                >
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
