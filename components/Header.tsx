"use client";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeSwitcher from "./ThemeSwitcher";
import { useState } from "react";

export default function Header() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 shadow-sm transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between gap-2">
        <Link
          href="/"
          className="flex items-center h-full group transition-transform hover:scale-[1.02] shrink-0"
        >
          <div className="relative w-48 h-16 md:w-56 md:h-20 flex-shrink-0">
            <Image
              src="/logo/sura-lgo.png"
              alt="SURA Logo"
              fill
              className="object-contain object-left mix-blend-multiply dark:mix-blend-screen"
              priority
            />
          </div>
        </Link>

        <div className="flex items-center gap-2 md:gap-6">
          <Link
            href="/"
            className="hidden sm:block text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
          >
            {t("backHome")}
          </Link>

          <div className="flex items-center gap-2 px-2 py-1 md:px-3 md:py-1.5 bg-slate-100/80 dark:bg-slate-800/80 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm shrink-0">
            <ThemeSwitcher />
            <div className="w-px h-4 bg-slate-300 dark:bg-slate-600"></div>
            <LanguageSwitcher />
          </div>

          <nav className="hidden md:flex items-center gap-4">
            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>

            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 whitespace-nowrap">
                  {user}
                </span>
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 shadow-md transition-all active:scale-95"
                >
                  {t("logoutButton")}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-emerald-600 transition"
                >
                  {t("loginButton")}
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 transition transform active:scale-95 whitespace-nowrap"
                >
                  {t("guestRegister")}
                </Link>
              </div>
            )}
          </nav>

          <button
            className="md:hidden p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 flex flex-col gap-4 shadow-lg animate-in slide-in-from-top-5">
          {user ? (
            <div className="flex flex-col gap-3">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200 text-center py-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                {t("welcome")}, {user}
              </span>
              <button
                onClick={() => {
                  logout();
                  setIsMenuOpen(false);
                }}
                className="w-full py-3 bg-red-600 text-white rounded-lg font-bold text-sm shadow-md"
              >
                {t("logoutButton")}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Link
                href="/login"
                onClick={() => setIsMenuOpen(false)}
                className="w-full text-center py-3 text-slate-600 dark:text-slate-300 font-bold bg-slate-50 dark:bg-slate-800 rounded-lg"
              >
                {t("loginButton")}
              </Link>
              <Link
                href="/register"
                onClick={() => setIsMenuOpen(false)}
                className="w-full text-center py-3 bg-emerald-600 text-white rounded-lg font-bold shadow-lg"
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
