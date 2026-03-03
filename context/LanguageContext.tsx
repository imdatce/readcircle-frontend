"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { tr } from "@/locales/tr";
import { en } from "@/locales/en";
import { ar } from "@/locales/ar";
import { ku } from "@/locales/ku";
import { fr } from "@/locales/fr";
import { nl } from "@/locales/nl";

export type Language = "tr" | "en" | "ar" | "ku" | "fr" | "nl";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  tr,
  en,
  ar,
  ku,
  fr,
  nl,
};

const SUPPORTED_LOCALES: Language[] = ["tr", "en", "ar", "ku", "fr", "nl"];
const DEFAULT_LOCALE: Language = "tr";

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LOCALE);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
     const savedLang = localStorage.getItem("NEXT_LOCALE") as Language;

    let targetLang = DEFAULT_LOCALE;

    if (savedLang && SUPPORTED_LOCALES.includes(savedLang)) {
      targetLang = savedLang;
    } else {
       const browserLang = navigator.language
        .split("-")[0]
        .toLowerCase() as Language;
      targetLang = SUPPORTED_LOCALES.includes(browserLang)
        ? browserLang
        : DEFAULT_LOCALE;
      localStorage.setItem("NEXT_LOCALE", targetLang);
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLanguageState(targetLang);

    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      document.documentElement.lang = language;
      document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    }
  }, [language, isMounted]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
     localStorage.setItem("NEXT_LOCALE", lang);
    document.cookie = `NEXT_LOCALE=${lang}; path=/; max-age=31536000; SameSite=Lax`;
  };

  const t = (key: string): string => {
    return translations[language]?.[key] ?? translations["tr"]?.[key] ?? key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {/* lang ve dir özelliklerini buradan kaldırdık, hatayı çözdük */}
      <div style={!isMounted ? { visibility: "hidden" } : undefined}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
