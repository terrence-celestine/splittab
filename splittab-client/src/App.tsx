import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import JoinPage from "./pages/auth/JoinPage";
import TabPage from "./pages/tabs/TabPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/join" element={<JoinPage />} />
      <Route path="/tabs/:id" element={<TabPage />} />
    </Routes>
  );
}
