"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage();

    const handleToggle = () => {
        const newLang = language === 'tr' ? 'en' : 'tr';
        setLanguage(newLang);
    };

    return (
        <button
            onClick={handleToggle}
            className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2 bg-white text-gray-800 rounded-full shadow-lg border border-gray-200 hover:bg-gray-100 transition-all font-bold text-sm cursor-pointer"
        >
            {language === 'tr' ? '🇬🇧 EN' : '🇹🇷 TR'}
        </button>
    );
}