/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";

export default function ProfilePage() {
  const { user, token, updateName, updatePassword, deleteAccount, logout } =
    useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  // --- MODAL STATELERİ ---
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [newNameInput, setNewNameInput] = useState("");
  const [nameUpdateSuccess, setNameUpdateSuccess] = useState(false);

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordUpdateSuccess, setPasswordUpdateSuccess] = useState(false);

  // --- AKTİVİTE VERİSİ ---
  const [activity, setActivity] = useState<{
    created: any[];
    participated: any[];
  } | null>(null);
  const [loadingActivity, setLoadingActivity] = useState(true);

  // --- EFFECTLER ---
  useEffect(() => {
    if (!token) return;
    const fetchActivity = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/admin/my-activity`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        if (!res.ok) {
          const errorData = await res.json();
          console.error("Backend'den Gelen Hata Detayı:", errorData.message);
          return;
        }

        const data = await res.json();
        setActivity(data);
      } catch (error) {
        console.error("Aktivite yüklenemedi:", error);
      } finally {
        setLoadingActivity(false);
      }
    };
    fetchActivity();
  }, [token]);

  useEffect(() => {
    if (!user) router.push("/");
  }, [user, router]);

  // --- ERKEN RETURN ---
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 text-blue-600">
        <div className="w-12 h-12 border-4 border-current border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // --- AKSİYONLAR ---
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
    const confirmDelete = window.confirm(
      t("deleteAccountConfirm") ||
        "Hesabınızı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.",
    );
    if (confirmDelete) {
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

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-gray-950 py-10 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Üst Kısım: Geri Dön ve Başlık */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-3 bg-white dark:bg-gray-900 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-full shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-800 transition-all active:scale-95"
            >
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
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </Link>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              {t("myAccount") || "Profilim"}
            </h1>
          </div>
        </div>

        {/* ANA PROFİL KARTI */}
        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 sm:p-10 shadow-lg shadow-gray-200/50 dark:shadow-black/20 border border-gray-100 dark:border-gray-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-8">
            {/* Avatar */}
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-[2rem] bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center text-5xl font-black shadow-xl shadow-blue-500/30 uppercase shrink-0 transform rotate-3 hover:rotate-0 transition-transform duration-300">
              {user.charAt(0)}
            </div>

            {/* Bilgiler ve Butonlar */}
            <div className="flex-1 text-center sm:text-left w-full">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                {user}
              </h2>

              {/* AKSİYON BUTONLARI GRUBU (Esnek, Hap Tasarımı) */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                {/* 2. İsim Değiştir */}
                <button
                  onClick={() => {
                    setNewNameInput(user);
                    setIsNameModalOpen(true);
                  }}
                  className="flex items-center gap-2.5 px-5 py-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800 text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-400 transition-all font-semibold group text-sm w-full sm:w-auto justify-center"
                >
                  <div className="p-1.5 bg-white dark:bg-gray-800 rounded-lg shadow-sm group-hover:scale-110 transition-transform">
                    <svg
                      className="w-4 h-4 text-blue-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  </div>
                  <span>{t("changeName") || "Adı Değiştir"}</span>
                </button>

                {/* 3. Şifre Değiştir */}
                <button
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="flex items-center gap-2.5 px-5 py-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border border-gray-100 dark:border-gray-800 hover:border-indigo-200 dark:hover:border-indigo-800 text-gray-700 dark:text-gray-300 hover:text-indigo-700 dark:hover:text-indigo-400 transition-all font-semibold group text-sm w-full sm:w-auto justify-center"
                >
                  <div className="p-1.5 bg-white dark:bg-gray-800 rounded-lg shadow-sm group-hover:scale-110 transition-transform">
                    <svg
                      className="w-4 h-4 text-indigo-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <span>{t("changePassword") || "Şifre Değiştir"}</span>
                </button>
              </div>
            </div>
            {/* 1. Namaz Takibi */}
            <Link
              href="/prayers"
              className="flex items-center gap-2.5 px-5 py-3 rounded-xl bg-teal-50/70 dark:bg-teal-900/20 hover:bg-teal-100 dark:hover:bg-teal-900/40 border border-teal-100/50 dark:border-teal-800/50 text-teal-700 dark:text-teal-400 transition-all font-semibold group shadow-sm text-sm w-full sm:w-auto justify-center"
            >
              <div className="p-1.5 bg-white dark:bg-gray-800 rounded-lg shadow-sm group-hover:scale-110 transition-transform">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                  />
                </svg>
              </div>
              <span>{t("prayerTracking") || "Namaz Takibi"}</span>
            </Link>
          </div>
        </div>

        {/* AKTİVİTELER / HALKALAR BÖLÜMÜ */}
        {loadingActivity ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : activity ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Kurulan Halkalar */}
            <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col h-full">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                    {t("createdCircles") || "Kurduğum Halkalar"}
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {t("createdCirclesDesc") || "Yönetici olduğunuz oturumlar"}
                  </p>
                </div>
              </div>

              <div className="flex-1 flex flex-col gap-3">
                {activity.created.length > 0 ? (
                  activity.created.map((session, i) => (
                    <Link
                      key={i}
                      href={`/session/${session.code}`}
                      className="flex items-center justify-between p-4 sm:p-5 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-emerald-300 dark:hover:border-emerald-700 bg-gray-50/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 transition-all shadow-sm hover:shadow-md group"
                    >
                      <div className="overflow-hidden">
                        <div className="text-sm font-black text-emerald-600 mb-1">
                          {session.code}
                        </div>
                        <div className="text-gray-700 dark:text-gray-200 font-semibold truncate">
                          {session.description ||
                            t("unnamedCircle") ||
                            "İsimsiz Halka"}
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 transition-colors shrink-0">
                        <svg
                          className="w-5 h-5 text-emerald-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
                    <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 text-gray-400">
                      <svg
                        className="w-7 h-7"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-500 font-medium">
                      {t("noCreatedCircles") || "Henüz bir halka kurmadınız."}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Katılınan Halkalar */}
            <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col h-full">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                    {t("participatedCircles") || "Katıldığım Halkalar"}
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {t("participatedCirclesDesc") ||
                      "Görev aldığınız oturumlar"}
                  </p>
                </div>
              </div>

              <div className="flex-1 flex flex-col gap-3">
                {activity.participated.length > 0 ? (
                  activity.participated.map((session, i) => (
                    <Link
                      key={i}
                      href={`/session/${session.code}`}
                      className="flex items-center justify-between p-4 sm:p-5 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 bg-gray-50/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 transition-all shadow-sm hover:shadow-md group"
                    >
                      <div className="overflow-hidden">
                        <div className="text-sm font-black text-blue-600 mb-1">
                          {session.code}
                        </div>
                        <div className="text-gray-700 dark:text-gray-200 font-semibold truncate mb-1.5">
                          {session.description ||
                            t("unnamedCircle") ||
                            "İsimsiz Halka"}
                        </div>
                        <span className="inline-block px-2.5 py-1 bg-blue-100/70 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[10px] font-bold rounded-lg uppercase tracking-wide">
                          {session.taskCount} {t("taskCountText") || "Görev"}
                        </span>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors shrink-0">
                        <svg
                          className="w-5 h-5 text-blue-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
                    <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 text-gray-400">
                      <svg
                        className="w-7 h-7"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-500 font-medium">
                      {t("noParticipatedCircles") ||
                        "Henüz hiçbir görev almadınız."}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}

        {/* TEHLİKELİ BÖLGE (HESAP SİL) */}
        <div className="mt-8 bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-[2rem] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left">
            <h4 className="text-red-600 dark:text-red-400 font-black text-lg mb-1">
              {t("deleteAccountTitle") || "Hesabı Sil"}
            </h4>
            <p className="text-sm text-red-500/80 dark:text-red-400/80 font-medium">
              {t("deleteAccountWarning") ||
                "Bu işlem geri alınamaz ve tüm verileriniz kalıcı olarak silinir."}
            </p>
          </div>
          <button
            onClick={handleDeleteAccount}
            className="w-full sm:w-auto px-6 py-3.5 bg-white dark:bg-red-950 border-2 border-red-200 dark:border-red-900 hover:border-red-400 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-sm shrink-0"
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
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            {t("deletePermanently") || "Kalıcı Olarak Sil"}
          </button>
        </div>
      </div>

      {/* --- MODALLAR (İsim ve Şifre Değiştir) --- */}
      {isNameModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-8 w-full max-w-sm shadow-2xl animate-in zoom-in-95 border border-gray-100 dark:border-gray-800">
            {nameUpdateSuccess ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                  {t("success") || "Başarılı!"}
                </h3>
                <p className="text-sm text-gray-500">
                  {t("nameUpdatedSuccess") ||
                    "İsim güncellendi, lütfen tekrar giriş yapın."}
                </p>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-black mb-6 text-gray-900 dark:text-white">
                  {t("changeName") || "Adı Değiştir"}
                </h3>
                <input
                  type="text"
                  value={newNameInput}
                  onChange={(e) => setNewNameInput(e.target.value)}
                  className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 rounded-2xl mb-6 text-lg font-bold outline-none transition-all text-gray-900 dark:text-white"
                  placeholder={t("enterNewName") || "Yeni Adınız"}
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsNameModalOpen(false)}
                    className="flex-1 py-4 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    {t("cancel") || "İptal"}
                  </button>
                  <button
                    onClick={handleUpdateName}
                    className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all"
                  >
                    {t("saveChanges") || "Kaydet"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-8 w-full max-w-sm shadow-2xl animate-in zoom-in-95 border border-gray-100 dark:border-gray-800">
            {passwordUpdateSuccess ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                  {t("success") || "Başarılı!"}
                </h3>
                <p className="text-sm text-gray-500">
                  {t("passwordUpdatedSuccess") || "Şifreniz güncellendi!"}
                </p>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-black mb-6 text-gray-900 dark:text-white">
                  {t("changePassword") || "Şifre Değiştir"}
                </h3>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl mb-3 text-lg font-bold outline-none transition-all text-gray-900 dark:text-white"
                  placeholder={t("currentPassword") || "Mevcut Şifre"}
                />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl mb-6 text-lg font-bold outline-none transition-all text-gray-900 dark:text-white"
                  placeholder={t("newPassword") || "Yeni Şifre"}
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsPasswordModalOpen(false)}
                    className="flex-1 py-4 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    {t("cancel") || "İptal"}
                  </button>
                  <button
                    onClick={handleUpdatePassword}
                    className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition-all"
                  >
                    {t("saveChanges") || "Kaydet"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
