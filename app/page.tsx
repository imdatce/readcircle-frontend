"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { SessionSummary } from "@/types";

export default function Home() {
  const { t, language } = useLanguage();
  const { user, token } = useAuth();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [mySessions, setMySessions] = useState<SessionSummary[]>([]);
  const [createdSessions, setCreatedSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const isRTL = language === "ar";

  useEffect(() => {
    if (user && token) {
      const fetchAllData = async () => {
        try {
          setLoading(true);
          const apiUrl = process.env.NEXT_PUBLIC_API_URL;
          const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          };

          const [resJoined, resCreated] = await Promise.all([
            fetch(`${apiUrl}/api/distribution/my-sessions?name=${user}`, {
              headers,
            }),
            fetch(
              `${apiUrl}/api/distribution/my-created-sessions?name=${user}`,
              { headers },
            ),
          ]);

          if (resJoined.ok) setMySessions(await resJoined.json());
          if (resCreated.ok) setCreatedSessions(await resCreated.json());
        } catch (error) {
          console.error("Veri hatası", error);
        } finally {
          setLoading(false);
        }
      };
      fetchAllData();
    }
  }, [user, token]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      router.push(`/join/${code.trim()}`);
    }
  };

  const handleCopyLink = (e: React.MouseEvent, code: string, id: number) => {
    e.stopPropagation();
    const link = `${window.location.origin}/join/${code}`;
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!user) {
    return (
      <main
        className="min-h-screen bg-white dark:bg-gray-950 text-gray-800 dark:text-gray-100 font-sans selection:bg-blue-100 dark:selection:bg-blue-900 transition-colors duration-300"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] bg-gradient-to-br from-blue-100/50 to-green-100/50 dark:from-blue-900/20 dark:to-green-900/20 rounded-full blur-3xl opacity-60"></div>
          <div className="absolute top-[30%] -left-[10%] w-[40%] h-[40%] bg-gradient-to-tr from-emerald-100/40 to-blue-50/40 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-full blur-3xl opacity-50"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-24 lg:pt-24 lg:pb-32">
          <div className="text-center max-w-4xl mx-auto mb-20">
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-8 leading-[1.1]">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-600 dark:from-blue-400 dark:to-emerald-400">
                {t("landingHeroTitle") || "Manevi Birliktelik"}
              </span>{" "}
              {t("platform") || "Platformu"}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 leading-relaxed max-w-2xl mx-auto">
              {t("landingHeroSubtitle") ||
                "Kuran hatimleri, Cevşen halkaları ve zikir programlarınızı kolayca organize edin."}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/login"
                className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg hover:shadow-blue-200/50 dark:hover:shadow-blue-900/50 flex items-center gap-2 transform hover:-translate-y-1"
              >
                {t("getStarted") || "Hemen Başla"}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-5 w-5 ${isRTL ? "rotate-180" : ""}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
              <div className="relative group">
                <form
                  onSubmit={handleJoin}
                  className="flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-1 ps-4 shadow-sm group-focus-within:border-blue-400 dark:group-focus-within:border-blue-500 group-focus-within:ring-4 group-focus-within:ring-blue-100 dark:group-focus-within:ring-blue-900/50 transition"
                >
                  <input
                    type="text"
                    placeholder={t("sessionCodePlaceholder") || "Halka Kodu"}
                    className={`outline-none bg-transparent text-gray-700 dark:text-gray-200 placeholder-gray-400 w-48 ${isRTL ? "text-right" : "text-left"}`}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                  >
                    {t("join") || "Katıl"}
                  </button>
                </form>
              </div>
            </div>
            <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
              {t("guestNote") ||
                "Kayıt olmadan misafir olarak da katılabilirsiniz."}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-24">
            <FeatureCard
              icon={
                <svg
                  className="w-8 h-8 text-emerald-600 dark:text-emerald-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              }
              title={t("featuresTitle1") || "Kuran & Cevşen Hatimleri"}
              desc={
                t("featuresDesc1") || "Cüzleri veya sayfaları otomatik dağıtın."
              }
              isRTL={isRTL}
            />
            <FeatureCard
              icon={
                <svg
                  className="w-8 h-8 text-blue-600 dark:text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              }
              title={t("featuresTitle2") || "Ortak Zikir Halkaları"}
              desc={
                t("featuresDesc2") ||
                "Salavat, dua ve zikir gibi hayırlarda bulunun."
              }
              isRTL={isRTL}
            />
            <FeatureCard
              icon={
                <svg
                  className="w-8 h-8 text-purple-600 dark:text-purple-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              }
              title={t("featuresTitle3") || "Mobil Uyumlu Okuma"}
              desc={
                t("featuresDesc3") ||
                "Kuran sayfalarını veya Cevşen bablarını okuyun."
              }
              isRTL={isRTL}
            />
          </div>

          <div className="bg-gray-50 dark:bg-gray-900 rounded-3xl p-8 md:p-12 mb-20 border border-gray-100 dark:border-gray-800 transition-colors">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-800 dark:text-gray-100">
              {t("howItWorksTitle") || "Nasıl Çalışır?"}
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Step
                num="1"
                title={t("step1Title") || "Oturum Oluştur"}
                desc={t("step1Desc") || "Okunacak kaynağı belirle."}
              />
              <Step
                num="2"
                title={t("step2Title") || "Davet Et"}
                desc={t("step2Desc") || "Kodu sevdiklerinle paylaş."}
              />
              <Step
                num="3"
                title={t("step3Title") || "Tamamla"}
                desc={t("step3Desc") || "İlerlemeyi anlık gör."}
              />
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen bg-gray-50 dark:bg-gray-950 p-3 md:p-8 relative transition-colors duration-300"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="max-w-6xl mx-auto mt-4 md:mt-10">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 md:mb-10 gap-4">
          <div
            className={`text-center ${isRTL ? "md:text-right" : "md:text-left"}`}
          >
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
              {t("welcome") || "Hoşgeldin,"}{" "}
              <span className="text-blue-600 dark:text-blue-400">{user}</span>{" "}
              👋
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base mt-1">
              {t("dashboardIntro") ||
                "Bugün manevi yolculuğunda ne yapmak istersin?"}
            </p>
          </div>
          <Link
            href="/admin"
            className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-md hover:bg-blue-700 transition flex justify-center items-center gap-2 transform hover:-translate-y-0.5 active:scale-95 text-sm md:text-base"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            {t("createNewSession") || "Yeni Halka Oluştur"}
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-8 items-start">
          <div className="bg-white dark:bg-gray-900 rounded-xl md:rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors">
            <div className="p-3 md:p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 sticky top-0 z-10 backdrop-blur-sm">
              <h2 className="text-sm md:text-xl font-bold text-gray-800 dark:text-gray-200 flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-3">
                <div className="p-1.5 md:p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg shadow-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 md:h-6 md:w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                    />
                  </svg>
                </div>
                <span>{t("managedSessions") || "Yönettiğim Halkalar"}</span>
              </h2>
            </div>

            <div className="p-3 md:p-6 pt-2">
              {loading ? (
                <div className="animate-pulse space-y-3 mt-2 md:mt-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-16 md:h-20 bg-gray-100 dark:bg-gray-800 rounded-xl"
                    ></div>
                  ))}
                </div>
              ) : createdSessions.length > 0 ? (
                <div className="space-y-2 md:space-y-3 mt-2 md:mt-4">
                  {createdSessions.map((session) => (
                    <div
                      key={session.id}
                      onClick={() => router.push(`/join/${session.code}`)}
                      className="group border border-gray-100 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 bg-gray-50 dark:bg-gray-800 hover:bg-blue-50/30 dark:hover:bg-blue-900/20 p-3 md:p-4 rounded-lg md:rounded-xl transition cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center relative overflow-hidden gap-2"
                    >
                      <div
                        className={`relative z-10 min-w-0 w-full ${isRTL ? "text-right" : "text-left"}`}
                      >
                        <h3 className="font-bold text-gray-800 dark:text-gray-200 text-xs md:text-base group-hover:text-blue-700 dark:group-hover:text-blue-400 transition truncate">
                          {session.description}
                        </h3>
                        <div
                          className={`flex items-center gap-1 mt-1 ${isRTL ? "justify-end" : "justify-start"}`}
                        >
                          <span className="text-[10px] md:text-xs font-mono bg-white dark:bg-gray-700 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 shadow-sm">
                            #{session.code}
                          </span>
                        </div>
                      </div>
                      <div
                        className={`flex gap-1 md:gap-2 relative z-10 w-full md:w-auto ${isRTL ? "justify-start" : "justify-end"}`}
                      >
                        <button
                          onClick={(e) =>
                            handleCopyLink(e, session.code, session.id)
                          }
                          className={`p-1.5 md:p-2 rounded-md md:rounded-lg transition shadow-sm border ${copiedId === session.id ? "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 border-green-200 dark:border-green-800" : "bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-400 dark:text-gray-300 border-gray-200 dark:border-gray-600"}`}
                        >
                          {copiedId === session.id ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 md:h-5 md:w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 md:h-5 md:w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                              />
                            </svg>
                          )}
                        </button>
                        <Link
                          href={`/admin/monitor?code=${session.code}`}
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 md:p-2 text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:text-blue-700 dark:hover:text-blue-300 rounded-md md:rounded-lg shadow-sm border border-blue-100 dark:border-blue-900/50 transition"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 md:h-5 md:w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z"
                            />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 md:py-10 bg-gray-50 dark:bg-gray-800 rounded-lg md:rounded-xl border border-dashed border-gray-200 dark:border-gray-700 mt-2 md:mt-4">
                  <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm mb-2">
                    {t("noSessionYet") || "Henüz yok."}
                  </p>
                  <Link
                    href="/admin"
                    className="text-blue-600 dark:text-blue-400 text-xs md:text-sm font-bold hover:underline"
                  >
                    {t("create") || "Oluştur"}
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl md:rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors">
            <div className="p-3 md:p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 sticky top-0 z-10 backdrop-blur-sm">
              <h2 className="text-sm md:text-xl font-bold text-gray-800 dark:text-gray-200 flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-3">
                <div className="p-1.5 md:p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg shadow-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 md:h-6 md:w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <span>{t("joinedSessions") || "Katıldığım Halkalar"}</span>
              </h2>
            </div>

            <div className="p-3 md:p-6 pt-2">
              {loading ? (
                <div className="animate-pulse space-y-3 mt-2 md:mt-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-16 md:h-20 bg-gray-100 dark:bg-gray-800 rounded-xl"
                    ></div>
                  ))}
                </div>
              ) : mySessions.length > 0 ? (
                <div className="space-y-2 md:space-y-3 mt-2 md:mt-4">
                  {mySessions.map((session) => (
                    <div
                      key={session.id}
                      onClick={() => router.push(`/join/${session.code}`)}
                      className="group border border-gray-100 dark:border-gray-800 hover:border-emerald-300 dark:hover:border-emerald-700 bg-gray-50 dark:bg-gray-800 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/20 p-3 md:p-4 rounded-lg md:rounded-xl transition cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center relative overflow-hidden gap-2"
                    >
                      <div
                        className={`relative z-10 min-w-0 w-full ${isRTL ? "text-right" : "text-left"}`}
                      >
                        <h3 className="font-bold text-gray-800 dark:text-gray-200 text-xs md:text-base group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition truncate">
                          {session.description}
                        </h3>
                        <div
                          className={`flex items-center gap-2 mt-1 ${isRTL ? "justify-end" : "justify-start"}`}
                        >
                          <span className="text-[10px] md:text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded border border-emerald-100 dark:border-emerald-900/50 truncate max-w-full block">
                            {session.creatorName}
                          </span>
                        </div>
                      </div>
                      <div className="bg-white dark:bg-gray-700 p-1.5 md:p-2 rounded-full shadow-sm border border-gray-100 dark:border-gray-600 group-hover:border-emerald-200 dark:group-hover:border-emerald-700 transition relative z-10 self-end md:self-auto">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 md:h-5 md:w-5 text-gray-400 dark:text-gray-300 group-hover:text-emerald-500 dark:group-hover:text-emerald-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 md:py-10 bg-gray-50 dark:bg-gray-800 rounded-lg md:rounded-xl border border-dashed border-gray-200 dark:border-gray-700 mt-2 md:mt-4">
                  <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm">
                    {t("noSessionYet") || "Henüz yok."}
                  </p>
                </div>
              )}

              <div className="mt-4 md:mt-8 pt-4 md:pt-6 border-t border-gray-100 dark:border-gray-800">
                <form onSubmit={handleJoin} className="flex gap-1 md:gap-2">
                  <input
                    type="text"
                    placeholder={t("codePlaceholder") || "Kod..."}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className={`flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition w-full min-w-0 text-gray-800 dark:text-gray-200 ${isRTL ? "text-right" : "text-left"}`}
                  />
                  <button className="px-3 md:px-6 py-2 bg-emerald-600 text-white rounded-lg font-bold text-xs md:text-sm hover:bg-emerald-700 shadow-md hover:shadow-lg transition transform active:scale-95 whitespace-nowrap">
                    {t("join") || "Katıl"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

 function FeatureCard({
  icon,
  title,
  desc,
  isRTL,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  isRTL: boolean;
}) {
  return (
    <div
      className={`p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${isRTL ? "text-right" : "text-left"}`}
    >
      <div
        className={`w-14 h-14 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center mb-6 ${isRTL ? "ml-auto" : "mr-auto"}`}
      >
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{desc}</p>
    </div>
  );
}

function Step({
  num,
  title,
  desc,
}: {
  num: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl mb-6 shadow-lg shadow-blue-200 dark:shadow-blue-900/50">
        {num}
      </div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-300 text-sm max-w-xs">
        {desc}
      </p>
    </div>
  );
}
