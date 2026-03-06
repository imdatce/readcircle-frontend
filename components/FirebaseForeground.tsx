// components/FirebaseForeground.tsx
"use client";

import { useEffect } from "react";
import { onMessage } from "firebase/messaging";
import { messaging } from "@/utils/firebase";

export default function FirebaseForeground() {
  useEffect(() => {
    // Sadece tarayıcı ortamında ve messaging objesi varsa çalıştır
    if (typeof window !== "undefined" && messaging) {
      const unsubscribe = onMessage(messaging, (payload) => {
        // Kullanıcı bildirim izni vermişse tarayıcıda göster
        if (Notification.permission === "granted") {
          const notificationTitle =
            payload.notification?.title || "Yeni Bildirim";
          const notificationOptions = {
            body: payload.notification?.body,
            icon: "/logo/sura-lgo.png",
            data: payload.data, // Backend'den gelen veriler (click_url vb.)
          };

          const notification = new Notification(
            notificationTitle,
            notificationOptions,
          );

          // Bildirime tıklanınca yönlendirme yap
          notification.onclick = (event) => {
            event.preventDefault();
            if (payload.data?.click_url) {
              window.location.href = payload.data.click_url;
            } else if (payload.fcmOptions?.link) {
              window.location.href = payload.fcmOptions.link;
            }
            notification.close();
          };
        }
      });

      // Bileşen ekrandan kalkarsa dinlemeyi durdur (Memory leak önleme)
      return () => {
        unsubscribe();
      };
    }
  }, []);

  return null; // Bu bileşen ekrana hiçbir şey çizmez, sadece arka planda dinler
}
