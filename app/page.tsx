"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { SessionSummary } from "@/types";

// Modüllerimiz
import { sortSessions } from "@/utils/sessionUtils";
import GlobalLoading from "@/components/common/GlobalLoading";
import HomeAyahSection from "@/components/home/HomeAyahSection";
import SessionCard from "@/components/home/SessionCard";
import {
  DashboardColumn,
  EmptyState,
  DashboardSkeleton,
  Step,
} from "@/components/home/HomeWidgets";

function HomeContent() {
  const { t, language } = useLanguage();
  const { user, token } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [code, setCode] = useState("");
  const [mySessions, setMySessions] = useState<SessionSummary[]>([]);
  const [createdSessions, setCreatedSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(false);
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
      setTimeout(
        () =>
          sessionsRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          }),
        300,
      );
    }
  }, [searchParams]);

  const handleJoin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!code.trim()) {
      alert(t("emptyCodeWarning"));
      return;
    }
    let sessionCode = code.trim();
    if (sessionCode.includes("/join/"))
      sessionCode = sessionCode.split("/join/")[1].split("?")[0];
    router.push(`/join/${sessionCode}`);
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
      if (res.ok)
        setCreatedSessions((prev) =>
          prev.filter((s) => s.code !== sessionCode),
        );
      else alert(t("errorOccurred") + " " + (await res.text()));
    } catch (error) {
      console.error(error);
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
      if (res.ok) alert(t("successReset"));
      else alert(t("errorOccurred") + " " + (await res.text()));
    } catch (error) {
      console.error(error);
    }
  };

  const handleLeaveSession = async (sessionCode: string) => {
    if (!confirm(t("confirmLeaveSession"))) return;
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
      } else alert(t("errorOccurred") + " " + (await res.text()));
    } catch (error) {
      console.error(error);
    }
  };

  const toggleTab = (tab: "managed" | "joined") => {
    if (activeTab === tab) setActiveTab(null);
    else {
      setActiveTab(tab);
      setTimeout(
        () =>
          sessionsRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          }),
        100,
      );
    }
  };

  return (
    <main
      className="min-h-screen bg-gray-50/50 dark:bg-gray-950 text-gray-800 dark:text-gray-100 font-sans transition-colors duration-300 relative overflow-hidden"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Arka Plan Efektleri */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-400/10 dark:bg-blue-600/10 rounded-[100%] blur-3xl opacity-50" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-24 lg:pt-24 lg:pb-16">
        <div className="text-center max-w-4xl mx-auto mb-12 md:mb-16">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-8">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-emerald-500 to-teal-500 animate-gradient">
              {t("landingHeroTitle")}
            </span>
          </h1>

          <div className="relative mx-auto max-w-2xl mt-4 mb-12">
            <HomeAyahSection />
          </div>

          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-10 leading-relaxed max-w-2xl mx-auto">
            {user
              ? `${t("welcome")}, ${user}. ${t("dashboardIntro")}`
              : t("landingHeroSubtitle")}
          </p>

          <div className="flex flex-col gap-8 w-full max-w-4xl mx-auto mb-16">
            {/* Yeni Oturum Katıl / Oluştur Alanı */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-100 to-emerald-100 dark:from-blue-900/30 dark:to-emerald-900/30 rounded-[2rem] blur opacity-50 group-hover:opacity-100 transition duration-1000"></div>
              <div className="relative bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 p-6 md:p-8 rounded-[1.8rem] shadow-xl">
                <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
                  {user ? (
                    <Link
                      href="/admin"
                      className="w-full md:w-auto px-8 py-4 bg-white/40 dark:bg-blue-600/10 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white rounded-2xl font-bold border-2 border-blue-600/20 transition-all flex items-center justify-center gap-3"
                    >
                      {t("createNewSession")}
                    </Link>
                  ) : (
                    <Link
                      href="/login"
                      className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl font-bold transition-all transform hover:-translate-y-1 active:scale-95"
                    >
                      {t("getStarted")}
                    </Link>
                  )}
                  <form
                    onSubmit={handleJoin}
                    className="flex items-center w-full md:w-auto bg-gray-50/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-2xl p-1.5 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all"
                  >
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder={t("pasteCodeOrLink")}
                      className="bg-transparent border-none focus:ring-0 w-full pl-3 text-sm md:text-base"
                    />
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-emerald-500 hover:text-white rounded-xl font-bold transition-all"
                    >
                      {t("join")}
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {user && (
              <div className="relative group mt-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center justify-center gap-4 mb-6 text-gray-400">
                  <div className="h-px w-12 bg-gray-200 dark:bg-gray-800"></div>
                  <span className="text-xs font-black uppercase tracking-[0.2em]">
                    {t("myCirclesTitle")}
                  </span>
                  <div className="h-px w-12 bg-gray-200 dark:bg-gray-800"></div>
                </div>

                {/* BELİRGİN KUTULU BUTON ALANI (Daha dolgun ve görünür hal) */}
                <div className="bg-gray-100/50 dark:bg-black/40 p-2 md:p-3 rounded-[1.8rem] md:rounded-[2.4rem] border border-gray-200 dark:border-gray-800 shadow-inner flex flex-row gap-2 relative max-w-2xl mx-auto backdrop-blur-sm">
                  {/* Dağıttığım Halkalar (Mavi Tema) */}
                  <button
                    onClick={() => toggleTab("managed")}
                    className={`flex-1 group/btn relative px-2 py-3 md:py-4 rounded-[1.4rem] md:rounded-[1.8rem] transition-all duration-500 overflow-hidden border-2 shadow-sm ${
                      activeTab === "managed"
                        ? "bg-white dark:bg-gray-800 border-blue-500 shadow-xl shadow-blue-500/20 text-blue-700 dark:text-blue-400 scale-[1.02] z-10"
                        : "bg-white/60 dark:bg-gray-900/60 border-gray-100 dark:border-gray-800 text-gray-500 hover:border-blue-200 dark:hover:border-blue-900/50 hover:bg-white dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400"
                    }`}
                  >
                    <div className="relative z-10 flex flex-col items-center justify-center gap-1 md:gap-2">
                      <div
                        className={`p-2 md:p-3 rounded-xl md:rounded-2xl transition-all duration-300 ${
                          activeTab === "managed"
                            ? "bg-blue-600 text-white rotate-6 shadow-lg shadow-blue-500/40"
                            : "bg-blue-50 dark:bg-blue-900/20 text-blue-500 group-hover/btn:bg-blue-100 dark:group-hover/btn:bg-blue-900/40 group-hover/btn:scale-110"
                        }`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 md:h-8 md:w-8"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                          />
                        </svg>
                      </div>
                      <div className="text-center min-w-0">
                        <span
                          className={`block font-black text-sm md:text-xl tracking-tight transition-colors ${activeTab === "managed" ? "text-blue-700 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"}`}
                        >
                          {t("managedSessions")}
                        </span>
                        <span
                          className={`text-[10px] md:text-sm font-bold uppercase tracking-widest mt-0.5 transition-opacity ${activeTab === "managed" ? "opacity-100 text-blue-500/70" : "opacity-50"}`}
                        >
                          {createdSessions.length} {t("circle")}
                        </span>
                      </div>
                    </div>
                  </button>

                  {/* Katıldığım Halkalar (Yeşil Tema) */}
                  <button
                    onClick={() => toggleTab("joined")}
                    className={`flex-1 group/btn relative px-2 py-3 md:py-4 rounded-[1.4rem] md:rounded-[1.8rem] transition-all duration-500 overflow-hidden border-2 shadow-sm ${
                      activeTab === "joined"
                        ? "bg-white dark:bg-gray-800 border-emerald-500 shadow-xl shadow-emerald-500/20 text-emerald-700 dark:text-emerald-400 scale-[1.02] z-10"
                        : "bg-white/60 dark:bg-gray-900/60 border-gray-100 dark:border-gray-800 text-gray-500 hover:border-emerald-200 dark:hover:border-emerald-900/50 hover:bg-white dark:hover:bg-gray-800 hover:text-emerald-600 dark:hover:text-emerald-400"
                    }`}
                  >
                    <div className="relative z-10 flex flex-col items-center justify-center gap-1 md:gap-2">
                      <div
                        className={`p-2 md:p-3 rounded-xl md:rounded-2xl transition-all duration-300 ${
                          activeTab === "joined"
                            ? "bg-emerald-600 text-white -rotate-6 shadow-lg shadow-emerald-500/40"
                            : "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 group-hover/btn:bg-emerald-100 dark:group-hover/btn:bg-emerald-900/40 group-hover/btn:scale-110"
                        }`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 md:h-8 md:w-8"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                          />
                        </svg>
                      </div>
                      <div className="text-center min-w-0">
                        <span
                          className={`block font-black text-sm md:text-xl tracking-tight transition-colors ${activeTab === "joined" ? "text-emerald-700 dark:text-emerald-400" : "text-gray-700 dark:text-gray-300"}`}
                        >
                          {t("joinedSessions")}
                        </span>
                        <span
                          className={`text-[10px] md:text-sm font-bold uppercase tracking-widest mt-0.5 transition-opacity ${activeTab === "joined" ? "opacity-100 text-emerald-500/70" : "opacity-50"}`}
                        >
                          {mySessions.length} {t("circle")}
                        </span>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sekme İçerikleri */}
        {user && activeTab && (
          <div
            ref={sessionsRef}
            className="mb-24 max-w-4xl mx-auto scroll-mt-28"
          >
            {activeTab === "managed" && (
              <DashboardColumn
                title={t("managedSessions")}
                icon={<span />}
                iconColor="bg-blue-100 text-blue-600"
              >
                {loading ? (
                  <DashboardSkeleton />
                ) : createdSessions.length > 0 ? (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto">
                    {sortSessions(createdSessions).map((session) => (
                      <SessionCard
                        key={session.id}
                        session={session}
                        router={router}
                        isRTL={isRTL}
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
            )}

            {activeTab === "joined" && (
              <DashboardColumn
                title={t("joinedSessions")}
                icon={<span />}
                iconColor="bg-emerald-100 text-emerald-600"
              >
                {loading ? (
                  <DashboardSkeleton />
                ) : mySessions.length > 0 ? (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto">
                    {sortSessions(mySessions).map((session) => (
                      <SessionCard
                        key={session.id}
                        session={session}
                        router={router}
                        isRTL={isRTL}
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
            )}
          </div>
        )}

        {/* Nasıl Çalışır Bölümü */}
        <div className="max-w-3xl mx-auto bg-white/40 dark:bg-gray-900/40 backdrop-blur-md rounded-[1.5rem] p-6 shadow-sm border border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold text-center mb-6 text-gray-800 dark:text-gray-100">
            {t("howItWorksTitle")}
          </h2>
          <div className="grid grid-cols-3 gap-4 relative">
            <Step num="1" title={t("step1Title")} desc={t("step1Desc")} />
            <Step num="2" title={t("step2Title")} desc={t("step2Desc")} />
            <Step num="3" title={t("step3Title")} desc={t("step3Desc")} />
          </div>
        </div>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<GlobalLoading />}>
      <HomeContent />
    </Suspense>
  );
}
