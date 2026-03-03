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


// 1. Gelen mesajın içindeki URL verisini bildirime ekliyoruz
messaging.onBackgroundMessage((payload) => {
    console.log('Arka planda mesaj alındı: ', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/logo/sura-lgo.png',
        badge: '/logo/sura-lgo.png',
        data: {
            // Backend'den gönderdiğimiz URL'yi bildirimin içine saklıyoruz
            click_url: payload.data ? payload.data.click_url : '/' 
        }
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// 2. BİLDİRİME TIKLANMA OLAYINI DİNLİYORUZ
self.addEventListener('notificationclick', function(event) {
    console.log('Bildirime tıklandı.');
    
    // Bildirimi ekrandan kaldır (kapat)
    event.notification.close();

    // Sakladığımız URL'yi al (Yoksa anasayfaya git)
    const urlToOpen = event.notification.data.click_url;

    // Tıklanınca URL'yi tarayıcıda aç
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // Eğer sitemizin sekmesi zaten açıksa o sekmeye odaklan ve sayfayı değiştir
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    client.navigate(urlToOpen);
                    return client.focus();
                }
            }
            // Sekme açık değilse yeni bir sekme/pencere aç
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});