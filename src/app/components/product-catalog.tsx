import { useState } from "react";
import { ShoppingCart, Search, Filter, Plus, Minus, Trash2, X } from "lucide-react";
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

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  minOrder: number;
  description: string;
  imageUrl?: string;
  status: "available" | "low stock" | "out of stock";
}

interface CartItem extends Product {
  quantity: number;
}

const mockProducts: Product[] = [
  {
    id: "PROD-001",
    name: "Product A",
    sku: "SKU-A001",
    category: "Electronics",
    price: 300,
    stock: 500,
    minOrder: 50,
    description: "High-quality electronic product suitable for bulk orders",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
    status: "available",
  },
  {
    id: "PROD-002",
    name: "Product B",
    sku: "SKU-B002",
    category: "Home & Garden",
    price: 150,
    stock: 200,
    minOrder: 100,
    description: "Popular home and garden item with excellent reviews",
    imageUrl: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400",
    status: "available",
  },
  {
    id: "PROD-003",
    name: "Product C",
    sku: "SKU-C003",
    category: "Fashion",
    price: 400,
    stock: 50,
    minOrder: 25,
    description: "Trendy fashion product perfect for resellers",
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
    status: "low stock",
  },
  {
    id: "PROD-004",
    name: "Product D",
    sku: "SKU-D004",
    category: "Beauty",
    price: 250,
    stock: 0,
    minOrder: 50,
    description: "Premium beauty product - currently restocking",
    imageUrl: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=400",
    status: "out of stock",
  },
  {
    id: "PROD-005",
    name: "Product E",
    sku: "SKU-E005",
    category: "Electronics",
    price: 500,
    stock: 1000,
    minOrder: 30,
    description: "Best-selling electronic gadget with warranty",
    imageUrl: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400",
    status: "available",
  },
];

export function ProductCatalog() {
  const [products] = useState<Product[]>(mockProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(products.map((p) => p.category)));

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + product.minOrder }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: product.minOrder }]);
    }
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    const product = products.find((p) => p.id === productId);
    if (product && newQuantity >= product.minOrder) {
      setCart(
        cart.map((item) =>
          item.id === productId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.id !== productId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-black text-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">Product Catalog</h1>
              <p className="text-sm text-gray-400">Browse and order bulk products</p>
            </div>
            <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="relative bg-white text-black hover:bg-gray-100">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Cart
                  {cart.length > 0 && (
                    <Badge className="ml-2 bg-black text-white">{cart.length}</Badge>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Shopping Cart ({cartItemsCount} items)</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {cart.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Your cart is empty
                    </p>
                  ) : (
                    <>
                      {cart.map((item) => (
                        <div key={item.id} className="flex gap-4 border-b border-border pb-4">
                          <div className="w-20 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                            {item.imageUrl && (
                              <ImageWithFallback
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold">{item.name}</h4>
                            <p className="text-sm text-muted-foreground">{item.sku}</p>
                            <p className="text-sm font-semibold mt-1">
                              ฿{item.price.toLocaleString()} each
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(item.id, item.quantity - item.minOrder)}
                                disabled={item.quantity <= item.minOrder}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="text-sm min-w-[60px] text-center">
                                {item.quantity} units
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(item.id, item.quantity + item.minOrder)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">
                              ฿{(item.price * item.quantity).toLocaleString()}
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFromCart(item.id)}
                              className="mt-2"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      <div className="border-t border-border pt-4">
                        <div className="flex justify-between text-lg font-semibold mb-4">
                          <span>Total:</span>
                          <span>฿{cartTotal.toLocaleString()}</span>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <Label>LINE ID</Label>
                            <Input placeholder="Enter your LINE ID" />
                          </div>
                          <div>
                            <Label>Notes (Optional)</Label>
                            <Textarea placeholder="Any special instructions?" />
                          </div>
                          <Button className="w-full bg-black text-white hover:bg-gray-800">
                            Submit Order
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Search Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-square bg-gray-100 overflow-hidden">
                {product.imageUrl && (
                  <ImageWithFallback
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base">{product.name}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">{product.sku}</p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={
                      product.status === "available"
                        ? "bg-black text-white"
                        : product.status === "low stock"
                        ? "bg-gray-400 text-white"
                        : "bg-white text-black border border-black"
                    }
                  >
                    {product.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Badge variant="outline">{product.category}</Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {product.description}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">
                    ฿{product.price.toLocaleString()}
                  </span>
                  <span className="text-xs text-muted-foreground">per unit</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Min. Order: {product.minOrder} units</p>
                  <p>Stock: {product.stock} units</p>
                </div>
                <Button
                  className="w-full bg-black text-white hover:bg-gray-800"
                  onClick={() => addToCart(product)}
                  disabled={product.status === "out of stock"}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart ({product.minOrder} min)
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No products found</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2026 LINE@ Product Catalog. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
