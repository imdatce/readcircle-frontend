"use client";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function UnauthorizedView() {
  const { t } = useLanguage();

  return (
    <div className="flex h-screen items-center justify-center bg-transparent p-4">
      <div className="bg-white dark:bg-gray-900 p-8 rounded-[2rem] shadow-xl text-center max-w-md w-full border border-red-100 dark:border-red-900/30 animate-in fade-in zoom-in-95 duration-300">
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 dark:bg-red-900/20 shadow-inner">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-8 h-8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-2">
          {t("loginRequired") || "Giriş Yapmanız Gerekiyor"}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium">
          {t("unauthorizedAccess") ||
            "Bu sayfaya erişmek ve yeni bir halka oluşturmak için lütfen hesabınıza giriş yapın."}
        </p>
        <Link
          href="/login"
          className="inline-flex w-full py-4 items-center justify-center bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-500/30"
        >
          {t("getStarted") || "Hemen Başla"}
        </Link>
      </div>
    </div>
  );
}
