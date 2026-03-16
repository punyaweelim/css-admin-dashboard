import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AdminDashboard } from "@/app/components/admin-dashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
