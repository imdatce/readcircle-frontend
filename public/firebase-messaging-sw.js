importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyA05qWNyXmyN3gvMu1lbrDTu_3lkZK9Rjc",
    authDomain: "sura-20841.firebaseapp.com",
    projectId: "sura-20841",
    storageBucket: "sura-20841.firebasestorage.app",
    messagingSenderId: "286725551943",
    appId: "1:286725551943:web:a6c1ab2fcbe4a1a36dfe62"
});

const messaging = firebase.messaging();

// Arka planda bildirim geldiğinde yapılacak işlem
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Arka plan mesajı alındı: ', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/icon-192x192.png' // Kendi ikon yolunuzu buraya yazın
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});