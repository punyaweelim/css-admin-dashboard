import { useState, useMemo } from "react";
import { ShoppingBag, Search, Plus, Edit, Trash2, ChevronLeft, ChevronRight, Store, Filter, Package2, AlertTriangle, XCircle } from "lucide-react";
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
import { Checkbox } from "@/app/components/ui/checkbox";

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
  storeIds: string[]; // ร้านค้าที่มองเห็นสินค้านี้
}

const STORES = [
  { id: "store1", name: "Store Account 1" },
  { id: "store2", name: "Store Account 2" },
  { id: "store3", name: "Store Account 3" },
];

const ITEMS_PER_PAGE = 8;

const mockProducts: Product[] = [
  {
    id: "PROD-001", name: "Wireless Noise-Cancelling Headphones", sku: "SKU-A001",
    category: "Electronics",
    tierPricing: { bronze: 3200, silver: 3000, gold: 2800, platinum: 2600 },
    stock: 500, minOrder: 10,
    description: "Premium wireless headphones with active noise cancellation and 30-hour battery life.",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
    status: "available", storeIds: ["store1", "store2"],
  },
  {
    id: "PROD-002", name: "Bamboo Cutting Board Set", sku: "SKU-B002",
    category: "Home & Garden",
    tierPricing: { bronze: 850, silver: 800, gold: 750, platinum: 700 },
    stock: 200, minOrder: 20,
    description: "Eco-friendly bamboo cutting boards in 3 sizes. Antibacterial and durable.",
    imageUrl: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400",
    status: "available", storeIds: ["store1"],
  },
  {
    id: "PROD-003", name: "Minimalist Leather Watch", sku: "SKU-C003",
    category: "Fashion",
    tierPricing: { bronze: 4500, silver: 4200, gold: 3900, platinum: 3600 },
    stock: 45, minOrder: 5,
    description: "Classic minimalist watch with genuine leather strap and sapphire crystal glass.",
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
    status: "low stock", storeIds: ["store2"],
  },
  {
    id: "PROD-004", name: "Vitamin C Serum 30ml", sku: "SKU-D004",
    category: "Beauty",
    tierPricing: { bronze: 1200, silver: 1100, gold: 1000, platinum: 900 },
    stock: 0, minOrder: 30,
    description: "Brightening vitamin C serum with hyaluronic acid. Suitable for all skin types.",
    imageUrl: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=400",
    status: "out of stock", storeIds: ["store1", "store2", "store3"],
  },
  {
    id: "PROD-005", name: "Smart Fitness Tracker", sku: "SKU-E005",
    category: "Electronics",
    tierPricing: { bronze: 2800, silver: 2600, gold: 2400, platinum: 2200 },
    stock: 1000, minOrder: 15,
    description: "Advanced fitness band with heart rate monitor, GPS, and 7-day battery life.",
    imageUrl: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400",
    status: "available", storeIds: ["store1", "store3"],
  },
  {
    id: "PROD-006", name: "Resistance Band Set (5 levels)", sku: "SKU-F006",
    category: "Sports",
    tierPricing: { bronze: 650, silver: 610, gold: 570, platinum: 530 },
    stock: 300, minOrder: 20,
    description: "Professional resistance bands in 5 resistance levels. Includes storage bag.",
    imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400",
    status: "available", storeIds: ["store2", "store3"],
  },
  {
    id: "PROD-007", name: "Stainless Steel Water Bottle 750ml", sku: "SKU-G007",
    category: "Sports",
    tierPricing: { bronze: 480, silver: 450, gold: 420, platinum: 390 },
    stock: 800, minOrder: 50,
    description: "Double-wall insulated bottle that keeps drinks cold 24h or hot 12h.",
    imageUrl: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400",
    status: "available", storeIds: ["store1", "store2", "store3"],
  },
  {
    id: "PROD-008", name: "Ceramic Diffuser & Essential Oil Kit", sku: "SKU-H008",
    category: "Home & Garden",
    tierPricing: { bronze: 1500, silver: 1400, gold: 1300, platinum: 1200 },
    stock: 120, minOrder: 10,
    description: "Ultrasonic aromatherapy diffuser with 6 essential oil bottles included.",
    imageUrl: "https://images.unsplash.com/photo-1540202404-1b927e27fa8b?w=400",
    status: "available", storeIds: ["store1", "store2"],
  },
  {
    id: "PROD-009", name: "Portable Bluetooth Speaker", sku: "SKU-I009",
    category: "Electronics",
    tierPricing: { bronze: 1800, silver: 1680, gold: 1560, platinum: 1440 },
    stock: 350, minOrder: 20,
    description: "360° waterproof speaker with 20W output and 12-hour playtime.",
    imageUrl: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400",
    status: "available", storeIds: ["store1"],
  },
  {
    id: "PROD-010", name: "Silk Pillowcase Set (2pcs)", sku: "SKU-J010",
    category: "Home & Garden",
    tierPricing: { bronze: 1100, silver: 1030, gold: 960, platinum: 890 },
    stock: 90, minOrder: 15,
    description: "100% mulberry silk pillowcases. Reduces hair breakage and skin wrinkles.",
    imageUrl: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400",
    status: "low stock", storeIds: ["store2", "store3"],
  },
  {
    id: "PROD-011", name: "Retinol Night Cream 50ml", sku: "SKU-K011",
    category: "Beauty",
    tierPricing: { bronze: 1600, silver: 1500, gold: 1400, platinum: 1300 },
    stock: 220, minOrder: 20,
    description: "Advanced anti-aging night cream with 0.3% retinol and peptide complex.",
    imageUrl: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400",
    status: "available", storeIds: ["store1", "store3"],
  },
  {
    id: "PROD-012", name: "Yoga Mat Pro 6mm", sku: "SKU-L012",
    category: "Sports",
    tierPricing: { bronze: 1200, silver: 1120, gold: 1040, platinum: 960 },
    stock: 450, minOrder: 10,
    description: "Non-slip TPE yoga mat with alignment lines. Eco-friendly and sweat-resistant.",
    imageUrl: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400",
    status: "available", storeIds: ["store1", "store2", "store3"],
  },
  {
    id: "PROD-013", name: "Linen Relaxed-Fit Shirt", sku: "SKU-M013",
    category: "Fashion",
    tierPricing: { bronze: 950, silver: 890, gold: 830, platinum: 770 },
    stock: 600, minOrder: 30,
    description: "Breathable 100% linen shirt available in 8 neutral colors. Unisex sizing.",
    imageUrl: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400",
    status: "available", storeIds: ["store2"],
  },
  {
    id: "PROD-014", name: "Mechanical Keyboard TKL", sku: "SKU-N014",
    category: "Electronics",
    tierPricing: { bronze: 3800, silver: 3560, gold: 3320, platinum: 3080 },
    stock: 180, minOrder: 5,
    description: "Tenkeyless mechanical keyboard with RGB backlight and hot-swap switches.",
    imageUrl: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=400",
    status: "available", storeIds: ["store1", "store2"],
  },
  {
    id: "PROD-015", name: "Glass Food Storage Containers (Set 5)", sku: "SKU-O015",
    category: "Home & Garden",
    tierPricing: { bronze: 1350, silver: 1260, gold: 1170, platinum: 1080 },
    stock: 30, minOrder: 10,
    description: "Borosilicate glass containers with airtight lids. Microwave and oven safe.",
    imageUrl: "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=400",
    status: "low stock", storeIds: ["store3"],
  },
  {
    id: "PROD-016", name: "SPF50 Sunscreen Fluid 50ml", sku: "SKU-P016",
    category: "Beauty",
    tierPricing: { bronze: 780, silver: 730, gold: 680, platinum: 630 },
    stock: 700, minOrder: 50,
    description: "Lightweight, non-greasy sunscreen with UVA/UVB protection. No white cast.",
    imageUrl: "https://images.unsplash.com/photo-1607748862156-7c548e7e98f4?w=400",
    status: "available", storeIds: ["store1", "store2", "store3"],
  },
  {
    id: "PROD-017", name: "Adjustable Dumbbell 20kg", sku: "SKU-Q017",
    category: "Sports",
    tierPricing: { bronze: 5500, silver: 5150, gold: 4800, platinum: 4450 },
    stock: 80, minOrder: 2,
    description: "Space-saving adjustable dumbbell with 15 weight settings from 2-20kg.",
    imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400",
    status: "low stock", storeIds: ["store2", "store3"],
  },
  {
    id: "PROD-018", name: "Canvas Tote Bag Large", sku: "SKU-R018",
    category: "Fashion",
    tierPricing: { bronze: 420, silver: 394, gold: 368, platinum: 342 },
    stock: 1500, minOrder: 100,
    description: "Heavy-duty 12oz canvas tote bag. Available in 12 colors with custom print option.",
    imageUrl: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=400",
    status: "available", storeIds: ["store1", "store3"],
  },
  {
    id: "PROD-019", name: "Smart LED Desk Lamp", sku: "SKU-S019",
    category: "Electronics",
    tierPricing: { bronze: 2200, silver: 2060, gold: 1920, platinum: 1780 },
    stock: 260, minOrder: 10,
    description: "Touch-controlled desk lamp with 5 color temperatures and USB-C charging port.",
    imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400",
    status: "available", storeIds: ["store1"],
  },
  {
    id: "PROD-020", name: "Macramé Wall Hanging Decor", sku: "SKU-T020",
    category: "Home & Garden",
    tierPricing: { bronze: 890, silver: 834, gold: 778, platinum: 722 },
    stock: 0, minOrder: 5,
    description: "Handcrafted boho macramé wall art made from 100% cotton rope. 60×90cm.",
    imageUrl: "https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=400",
    status: "out of stock", storeIds: ["store2", "store3"],
  },
  {
    id: "PROD-021", name: "Collagen Supplement Powder 300g", sku: "SKU-U021",
    category: "Beauty",
    tierPricing: { bronze: 2400, silver: 2250, gold: 2100, platinum: 1950 },
    stock: 400, minOrder: 20,
    description: "Marine-sourced hydrolyzed collagen peptides. Unflavored and easily dissolved.",
    imageUrl: "https://images.unsplash.com/photo-1595348020949-87cdfbb44174?w=400",
    status: "available", storeIds: ["store1", "store2"],
  },
  {
    id: "PROD-022", name: "Jump Rope Speed Cable", sku: "SKU-V022",
    category: "Sports",
    tierPricing: { bronze: 350, silver: 328, gold: 306, platinum: 284 },
    stock: 900, minOrder: 50,
    description: "Professional speed jump rope with ball-bearing handles and adjustable cable.",
    imageUrl: "https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=400",
    status: "available", storeIds: ["store1", "store2", "store3"],
  },
];

