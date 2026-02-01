"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type Language = 'tr' | 'en';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);
const translations = {
    tr: {
        title: "Manevi Gece",
        subtitle: "Kaynak Dağıtım Platformu",
        adminButton: "Admin olarak giriş yap!",
        loading: "Yükleniyor...",

        adminTitle: "Yönetim Paneli",
        distributedResources: "Paylaşılan Kaynaklar",
        individualResources: "Bireysel Kaynaklar",
        setTargetCounts: "Hedef Sayıları Belirle (Opsiyonel)",
        default: "Varsayılan",
        participantCount: "Kaç Kişi Okuyacak?",
        createDistribution: "DAĞITIMI OLUŞTUR",
        linkCreated: "Link Oluşturuldu:",
        copy: "Kopyala",
        alertSelectResource: "Lütfen en az bir kaynak seçiniz.",
        confirmReset: "Tüm veritabanı sıfırlanıp varsayılan veriler yüklenecek. Emin misiniz?",
        errorOccurred: "Hata oluştu.",
        refresh: "Verileri Yükle / Sıfırla",

        joinTitle: "Halkaya Katıl",
        enterCode: "Dağıtım Kodunu Giriniz",
        joinButton: "Katıl",
        takeRead: "OKU",
        cancel: "KAPAT",
        completed: "TAMAMLANDI",
        remaining: "Kalan",
        tabArabic: "Arapça",
        tabLatin: "Okunuş",
        tabMeaning: "Meal",
        successReset: "Sıfırlandı!",
        successDelete: "Silindi!",
        clickToCount: "OKUDUKÇA TIKLAYINIZ",
        yourName: "Adınız",
        joinIntro: "Lütfen adınızı girip okumak istediğiniz kaynağa tıklayınız.",
        person: "Kişi",
        part: "Parça",
        target: "Hedef",
        total: "Toplam",
        pieces: "Adet",
        myCreatedTitle: "Yönettiğim Dağıtımlar",
        noCreatedYet: "Henüz bir dağıtım başlatmadın.",
        trackButton: "Takip Et",
        selectAndRead: "SEÇ & OKU",
        readText: "Metni Oku",
        goToSite: "Siteye Git",
        full: "DOLU",
        page: "Sayfa",
        alertEnterName: "Lütfen önce yukarıya isminizi yazın.",
        alertStatus: "Durum: ",
        alertTakenSuccess: "Harika! Bu bölümü okumayı üstlendiniz.",
        alertErrorPrefix: "Hata: ",
        errorInvalidCode: "Hata: Geçersiz kod veya sunucu kapalı.",
        decrease: "AZALT",
        allahAccept: "Allah kabul etsin!",
        errorAlreadyTaken: "Bu parça maalesef başkası tarafından alınmış.",
        registerTitle: "Hesap Oluştur",
        registerSubtitle: "Aramıza katılmak için bilgilerinizi girin",
        usernameLabel: "Kullanıcı Adı",
        passwordLabel: "Şifre",
        placeholderUserExample: "Örn: ahmet123",
        placeholderPass: "******",
        registerButton: "KAYIT OL",
        registering: "Kaydediliyor...",
        haveAccount: "Zaten hesabınız var mı?",
        loginLink: "Giriş Yap",
        registerSuccess: "Kayıt Başarılı! Giriş yapabilirsiniz.",
        errorPrefix: "Hata: ",
        monitorTitle: "Dağıtım Takibi",
        monitorSubtitle: "Bir kod girerek kimin ne aldığını kontrol edin.",
        statusEmpty: "BOŞTA",
        statusTaken: "ALINDI",
        assignedTo: "Alan Kişi",
        resource: "Kaynak / Parça",
        progress: "İlerleme / Hedef",
        backToAdmin: "Admin Paneline Dön",
        occupancy: "DOLULUK",
        statusHeader: "Durum",
        targetLabel: "HEDEF",
        select: "SEÇ",
        welcome: "Selamün aleyküm Mübarek",
        createDistTitle: "Yeni Dağıtım Başlat",
        createDistDesc: "Hatı, Yasin, Cevşen veya Zikir halkası oluşturup linki paylaş.",
        joinDistTitle: "Bir Halkaya Katıl",
        joinDistDesc: "Sana gönderilen kodu aşağıya girerek dahil ol.",
        createButton: "OLUŞTUR",
        enterCodePlaceholder: "Dağıtım Kodu (Örn: 12345)",
        joinInputPlaceholder: "Dağıtım Kodu (Örn: 12345)",
        participantName: "Katılımcı Adı",
        imageMode: "Resim Modu",
        loginRequiredMsg: "Parça seçmek için giriş yapmalısınız.",
        loginOrRegister: "Giriş Yap veya Kayıt Ol",
        backHome: "Ana Sayfa", // <-- Ekle
        // Misafir Ekranı
        guestSubtitle: "Manevi birliktelik platformu",
        guestMessage: "Halkalara katılmak veya kendi dağıtımını oluşturmak için lütfen giriş yap.",
        guestLogin: "GİRİŞ YAP",
        guestRegister: "KAYIT OL",
        guestCheckCode: "Sadece bir koda bakmak mı istiyorsun?",
        guestCodePlaceholder: "Kod giriniz",
        appTitle: "Manevi Gece",
        loginTitle: "Giriş Yap",
        loginButton: "GİRİŞ YAP",
        noAccount: "Hesabın yok mu?",
        registerLink: "Hemen Kayıt Ol",
        loginError: "Kullanıcı adı veya şifre hatalı",
        myCirclesTitle: "Katıldığım Halkalar",
        noCirclesYet: "Henüz bir halkaya katılmadın.",
        continueButton: "DEVAM ET",
        distCode: "Kod",
        placeholderUser: "Kullanıcı adınız",
        creatorLabel: "Kurucu",
    },
    en: {
        title: "Spiritual Night",
        subtitle: "Resource Distribution Platform",
        adminButton: "Login as Admin!",
        loading: "Loading...",
        myCirclesTitle: "My Circles",
        noCirclesYet: "You haven't joined any circles yet.",
        continueButton: "CONTINUE",
        distCode: "Code",
        adminTitle: "Admin Dashboard",
        distributedResources: "Distributed Resources",
        individualResources: "Individual Resources",
        setTargetCounts: "Set Target Counts (Optional)",
        default: "Default",
        registerTitle: "Create Account",
        registerSubtitle: "Enter your details to join us",
        usernameLabel: "Username",
        passwordLabel: "Password",
        placeholderUserExample: "e.g. john123",
        placeholderPass: "******",
        registerButton: "REGISTER",
        registering: "Registering...",
        haveAccount: "Already have an account?",
        loginLink: "Login",
        registerSuccess: "Registration successful! You can login now.",
        errorPrefix: "Error: ",
        backHome: "Home",
        participantCount: "Number of Participants?",
        createDistribution: "CREATE DISTRIBUTION",
        linkCreated: "Link Created:",
        copy: "Copy",
        alertSelectResource: "Please select at least one resource.",
        confirmReset: "Database will be reset to default data. Are you sure?",
        errorOccurred: "An error occurred.",
        refresh: "Load / Reset Data",
        appTitle: "Read Circle",
        joinTitle: "Join the Circle",
        enterCode: "Enter Distribution Code",
        joinButton: "Join",
        takeRead: "READ",
        cancel: "CANCEL",
        completed: "COMPLETED",
        remaining: "Remaining",
        tabArabic: "Arabic",
        tabLatin: "Transliteration",
        tabMeaning: "Translation",
        creatorLabel: "Creator",
        successReset: "Reset successful!",
        successDelete: "Deleted!",
        clickToCount: "CLICK AS YOU READ",
        yourName: "Your Name",
        joinIntro: "Please enter your name and click on a resource to read.",
        person: "Person",
        imageMode: "Image Mode",
        participantName: "Participant Name",
        loginRequiredMsg: "You must log in to select a part.",
        loginOrRegister: "Login or Register",
        part: "Part",
        target: "Target",
        total: "Total",
        pieces: "Pieces",
        selectAndRead: "SELECT & READ",
        readText: "Read Text",
        goToSite: "Go to Site",
        full: "TAKEN",
        page: "Page",
        alertEnterName: "Please enter your name above first.",
        alertStatus: "Status: ",
        alertTakenSuccess: "Great! You have successfully taken this part.",
        alertErrorPrefix: "Error: ",
        errorInvalidCode: "Error: Invalid code or server is down.",
        decrease: "DECREASE",
        allahAccept: "May Allah accept it!",
        errorAlreadyTaken: "Unfortunately, this part has already been taken by someone else.",
        monitorTitle: "Distribution Monitor",
        monitorSubtitle: "Enter a code to check who took what.",
        trackButton: "Show Status",
        statusEmpty: "AVAILABLE",
        statusTaken: "TAKEN",
        assignedTo: "Assigned To",
        resource: "Resource / Part",
        progress: "Progress / Target",
        backToAdmin: "Back to Dashboard",
        occupancy: "OCCUPANCY",
        statusHeader: "Status",
        targetLabel: "TARGET",

        select: "SELECT",
        welcome: "Welcome",
        createDistTitle: "Start New Circle",
        createDistDesc: "Create a Quran, Yasin, or Dhikr circle and share the link.",
        joinDistTitle: "Join a Circle",
        joinDistDesc: "Enter the code shared with you to participate.",
        createButton: "CREATE",
        enterCodePlaceholder: "Distribution Code (e.g. 12345)",
        joinInputPlaceholder: "Distribution Code (e.g. 12345)",

        loginTitle: "Login",
        loginButton: "LOGIN",
        noAccount: "Don't have an account?",
        registerLink: "Register Now",
        loginError: "Invalid username or password",
        placeholderUser: "Your username",
        guestSubtitle: "Spiritual connection platform",
        guestMessage: "Please login to join circles or create your own distribution.",
        guestLogin: "LOGIN",
        guestRegister: "REGISTER",
        guestCheckCode: "Just want to check a code?",
        guestCodePlaceholder: "Enter code",
        myCreatedTitle: "My Distributions",
        noCreatedYet: "You haven't started any distribution yet.",
    }
};
export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>('tr');
    useEffect(() => {
        const savedLanguage = localStorage.getItem('appLanguage') as Language;

        if (savedLanguage && (savedLanguage === 'tr' || savedLanguage === 'en')) {
            if (savedLanguage !== language) {
                setLanguageState(savedLanguage);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('appLanguage', lang);
    };

    const t = (key: string): string => {
        const translation = translations[language][key as keyof typeof translations['tr']];
        return translation || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}