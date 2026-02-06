"use client";
import { useLanguage } from "@/context/LanguageContext";
import { useState, useRef, useEffect } from "react";
import { Language } from "@/types";

const KurdistanFlag = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 21 14"
    className="w-6 h-4 rounded-[2px] shadow-sm border border-black/10"
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

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Ana Buton */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 border
                    ${
                      isOpen
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm"
                        : "bg-transparent border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }
                `}
        aria-label="Dil Seçimi / Select Language"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"
          />
        </svg>

        <span className="font-bold text-sm uppercase">{language}</span>

        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className={`w-3 h-3 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m19.5 8.25-7.5 7.5-7.5-7.5"
          />
        </svg>
      </button>

      {/* Açılır Menü */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="py-1">
            {/* Türkçe */}
            <button
              onClick={() => handleSelect("tr")}
              className={`w-full text-left px-4 py-3 text-sm font-medium flex items-center gap-3 transition hover:bg-gray-50
                                ${language === "tr" ? "text-emerald-600 bg-emerald-50/50" : "text-gray-700"}
                            `}
            >
              <span className="text-lg">🇹🇷</span>
              Türkçe
              {language === "tr" && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4 ml-auto"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>

            <div className="h-px bg-gray-100 mx-2"></div>

            {/* English */}
            <button
              onClick={() => handleSelect("en")}
              className={`w-full text-left px-4 py-3 text-sm font-medium flex items-center gap-3 transition hover:bg-gray-50
                                ${language === "en" ? "text-emerald-600 bg-emerald-50/50" : "text-gray-700"}
                            `}
            >
              <span className="text-lg">🇬🇧</span>
              English
              {language === "en" && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4 ml-auto"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>

            <div className="h-px bg-gray-100 mx-2"></div>

            {/* Kurdî (Kürtçe) */}
            <button
              onClick={() => handleSelect("ku")}
              className={`w-full text-left px-4 py-3 text-sm font-medium flex items-center gap-3 transition hover:bg-gray-50
                                ${language === "ku" ? "text-emerald-600 bg-emerald-50/50" : "text-gray-700"}
                            `}
            >
              <KurdistanFlag />
              Kurdî
              {language === "ku" && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4 ml-auto"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
