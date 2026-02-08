import { useState } from "react";
import { ShoppingBag, Search, Plus, Edit, Trash2, Upload } from "lucide-react";
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
}

const mockProducts: Product[] = [
  {
    id: "PROD-001",
    name: "Product A",
    sku: "SKU-A001",
    category: "Electronics",
    tierPricing: {
      bronze: 300,
      silver: 280,
      gold: 260,
      platinum: 240,
    },
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
    tierPricing: {
      bronze: 150,
      silver: 140,
      gold: 130,
      platinum: 120,
    },
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
    tierPricing: {
      bronze: 400,
      silver: 375,
      gold: 350,
      platinum: 325,
    },
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
    tierPricing: {
      bronze: 250,
      silver: 235,
      gold: 220,
      platinum: 205,
    },
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
    tierPricing: {
      bronze: 500,
      silver: 470,
      gold: 440,
      platinum: 410,
    },
    stock: 1000,
    minOrder: 30,
    description: "Best-selling electronic gadget with warranty",
    imageUrl: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400",
    status: "available",
  },
];

export function ProductManagement() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
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
    };
    setProducts([...products, newProduct]);
    setIsAddDialogOpen(false);
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
    };
    setProducts(
      products.map((p) => (p.id === editingProduct.id ? updatedProduct : p))
    );
    setEditingProduct(null);
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  const ProductForm = ({ product }: { product?: Product }) => (
    <form
      onSubmit={product ? handleEditProduct : handleAddProduct}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Product Name</Label>
          <Input
            id="name"
            name="name"
            defaultValue={product?.name}
            required
          />
        </div>
        <div>
          <Label htmlFor="sku">SKU</Label>
          <Input id="sku" name="sku" defaultValue={product?.sku} required />
        </div>
      </div>
      <div>
        <Label htmlFor="category">Category</Label>
        <Input
          id="category"
          name="category"
          defaultValue={product?.category}
          required
        />
      </div>
      <div>
        <Label className="mb-2 block">Tier Pricing (฿)</Label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="priceBronze" className="text-xs text-muted-foreground">
              🥉 Bronze
            </Label>
            <Input
              id="priceBronze"
              name="priceBronze"
              type="number"
              defaultValue={product?.tierPricing.bronze}
              required
            />
          </div>
          <div>
            <Label htmlFor="priceSilver" className="text-xs text-muted-foreground">
              🥈 Silver
            </Label>
            <Input
              id="priceSilver"
              name="priceSilver"
              type="number"
              defaultValue={product?.tierPricing.silver}
              required
            />
          </div>
          <div>
            <Label htmlFor="priceGold" className="text-xs text-muted-foreground">
              🥇 Gold
            </Label>
            <Input
              id="priceGold"
              name="priceGold"
              type="number"
              defaultValue={product?.tierPricing.gold}
              required
            />
          </div>
          <div>
            <Label htmlFor="pricePlatinum" className="text-xs text-muted-foreground">
              💎 Platinum
            </Label>
            <Input
              id="pricePlatinum"
              name="pricePlatinum"
              type="number"
              defaultValue={product?.tierPricing.platinum}
              required
            />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="stock">Stock</Label>
          <Input
            id="stock"
            name="stock"
            type="number"
            defaultValue={product?.stock}
            required
          />
        </div>
        <div>
          <Label htmlFor="minOrder">Min Order Quantity</Label>
          <Input
            id="minOrder"
            name="minOrder"
            type="number"
            defaultValue={product?.minOrder}
            required
          />
        </div>
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={product?.description}
          required
        />
      </div>
      <div>
        <Label htmlFor="imageUrl">Image URL</Label>
        <Input
          id="imageUrl"
          name="imageUrl"
          defaultValue={product?.imageUrl}
          placeholder="https://example.com/image.jpg"
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setIsAddDialogOpen(false);
            setEditingProduct(null);
          }}
        >
          Cancel
        </Button>
        <Button type="submit" className="bg-black text-white hover:bg-gray-800">
          {product ? "Update" : "Add"} Product
        </Button>
      </div>
    </form>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Product Management
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manage products with tier-based pricing
              </p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
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
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Product Info</TableHead>
                <TableHead>Tier Pricing (฿)</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Min Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden">
                      {product.imageUrl && (
                        <ImageWithFallback
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-semibold">{product.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {product.sku}
                      </div>
                      <Badge variant="outline" className="mt-1">
                        {product.category}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-sm">
                      <div>🥉 Bronze: ฿{product.tierPricing.bronze}</div>
                      <div>🥈 Silver: ฿{product.tierPricing.silver}</div>
                      <div>🥇 Gold: ฿{product.tierPricing.gold}</div>
                      <div>💎 Platinum: ฿{product.tierPricing.platinum}</div>
                    </div>
                  </TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>{product.minOrder}</TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Dialog
                        open={editingProduct?.id === product.id}
                        onOpenChange={(open) =>
                          !open && setEditingProduct(null)
                        }
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingProduct(product)}
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
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
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
