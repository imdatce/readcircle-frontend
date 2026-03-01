/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";

interface AdminStats {
  totalUsers: number;
  totalSessions: number;
  totalAssignments: number;
}

interface UserData {
  id: number;
  username: string;
  role: string;
  createdSessionsCount: number;
}

interface SessionData {
  id: number;
  code: string;
  description: string;
  totalTasks: number;
  completedTasks: number;
  createdBy: string;
}

interface AdminData {
  stats: AdminStats;
  users: UserData[];
  sessions: SessionData[];
}

export default function SuperAdminPage() {
  const { role, token, user: currentUser } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AdminData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"users" | "sessions">("users");

  useEffect(() => {
    if (role !== "ROLE_ADMIN") {
      router.push("/");
      return;
    }

    const fetchAdminData = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/admin/dashboard`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        if (!response.ok)
          throw new Error(
            t("errorOccurred") || "Veriler çekilirken bir hata oluştu.",
          );
        const result = await response.json();
        setData(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchAdminData();
  }, [role, token, router, t]);

  const handleDeleteUser = async (userId: number, username: string) => {
    // Çeviriye parametre gönderebilmek için basit bir replace mantığı kullanıyoruz
    const confirmMsg = t("confirmDeleteUser")
      ? t("confirmDeleteUser").replace("{username}", username)
      : `"${username}" adlı kullanıcıyı kalıcı olarak silmek istediğinize emin misiniz?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/admin/delete-user/${userId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.ok) {
        setData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            stats: { ...prev.stats, totalUsers: prev.stats.totalUsers - 1 },
            users: prev.users.filter((u) => u.id !== userId),
          };
        });
      } else {
        const err = await response.json();
        alert(
          err.message || t("deleteFailed") || "Silme işlemi başarısız oldu.",
        );
      }
    } catch (error) {
      console.error("Silme hatası:", error);
      alert(t("errorOccurred") || "Bir hata oluştu.");
    }
  };

  if (role !== "ROLE_ADMIN") return null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 text-center">
        <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-xl border border-red-100 max-w-md w-full">
          <h2 className="text-xl font-bold text-red-500 mb-4">
            {error || t("errorOccurred")}
          </h2>
          <Link
            href="/"
            className="px-6 py-2 bg-gray-800 text-white rounded-xl"
          >
            {t("backHome") || "Anasayfaya Dön"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-12">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-xl hover:text-purple-600 transition-colors"
              title={t("backHome")}
            >
              <svg
                className="w-5 h-5"
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
            <h1 className="text-xl md:text-2xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              {t("adminPanel") || "Sistem Yönetimi"}
            </h1>
          </div>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest px-3 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg">
            {t("superAdminRole") || "SÜPER ADMİN"}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-10">
          <StatCard
            title={t("totalUsers") || "Toplam Kullanıcı"}
            value={data.stats.totalUsers}
            icon="users"
            color="blue"
          />
          <StatCard
            title={t("totalSessions") || "Oluşturulan Halkalar"}
            value={data.stats.totalSessions}
            icon="circles"
            color="emerald"
          />
          <StatCard
            title={t("totalAssignments") || "Alınan Görevler"}
            value={data.stats.totalAssignments}
            icon="tasks"
            color="purple"
          />
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="flex border-b border-gray-100 dark:border-gray-800 p-2 gap-2 bg-gray-50/50 dark:bg-gray-900/50">
            <button
              onClick={() => setActiveTab("users")}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === "users" ? "bg-white dark:bg-gray-800 text-purple-600 shadow-sm border border-gray-200 dark:border-gray-700" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
            >
              {t("users") || "Kullanıcılar"} ({data.users.length})
            </button>
            <button
              onClick={() => setActiveTab("sessions")}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === "sessions" ? "bg-white dark:bg-gray-800 text-purple-600 shadow-sm border border-gray-200 dark:border-gray-700" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
            >
              {t("distributionCircles") || "Dağıtım Halkaları"} (
              {data.sessions.length})
            </button>
          </div>

          <div className="p-0 overflow-x-auto">
            {activeTab === "users" && (
              <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-400 uppercase bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">
                      {t("usernameLabel") || "Kullanıcı Adı"}
                    </th>
                    <th className="px-6 py-4">{t("roleLabel") || "Yetki"}</th>
                    <th className="px-6 py-4 text-center">
                      {t("createdCirclesLabel") || "Kurduğu Halkalar"}
                    </th>
                    <th className="px-6 py-4 text-center">
                      {t("actionLabel") || "İşlem"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.users.map((u) => (
                    <tr
                      key={u.id}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="px-6 py-4 font-bold text-gray-400">
                        #{u.id}
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center font-black uppercase">
                          {u.username.charAt(0)}
                        </div>
                        {u.username}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-xs font-black ${u.role === "ROLE_ADMIN" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"}`}
                        >
                          {u.role === "ROLE_ADMIN"
                            ? t("adminRole") || "YÖNETİCİ"
                            : t("userRole") || "KULLANICI"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg font-black">
                          {u.createdSessionsCount}{" "}
                          {t("circleCountLabel") || "Halka"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {u.username !== currentUser && (
                          <button
                            onClick={() => handleDeleteUser(u.id, u.username)}
                            className="p-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-500 rounded-lg transition-colors inline-flex"
                            title={t("deleteUser") || "Kullanıcıyı Sil"}
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === "sessions" && (
              <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-400 uppercase bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">
                      {t("circleCodeLabel") || "Halka Kodu"}
                    </th>
                    <th className="px-6 py-4">
                      {t("ownerLabel") || "Oluşturan (Sahip)"}
                    </th>
                    <th className="px-6 py-4">
                      {t("descriptionLabel") || "Açıklama"}
                    </th>
                    <th className="px-6 py-4 min-w-[200px]">
                      {t("progressStatusLabel") || "İlerleme Durumu"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.sessions.map((s) => {
                    const percent =
                      s.totalTasks === 0
                        ? 0
                        : Math.round((s.completedTasks / s.totalTasks) * 100);
                    return (
                      <tr
                        key={s.id}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                      >
                        <td className="px-6 py-4 font-bold text-gray-400">
                          #{s.id}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg font-black uppercase tracking-wider">
                            {s.code}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-bold text-xs">
                            {s.createdBy}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-700 dark:text-gray-300">
                          {s.description || (
                            <span className="text-gray-400 italic">
                              {t("unnamedCircle") || "İsimsiz Halka"}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex justify-between text-xs font-bold">
                              <span className="text-gray-500 dark:text-gray-400">
                                {s.completedTasks} / {s.totalTasks}{" "}
                                {t("taskCountLabel") || "Görev"}
                              </span>
                              <span
                                className={
                                  percent === 100
                                    ? "text-emerald-500"
                                    : "text-blue-500"
                                }
                              >
                                %{percent}
                              </span>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-2 rounded-full transition-all duration-1000 ${percent === 100 ? "bg-emerald-500" : "bg-blue-500"}`}
                                style={{ width: `${percent}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, icon, color }: any) {
  const colors: any = {
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800/30",
    emerald:
      "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/30",
    purple:
      "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-800/30",
  };

  const getIcon = () => {
    if (icon === "users")
      return (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
        />
      );
    if (icon === "circles")
      return (
        <>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 9.563C9 9.252 9.252 9 9.563 9h4.874c.311 0 .563.252.563.563v4.874c0 .311-.252.563-.563.563H9.564A.562.562 0 019 14.437V9.564z"
          />
        </>
      );
    return (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
      />
    );
  };

  return (
    <div
      className={`p-6 rounded-3xl border flex items-center gap-5 ${colors[color]}`}
    >
      <div className="w-14 h-14 shrink-0 rounded-2xl bg-white/50 dark:bg-black/20 flex items-center justify-center shadow-inner">
        <svg
          className="w-7 h-7"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          {getIcon()}
        </svg>
      </div>
      <div>
        <p className="text-[10px] md:text-xs font-black uppercase tracking-widest opacity-70 mb-1">
          {title}
        </p>
        <h3 className="text-3xl font-black leading-none">{value}</h3>
      </div>
    </div>
  );
}
