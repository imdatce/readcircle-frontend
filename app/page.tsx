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

      {/* ÜST BÖLÜM: Hero, Ayet, Butonlar ve Katılım */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-12 lg:pt-16 lg:pb-12">
        <div className="text-center max-w-4xl mx-auto mb-8 md:mb-12">
          {/* Başlık (Boşlukları kısıldı) */}
          <h1 className="text-3xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1] md:leading-[1.15]">
            <span className="block text-gray-800 dark:text-white drop-shadow-sm">
              {t("landingHeroTitlePart1") || "İslami Kaynak"}
            </span>
            <span className="block mt-1 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-emerald-500 to-teal-500 animate-gradient pb-2">
              {t("landingHeroTitlePart2") || "Okuma ve Paylaşma"}
            </span>
            {/* Hatalı text-1xl yerine geçerli ve çok daha küçük olan text-sm / text-base kullanıldı */}
            <span className="block text-sm md:text-base lg:text-lg text-gray-400 dark:text-gray-500 font-bold mt-1 tracking-[0.3em] uppercase">
              {t("landingHeroTitlePart3") || "Platformu"}
            </span>
          </h1>

          {/* Ayet Kartı */}
          <div className="relative mx-auto max-w-2xl mt-4 mb-8">
            <HomeAyahSection />
          </div>

          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed max-w-2xl mx-auto">
            {user
              ? `${t("welcome")}, ${user}. ${t("dashboardIntro")}`
              : t("landingHeroSubtitle")}
          </p>

          <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto mb-10">
            {/* Oturum Katıl / Oluştur Alanı */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-100 to-emerald-100 dark:from-blue-900/30 dark:to-emerald-900/30 rounded-[2rem] blur opacity-50 group-hover:opacity-100 transition duration-1000"></div>
              <div className="relative bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 p-5 md:p-6 rounded-[1.8rem] shadow-xl">
                <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                  {user ? (
                    <Link
                      href="/admin"
                      className="w-full md:w-auto px-6 py-3 bg-white/40 dark:bg-blue-600/10 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white rounded-2xl font-bold border-2 border-blue-600/20 transition-all flex items-center justify-center gap-2"
                    >
                      {t("createNewSession")}
                    </Link>
                  ) : (
                    <Link
                      href="/login"
                      className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl font-bold transition-all transform hover:-translate-y-1 active:scale-95"
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

            {/* Katıldığım / Yönettiğim Halkalar */}
            {user && (
              <div className="relative group mt-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center justify-center gap-4 mb-4 text-gray-400">
                  <div className="h-px w-12 bg-gray-200 dark:bg-gray-800"></div>
                  <span className="text-xs font-black uppercase tracking-[0.2em]">
                    {t("myCirclesTitle")}
                  </span>
                  <div className="h-px w-12 bg-gray-200 dark:bg-gray-800"></div>
                </div>

                <div className="bg-gray-100/50 dark:bg-black/40 p-2 rounded-[1.8rem] md:rounded-[2.4rem] border border-gray-200 dark:border-gray-800 shadow-inner flex flex-row gap-2 relative max-w-2xl mx-auto backdrop-blur-sm">
                  {/* Dağıttığım Halkalar */}
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
                        className={`p-2 rounded-xl md:rounded-2xl transition-all duration-300 ${
                          activeTab === "managed"
                            ? "bg-blue-600 text-white rotate-6 shadow-lg shadow-blue-500/40"
                            : "bg-blue-50 dark:bg-blue-900/20 text-blue-500 group-hover/btn:bg-blue-100 dark:group-hover/btn:bg-blue-900/40 group-hover/btn:scale-110"
                        }`}
                      >
                        <svg
                          className="h-6 w-6 md:h-7 md:w-7"
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
                          className={`block font-black text-sm md:text-lg tracking-tight transition-colors ${activeTab === "managed" ? "text-blue-700 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"}`}
                        >
                          {t("managedSessions")}
                        </span>
                        <span
                          className={`text-[10px] md:text-xs font-bold uppercase tracking-widest mt-0.5 transition-opacity ${activeTab === "managed" ? "opacity-100 text-blue-500/70" : "opacity-50"}`}
                        >
                          {createdSessions.length} {t("circle")}
                        </span>
                      </div>
                    </div>
                  </button>

                  {/* Katıldığım Halkalar */}
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
                        className={`p-2 rounded-xl md:rounded-2xl transition-all duration-300 ${
                          activeTab === "joined"
                            ? "bg-emerald-600 text-white -rotate-6 shadow-lg shadow-emerald-500/40"
                            : "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 group-hover/btn:bg-emerald-100 dark:group-hover/btn:bg-emerald-900/40 group-hover/btn:scale-110"
                        }`}
                      >
                        <svg
                          className="h-6 w-6 md:h-7 md:w-7"
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
                          className={`block font-black text-sm md:text-lg tracking-tight transition-colors ${activeTab === "joined" ? "text-emerald-700 dark:text-emerald-400" : "text-gray-700 dark:text-gray-300"}`}
                        >
                          {t("joinedSessions")}
                        </span>
                        <span
                          className={`text-[10px] md:text-xs font-bold uppercase tracking-widest mt-0.5 transition-opacity ${activeTab === "joined" ? "opacity-100 text-emerald-500/70" : "opacity-50"}`}
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
            className="mb-12 max-w-4xl mx-auto scroll-mt-24"
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
                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
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
                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
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

       {/* Nasıl Çalışır Bölümü (Boşluklar Daha da Daraltıldı) */}
 {/* Nasıl Çalışır Bölümü (Boşluklar İyice Daraltıldı) */}
        {/* mb-3 olan alt boşluk mb-1'e çekildi */}
        <div className="max-w-3xl mx-auto bg-white/40 dark:bg-gray-900/40 backdrop-blur-md rounded-[1.5rem] p-5 shadow-sm border border-gray-200 dark:border-gray-800 mb-1">
          <h2 className="text-lg md:text-xl font-bold text-center mb-5 text-gray-800 dark:text-gray-100">
            {t("howItWorksTitle")}
          </h2>
          <div className="grid grid-cols-3 gap-3 relative">
            <Step num="1" title={t("step1Title")} desc={t("step1Desc")} />
            <Step num="2" title={t("step2Title")} desc={t("step2Desc")} />
            <Step num="3" title={t("step3Title")} desc={t("step3Desc")} />
          </div>
        </div>
      </div>
      {/* max-w-7xl Kapandı, böylece alttaki bölüm sayfayı tam kaplar */}

      {/* --- PLATFORMDA NELER YAPABİLİRSİNİZ BÖLÜMÜ --- */}
      {/* pt-4 md:pt-6 olan üst dolgular pt-2 md:pt-3'e düşürüldü */}
      <section className="pt-2 pb-12 md:pt-3 md:pb-16 bg-white dark:bg-[#061612] transition-colors duration-500 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-1/2 bg-teal-500/5 dark:bg-teal-500/10 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-10 md:mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-4xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
              {t("featuresTitle") || "Platformda Neler Yapabilirsiniz?"}
            </h2>
            <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 leading-relaxed">
              {t("featuresSubtitle") ||
                "İslami okumalarınızı düzenleyin, manevi ajandanızı oluşturun ve sevdiklerinizle ortak hatim halkalarında buluşun."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {/* KART 1: Zengin Kütüphane */}
            <div className="bg-gray-50/50 dark:bg-gray-900/50 rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-6 border border-gray-100 dark:border-gray-800 hover:bg-white dark:hover:bg-gray-900 hover:shadow-xl hover:shadow-amber-500/5 dark:hover:shadow-amber-900/20 hover:-translate-y-1.5 transition-all duration-300 group">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center mb-4 shadow-md shadow-amber-500/30 group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-6 h-6 md:w-7 md:h-7 text-white"
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
              <h3 className="text-base md:text-lg font-black text-gray-900 dark:text-white mb-2 tracking-wide">
                {t("featureLibraryTitle") || "Zengin Kütüphane"}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm leading-relaxed font-medium">
                {t("featureLibraryDesc") ||
                  "Kur'an-ı Kerim, Risale-i Nur, Cevşen ve Dualara tek tıkla ulaşın. Akıllı hafıza ile her zaman tam kaldığınız satırdan okumaya devam edin."}
              </p>
            </div>

            {/* KART 2: Manevi Ajanda */}
            <div className="bg-gray-50/50 dark:bg-gray-900/50 rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-6 border border-gray-100 dark:border-gray-800 hover:bg-white dark:hover:bg-gray-900 hover:shadow-xl hover:shadow-teal-500/5 dark:hover:shadow-teal-900/20 hover:-translate-y-1.5 transition-all duration-300 group">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl flex items-center justify-center mb-4 shadow-md shadow-teal-500/30 group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-6 h-6 md:w-7 md:h-7 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-base md:text-lg font-black text-gray-900 dark:text-white mb-2 tracking-wide">
                {t("featureAgendaTitle") || "Manevi Ajanda"}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm leading-relaxed font-medium">
                {t("featureAgendaDesc") ||
                  "Günlük namaz ve ibadet çetelenizi tutun. Geçmiş kaza namazı borçlarınızı hesaplayıp veritabanı güvencesiyle eritmeye başlayın."}
              </p>
            </div>

            {/* KART 3: Okuma Halkaları */}
            <div className="bg-gray-50/50 dark:bg-gray-900/50 rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-6 border border-gray-100 dark:border-gray-800 hover:bg-white dark:hover:bg-gray-900 hover:shadow-xl hover:shadow-blue-500/5 dark:hover:shadow-blue-900/20 hover:-translate-y-1.5 transition-all duration-300 group">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-md shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-6 h-6 md:w-7 md:h-7 text-white"
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
              <h3 className="text-base md:text-lg font-black text-gray-900 dark:text-white mb-2 tracking-wide">
                {t("featureCirclesTitle") || "Okuma Halkaları"}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm leading-relaxed font-medium">
                {t("featureCirclesDesc") ||
                  "Arkadaşlarınızla dijital hatim grupları kurun. Cüzleri, Cevşen bablarını veya Risale bölümlerini kolayca paylaşıp takibini yapın."}
              </p>
            </div>

            {/* KART 4: Kişiselleştirme */}
            <div className="bg-gray-50/50 dark:bg-gray-900/50 rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-6 border border-gray-100 dark:border-gray-800 hover:bg-white dark:hover:bg-gray-900 hover:shadow-xl hover:shadow-purple-500/5 dark:hover:shadow-purple-900/20 hover:-translate-y-1.5 transition-all duration-300 group">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-md shadow-purple-500/30 group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-6 h-6 md:w-7 md:h-7 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                  />
                </svg>
              </div>
              <h3 className="text-base md:text-lg font-black text-gray-900 dark:text-white mb-2 tracking-wide">
                {t("featureCustomTitle") || "Tam Kişiselleştirme"}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm leading-relaxed font-medium">
                {t("featureCustomDesc") ||
                  "Göz yormayan karanlık mod, çoklu dil desteği, font boyutu ayarları ve Arapça/Türkçe/Meal sekmeleriyle okuma deneyiminizi özelleştirin."}
              </p>
            </div>
          </div>
        </div>
      </section>
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
