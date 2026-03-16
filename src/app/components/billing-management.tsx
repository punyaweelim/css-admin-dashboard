import { useState, useEffect } from "react";
import { Receipt, Search, Filter, Download, CheckCircle, XCircle, Eye, Tag, ChevronLeft, ChevronRight } from "lucide-react";
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
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { anuphanBase64 } from "@/app/utils/fonts";

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
  receiptAddress?: string;
  taxId?: string;
  items: BillItem[];
  amount: number;
  tax: number;
  totalDiscount: number;
  total: number;
  promotions: { name: string; freeQuantity: number; discount: number }[];
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

const ITEMS_PER_PAGE = 10;

import { api } from "@/app/utils/api";
import { toast } from "sonner";

export function BillingManagement() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [billingStats, setBillingStats] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchBills = async () => {
    setIsLoading(true);
    try {
      const [billsRes, statsRes] = await Promise.all([
        api.get<any>("/bills?limit=1000"),
        api.get<any>("/bills/stats"),
      ]);
      setBills(billsRes.data || []);
      setBillingStats(statsRes);
    } catch (err) {
      toast.error("Failed to fetch billing data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const filteredBills = bills.filter((bill) => {
    const matchesSearch =
      bill.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || bill.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredBills.length / ITEMS_PER_PAGE);
  const paginatedBills = filteredBills.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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

  const handleMarkAsPaid = async (billId: string) => {
    try {
      await api.patch(`/bills/${billId}/mark-paid`, {
        paymentMethod: "Bank Transfer"
      });
      toast.success("Bill marked as paid");
      fetchBills();
    } catch (err: any) {
      toast.error(err.message || "Failed to update bill");
    }
  };

  const handleCancelBill = async (billId: string) => {
    try {
      await api.patch(`/bills/${billId}/cancel`, {});
      toast.success("Bill cancelled");
      fetchBills();
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel bill");
    }
  };

  const handleDownloadPDF = (bill: Bill) => {
    const doc = new jsPDF();
    
    // Register Anuphan font to support Thai characters
    doc.addFileToVFS("Anuphan-Regular.ttf", anuphanBase64);
    doc.addFont("Anuphan-Regular.ttf", "Anuphan", "normal");
    doc.setFont("Anuphan");

    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(20);
    doc.text("INVOICE", 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("LINE@ Admin Dashboard", 14, 28);
    doc.text("Bulk Order Management System", 14, 33);

    // Invoice Info
    doc.setTextColor(0);
    doc.setFontSize(10);
    doc.text(`Invoice ID: ${bill.id}`, pageWidth - 14, 22, { align: "right" });
    doc.text(`Order ID: ${bill.orderId}`, pageWidth - 14, 27, { align: "right" });
    doc.text(`Date: ${new Date(bill.issuedDate).toLocaleDateString('th-TH')}`, pageWidth - 14, 32, { align: "right" });
    doc.text(`Due Date: ${new Date(bill.dueDate).toLocaleDateString('th-TH')}`, pageWidth - 14, 37, { align: "right" });

    // Customer Info
    doc.setFontSize(12);
    doc.text("BILL TO / ลูกค้า:", 14, 50);
    doc.setFontSize(10);
    doc.text(`${bill.customerName}`, 14, 56);

    let currentY = 61;
    if (bill.taxId) {
      doc.text(`Tax ID: ${bill.taxId}`, 14, currentY);
      currentY += 5;
    }

    if (bill.receiptAddress) {
      const splitAddress = doc.splitTextToSize(bill.receiptAddress, 80);
      doc.text(splitAddress, 14, currentY);
      currentY += (splitAddress.length * 5);
    }

    doc.text(`Customer ID: ${bill.customerId}`, 14, currentY);
    doc.text(`Account: ${bill.lineAccount}`, 14, currentY + 5);

    // Status
    doc.setFontSize(10);
    doc.text(`Status: ${bill.status.toUpperCase()}`, pageWidth - 14, 56, { align: "right" });
    if (bill.paidDate) {
      doc.text(`Paid Date: ${new Date(bill.paidDate).toLocaleDateString('th-TH')}`, pageWidth - 14, 61, { align: "right" });
      doc.text(`Method: ${bill.paymentMethod || "-"}`, pageWidth - 14, 66, { align: "right" });
    }

    // Items Table
    const tableData = bill.items.map((item) => [
      item.productName,
      item.sku,
      item.quantity.toString(),
      `฿${(item.unitPrice || 0).toLocaleString()}`,
      `-฿${(item.discount || 0).toLocaleString()}`,
      `฿${(item.subtotal || 0).toLocaleString()}`,
    ]);

    autoTable(doc, {
      startY: 80,
      head: [["Product", "SKU", "Qty", "Unit Price", "Discount", "Subtotal"]],
      body: tableData,
      theme: "striped",
      styles: { font: "Anuphan" },
      headStyles: { fillColor: [0, 0, 0], font: "Anuphan" },
      bodyStyles: { font: "Anuphan" },
      footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: "normal", font: "Anuphan" },
      foot: [
        ["", "", "", "", "รวม / Subtotal:", `${(bill.amount || 0).toLocaleString()} THB`],
        ["", "", "", "", "ส่วนลดพื้นฐาน / Discount:", `-${(bill.totalDiscount || 0).toLocaleString()} THB`],
        ...((bill.promotions || []).map(p => ["", "", "", "", `PROMO: ${p.name}:`, `+${(p.freeQuantity || 0).toLocaleString()} FREE`])),
        ...(bill.tax > 0 ? [["", "", "", "", "ภาษี / Tax (7%):", `${(bill.tax || 0).toLocaleString()} THB`]] : []),
        ["", "", "", "", "ยอดสุทธิ / Grand Total:", `${(bill.total || 0).toLocaleString()} THB`],
      ],
      });

    // Footer
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.setFont("Anuphan"); // Ensure font is set correctly for Thai characters in footer
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text("Thank you for your business! / ขอบคุณที่ใช้บริการ", pageWidth / 2, finalY, { align: "center" });
    doc.text("This is a computer-generated document.", pageWidth / 2, finalY + 5, { align: "center" });

    doc.save(`Invoice_${bill.id}.pdf`);
    toast.success("Invoice PDF generated successfully with Thai support");
  };

  if (isLoading && bills.length === 0) {
    return <div className="flex justify-center py-12">Loading billing data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">฿{billingStats?.totalRevenue?.toLocaleString() || "0"}</div>
            <p className="text-xs text-muted-foreground mt-1">From paid bills</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{billingStats?.paid || "0"}</div>
            <p className="text-xs text-muted-foreground mt-1">Bills completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{billingStats?.pending || "0"}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting payment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{billingStats?.overdue || "0"}</div>
            <p className="text-xs text-muted-foreground mt-1">Past due date</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Pending Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">฿{billingStats?.pendingAmount?.toLocaleString() || "0"}</div>
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
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v); setCurrentPage(1); }}>
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
        <CardContent className="p-0">
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
                {bills.some(b => (b.tax || 0) > 0) && <TableHead>Tax (7%)</TableHead>}
                <TableHead>Total</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedBills.map((bill) => (
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
                      <span className="mr-1">{tierInfo[bill.customerTier]?.emoji || "👤"}</span>
                      {tierInfo[bill.customerTier]?.name || bill.customerTier}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div>{bill.items?.length || 0} items</div>
                      {(bill.promotions || []).length > 0 && (
                        <div className="flex flex-col gap-1 mt-1">
                          {bill.promotions.map((p, i) => (
                            <Badge key={i} variant="secondary" className="text-[8px] h-4 px-1 bg-blue-50 text-blue-700 border-blue-100 uppercase font-black">
                              {p.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>฿{(bill.amount || 0).toLocaleString()}</TableCell>
                  <TableCell className="text-green-600">
                    -฿{(bill.totalDiscount || 0).toLocaleString()}
                  </TableCell>
                  {bills.some(b => (b.tax || 0) > 0) && (
                    <TableCell>
                      {(bill.tax || 0) > 0 ? `฿${bill.tax.toLocaleString()}` : "-"}
                    </TableCell>
                  )}
                  <TableCell className="font-semibold">
                    ฿{(bill.total || 0).toLocaleString()}
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
                                  {selectedBill.taxId && (
                                    <p className="text-xs text-muted-foreground font-mono">Tax ID: {selectedBill.taxId}</p>
                                  )}
                                  <p className="flex items-center gap-2">
                                    <Badge variant="outline">
                                      <span className="mr-1">{tierInfo[selectedBill.customerTier].emoji}</span>
                                      {tierInfo[selectedBill.customerTier].name}
                                    </Badge>
                                  </p>
                                  {selectedBill.receiptAddress && (
                                    <div className="mt-2 p-2 bg-white rounded border border-gray-100 text-xs text-gray-500 whitespace-pre-wrap">
                                      {selectedBill.receiptAddress}
                                    </div>
                                  )}
                                  <p className="text-muted-foreground mt-1">Account: {selectedBill.lineAccount}</p>
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
                                        <TableCell className="text-right">฿{(item.unitPrice || 0).toLocaleString()}</TableCell>
                                        <TableCell className="text-right text-green-600">
                                          -฿{(item.discount || 0).toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-right font-semibold">
                                          ฿{(item.subtotal || 0).toLocaleString()}
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
                                    <span className="font-semibold">฿{(selectedBill.amount || 0).toLocaleString()}</span>
                                  </div>

                                  {/* Promotions Display */}
                                  {(selectedBill.promotions || []).map((promo, idx) => (
                                    <div key={idx} className="flex justify-between text-sm text-blue-600 font-medium">
                                      <span className="flex items-center gap-1"><Tag className="h-3 w-3" /> {promo.name}:</span>
                                      <span>+{(promo.freeQuantity || 0).toLocaleString()} Free</span>
                                    </div>
                                  ))}

                                  {(selectedBill.totalDiscount || 0) > 0 && (
                                    <div className="flex justify-between text-sm text-green-600 border-t border-dashed border-gray-200 pt-1 mt-1">
                                      <span className="font-bold">Total Savings:</span>
                                      <span className="font-bold">-฿{(selectedBill.totalDiscount || 0).toLocaleString()}</span>
                                    </div>
                                  )}
                                  {(selectedBill.tax || 0) > 0 && (
                                    <div className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">Tax (7%):</span>
                                      <span className="font-semibold">฿{selectedBill.tax.toLocaleString()}</span>
                                    </div>
                                  )}
                                  <div className="flex justify-between text-xl font-bold border-t border-border pt-2">
                                    <span>Total Amount:</span>
                                    <span>฿{(selectedBill.total || 0).toLocaleString()}</span>
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
                      <Button variant="ghost" size="sm" title="Download Invoice" onClick={() => handleDownloadPDF(bill)}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination UI */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-50">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredBills.length)} of {filteredBills.length}
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
        </CardContent>
      </Card>
    </div>
  );
}
