// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyA05qWNyXmyN3gvMu1lbrDTu_3lkZK9Rjc",
    authDomain: "sura-20841.firebaseapp.com",
    projectId: "sura-20841",
    messagingSenderId: "286725551943",
    appId: "1:286725551943:web:a6c1ab2fcbe4a1a36dfe62"
});

const messaging = firebase.messaging();

// Arka plan mesajı geldiğinde sadece log atalım, 
// Backend 'setNotification' gönderdiği için tarayıcı otomatik gösterecektir.
messaging.onBackgroundMessage((payload) => {
    console.log('[SW] Arka planda mesaj alındı: ', payload);
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    // Veriyi 'data' içinden veya Firebase'in sakladığı 'FCM_MSG' içinden çekiyoruz
    const urlToOpen = event.notification.data?.click_url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    client.navigate(urlToOpen);
                    return client.focus();
                }
            }
            if (clients.openWindow) return clients.openWindow(urlToOpen);
        })
    );
});