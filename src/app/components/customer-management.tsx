import { useState } from "react";
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

type CustomerTier = "bronze" | "silver" | "gold" | "platinum";

interface Order {
  id: string;
  date: string;
  products: string[];
  quantity: number;
  amount: number;
  status: string;
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
  originalPrice: number; // tier-based price
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
  totalOrders: number;
  totalSpent: number;
  registeredDate: string;
  status: "active" | "inactive";
  recentOrders?: Order[];
  topProducts?: { name: string; quantity: number; times: number }[];
  customPrices?: CustomProductPrice[];
}

// All available products (from product catalog)
const allProducts = [
  {
    id: "PROD-001",
    name: "Product A",
    sku: "SKU-A001",
    category: "Electronics",
    tierPricing: { bronze: 300, silver: 280, gold: 260, platinum: 240 },
    storeId: "store1",
  },
  {
    id: "PROD-002",
    name: "Product B",
    sku: "SKU-B002",
    category: "Home & Garden",
    tierPricing: { bronze: 150, silver: 140, gold: 130, platinum: 120 },
    storeId: "store1",
  },
  {
    id: "PROD-003",
    name: "Product C",
    sku: "SKU-C003",
    category: "Fashion",
    tierPricing: { bronze: 400, silver: 375, gold: 350, platinum: 325 },
    storeId: "store2",
  },
  {
    id: "PROD-004",
    name: "Product D",
    sku: "SKU-D004",
    category: "Beauty",
    tierPricing: { bronze: 250, silver: 235, gold: 220, platinum: 205 },
    storeId: "store2",
  },
  {
    id: "PROD-005",
    name: "Product E",
    sku: "SKU-E005",
    category: "Electronics",
    tierPricing: { bronze: 500, silver: 470, gold: 440, platinum: 410 },
    storeId: "store2",
  },
  {
    id: "PROD-006",
    name: "Product F",
    sku: "SKU-F006",
    category: "Sports",
    tierPricing: { bronze: 350, silver: 330, gold: 310, platinum: 290 },
    storeId: "store3",
  },
];

const tierInfo: Record<CustomerTier, { emoji: string; name: string; color: string; bg: string }> = {
  bronze: { emoji: "🥉", name: "Bronze", color: "text-orange-700", bg: "bg-orange-100" },
  silver: { emoji: "🥈", name: "Silver", color: "text-gray-700", bg: "bg-gray-100" },
  gold: { emoji: "🥇", name: "Gold", color: "text-yellow-700", bg: "bg-yellow-100" },
  platinum: { emoji: "💎", name: "Platinum", color: "text-purple-700", bg: "bg-purple-100" },
};

const availableStores = [
  { id: "store1", name: "Store Account 1" },
  { id: "store2", name: "Store Account 2" },
  { id: "store3", name: "Store Account 3" },
];

