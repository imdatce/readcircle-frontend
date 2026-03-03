"use client";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import SubNavigation from "./SubNavigation";

export default function Footer() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/90 backdrop-blur-xl transition-colors duration-300">
      <SubNavigation />

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <h2 className="text-xl font-black tracking-tight mb-2">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-emerald-600 dark:from-blue-400 dark:to-emerald-400">
                {/* Marka sloganını da i18n'e bağladık */}
                {t("slogan") || "Spiritual Union for Reflection & Affinity"}
              </span>
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed mx-auto md:mx-0">
              {t("footerDesc") ||
                "Manevi yolculuğunuzda size eşlik eden dijital rehberiniz."}
            </p>
          </div>

          <div className="text-center md:text-right flex flex-col items-center md:items-end gap-1">
            <Link
              href="/about"
              className="group flex items-center gap-2 px-5 py-2.5 bg-white/50 dark:bg-gray-800/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 border border-gray-200 dark:border-gray-700 hover:border-emerald-200 dark:hover:border-emerald-800/50 rounded-full transition-all duration-300 text-sm font-bold uppercase tracking-widest text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 shadow-sm hover:shadow-md"
            >
              <svg
                className="w-4 h-4 shrink-0 transition-transform duration-300 group-hover:rotate-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{t("aboutUs") || "Hakkımızda"}</span>
            </Link>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              &copy; {currentYear}{" "}
              {t("rightsReserved") || "Tüm hakları saklıdır."}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
