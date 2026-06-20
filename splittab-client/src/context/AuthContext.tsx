import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { User } from "../types";
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
} from "../api/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("splittab_user");
    if (stored) setUser(JSON.parse(stored));
    setLoading(false);
  }, []);

  async function login(email: string, password: string) {
    const data = await apiLogin(email, password);
    setUser(data.user);
    localStorage.setItem("splittab_user", JSON.stringify(data.user));
  }

  async function register(name: string, email: string, password: string) {
    const data = await apiRegister(name, email, password);
    setUser(data.user);
    localStorage.setItem("splittab_user", JSON.stringify(data.user));
  }

  async function logout() {
    await apiLogout();
    setUser(null);
    localStorage.removeItem("splittab_user");
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
