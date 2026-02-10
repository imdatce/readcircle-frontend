"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useState, useRef, useEffect } from "react";
import { Language } from "@/types";

// --- Özel Bayrak Bileşeni ---
const KurdistanFlag = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 21 14"
    className="w-5 h-3.5 rounded-[2px] shadow-sm border border-black/10 object-cover"
  >
    <rect width="21" height="14" fill="#FFFFFF" />
    <rect width="21" height="4.66" fill="#EB2323" />
    <rect y="9.33" width="21" height="4.66" fill="#278E43" />
    <circle cx="10.5" cy="7" r="2.2" fill="#FECA00" />
    <path
      d="M10.5 4.5 L11 6.5 L13 6.5 L11.5 8 L12.5 10 L10.5 8.5 L8.5 10 L9.5 8 L8 6.5 L10 6.5 Z"
      fill="#FECA00"
    />
  </svg>
);

// --- Dil Konfigürasyonu ---
const LANGUAGE_CONFIG: Record<
  Language,
  { label: string; icon: React.ReactNode; native: string }
> = {
  tr: {
    label: "Türkçe",
    native: "TR",
    icon: <span className="text-lg leading-none">🇹🇷</span>,
  },
  en: {
    label: "English",
    native: "EN",
    icon: <span className="text-lg leading-none">🇬🇧</span>,
  },
  ku: {
    label: "Kurdî",
    native: "KU",
    icon: <KurdistanFlag />,
  },
  ar: {
    label: "العربية",
    native: "AR",
    icon: <span className="text-lg leading-none">🇸🇦</span>,
  },
  fr: {
    label: "Français",
    native: "FR",
    icon: <span className="text-lg leading-none">🇫🇷</span>,
  },
};

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage(); // t fonksiyonunu da çektik (başlık için)
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Dışarı tıklayınca kapatma
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (lang: Language) => {
    setLanguage(lang);
    setIsOpen(false);
  };

  // Objeden array üretimi (Map edebilmek için)
  const languagesList = Object.keys(LANGUAGE_CONFIG) as Language[];

  return (
    <div className="relative z-50" ref={dropdownRef}>
      {/* --- TETİKLEYİCİ BUTON --- */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 group focus:outline-none"
        aria-label="Dil Seçimi / Select Language"
      >
        {/* Kalın ve Belirgin Metin (TR, EN vb.) */}
        <span className="font-extrabold text-sm tracking-wide text-slate-800 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
          {language.toUpperCase()}
        </span>

        {/* Kalınlaştırılmış Ok İşareti */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={3}
          stroke="currentColor"
          className={`w-3 h-3 text-slate-800 dark:text-white transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m19.5 8.25-7.5 7.5-7.5-7.5"
          />
        </svg>
      </button>

      {/* --- AÇILIR MENÜ --- */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-3 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Menü Başlığı (Opsiyonel) */}
          <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              {t("menuLanguage")}
            </span>
          </div>

          <div className="py-1">
            {languagesList.map((lang) => {
              const config = LANGUAGE_CONFIG[lang];
              const isActive = language === lang;

              return (
                <button
                  key={lang}
                  onClick={() => handleSelect(lang)}
                  className={`
                    w-full text-left px-4 py-2.5 text-sm font-medium flex items-center justify-between transition-colors
                    ${
                      isActive
                        ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    {config.icon}
                    <span>{config.label}</span>
                  </div>

                  {isActive && (
                    <span className="text-xs font-bold bg-emerald-100 dark:bg-emerald-800 px-1.5 py-0.5 rounded text-emerald-700 dark:text-emerald-300">
                      {config.native}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
