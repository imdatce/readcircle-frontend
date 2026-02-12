"use client";
import Link from "next/link"; // Doğru paket: next/link
import Image from "next/image"; // Doğru paket: next/image
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeSwitcher from "./ThemeSwitcher";
import { useState, useRef, useEffect } from "react";

export default function Header() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  const scrollToCircles = (e: React.MouseEvent) => {
    // Eğer kullanıcı ana sayfadaysa (pathname === "/")
    if (window.location.pathname === "/") {
      e.preventDefault(); // Sayfanın yeniden yüklenmesini engelle
      const element = document.getElementById("circles-section");
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 shadow-sm transition-all duration-300">
      <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between gap-2">
        {/* LOGO: Alanı korumak için shrink-1 ve min-w-0 eklendi */}
        <Link
          href="/"
          className="flex items-center transition-transform hover:scale-[1.02] shrink-1 min-w-0"
        >
          <div className="relative w-28 h-10 md:w-48 md:h-16">
            <Image
              src="/logo/sura-lgo.png"
              alt="SURA Logo"
              fill
              className="object-contain object-left mix-blend-multiply dark:mix-blend-screen"
              priority
            />
          </div>
        </Link>

        {/* SAĞ TARAF KONTROLLERİ */}
        <div className="flex items-center gap-1 md:gap-3 shrink-0">
          {/* ANA SAYFA BUTONU */}
          <Link
            href="/"
            className="p-1.5 md:p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors shrink-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5 md:w-6 md:h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
              />
            </svg>
          </Link>

          {/* KONTROL KAPSÜLÜ: Mobil uyumlu genişlik ve boşluklar */}
          {/* Header içindeki kontrol kapsülü bölümü */}
          <div className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 bg-slate-100/80 dark:bg-slate-800/80 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
            {user && (
              <>
                <Link
                  href="/#circles-section"
                  onClick={scrollToCircles} // Bu satırı ekledik
                  className="p-1 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-full transition-all"
                  title={t("managedSessions")}
                >
                  {/* Kitap İkonu */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5 md:w-6 md:h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18c-2.305 0-4.408.867-6 2.292m0-14.25v14.25"
                    />
                  </svg>
                </Link>
                <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-0.5"></div>
              </>
            )}

            {/* Switcherlar */}
            <div className="flex items-center gap-0.5 md:gap-1">
              <ThemeSwitcher />
              <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-0.5"></div>
              <LanguageSwitcher />
            </div>
          </div>

          {/* MOBİL MENÜ BUTONU */}
          <button
            ref={buttonRef}
            className="p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors md:ml-1"
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
                strokeWidth={2}
                d={
                  isMenuOpen
                    ? "M6 18L18 6M6 6l12 12"
                    : "M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                }
              />
            </svg>
          </button>
        </div>
      </div>

      {/* MOBİL PANEL */}
      {isMenuOpen && (
        <div
          ref={menuRef}
          className="md:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 flex flex-col gap-3 shadow-lg"
        >
          {user ? (
            <button
              onClick={() => {
                logout();
                setIsMenuOpen(false);
              }}
              className="w-full py-3 bg-red-600 text-white rounded-xl font-bold text-sm"
            >
              {t("logoutButton")}
            </button>
          ) : (
            <div className="flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setIsMenuOpen(false)}
                className="w-full text-center py-3 text-slate-700 dark:text-slate-200 font-bold bg-slate-50 dark:bg-slate-800 rounded-xl"
              >
                {t("loginButton")}
              </Link>
              <Link
                href="/register"
                onClick={() => setIsMenuOpen(false)}
                className="w-full text-center py-3 bg-emerald-600 text-white rounded-xl font-bold"
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
