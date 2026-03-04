/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { useLanguage } from "@/context/LanguageContext";
import { Capacitor } from "@capacitor/core";
import { FirebaseMessaging } from "@capacitor-firebase/messaging";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { t } = useLanguage();
  const [user, setUser] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  // --- ÇIKIŞ YAPMA ---
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setRole(null);
    localStorage.removeItem("username");
    localStorage.removeItem("token");
    router.push("/login");
  }, [router]);

 // --- PROFİL GETİRME VE İLK YÜKLEME ---
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("token");
      const storedUsername = localStorage.getItem("username");

      // 1. Önce LocalStorage'daki bilgileri state'e yaz 
      // (Linter hatasını aşmak için async bir fonksiyonun içinde yapıyoruz)
      if (storedToken && storedUsername) {
        setUser(storedUsername);
        setToken(storedToken);
      }

      // 2. Eğer token varsa Backend'e gidip profil verilerini doğrula
      if (storedToken) {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/auth/me`,
            {
              headers: { Authorization: `Bearer ${storedToken}` },
            }
          );
          
          if (res.ok) {
            const data = await res.json();
            setUser(data.username);
            setRole(data.role);
            setToken(storedToken);
            localStorage.setItem("username", data.username);

            if (data.country && data.city) {
              localStorage.setItem(
                "prayer_location",
                JSON.stringify({
                  country: data.country,
                  city: data.city,
                  district: data.district || "",
                })
              );
              window.dispatchEvent(new Event("locationUpdated"));
            }
          } else if (res.status === 401 || res.status === 403) {
            // Token süresi dolmuş veya geçersizse çıkış yap
            logout();
          }
        } catch (error) {
          console.error("Profil çekilemedi, ağ hatası olabilir", error);
        }
      }
    };

    initializeAuth();
  }, [logout]);

  // --- GİRİŞ YAPMA ---
  const login = useCallback(
    (username: string, newToken: string, userRole: string = "ROLE_USER") => {
      setUser(username);
      setToken(newToken);
      setRole(userRole);
      localStorage.setItem("username", username);
      localStorage.setItem("token", newToken);
    },
    [],
  );

  // --- HESAP SİLME ---
  const deleteAccount = useCallback(async () => {
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
      } catch (e) {
        // Parse edilemezse varsayılan mesaj kalır
      }
      throw new Error(errorMsg);
    }
    logout();
  }, [logout, t]);

  // --- İSİM GÜNCELLEME ---
  const updateName = useCallback(
    async (newName: string) => {
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
    },
    [t],
  );

  // --- ŞİFRE GÜNCELLEME ---
  const updatePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
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
    },
    [t],
  );

  // --- BİLDİRİM KAYDI (WEB & NATIVE) ---
  const registerNotification = useCallback(async () => {
    try {
      let fcmToken: string | null = null;

      // 1. Cihaz Türüne Göre FCM Token Al
      if (Capacitor.isNativePlatform()) {
        console.log("📱 Cihaz: NATIVE (Android/iOS). Yerel izin isteniyor...");
        const permission = await FirebaseMessaging.requestPermissions();

        if (permission.receive === "granted") {
          const { token } = await FirebaseMessaging.getToken();
          fcmToken = token;
          console.log("🔑 Native FCM Token Alındı:", fcmToken);
        } else {
          console.log("❌ Native bildirim izni reddedildi.");
        }
      } else {
        console.log("🌐 Cihaz: WEB. Web push izni isteniyor...");
        const messagingInstance = await fetchMessaging();

        if (messagingInstance) {
          const permission = await Notification.requestPermission();
          if (permission === "granted") {
            fcmToken = await getToken(messagingInstance, {
              vapidKey:
                "BLeSjgUdjGkb7SdoIA-brUZ461OjDFeJxv_hTrUQkw8cs-7oU2RRDgQni8Q7Fcrsy6Em0gryoNHYcoCU4dzjvZg",
            });
            console.log("🔑 Web FCM Token Alındı:", fcmToken);
          } else {
            console.log("❌ Web bildirim izni reddedildi.");
          }
        } else {
          console.log(
            "⚠️ Web ortamında Firebase Messaging desteklenmiyor olabilir.",
          );
        }
      }

      // 2. Token Varsa Backend'e Gönder
      if (fcmToken) {
        const authToken = localStorage.getItem("token");

        if (!authToken) {
          console.warn(
            "⚠️ Kullanıcı giriş yapmamış, FCM Token backend'e gönderilemedi.",
          );
          return;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/auth/fcm-token`,
          {
            method: "PUT", // Endpoint'iniz PUT gerektiriyorsa PUT, POST ise POST olarak değiştirin
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({ token: fcmToken }),
          },
        );

        if (response.ok) {
          console.log("✅ BAŞARILI: FCM Token veritabanına kaydedildi!");
        } else {
          const errorText = await response.text();
          console.error(
            "❌ HATA: Token veritabanına yazılamadı! Sunucu cevabı:",
            errorText,
          );
        }
      }
    } catch (error: any) {
      console.error("💥 Bildirim kaydı sırasında hata oluştu:", error);
    }
  }, []);

  // --- ÖN PLAN (FOREGROUND) BİLDİRİM DİNLEYİCİSİ ---
  useEffect(() => {
    if (typeof window !== "undefined" && messaging) {
      console.log("✅ Firebase Ön Plan (Foreground) Dinleyicisi Başlatıldı!");

      const unsubscribe = onMessage(messaging, (payload) => {
        console.log(
          "%c🔔 [BİLDİRİM GELDİ] (Uygulama Açıkken)!!!",
          "color: #10b981; font-size: 20px; font-weight: bold;",
        );
        console.log("Bildirim Detayı:", payload);

        // Gelecekte Alert yerine React-Hot-Toast gibi daha şık bir kütüphane kullanabilirsiniz.
        alert(
          `🔔 ${payload.notification?.title}\n${payload.notification?.body}`,
        );
      });

      return () => {
        unsubscribe();
        console.log("🛑 Firebase Ön Plan Dinleyicisi Kapatıldı.");
      };
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
