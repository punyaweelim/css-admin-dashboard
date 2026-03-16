import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AdminDashboard } from "@/app/components/admin-dashboard";
import { ProductCatalog } from "@/app/components/product-catalog";
import { PasswordGate } from "@/app/components/password-gate";

export default function App() {
  return (
    <PasswordGate>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
        </Routes>
      </BrowserRouter>
    </PasswordGate>
  );
}
