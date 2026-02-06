"use client";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";
import { useState } from "react";

export default function Header() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm transition-all">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-xl text-slate-800 hover:text-emerald-600 transition"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white rounded-lg flex items-center justify-center shadow-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
              />
            </svg>
          </div>
          <span className="hidden sm:inline">
            {t("appTitle") || t("title")}
          </span>
        </Link>

        {/* Desktop Navigasyon */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition"
          >
            {t("backHome")}
          </Link>

          {/* Dil Değiştirici */}
          <LanguageSwitcher />

          <div className="h-6 w-px bg-gray-200 mx-2"></div>

          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                <span className="text-slate-400 font-normal mr-1">
                  {t("welcome")},
                </span>
                {user}
              </span>

              {/* GÜNCELLENEN LOGOUT BUTONU (Desktop) */}
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 shadow-md hover:shadow-lg transition-all transform active:scale-95"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"
                  />
                </svg>
                {t("logoutButton")}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-bold text-slate-600 hover:text-emerald-600 transition"
              >
                {t("loginButton")}
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 shadow-md hover:shadow-lg transition transform active:scale-95"
              >
                {t("guestRegister")}
              </Link>
            </div>
          )}
        </nav>

        {/* Mobil Menü Butonu */}
        <button
          className="md:hidden p-2 text-slate-600"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </button>
      </div>

      {/* Mobil Açılır Menü */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white p-4 flex flex-col gap-4 shadow-lg animate-in slide-in-from-top-5">
          <Link
            href="/"
            onClick={() => setIsMenuOpen(false)}
            className="block py-2 text-slate-600 font-medium border-b border-gray-50"
          >
            {t("backHome")}
          </Link>

          <div className="flex justify-between items-center py-2 border-b border-gray-50">
            <span className="text-sm text-slate-500">{t("menuLanguage")}</span>
            <LanguageSwitcher />
          </div>

          {user ? (
            <div className="flex flex-col gap-3 pt-2">
              <span className="text-sm font-bold text-slate-700">
                {t("welcome")}, {user}
              </span>

              {/* GÜNCELLENEN LOGOUT BUTONU (Mobil) */}
              <button
                onClick={() => {
                  logout();
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 text-white rounded-lg font-bold text-sm shadow-md active:scale-95 transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"
                  />
                </svg>
                {t("logoutButton")}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 pt-2">
              <Link
                href="/login"
                onClick={() => setIsMenuOpen(false)}
                className="w-full text-center py-2 text-slate-600 font-bold bg-slate-50 rounded"
              >
                {t("loginButton")}
              </Link>
              <Link
                href="/register"
                onClick={() => setIsMenuOpen(false)}
                className="w-full text-center py-2 bg-emerald-600 text-white rounded font-bold shadow"
              >
                {t("guestRegister")}
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
