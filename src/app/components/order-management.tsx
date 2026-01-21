import { useState } from "react";
import { Package, Search, Filter, Eye, Edit, Trash2 } from "lucide-react";
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

const mockOrders: Order[] = [
  {
    id: "ORD-001",
    customerName: "สมชาย ใจดี",
    lineId: "LINE-123456",
    lineAccount: "ตองสามเมล็ดพันธุ์",
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
    lineAccount: "สามเอเมล็ดพันธุ์",
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
    lineAccount: "สี่ทิศเมล็ดพันธุ์",
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
    lineAccount: "ตองสามเมล็ดพันธุ์",
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
    lineAccount: "สามเอเมล็ดพันธุ์",
    products: ["Product A"],
    quantity: 50,
    totalAmount: 15000,
    status: "cancelled",
    orderDate: "2026-01-16",
  },
];

export function OrderManagement() {
  const [orders] = useState<Order[]>(mockOrders);
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
                <SelectItem value="ตองสามเมล็ดพันธุ์">ตองสามเมล็ดพันธุ์</SelectItem>
                <SelectItem value="สามเอเมล็ดพันธุ์">สามเอเมล็ดพันธุ์</SelectItem>
                <SelectItem value="สี่ทิศเมล็ดพันธุ์">สี่ทิศเมล็ดพันธุ์</SelectItem>
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
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Order Details: {selectedOrder?.id}</DialogTitle>
                          </DialogHeader>
                          {selectedOrder && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-muted-foreground">Customer</p>
                                  <p className="font-medium">{selectedOrder.customerName}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">LINE ID</p>
                                  <p className="font-mono text-sm">{selectedOrder.lineId}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Account</p>
                                  <p className="font-medium">{selectedOrder.lineAccount}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Status</p>
                                  <Badge className={getStatusColor(selectedOrder.status)}>
                                    {selectedOrder.status}
                                  </Badge>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Quantity</p>
                                  <p className="font-medium">{selectedOrder.quantity}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Total Amount</p>
                                  <p className="font-medium">
                                    ฿{selectedOrder.totalAmount.toLocaleString()}
                                  </p>
                                </div>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground mb-2">Products</p>
                                <ul className="list-disc list-inside space-y-1">
                                  {selectedOrder.products.map((product, idx) => (
                                    <li key={idx}>{product}</li>
                                  ))}
                                </ul>
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
