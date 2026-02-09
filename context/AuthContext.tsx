"use client";
import { AuthContextType } from "@/types";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  
  useEffect(() => {
    const storedUser = localStorage.getItem("username");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      if (user !== storedUser || token !== storedToken) {
        setUser(storedUser);
        setToken(storedToken);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = (username: string, token: string) => {
    setUser(username);
    setToken(token);
    localStorage.setItem("username", username);
    localStorage.setItem("token", token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("username");
    localStorage.removeItem("token");

    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
