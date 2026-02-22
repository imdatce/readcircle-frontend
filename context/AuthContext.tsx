/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { AuthContextType } from "@/types";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null); // <--- YENİ: Rol state'i
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setRole(null);
    localStorage.removeItem("username");
    localStorage.removeItem("token");
    router.push("/login");
  }, [router]);

  
  // Açılışta token varsa backend'den güncel profil (ve rol) bilgisini çekiyoruz
  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    const fetchProfile = async (currentToken: string) => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/auth/me`,
          {
            headers: { Authorization: `Bearer ${currentToken}` },
          },
        );
        if (res.ok) {
          const data = await res.json();
          setUser(data.username);
          setRole(data.role);
          setToken(currentToken);
        } else {
          logout();
        }
      } catch (error) {
        console.error("Profil çekilemedi", error);
      }
    };

    if (storedToken) {
      fetchProfile(storedToken);
    }
  }, [logout]); // <--- ARTIK HATA VERMEYECEK

  const login = (
    username: string,
    token: string,
    userRole: string = "ROLE_USER",
  ) => {
    setUser(username);
    setToken(token);
    setRole(userRole);
    localStorage.setItem("username", username);
    localStorage.setItem("token", token);
    // Rolü localstorage'a atmaya gerek yok, güvenlik için her açılışta /me'den çekeceğiz.
  };

  
  // --- HESAP SİLME ---
  const deleteAccount = async () => {
    try {
      const currentToken = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/auth/delete`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${currentToken}` },
        },
      );

      if (!response.ok) {
        let errorMsg = "Hesap silinirken sunucu hatası.";
        try {
          const errorData = await response.json();
          if (errorData.message) errorMsg = errorData.message;
        } catch (e) {}
        throw new Error(errorMsg);
      }
      logout();
    } catch (error) {
      throw error;
    }
  };

  // --- İSİM GÜNCELLEME ---
  const updateName = async (newName: string) => {
    const currentToken = localStorage.getItem("token");
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/auth/update-name`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentToken}`,
        },
        body: JSON.stringify({ newName }),
      },
    );

    if (!response.ok) {
      const text = await response.text();
      let errorMsg = "Kullanıcı adı güncellenemedi.";
      try {
        errorMsg = JSON.parse(text).message || errorMsg;
      } catch (e) {
        errorMsg = text || errorMsg;
      }
      throw new Error(errorMsg);
    }
    localStorage.setItem("username", newName);
    setUser(newName);
  };

  // --- ŞİFRE GÜNCELLEME ---
  const updatePassword = async (
    currentPassword: string,
    newPassword: string,
  ) => {
    const currentToken = localStorage.getItem("token");
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/auth/update-password`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentToken}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      },
    );

    if (!response.ok) {
      const text = await response.text();
      let errorMsg = "Şifre güncellenemedi.";
      try {
        errorMsg = JSON.parse(text).message || errorMsg;
      } catch (e) {
        errorMsg = text || errorMsg;
      }
      throw new Error(errorMsg);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        login,
        logout,
        deleteAccount,
        updateName,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
