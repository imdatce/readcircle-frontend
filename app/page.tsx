/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { SessionSummary } from "@/types";
import { useSearchParams } from "next/navigation";

// --- SIRALAMA MANTIĞI ---
const ORDER_PRIORITY = [
  "QURAN", // 1. Kuran
  "CEVSEN", // 2. Cevşen
  "TEVHIDNAME", // 3. Tevhidname
  "FETIH", // 4. Fetih
  "YASIN", // 5. Yasin
  "FATIHA",
  "IHLAS",
  "WAQIA",
  "BEDIR", // 6. Bedir
  "UHUD", // 7. Uhud
  "OZELSALAVAT", // 8. Büyük Salavat
  "MUNCIYE", // 9. Münciye
  "TEFRICIYE", // 10. Tefriciye
  "YALATIF", // 11. Ya Latif
  "YAHAFIZ", // 12. Ya Hafiz
  "YAFETTAH", // 13. Ya Fettah
  "HASBUNALLAH", // 14. Hasbunallah
  "LAHAVLE", // 15. La Havle
];

const sortSessions = (sessions: SessionSummary[]) => {
  return [...sessions].sort((a, b) => {
    // Backend'den gelen SessionSummary içinde 'resourceCode', 'codeKey' veya 'resource.codeKey' olabilir.
    // Hepsini kontrol ederek garantiye alıyoruz.
    const codeA = (
      (a as any).resourceCode ||
      (a as any).codeKey ||
      (a as any).resource?.codeKey ||
      ""
    ).toUpperCase();
    const codeB = (
      (b as any).resourceCode ||
      (b as any).codeKey ||
      (b as any).resource?.codeKey ||
      ""
    ).toUpperCase();

    const indexA = ORDER_PRIORITY.indexOf(codeA);
    const indexB = ORDER_PRIORITY.indexOf(codeB);

    // İkisi de listede varsa, listedeki sıraya göre
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;

    // Sadece A listedeyse, A öne gelir
    if (indexA !== -1) return -1;

    // Sadece B listedeyse, B öne gelir
    if (indexB !== -1) return 1;

    // Listede yoklarsa ID'ye göre (varsayılan: en son eklenen en üstte kalsın istersen b.id - a.id yapabilirsin)
    return b.id - a.id;
  });
};

