import { useState } from "react";
import { Receipt, Search, Filter, Download, CheckCircle, XCircle } from "lucide-react";
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

interface Bill {
  id: string;
  orderId: string;
  customerName: string;
  lineAccount: string;
  amount: number;
  tax: number;
  total: number;
  status: "paid" | "pending" | "overdue" | "cancelled";
  dueDate: string;
  paidDate?: string;
  paymentMethod?: string;
}

const mockBills: Bill[] = [
  {
    id: "INV-001",
    orderId: "ORD-001",
    customerName: "สมชาย ใจดี",
    lineAccount: "Store Account 1",
    amount: 45000,
    tax: 3150,
    total: 48150,
    status: "pending",
    dueDate: "2026-01-25",
  },
  {
    id: "INV-002",
    orderId: "ORD-002",
    customerName: "สมหญิง รักสวย",
    lineAccount: "Store Account 2",
    amount: 80000,
    tax: 5600,
    total: 85600,
    status: "paid",
    dueDate: "2026-01-24",
    paidDate: "2026-01-20",
    paymentMethod: "Bank Transfer",
  },
  {
    id: "INV-003",
    orderId: "ORD-003",
    customerName: "วิชัย ประเสริฐ",
    lineAccount: "Store Account 3",
    amount: 35000,
    tax: 2450,
    total: 37450,
    status: "paid",
    dueDate: "2026-01-23",
    paidDate: "2026-01-19",
    paymentMethod: "Credit Card",
  },
  {
    id: "INV-004",
    orderId: "ORD-004",
    customerName: "นภา สุขใจ",
    lineAccount: "Store Account 1",
    amount: 120000,
    tax: 8400,
    total: 128400,
    status: "pending",
    dueDate: "2026-01-22",
  },
  {
    id: "INV-005",
    orderId: "ORD-005",
    customerName: "ธนา มั่งมี",
    lineAccount: "Store Account 2",
    amount: 15000,
    tax: 1050,
    total: 16050,
    status: "cancelled",
    dueDate: "2026-01-21",
  },
  {
    id: "INV-006",
    orderId: "ORD-006",
    customerName: "สุชาติ เจริญ",
    lineAccount: "Store Account 1",
    amount: 60000,
    tax: 4200,
    total: 64200,
    status: "overdue",
    dueDate: "2026-01-15",
  },
];

export function BillingManagement() {
  const [bills] = useState<Bill[]>(mockBills);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredBills = bills.filter((bill) => {
    const matchesSearch =
      bill.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || bill.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-black text-white";
      case "pending":
        return "bg-gray-400 text-white";
      case "overdue":
        return "bg-gray-600 text-white";
      case "cancelled":
        return "bg-white text-black border border-black";
      default:
        return "bg-gray-200 text-black";
    }
  };

  const stats = {
    totalRevenue: bills
      .filter((b) => b.status === "paid")
      .reduce((sum, b) => sum + b.total, 0),
    pending: bills.filter((b) => b.status === "pending").length,
    paid: bills.filter((b) => b.status === "paid").length,
    overdue: bills.filter((b) => b.status === "overdue").length,
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">฿{stats.totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.paid}</div>
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
            <CardTitle className="text-sm">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overdue}</div>
          </CardContent>
        </Card>
      </div>

      {/* Bills Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Billing Management
            </CardTitle>
          </div>
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search invoices, orders, customers..."
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
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Tax (7%)</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBills.map((bill) => (
                <TableRow key={bill.id}>
                  <TableCell className="font-mono">{bill.id}</TableCell>
                  <TableCell className="font-mono">{bill.orderId}</TableCell>
                  <TableCell>{bill.customerName}</TableCell>
                  <TableCell>{bill.lineAccount}</TableCell>
                  <TableCell>฿{bill.amount.toLocaleString()}</TableCell>
                  <TableCell>฿{bill.tax.toLocaleString()}</TableCell>
                  <TableCell className="font-semibold">
                    ฿{bill.total.toLocaleString()}
                  </TableCell>
                  <TableCell>{bill.dueDate}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(bill.status)} variant="secondary">
                      {bill.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {bill.status === "pending" && (
                        <>
                          <Button variant="ghost" size="sm" title="Mark as Paid">
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" title="Cancel">
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button variant="ghost" size="sm" title="Download Invoice">
                        <Download className="h-4 w-4" />
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
