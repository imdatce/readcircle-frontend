"use client";
import { useLanguage } from "@/context/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300 py-8 mt-auto border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Sol Kısım: Logo ve Açıklama */}
          <div className="text-center md:text-left">
            <h2 className="text-xl font-bold text-white tracking-wider flex items-center gap-2 justify-center md:justify-start">
              <span className="bg-emerald-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm">
                MG
              </span>
              {t("title")}
            </h2>
            <p className="text-sm text-slate-400 mt-2 max-w-xs">
              {t("footerDesc")}
            </p>
          </div>

          {/* Sağ Kısım: Linkler ve Telif */}
          <div className="text-center md:text-right text-sm">
            <p className="mb-2 font-medium text-emerald-500">
              {t("allahAccept")}
            </p>
            <p className="text-slate-500">
              &copy; {currentYear} ReadCircle. {t("rightsReserved")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
