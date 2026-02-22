/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

export default function LogoutButton() {
  const { user, logout, deleteAccount } = useAuth();
  const { t } = useLanguage();

  if (!user) return null;

  const handleDeleteClick = async () => {
    const confirmDelete = window.confirm(
      t("deleteAccountConfirm") ||
        "Hesabınızı silmek istediğinize emin misiniz?",
    );

    if (confirmDelete) {
      try {
        await deleteAccount();
      } catch (e: any) {
        // İŞTE BURASI HATAYI EKRANA ÇIKARACAK
        alert(e.message || "Hesabınız silinirken bir hata oluştu.");
      }
    }
  };

  return (
    <div className="fixed top-24 right-4 z-[99] md:top-4 md:right-4 flex flex-col md:flex-row gap-2">
      {/* ÇIKIŞ YAP BUTONU */}
      <button
        onClick={logout}
        title={t("logoutButton") || "Çıkış Yap"}
        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md text-orange-600 dark:text-orange-400 rounded-full shadow-lg hover:shadow-orange-500/20 border border-orange-100 dark:border-orange-900/30 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-300 font-bold text-sm transform hover:scale-105 active:scale-95 group"
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
        <span className="hidden sm:inline">
          {t("logoutButton") || "Çıkış Yap"}
        </span>
      </button>

      {/* HESABI SİL BUTONU */}
      <button
        onClick={handleDeleteClick}
        title={t("deleteAccount") || "Hesabı Sil"}
        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50/90 dark:bg-red-900/80 backdrop-blur-md text-red-600 dark:text-red-300 rounded-full shadow-lg hover:shadow-red-500/30 border border-red-200 dark:border-red-700 hover:bg-red-100 dark:hover:bg-red-800 transition-all duration-300 font-bold text-xs transform hover:scale-105 active:scale-95 group"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-5 h-5 group-hover:scale-110 transition-transform"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
          />
        </svg>
        <span className="hidden sm:inline">
          {t("deleteAccount") || "Hesabı Sil"}
        </span>
      </button>
    </div>
  );
}
