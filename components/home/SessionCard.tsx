/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

const RefreshIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2.5}
    stroke="currentColor"
    className="w-4 h-4"
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
    strokeWidth={2.5}
    stroke="currentColor"
    className="w-4 h-4"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
    />
  </svg>
);

export default function SessionCard({
  session,
  router,
  isRTL,
  type,
  onDelete,
  onReset,
  onLeave,
  t,
}: any) {
  const { language } = useLanguage();
  const isManaged = type === "managed";

  return (
    <div
      onClick={() => router.push(`/join/${session.code}`)}
      className={`group relative bg-white dark:bg-gray-900/80 backdrop-blur-sm p-6 rounded-[2rem] border ${
        isManaged
          ? "border-emerald-100 dark:border-emerald-900/30 hover:border-emerald-300 dark:hover:border-emerald-700/50"
          : "border-blue-100 dark:border-blue-900/30 hover:border-blue-300 dark:hover:border-blue-700/50"
      } shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-full`}
    >
      {/* Dekoratif Arka Plan Parıltısı */}
      <div
        className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none ${isManaged ? "bg-emerald-500" : "bg-blue-500"}`}
      ></div>

      {/* Üst Kısım: İkon ve Bilgiler */}
      <div className="flex justify-between items-start gap-4 mb-4 relative z-10">
        <div
          className={`p-3.5 rounded-2xl shrink-0 ${
            isManaged
              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400"
              : "bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400"
          }`}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            {isManaged ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18c-2.305 0-4.408.867-6 2.292m0-14.25v14.25"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            )}
          </svg>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-black tracking-widest uppercase bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-inner">
            #{session.code}
          </span>
          {session?.createdAt && (
            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold tracking-wide uppercase">
              {new Date(session.createdAt).toLocaleDateString(
                language === "tr" ? "tr-TR" : "en-US",
                { day: "numeric", month: "short", year: "numeric" },
              )}
            </span>
          )}
        </div>
      </div>

      {/* Başlık */}
      <div className="flex-1 relative z-10">
        <h3
          className={`font-black text-xl text-gray-900 dark:text-white line-clamp-2 leading-tight transition-colors ${
            isRTL ? "text-right" : "text-left"
          }`}
        >
          {session.description || t("unnamedCircle") || "İsimsiz Halka"}
        </h3>
      </div>

      {/* Alt Kısım: Aksiyonlar ve Kurucu Bilgisi */}
      <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 relative z-10">
        {!isManaged ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50 flex items-center justify-center text-blue-700 dark:text-blue-300 text-sm font-black shadow-inner">
                {session.creatorName?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] text-gray-400 uppercase tracking-widest font-black">
                  {t("creatorLabel") || "Kurucu"}
                </span>
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 truncate max-w-[100px] sm:max-w-[140px]">
                  {session.creatorName}
                </span>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLeave && onLeave(session.code);
              }}
              className="p-2.5 bg-red-50 hover:bg-red-500 text-red-500 hover:text-white dark:bg-red-900/20 dark:hover:bg-red-600 dark:text-red-400 rounded-xl transition-all shadow-sm"
              title={t("leaveSession") || "Ayrıl"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Yönetilen Halkalar İçin İşlemler */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex bg-gray-50 dark:bg-gray-800/80 rounded-xl p-1 border border-gray-100 dark:border-gray-700/50 shadow-inner">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const link = `${window.location.origin}/join/${session.code}`;
                    navigator.clipboard.writeText(link);
                    alert(t("copied") || "Kopyalandı");
                  }}
                  className="px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider text-gray-500 hover:text-emerald-600 hover:bg-white dark:hover:bg-gray-700 transition-all"
                >
                  Link
                </button>
                <div className="w-px bg-gray-200 dark:bg-gray-700 mx-0.5 my-1"></div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(session.code);
                    alert(t("copied") || "Kopyalandı");
                  }}
                  className="px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider text-gray-500 hover:text-emerald-600 hover:bg-white dark:hover:bg-gray-700 transition-all"
                >
                  Kod
                </button>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onReset && onReset(session.code);
                  }}
                  className="p-2 text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-xl transition-all"
                  title={t("resetSession") || "Sıfırla"}
                >
                  <RefreshIcon />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete && onDelete(session.code);
                  }}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all"
                  title={t("deleteSession") || "Sil"}
                >
                  <TrashIcon />
                </button>
              </div>
            </div>

            <Link
              href={`/admin/monitor?code=${session.code}`}
              onClick={(e) => e.stopPropagation()}
              className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-black rounded-xl shadow-md shadow-emerald-600/20 transition-all active:scale-[0.98] mt-1"
            >
              {t("trackButton") || "Takip Et"}
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