function HomeContent() {
  const { t, language } = useLanguage();
  const { user, token } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [mySessions, setMySessions] = useState<SessionSummary[]>([]);
  const [createdSessions, setCreatedSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"managed" | "joined" | null>(null);
  const isRTL = language === "ar";
  const sessionsRef = useRef<HTMLDivElement>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (user && token) {
      const fetchAllData = async () => {
        try {
          setLoading(true);
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
          console.error("Data error", error);
        } finally {
          setLoading(false);
        }
      };
      fetchAllData();
    }
  }, [user, token, apiUrl]);

  useEffect(() => {
    const tabParam = searchParams.get("tab");

    if (tabParam === "managed" || tabParam === "joined") {
      setActiveTab(tabParam);

      setTimeout(() => {
        if (sessionsRef.current) {
          sessionsRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 300);
    }
  }, [searchParams]);

  const handleJoin = () => {
    if (!code.trim()) return;

    let sessionCode = code.trim();
    if (sessionCode.includes("/join/")) {
      const parts = sessionCode.split("/join/");
      if (parts.length > 1) {
        sessionCode = parts[1].split("?")[0];
      }
    }
    router.push(`/join/${sessionCode}`);
  };

  const handleCopyLink = (e: React.MouseEvent, code: string, id: number) => {
    e.stopPropagation();
    const link = `${window.location.origin}/join/${code}`;
    navigator.clipboard.writeText(link);
    setCopiedId(`${id}-link`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyCode = (e: React.MouseEvent, code: string, id: number) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedId(`${id}-code`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteSession = async (sessionCode: string) => {
    if (!confirm(t("confirmDelete"))) return;

    try {
      const res = await fetch(
        `${apiUrl}/api/distribution/delete-session/${sessionCode}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (res.ok) {
        setCreatedSessions((prev) =>
          prev.filter((s) => s.code !== sessionCode),
        );
      } else {
        const msg = await res.text();
        alert(t("errorOccurred") + " " + msg);
      }
    } catch (error) {
      console.error("Data error", error);
    }
  };

  const handleResetSession = async (sessionCode: string) => {
    if (!confirm(t("confirmReset"))) return;

    try {
      const res = await fetch(
        `${apiUrl}/api/distribution/reset-session/${sessionCode}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (res.ok) {
        alert(t("successReset"));
      } else {
        const msg = await res.text();
        alert(t("errorOccurred") + " " + msg);
      }
    } catch (error) {
      console.error(error);
      alert(t("connectionError"));
    }
  };

  const handleLeaveSession = async (sessionCode: string) => {
    if (!confirm(t("confirmLeave"))) return;

    try {
      const res = await fetch(
        `${apiUrl}/api/distribution/leave-session/${sessionCode}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (res.ok) {
        setMySessions((prev) => prev.filter((s) => s.code !== sessionCode));
        alert(t("successLeave"));
      } else {
        const msg = await res.text();
        alert(t("errorOccurred") + " " + msg);
      }
    } catch (error) {
      console.error(error);
      alert(t("connectionError"));
    }
  };

  const toggleTab = (tab: "managed" | "joined") => {
    if (activeTab === tab) {
      setActiveTab(null);
    } else {
      setActiveTab(tab);
      setTimeout(() => {
        sessionsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  };

  function AyahIcon() {
    return (
      <svg
        width="32"
        height="32"
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 opacity-80"
      >
        <path
          d="M18 2L21.5 6.5H26.5L28 11.5L33 14.5L31 19.5L33 24.5L28 27.5L26.5 32.5H21.5L18 37L14.5 32.5H9.5L8 27.5L3 24.5L5 19.5L3 14.5L8 11.5L9.5 6.5H14.5L18 2Z"
          className="fill-emerald-600/20 stroke-emerald-600 dark:fill-emerald-400/20 dark:stroke-emerald-400"
          strokeWidth="1.5"
        />
        <circle
          cx="18"
          cy="19.5"
          r="5"
          className="fill-emerald-600 dark:fill-emerald-400"
        />
      </svg>
    );
  }

  return (
    <main
      className="min-h-screen bg-gray-50/50 dark:bg-gray-950 text-gray-800 dark:text-gray-100 font-sans selection:bg-emerald-100 dark:selection:bg-emerald-900 transition-colors duration-300 relative overflow-hidden"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-400/10 dark:bg-blue-600/10 rounded-[100%] blur-3xl opacity-50" />
        <div className="absolute top-[20%] right-0 w-[600px] h-[600px] bg-emerald-400/10 dark:bg-emerald-600/10 rounded-[100%] blur-3xl opacity-40" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-24 lg:pt-24 lg:pb-16">
        <div className="text-center max-w-4xl mx-auto mb-12 md:mb-16">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-8 leading-[1.15]">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-emerald-500 to-teal-500 dark:from-blue-400 dark:via-emerald-400 dark:to-teal-400 animate-gradient">
              {t("landingHeroTitle")}
            </span>{" "}
          </h1>

          <div className="relative mx-auto max-w-2xl mt-4 mb-12 group cursor-default">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-red-500/10 to-emerald-500/10 blur-2xl rounded-full opacity-0 group-hover:opacity-70 transition-opacity duration-1000"></div>

            <div className="relative bg-white/40 dark:bg-gray-900/40 backdrop-blur-md border-y border-emerald-500/30 py-8 px-4 md:px-12 rounded-lg shadow-sm">
              <h2
                className="font-serif text-2xl md:text-4xl text-gray-800 dark:text-gray-100 mb-4 leading-relaxed drop-shadow-sm text-center flex items-center justify-center gap-4"
                dir="rtl"
                lang="ar"
              >
                <AyahIcon />
                <span className="leading-tight">
                  اَلَا بِذِكْرِ اللّٰهِ تَطْمَئِنُّ الْقُلُوبُ
                </span>
                <AyahIcon />
              </h2>

              <div className="flex flex-col items-center gap-2">
                <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 italic font-medium font-serif text-center max-w-lg mx-auto">
                  &quot;{t("homeVerseContent")}&quot;
                </p>
                <span className="text-xs text-emerald-600 dark:text-emerald-500 font-bold tracking-widest uppercase opacity-80">
                  Ra&apos;d, 28
                </span>
              </div>
            </div>
          </div>

          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-10 leading-relaxed max-w-2xl mx-auto">
            {user
              ? `${t("welcome")}, ${user}. ${t("dashboardIntro")}`
              : t("landingHeroSubtitle")}
          </p>

          <div className="flex flex-col gap-8 w-full max-w-4xl mx-auto mb-16">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-100 to-emerald-100 dark:from-blue-900/30 dark:to-emerald-900/30 rounded-[2rem] blur opacity-50 group-hover:opacity-100 transition duration-1000"></div>
              <div className="relative bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 p-6 md:p-8 rounded-[1.8rem] shadow-xl">
                <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
                  {user ? (
                    <Link
                      href="/admin"
                      className="w-full md:w-auto px-8 py-4 bg-white/40 dark:bg-blue-600/10 hover:bg-blue-600 text-blue-600 dark:text-blue-400 hover:text-white rounded-2xl font-bold text-lg border-2 border-blue-600/20 hover:border-blue-600 shadow-lg shadow-blue-500/5 hover:shadow-blue-500/20 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 whitespace-nowrap group"
                    >
                      <div className="p-1 bg-blue-600/10 group-hover:bg-white/20 rounded-lg transition-colors">
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
                      </div>
                      {t("createNewSession")}
                    </Link>
                  ) : (
                    <Link
                      href="/login"
                      className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-500/20 hover:shadow-blue-600/30 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                      {t("getStarted")}
                    </Link>
                  )}
                  <div className="hidden md:block w-px h-12 bg-gray-200 dark:bg-gray-700"></div>
                  <form
                    onSubmit={handleJoin}
                    className="flex items-center w-full md:w-auto bg-gray-50/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-2xl p-1.5 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-400 transition-all shadow-sm"
                  >
                    {/* İkon Bölümü: Küçülmemesi için shrink-0 ekledik */}
                    <div className="pl-3 pr-2 text-gray-400 shrink-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                        />
                      </svg>
                    </div>

                    {/* Input Bölümü: min-w-[200px] KALDIRILDI. Yerine flex-1 ve min-w-0 eklendi */}
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder={t("pasteCodeOrLink")}
                      className="bg-transparent border-none focus:ring-0 text-gray-800 dark:text-gray-100 placeholder-gray-400 w-full flex-1 min-w-0 text-sm md:text-base"
                      onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                    />

                    {/* Buton Bölümü: Padding mobilde biraz kısıldı (px-3), masaüstünde geniş (md:px-5) */}
                    <button
                      type="submit"
                      className="shrink-0 px-3 py-2.5 md:px-5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-600 rounded-xl font-bold shadow-sm transition-all duration-200 whitespace-nowrap text-xs md:text-sm"
                    >
                      {t("join")}
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {user && (
              <div
                id="circles-section"
                className="relative group mt-20 scroll-mt-28 animate-in fade-in slide-in-from-bottom-8 duration-1000"
              >
                <div className="absolute -inset-10 bg-gradient-to-r from-blue-500/5 via-emerald-500/5 to-teal-500/5 dark:from-blue-500/10 dark:via-emerald-500/10 dark:to-teal-500/10 rounded-[5rem] blur-3xl opacity-100 transition duration-1000 group-hover:opacity-100"></div>

                <div className="relative bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl border border-white/50 dark:border-gray-800/50 p-4 md:p-6 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                  <div className="flex items-center justify-center gap-6 mb-8">
                    <div className="h-[2px] w-12 md:w-20 bg-gradient-to-l from-transparent to-blue-500 rounded-full"></div>

                    <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-[0.2em] uppercase">
                      {t("circles")}
                    </h2>

                    <div className="h-[2px] w-12 md:w-20 bg-gradient-to-r from-transparent to-emerald-500 rounded-full"></div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-3 justify-center items-stretch">
                    <button
                      onClick={() => toggleTab("managed")}
                      className={`flex-1 group/btn relative px-8 py-6 rounded-[2.2rem] font-bold text-lg transition-all duration-500 overflow-hidden ${
                        activeTab === "managed"
                          ? "bg-blue-600 text-white shadow-xl shadow-blue-500/25 scale-[1.02]"
                          : "bg-gray-50/50 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      }`}
                    >
                      <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-4">
                        <div
                          className={`p-3 rounded-2xl transition-all duration-500 shadow-sm ${
                            activeTab === "managed"
                              ? "bg-white/20 rotate-12"
                              : "bg-white dark:bg-gray-800 text-blue-600"
                          }`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
                          </svg>
                        </div>
                        <span className="tracking-wide">
                          {t("managedSessions")}
                        </span>
                      </div>
                    </button>

                    <div className="hidden md:flex items-center justify-center px-2">
                      <div className="w-px h-12 bg-gray-200 dark:bg-gray-700"></div>
                    </div>

                    <button
                      onClick={() => toggleTab("joined")}
                      className={`flex-1 group/btn relative px-8 py-6 rounded-[2.2rem] font-bold text-lg transition-all duration-500 overflow-hidden ${
                        activeTab === "joined"
                          ? "bg-emerald-600 text-white shadow-xl shadow-emerald-500/25 scale-[1.02]"
                          : "bg-gray-50/50 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                      }`}
                    >
                      <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-4">
                        <div
                          className={`p-3 rounded-2xl transition-all duration-500 shadow-sm ${
                            activeTab === "joined"
                              ? "bg-white/20 -rotate-12"
                              : "bg-white dark:bg-gray-800 text-emerald-600"
                          }`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3.005 3.005 0 013.75-2.906z" />
                          </svg>
                        </div>
                        <span className="tracking-wide">
                          {t("joinedSessions")}
                        </span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {user && activeTab && (
          <div
            ref={sessionsRef}
            className="mb-24 scroll-mt-28 animate-in fade-in slide-in-from-bottom-4 duration-500"
          >
            {activeTab === "managed" && (
              <div className="max-w-4xl mx-auto">
                <DashboardColumn
                  title={t("managedSessions")}
                  icon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
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
                  }
                  iconColor="bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400"
                  borderColor="border-blue-100 dark:border-blue-900/30"
                >
                  {loading ? (
                    <DashboardSkeleton />
                  ) : createdSessions.length > 0 ? (
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 -mr-2 custom-scrollbar pb-2">
                      {/* BURASI GÜNCELLENDİ: sortSessions KULLANILDI */}
                      {sortSessions(createdSessions).map((session) => (
                        <SessionCard
                          key={session.id}
                          session={session}
                          router={router}
                          isRTL={isRTL}
                          handleCopyLink={handleCopyLink}
                          handleCopyCode={handleCopyCode}
                          copiedId={copiedId}
                          type="managed"
                          onDelete={handleDeleteSession}
                          onReset={handleResetSession}
                          t={t}
                        />
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      title={t("noCreatedYet")}
                      actionLink="/admin"
                      actionText={t("createNewSession")}
                    />
                  )}
                </DashboardColumn>
              </div>
            )}
            {activeTab === "joined" && (
              <div className="max-w-4xl mx-auto">
                <DashboardColumn
                  title={t("joinedSessions")}
                  icon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
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
                  }
                  iconColor="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400"
                  borderColor="border-emerald-100 dark:border-emerald-900/30"
                >
                  {loading ? (
                    <DashboardSkeleton />
                  ) : mySessions.length > 0 ? (
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 -mr-2 custom-scrollbar pb-2">
                      {/* BURASI GÜNCELLENDİ: sortSessions KULLANILDI */}
                      {sortSessions(mySessions).map((session) => (
                        <SessionCard
                          key={session.id}
                          session={session}
                          router={router}
                          isRTL={isRTL}
                          handleCopyLink={handleCopyLink}
                          handleCopyCode={handleCopyCode}
                          copiedId={copiedId}
                          type="joined"
                          onLeave={handleLeaveSession}
                          t={t}
                        />
                      ))}
                    </div>
                  ) : (
                    <EmptyState title={t("noCirclesYet")} />
                  )}
                </DashboardColumn>
              </div>
            )}
          </div>
        )}

        <div className="max-w-3xl mx-auto px-4 mb-2">
          <div className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-md rounded-[1.5rem] p-6 border border-white/20 dark:border-gray-800 shadow-sm">
            <h2 className="text-xl font-bold text-center mb-6 text-gray-800 dark:text-gray-100">
              {t("howItWorksTitle")}
            </h2>
            <div className="grid grid-cols-3 gap-4 relative">
              <div className="hidden md:block absolute top-5 left-[20%] right-[20%] h-px bg-gray-200 dark:bg-gray-700 -z-10"></div>
              <Step num="1" title={t("step1Title")} desc={t("step1Desc")} />
              <Step num="2" title={t("step2Title")} desc={t("step2Desc")} />
              <Step num="3" title={t("step3Title")} desc={t("step3Desc")} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function GlobalLoading() {
  const { t } = useLanguage(); // i18n hook eklendi
  const [isSlowLoad, setIsSlowLoad] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsSlowLoad(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 flex flex-col items-center justify-center text-center px-4">
      <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-emerald-100 dark:border-emerald-900/50 border-t-emerald-600 dark:border-t-emerald-500 rounded-full animate-spin mb-5"></div>

      <p className="text-gray-800 dark:text-gray-200 font-bold animate-pulse text-lg">
        {t("loading")}
      </p>

      {isSlowLoad && (
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 max-w-[280px] animate-in fade-in duration-1000 leading-relaxed bg-emerald-50 dark:bg-emerald-900/10 p-3 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
          {t("serverWakingUpPart1") || "Sunucu uyandırılıyor. Bu işlem "}
          <span className="font-bold text-emerald-600 dark:text-emerald-400">
            30-40 {t("seconds") || "saniye"}
          </span>{" "}
          {t("serverWakingUpPart2") ||
            "sürebilir, lütfen sekneyi kapatmadan bekleyin."}
        </p>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<GlobalLoading />}>
      <HomeContent />
    </Suspense>
  );
}

function DashboardColumn({ title, icon, iconColor, children }: any) {
  return (
    <div className="relative group h-full">
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-100 to-emerald-100 dark:from-blue-900/20 dark:to-emerald-900/20 rounded-[1.8rem] blur opacity-50 transition duration-1000"></div>
      <div className="relative bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 p-6 md:p-8 rounded-[1.8rem] shadow-xl h-full flex flex-col">
        <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className={`p-3 rounded-2xl ${iconColor}`}>{icon}</div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            {title}
          </h2>
        </div>
        <div className="flex-1 flex flex-col">{children}</div>
      </div>
    </div>
  );
}

function EmptyState({ title, actionLink, actionText }: any) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 py-12 text-center rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/30">
      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4 text-gray-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
      </div>
      <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-xs">{title}</p>
      {actionLink && (
        <Link
          href={actionLink}
          className="px-6 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 rounded-lg font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
        >
          {actionText}
        </Link>
      )}
    </div>
  );
}

function DashboardSkeleton() {
  const { t } = useLanguage(); // i18n hook eklendi
  const [isSlowLoad, setIsSlowLoad] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsSlowLoad(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-4">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="h-24 bg-gray-200/70 dark:bg-gray-800/70 rounded-2xl animate-pulse"
        ></div>
      ))}

      {isSlowLoad && (
        <div className="p-4 mt-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30 text-center animate-in fade-in slide-in-from-top-2 duration-1000">
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            {t("serverWakingUpPart1") ||
              "Sunucu uyandırılıyor... Verilerin yüklenmesi "}
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              30-40 {t("seconds") || "saniye"}
            </span>{" "}
            {t("serverWakingUpPart2") || "sürebilir, lütfen bekleyin."}
          </p>
        </div>
      )}
    </div>
  );
}

function Step({ num, title, desc }: any) {
  return (
    <div className="flex flex-col items-center text-center group py-1">
      <div className="w-10 h-10 bg-white dark:bg-gray-800 border-2 border-blue-50 dark:border-gray-700 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-bold text-lg mb-2 shadow-sm shrink-0">
        {num}
      </div>
      <h3 className="text-base font-bold text-gray-900 dark:text-white mb-0.5 leading-tight">
        {title}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 leading-tight max-w-[140px]">
        {desc}
      </p>
    </div>
  );
}

function SessionCard({
  session,
  router,
  isRTL,
  type,
  onDelete,
  onReset,
  onLeave,
  t,
}: any) {
  return (
    <div
      onClick={() => router.push(`/join/${session.code}`)}
      className="group relative bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700/60 hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-lg dark:hover:shadow-blue-900/10 transition-all cursor-pointer overflow-hidden"
    >
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-start gap-3">
          <div className="min-w-0">
            <h3
              className={`font-bold text-lg text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors ${isRTL ? "text-right" : "text-left"}`}
            >
              {session.description}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-700/50 px-2 py-0.5 rounded text-xs font-mono text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600">
                # {session.code}
              </span>
            </div>
          </div>
          {type !== "managed" && (
            <div className="shrink-0 flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 px-3 py-1.5 rounded-lg text-xs border border-indigo-100 dark:border-indigo-800/50 shadow-sm">
              <span className="opacity-70 font-medium">
                {t("creatorLabel")}:
              </span>
              <span className="font-bold truncate max-w-[80px] sm:max-w-[120px]">
                {session.creatorName}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-3 h-3 opacity-60 ml-0.5"
              >
                <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
              </svg>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onLeave && onLeave(session.code);
                }}
                className="p-1.5 bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400 rounded-lg transition-colors border border-red-100 dark:border-red-900/30"
                title={t("leaveSession")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
        {type === "managed" && (
          <div className="flex flex-wrap items-center justify-end gap-2 mt-2 pt-3 border-t border-gray-50 dark:border-gray-700/50">
            <div className="flex items-center bg-gray-50 dark:bg-gray-900/50 rounded-lg p-0.5 border border-gray-100 dark:border-gray-700">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const link = `${window.location.origin}/join/${session.code}`;
                  navigator.clipboard.writeText(link);
                  alert(t("copied"));
                }}
                className="p-1.5 rounded-md transition-all text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 relative group/btn hover:bg-white dark:hover:bg-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  ></path>
                </svg>
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-[10px] text-white bg-gray-800 rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {t("copyLink")}
                </span>
              </button>
              <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-0.5"></div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  navigator.clipboard.writeText(session.code);
                  alert(t("copied"));
                }}
                className="p-1.5 rounded-md transition-all text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 relative group/btn hover:bg-white dark:hover:bg-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                  ></path>
                </svg>
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-[10px] text-white bg-gray-800 rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {t("copyCode")}
                </span>
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onReset && onReset(session.code);
                }}
                className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
                title={t("resetSession")}
              >
                <RefreshIcon />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete && onDelete(session.code);
                }}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title={t("deleteSession")}
              >
                <TrashIcon />
              </button>
              <Link
                href={`/admin/monitor?code=${session.code}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm shadow-blue-200 dark:shadow-blue-900/30 transition-all active:scale-95"
              >
                <span>{t("trackButton")}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const RefreshIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-5 h-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
    />
  </svg>
);
const TrashIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-5 h-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
    />
  </svg>
);
