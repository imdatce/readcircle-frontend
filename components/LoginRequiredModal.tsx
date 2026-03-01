"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext"; // i18n Eklendi

interface LoginRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

export default function LoginRequiredModal({
  isOpen,
  onClose,
  title,
  message,
}: LoginRequiredModalProps) {
  const { t } = useLanguage();

  if (!isOpen) return null;

  // Dışarıdan prop gelirse onu, gelmezse çeviriyi, o da yoksa fallback metni kullanırız
  const displayTitle =
    title || t("loginRequiredTitle") || "Giriş Yapmanız Gerekiyor";
  const displayMessage =
    message ||
    t("loginRequiredMsg") ||
    "Ajandanızı yönetmek ve bu özelliği kullanabilmek için lütfen hesabınıza giriş yapın.";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Arka Plan Karartması */}
      <div
        className="absolute inset-0 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      ></div>

      {/* Modal Kutusu */}
      <div className="relative w-full max-w-sm bg-white dark:bg-[#0a1f1a] rounded-[2rem] p-6 sm:p-8 shadow-2xl border border-emerald-100 dark:border-emerald-900/50 animate-in zoom-in-95 duration-300 overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-4 shadow-sm border border-amber-200 dark:border-amber-800/50">
            <span className="text-3xl">🔒</span>
          </div>

          <h3 className="text-xl font-black text-gray-800 dark:text-white mb-2">
            {displayTitle}
          </h3>

          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-8">
            {displayMessage}
          </p>

          <div className="w-full space-y-3">
            <Link
              href="/login"
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold shadow-sm transition-all active:scale-95"
            >
              {t("loginOrRegister") || "Giriş Yap / Kayıt Ol"}
            </Link>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl text-sm font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {t("cancel") || "Vazgeç"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
