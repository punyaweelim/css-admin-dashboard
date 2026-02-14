import { useState, useEffect } from "react";
import { Receipt, Search, Filter, Download, CheckCircle, XCircle, Eye } from "lucide-react";
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

type CustomerTier = "bronze" | "silver" | "gold" | "platinum";

interface BillItem {
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  subtotal: number;
}

interface Bill {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  customerTier: CustomerTier;
  lineAccount: string;
  items: BillItem[];
  amount: number;
  tax: number;
  totalDiscount: number;
  total: number;
  status: "paid" | "pending" | "overdue" | "cancelled";
  dueDate: string;
  paidDate?: string;
  paymentMethod?: string;
  issuedDate: string;
}

const tierInfo: Record<CustomerTier, { emoji: string; name: string }> = {
  bronze: { emoji: "🥉", name: "Bronze" },
  silver: { emoji: "🥈", name: "Silver" },
  gold: { emoji: "🥇", name: "Gold" },
  platinum: { emoji: "💎", name: "Platinum" },
};

const mockBills: Bill[] = [
  {
    id: "INV-001",
    orderId: "ORD-001",
    customerId: "CUST-001",
    customerName: "สมชาย ใจดี",
    customerTier: "gold",
    lineAccount: "Store Account 1",
    items: [
      {
        productName: "Product A - Premium Electronics",
        sku: "SKU-A001",
        quantity: 100,
        unitPrice: 260,
        discount: 4000,
        subtotal: 26000,
      },
      {
        productName: "Product B - Home & Garden",
        sku: "SKU-B002",
        quantity: 150,
        unitPrice: 130,
        discount: 3000,
        subtotal: 19500,
      },
    ],
    amount: 45500,
    tax: 3185,
    totalDiscount: 7000,
    total: 48685,
    status: "pending",
    dueDate: "2026-02-20",
    issuedDate: "2026-01-20",
  },
  {
    id: "INV-002",
    orderId: "ORD-002",
    customerId: "CUST-002",
    customerName: "สมหญิง รักสวย",
    customerTier: "platinum",
    lineAccount: "Store Account 2",
    items: [
      {
        productName: "Product C - Fashion Accessories",
        sku: "SKU-C003",
        quantity: 100,
        unitPrice: 325,
        discount: 7500,
        subtotal: 32500,
      },
    ],
    amount: 32500,
    tax: 2275,
    totalDiscount: 7500,
    total: 34775,
    status: "paid",
    dueDate: "2026-02-19",
    paidDate: "2026-01-20",
    paymentMethod: "Bank Transfer",
    issuedDate: "2026-01-19",
  },
  {
    id: "INV-003",
    orderId: "ORD-003",
    customerId: "CUST-003",
    customerName: "วิชัย ประเสริฐ",
    customerTier: "silver",
    lineAccount: "Store Account 3",
    items: [
      {
        productName: "Product A - Premium Electronics",
        sku: "SKU-A001",
        quantity: 50,
        unitPrice: 280,
        discount: 1000,
        subtotal: 14000,
      },
    ],
    amount: 14000,
    tax: 980,
    totalDiscount: 1000,
    total: 14980,
    status: "paid",
    dueDate: "2026-02-18",
    paidDate: "2026-01-19",
    paymentMethod: "Credit Card",
    issuedDate: "2026-01-18",
  },
  {
    id: "INV-004",
    orderId: "ORD-004",
    customerId: "CUST-001",
    customerName: "สมชาย ใจดี",
    customerTier: "gold",
    lineAccount: "Store Account 1",
    items: [
      {
        productName: "Product E - Smart Gadgets",
        sku: "SKU-E005",
        quantity: 60,
        unitPrice: 440,
        discount: 3600,
        subtotal: 26400,
      },
    ],
    amount: 26400,
    tax: 1848,
    totalDiscount: 3600,
    total: 28248,
    status: "overdue",
    dueDate: "2026-01-10",
    issuedDate: "2025-12-10",
  },
];