const mockCustomers: Customer[] = [
  {
    id: "CUST-001",
    name: "สมชาย ใจดี",
    lineId: "LINE-123456",
    storeAccess: [{ storeId: "store1", storeName: "Store Account 1", tier: "gold" }],
    phone: "081-234-5678",
    email: "somchai@example.com",
    totalOrders: 5,
    totalSpent: 125000,
    registeredDate: "2025-11-15",
    status: "active",
    customPrices: [
      {
        productId: "PROD-001",
        productName: "Product A",
        sku: "SKU-A001",
        originalPrice: 260,
        customPrice: 245,
        note: "VIP deal",
      },
    ],
    recentOrders: [
      { id: "ORD-001", date: "2025-11-15", products: ["Product A", "Product B"], quantity: 2, amount: 50000, status: "completed" },
      { id: "ORD-002", date: "2025-11-16", products: ["Product C"], quantity: 1, amount: 25000, status: "completed" },
    ],
    topProducts: [
      { name: "Product A", quantity: 10, times: 2 },
      { name: "Product B", quantity: 5, times: 2 },
      { name: "Product C", quantity: 3, times: 1 },
    ],
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
    totalOrders: 8,
    totalSpent: 240000,
    registeredDate: "2025-10-20",
    status: "active",
    customPrices: [],
    recentOrders: [
      { id: "ORD-003", date: "2025-10-20", products: ["Product D", "Product E"], quantity: 3, amount: 75000, status: "completed" },
      { id: "ORD-004", date: "2025-10-21", products: ["Product F"], quantity: 1, amount: 45000, status: "completed" },
    ],
    topProducts: [
      { name: "Product D", quantity: 15, times: 3 },
      { name: "Product E", quantity: 10, times: 3 },
      { name: "Product F", quantity: 5, times: 1 },
    ],
  },
  {
    id: "CUST-003",
    name: "วิชัย ประเสริฐ",
    lineId: "LINE-345678",
    storeAccess: [{ storeId: "store3", storeName: "Store Account 3", tier: "silver" }],
    phone: "083-456-7890",
    email: "wichai@example.com",
    totalOrders: 3,
    totalSpent: 85000,
    registeredDate: "2025-12-01",
    status: "active",
    customPrices: [],
    recentOrders: [
      { id: "ORD-005", date: "2025-12-01", products: ["Product G"], quantity: 2, amount: 40000, status: "completed" },
    ],
    topProducts: [{ name: "Product G", quantity: 8, times: 2 }],
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
    totalOrders: 1,
    totalSpent: 25000,
    registeredDate: "2026-01-10",
    status: "active",
    customPrices: [],
    recentOrders: [
      { id: "ORD-006", date: "2026-01-10", products: ["Product H"], quantity: 1, amount: 25000, status: "completed" },
    ],
    topProducts: [{ name: "Product H", quantity: 3, times: 1 }],
  },
];

// ─────────────────────────────────────────────────────────────
// Sub-component: Customize Product Price Box
// ─────────────────────────────────────────────────────────────
interface CustomizePriceBoxProps {
  customer: Customer;
  onUpdate: (updated: Customer) => void;
}

