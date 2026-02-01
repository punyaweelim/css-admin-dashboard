import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AdminDashboard } from "@/app/components/admin-dashboard";
import { ProductCatalog } from "@/app/components/product-catalog";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/product-catalog" element={<ProductCatalog />} />
      </Routes>
    </BrowserRouter>
  );
}
