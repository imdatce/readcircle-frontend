/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeSwitcher from "./ThemeSwitcher";
import { useState, useRef, useEffect, useCallback } from "react";

// DOĞRU İÇE AKTARIM: Sadece isim ve şifre modallarını süslü parantez ile alıyoruz.
import {
  NameUpdateModal,
  PasswordUpdateModal,
} from "@/components/profile/ProfileModals";

export default function Header() {
  const { t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCompact, setIsCompact] = useState(false);

  // Hesap Ayarları Modalları İçin State'ler
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(false);
  const [activeProfileModal, setActiveProfileModal] = useState<
    "name" | "password" | null
  >(null);

  // Modal Input State'leri
  const [newNameInput, setNewNameInput] = useState("");
  const [nameUpdateSuccess, setNameUpdateSuccess] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordUpdateSuccess, setPasswordUpdateSuccess] = useState(false);

  // Auth özellikleri
  const { user, role, logout, updateName, updatePassword, deleteAccount } =
    useAuth();

  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const headerInnerRef = useRef<HTMLDivElement>(null);

  const checkOverflow = useCallback(() => {
    const container = headerInnerRef.current;
    if (!container) return;
    const logo = container.querySelector("[data-logo]") as HTMLElement;
    const panel = container.querySelector("[data-panel]") as HTMLElement;
    const burger = container.querySelector("[data-burger]") as HTMLElement;
    if (!logo || !burger) return;
    const needed =
      logo.offsetWidth + (panel?.offsetWidth ?? 0) + burger.offsetWidth + 32;
    setIsCompact(needed > container.clientWidth);
  }, []);

  useEffect(() => {
    checkOverflow();
    const ro = new ResizeObserver(checkOverflow);
    if (headerInnerRef.current) ro.observe(headerInnerRef.current);
    return () => ro.disconnect();
  }, [checkOverflow, user]);

  // --- YENİ EKLENEN ÇÖZÜM: Menüyü ve Ayarları güvenli kapatan fonksiyon ---
  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
    setIsSettingsExpanded(false);
  }, []);

  const toggleMenu = () => {
    if (isMenuOpen) {
      closeMenu();
    } else {
      setIsMenuOpen(true);
    }
  };
  // ---------------------------------------------------------------------

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        closeMenu(); // UseEffect yerine doğrudan fonksiyonu çağırıyoruz
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen, closeMenu]);

  // SİLİNEN KISIM: Hata veren useEffect bloğu buradan kaldırıldı!

  const scrollToTop = (e: React.MouseEvent) => {
    if (window.location.pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    closeMenu(); // UseEffect yerine doğrudan fonksiyonu çağırıyoruz
  };

  // --- İŞLEM FONKSİYONLARI ---
  const handleNameSubmit = async () => {
    try {
      await updateName(newNameInput);
      setNameUpdateSuccess(true);
      setTimeout(() => {
        setActiveProfileModal(null);
        setNameUpdateSuccess(false);
        setNewNameInput("");
        logout(); // İsim değişince yeniden giriş istenir
      }, 2000);
    } catch (error) {
      alert("İsim güncellenirken bir hata oluştu.");
    }
  };

  const handlePasswordSubmit = async () => {
    try {
      await updatePassword(currentPassword, newPassword);
      setPasswordUpdateSuccess(true);
      setTimeout(() => {
        setActiveProfileModal(null);
        setPasswordUpdateSuccess(false);
        setCurrentPassword("");
        setNewPassword("");
      }, 2000);
    } catch (error) {
      alert("Şifre güncellenirken bir hata oluştu.");
    }
  };

  const handleDeleteAccount = async () => {
    if (
      confirm(
        t("confirmDeleteAccount") ||
          "Hesabınızı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.",
      )
    ) {
      try {
        await deleteAccount();
        closeMenu();
        logout();
      } catch (error) {
        alert("Hesap silinirken bir hata oluştu.");
      }
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 transition-all duration-300 shadow-sm">
        <div
          ref={headerInnerRef}
          className="max-w-7xl mx-auto px-4 h-16 md:h-20 flex items-center justify-between"
        >
          {/* LOGO */}
          <Link
            data-logo
            href="/"
            onClick={scrollToTop}
            className="relative group shrink-0 transition-transform hover:scale-[1.05] active:scale-95 flex items-center h-full"
          >
            <div className="relative h-16 md:h-20 w-36 md:w-72 overflow-visible">
              <Image
                src="/logo/sura-lgo.png"
                alt="SURA Logo"
                fill
                className="object-contain object-left scale-[1.3] origin-left opacity-95 group-hover:opacity-100 transition-all"
                priority
              />
            </div>
          </Link>

          <div className="flex items-center gap-2 shrink-0">
            {/* PANEL 1: Sadece Ana Sayfa, Tema ve Dil Seçenekleri */}
            {!isCompact && (
              <div
                data-panel
                className="flex items-center p-1 bg-gray-100/80 dark:bg-gray-900/80 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-inner"
              >
                <Link
                  href="/"
                  onClick={scrollToTop}
                  className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-white dark:hover:bg-gray-800 rounded-xl transition-all"
                  title={t("backHome") || "Ana Sayfa"}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                </Link>
                <div className="w-px h-5 bg-gray-300 dark:bg-gray-700 mx-0.5" />
                <ThemeSwitcher />
                <div className="w-px h-5 bg-gray-300 dark:bg-gray-700 mx-0.5" />
                <div className="relative z-[60]">
                  <LanguageSwitcher />
                </div>
              </div>
            )}

            {/* PANEL 2: Hamburger Menü */}
            <div data-burger className="relative z-[60]">
              <div className="p-1.5 bg-gray-100/80 dark:bg-gray-900/80 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-inner">
                <button
                  ref={buttonRef}
                  onClick={toggleMenu}
                  className={`p-2 rounded-xl transition-all duration-200 focus:outline-none ${isMenuOpen ? "bg-white dark:bg-gray-800 text-emerald-600 shadow-sm" : "text-gray-500 hover:text-emerald-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-800/50"}`}
                  aria-label="Ana Menü"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d={
                        isMenuOpen
                          ? "M6 18L18 6M6 6l12 12"
                          : "M4 6h16M4 12h16M4 18h16"
                      }
                    />
                  </svg>
                </button>
              </div>

              {/* Açılır Menü İçeriği */}
              {isMenuOpen && (
                <div
                  ref={menuRef}
                  className="absolute right-0 top-full mt-3 w-64 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 p-2 origin-top-right animate-in fade-in slide-in-from-top-2 z-[99]"
                >
                  {isCompact && (
                    <div className="flex justify-center items-center gap-1 mb-2 pb-2 border-b border-gray-100 dark:border-gray-800">
                      <Link
                        href="/"
                        onClick={scrollToTop}
                        className="p-2 text-gray-500 hover:text-emerald-600 rounded-xl transition-all"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                          />
                        </svg>
                      </Link>
                      <ThemeSwitcher />
                      <LanguageSwitcher />
                    </div>
                  )}

                  <div className="flex flex-col w-full">
                    {user ? (
                      <>
                        <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 mb-2 font-medium">
                          {t("welcomeUser")?.replace("{name}", user ?? "")}
                        </div>

                        {/* 1. Halkalar */}
                        <Link
                          href="/sessions"
                          onClick={closeMenu}
                          className="flex items-center gap-3 w-full px-3 py-2.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-all text-sm font-semibold"
                        >
                          <svg
                            className="w-5 h-5 shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18c-2.305 0-4.408.867-6 2.292m0-14.25v14.25"
                            />
                          </svg>
                          Halkalarım
                        </Link>

                        {/* 2. Kaynaklarım */}
                        <Link
                          href="/resources"
                          onClick={closeMenu}
                          className="flex items-center gap-3 w-full px-3 py-2.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all text-sm font-semibold mt-1"
                        >
                          <svg
                            className="w-5 h-5 shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6 6.878V6a2.25 2.25 0 012.25-2.25h7.5A2.25 2.25 0 0118 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 004.5 9v.878m13.5-3A2.25 2.25 0 0119.5 9v.878m0 0a2.246 2.246 0 00-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0121 12v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6c0-.98.626-1.813 1.5-2.122"
                            />
                          </svg>
                          Kaynaklarım
                        </Link>

                        {/* 3. Manevi Ajandam */}
                        <Link
                          href="/prayers"
                          onClick={closeMenu}
                          className="flex items-center gap-3 w-full px-3 py-2.5 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl transition-all text-sm font-semibold mt-1"
                        >
                          <svg
                            className="w-5 h-5 shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5M12 15h.008v.008H12V15z"
                            />
                          </svg>
                          Manevi Ajandam
                        </Link>

                        {/* 4. Hesap Ayarları (Akordeon Başlığı) */}
                        <button
                          onClick={() =>
                            setIsSettingsExpanded(!isSettingsExpanded)
                          }
                          className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl transition-all text-sm font-semibold mt-1 ${
                            isSettingsExpanded
                              ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                              : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <svg
                              className="w-5 h-5 shrink-0"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                              />
                            </svg>
                            Hesap Ayarları
                          </div>
                          <svg
                            className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isSettingsExpanded ? "rotate-180" : ""}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>

                        {/* Akordeon İçeriği (İsim, Şifre, Sil) */}
                        {isSettingsExpanded && (
                          <div className="flex flex-col gap-1 px-2 py-2 mx-3 my-1 border-l-2 border-gray-100 dark:border-gray-800 animate-in fade-in slide-in-from-top-2">
                            <button
                              onClick={() => {
                                closeMenu();
                                setActiveProfileModal("name");
                              }}
                              className="text-left px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            >
                              {t("changeName") || "İsim Değiştir"}
                            </button>
                            <button
                              onClick={() => {
                                closeMenu();
                                setActiveProfileModal("password");
                              }}
                              className="text-left px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                            >
                              {t("changePassword") || "Şifre Değiştir"}
                            </button>
                            <button
                              onClick={handleDeleteAccount}
                              className="text-left px-3 py-2 text-sm font-medium text-red-500 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            >
                              {t("deleteAccountButton") || "Hesabı Sil"}
                            </button>
                          </div>
                        )}

                        {/* ADMİN BUTONU */}
                        {role === "ROLE_ADMIN" && (
                          <Link
                            href="/superadmin"
                            onClick={closeMenu}
                            className="flex items-center gap-3 w-full px-3 py-2.5 mt-2 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 text-purple-700 dark:text-purple-300 hover:bg-purple-100 rounded-xl transition-all text-sm font-black border border-purple-200 shadow-sm"
                          >
                            <svg
                              className="w-5 h-5 shrink-0"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth="2.5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z"
                              />
                            </svg>
                            {t("adminPanel") || "Sistem Yönetimi"}
                          </Link>
                        )}

                        <div className="w-full h-px bg-gray-100 dark:bg-gray-800 my-2"></div>

                        {/* 5. Çıkış Yap */}
                        <button
                          onClick={() => {
                            logout();
                            closeMenu();
                          }}
                          className="flex items-center gap-3 w-full px-3 py-2.5 text-orange-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-xl transition-all text-sm font-semibold"
                        >
                          <svg
                            className="w-5 h-5 shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                            />
                          </svg>
                          {t("logoutButton") || "Çıkış Yap"}
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col gap-2 p-1">
                        <Link
                          href="/login"
                          onClick={closeMenu}
                          className="flex items-center gap-3 w-full px-3 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 rounded-xl font-semibold text-sm"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
                            />
                          </svg>
                          {t("loginButton") || "Giriş Yap"}
                        </Link>
                        <Link
                          href="/register"
                          onClick={closeMenu}
                          className="flex items-center gap-3 w-full px-3 py-2.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl font-semibold text-sm"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z"
                            />
                          </svg>
                          {t("guestRegister") || "Kayıt Ol"}
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* --- ALT MODALLAR (İSİM VE ŞİFRE GÜNCELLEME) --- */}
      <NameUpdateModal
        isOpen={activeProfileModal === "name"}
        onClose={() => setActiveProfileModal(null)}
        onSubmit={handleNameSubmit}
        newNameInput={newNameInput}
        setNewNameInput={setNewNameInput}
        nameUpdateSuccess={nameUpdateSuccess}
        t={t}
      />

      <PasswordUpdateModal
        isOpen={activeProfileModal === "password"}
        onClose={() => setActiveProfileModal(null)}
        onSubmit={handlePasswordSubmit}
        currentPassword={currentPassword}
        setCurrentPassword={setCurrentPassword}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        passwordUpdateSuccess={passwordUpdateSuccess}
        t={t}
      />
    </>
  );
}
