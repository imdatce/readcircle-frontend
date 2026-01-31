"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

const translations = {
    tr: {
        title: "Manevi Gece",
        subtitle: "Kuran ve Kaynak Dağıtım Platformu",
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
        cancel: "İPTAL ET",
        completed: "TAMAMLANDI",
        remaining: "Kalan",

        // --- SEKMELER ---
        tabArabic: "Arapça",
        tabLatin: "Okunuş",
        tabMeaning: "Meal",

        // --- UYARILAR ---
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
        errorAlreadyTaken: "Bu parça maalesef başkası tarafından alınmış."
    },
    en: {
        title: "Spiritual Night",
        subtitle: "Quran and Resource Distribution Platform",
        adminButton: "Login as Admin!",
        loading: "Loading...",

        adminTitle: "Admin Dashboard",
        distributedResources: "Distributed Resources",
        individualResources: "Individual Resources",
        setTargetCounts: "Set Target Counts (Optional)",
        default: "Default",
        participantCount: "Number of Participants?",
        createDistribution: "CREATE DISTRIBUTION",
        linkCreated: "Link Created:",
        copy: "Copy",
        alertSelectResource: "Please select at least one resource.",
        confirmReset: "Database will be reset to default data. Are you sure?",
        errorOccurred: "An error occurred.",
        refresh: "Load / Reset Data",

        // --- READ / JOIN PAGE ---
        joinTitle: "Join the Circle",
        enterCode: "Enter Distribution Code",
        joinButton: "Join",
        takeRead: "READ",
        cancel: "CANCEL",
        completed: "COMPLETED",
        remaining: "Remaining",

        // --- TABS ---
        tabArabic: "Arabic",
        tabLatin: "Transliteration",
        tabMeaning: "Translation",

        // --- ALERTS ---
        successReset: "Reset successful!",
        successDelete: "Deleted!",
        clickToCount: "CLICK AS YOU READ",
        yourName: "Your Name",
        joinIntro: "Please enter your name and click on a resource to read.",
        person: "Person",
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
        errorAlreadyTaken: "Unfortunately, this part has already been taken by someone else."
    }
};

type Language = 'tr' | 'en';

interface LanguageContextType {
    language: Language;
    toggleLanguage: () => void;
    t: (key: keyof typeof translations['tr']) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const [language, setLanguage] = useState<Language>('tr');

    const toggleLanguage = () => {
        setLanguage((prev) => (prev === 'tr' ? 'en' : 'tr'));
    };

    // Çeviri fonksiyonu
    const t = (key: keyof typeof translations['tr']) => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};