function CustomizePriceBox({ customer, onUpdate }: CustomizePriceBoxProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state for adding/editing
  const [selectedProductId, setSelectedProductId] = useState("");
  const [customPriceInput, setCustomPriceInput] = useState("");
  const [noteInput, setNoteInput] = useState("");
  const [editCustomPrice, setEditCustomPrice] = useState("");
  const [editNote, setEditNote] = useState("");

  const customPrices = customer.customPrices ?? [];

  // Get products that are accessible by this customer's stores
  const accessibleStoreIds = customer.storeAccess.map((s) => s.storeId);
  const availableProductsForCustomer = allProducts.filter((p) =>
    accessibleStoreIds.includes(p.storeId)
  );

  // Already-assigned product ids
  const assignedProductIds = customPrices.map((cp) => cp.productId);
  const unassignedProducts = availableProductsForCustomer.filter(
    (p) => !assignedProductIds.includes(p.id)
  );

  // Get the customer's tier for a given product's store
  const getTierPrice = (product: typeof allProducts[0]) => {
    const storeAccess = customer.storeAccess.find((s) => s.storeId === product.storeId);
    if (!storeAccess) return product.tierPricing.bronze;
    return product.tierPricing[storeAccess.tier];
  };

  const selectedProduct = allProducts.find((p) => p.id === selectedProductId);

  const handleAddCustomPrice = () => {
    if (!selectedProductId || !customPriceInput) return;
    const product = allProducts.find((p) => p.id === selectedProductId);
    if (!product) return;

    const newEntry: CustomProductPrice = {
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      originalPrice: getTierPrice(product),
      customPrice: parseFloat(customPriceInput),
      note: noteInput || undefined,
    };

    const updated: Customer = {
      ...customer,
      customPrices: [...customPrices, newEntry],
    };
    onUpdate(updated);
    setIsAddDialogOpen(false);
    setSelectedProductId("");
    setCustomPriceInput("");
    setNoteInput("");
  };

  const handleSaveEdit = (productId: string) => {
    const updated: Customer = {
      ...customer,
      customPrices: customPrices.map((cp) =>
        cp.productId === productId
          ? { ...cp, customPrice: parseFloat(editCustomPrice), note: editNote || undefined }
          : cp
      ),
    };
    onUpdate(updated);
    setEditingId(null);
  };

  const handleDelete = (productId: string) => {
    const updated: Customer = {
      ...customer,
      customPrices: customPrices.filter((cp) => cp.productId !== productId),
    };
    onUpdate(updated);
  };

  const startEdit = (cp: CustomProductPrice) => {
    setEditingId(cp.productId);
    setEditCustomPrice(String(cp.customPrice));
    setEditNote(cp.note ?? "");
  };

  return (
    <Card className="mt-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Tag className="h-5 w-5" />
            Customize Product Price for customer
          </CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="bg-black text-white hover:bg-gray-800"
                disabled={unassignedProducts.length === 0}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Custom Price
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Custom Product Price</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                {/* Product selector */}
                <div>
                  <Label className="mb-1 block">Product</Label>
                  <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {unassignedProducts.map((p) => {
                        const tierPrice = getTierPrice(p);
                        return (
                          <SelectItem key={p.id} value={p.id}>
                            <div className="flex flex-col">
                              <span className="font-semibold">{p.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {p.sku} · Tier price: ฿{tierPrice}
                              </span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Show tier info */}
                {selectedProduct && (
                  <div className="rounded-lg bg-gray-50 p-3 text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tier Price</span>
                      <span className="font-semibold">฿{getTierPrice(selectedProduct)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Store</span>
                      <span>
                        {customer.storeAccess.find((s) => s.storeId === selectedProduct.storeId)?.storeName}
                      </span>
                    </div>
                  </div>
                )}

                {/* Custom price input */}
                <div>
                  <Label htmlFor="customPrice" className="mb-1 block">
                    Custom Price (฿)
                  </Label>
                  <Input
                    id="customPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Enter custom price"
                    value={customPriceInput}
                    onChange={(e) => setCustomPriceInput(e.target.value)}
                  />
                  {selectedProduct && customPriceInput && (
                    <p className="text-xs mt-1">
                      {parseFloat(customPriceInput) < getTierPrice(selectedProduct) ? (
                        <span className="text-green-600">
                          ลดลง ฿{(getTierPrice(selectedProduct) - parseFloat(customPriceInput)).toFixed(2)} จากราคา Tier
                        </span>
                      ) : parseFloat(customPriceInput) > getTierPrice(selectedProduct) ? (
                        <span className="text-red-500">
                          สูงกว่าราคา Tier ฿{(parseFloat(customPriceInput) - getTierPrice(selectedProduct)).toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">เท่ากับราคา Tier</span>
                      )}
                    </p>
                  )}
                </div>

                {/* Note */}
                <div>
                  <Label htmlFor="note" className="mb-1 block">
                    Note (Optional)
                  </Label>
                  <Input
                    id="note"
                    placeholder="e.g. Special deal, VIP discount"
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    className="bg-black text-white hover:bg-gray-800"
                    onClick={handleAddCustomPrice}
                    disabled={!selectedProductId || !customPriceInput}
                  >
                    Add Price
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          ตั้งราคาพิเศษสำหรับสินค้าเฉพาะลูกค้ารายนี้ (Override ราคา Tier ปกติ)
        </p>
      </CardHeader>

      <CardContent className="pt-0">
        {customPrices.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-border rounded-lg">
            <Tag className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">ยังไม่มีราคาพิเศษสำหรับลูกค้าคนนี้</p>
            <p className="text-xs text-muted-foreground mt-1">
              คลิก "Add Custom Price" เพื่อกำหนดราคาพิเศษ
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Tier Price</TableHead>
                <TableHead>Custom Price</TableHead>
                <TableHead>Difference</TableHead>
                <TableHead>Note</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customPrices.map((cp) => {
                const diff = cp.customPrice - cp.originalPrice;
                const isEditing = editingId === cp.productId;
                return (
                  <TableRow key={cp.productId}>
                    <TableCell>
                      <div>
                        <p className="font-semibold text-sm">{cp.productName}</p>
                        <p className="text-xs text-muted-foreground">{cp.sku}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      ฿{cp.originalPrice.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          type="number"
                          className="w-28 h-8 text-sm"
                          value={editCustomPrice}
                          onChange={(e) => setEditCustomPrice(e.target.value)}
                          autoFocus
                        />
                      ) : (
                        <span className="font-semibold text-black">
                          ฿{cp.customPrice.toLocaleString()}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {diff < 0 ? (
                        <Badge className="bg-green-100 text-green-700 border-0">
                          -฿{Math.abs(diff).toLocaleString()}
                        </Badge>
                      ) : diff > 0 ? (
                        <Badge className="bg-red-100 text-red-700 border-0">
                          +฿{diff.toLocaleString()}
                        </Badge>
                      ) : (
                        <Badge variant="outline">same</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          className="w-32 h-8 text-sm"
                          value={editNote}
                          onChange={(e) => setEditNote(e.target.value)}
                          placeholder="Note..."
                        />
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          {cp.note ?? "—"}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {isEditing ? (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-green-600 hover:text-green-700"
                              onClick={() => handleSaveEdit(cp.productId)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setEditingId(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => startEdit(cp)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:text-red-600"
                              onClick={() => handleDelete(cp.productId)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}

        {/* Summary */}
        {customPrices.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {customPrices.length} product{customPrices.length > 1 ? "s" : ""} with custom pricing
            </span>
            <span className="font-medium">
              {customPrices.filter((cp) => cp.customPrice < cp.originalPrice).length} discounted ·{" "}
              {customPrices.filter((cp) => cp.customPrice > cp.originalPrice).length} marked up
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────
export function CustomerManagement() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [formStoreAccess, setFormStoreAccess] = useState<StoreAccess[]>([]);

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.lineId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpdateCustomer = (updated: Customer) => {
    setCustomers(customers.map((c) => (c.id === updated.id ? updated : c)));
    setSelectedCustomer(updated);
  };

  const handleAddCustomer = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newCustomer: Customer = {
      id: `CUST-${String(customers.length + 1).padStart(3, "0")}`,
      name: formData.get("name") as string,
      lineId: formData.get("lineId") as string,
      storeAccess: formStoreAccess,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      totalOrders: 0,
      totalSpent: 0,
      registeredDate: new Date().toISOString().split("T")[0],
      status: "active",
      customPrices: [],
    };
    setCustomers([...customers, newCustomer]);
    setIsAddDialogOpen(false);
    setFormStoreAccess([]);
  };

  const handleEditCustomer = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingCustomer) return;
    const formData = new FormData(e.currentTarget);
    const updatedCustomer: Customer = {
      ...editingCustomer,
      name: formData.get("name") as string,
      lineId: formData.get("lineId") as string,
      storeAccess: formStoreAccess,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      status: formData.get("status") as "active" | "inactive",
    };
    setCustomers(customers.map((c) => (c.id === editingCustomer.id ? updatedCustomer : c)));
    setEditingCustomer(null);
    setFormStoreAccess([]);
  };

  const handleDeleteCustomer = (id: string) => {
    setCustomers(customers.filter((c) => c.id !== id));
  };

  const toggleStoreAccess = (storeId: string, storeName: string) => {
    const existingIndex = formStoreAccess.findIndex((s) => s.storeId === storeId);
    if (existingIndex >= 0) {
      setFormStoreAccess(formStoreAccess.filter((s) => s.storeId !== storeId));
    } else {
      setFormStoreAccess([...formStoreAccess, { storeId, storeName, tier: "bronze" }]);
    }
  };

  const updateStoreTier = (storeId: string, tier: CustomerTier) => {
    setFormStoreAccess(
      formStoreAccess.map((s) => (s.storeId === storeId ? { ...s, tier } : s))
    );
  };

  const CustomerForm = ({ customer }: { customer?: Customer }) => {
    useState(() => {
      if (customer) {
        setFormStoreAccess(customer.storeAccess);
      } else {
        setFormStoreAccess([]);
      }
    });

    return (
      <form onSubmit={customer ? handleEditCustomer : handleAddCustomer} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" defaultValue={customer?.name} required />
          </div>
          <div>
            <Label htmlFor="lineId">LINE ID</Label>
            <Input id="lineId" name="lineId" defaultValue={customer?.lineId} required />
          </div>
        </div>

        <div>
          <Label className="mb-2 block">Store Access & Membership Tier</Label>
          <div className="space-y-3 border border-border rounded-lg p-4">
            {availableStores.map((store) => {
              const isSelected = formStoreAccess.some((s) => s.storeId === store.id);
              const storeData = formStoreAccess.find((s) => s.storeId === store.id);
              return (
                <div key={store.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={store.id}
                      checked={isSelected}
                      onCheckedChange={() => toggleStoreAccess(store.id, store.name)}
                    />
                    <Label htmlFor={store.id} className="cursor-pointer flex-1">
                      {store.name}
                    </Label>
                  </div>
                  {isSelected && (
                    <div className="ml-6">
                      <Select
                        value={storeData?.tier || "bronze"}
                        onValueChange={(value) => updateStoreTier(store.id, value as CustomerTier)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select tier" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(tierInfo).map(([tier, info]) => (
                            <SelectItem key={tier} value={tier}>
                              <div className="flex items-center gap-2">
                                <span>{info.emoji}</span>
                                <span>{info.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" defaultValue={customer?.phone} required />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" defaultValue={customer?.email} required />
          </div>
        </div>

        {customer && (
          <div>
            <Label htmlFor="status">Status</Label>
            <Select name="status" defaultValue={customer.status}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsAddDialogOpen(false);
              setEditingCustomer(null);
              setFormStoreAccess([]);
            }}
          >
            Cancel
          </Button>
          <Button type="submit" className="bg-black text-white hover:bg-gray-800">
            {customer ? "Update" : "Add"} Customer
          </Button>
        </div>
      </form>
    );
  };

  // ── Customer Detail View ──
  if (selectedCustomer) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => setSelectedCustomer(null)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Customers
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: Customer Info */}
          <div className="lg:col-span-1 space-y-0">
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">Name</Label>
                  <p className="font-semibold">{selectedCustomer.name}</p>
                </div>

                <div>
                  <Label className="text-muted-foreground">Store Access & Tiers</Label>
                  <div className="space-y-2 mt-2">
                    {selectedCustomer.storeAccess.map((store, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">{store.storeName}</span>
                        <Badge className={`${tierInfo[store.tier].bg} ${tierInfo[store.tier].color} border-0`}>
                          <span className="mr-1">{tierInfo[store.tier].emoji}</span>
                          {tierInfo[store.tier].name}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-muted-foreground">LINE ID</Label>
                  <p className="font-semibold">{selectedCustomer.lineId}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Phone</Label>
                  <p className="font-semibold">{selectedCustomer.phone}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-semibold">{selectedCustomer.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Member Since</Label>
                  <p className="font-semibold">
                    {new Date(selectedCustomer.registeredDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <Badge
                    variant="secondary"
                    className={selectedCustomer.status === "active" ? "bg-black text-white" : "bg-gray-400 text-white"}
                  >
                    {selectedCustomer.status}
                  </Badge>
                </div>

                <div className="pt-4 border-t">
                  <Button
                    className="w-full bg-black text-white hover:bg-gray-800"
                    onClick={() => navigate(`/product-catalog/${selectedCustomer.id}`)}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    View Product Catalog
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* ★ Customize Product Price Box */}
            <CustomizePriceBox
              customer={selectedCustomer}
              onUpdate={handleUpdateCustomer}
            />
          </div>

          {/* Right column: Stats, Orders, Products */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-black/5 rounded-lg">
                      <ShoppingCart className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Orders</p>
                      <p className="text-2xl font-bold">{selectedCustomer.totalOrders}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-black/5 rounded-lg">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Spent</p>
                      <p className="text-2xl font-bold">
                        ฿{selectedCustomer.totalSpent.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedCustomer.recentOrders?.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div>
                        <p className="font-semibold">{order.id}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.date).toLocaleDateString()}
                        </p>
                        <p className="text-sm mt-1">{order.products.join(", ")}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">฿{order.amount.toLocaleString()}</p>
                        <Badge variant="outline">{order.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Most Ordered Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {selectedCustomer.topProducts?.map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-semibold">{product.name}</p>
                        <p className="text-sm text-muted-foreground">Ordered {product.times} times</p>
                      </div>
                      <Badge variant="secondary">{product.quantity} units</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // ── Customer List View ──
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Customer Management
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manage customers and their store access
              </p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-black text-white hover:bg-gray-800">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Customer
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Customer</DialogTitle>
                </DialogHeader>
                <CustomerForm />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tier Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(tierInfo).map(([tier, info]) => {
          const count = customers.reduce(
            (sum, c) => sum + c.storeAccess.filter((s) => s.tier === tier).length,
            0
          );
          return (
            <Card key={tier}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{info.emoji}</span>
                    <div>
                      <p className="text-sm text-muted-foreground">{info.name}</p>
                      <p className="text-2xl font-bold">{count}</p>
                    </div>
                  </div>
                  <Award className="h-8 w-8 text-muted-foreground/20" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Customers Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer Info</TableHead>
                <TableHead>Store Access</TableHead>
                <TableHead>LINE ID</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Custom Prices</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow
                  key={customer.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => setSelectedCustomer(customer)}
                >
                  <TableCell>
                    <div>
                      <div className="font-semibold">{customer.name}</div>
                      <div className="text-sm text-muted-foreground">{customer.id}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {customer.storeAccess.map((store, index) => (
                        <Badge
                          key={index}
                          className={`${tierInfo[store.tier].bg} ${tierInfo[store.tier].color} border-0 mr-1`}
                        >
                          <span className="mr-1">{tierInfo[store.tier].emoji}</span>
                          {store.storeName.replace("Store Account ", "S")}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-semibold">{customer.lineId}</div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm">{customer.phone}</div>
                      <div className="text-xs text-muted-foreground">{customer.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{customer.totalOrders}</TableCell>
                  <TableCell>฿{customer.totalSpent.toLocaleString()}</TableCell>
                  <TableCell>
                    {(customer.customPrices?.length ?? 0) > 0 ? (
                      <Badge className="bg-purple-100 text-purple-700 border-0">
                        <Tag className="h-3 w-3 mr-1" />
                        {customer.customPrices!.length} items
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={customer.status === "active" ? "bg-black text-white" : "bg-gray-400 text-white"}
                    >
                      {customer.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/product-catalog/${customer.id}`);
                        }}
                        title="View Product Catalog"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Dialog
                        open={editingCustomer?.id === customer.id}
                        onOpenChange={(open) => {
                          if (!open) {
                            setEditingCustomer(null);
                            setFormStoreAccess([]);
                          }
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingCustomer(customer);
                              setFormStoreAccess(customer.storeAccess);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Edit Customer</DialogTitle>
                          </DialogHeader>
                          <CustomerForm customer={customer} />
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCustomer(customer.id);
                        }}
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
