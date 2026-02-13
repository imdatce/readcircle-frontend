"use client";

import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

export default function LogoutButton() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  if (!user) return null;

  return (
    <button
      onClick={logout}
      title={t("logoutButton")}
      className="fixed top-24 right-4 z-[99] md:top-4 md:right-4 flex items-center gap-2 px-5 py-2.5 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md text-red-600 dark:text-red-400 rounded-full shadow-lg hover:shadow-red-500/20 border border-red-100 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300 font-bold text-sm transform hover:scale-105 active:scale-95 group"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
        />
      </svg>
      <span className="hidden sm:inline">{t("logoutButton")}</span>
    </button>
  );
}
