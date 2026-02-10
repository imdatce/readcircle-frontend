/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { SessionSummary } from "@/types";

export default function Home() {
  const { t, language } = useLanguage();
  const { user, token } = useAuth();
  const router = useRouter();

  // State tanımları
  const [code, setCode] = useState("");
  const [mySessions, setMySessions] = useState<SessionSummary[]>([]);
  const [createdSessions, setCreatedSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(false);

  // DEĞİŞİKLİK: copiedId artık string (örn: "123-link" veya "123-code")
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const isRTL = language === "ar";
  const sessionsRef = useRef<HTMLDivElement>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // Veri Çekme İşlemi
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
          console.error("Veri hatası", error);
        } finally {
          setLoading(false);
        }
      };
      fetchAllData();
    }
  }, [user, token, apiUrl]);

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
    setCopiedId(`${id}-link`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // YENİ: Sadece kodu kopyalar
  const handleCopyCode = (e: React.MouseEvent, code: string, id: number) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedId(`${id}-code`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteSession = async (sessionCode: string) => {
    if (
      !confirm(
        t("confirmDelete") ||
          "Bu oturumu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.",
      )
    )
      return;

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
        alert(t("errorOccurred") || "Hata oluştu: " + msg);
      }
    } catch (error) {
      console.error(error);
      alert(t("connectionError") || "Bağlantı hatası");
    }
  };

  const handleResetSession = async (sessionCode: string) => {
    if (
      !confirm(
        t("confirmReset") ||
          "Bu oturumu sıfırlamak istediğinize emin misiniz? Tüm alınan cüzler ve okumalar sıfırlanacak.",
      )
    )
      return;

    try {
      const res = await fetch(
        `${apiUrl}/api/distribution/reset-session/${sessionCode}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (res.ok) {
        alert(t("successReset") || "Oturum başarıyla sıfırlandı.");
      } else {
        const msg = await res.text();
        alert(t("errorOccurred") || "Hata oluştu: " + msg);
      }
    } catch (error) {
      console.error(error);
      alert(t("connectionError") || "Bağlantı hatası");
    }
  };

  const scrollToSessions = () => {
    sessionsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main
      className="min-h-screen bg-white dark:bg-gray-950 text-gray-800 dark:text-gray-100 font-sans selection:bg-blue-100 dark:selection:bg-blue-900 transition-colors duration-300 relative"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Arka Plan Efektleri */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] bg-gradient-to-br from-blue-100/50 to-green-100/50 dark:from-blue-900/20 dark:to-green-900/20 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute top-[30%] -left-[10%] w-[40%] h-[40%] bg-gradient-to-tr from-emerald-100/40 to-blue-50/40 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-full blur-3xl opacity-50"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-24 lg:pt-24 lg:pb-32">
        {/* HERO SECTION */}
        <div className="text-center max-w-4xl mx-auto mb-16 md:mb-20">
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-8 leading-[1.1]">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-600 dark:from-blue-400 dark:to-emerald-400">
              {t("landingHeroTitle") || "Manevi Birliktelik"}
            </span>{" "}
            {t("platform") || "Platformu"}
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 leading-relaxed max-w-2xl mx-auto">
            {user
              ? `${t("welcome")}, ${user}. ${t("dashboardIntro") || "Bugün manevi yolculuğunda ne yapmak istersin?"}`
              : t("landingHeroSubtitle") ||
                "Kuran hatimleri, Cevşen halkaları ve zikir programlarınızı kolayca organize edin."}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {user ? (
              <>
                <Link
                  href="/admin"
                  className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg flex items-center gap-2 transform hover:-translate-y-1"
                >
                  {t("createNewSession") || "Yeni Oluştur"}
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
                </Link>

                <button
                  onClick={scrollToSessions}
                  className="px-8 py-4 bg-emerald-600 text-white rounded-xl font-bold text-lg hover:bg-emerald-700 transition shadow-lg flex items-center gap-2 transform hover:-translate-y-1"
                >
                  {t("myCirclesTitle") || "Halkalarım"}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg hover:shadow-blue-200/50 dark:hover:shadow-blue-900/50 flex items-center gap-2 transform hover:-translate-y-1"
              >
                {t("getStarted") || "Hemen Başla"}
                <svg
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
            )}

            {/* Hızlı Katıl Formu */}
            <div className="relative group">
              <form
                onSubmit={handleJoin}
                className="flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-1 ps-4 shadow-sm group-focus-within:border-blue-400 dark:group-focus-within:border-blue-500 group-focus-within:ring-4 group-focus-within:ring-blue-100 dark:group-focus-within:ring-blue-900/50 transition"
              >
                <input
                  type="text"
                  placeholder={t("sessionCodePlaceholder") || "Halka Kodu"}
                  className={`outline-none bg-transparent text-gray-700 dark:text-gray-200 placeholder-gray-400 w-32 md:w-48 ${isRTL ? "text-right" : "text-left"}`}
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

          {!user && (
            <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
              {t("guestNote") ||
                "Kayıt olmadan misafir olarak da katılabilirsiniz."}
            </div>
          )}
        </div>

        {/* --- LİSTE BÖLÜMÜ --- */}
        {user && (
          <div ref={sessionsRef} className="mb-24 scroll-mt-24">
            <div className="grid md:grid-cols-2 gap-8">
              {/* YÖNETİLEN HALKALAR */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-3xl p-6 md:p-8 border border-gray-100 dark:border-gray-800">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-800 dark:text-white">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
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
                  </div>
                  {t("managedSessions") || "Yönettiğim Halkalar"}
                </h2>

                {loading ? (
                  <div className="space-y-3 animate-pulse">
                    <div className="h-16 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
                    <div className="h-16 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
                  </div>
                ) : createdSessions.length > 0 ? (
                  <div className="space-y-3">
                    {createdSessions.map((session) => (
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
                  <div className="text-center py-8 text-gray-500">
                    {t("noCreatedYet") || "Henüz bir dağıtım başlatmadın."}
                  </div>
                )}
              </div>

              {/* KATILINAN HALKALAR */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-3xl p-6 md:p-8 border border-gray-100 dark:border-gray-800">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-800 dark:text-white">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-lg">
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
                  </div>
                  {t("joinedSessions") || "Katıldığım Halkalar"}
                </h2>

                {loading ? (
                  <div className="space-y-3 animate-pulse">
                    <div className="h-16 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
                    <div className="h-16 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
                  </div>
                ) : mySessions.length > 0 ? (
                  <div className="space-y-3">
                    {mySessions.map((session) => (
                      <SessionCard
                        key={session.id}
                        session={session}
                        router={router}
                        isRTL={isRTL}
                        handleCopyLink={handleCopyLink}
                        handleCopyCode={handleCopyCode}
                        copiedId={copiedId}
                        type="joined"
                        t={t}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    {t("noCirclesYet") || "Henüz bir halkaya katılmadın."}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* FEATURES */}
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

        {/* HOW IT WORKS */}
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

// --- Alt Bileşenler ---

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

function SessionCard({
  session,
  router,
  isRTL,
  handleCopyLink,
  handleCopyCode,
  copiedId,
  type,
  onDelete,
  onReset,
  t,
}: any) {
  return (
    <div
      onClick={() => router.push(`/join/${session.code}`)}
      className="group bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all cursor-pointer flex justify-between items-center gap-4"
    >
      <div className={`min-w-0 ${isRTL ? "text-right" : "text-left"}`}>
        <h3 className="font-bold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
          {session.description}
        </h3>
        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
          <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded font-mono">
            Code:{" "}
          </span>
          <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded font-mono">
            #{session.code}
          </span>
          {type === "joined" && <span> Distributor: {session.creatorName}</span>}
        </div>
      </div>

      <div className="flex gap-2">
        {type === "managed" && (
          <>
            {/* KOPYALA LİNK BUTONU */}
            <button
              onClick={(e) => handleCopyLink(e, session.code, session.id)}
              title={
                t ? t("copyLink") || "Bağlantıyı Kopyala" : "Bağlantıyı Kopyala"
              }
              className={`p-2 rounded-lg transition ${copiedId === `${session.id}-link` ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"}`}
            >
              {copiedId === `${session.id}-link` ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
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
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
              )}
            </button>

            {/* KOPYALA KOD BUTONU (YENİ) */}
            <button
              onClick={(e) => handleCopyCode(e, session.code, session.id)}
              title={t ? t("copyCode") || "Kodu Kopyala" : "Kodu Kopyala"}
              className={`p-2 rounded-lg transition ${copiedId === `${session.id}-code` ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"}`}
            >
              {copiedId === `${session.id}-code` ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
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
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5l-3.9 19.5m-2.1-19.5l-3.9 19.5"
                  />
                </svg>
              )}
            </button>
            {/* SIFIRLAMA BUTONU */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onReset && onReset(session.code);
              }}
              title={
                t ? t("resetSession") || "Halkayı Sıfırla" : "Halkayı Sıfırla"
              }
              className="p-2 bg-yellow-50 text-yellow-600 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-lg transition"
            >
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
            </button>

            {/* SİLME BUTONU */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete && onDelete(session.code);
              }}
              title={t ? t("deleteSession") || "Halkayı Sil" : "Halkayı Sil"}
              className="p-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 rounded-lg transition"
            >
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
            </button>

            {/* MONITOR BUTONU */}
            <Link
              href={`/admin/monitor?code=${session.code}`}
              onClick={(e) => e.stopPropagation()}
              title={
                t
                  ? t("trackButton") || "Yönet ve Takip Et"
                  : "Yönet ve Takip Et"
              }
              className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg transition"
            >
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
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z"
                />
              </svg>
            </Link>
          </>
        )}

        {type === "joined" && (
          <div
            className="p-2 text-gray-400"
            title={t ? t("joinedAsParticipant") || "Katılımcı" : "Katılımcı"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 group-hover:text-blue-500 transition"
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
        )}
      </div>
    </div>
  );
}
