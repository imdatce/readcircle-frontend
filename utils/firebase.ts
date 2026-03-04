import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, getToken, isSupported } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyA05qWNyXmyN3gvMu1lbrDTu_3lkZK9Rjc",
    authDomain: "sura-20841.firebaseapp.com",
    projectId: "sura-20841",
    storageBucket: "sura-20841.firebasestorage.app",
    messagingSenderId: "286725551943",
    appId: "1:286725551943:web:a6c1ab2fcbe4a1a36dfe62"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const requestForToken = async () => {
  try {
    const supported = await isSupported();
    if (!supported) {
      console.log("Bu tarayıcı bildirimleri desteklemiyor.");
      return null;
    }

    const messaging = getMessaging(app);
    
    // Tarayıcıdan izin ister (Daha önce verildiyse direkt granted döner)
    const permission = await Notification.requestPermission();
    
    if (permission === "granted") {
      // VAPID Key'i Firebase Console -> Proje Ayarları -> Cloud Messaging -> Web Yapılandırması kısmından almalısınız
      const currentToken = await getToken(messaging, { 
        vapidKey: "BİLDİRİM_İÇİN_WEB_VAPID_ANAHTARINIZI_BURAYA_YAZIN" 
      });
      
      if (currentToken) {
        console.log("FCM Token Başarıyla Alındı:", currentToken);
        return currentToken;
      } else {
        console.log("Kayıtlı bir token yok. İzin istenmeli.");
        return null;
      }
    } else {
      console.log("Kullanıcı bildirim iznini reddetti.");
      return null;
    }
  } catch (error) {
    console.error("Token alınırken bir hata oluştu", error);
    return null;
  }
};