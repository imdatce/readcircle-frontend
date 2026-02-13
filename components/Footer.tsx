"use client";
import { useLanguage } from "@/context/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  const developerName = "Imdat C.";
  const developerLink = "https://github.com/imdatce";

  return (
    <footer className="mt-auto border-t border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/90 backdrop-blur-xl transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <h2 className="text-xl font-black tracking-tight mb-2">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-emerald-600 dark:from-blue-400 dark:to-emerald-400">
                {"Spiritual Union for Reflection & Affinity"}
              </span>
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed mx-auto md:mx-0">
              {t("footerDesc")}
            </p>
          </div>

          <div className="text-center md:text-right flex flex-col items-center md:items-end gap-1">
            <p className="font-bold text-emerald-600 dark:text-emerald-500 text-sm bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full mb-1">
              {t("allahAccept")}
            </p>

            <p className="text-xs text-gray-400 dark:text-gray-500">
              &copy; {currentYear} {t("rightsReserved")}
            </p>

            <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-600 mt-1 group">
              <span>Developed By</span>
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
