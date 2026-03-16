import { useState, useEffect, useMemo } from "react";
import {
  Users,
  Search,
  UserPlus,
  Edit,
  Trash2,
  ArrowLeft,
  ShoppingCart,
  TrendingUp,
  Award,
  ExternalLink,
  Tag,
  Plus,
  X,
  Check,
  Pencil,
  Loader2,
  Image as ImageIcon,
  History,
  Repeat,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
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
import { Checkbox } from "@/app/components/ui/checkbox";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import { api } from "@/app/utils/api";
import { toast } from "sonner";
import { Textarea } from "@/app/components/ui/textarea"

type CustomerTier = "bronze" | "silver" | "gold" | "platinum";

interface OrderItem {
  productId: string;
  productName: string;
  sku: string;
  category: string;
  imageUrl: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface Order {
  id: string;
  customerId: string;
  customerName: string;
  lineId: string;
  lineAccount: string;
  storeId: string;
  items: OrderItem[];
  quantity: number;
  totalAmount: number;
  status: string;
  orderDate: string;
  notes?: string;
}

interface StoreAccess {
  storeId: string;
  storeName: string;
  tier: CustomerTier;
}

interface CustomProductPrice {
  productId: string;
  productName: string;
  sku: string;
  imageUrl?: string;
  originalPrice: number;
  customPrice: number;
  note?: string;
}

interface Customer {
  id: string;
  name: string;
  lineId: string;
  storeAccess: StoreAccess[];
  phone: string;
  email: string;
  receiptAddress?: string;
  taxId?: string;
  defaultWithTax?: boolean;
  totalOrders: number;
  totalSpent: number;
  registeredDate: string;
  status: "active" | "inactive";
  customPrices?: CustomProductPrice[];
}

const tierInfo: Record<CustomerTier, { emoji: string; name: string; color: string; bg: string }> = {
  bronze: { emoji: "🥉", name: "Bronze", color: "text-orange-700", bg: "bg-orange-100" },
  silver: { emoji: "🥈", name: "Silver", color: "text-gray-700", bg: "bg-gray-100" },
  gold: { emoji: "🥇", name: "Gold", color: "text-yellow-700", bg: "bg-yellow-100" },
  platinum: { emoji: "💎", name: "Platinum", color: "text-purple-700", bg: "bg-purple-100" },
};

const availableStores = [
  { id: "3a", name: "Store 3A" },
  { id: "tong3", name: "Store Tong 3" },
  { id: "4thit", name: "Store 4Thit" },
];

const ITEMS_PER_PAGE = 10;

// ─────────────────────────────────────────────────────────────
// Sub-component: Customer Form
// ─────────────────────────────────────────────────────────────
interface CustomerFormProps {
  customer?: Customer;
  onCancel: () => void;
  onSubmit: (data: any) => void;
}

function CustomerForm({ customer, onCancel, onSubmit }: CustomerFormProps) {
  const [formStoreAccess, setFormStoreAccess] = useState<StoreAccess[]>([]);
  const [defaultWithTax, setDefaultWithTax] = useState<boolean>(customer?.defaultWithTax || false);

  useEffect(() => {
    if (customer) {
      setFormStoreAccess(customer.storeAccess || []);
      setDefaultWithTax(!!customer.defaultWithTax);
    } else {
      setFormStoreAccess([]);
      setDefaultWithTax(false);
    }
  }, [customer]);

  const toggleStoreAccess = (storeId: string, storeName: string) => {
    setFormStoreAccess((prev) => {
      const exists = prev.find((sa) => sa.storeId === storeId);
      if (exists) {
        return prev.filter((sa) => sa.storeId !== storeId);
      }
      return [...prev, { storeId, storeName, tier: "bronze" }];
    });
  };

  const updateTier = (storeId: string, tier: CustomerTier) => {
    setFormStoreAccess((prev) =>
      prev.map((sa) => (sa.storeId === storeId ? { ...sa, tier } : sa))
    );
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      lineId: formData.get("lineId") as string,
      storeAccess: formStoreAccess,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      receiptAddress: formData.get("receiptAddress") as string,
      taxId: formData.get("taxId") as string,
      defaultWithTax: defaultWithTax,
      status: customer ? (customer.status) : "active",
    };
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" name="name" defaultValue={customer?.name} required />
        </div>
        <div>
          <Label htmlFor="lineId">LINE ID</Label>
          <Input id="lineId" name="lineId" defaultValue={customer?.lineId} required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label htmlFor="phone">Phone</Label><Input id="phone" name="phone" defaultValue={customer?.phone} required /></div>
        <div><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" defaultValue={customer?.email} required /></div>
      </div>
      <div>
        <Label htmlFor="taxId">Taxpayer Identification Number (Tax ID)</Label>
        <Input id="taxId" name="taxId" defaultValue={customer?.taxId} placeholder="e.g. 1234567890123" />
      </div>
      <div>
        <Label htmlFor="receiptAddress">Receipt Address</Label>
        <Textarea id="receiptAddress" name="receiptAddress" defaultValue={customer?.receiptAddress} placeholder="Enter full address for billing..." rows={3} />
      </div>
      <div className="flex items-center space-x-2 bg-gray-50 p-4 rounded-xl border border-gray-100">
        <Checkbox id="defaultWithTax" checked={defaultWithTax} onCheckedChange={(checked) => setDefaultWithTax(!!checked)} />
        <div className="grid gap-1.5 leading-none">
          <label htmlFor="defaultWithTax" className="text-sm font-bold leading-none cursor-pointer">
            Default VAT Calculation
          </label>
          <p className="text-[10px] text-muted-foreground font-medium">
            Automatically check "Calculate VAT (7%)" when processing orders for this customer.
          </p>
        </div>
      </div>
      <div>
        <Label className="mb-2 block">Store Access & Tier</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {availableStores.map((store) => {
            const access = formStoreAccess.find((sa) => sa.storeId === store.id);
            return (
              <div
                key={store.id}
                className={`p-3 rounded-xl border-2 transition-all ${
                  access ? "border-black bg-black/5 shadow-sm" : "border-gray-100 bg-gray-50/50"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Checkbox
                    id={`store-${store.id}`}
                    checked={!!access}
                    onCheckedChange={() => toggleStoreAccess(store.id, store.name)}
                    className="data-[state=checked]:bg-black data-[state=checked]:border-black"
                  />
                  <Label htmlFor={`store-${store.id}`} className="font-bold text-xs cursor-pointer">
                    {store.name}
                  </Label>
                </div>
                {access && (
                  <Select
                    value={access.tier}
                    onValueChange={(v) => updateTier(store.id, v as CustomerTier)}
                  >
                    <SelectTrigger className="h-8 text-[10px] bg-white border-black/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-black">
                      <SelectItem value="bronze">🥉 Bronze</SelectItem>
                      <SelectItem value="silver">🥈 Silver</SelectItem>
                      <SelectItem value="gold">🥇 Gold</SelectItem>
                      <SelectItem value="platinum">💎 Platinum</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="bg-black text-white">
          {customer ? "Update Customer" : "Add Customer"}
        </Button>
      </div>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────
export function CustomerManagement() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditingDialogOpen] = useState(false);
  const [isCustomPriceDialogOpen, setIsCustomPriceDialogOpen] = useState(false);
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchCustomers();
    fetchProducts();
  }, []);

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<any>("/customers?limit=1000");
      setCustomers(res.data || []);
    } catch (err) {
      toast.error("Failed to fetch customers");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get<any>("/products?limit=1000");
      setProducts(res.data || []);
    } catch (err) {
      console.error("Failed to fetch products");
    }
  };

  const fetchOrderHistory = async (customerId: string) => {
    setIsLoadingHistory(true);
    try {
      const res = await api.get<any>(`/orders?customerId=${customerId}`);
      setOrderHistory(res.data || []);
    } catch (err) {
      toast.error("Failed to fetch order history");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleAddCustomer = async (data: any) => {
    try {
      await api.post("/customers", data);
      setIsAddDialogOpen(false);
      fetchCustomers();
      toast.success("Customer added successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to add customer");
    }
  };

  const handleUpdateCustomer = async (data: any) => {
    if (!selectedCustomer) return;
    try {
      await api.put(`/customers/${selectedCustomer.id}`, data);
      setIsEditingDialogOpen(false);
      const updated = await api.get<any>(`/customers/${selectedCustomer.id}`);
      setSelectedCustomer(updated.data);
      fetchCustomers();
      toast.success("Customer updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to update customer");
    }
  };

  const handleToggleStatus = async (customer: Customer) => {
    try {
      const newStatus = customer.status === "active" ? "inactive" : "active";
      await api.put(`/customers/${customer.id}`, { status: newStatus });
      fetchCustomers();
      if (selectedCustomer?.id === customer.id) {
        setSelectedCustomer({ ...selectedCustomer, status: newStatus });
      }
      toast.success(`Customer status updated to ${newStatus}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    }
  };

  const handleUpdateCustomPrices = async (newPrices: CustomProductPrice[]) => {
    if (!selectedCustomer) return;
    try {
      const customPrices = newPrices.map(p => ({
        productId: p.productId,
        customPrice: p.customPrice,
        note: p.note
      }));
      await api.put(`/customers/${selectedCustomer.id}`, { customPrices });
      const updated = await api.get<any>(`/customers/${selectedCustomer.id}`);
      setSelectedCustomer(updated.data);
      fetchCustomers();
      toast.success("Custom prices updated");
    } catch (err: any) {
      toast.error(err.message || "Failed to update custom prices");
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.lineId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)]">
      {/* Left: Customer List */}
      <Card className={`flex-1 shadow-sm border-gray-100 flex flex-col overflow-hidden ${selectedCustomer ? 'hidden lg:flex' : ''}`}>
        <CardHeader className="border-b border-gray-50 bg-white sticky top-0 z-10">
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="text-xl font-black">Customer Directory</CardTitle>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-black text-white hover:bg-gray-800 rounded-xl px-4 h-10 shadow-lg shadow-black/20">
                  <UserPlus className="h-4 w-4 mr-2" /> Add New
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>Register New Customer</DialogTitle></DialogHeader>
                <CustomerForm onCancel={() => setIsAddDialogOpen(false)} onSubmit={handleAddCustomer} />
              </DialogContent>
            </Dialog>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers by name, LINE, or email..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="pl-10 h-11 bg-gray-50 border-gray-100 rounded-xl"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-2"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /><p className="text-sm text-muted-foreground">Loading customers...</p></div>
          ) : (
            <>
              <Table>
                <TableHeader className="bg-gray-50/50">
                  <TableRow>
                    <TableHead className="py-4">Customer</TableHead>
                    <TableHead>Access</TableHead>
                    <TableHead className="text-center">Orders</TableHead>
                    <TableHead>Spent</TableHead>
                    <TableHead className="text-right pr-6">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCustomers.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-12 text-muted-foreground">ไม่พบรายชื่อลูกค้า</TableCell></TableRow>
                  ) : (
                    paginatedCustomers.map((c) => (
                      <TableRow
                        key={c.id}
                        className={`cursor-pointer hover:bg-gray-50/50 transition-all ${
                          selectedCustomer?.id === c.id ? "bg-black/5" : ""
                        }`}
                        onClick={() => {
                          setSelectedCustomer(c);
                          fetchOrderHistory(c.id);
                        }}
                      >
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center text-xs font-black shadow-sm">
                              {c.name.substring(0, 2)}
                            </div>
                            <div>
                              <div className="font-bold text-black text-sm">{c.name}</div>
                              <div className="text-[10px] text-gray-400 font-mono tracking-tighter uppercase">{c.lineId}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {c.storeAccess.map((sa, i) => (
                              <Badge key={i} variant="outline" className={`text-[8px] font-black uppercase ${tierInfo[sa.tier].color} ${tierInfo[sa.tier].bg} border-0 h-4`}>
                                {sa.storeName.replace("Store Account ", "S")}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-bold text-xs">{c.totalOrders}</TableCell>
                        <TableCell className="font-black text-xs">฿{c.totalSpent.toLocaleString()}</TableCell>
                        <TableCell className="text-right pr-6">
                          <div
                            onClick={(e) => { e.stopPropagation(); handleToggleStatus(c); }}
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider cursor-pointer transition-all ${
                              c.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"
                            }`}
                          >
                            {c.status}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* Pagination UI */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-50 bg-white sticky bottom-0">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredCustomers.length)} of {filteredCustomers.length}
                  </p>
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-7 w-7 p-0 rounded-lg border-gray-100"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-3 w-3" />
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                      const isVisible = page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
                      if (!isVisible) return null;
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          className={`h-7 w-7 p-0 rounded-lg text-[10px] font-bold ${
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
                      className="h-7 w-7 p-0 rounded-lg border-gray-100"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Right: Detailed View */}
      {selectedCustomer ? (
        <Card className="flex-1 shadow-2xl border-black shadow-black/5 overflow-hidden flex flex-col bg-white">
          <CardHeader className="bg-black text-white p-6 sticky top-0 z-10">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10 lg:hidden"
                  onClick={() => setSelectedCustomer(null)}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-xl font-black border border-white/20">
                  {selectedCustomer.name.substring(0, 2)}
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight">{selectedCustomer.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="bg-green-400 text-black border-0 font-black text-[9px] uppercase h-5">
                      {selectedCustomer.status}
                    </Badge>
                    <p className="text-white/40 text-xs font-mono uppercase tracking-widest">
                      ID: {selectedCustomer.id}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditingDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="bg-white/5 border-white/20 text-white hover:bg-white/10 hover:text-white rounded-xl h-10 px-4">
                      <Pencil className="h-4 w-4 mr-2" /> Edit Info
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>Edit Customer Information</DialogTitle></DialogHeader>
                    <CustomerForm
                      customer={selectedCustomer}
                      onCancel={() => setIsEditingDialogOpen(false)}
                      onSubmit={handleUpdateCustomer}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0 overflow-y-auto flex-1">
            <div className="p-6 space-y-8">
              {/* Top Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-[2rem] p-5 border border-gray-100 flex flex-col items-center justify-center text-center group hover:bg-black hover:border-black transition-all duration-500 shadow-sm">
                  <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-md mb-3 group-hover:scale-110 group-hover:rotate-6 transition-all">
                    <ShoppingCart className="h-5 w-5 text-black" />
                  </div>
                  <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest group-hover:text-white/60">Total Orders</p>
                  <p className="text-3xl font-black text-black group-hover:text-white">{selectedCustomer.totalOrders}</p>
                </div>
                <div className="bg-gray-50 rounded-[2rem] p-5 border border-gray-100 flex flex-col items-center justify-center text-center group hover:bg-black hover:border-black transition-all duration-500 shadow-sm">
                  <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-md mb-3 group-hover:scale-110 group-hover:-rotate-6 transition-all">
                    <TrendingUp className="h-5 w-5 text-black" />
                  </div>
                  <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest group-hover:text-white/60">Total Spent</p>
                  <p className="text-2xl font-black text-black group-hover:text-white">฿{selectedCustomer.totalSpent.toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 rounded-[2rem] p-5 border border-gray-100 flex flex-col items-center justify-center text-center group hover:bg-black hover:border-black transition-all duration-500 shadow-sm col-span-2 md:col-span-1">
                  <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-md mb-3 group-hover:scale-110 transition-all">
                    <Calendar className="h-5 w-5 text-black" />
                  </div>
                  <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest group-hover:text-white/60">Joined Since</p>
                  <p className="text-sm font-black text-black group-hover:text-white">{new Date(selectedCustomer.registeredDate).toLocaleDateString("th-TH")}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Details Section */}
                <div className="space-y-6">
                  <Card className="shadow-sm border-gray-100">
                    <CardHeader className="pb-4 border-b border-gray-50"><CardTitle className="text-lg">Customer Info</CardTitle></CardHeader>
                    <CardContent className="space-y-4 pt-4">
                      <div><Label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Name</Label><p className="font-bold text-lg text-black">{selectedCustomer.name}</p></div>
                      <div><Label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">LINE ID</Label><p className="font-mono text-sm bg-gray-50 p-2 rounded-lg border border-gray-100 inline-block">{selectedCustomer.lineId}</p></div>
                      <div><Label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Tax ID</Label><p className="font-mono text-sm bg-gray-50 p-2 rounded-lg border border-gray-100 inline-block ml-2">{selectedCustomer.taxId || "Not provided"}</p></div>
                      <div><Label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Receipt Address</Label><p className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 p-3 rounded-xl border border-gray-100">{selectedCustomer.receiptAddress || "No address provided"}</p></div>
                      <div>
                        <Label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Store Access</Label>
                        <div className="space-y-2 mt-2">
                          {selectedCustomer.storeAccess.map((s, i) => (
                            <div key={i} className="flex justify-between items-center p-2 bg-gray-50 rounded-xl border border-gray-100 shadow-sm">
                              <span className="text-xs font-black">{s.storeName}</span>
                              <Badge className={`${tierInfo[s.tier].color} ${tierInfo[s.tier].bg} border-0 text-[10px] font-black uppercase h-6`}>
                                {tierInfo[s.tier].emoji} {tierInfo[s.tier].name}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Custom Prices Section */}
                <div className="space-y-6">
                  <Card className="shadow-sm border-gray-100 border-black/10">
                    <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-50">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Tag className="h-5 w-5" /> Special Pricing
                      </CardTitle>
                      <Dialog open={isCustomPriceDialogOpen} onOpenChange={setIsCustomPriceDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 text-[10px] font-black uppercase text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                            Configure Prices
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader><DialogTitle>Configure Custom Product Pricing</DialogTitle></DialogHeader>
                          <CustomPriceForm
                            products={products}
                            currentPrices={selectedCustomer.customPrices || []}
                            onSave={(prices) => {
                              handleUpdateCustomPrices(prices);
                              setIsCustomPriceDialogOpen(false);
                            }}
                            onCancel={() => setIsCustomPriceDialogOpen(false)}
                          />
                        </DialogContent>
                      </Dialog>
                    </CardHeader>
                    <CardContent className="pt-4">
                      {selectedCustomer.customPrices && selectedCustomer.customPrices.length > 0 ? (
                        <div className="space-y-3">
                          {selectedCustomer.customPrices.map((cp, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100 group">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-white border border-gray-100 flex items-center justify-center">
                                  <ImageWithFallback src={cp.imageUrl} alt={cp.productName} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-black">{cp.productName}</p>
                                  <p className="text-[9px] text-gray-400 font-mono tracking-tighter uppercase">{cp.sku}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-black text-blue-600">฿{cp.customPrice.toLocaleString()}</p>
                                <p className="text-[9px] text-gray-400 line-through">฿{cp.originalPrice.toLocaleString()}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-10 text-gray-300 italic text-sm">
                          <Tag className="h-10 w-10 mx-auto mb-2 opacity-20" />
                          No special pricing rules
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Order History */}
              <Card className="shadow-sm border-gray-100">
                <CardHeader className="border-b border-gray-50 bg-gray-50/50">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <History className="h-5 w-5" /> Recent Orders
                    </CardTitle>
                    <Button variant="ghost" size="sm" className="h-8 text-[10px] font-black uppercase text-gray-400 hover:text-black" onClick={() => fetchOrderHistory(selectedCustomer.id)}>
                      Refresh
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {isLoadingHistory ? (
                    <div className="py-12 text-center text-xs text-gray-400 font-black uppercase tracking-widest">Loading orders...</div>
                  ) : orderHistory.length === 0 ? (
                    <div className="py-12 text-center text-sm text-gray-300 italic">No orders found for this customer</div>
                  ) : (
                    <Table>
                      <TableHeader><TableRow className="bg-gray-50/30">
                        <TableHead className="py-3 text-[10px] font-black">Order ID</TableHead>
                        <TableHead className="text-[10px] font-black">Date</TableHead>
                        <TableHead className="text-[10px] font-black">Amount</TableHead>
                        <TableHead className="text-center text-[10px] font-black">Status</TableHead>
                        <TableHead className="text-right pr-6 text-[10px] font-black">Action</TableHead>
                      </TableRow></TableHeader>
                      <TableBody>
                        {orderHistory.map((order) => (
                          <TableRow key={order.id} className="group hover:bg-gray-50/50 transition-colors">
                            <TableCell className="font-mono text-[11px] font-bold">{order.id}</TableCell>
                            <TableCell className="text-xs text-gray-500">{new Date(order.orderDate).toLocaleDateString("th-TH")}</TableCell>
                            <TableCell className="font-black text-xs">฿{order.totalAmount.toLocaleString()}</TableCell>
                            <TableCell className="text-center">
                              <Badge className="text-[8px] font-black uppercase px-1.5 h-4 bg-gray-100 text-gray-600 border-0">{order.status}</Badge>
                            </TableCell>
                            <TableCell className="text-right pr-6">
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-300 hover:text-black hover:bg-white group-hover:shadow-sm">
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="flex-1 shadow-sm border-dashed border-gray-200 bg-gray-50/30 flex flex-col items-center justify-center text-center p-12 hidden lg:flex">
          <div className="w-24 h-24 rounded-[2rem] bg-white flex items-center justify-center shadow-xl shadow-black/5 mb-6 animate-pulse">
            <Users className="h-10 w-10 text-gray-200" />
          </div>
          <h3 className="text-xl font-black text-gray-400 uppercase tracking-tight">No Customer Selected</h3>
          <p className="text-gray-300 text-sm mt-2 max-w-[240px]">Select a customer from the left to view their profile, access levels, and order history.</p>
        </Card>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Sub-component: Custom Price Form
// ─────────────────────────────────────────────────────────────
function CustomPriceForm({
  products,
  currentPrices,
  onSave,
  onCancel,
}: {
  products: any[];
  currentPrices: CustomProductPrice[];
  onSave: (prices: CustomProductPrice[]) => void;
  onCancel: () => void;
}) {
  const [selectedPrices, setSelectedPrices] = useState<CustomProductPrice[]>(currentPrices);
  const [search, setSearch] = useState("");

  const filteredProducts = products.filter(
    (p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const addProduct = (p: any) => {
    if (selectedPrices.find((sp) => sp.productId === p.id)) return;
    setSelectedPrices([
      ...selectedPrices,
      {
        productId: p.id,
        productName: p.name,
        sku: p.sku,
        imageUrl: p.imageUrl,
        originalPrice: p.tierPricing.bronze,
        customPrice: p.tierPricing.bronze,
      },
    ]);
  };

  const removeProduct = (id: string) => {
    setSelectedPrices(selectedPrices.filter((p) => p.productId !== id));
  };

  const updatePrice = (id: string, price: number) => {
    setSelectedPrices(selectedPrices.map((p) => (p.productId === id ? { ...p, customPrice: price } : p)));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Product Selector */}
        <div className="space-y-4">
          <Label className="font-bold text-xs uppercase text-gray-400">Add Products</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 h-10" />
          </div>
          <div className="h-[300px] overflow-y-auto border rounded-xl divide-y">
            {filteredProducts.map((p) => {
              const isSelected = selectedPrices.some(sp => sp.productId === p.id);
              return (
                <div key={p.id} className="p-3 flex items-center justify-between hover:bg-gray-50 group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded border overflow-hidden shrink-0"><ImageWithFallback src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" /></div>
                    <div>
                      <p className="text-xs font-bold truncate max-w-[140px]">{p.name}</p>
                      <p className="text-[9px] text-gray-400 font-mono">{p.sku}</p>
                    </div>
                  </div>
                  <Button
                    variant={isSelected ? "ghost" : "outline"}
                    size="sm"
                    className={`h-8 w-8 p-0 rounded-full transition-all ${isSelected ? "text-green-500 opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                    onClick={() => addProduct(p)}
                    disabled={isSelected}
                  >
                    {isSelected ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected List */}
        <div className="space-y-4">
          <Label className="font-bold text-xs uppercase text-gray-400">Price Configuration</Label>
          <div className="h-[350px] overflow-y-auto border rounded-xl divide-y bg-gray-50/50">
            {selectedPrices.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center text-gray-300">
                <Tag className="h-8 w-8 mb-2 opacity-20" />
                <p className="text-xs italic">No items selected for special pricing</p>
              </div>
            ) : (
              selectedPrices.map((p) => (
                <div key={p.productId} className="p-4 bg-white space-y-3 shadow-sm first:rounded-t-xl last:rounded-b-xl">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded border overflow-hidden"><ImageWithFallback src={p.imageUrl} alt={p.productName} className="w-full h-full object-cover" /></div>
                      <div>
                        <p className="text-[11px] font-bold leading-tight">{p.productName}</p>
                        <p className="text-[9px] text-gray-400">Original: ฿{p.originalPrice.toLocaleString()}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-300 hover:text-red-500" onClick={() => removeProduct(p.productId)}><X className="h-4 w-4" /></Button>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">฿</span>
                      <Input type="number" value={p.customPrice} onChange={(e) => updatePrice(p.productId, Number(e.target.value))} className="h-9 pl-7 font-black text-sm border-blue-100 focus:border-blue-500 focus:ring-blue-500" />
                    </div>
                    <Badge variant="outline" className="h-9 px-3 text-[10px] font-black text-blue-600 bg-blue-50 border-blue-100">
                      -{Math.round(((p.originalPrice - p.customPrice) / p.originalPrice) * 100)}%
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave(selectedPrices)} className="bg-black text-white hover:bg-gray-800 px-8 font-black">Save All Rules</Button>
      </div>
    </div>
  );
}
