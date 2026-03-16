import { useState, useMemo, useEffect, useRef } from "react";
import { ShoppingBag, Search, Plus, Edit, Trash2, ChevronLeft, ChevronRight, Store, Filter, Package2, AlertTriangle, XCircle, Loader2, Upload, Image as ImageIcon, User, X } from "lucide-react";
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
import { Textarea } from "@/app/components/ui/textarea";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { api } from "@/app/utils/api";
import { toast } from "sonner";

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
  storeId: string;
  saleType: 'store' | 'private';
  privateCustomerIds?: string[];
}

interface Customer {
  id: string;
  name: string;
  lineId: string;
}

const STORES = [
  { id: "3a", name: "Store 3A" },
  { id: "tong3", name: "Store Tong 3" },
  { id: "4thit", name: "Store 4Thit" },
];

const ITEMS_PER_PAGE = 10;

// ─────────────────────────────────────────────────────────────
// Sub-component: Product Form
// ─────────────────────────────────────────────────────────────
interface ProductFormProps {
  product?: Product;
  customers: Customer[];
  onCancel: () => void;
  onSubmit: (data: any) => void;
  isUploading: boolean;
  onUpload: (file: File) => Promise<string>;
}

function ProductForm({ product, customers, onCancel, onSubmit, isUploading, onUpload }: ProductFormProps) {
  const [selectedFormStoreId, setSelectedFormStoreId] = useState<string>("");
  const [selectedPrivateCustomerIds, setSelectedPrivateCustomerIds] = useState<string[]>([]);
  const [customerSearchTerm, setCustomerSearchTerm] = useState<string>("");
  const [saleType, setSaleType] = useState<'store' | 'private'>('store');
  const [formImageUrl, setFormImageUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredCustomers = useMemo(() => {
    if (!customerSearchTerm) return customers;
    return customers.filter(c => 
      c.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
      c.lineId.toLowerCase().includes(customerSearchTerm.toLowerCase())
    );
  }, [customers, customerSearchTerm]);

  useEffect(() => {
    if (product) {
      setFormImageUrl(product.imageUrl || "");
      setSelectedFormStoreId(product.storeId || "");
      setSaleType(product.saleType || 'store');
      setSelectedPrivateCustomerIds(product.privateCustomerIds || []);
    } else {
      setFormImageUrl("");
      setSelectedFormStoreId("");
      setSaleType('store');
      setSelectedPrivateCustomerIds([]);
    }
  }, [product]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await onUpload(file);
    if (url) setFormImageUrl(url);
  };

  const toggleCustomer = (customerId: string) => {
    setSelectedPrivateCustomerIds(prev => 
      prev.includes(customerId) 
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (saleType === 'store' && !selectedFormStoreId) {
      toast.error("Please select a store");
      return;
    }
    if (saleType === 'private' && selectedPrivateCustomerIds.length === 0) {
      toast.error("Please select at least one customer");
      return;
    }

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      sku: formData.get("sku") as string,
      category: formData.get("category") as string,
      tierPricing: {
        bronze: Number(formData.get("priceBronze")),
        silver: Number(formData.get("priceSilver")),
        gold: Number(formData.get("priceGold")),
        platinum: Number(formData.get("pricePlatinum")),
      },
      stock: Number(formData.get("stock")),
      minOrder: Number(formData.get("minOrder")),
      description: formData.get("description") as string,
      imageUrl: formImageUrl,
      saleType: saleType,
      storeId: saleType === 'store' ? selectedFormStoreId : null,
      privateCustomerIds: saleType === 'private' ? selectedPrivateCustomerIds : [],
    };
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 md:col-span-1">
          <Label htmlFor="name">Product Name</Label>
          <Input id="name" name="name" defaultValue={product?.name} required />
        </div>
        <div>
          <Label htmlFor="sku">SKU</Label>
          <Input id="sku" name="sku" defaultValue={product?.sku} required />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Input id="category" name="category" defaultValue={product?.category} required />
        </div>
      </div>

      {/* Sale Type Radio Selection */}
      <div className="space-y-2">
        <Label>Sale Type</Label>
        <div className="flex gap-4 p-1">
          <label className={`flex items-center gap-2 cursor-pointer p-2 rounded-lg border-2 transition-all flex-1 ${saleType === 'store' ? 'border-black bg-black/5' : 'border-gray-100'}`}>
            <input type="radio" name="saleType" value="store" checked={saleType === 'store'} onChange={() => setSaleType('store')} className="accent-black h-4 w-4" />
            <div className="flex flex-col">
              <span className="text-sm font-bold">General Store</span>
              <span className="text-[10px] text-gray-500">Sell to any authorized store member</span>
            </div>
          </label>
          <label className={`flex items-center gap-2 cursor-pointer p-2 rounded-lg border-2 transition-all flex-1 ${saleType === 'private' ? 'border-black bg-black/5' : 'border-gray-100'}`}>
            <input type="radio" name="saleType" value="private" checked={saleType === 'private'} onChange={() => setSaleType('private')} className="accent-black h-4 w-4" />
            <div className="flex flex-col">
              <span className="text-sm font-bold">Private Sale</span>
              <span className="text-[10px] text-gray-500">Exclusive items for specific customer(s)</span>
            </div>
          </label>
        </div>
      </div>

      {/* Conditional Dropdowns */}
      {saleType === 'store' ? (
        <div>
          <Label className="mb-2 block">Available In Store *</Label>
          <Select value={selectedFormStoreId} onValueChange={setSelectedFormStoreId}>
            <SelectTrigger>
              <SelectValue placeholder="Select store" />
            </SelectTrigger>
            <SelectContent>
              {STORES.map((store) => (
                <SelectItem key={store.id} value={store.id}>{store.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div className="space-y-3">
          <Label className="block">Assign to Private Customers *</Label>
          
          {/* Selected Customers List */}
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedPrivateCustomerIds.map(id => {
              const c = customers.find(curr => curr.id === id);
              if (!c) return null;
              return (
                <Badge key={id} variant="secondary" className="flex items-center gap-1 bg-black text-white py-1 pl-2 pr-1 rounded-full text-[10px]">
                  {c.name} ({c.lineId})
                  <button type="button" onClick={() => toggleCustomer(id)} className="hover:bg-white/20 rounded-full p-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              );
            })}
            {selectedPrivateCustomerIds.length === 0 && (
              <p className="text-xs text-muted-foreground italic">No customers selected</p>
            )}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input 
              placeholder="Search and select customers..." 
              value={customerSearchTerm} 
              onChange={(e) => setCustomerSearchTerm(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>
          
          <div className="max-h-[200px] overflow-y-auto border border-gray-100 rounded-lg bg-gray-50/50">
            {filteredCustomers.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted-foreground italic">No customers found</div>
            ) : (
              filteredCustomers.map((c) => {
                const isSelected = selectedPrivateCustomerIds.includes(c.id);
                return (
                  <div 
                    key={c.id} 
                    onClick={() => toggleCustomer(c.id)}
                    className={`flex items-center justify-between p-3 border-b border-gray-100 cursor-pointer hover:bg-white transition-colors ${isSelected ? 'bg-white' : ''}`}
                  >
                    <div className="flex flex-col text-left">
                      <span className="font-bold text-xs">{c.name}</span>
                      <span className="text-[10px] text-gray-400 font-mono uppercase tracking-tighter">{c.lineId}</span>
                    </div>
                    {isSelected && <Badge className="bg-green-100 text-green-700 border-0 h-5 text-[8px] font-black uppercase">Selected</Badge>}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      <div>
        <Label className="mb-2 block">Tier Pricing (฿)</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { key: "priceBronze", tier: "bronze", label: "🥉 Bronze", val: product?.tierPricing.bronze },
            { key: "priceSilver", tier: "silver", label: "🥈 Silver", val: product?.tierPricing.silver },
            { key: "priceGold", tier: "gold", label: "🥇 Gold", val: product?.tierPricing.gold },
            { key: "pricePlatinum", tier: "platinum", label: "💎 Platinum", val: product?.tierPricing.platinum },
          ].map((t) => (
            <div key={t.key}>
              <Label htmlFor={t.key} className="text-xs text-muted-foreground">{t.label}</Label>
              <Input id={t.key} name={t.key} type="number" defaultValue={t.val} required />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="stock">Stock</Label>
          <Input id="stock" name="stock" type="number" defaultValue={product?.stock} required />
        </div>
        <div>
          <Label htmlFor="minOrder">Min Order Quantity</Label>
          <Input id="minOrder" name="minOrder" type="number" defaultValue={product?.minOrder} required />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" defaultValue={product?.description} required rows={2} />
      </div>

      <div className="space-y-2">
        <Label>Product Image</Label>
        <div className="flex items-start gap-4">
          <div className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden bg-gray-50">
            {formImageUrl ? (
              <img src={formImageUrl} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="h-8 w-8 text-gray-300" />
            )}
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                {isUploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                Upload Image
              </Button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
            </div>
            <Input id="imageUrl" name="imageUrl" value={formImageUrl} onChange={(e) => setFormImageUrl(e.target.value)} placeholder="Or enter URL manually" className="text-xs h-8" />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="bg-black text-white" disabled={isUploading}>{product ? "Update" : "Add"} Product</Button>
      </div>
    </form>
  );
}

export function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStore, setFilterStore] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSaleType, setFilterSaleType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [prodRes, custRes] = await Promise.all([
        api.get<any>("/products?limit=1000"),
        api.get<any>("/customers?limit=1000")
      ]);
      setProducts(prodRes.data || []);
      setCustomers(custRes.data || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  }

  const handleUploadImage = async (file: File): Promise<string> => {
    setIsImageUploading(true);
    try {
      const response = await api.upload<{ imageUrl: string }>("/upload", file);
      toast.success("Image uploaded successfully");
      return response.imageUrl;
    } catch (error: any) {
      toast.error(error.message || "Failed to upload image");
      return "";
    } finally {
      setIsImageUploading(false);
    }
  };

  const categories = useMemo(() => Array.from(new Set(products.map((p) => p.category))).sort(), [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Check if any private customer matches the search term
      const hasPrivateCustomerMatch = p.saleType === 'private' && (p.privateCustomerIds || []).some(id => {
        const customer = customers.find(c => c.id === id);
        return customer ? (
          customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.lineId.toLowerCase().includes(searchTerm.toLowerCase())
        ) : false;
      });

      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hasPrivateCustomerMatch;

      const matchCategory = filterCategory === "all" || p.category === filterCategory;
      const matchStore = filterStore === "all" || p.storeId === filterStore;
      const matchStatus = filterStatus === "all" || p.status === filterStatus;
      const matchSaleType = filterSaleType === "all" || p.saleType === filterSaleType;
      return matchSearch && matchCategory && matchStore && matchStatus && matchSaleType;
    });
  }, [products, searchTerm, filterCategory, filterStore, filterStatus, filterSaleType, customers]);

  const handleFilterChange = (setter: (v: string) => void) => (v: string) => {
    setter(v);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleAddProduct = async (data: any) => {
    try {
      await api.post("/products", data);
      setIsAddDialogOpen(false);
      fetchData();
      toast.success("Product added successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to add product");
    }
  };

  const handleEditProduct = async (data: any) => {
    if (!editingProduct) return;
    try {
      await api.put(`/products/${editingProduct.id}`, data);
      setEditingProduct(null);
      fetchData();
      toast.success("Product updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update product");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      fetchData();
      toast.success("Product deleted successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete product");
    }
  };

  const statusConfig = {
    available: { label: "Available", className: "bg-green-100 text-green-800 border-green-200", icon: Package2 },
    "low stock": { label: "Low Stock", className: "bg-amber-100 text-amber-800 border-amber-200", icon: AlertTriangle },
    "out of stock": { label: "Out of Stock", className: "bg-red-100 text-red-800 border-red-200", icon: XCircle },
  };

  const stats = {
    total: products.length,
    available: products.filter((p) => p.status === "available").length,
    lowStock: products.filter((p) => p.status === "low stock").length,
    outOfStock: products.filter((p) => p.status === "out of stock").length,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-5 pb-4"><p className="text-xs text-muted-foreground mb-1">Total Products</p><p className="text-2xl font-bold">{stats.total}</p></CardContent></Card>
        <Card><CardContent className="pt-5 pb-4"><p className="text-xs text-muted-foreground mb-1">Available</p><p className="text-2xl font-bold text-green-600">{stats.available}</p></CardContent></Card>
        <Card><CardContent className="pt-5 pb-4"><p className="text-xs text-muted-foreground mb-1">Low Stock</p><p className="text-2xl font-bold text-amber-600">{stats.lowStock}</p></CardContent></Card>
        <Card><CardContent className="pt-5 pb-4"><p className="text-xs text-muted-foreground mb-1">Out of Stock</p><p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2"><ShoppingBag className="h-5 w-5" />Product Management</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Manage products with store-wide or private sale options</p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild><Button className="bg-black text-white hover:bg-gray-800 shadow-lg shadow-black/20"><Plus className="h-4 w-4 mr-2" />Add Product</Button></DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle className="text-xl font-bold">Add New Product</DialogTitle></DialogHeader>
                <ProductForm customers={customers} onCancel={() => setIsAddDialogOpen(false)} onSubmit={handleAddProduct} isUploading={isImageUploading} onUpload={handleUploadImage} />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="ค้นหาสินค้า, SKU..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="pl-10" />
            </div>
            <Select value={filterSaleType} onValueChange={handleFilterChange(setFilterSaleType)}>
              <SelectTrigger className="w-full md:w-[140px]"><SelectValue placeholder="Sale Type" /></SelectTrigger>
              <SelectContent><SelectItem value="all">All Types</SelectItem><SelectItem value="store">Store</SelectItem><SelectItem value="private">Private</SelectItem></SelectContent>
            </Select>
            <Select value={filterStore} onValueChange={handleFilterChange(setFilterStore)}>
              <SelectTrigger className="w-full md:w-[160px]"><Store className="h-4 w-4 mr-2 shrink-0" /><SelectValue placeholder="Store" /></SelectTrigger>
              <SelectContent><SelectItem value="all">All Stores</SelectItem>{STORES.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={handleFilterChange(setFilterStatus)}>
              <SelectTrigger className="w-full md:w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="available">Available</SelectItem><SelectItem value="low stock">Low Stock</SelectItem><SelectItem value="out of stock">Out of Stock</SelectItem></SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-2"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /><p className="text-sm text-muted-foreground">Loading products...</p></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Image</TableHead>
                  <TableHead>Product Info</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Tier Pricing (฿)</TableHead>
                  <TableHead className="text-center">Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedProducts.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">ไม่พบสินค้า</TableCell></TableRow>
                ) : (
                  paginatedProducts.map((product) => {
                    const sc = statusConfig[product.status] || statusConfig.available;
                    const privateIds = product.privateCustomerIds || [];
                    const privateNames = privateIds.map(id => customers.find(c => c.id === id)?.name || id).join(", ");
                    
                    return (
                      <TableRow key={product.id}>
                        <TableCell><div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">{product.imageUrl && <ImageWithFallback src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />}</div></TableCell>
                        <TableCell><div><p className="font-bold text-sm leading-tight">{product.name}</p><p className="text-[10px] text-muted-foreground font-mono mt-0.5">{product.sku}</p><Badge variant="outline" className="mt-1 text-[9px] uppercase font-bold">{product.category}</Badge></div></TableCell>
                        <TableCell>
                          {product.saleType === 'private' ? (
                            <div className="flex items-center gap-1.5">
                              <User className="h-3 w-3 text-purple-600 shrink-0" />
                              <div className="flex flex-col min-w-0">
                                <span className="text-[10px] font-bold text-purple-700 uppercase">Private Sale ({privateIds.length})</span>
                                <span className="text-[10px] text-gray-900 font-bold truncate max-w-[120px]" title={privateNames}>
                                  {privateNames || 'No customers'}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <Store className="h-3 w-3 text-green-600" />
                              <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-green-700 uppercase">Store Account</span>
                                <span className="text-[10px] text-gray-500 font-medium">{STORES.find(s => s.id === product.storeId)?.name.replace("Store Account ", "S")}</span>
                              </div>
                            </div>
                          )}
                        </TableCell>
                        <TableCell><div className="space-y-0.5 text-[10px]"><div className="flex gap-1"><span>🥉</span><span>฿{product.tierPricing?.bronze?.toLocaleString()}</span></div><div className="flex gap-1"><span>💎</span><span>฿{product.tierPricing?.platinum?.toLocaleString()}</span></div></div></TableCell>
                        <TableCell className="text-center font-bold text-sm">{product.stock?.toLocaleString()}</TableCell>
                        <TableCell><Badge className={`${sc.className} border text-[9px] uppercase font-black px-1.5 py-0`} variant="secondary">{sc.label}</Badge></TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Dialog open={editingProduct?.id === product.id} onOpenChange={(open) => { if (!open) setEditingProduct(null); }}>
                              <DialogTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingProduct(product)}><Edit className="h-4 w-4" /></Button></DialogTrigger>
                              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>Edit Product</DialogTitle></DialogHeader><ProductForm customers={customers} product={product} onCancel={() => setEditingProduct(null)} onSubmit={handleEditProduct} isUploading={isImageUploading} onUpload={handleUploadImage} /></DialogContent>
                            </Dialog>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600" onClick={() => handleDeleteProduct(product.id)}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border">
            <p className="text-sm text-muted-foreground">แสดง {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)} จาก {filteredProducts.length} รายการ</p>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4" /></Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                const isVisible = page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
                if (!isVisible) return null;
                return <Button key={page} variant={currentPage === page ? "default" : "outline"} size="icon" className={`h-8 w-8 text-sm ${currentPage === page ? "bg-black text-white" : ""}`} onClick={() => setCurrentPage(page)}>{page}</Button>;
              })}
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
