import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import JoinPage from "./pages/auth/JoinPage";
import TabPage from "./pages/tabs/TabPage";
import SettlePage from "./pages/tabs/SettlePage";
import ProtectedRoute from "./components/ProtectedRoute";
import { AnimatePresence, motion } from "framer-motion";

export default function App() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/tabs/:id/settle"
            element={
              <ProtectedRoute>
                <SettlePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/join"
            element={
              <ProtectedRoute>
                <JoinPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tabs/:id"
            element={
              <ProtectedRoute>
                <TabPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}