export function ProductManagement() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStore, setFilterStore] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form state for store selection
  const [formStoreIds, setFormStoreIds] = useState<string[]>([]);

  const categories = useMemo(() => Array.from(new Set(products.map((p) => p.category))).sort(), [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = filterCategory === "all" || p.category === filterCategory;
      const matchStore = filterStore === "all" || p.storeIds.includes(filterStore);
      const matchStatus = filterStatus === "all" || p.status === filterStatus;
      return matchSearch && matchCategory && matchStore && matchStatus;
    });
  }, [products, searchTerm, filterCategory, filterStore, filterStatus]);

  // Reset to page 1 when filters change
  const handleFilterChange = (setter: (v: string) => void) => (v: string) => {
    setter(v);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleAddProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newProduct: Product = {
      id: `PROD-${String(products.length + 1).padStart(3, "0")}`,
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
      imageUrl: formData.get("imageUrl") as string,
      status: "available",
      storeIds: formStoreIds,
    };
    setProducts([...products, newProduct]);
    setIsAddDialogOpen(false);
    setFormStoreIds([]);
  };

  const handleEditProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingProduct) return;
    const formData = new FormData(e.currentTarget);
    const updatedProduct: Product = {
      ...editingProduct,
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
      imageUrl: formData.get("imageUrl") as string,
      storeIds: formStoreIds,
    };
    setProducts(products.map((p) => (p.id === editingProduct.id ? updatedProduct : p)));
    setEditingProduct(null);
    setFormStoreIds([]);
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  const toggleStore = (storeId: string) => {
    setFormStoreIds((prev) =>
      prev.includes(storeId) ? prev.filter((s) => s !== storeId) : [...prev, storeId]
    );
  };

  const statusConfig = {
    available: { label: "Available", className: "bg-green-100 text-green-800 border-green-200", icon: Package2 },
    "low stock": { label: "Low Stock", className: "bg-amber-100 text-amber-800 border-amber-200", icon: AlertTriangle },
    "out of stock": { label: "Out of Stock", className: "bg-red-100 text-red-800 border-red-200", icon: XCircle },
  };

  const ProductForm = ({ product }: { product?: Product }) => (
    <form onSubmit={product ? handleEditProduct : handleAddProduct} className="space-y-5">
      {/* Basic Info */}
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

      {/* Store Visibility */}
      <div>
        <Label className="mb-2 block">ร้านค้าที่มองเห็นสินค้านี้ *</Label>
        <div className="grid grid-cols-3 gap-2 border border-border rounded-lg p-3 bg-gray-50">
          {STORES.map((store) => {
            const isChecked = formStoreIds.includes(store.id);
            return (
              <div
                key={store.id}
                onClick={() => toggleStore(store.id)}
                className={`flex items-center gap-2.5 p-2.5 rounded-lg border-2 cursor-pointer transition-all select-none ${
                  isChecked
                    ? "border-black bg-white"
                    : "border-transparent bg-white hover:border-gray-300"
                }`}
              >
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={() => toggleStore(store.id)}
                  className="pointer-events-none"
                />
                <div>
                  <Store className="h-3.5 w-3.5 text-muted-foreground mb-0.5" />
                  <span className="text-xs font-medium leading-none">{store.name}</span>
                </div>
              </div>
            );
          })}
        </div>
        {formStoreIds.length === 0 && (
          <p className="text-xs text-red-500 mt-1">กรุณาเลือกอย่างน้อย 1 ร้านค้า</p>
        )}
      </div>

      {/* Pricing */}
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

      {/* Stock & Min Order */}
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

      <div>
        <Label htmlFor="imageUrl">Image URL</Label>
        <Input id="imageUrl" name="imageUrl" defaultValue={product?.imageUrl} placeholder="https://example.com/image.jpg" />
      </div>

      <div className="flex justify-end gap-2 border-t pt-4">
        <Button type="button" variant="outline" onClick={() => { setIsAddDialogOpen(false); setEditingProduct(null); setFormStoreIds([]); }}>
          Cancel
        </Button>
        <Button type="submit" className="bg-black text-white hover:bg-gray-800" disabled={formStoreIds.length === 0}>
          {product ? "Update" : "Add"} Product
        </Button>
      </div>
    </form>
  );

  // Stats
  const stats = {
    total: products.length,
    available: products.filter((p) => p.status === "available").length,
    lowStock: products.filter((p) => p.status === "low stock").length,
    outOfStock: products.filter((p) => p.status === "out of stock").length,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-5 pb-4">
            <p className="text-xs text-muted-foreground mb-1">Total Products</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4">
            <p className="text-xs text-muted-foreground mb-1">Available</p>
            <p className="text-2xl font-bold text-green-600">{stats.available}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4">
            <p className="text-xs text-muted-foreground mb-1">Low Stock</p>
            <p className="text-2xl font-bold text-amber-600">{stats.lowStock}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4">
            <p className="text-xs text-muted-foreground mb-1">Out of Stock</p>
            <p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p>
          </CardContent>
        </Card>
      </div>

      {/* Header + Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Product Management
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Manage products with tier-based pricing and store visibility</p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={(open) => { setIsAddDialogOpen(open); if (!open) setFormStoreIds([]); }}>
              <DialogTrigger asChild>
                <Button className="bg-black text-white hover:bg-gray-800">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Product</DialogTitle>
                </DialogHeader>
                <ProductForm />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ค้นหาสินค้า, SKU..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="pl-10"
              />
            </div>
            <Select value={filterCategory} onValueChange={handleFilterChange(setFilterCategory)}>
              <SelectTrigger className="w-full md:w-[160px]">
                <Filter className="h-4 w-4 mr-2 shrink-0" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterStore} onValueChange={handleFilterChange(setFilterStore)}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Store className="h-4 w-4 mr-2 shrink-0" />
                <SelectValue placeholder="Store" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stores</SelectItem>
                {STORES.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={handleFilterChange(setFilterStatus)}>
              <SelectTrigger className="w-full md:w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="low stock">Low Stock</SelectItem>
                <SelectItem value="out of stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Image</TableHead>
                <TableHead>Product Info</TableHead>
                <TableHead>Store Visibility</TableHead>
                <TableHead>Tier Pricing (฿)</TableHead>
                <TableHead className="text-center">Stock</TableHead>
                <TableHead className="text-center">Min Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                    ไม่พบสินค้าที่ตรงกับเงื่อนไข
                  </TableCell>
                </TableRow>
              ) : (
                paginatedProducts.map((product) => {
                  const sc = statusConfig[product.status];
                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                          {product.imageUrl && (
                            <ImageWithFallback src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div>
                          <p className="font-semibold text-sm leading-tight">{product.name}</p>
                          <p className="text-xs text-muted-foreground font-mono mt-0.5">{product.sku}</p>
                          <Badge variant="outline" className="mt-1 text-xs">{product.category}</Badge>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {STORES.map((store) => {
                            const visible = product.storeIds.includes(store.id);
                            return (
                              <div key={store.id} className="flex items-center gap-1.5">
                                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${visible ? "bg-green-500" : "bg-gray-300"}`} />
                                <span className={`text-xs ${visible ? "text-foreground" : "text-muted-foreground line-through"}`}>
                                  {store.name.replace("Store Account ", "S")}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-0.5 text-xs">
                          <div className="flex gap-1"><span className="text-muted-foreground">🥉</span><span>฿{product.tierPricing.bronze.toLocaleString()}</span></div>
                          <div className="flex gap-1"><span className="text-muted-foreground">🥈</span><span>฿{product.tierPricing.silver.toLocaleString()}</span></div>
                          <div className="flex gap-1"><span className="text-muted-foreground">🥇</span><span>฿{product.tierPricing.gold.toLocaleString()}</span></div>
                          <div className="flex gap-1"><span className="text-muted-foreground">💎</span><span>฿{product.tierPricing.platinum.toLocaleString()}</span></div>
                        </div>
                      </TableCell>

                      <TableCell className="text-center">
                        <span className={`font-semibold text-sm ${product.stock === 0 ? "text-red-500" : product.stock < 50 ? "text-amber-600" : ""}`}>
                          {product.stock.toLocaleString()}
                        </span>
                      </TableCell>

                      <TableCell className="text-center text-sm">{product.minOrder}</TableCell>

                      <TableCell>
                        <Badge className={`${sc.className} border text-xs`} variant="secondary">
                          {sc.label}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Dialog
                            open={editingProduct?.id === product.id}
                            onOpenChange={(open) => { if (!open) { setEditingProduct(null); setFormStoreIds([]); } }}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => { setEditingProduct(product); setFormStoreIds([...product.storeIds]); }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Edit Product</DialogTitle>
                              </DialogHeader>
                              <ProductForm product={product} />
                            </DialogContent>
                          </Dialog>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteProduct(product.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              แสดง {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)} จาก {filteredProducts.length} รายการ
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                const isEllipsisBefore = page === 2 && currentPage > 4;
                const isEllipsisAfter = page === totalPages - 1 && currentPage < totalPages - 3;
                const isVisible =
                  page === 1 ||
                  page === totalPages ||
                  Math.abs(page - currentPage) <= 1;

                if (!isVisible && !isEllipsisBefore && !isEllipsisAfter) return null;
                if (isEllipsisBefore || isEllipsisAfter) {
                  return <span key={page} className="px-1 text-muted-foreground text-sm">…</span>;
                }
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="icon"
                    className={`h-8 w-8 text-sm ${currentPage === page ? "bg-black text-white hover:bg-gray-800" : ""}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                );
              })}

              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
