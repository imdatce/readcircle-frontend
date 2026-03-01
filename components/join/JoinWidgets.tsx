/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect } from "react";

export function StatCard({ label, value, percent, color = "gray" }: any) {
  const colorClasses: any = {
    blue: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 border-blue-100 dark:border-blue-900/30",
    emerald:
      "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30",
    gray: "text-gray-800 bg-white dark:bg-gray-900 dark:text-white border-gray-100 dark:border-gray-800",
  };
  return (
    <div
      className={`p-3 md:p-5 rounded-2xl md:rounded-3xl border shadow-sm text-center ${colorClasses[color] || colorClasses.gray}`}
    >
      <p className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] mb-1 md:mb-1.5 opacity-60 truncate">
        {label}
      </p>
      <div className="flex flex-col items-center leading-none">
        <span className="text-xl md:text-3xl font-black">{value}</span>
        {percent !== undefined && (
          <span className="text-[8px] md:text-[10px] font-bold mt-1 md:mt-1.5 opacity-80 bg-white/50 dark:bg-black/20 px-1.5 py-0.5 rounded-full">
            %{percent}
          </span>
        )}
      </div>
    </div>
  );
}

export function JoinLoading({ t }: { t: any }) {
  const [isSlowLoad, setIsSlowLoad] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsSlowLoad(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex h-screen items-center justify-center bg-transparent px-4 text-center">
      <div className="flex flex-col items-center gap-5">
        <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-emerald-100 dark:border-emerald-900/50 border-t-emerald-600 dark:border-t-emerald-500 rounded-full animate-spin"></div>
        <div className="flex flex-col gap-3 items-center">
          <p className="text-gray-800 dark:text-gray-200 font-bold animate-pulse text-base md:text-lg">
            {t("loading") || "Yükleniyor..."}
          </p>
          {isSlowLoad && (
            <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm max-w-[280px] animate-in fade-in duration-1000 leading-relaxed bg-emerald-50 dark:bg-emerald-900/10 p-3 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
              {t("serverWakingUpPart1") || "Sunucu uykuda olabilir, uyanması "}
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                30-40 {t("seconds") || "saniye"}
              </span>{" "}
              {t("serverWakingUpPart2") || "sürebilir. Lütfen bekleyin..."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function NamePromptModal({
  isOpen,
  onClose,
  onSubmit,
  tempName,
  setTempName,
  t,
}: any) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-6 md:p-8 w-full max-w-sm shadow-2xl border border-gray-100 dark:border-gray-800 animate-in zoom-in-95 duration-200">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-600 dark:text-blue-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-7 h-7"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">
            {t("joinTitle") || "İsminiz Nedir?"}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t("joinIntro") || "Bir görev almak için lütfen isminizi girin."}
          </p>
        </div>
        <input
          type="text"
          value={tempName}
          onChange={(e) => setTempName(e.target.value)}
          placeholder={t("yourNamePlaceholder") || "Adınız Soyadınız"}
          className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-xl text-lg font-bold text-center outline-none focus:border-blue-500 transition-all dark:text-white mb-4"
          autoFocus
          onKeyDown={(e) => e.key === "Enter" && onSubmit()}
        />
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors"
          >
            {t("cancel") || "Vazgeç"}
          </button>
          <button
            onClick={onSubmit}
            disabled={!tempName.trim()}
            className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:shadow-none"
          >
            {t("continue") || "Devam Et"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function GladTidingsModal({ completedAyah, onClose, t }: any) {
  if (!completedAyah) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-6 md:p-10 w-full max-w-md shadow-2xl border border-emerald-100 dark:border-emerald-900/30 animate-in zoom-in-95 duration-300 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
        <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-4 ring-emerald-50 dark:ring-emerald-900/10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-2xl font-black text-gray-800 dark:text-white mb-6 uppercase tracking-wider">
          {t("completed") || "Tamamlandı!"}
        </h3>
        <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mb-6 px-2 font-medium">
          {t("prayerMessage") ||
            "Allah kabul etsin. İnşallah bu ayetteki müjdeye mazhar olursunuz..."}
        </p>
        <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-5 rounded-3xl mb-8 border border-emerald-100/50 dark:border-emerald-800/30">
          <p
            className="font-serif text-2xl md:text-3xl text-gray-800 dark:text-gray-100 mb-4 leading-relaxed"
            dir="rtl"
            lang="ar"
          >
            {completedAyah.arabic}
          </p>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 font-medium italic mb-3">
            &quot;
            {t(completedAyah.translationKey) || completedAyah.translationKey}
            &quot;
          </p>
          <span className="inline-block px-3 py-1 bg-white dark:bg-gray-800 rounded-lg text-xs font-bold text-emerald-600 dark:text-emerald-500 shadow-sm border border-emerald-50 dark:border-emerald-900/50">
            {t(completedAyah.refKey) || completedAyah.refKey}
          </span>
        </div>
        <button
          onClick={onClose}
          className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-lg hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/30 active:scale-95"
        >
          {t("close") || "Kapat"}
        </button>
      </div>
    </div>
  );
}
