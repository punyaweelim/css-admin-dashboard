import { useState } from "react";
import { Users, Search, UserPlus, Edit, Trash2 } from "lucide-react";
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
  },
];

export function CustomerManagement() {
  const [customers] = useState<Customer[]>(mockCustomers);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

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
                <TableRow key={customer.id}>
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
                    <div className="flex gap-2">
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
