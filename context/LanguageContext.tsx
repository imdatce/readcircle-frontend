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
        monitorTitle: "Dağıtım Takibi",
        monitorSubtitle: "Bir kod girerek kimin ne aldığını kontrol edin.",
        trackButton: "Durumu Göster",
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
    },
    en: {
        title: "Spiritual Night",
        subtitle: "Resource Distribution Platform",
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