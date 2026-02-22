/* eslint-disable @typescript-eslint/no-unused-vars */
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

  // --- HESAP SİLME ---
  const deleteAccount = async () => {
    try {
      const currentToken = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/auth/delete`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        },
      );

      if (!response.ok) {
        let errorMsg = "Hesap silinirken sunucu hatası.";
        try {
          const errorData = await response.json();
          if (errorData.message) errorMsg = errorData.message;
        } catch (e) {}
        throw new Error(errorMsg); // Hatayı yakalayıp bileşene fırlatıyoruz
      }

      logout();
    } catch (error) {
      console.error("Hesap silinemedi:", error);
      throw error; // Hatayı UI tarafına fırlat
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
      // Gelen yanıtı önce düz metin olarak okuyoruz ki uygulama çökmesin
      const text = await response.text();
      let errorMsg = "İsim güncellenemedi.";
      try {
        errorMsg = JSON.parse(text).message || errorMsg;
      } catch (e) {
        errorMsg = text || errorMsg; // Eğer JSON değilse, doğrudan düz metni kullan
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
      // Aynı şekilde güvenli hata okuması yapıyoruz
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
