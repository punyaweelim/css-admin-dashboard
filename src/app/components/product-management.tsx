import { useState } from "react";
import { ShoppingBag, Search, Plus, Edit, Trash2 } from "lucide-react";
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

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  minOrder: number;
  description: string;
  status: "available" | "low stock" | "out of stock";
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
    status: "available",
  },
];

export function ProductManagement() {
  const [products] = useState<Product[]>(mockProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-black text-white";
      case "low stock":
        return "bg-gray-400 text-white";
      case "out of stock":
        return "bg-white text-black border border-black";
      default:
        return "bg-gray-200 text-black";
    }
  };

  const stats = {
    total: products.length,
    available: products.filter((p) => p.status === "available").length,
    lowStock: products.filter((p) => p.status === "low stock").length,
    outOfStock: products.filter((p) => p.status === "out of stock").length,
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.available}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Low Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lowStock}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Out of Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.outOfStock}</div>
          </CardContent>
        </Card>
      </div>

      {/* Product Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Product Management
            </CardTitle>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Product</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Product Name</Label>
                    <Input placeholder="Enter product name" />
                  </div>
                  <div>
                    <Label>SKU</Label>
                    <Input placeholder="SKU-XXXX" />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Input placeholder="Product category" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Price (฿)</Label>
                      <Input type="number" placeholder="0.00" />
                    </div>
                    <div>
                      <Label>Stock Quantity</Label>
                      <Input type="number" placeholder="0" />
                    </div>
                  </div>
                  <div>
                    <Label>Minimum Order</Label>
                    <Input type="number" placeholder="0" />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea placeholder="Product description" />
                  </div>
                  <Button className="w-full">Save Product</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="flex gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, SKU, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Min Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-mono">{product.id}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>฿{product.price.toLocaleString()}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>{product.minOrder}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(product.status)} variant="secondary">
                      {product.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedProduct(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Product: {selectedProduct?.id}</DialogTitle>
                          </DialogHeader>
                          {selectedProduct && (
                            <div className="space-y-4">
                              <div>
                                <Label>Product Name</Label>
                                <Input defaultValue={selectedProduct.name} />
                              </div>
                              <div>
                                <Label>SKU</Label>
                                <Input defaultValue={selectedProduct.sku} />
                              </div>
                              <div>
                                <Label>Category</Label>
                                <Input defaultValue={selectedProduct.category} />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Price (฿)</Label>
                                  <Input type="number" defaultValue={selectedProduct.price} />
                                </div>
                                <div>
                                  <Label>Stock Quantity</Label>
                                  <Input type="number" defaultValue={selectedProduct.stock} />
                                </div>
                              </div>
                              <div>
                                <Label>Minimum Order</Label>
                                <Input type="number" defaultValue={selectedProduct.minOrder} />
                              </div>
                              <div>
                                <Label>Description</Label>
                                <Textarea defaultValue={selectedProduct.description} />
                              </div>
                              <Button className="w-full">Update Product</Button>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
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
