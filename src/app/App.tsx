import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AdminDashboard } from "@/app/components/admin-dashboard";
import { ProductCatalog } from "@/app/components/product-catalog";
import { Button } from "@/app/components/ui/button";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/product" element={<ProductCatalog />} />
      </Routes>
    </BrowserRouter>
  );
}