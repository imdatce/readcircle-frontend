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
    const storedUsername = localStorage.getItem("username");

    // 1. OPTİMİSTİK YÜKLEME: Sayfa açılır açılmaz LocalStorage'dan bilgileri alıp anında state'e yazıyoruz.
    // Bu sayede backend'den cevap gelene kadar kullanıcı "giriş yapmamış" gibi görünmez ve sayfadan atılmaz.
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

          // --- YENİ EKLENEN KISIM: Backend'den gelen lokasyonu tarayıcıya kaydet ---
          if (data.country && data.city) {
            localStorage.setItem(
              "prayer_location",
              JSON.stringify({
                country: data.country,
                city: data.city,
                district: data.district || "",
              }),
            );
            // Namaz Vakitleri widget'ının anında haberdar olması için bir sinyal gönderiyoruz
            window.dispatchEvent(new Event("locationUpdated"));
          }
          // -----------------------------------------------------------------------
        } else if (res.status === 401 || res.status === 403) {
          // 2. Sadece tokenin SÜRESİ DOLMUŞSA veya GEÇERSİZSE çıkış yap.
          logout();
        }
      } catch (error) {
        console.error("Profil çekilemedi, ağ hatası olabilir", error);
        // 3. AĞ HATASI (Sunucu kapalı, internet yok vs.) durumunda KESİNLİKLE ÇIKIŞ YAPTIRMA!
        // LocalStorage'dan aldığımız optimist verilerle kullanıcı gezinmeye devam etsin.
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

  const registerNotification = async () => {
    try {
      const messagingInstance = await fetchMessaging();
      if (!messagingInstance) {
        return;
      }

      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        return;
      }

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
        alert("HATA: Token alınamadı!");
      }
    } catch (error: any) {
      alert("BEKLENMEYEN HATA: " + error.message);
      console.error("Bildirim kaydı sırasında hata:", error);
    }
  };

  // AuthProvider içinde:
  useEffect(() => {
    // messaging değişkeninin var olduğundan ve tarayıcıda olduğumuzdan emin olalım
    if (typeof window !== "undefined" && messaging) {
      const unsubscribe = onMessage(messaging, (payload) => {
        console.log("Mesaj geldi:", payload);
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
