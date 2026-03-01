/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";

export function DashboardColumn({ title, icon, iconColor, children }: any) {
  return (
    <div className="relative group h-full">
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-100 to-emerald-100 dark:from-blue-900/20 dark:to-emerald-900/20 rounded-[1.8rem] blur opacity-50 transition duration-1000"></div>
      <div className="relative bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 p-6 md:p-8 rounded-[1.8rem] shadow-xl h-full flex flex-col">
        <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className={`p-3 rounded-2xl ${iconColor}`}>{icon}</div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            {title}
          </h2>
        </div>
        <div className="flex-1 flex flex-col">{children}</div>
      </div>
    </div>
  );
}

export function EmptyState({ title, actionLink, actionText }: any) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 py-12 text-center rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/30">
      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4 text-gray-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
      </div>
      <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-xs">{title}</p>
      {actionLink && (
        <Link
          href={actionLink}
          className="px-6 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 rounded-lg font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
        >
          {actionText}
        </Link>
      )}
    </div>
  );
}

export function DashboardSkeleton() {
  const { t } = useLanguage();
  const [isSlowLoad, setIsSlowLoad] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsSlowLoad(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-4">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="h-24 bg-gray-200/70 dark:bg-gray-800/70 rounded-2xl animate-pulse"
        ></div>
      ))}
      {isSlowLoad && (
        <div className="p-4 mt-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30 text-center animate-in fade-in slide-in-from-top-2 duration-1000">
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            {t("serverWakingUpPart1") || "Sunucu uykuda olabilir, uyanması "}
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              30-40 {t("seconds") || "saniye"}
            </span>{" "}
            {t("serverWakingUpPart2") || "sürebilir. Lütfen bekleyin..."}
          </p>
        </div>
      )}
    </div>
  );
}

export function Step({ num, title, desc }: any) {
  return (
    <div className="flex flex-col items-center text-center group py-1">
      <div className="w-10 h-10 bg-white dark:bg-gray-800 border-2 border-blue-50 dark:border-gray-700 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-bold text-lg mb-2 shadow-sm shrink-0">
        {num}
      </div>
      <h3 className="text-base font-bold text-gray-900 dark:text-white mb-0.5 leading-tight">
        {title}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 leading-tight max-w-[140px]">
        {desc}
      </p>
    </div>
  );
}
