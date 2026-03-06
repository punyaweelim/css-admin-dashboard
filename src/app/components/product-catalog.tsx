import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShoppingCart, Search, Filter, Plus, Minus, Trash2, User, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
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
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";

type CustomerTier = "bronze" | "silver" | "gold" | "platinum";

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
}

interface CartItem extends Product {
  quantity: number;
}

interface StoreAccess {
  storeId: string;
  storeName: string;
  tier: CustomerTier;
}

interface Customer {
  id: string;
  name: string;
  lineId: string;
  storeAccess: StoreAccess[];
  phone: string;
  email: string;
  status: "active" | "inactive";
}

const tierInfo: Record<CustomerTier, { emoji: string; name: string; discount: string }> = {
  bronze: { emoji: "🥉", name: "Bronze", discount: "Standard Price" },
  silver: { emoji: "🥈", name: "Silver", discount: "5-7% Off" },
  gold: { emoji: "🥇", name: "Gold", discount: "10-13% Off" },
  platinum: { emoji: "💎", name: "Platinum", discount: "15-20% Off" },
};

const mockCustomers: Customer[] = [
  {
    id: "CUST-001",
    name: "สมชาย ใจดี",
    lineId: "LINE-123456",
    storeAccess: [{ storeId: "store1", storeName: "Store Account 1", tier: "gold" }],
    phone: "081-234-5678",
    email: "somchai@example.com",
    status: "active",
  },
  {
    id: "CUST-002",
    name: "สมหญิง รักสวย",
    lineId: "LINE-789012",
    storeAccess: [
      { storeId: "store2", storeName: "Store Account 2", tier: "platinum" },
      { storeId: "store3", storeName: "Store Account 3", tier: "silver" },
    ],
    phone: "082-345-6789",
    email: "somying@example.com",
    status: "active",
  },
  {
    id: "CUST-003",
    name: "วิชัย ประเสริฐ",
    lineId: "LINE-345678",
    storeAccess: [{ storeId: "store3", storeName: "Store Account 3", tier: "silver" }],
    phone: "083-456-7890",
    email: "wichai@example.com",
    status: "active",
  },
  {
    id: "CUST-004",
    name: "อรุณี สวัสดี",
    lineId: "LINE-901234",
    storeAccess: [
      { storeId: "store1", storeName: "Store Account 1", tier: "bronze" },
      { storeId: "store2", storeName: "Store Account 2", tier: "gold" },
    ],
    phone: "084-567-8901",
    email: "arunee@example.com",
    status: "active",
  },
];

const mockProducts: Product[] = [
  {
    id: "PROD-001", name: "Product A", sku: "SKU-A001", category: "Electronics",
    tierPricing: { bronze: 300, silver: 280, gold: 260, platinum: 240 },
    stock: 500, minOrder: 50,
    description: "High-quality electronic product suitable for bulk orders",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
    status: "available", storeId: "store1",
  },
  {
    id: "PROD-002", name: "Product B", sku: "SKU-B002", category: "Home & Garden",
    tierPricing: { bronze: 150, silver: 140, gold: 130, platinum: 120 },
    stock: 200, minOrder: 100,
    description: "Popular home and garden item with excellent reviews",
    imageUrl: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400",
    status: "available", storeId: "store1",
  },
  {
    id: "PROD-003", name: "Product C", sku: "SKU-C003", category: "Fashion",
    tierPricing: { bronze: 400, silver: 375, gold: 350, platinum: 325 },
    stock: 50, minOrder: 25,
    description: "Trendy fashion product perfect for resellers",
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
    status: "low stock", storeId: "store2",
  },
  {
    id: "PROD-004", name: "Product D", sku: "SKU-D004", category: "Beauty",
    tierPricing: { bronze: 250, silver: 235, gold: 220, platinum: 205 },
    stock: 0, minOrder: 50,
    description: "Premium beauty product - currently restocking",
    imageUrl: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=400",
    status: "out of stock", storeId: "store2",
  },
  {
    id: "PROD-005", name: "Product E", sku: "SKU-E005", category: "Electronics",
    tierPricing: { bronze: 500, silver: 470, gold: 440, platinum: 410 },
    stock: 1000, minOrder: 30,
    description: "Best-selling electronic gadget with warranty",
    imageUrl: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400",
    status: "available", storeId: "store2",
  },
  {
    id: "PROD-006", name: "Product F", sku: "SKU-F006", category: "Sports",
    tierPricing: { bronze: 350, silver: 330, gold: 310, platinum: 290 },
    stock: 300, minOrder: 40,
    description: "High-performance sports equipment",
    imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400",
    status: "available", storeId: "store3",
  },
];

