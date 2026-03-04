import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, isSupported, Messaging } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyA05qWNyXmyN3gvMu1lbrDTu_3lkZK9Rjc",
    authDomain: "sura-20841.firebaseapp.com",
    projectId: "sura-20841",
    storageBucket: "sura-20841.firebasestorage.app",
    messagingSenderId: "286725551943",
    appId: "1:286725551943:web:a6c1ab2fcbe4a1a36dfe62"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// 1. Dışarı aktarılan (Export) fetchMessaging fonksiyonu: (Token almak için kullanılıyor)
export const fetchMessaging = async (): Promise<Messaging | null> => {
  if (typeof window !== "undefined") {
    try {
      const supported = await isSupported();
      if (supported) {
        return getMessaging(app);
      }
    } catch (err) {
      console.warn("Bu tarayıcı Firebase Messaging'i desteklemiyor.", err);
    }
  }
  return null;
};

// 2. Dışarı aktarılan (Export) messaging objesi: (Uygulama açıkken anlık bildirim dinlemek için kullanılıyor)
let messagingInstance: Messaging | undefined;

if (typeof window !== "undefined") {
  try {
    messagingInstance = getMessaging(app);
  } catch (error) {
    console.warn("Tarayıcıda Firebase Messaging başlatılamadı:", error);
  }
}

export const messaging = messagingInstance;