"use client";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import SubNavigation from "./SubNavigation";

export default function Footer() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  const developerName = "Imdat C.";
  const developerLink = "https://github.com/imdatce";

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
              className="text-gray-600 dark:text-gray-300 hover:text-emerald-600 font-bold text-sm uppercase tracking-wider transition-colors"
            >
              {t("aboutUs") || "Hakkımızda"}
            </Link>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              &copy; {currentYear}{" "}
              {t("rightsReserved") || "Tüm hakları saklıdır."}
            </p>

            <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-600 mt-1 group">
              <span>{t("developedBy") || "Geliştiren"}</span>
              {developerLink ? (
                <a
                  href={developerLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {developerName}
                </a>
              ) : (
                <span className="font-bold text-gray-600 dark:text-gray-400">
                  {developerName}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
