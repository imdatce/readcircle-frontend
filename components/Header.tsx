/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeSwitcher from "./ThemeSwitcher";
import { useState, useRef, useEffect, useCallback } from "react";
import { JUZ_DATA, SURAH_DATA } from "@/constants/quranData";

import {
  NameUpdateModal,
  PasswordUpdateModal,
} from "@/components/profile/ProfileModals";

export default function Header() {
  const { t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCompact, setIsCompact] = useState(false);

  const [expandedAccordion, setExpandedAccordion] = useState<string | null>(
    null,
  );
  const [expandedSubAccordion, setExpandedSubAccordion] = useState<
    string | null
  >(null);
  const [expandedDeepAccordion, setExpandedDeepAccordion] = useState<
    string | null
  >(null);
  const [activeProfileModal, setActiveProfileModal] = useState<
    "name" | "password" | null
  >(null);

  const [newNameInput, setNewNameInput] = useState("");
  const [nameUpdateSuccess, setNameUpdateSuccess] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordUpdateSuccess, setPasswordUpdateSuccess] = useState(false);
  const [lastQuranPage, setLastQuranPage] = useState<number | null>(null);

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

  useEffect(() => {
    if (isMenuOpen) {
      try {
        const saved = localStorage.getItem("readcircle_progress_type_QURAN");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.unit) {
            Promise.resolve().then(() => setLastQuranPage(parsed.unit));
          }
        }
      } catch (error) {
        console.error("Son okuma verisi alınamadı", error);
      }
    }
  }, [isMenuOpen]);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
    setExpandedAccordion(null);
    setExpandedSubAccordion(null);
    setExpandedDeepAccordion(null);
  }, []);

  const toggleMenu = () => {
    if (isMenuOpen) closeMenu();
    else setIsMenuOpen(true);
  };

  const toggleAccordion = (name: string) => {
    if (expandedAccordion === name) {
      setExpandedAccordion(null);
      setExpandedSubAccordion(null);
      setExpandedDeepAccordion(null);
    } else {
      setExpandedAccordion(name);
      setExpandedSubAccordion(null);
      setExpandedDeepAccordion(null);
    }
  };

  const toggleSubAccordion = (name: string) => {
    setExpandedSubAccordion((prev) => (prev === name ? null : name));
    setExpandedDeepAccordion(null);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        closeMenu();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen, closeMenu]);

  const scrollToTop = (e: React.MouseEvent) => {
    if (window.location.pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    closeMenu();
  };

  const handleNameSubmit = async () => {
    try {
      await updateName(newNameInput);
      setNameUpdateSuccess(true);
      setTimeout(() => {
        setActiveProfileModal(null);
        setNameUpdateSuccess(false);
        setNewNameInput("");
        logout();
      }, 2000);
    } catch (error) {
      alert(t("errorUpdateName") || "İsim güncellenirken bir hata oluştu.");
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
    } catch (error: any) {
      alert(
        error.message ||
          t("errorUpdatePassword") ||
          "Şifre güncellenirken bir hata oluştu.",
      );
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
        alert(t("errorDeleteAccount") || "Hesap silinirken bir hata oluştu.");
      }
    }
  };

  return (
    <>
      <header className="sticky top-0 z-100 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 transition-all duration-300 shadow-sm">
        <div
          ref={headerInnerRef}
          className="max-w-7xl mx-auto px-4 h-16 md:h-20 flex items-center justify-between"
        >
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

            <div data-burger className="relative z-[60]">
              <div className="p-1.5 bg-gray-100/80 dark:bg-gray-900/80 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-inner">
                <button
                  ref={buttonRef}
                  onClick={toggleMenu}
                  className={`p-2 rounded-xl transition-all duration-200 focus:outline-none ${isMenuOpen ? "bg-white dark:bg-gray-800 text-emerald-600 shadow-sm" : "text-gray-500 hover:text-emerald-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-800/50"}`}
                  aria-label={t("mainMenu") || "Ana Menü"}
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

              {isMenuOpen && (
                <div
                  ref={menuRef}
                  className="absolute right-0 top-full mt-3 w-64 max-h-[85vh] overflow-y-auto scrollbar-hide bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 p-2 origin-top-right animate-in fade-in slide-in-from-top-2 z-[99]"
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
                          {(t("welcomeUser") || "Hoş geldin, {name}").replace(
                            "{name}",
                            user ?? "",
                          )}
                        </div>

                        {/* 1. HALKALARIM */}
                        <button
                          onClick={() => toggleAccordion("sessions")}
                          className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl transition-all text-sm font-semibold mt-1 ${expandedAccordion === "sessions" ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300" : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50"}`}
                        >
                          <div className="flex items-center gap-3">
                            <svg
                              className={`w-5 h-5 shrink-0 ${expandedAccordion === "sessions" ? "" : "text-emerald-600 dark:text-emerald-400"}`}
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
                            {t("myCircles") || "Halkalarım"}
                          </div>
                          <svg
                            className={`w-4 h-4 transition-transform duration-300 ${expandedAccordion === "sessions" ? "rotate-180" : "text-gray-400"}`}
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
                        {expandedAccordion === "sessions" && (
                          <div className="flex flex-col gap-1 px-2 py-2 mx-3 my-1 border-l-2 border-emerald-100 dark:border-emerald-800/50 animate-in fade-in slide-in-from-top-2">
                            <Link
                              href="/sessions"
                              onClick={closeMenu}
                              className="text-left px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                            >
                              {t("allCircles") || "Tüm Halkalar"}
                            </Link>
                            <Link
                              href="/sessions?tab=managed"
                              onClick={closeMenu}
                              className="text-left px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                            >
                              {t("managedSessions") || "Yönettiğim Halkalar"}
                            </Link>
                            <Link
                              href="/sessions?tab=joined"
                              onClick={closeMenu}
                              className="text-left px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                            >
                              {t("participatedCircles") ||
                                "Katıldığım Halkalar"}
                            </Link>
                          </div>
                        )}

                        {/* 2. KAYNAKLARIM */}
                        <button
                          onClick={() => toggleAccordion("resources")}
                          className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl transition-all text-sm font-semibold mt-1 ${expandedAccordion === "resources" ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300" : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50"}`}
                        >
                          <div className="flex items-center gap-3">
                            <svg
                              className={`w-5 h-5 shrink-0 ${expandedAccordion === "resources" ? "" : "text-blue-600 dark:text-blue-400"}`}
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
                            {t("myResources") || "Kaynaklarım"}
                          </div>
                          <svg
                            className={`w-4 h-4 transition-transform duration-300 ${expandedAccordion === "resources" ? "rotate-180" : "text-gray-400"}`}
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

                        {expandedAccordion === "resources" && (
                          <div className="flex flex-col gap-1 px-2 py-2 mx-3 my-1 border-l-2 border-blue-100 dark:border-blue-800/50 animate-in fade-in slide-in-from-top-2">
                            <Link
                              href="/resources"
                              onClick={closeMenu}
                              className="text-left px-3 py-2 text-sm font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors mb-1"
                            >
                              {t("allResources") || "Tüm Kaynaklar"}
                            </Link>

                            {/* ALT AKORDEON: Kur'an */}
                            <div className="flex flex-col">
                              <button
                                onClick={() => toggleSubAccordion("quran")}
                                className="flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                              >
                                <span>{t("quran") || "Kur'an-ı Kerim"}</span>
                                <svg
                                  className={`w-3.5 h-3.5 transition-transform duration-200 ${expandedSubAccordion === "quran" ? "rotate-180" : ""}`}
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M19 9l-7 7-7-7"
                                  />
                                </svg>
                              </button>
                              {expandedSubAccordion === "quran" && (
                                <div className="flex flex-col ml-4 pl-3 border-l border-amber-200 dark:border-amber-800/50 my-1 gap-0.5 animate-in fade-in slide-in-from-top-1">
                                  {lastQuranPage && (
                                    <Link
                                      href={`/resources/quran?page=${lastQuranPage}`}
                                      onClick={closeMenu}
                                      className="flex items-center gap-2 text-[13px] py-1.5 px-2 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-md transition-colors font-bold mb-1 shadow-sm"
                                    >
                                      <svg
                                        className="w-4 h-4 shrink-0"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                        />
                                      </svg>
                                      {t("continueReading") ||
                                        "Kaldığım Yere Git"}
                                    </Link>
                                  )}
                                  <Link
                                    href="/resources/quran"
                                    onClick={closeMenu}
                                    className="flex items-center gap-2 text-[13px] py-1.5 px-2 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-md transition-colors font-bold mb-1 shadow-sm"
                                  >
                                    <svg
                                      className="w-4 h-4 shrink-0"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                      strokeWidth={2}
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                                      />
                                    </svg>
                                    {t("hatimJourney") || "Hatim Yolculuğum"}
                                  </Link>
                                  <Link
                                    href="/resources/quran"
                                    onClick={closeMenu}
                                    className="text-[13px] py-1.5 px-2 text-gray-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50/50 dark:hover:bg-amber-900/10 rounded-md transition-colors"
                                  >
                                    {t("allQuranIndex") ||
                                      "Tüm Kur'an Fihristi"}
                                  </Link>

                                  <button
                                    onClick={() =>
                                      setExpandedDeepAccordion((prev) =>
                                        prev === "juz" ? null : "juz",
                                      )
                                    }
                                    className="flex items-center justify-between text-[13px] py-1.5 px-2 text-gray-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50/50 dark:hover:bg-amber-900/10 rounded-md transition-colors w-full text-left"
                                  >
                                    <span>{t("juzWord") || "Cüzler"}</span>
                                    <svg
                                      className={`w-3 h-3 transition-transform duration-200 ${expandedDeepAccordion === "juz" ? "rotate-180" : ""}`}
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M19 9l-7 7-7-7"
                                      />
                                    </svg>
                                  </button>
                                  {expandedDeepAccordion === "juz" && (
                                    <div className="flex flex-col ml-2 pl-2 border-l border-amber-100 dark:border-amber-900/50 max-h-48 overflow-y-auto scrollbar-hide py-1 animate-in fade-in">
                                      {JUZ_DATA.map((juz) => (
                                        <Link
                                          key={juz.id}
                                          href={`/resources/quran?tab=juz&page=${juz.startPage}`}
                                          onClick={closeMenu}
                                          className="text-sm py-2 px-3 text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-md transition-colors font-medium"
                                        >
                                          {juz.id}. {t("juz") || "Cüz"}
                                        </Link>
                                      ))}
                                    </div>
                                  )}

                                  <button
                                    onClick={() =>
                                      setExpandedDeepAccordion((prev) =>
                                        prev === "surah" ? null : "surah",
                                      )
                                    }
                                    className="flex items-center justify-between text-[13px] py-1.5 px-2 text-gray-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50/50 dark:hover:bg-amber-900/10 rounded-md transition-colors w-full text-left"
                                  >
                                    <span>{t("surahWord") || "Sureler"}</span>
                                    <svg
                                      className={`w-3 h-3 transition-transform duration-200 ${expandedDeepAccordion === "surah" ? "rotate-180" : ""}`}
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M19 9l-7 7-7-7"
                                      />
                                    </svg>
                                  </button>
                                  {expandedDeepAccordion === "surah" && (
                                    <div className="flex flex-col ml-2 pl-2 border-l-2 border-amber-200 dark:border-amber-800/60 max-h-60 overflow-y-auto scrollbar-hide py-1 animate-in fade-in">
                                      {SURAH_DATA.map((surah) => (
                                        <Link
                                          key={surah.id}
                                          href={`/resources/quran?tab=surah&page=${surah.startPage}`}
                                          onClick={closeMenu}
                                          className="text-[15px] py-2.5 px-3 text-gray-800 dark:text-gray-200 hover:text-amber-700 dark:hover:text-amber-400 hover:bg-amber-100/50 dark:hover:bg-amber-900/30 rounded-lg transition-colors font-semibold leading-tight"
                                        >
                                          {surah.id}. {surah.name}
                                        </Link>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            <Link
                              href="/resources/cevsen"
                              onClick={closeMenu}
                              className="text-left px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                            >
                              {t("cevsen") || "Cevşen"}
                            </Link>

                            {/* Tesbihat */}
                            <div className="flex flex-col">
                              <button
                                onClick={() => toggleSubAccordion("tesbihat")}
                                className="flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                              >
                                <span>{t("tesbihat") || "Tesbihat"}</span>
                                <svg
                                  className={`w-3.5 h-3.5 transition-transform duration-200 ${expandedSubAccordion === "tesbihat" ? "rotate-180" : ""}`}
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M19 9l-7 7-7-7"
                                  />
                                </svg>
                              </button>
                              {expandedSubAccordion === "tesbihat" && (
                                <div className="flex flex-col ml-4 pl-3 border-l border-emerald-200 dark:border-emerald-800/50 my-1 gap-0.5 animate-in fade-in slide-in-from-top-1">
                                  <Link
                                    href="/resources/tesbihat"
                                    onClick={closeMenu}
                                    className="text-[13px] py-1.5 px-2 text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 rounded-md transition-colors"
                                  >
                                    {t("allTesbihat") || "Tüm Tesbihatlar"}
                                  </Link>
                                  {[
                                    "sabah",
                                    "ogle",
                                    "ikindi",
                                    "aksam",
                                    "yatsi",
                                  ].map((v) => (
                                    <Link
                                      key={v}
                                      href={`/resources/tesbihat?vakit=${v}`}
                                      onClick={closeMenu}
                                      className="text-[13px] py-1.5 px-2 text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 rounded-md transition-colors"
                                    >
                                      {t(`prayer_${v}`) || v}{" "}
                                      {t("tesbihatWord") || "Tesbihatı"}
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Dualar */}
                            <div className="flex flex-col">
                              <button
                                onClick={() => toggleSubAccordion("dualar")}
                                className="flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              >
                                <span>
                                  {t("dualarVirdler") || "Dualar ve Virdler"}
                                </span>
                                <svg
                                  className={`w-3.5 h-3.5 transition-transform duration-200 ${expandedSubAccordion === "dualar" ? "rotate-180" : ""}`}
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M19 9l-7 7-7-7"
                                  />
                                </svg>
                              </button>
                              {expandedSubAccordion === "dualar" && (
                                <div className="flex flex-col ml-3 pl-2 border-l-2 border-blue-200 dark:border-blue-800/50 my-1 max-h-60 overflow-y-auto scrollbar-hide animate-in fade-in slide-in-from-top-1">
                                  <Link
                                    href="/resources/dualar"
                                    onClick={closeMenu}
                                    className="text-[13px] py-2 px-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 rounded-md transition-colors font-bold mb-1"
                                  >
                                    {t("seeAllList") || "Tüm Listeyi Gör"}
                                  </Link>
                                  <Link
                                    href="/resources/gunluk-dualar"
                                    onClick={closeMenu}
                                    className="text-[13px] py-1.5 px-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 rounded-md transition-colors"
                                  >
                                    {t("dailyPrayers") || "Günlük Dualar"}
                                  </Link>
                                  <Link
                                    href="/resources/esmaulhusna"
                                    onClick={closeMenu}
                                    className="text-[13px] py-1.5 px-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 rounded-md transition-colors"
                                  >
                                    {t("esmaulHusna") || "Esma-ül Hüsna"}
                                  </Link>
                                </div>
                              )}
                            </div>

                            {/* Risale */}
                            <div className="flex flex-col">
                              <button
                                onClick={() => toggleSubAccordion("risale")}
                                className="flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                              >
                                <span>{t("risale") || "Risale-i Nur"}</span>
                                <svg
                                  className={`w-3.5 h-3.5 transition-transform duration-200 ${expandedSubAccordion === "risale" ? "rotate-180" : ""}`}
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M19 9l-7 7-7-7"
                                  />
                                </svg>
                              </button>
                              {expandedSubAccordion === "risale" && (
                                <div className="flex flex-col ml-4 pl-3 border-l border-rose-200 dark:border-rose-800/50 my-1 gap-0.5 animate-in fade-in slide-in-from-top-1">
                                  <Link
                                    href="/resources/risale"
                                    onClick={closeMenu}
                                    className="text-[13px] py-1.5 px-2 text-gray-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50/50 dark:hover:bg-rose-900/10 rounded-md transition-colors"
                                  >
                                    {t("allCollection") || "Tüm Külliyat"}
                                  </Link>
                                  {[
                                    "SOZLER",
                                    "MEKTUBAT",
                                    "LEMALAR",
                                    "SUALAR",
                                  ].map((b) => (
                                    <Link
                                      key={b}
                                      href={`/resources/risale?book=html/${t(`resource_${b}`) || b}`}
                                      onClick={closeMenu}
                                      className="text-[13px] py-1.5 px-2 text-gray-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50/50 dark:hover:bg-rose-900/10 rounded-md transition-colors"
                                    >
                                      {t(`resource_${b}`) || b}
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* 3. MANEVİ AJANDAM */}
                        <button
                          onClick={() => toggleAccordion("agenda")}
                          className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl transition-all text-sm font-semibold mt-1 ${expandedAccordion === "agenda" ? "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300" : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50"}`}
                        >
                          <div className="flex items-center gap-3">
                            <svg
                              className={`w-5 h-5 shrink-0 ${expandedAccordion === "agenda" ? "" : "text-amber-600 dark:text-amber-400"}`}
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
                            {t("spiritualAgenda") || "Manevi Ajandam"}
                          </div>
                          <svg
                            className={`w-4 h-4 transition-transform duration-300 ${expandedAccordion === "agenda" ? "rotate-180" : "text-gray-400"}`}
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
                        {expandedAccordion === "agenda" && (
                          <div className="flex flex-col gap-1 px-2 py-2 mx-3 my-1 border-l-2 border-amber-100 dark:border-amber-800/50 animate-in fade-in slide-in-from-top-2">
                            <Link
                              href="/prayers?tab=gunluk"
                              onClick={closeMenu}
                              className="flex items-center gap-2 text-left px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-colors"
                            >
                              <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div>
                              {t("dailyPrayerTracker") || "Günlük Namaz Takibi"}
                            </Link>
                            <Link
                              href="/prayers?tab=kaza"
                              onClick={closeMenu}
                              className="flex items-center gap-2 text-left px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                            >
                              <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                              {t("missedPrayerTracker") || "Kaza Namazı Takibi"}
                            </Link>
                            <Link
                              href="/agenda/dhikr"
                              onClick={closeMenu}
                              className="flex items-center gap-2 text-left px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            >
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                              {t("dailyDhikrTracker") || "Günlük Zikir Takibi"}
                            </Link>
                            <Link
                              href="/agenda/dualarim"
                              onClick={closeMenu}
                              className="flex items-center gap-2 text-left px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                            >
                              <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                              {t("personalPrayerList") || "Kişisel Dua Listem"}
                            </Link>
                          </div>
                        )}

                        {/* 4. HESAP AYARLARI */}
                        <button
                          onClick={() => toggleAccordion("settings")}
                          className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl transition-all text-sm font-semibold mt-1 ${expandedAccordion === "settings" ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50"}`}
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
                            {t("accountSettings") || "Hesap Ayarları"}
                          </div>
                          <svg
                            className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${expandedAccordion === "settings" ? "rotate-180" : ""}`}
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
                        {expandedAccordion === "settings" && (
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
                              className="text-left px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            >
                              {t("deleteAccountButton") || "Hesabı Sil"}
                            </button>
                          </div>
                        )}

                        <Link
                          href="/about"
                          onClick={closeMenu}
                          className="flex items-center gap-3 w-full px-3 py-2.5 mt-1 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-all text-sm font-semibold"
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
                              d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                            />
                          </svg>
                          {t("aboutUs") || "Hakkımızda"}
                        </Link>

                        <button
                          onClick={() => {
                            closeMenu();
                            window.open(
                              "https://mail.google.com/mail/?view=cm&fs=1&to=imdatcelikuu@gmail.com",
                              "_blank",
                            );
                          }}
                          className="flex items-center gap-3 w-full px-3 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-all text-sm font-semibold"
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
                              d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                            />
                          </svg>
                          {t("contactUs") || "İletişime Geç"}
                        </button>

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
                          href="/about"
                          onClick={closeMenu}
                          className="flex items-center gap-3 w-full px-3 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-xl font-semibold text-sm"
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
                              d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                            />
                          </svg>
                          {t("aboutUs") || "Hakkımızda"}
                        </Link>
                        <button
                          onClick={() => {
                            closeMenu();
                            window.open(
                              "https://mail.google.com/mail/?view=cm&fs=1&to=imdatcelikuu@gmail.com",
                              "_blank",
                            );
                          }}
                          className="flex items-center gap-3 w-full px-3 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-xl font-semibold text-sm"
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
                              d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                            />
                          </svg>
                          {t("contactUs") || "İletişime Geç"}
                        </button>
                        <div className="w-full h-px bg-gray-100 dark:bg-gray-800 my-1"></div>
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
