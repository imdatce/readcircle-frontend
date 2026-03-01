"use client";
import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";

export default function GlobalLoading() {
  const { t } = useLanguage();
  const [isSlowLoad, setIsSlowLoad] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsSlowLoad(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 flex flex-col items-center justify-center text-center px-4">
      <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-emerald-100 dark:border-emerald-900/50 border-t-emerald-600 dark:border-t-emerald-500 rounded-full animate-spin mb-5"></div>
      <p className="text-gray-800 dark:text-gray-200 font-bold animate-pulse text-lg">
        {t("loading") || "Yükleniyor..."}
      </p>
      {isSlowLoad && (
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 max-w-[280px] animate-in fade-in duration-1000 leading-relaxed bg-emerald-50 dark:bg-emerald-900/10 p-3 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
          {t("serverWakingUpPart1") || "Sunucu uykuda olabilir, uyanması "}
          <span className="font-bold text-emerald-600 dark:text-emerald-400">
            30-40 {t("seconds") || "saniye"}
          </span>{" "}
          {t("serverWakingUpPart2") || "sürebilir. Lütfen bekleyin..."}
        </p>
      )}
    </div>
  );
}
