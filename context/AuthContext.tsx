/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { getToken, onMessage } from "firebase/messaging";
import { fetchMessaging, messaging } from "@/utils/firebase";
import { useLanguage } from "@/context/LanguageContext"; // i18n EKLENDİ

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { t } = useLanguage(); // ÇEVİRİ FONKSİYONU
  const [user, setUser] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
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

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUsername = localStorage.getItem("username");

    if (storedToken && storedUsername) {
      setUser(storedUsername);
      setToken(storedToken);
    }

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
          localStorage.setItem("username", data.username);

          if (data.country && data.city) {
            localStorage.setItem(
              "prayer_location",
              JSON.stringify({
                country: data.country,
                city: data.city,
                district: data.district || "",
              }),
            );
            window.dispatchEvent(new Event("locationUpdated"));
          }
        } else if (res.status === 401 || res.status === 403) {
          logout();
        }
      } catch (error) {
        console.error("Profil çekilemedi, ağ hatası olabilir", error);
      }
    };

    if (storedToken) {
      fetchProfile(storedToken);
    }
  }, [logout]);

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
        let errorMsg =
          t("errorAccountDelete") || "Hesap silinirken sunucu hatası.";
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
      let errorMsg = t("errorUpdateName") || "Kullanıcı adı güncellenemedi.";
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
      let errorMsg = t("errorUpdatePassword") || "Şifre güncellenemedi.";
      try {
        errorMsg = JSON.parse(text).message || errorMsg;
      } catch (e) {
        errorMsg = text || errorMsg;
      }
      throw new Error(errorMsg);
    }
  };

  const registerNotification = async () => {
    try {
      const messagingInstance = await fetchMessaging();
      if (!messagingInstance) return;

      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;

      const currentToken = await getToken(messagingInstance, {
        vapidKey:
          "BLeSjgUdjGkb7SdoIA-brUZ461OjDFeJxv_hTrUQkw8cs-7oU2RRDgQni8Q7Fcrsy6Em0gryoNHYcoCU4dzjvZg",
      });

      if (currentToken) {
        const authToken = localStorage.getItem("token");
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/auth/fcm-token`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({ token: currentToken }),
          },
        );
      } else {
        alert(t("errorFcmToken") || "HATA: Token alınamadı!");
      }
    } catch (error: any) {
      alert((t("unexpectedError") || "BEKLENMEYEN HATA: ") + error.message);
      console.error("Bildirim kaydı sırasında hata:", error);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined" && messaging) {
      const unsubscribe = onMessage(messaging, (payload) => {
        console.log("Mesaj geldi:", payload);
        // Bildirim başlığı ve içeriğini gösterme
        alert(`${payload.notification?.title}: ${payload.notification?.body}`);
      });
      return () => unsubscribe();
    }
  }, []);

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
        registerNotification,
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