export function BillingManagement() {
  const [bills, setBills] = useState<Bill[]>(mockBills);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  // This function would be called from OrderManagement when a new order is created
  const addBillFromOrder = (order: any) => {
    const newBill: Bill = {
      id: `INV-${String(bills.length + 1).padStart(3, "0")}`,
      orderId: order.id,
      customerId: order.customerId,
      customerName: order.customerName,
      customerTier: order.customerTier,
      lineAccount: order.lineAccount,
      items: order.items.map((item: any) => ({
        productName: item.productName,
        sku: item.sku,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        subtotal: item.subtotal,
      })),
      amount: order.subtotal,
      tax: order.tax,
      totalDiscount: order.totalDiscount,
      total: order.totalAmount,
      status: "pending",
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 30 days from now
      issuedDate: order.orderDate,
    };
    setBills([newBill, ...bills]);
  };

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
        return "bg-red-600 text-white";
      case "cancelled":
        return "bg-white text-black border border-black";
      default:
        return "bg-gray-200 text-black";
    }
  };

  const handleMarkAsPaid = (billId: string) => {
    setBills(
      bills.map((bill) =>
        bill.id === billId
          ? {
              ...bill,
              status: "paid" as const,
              paidDate: new Date().toISOString().split("T")[0],
              paymentMethod: "Bank Transfer",
            }
          : bill
      )
    );
  };

  const handleCancelBill = (billId: string) => {
    setBills(
      bills.map((bill) =>
        bill.id === billId ? { ...bill, status: "cancelled" as const } : bill
      )
    );
  };

  const stats = {
    totalRevenue: bills
      .filter((b) => b.status === "paid")
      .reduce((sum, b) => sum + b.total, 0),
    pending: bills.filter((b) => b.status === "pending").length,
    paid: bills.filter((b) => b.status === "paid").length,
    overdue: bills.filter((b) => b.status === "overdue").length,
    pendingAmount: bills
      .filter((b) => b.status === "pending")
      .reduce((sum, b) => sum + b.total, 0),
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">฿{stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">From paid bills</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.paid}</div>
            <p className="text-xs text-muted-foreground mt-1">Bills completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting payment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            <p className="text-xs text-muted-foreground mt-1">Past due date</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Pending Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">฿{stats.pendingAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">To be collected</p>
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
                <TableHead>Tier</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Discount</TableHead>
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
                  <TableCell>
                    <div>
                      <div className="font-semibold">{bill.customerName}</div>
                      <div className="text-xs text-muted-foreground">{bill.lineAccount}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      <span className="mr-1">{tierInfo[bill.customerTier].emoji}</span>
                      {tierInfo[bill.customerTier].name}
                    </Badge>
                  </TableCell>
                  <TableCell>{bill.items.length} items</TableCell>
                  <TableCell>฿{bill.amount.toLocaleString()}</TableCell>
                  <TableCell className="text-green-600">
                    -฿{bill.totalDiscount.toLocaleString()}
                  </TableCell>
                  <TableCell>฿{bill.tax.toLocaleString()}</TableCell>
                  <TableCell className="font-semibold">
                    ฿{bill.total.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div>{new Date(bill.dueDate).toLocaleDateString('th-TH')}</div>
                      {bill.status === "overdue" && (
                        <Badge variant="destructive" className="mt-1 text-xs">
                          Overdue
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(bill.status)} variant="secondary">
                      {bill.status}
                    </Badge>
                    {bill.paidDate && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Paid: {new Date(bill.paidDate).toLocaleDateString('th-TH')}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="View Details"
                            onClick={() => setSelectedBill(bill)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Invoice Details - {selectedBill?.id}</DialogTitle>
                          </DialogHeader>
                          {selectedBill && (
                            <div className="space-y-6">
                              {/* Invoice Header */}
                              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                                <div>
                                  <p className="text-xs text-muted-foreground">Invoice Number</p>
                                  <p className="font-bold font-mono">{selectedBill.id}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Order Reference</p>
                                  <p className="font-semibold font-mono">{selectedBill.orderId}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Issued Date</p>
                                  <p className="font-semibold">{new Date(selectedBill.issuedDate).toLocaleDateString('th-TH')}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Due Date</p>
                                  <p className="font-semibold">{new Date(selectedBill.dueDate).toLocaleDateString('th-TH')}</p>
                                </div>
                              </div>

                              {/* Customer Info */}
                              <div className="p-4 bg-gray-50 rounded-lg">
                                <h3 className="font-semibold mb-2">Bill To</h3>
                                <div className="space-y-1 text-sm">
                                  <p className="font-semibold">{selectedBill.customerName}</p>
                                  <p className="flex items-center gap-2">
                                    <Badge variant="outline">
                                      <span className="mr-1">{tierInfo[selectedBill.customerTier].emoji}</span>
                                      {tierInfo[selectedBill.customerTier].name}
                                    </Badge>
                                  </p>
                                  <p className="text-muted-foreground">Account: {selectedBill.lineAccount}</p>
                                </div>
                              </div>

                              {/* Items */}
                              <div>
                                <h3 className="font-semibold mb-3">Items</h3>
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Product</TableHead>
                                      <TableHead className="text-right">Qty</TableHead>
                                      <TableHead className="text-right">Unit Price</TableHead>
                                      <TableHead className="text-right">Discount</TableHead>
                                      <TableHead className="text-right">Subtotal</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {selectedBill.items.map((item, index) => (
                                      <TableRow key={index}>
                                        <TableCell>
                                          <div>
                                            <p className="font-semibold">{item.productName}</p>
                                            <p className="text-xs text-muted-foreground">{item.sku}</p>
                                          </div>
                                        </TableCell>
                                        <TableCell className="text-right">{item.quantity}</TableCell>
                                        <TableCell className="text-right">฿{item.unitPrice.toLocaleString()}</TableCell>
                                        <TableCell className="text-right text-green-600">
                                          -฿{item.discount.toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-right font-semibold">
                                          ฿{item.subtotal.toLocaleString()}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>

                              {/* Summary */}
                              <div className="border-t border-border pt-4">
                                <div className="space-y-2 max-w-sm ml-auto">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal:</span>
                                    <span className="font-semibold">฿{selectedBill.amount.toLocaleString()}</span>
                                  </div>
                                  {selectedBill.totalDiscount > 0 && (
                                    <div className="flex justify-between text-sm text-green-600">
                                      <span>Total Discount:</span>
                                      <span className="font-semibold">-฿{selectedBill.totalDiscount.toLocaleString()}</span>
                                    </div>
                                  )}
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Tax (7%):</span>
                                    <span className="font-semibold">฿{selectedBill.tax.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between text-xl font-bold border-t border-border pt-2">
                                    <span>Total Amount:</span>
                                    <span>฿{selectedBill.total.toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Payment Info */}
                              {selectedBill.status === "paid" && selectedBill.paymentMethod && (
                                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                  <div className="flex items-center gap-2 text-green-700">
                                    <CheckCircle className="h-5 w-5" />
                                    <div>
                                      <p className="font-semibold">Payment Received</p>
                                      <p className="text-sm">
                                        Paid on {new Date(selectedBill.paidDate!).toLocaleDateString('th-TH')} via {selectedBill.paymentMethod}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      {bill.status === "pending" && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Mark as Paid"
                            onClick={() => handleMarkAsPaid(bill.id)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Cancel"
                            onClick={() => handleCancelBill(bill.id)}
                          >
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
