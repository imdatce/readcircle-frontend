"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import SessionCard from "@/components/home/SessionCard";
import { DistributionSession } from "@/types";

export default function SessionsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [createdSessions, setCreatedSessions] = useState<DistributionSession[]>(
    [],
  );
  const [joinedSessions, setJoinedSessions] = useState<DistributionSession[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"created" | "joined">("created");

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }

        const baseUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

        const [createdRes, joinedRes] = await Promise.all([
          fetch(
            new URL(
              "/api/distribution/my-created-sessions",
              baseUrl,
            ).toString(),
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          ),
          fetch(new URL("/api/distribution/my-sessions", baseUrl).toString(), {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (createdRes.ok) setCreatedSessions(await createdRes.json());
        if (joinedRes.ok) setJoinedSessions(await joinedRes.json());
      } catch (error) {
        console.error("Halkalar çekilemedi:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFCF7] dark:bg-[#061612] py-8 px-4 sm:px-6 transition-colors duration-500 relative overflow-hidden">
      {/* Arka Plan Dekoratif Işıklar */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-emerald-400/5 dark:bg-emerald-600/10 rounded-full blur-3xl opacity-50 pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-400/5 dark:bg-blue-600/10 rounded-full blur-3xl opacity-50 pointer-events-none translate-x-1/3 translate-y-1/3"></div>

      <div className="max-w-5xl mx-auto space-y-8 relative z-10">
        {/* Üst Başlık */}
        <div className="flex items-center justify-between bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl p-4 md:p-5 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800">
          <button
            onClick={() => router.push("/")}
            className="p-3 bg-white dark:bg-gray-800 text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-2xl shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-700 transition-all active:scale-95 shrink-0"
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
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              Halkalar
            </h1>
          </div>
          <div className="w-12"></div> {/* Dengeleyici boşluk */}
        </div>

        {/* Sekmeler (Segmented Control Stili) */}
        <div className="flex justify-center">
          <div className="inline-flex bg-gray-100/80 dark:bg-gray-800/80 p-1.5 rounded-2xl shadow-inner border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
            <button
              onClick={() => setActiveTab("created")}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                activeTab === "created"
                  ? "bg-white dark:bg-gray-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}
            >
              {/* Yönetici/Pano İkonu */}
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
              </svg>
              Yönettiğim
            </button>
            <button
              onClick={() => setActiveTab("joined")}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                activeTab === "joined"
                  ? "bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}
            >
              {/* Grup/İnsanlar İkonu */}
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Katıldığım
            </button>
          </div>
        </div>

        {/* İçerik Alanı */}
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-800 border-t-emerald-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeTab === "created" &&
              (createdSessions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {createdSessions.map((session) => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      router={router}
                      t={t}
                      type="managed"
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white/40 dark:bg-gray-900/40 rounded-[2.5rem] border border-dashed border-gray-300 dark:border-gray-700">
                  <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                    <svg
                      className="w-10 h-10"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-black text-gray-800 dark:text-gray-200 mb-2">
                    Henüz Halka Yok
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm">
                    Yönettiğiniz herhangi bir halka bulunmuyor. Ana sayfadan
                    yeni bir okuma halkası başlatabilirsiniz.
                  </p>
                </div>
              ))}

            {activeTab === "joined" &&
              (joinedSessions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {joinedSessions.map((session) => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      router={router}
                      t={t}
                      type="joined"
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white/40 dark:bg-gray-900/40 rounded-[2.5rem] border border-dashed border-gray-300 dark:border-gray-700">
                  <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-full flex items-center justify-center mb-4">
                    <svg
                      className="w-10 h-10"
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
                  <h3 className="text-xl font-black text-gray-800 dark:text-gray-200 mb-2">
                    Henüz Katılım Yok
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm">
                    Şu an için katıldığınız bir halka görünmüyor. Size
                    gönderilen bir davet koduyla halkalara katılabilirsiniz.
                  </p>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