export function ProductCatalog() {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [selectedStore, setSelectedStore] = useState<StoreAccess | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    if (customerId) {
      const foundCustomer = mockCustomers.find((c) => c.id === customerId);
      if (foundCustomer && foundCustomer.status === "active") {
        setCustomer(foundCustomer);
        if (foundCustomer.storeAccess.length > 0) {
          setSelectedStore(foundCustomer.storeAccess[0]);
        }
      } else {
        navigate("/");
      }
    }
  }, [customerId, navigate]);

  useEffect(() => {
    if (selectedStore) {
      setProducts(mockProducts.filter((p) => p.storeId === selectedStore.storeId));
    }
  }, [selectedStore]);

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(products.map((p) => p.category)));

  const getPrice = (product: Product) => {
    if (!selectedStore) return product.tierPricing.bronze;
    return product.tierPricing[selectedStore.tier];
  };

  const addToCart = (product: Product) => {
    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      setCart(cart.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + product.minOrder } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: product.minOrder }]);
    }
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    const product = products.find((p) => p.id === productId);
    if (product && newQuantity >= product.minOrder) {
      setCart(cart.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.id !== productId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + getPrice(item) * item.quantity, 0);
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (!customer || !selectedStore) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardHeader><CardTitle>Loading...</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Please wait while we load your information.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-black text-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            {/* Left: Title */}
            <div className="min-w-0">
              <h1 className="text-base font-semibold leading-tight truncate">Product Catalog</h1>
              <p className="text-xs text-gray-400 hidden sm:block">Browse and order bulk products</p>
            </div>

            {/* Right: controls */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Customer Info — hide on very small screens */}
              <div className="hidden md:flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg">
                <User className="h-3.5 w-3.5 shrink-0" />
                <div className="text-sm leading-tight">
                  <div className="font-semibold truncate max-w-[120px]">{customer.name}</div>
                  <div className="text-xs text-gray-400">{customer.lineId}</div>
                </div>
              </div>

              {/* Store Selector */}
              {customer.storeAccess.length > 1 ? (
                <Select
                  value={selectedStore.storeId}
                  onValueChange={(storeId) => {
                    const store = customer.storeAccess.find((s) => s.storeId === storeId);
                    if (store) { setSelectedStore(store); setCart([]); }
                  }}
                >
                  <SelectTrigger className="border-0 bg-white/10 text-white h-9 px-3 gap-1.5 focus:ring-0 w-auto max-w-[160px] sm:max-w-[200px]">
                    <span className="text-sm truncate">
                      {tierInfo[selectedStore.tier].emoji} {selectedStore.storeName.replace("Store Account ", "S")}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    {customer.storeAccess.map((store) => (
                      <SelectItem key={store.storeId} value={store.storeId}>
                        <div className="flex items-center gap-2">
                          <span>{tierInfo[store.tier].emoji}</span>
                          <span>{store.storeName}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="bg-white/10 px-3 py-1.5 rounded-lg text-sm hidden sm:block">
                  <span className="mr-1">{tierInfo[selectedStore.tier].emoji}</span>
                  {selectedStore.storeName}
                </div>
              )}

              {/* Cart Button */}
              <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="relative bg-white text-black hover:bg-gray-100 h-9 px-3 gap-1.5"
                  >
                    <ShoppingCart className="h-4 w-4 shrink-0" />
                    <span className="hidden sm:inline text-sm">Cart</span>
                    {cart.length > 0 && (
                      <Badge className="ml-0.5 bg-black text-white text-xs px-1.5 py-0 h-4 min-w-[16px]">
                        {cart.length}
                      </Badge>
                    )}
                  </Button>
                </DialogTrigger>

                {/* Cart Dialog */}
                <DialogContent className="w-[calc(100%-2rem)] max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
                  <DialogHeader>
                    <DialogTitle className="text-base sm:text-lg">
                      Shopping Cart ({cartItemsCount.toLocaleString()} items)
                    </DialogTitle>
                  </DialogHeader>

                  {cart.length === 0 ? (
                    <div className="text-center text-muted-foreground py-12">
                      <ShoppingCart className="h-10 w-10 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">Your cart is empty</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Store Info */}
                      <div className="bg-gray-50 px-3 py-2.5 rounded-lg flex items-center gap-2">
                        <span className="text-xl">{tierInfo[selectedStore.tier].emoji}</span>
                        <div>
                          <p className="text-sm font-semibold">{selectedStore.storeName}</p>
                          <p className="text-xs text-muted-foreground">
                            {tierInfo[selectedStore.tier].name} Member
                          </p>
                        </div>
                      </div>

                      {/* Cart Items */}
                      <div className="space-y-3">
                        {cart.map((item) => (
                          <div key={item.id} className="flex gap-3 border-b border-border pb-3 last:border-0">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                              {item.imageUrl && (
                                <ImageWithFallback
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm leading-tight truncate">{item.name}</p>
                              <p className="text-xs text-muted-foreground">{item.sku}</p>
                              <p className="text-sm font-semibold mt-1">
                                ฿{getPrice(item).toLocaleString()} / unit
                              </p>
                              {/* Quantity Controls */}
                              <div className="flex items-center gap-2 mt-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  onClick={() => updateQuantity(item.id, item.quantity - item.minOrder)}
                                  disabled={item.quantity <= item.minOrder}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="text-sm font-medium min-w-[56px] text-center">
                                  {item.quantity.toLocaleString()}
                                </span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  onClick={() => updateQuantity(item.id, item.quantity + item.minOrder)}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <div className="flex flex-col items-end justify-between shrink-0">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={() => removeFromCart(item.id)}
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                              <p className="font-bold text-sm">
                                ฿{(getPrice(item) * item.quantity).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Checkout */}
                      <div className="border-t pt-4 space-y-3">
                        <div className="flex justify-between text-base font-semibold">
                          <span>Total</span>
                          <span>฿{cartTotal.toLocaleString()}</span>
                        </div>
                        <div>
                          <Label className="text-sm">LINE ID</Label>
                          <Input value={customer.lineId} disabled className="mt-1" />
                        </div>
                        <div>
                          <Label className="text-sm">Notes (Optional)</Label>
                          <Textarea placeholder="Any special instructions?" className="mt-1" rows={2} />
                        </div>
                        <Button className="w-full bg-black text-white hover:bg-gray-800">
                          Submit Order
                        </Button>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-5 sm:py-8">
        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ค้นหาสินค้า..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-2 shrink-0" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No products found in this store</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
                {/* Product Image */}
                <div className="aspect-square bg-gray-100 overflow-hidden">
                  {product.imageUrl && (
                    <ImageWithFallback
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                {/* Card Body */}
                <div className="p-3 sm:p-4 flex flex-col flex-1 gap-2">
                  {/* Status Badge */}
                  <Badge
                    variant="secondary"
                    className={`self-start text-xs px-1.5 py-0 ${
                      product.status === "available"
                        ? "bg-black text-white"
                        : product.status === "low stock"
                        ? "bg-amber-100 text-amber-800 border border-amber-200"
                        : "bg-white text-black border border-black"
                    }`}
                  >
                    {product.status}
                  </Badge>

                  {/* Name */}
                  <div>
                    <p className="font-semibold text-sm leading-tight line-clamp-2">{product.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{product.sku}</p>
                  </div>

                  {/* Category */}
                  <Badge variant="outline" className="self-start text-xs px-1.5">
                    {product.category}
                  </Badge>

                  {/* Description — hidden on smallest screens */}
                  <p className="text-xs text-muted-foreground line-clamp-2 hidden sm:block">
                    {product.description}
                  </p>

                  {/* Price */}
                  <div className="mt-auto pt-1">
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg sm:text-xl font-bold">
                        ฿{getPrice(product).toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground">/ unit</span>
                    </div>
                    {selectedStore.tier !== "bronze" && (
                      <p className="text-xs text-green-600 font-medium">
                        ประหยัด ฿{(product.tierPricing.bronze - getPrice(product)).toLocaleString()} / unit
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Min. {product.minOrder} · Stock {product.stock.toLocaleString()}
                    </p>
                  </div>

                  {/* Add to Cart */}
                  <Button
                    className="w-full bg-black text-white hover:bg-gray-800 h-8 sm:h-9 text-xs sm:text-sm mt-1"
                    onClick={() => addToCart(product)}
                    disabled={product.status === "out of stock"}
                  >
                    <ShoppingCart className="h-3.5 w-3.5 mr-1.5 shrink-0" />
                    <span className="truncate">
                      {product.status === "out of stock" ? "หมดสต็อก" : `เพิ่มลงตะกร้า (${product.minOrder})`}
                    </span>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12">
        <div className="container mx-auto px-4 py-5">
          <p className="text-center text-xs text-muted-foreground">
            © 2026 LINE@ Product Catalog. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
