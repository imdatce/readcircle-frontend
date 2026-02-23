/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { SessionSummary } from "@/types";
import { sortSessions } from "@/utils/sessionUtils";

// Ayırdığımız Bileşenler
import {
  NameUpdateModal,
  PasswordUpdateModal,
} from "@/components/profile/ProfileModals";

export default function ProfilePage() {
  const { user, token, updateName, updatePassword, deleteAccount, logout } =
    useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  // --- MODAL STATES ---
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [newNameInput, setNewNameInput] = useState("");
  const [nameUpdateSuccess, setNameUpdateSuccess] = useState(false);

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordUpdateSuccess, setPasswordUpdateSuccess] = useState(false);

  // --- DATA STATES ---
  const [mySessions, setMySessions] = useState<SessionSummary[]>([]);
  const [createdSessions, setCreatedSessions] = useState<SessionSummary[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(true);

  // --- ACCORDION STATES ---
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [openHalkaTab, setOpenHalkaTab] = useState<"managed" | "joined" | null>(
    null,
  );

  useEffect(() => {
    if (!user || !token) return;
    const fetchAllData = async () => {
      try {
        setLoadingActivity(true);
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        };

        const [resJoined, resCreated] = await Promise.all([
          fetch(`${apiUrl}/api/distribution/my-sessions?name=${user}`, {
            headers,
          }),
          fetch(`${apiUrl}/api/distribution/my-created-sessions?name=${user}`, {
            headers,
          }),
        ]);

        if (resJoined.ok) setMySessions(await resJoined.json());
        if (resCreated.ok) setCreatedSessions(await resCreated.json());
      } catch (error) {
        console.error("Data error", error);
      } finally {
        setLoadingActivity(false);
      }
    };
    fetchAllData();
  }, [user, token]);

  useEffect(() => {
    if (!user) router.push("/");
  }, [user, router]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 text-blue-600">
        <div className="w-12 h-12 border-4 border-current border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // --- ACTIONS ---
  const handleUpdateName = async () => {
    if (!newNameInput.trim()) return;
    try {
      await updateName(newNameInput);
      setNameUpdateSuccess(true);
      setTimeout(() => {
        setIsNameModalOpen(false);
        setNameUpdateSuccess(false);
        logout();
      }, 2500);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword) return;
    try {
      await updatePassword(currentPassword, newPassword);
      setPasswordUpdateSuccess(true);
      setTimeout(() => {
        setIsPasswordModalOpen(false);
        setPasswordUpdateSuccess(false);
        setCurrentPassword("");
        setNewPassword("");
      }, 2500);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        t("deleteAccountConfirm") ||
          "Hesabınızı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.",
      )
    ) {
      try {
        await deleteAccount();
      } catch (e: any) {
        alert(
          e.message ||
            t("errorOccurred") ||
            "Hesabınız silinirken bir hata oluştu.",
        );
      }
    }
  };

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const renderSessionCard = (
    session: SessionSummary,
    type: "managed" | "joined",
  ) => (
    <Link
      key={session.id}
      href={
        type === "managed"
          ? `/admin/monitor?code=${session.code}`
          : `/join/${session.code}`
      }
      className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
    >
      <div className="flex justify-between items-start mb-2">
        <div
          className={`text-sm font-black tracking-wide ${type === "managed" ? "text-emerald-600 dark:text-emerald-400" : "text-blue-600 dark:text-blue-400"}`}
        >
          {session.code}
        </div>
      </div>
      <div className="text-gray-700 dark:text-gray-200 font-bold line-clamp-2 leading-snug text-sm">
        {session.description || t("unnamedCircle") || "İsimsiz Halka"}
      </div>
      {type === "joined" && session.creatorName && (
        <div className="mt-2 text-[10px] text-gray-400 font-semibold uppercase">
          {session.creatorName}
        </div>
      )}
    </Link>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-gray-950 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex items-center gap-4 mb-2">
          <Link
            href="/"
            className="p-2.5 bg-white dark:bg-gray-900 text-gray-500 hover:text-blue-600 rounded-full shadow-sm border border-gray-100 dark:border-gray-800 transition-all"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </Link>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
            {t("myAccount") || "Profilim"}
          </h1>
        </div>

        {loadingActivity ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 1. PARÇA: HALKALARIM */}
            <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
              <button
                onClick={() => toggleSection("halkalar")}
                className="w-full flex items-center justify-between p-5 md:p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Halkalarım
                  </h3>
                </div>
                <div
                  className={`transition-transform duration-300 ${openSection === "halkalar" ? "rotate-180" : ""}`}
                >
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>

              {openSection === "halkalar" && (
                <div className="p-5 md:p-6 pt-0 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-black/10">
                  <div className="space-y-3 mt-4">
                    {/* Dağıttığım Halkalar */}
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() =>
                          setOpenHalkaTab(
                            openHalkaTab === "managed" ? null : "managed",
                          )
                        }
                        className="w-full flex items-center justify-between p-4 font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700/80 transition-all"
                      >
                        <span>
                          Dağıttığım Halkalar ({createdSessions.length})
                        </span>
                        <svg
                          className={`w-4 h-4 transition-transform ${openHalkaTab === "managed" ? "rotate-180" : ""}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                      {openHalkaTab === "managed" && (
                        <div className="p-4 pt-0 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-100 dark:bg-gray-800">
                          {createdSessions.length > 0 ? (
                            sortSessions(createdSessions).map((s) =>
                              renderSessionCard(s, "managed"),
                            )
                          ) : (
                            <p className="text-sm text-gray-500">
                              Kayıtlı halka yok.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    {/* Katıldığım Halkalar */}
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() =>
                          setOpenHalkaTab(
                            openHalkaTab === "joined" ? null : "joined",
                          )
                        }
                        className="w-full flex items-center justify-between p-4 font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700/80 transition-all"
                      >
                        <span>Katıldığım Halkalar ({mySessions.length})</span>
                        <svg
                          className={`w-4 h-4 transition-transform ${openHalkaTab === "joined" ? "rotate-180" : ""}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                      {openHalkaTab === "joined" && (
                        <div className="p-4 pt-0 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-100 dark:bg-gray-800">
                          {mySessions.length > 0 ? (
                            sortSessions(mySessions).map((s) =>
                              renderSessionCard(s, "joined"),
                            )
                          ) : (
                            <p className="text-sm text-gray-500">
                              Kayıtlı halka yok.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2. PARÇA: KAYNAKLARIM */}
            <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
              <button
                onClick={() => toggleSection("kaynaklar")}
                className="w-full flex items-center justify-between p-5 md:p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-amber-100 text-amber-600 rounded-xl">
                    <svg
                      className="w-6 h-6"
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
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Kaynaklarım
                  </h3>
                </div>
                <div
                  className={`transition-transform duration-300 ${openSection === "kaynaklar" ? "rotate-180" : ""}`}
                >
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>
              {openSection === "kaynaklar" && (
                <div className="p-5 md:p-6 pt-0 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-black/10">
                  <div className="flex flex-col gap-2 mt-4">
                    <Link
                      href="/resources"
                      className="p-4 bg-white dark:bg-gray-800 rounded-xl font-bold text-gray-700 dark:text-gray-200 shadow-sm border border-gray-100 dark:border-gray-700 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-700 dark:hover:text-amber-400 transition-colors flex justify-between items-center"
                    >
                      Kur'an-ı Kerim <span className="text-gray-400">→</span>
                    </Link>
                    <Link
                      href="/resources/cevsen"
                      className="p-4 bg-white dark:bg-gray-800 rounded-xl font-bold text-gray-700 dark:text-gray-200 shadow-sm border border-gray-100 dark:border-gray-700 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-700 dark:hover:text-amber-400 transition-colors flex justify-between items-center"
                    >
                      Cevşen <span className="text-gray-400">→</span>
                    </Link>
                    <Link
                      href="/resources"
                      className="p-4 bg-white dark:bg-gray-800 rounded-xl font-bold text-gray-700 dark:text-gray-200 shadow-sm border border-gray-100 dark:border-gray-700 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-700 dark:hover:text-amber-400 transition-colors flex justify-between items-center"
                    >
                      Dualar <span className="text-gray-400">→</span>
                    </Link>
                    <Link
                      href="/resources/tesbihat"
                      className="p-4 bg-white dark:bg-gray-800 rounded-xl font-bold text-gray-700 dark:text-gray-200 shadow-sm border border-gray-100 dark:border-gray-700 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-700 dark:hover:text-amber-400 transition-colors flex justify-between items-center"
                    >
                      Tesbihatlar <span className="text-gray-400">→</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* 3. PARÇA: TAKİP ETTİKLERİM */}
            <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
              <button
                onClick={() => toggleSection("takip")}
                className="w-full flex items-center justify-between p-5 md:p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-teal-100 text-teal-600 rounded-xl">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Takip Ettiklerim
                  </h3>
                </div>
                <div
                  className={`transition-transform duration-300 ${openSection === "takip" ? "rotate-180" : ""}`}
                >
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>
              {openSection === "takip" && (
                <div className="p-5 md:p-6 pt-0 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-black/10">
                  <div className="flex flex-col gap-2 mt-4">
                    <Link
                      href="/prayers"
                      className="p-4 bg-white dark:bg-gray-800 rounded-xl font-bold text-gray-700 dark:text-gray-200 shadow-sm border border-gray-100 dark:border-gray-700 hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:text-teal-700 dark:hover:text-teal-400 transition-colors flex justify-between items-center"
                    >
                      Namaz Takibi <span className="text-gray-400">→</span>
                    </Link>
                    <Link
                      href="#"
                      className="p-4 bg-white dark:bg-gray-800 rounded-xl font-bold text-gray-700 dark:text-gray-200 shadow-sm border border-gray-100 dark:border-gray-700 hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:text-teal-700 dark:hover:text-teal-400 transition-colors flex justify-between items-center opacity-70 cursor-not-allowed"
                      title="Yakında!"
                    >
                      Ezber Takibi{" "}
                      <span className="text-xs bg-teal-100 text-teal-600 px-2 py-0.5 rounded-md">
                        Yakında
                      </span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* 4. PARÇA: HESAP AYARLARI */}
            <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
              <button
                onClick={() => toggleSection("ayarlar")}
                className="w-full flex items-center justify-between p-5 md:p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Hesap Ayarları
                  </h3>
                </div>
                <div
                  className={`transition-transform duration-300 ${openSection === "ayarlar" ? "rotate-180" : ""}`}
                >
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>
              {openSection === "ayarlar" && (
                <div className="p-5 md:p-6 pt-0 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-black/10">
                  <div className="flex flex-col gap-2 mt-4">
                    <button
                      onClick={() => {
                        setNewNameInput(user);
                        setIsNameModalOpen(true);
                      }}
                      className="w-full text-left p-4 bg-white dark:bg-gray-800 rounded-xl font-bold text-gray-700 dark:text-gray-200 shadow-sm border border-gray-100 dark:border-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      İsmi Değiştir
                    </button>
                    <button
                      onClick={() => setIsPasswordModalOpen(true)}
                      className="w-full text-left p-4 bg-white dark:bg-gray-800 rounded-xl font-bold text-gray-700 dark:text-gray-200 shadow-sm border border-gray-100 dark:border-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Şifreyi Değiştir
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      className="w-full text-left p-4 bg-white dark:bg-gray-800 rounded-xl font-bold text-red-600 dark:text-red-400 shadow-sm border border-red-100 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors mt-2"
                    >
                      Hesabı Sil
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <NameUpdateModal
        isOpen={isNameModalOpen}
        onClose={() => setIsNameModalOpen(false)}
        onSubmit={handleUpdateName}
        newNameInput={newNameInput}
        setNewNameInput={setNewNameInput}
        nameUpdateSuccess={nameUpdateSuccess}
        t={t}
      />
      <PasswordUpdateModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSubmit={handleUpdatePassword}
        currentPassword={currentPassword}
        setCurrentPassword={setCurrentPassword}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        passwordUpdateSuccess={passwordUpdateSuccess}
        t={t}
      />
    </div>
  );
}
