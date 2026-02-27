import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyA05qWNyXmyN3gvMu1lbrDTu_3lkZK9Rjc",
    authDomain: "sura-20841.firebaseapp.com",
    projectId: "sura-20841",
    storageBucket: "sura-20841.firebasestorage.app",
    messagingSenderId: "286725551943",
    appId: "1:286725551943:web:a6c1ab2fcbe4a1a36dfe62"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const fetchMessaging = async () => {
    if (typeof window !== "undefined" && await isSupported()) {
        return getMessaging(app);
    }
    return null;
};

export { app, getMessaging };