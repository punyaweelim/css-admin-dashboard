import { useState, useEffect, useMemo } from "react";
import { Tag, Plus, Edit, Trash2, Search, Loader2, Info, ChevronLeft, ChevronRight } from "lucide-react";
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
import { api } from "@/app/utils/api";
import { toast } from "sonner";

interface Promotion {
  id: string;
  name: string;
  description: string;
  targetTier?: string;
  targetCategory: string;
  minQuantity: number;
  rewardQuantity: number;
  status: "active" | "inactive";
}

const TIERS = [
  { id: "all", name: "All Tiers" },
  { id: "bronze", name: "Bronze" },
  { id: "silver", name: "Silver" },
  { id: "gold", name: "Gold" },
  { id: "platinum", name: "Platinum" },
];

const ITEMS_PER_PAGE = 10;

export function PromotionManagement() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [promoRes, catRes] = await Promise.all([
        api.get<any>("/promotions?limit=1000"),
        api.get<any>("/products/categories"),
      ]);
      setPromotions(promoRes || []);
      setCategories(catRes || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPromotions = promotions.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.targetCategory.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPromotions.length / ITEMS_PER_PAGE);
  const paginatedPromotions = filteredPromotions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleAddPromotion = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const tier = formData.get("targetTier") as string;
    
    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      targetTier: tier === "all" ? null : tier,
      targetCategory: formData.get("targetCategory") as string,
      minQuantity: Number(formData.get("minQuantity")),
      rewardQuantity: Number(formData.get("rewardQuantity")),
    };

    try {
      await api.post("/promotions", data);
      setIsAddDialogOpen(false);
      fetchData();
      toast.success("Promotion created successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to create promotion");
    }
  };

  const handleEditPromotion = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingPromotion) return;
    const formData = new FormData(e.currentTarget);
    const tier = formData.get("targetTier") as string;

    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      targetTier: tier === "all" ? null : tier,
      targetCategory: formData.get("targetCategory") as string,
      minQuantity: Number(formData.get("minQuantity")),
      rewardQuantity: Number(formData.get("rewardQuantity")),
      status: formData.get("status") as string,
    };

    try {
      await api.put(`/promotions/${editingPromotion.id}`, data);
      setEditingPromotion(null);
      fetchData();
      toast.success("Promotion updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update promotion");
    }
  };

  const handleDeletePromotion = async (id: string) => {
    if (!confirm("Are you sure you want to delete this promotion?")) return;
    try {
      await api.delete(`/promotions/${id}`);
      fetchData();
      toast.success("Promotion deleted successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete promotion");
    }
  };

  const PromotionForm = ({ promotion }: { promotion?: Promotion }) => (
    <form onSubmit={promotion ? handleEditPromotion : handleAddPromotion} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Promotion Name *</Label>
        <Input id="name" name="name" defaultValue={promotion?.name} required placeholder="e.g. Seed Bulk Buy Bonus" />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="targetTier">Customer Tier</Label>
          <Select name="targetTier" defaultValue={promotion?.targetTier || "all"}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {TIERS.map((t) => (<SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="targetCategory">Product Category *</Label>
          <Select name="targetCategory" defaultValue={promotion?.targetCategory || categories[0]}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {categories.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="minQuantity">Buy Quantity (Threshold) *</Label>
          <Input id="minQuantity" name="minQuantity" type="number" defaultValue={promotion?.minQuantity || 300} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rewardQuantity">Free Quantity (Bonus) *</Label>
          <Input id="rewardQuantity" name="rewardQuantity" type="number" defaultValue={promotion?.rewardQuantity || 30} required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input id="description" name="description" defaultValue={promotion?.description} placeholder="Short details for staff..." />
      </div>

      {promotion && (
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select name="status" defaultValue={promotion.status}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={() => { setIsAddDialogOpen(false); setEditingPromotion(null); }}>Cancel</Button>
        <Button type="submit" className="bg-black text-white">{promotion ? "Update" : "Create"} Promotion</Button>
      </div>
    </form>
  );

  return (
    <div className="space-y-6">
      <Card className="shadow-sm border-gray-100">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-black">Promotion Management</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Create bulk order bonuses based on product categories and customer tiers.</p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-black text-white hover:bg-gray-800 shadow-lg shadow-black/20"><Plus className="h-4 w-4 mr-2" /> Add Promotion</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader><DialogTitle>New Promotion Rule</DialogTitle></DialogHeader>
                <PromotionForm />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search promotions..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="pl-10 h-12 bg-gray-50 border-gray-100 rounded-xl" />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-gray-100 overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-black" />
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Loading Promotions...</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="font-bold py-4">Promotion Name</TableHead>
                    <TableHead className="font-bold">Target Tier</TableHead>
                    <TableHead className="font-bold">Category</TableHead>
                    <TableHead className="font-bold">Rule</TableHead>
                    <TableHead className="font-bold text-center">Status</TableHead>
                    <TableHead className="text-right font-bold pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedPromotions.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-20 text-gray-400 italic">No promotions found</TableCell></TableRow>
                  ) : (
                    paginatedPromotions.map((p) => (
                      <TableRow key={p.id} className="group transition-colors hover:bg-gray-50/50">
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-lg flex items-center justify-center shadow-sm"><Tag className="h-5 w-5" /></div>
                            <div>
                              <div className="font-bold text-black">{p.name}</div>
                              <div className="text-[10px] text-gray-400 font-medium line-clamp-1">{p.description}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`font-black uppercase text-[10px] ${p.targetTier ? 'border-black text-black' : 'border-gray-200 text-gray-400'}`}>
                            {p.targetTier || "All Tiers"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-black text-white text-[10px] font-bold px-2 py-0.5">{p.targetCategory}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-black">Buy {p.minQuantity.toLocaleString()} ea</span>
                            <span className="text-[10px] text-green-600 font-black flex items-center gap-1"><Plus className="h-2.5 w-2.5" /> Get {p.rewardQuantity.toLocaleString()} Free</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={`${p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'} text-[10px] font-black uppercase`}>
                            {p.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <div className="flex justify-end gap-1">
                            <Dialog open={editingPromotion?.id === p.id} onOpenChange={(open) => { if (!open) setEditingPromotion(null); }}>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-400 hover:text-black hover:bg-gray-100" onClick={() => setEditingPromotion(p)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-md">
                                <DialogHeader><DialogTitle>Edit Promotion Rule</DialogTitle></DialogHeader>
                                <PromotionForm promotion={p} />
                              </DialogContent>
                            </Dialog>
                            <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-400 hover:text-red-600 hover:bg-red-50" onClick={() => handleDeletePromotion(p.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* Pagination UI */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-white">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredPromotions.length)} of {filteredPromotions.length}
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

      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3 items-start">
        <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-700 leading-relaxed">
          <p className="font-bold mb-1">How it works:</p>
          <p>Promotions are automatically applied during order creation. If a customer reaches the <strong>Buy Quantity</strong> threshold for products in the <strong>Target Category</strong>, the system calculates a discount equivalent to the price of the <strong>Free Quantity</strong> of products in that same category.</p>
        </div>
      </div>
    </div>
  );
}
