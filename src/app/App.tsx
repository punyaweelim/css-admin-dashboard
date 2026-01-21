import { useState } from "react";
import { Package, Users, Receipt, ShoppingBag, MessageSquare } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { OrderManagement } from "@/app/components/order-management";
import { BillingManagement } from "@/app/components/billing-management";
import { CustomerManagement } from "@/app/components/customer-management";
import { ProductManagement } from "@/app/components/product-management";

export default function App() {
  const [activeTab, setActiveTab] = useState("orders");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-black text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-8 w-8" />
              <div>
                <h1 className="text-xl font-semibold">LINE@ Admin Dashboard</h1>
                <p className="text-sm text-gray-400">Bulk Order Management System</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm">Connected Accounts: 3</p>
                <p className="text-xs text-gray-400">Store 1, Store 2, Store 3</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-black/5">
            <TabsTrigger value="orders" className="gap-2 data-[state=active]:bg-black data-[state=active]:text-white">
              <Package className="h-4 w-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="billing" className="gap-2 data-[state=active]:bg-black data-[state=active]:text-white">
              <Receipt className="h-4 w-4" />
              Billing
            </TabsTrigger>
            <TabsTrigger value="customers" className="gap-2 data-[state=active]:bg-black data-[state=active]:text-white">
              <Users className="h-4 w-4" />
              Customers
            </TabsTrigger>
            <TabsTrigger value="products" className="gap-2 data-[state=active]:bg-black data-[state=active]:text-white">
              <ShoppingBag className="h-4 w-4" />
              Products
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <OrderManagement />
          </TabsContent>

          <TabsContent value="billing">
            <BillingManagement />
          </TabsContent>

          <TabsContent value="customers">
            <CustomerManagement />
          </TabsContent>

          <TabsContent value="products">
            <ProductManagement />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>© 2026 LINE@ Admin Dashboard. All rights reserved.</p>
            <p>Managing 3 LINE@ Accounts</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
