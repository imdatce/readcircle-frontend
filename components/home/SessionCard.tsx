/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

const RefreshIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
  </svg>
);

export default function SessionCard({ session, router, isRTL, type, onDelete, onReset, onLeave, t }: any) {
  const { language } = useLanguage();
  return (
    <div onClick={() => router.push(`/join/${session.code}`)} className="group relative bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700/60 hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-lg dark:hover:shadow-blue-900/10 transition-all cursor-pointer overflow-hidden">
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-start gap-3">
          <div className="min-w-0 w-full md:w-auto">
            <h3 className={`font-bold text-lg text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors ${isRTL ? "text-right" : "text-left"}`}>
              {session.description}
            </h3>
          </div>
          <div className="flex items-center flex-wrap gap-2 md:mt-1 shrink-0">
            <span className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-700/50 px-2 py-0.5 rounded text-xs font-mono text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600">
              # {session.code}
            </span>
            {session?.createdAt && (
              <span className="inline-flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500 font-medium whitespace-nowrap">
                {new Date(session.createdAt).toLocaleDateString(language === "tr" ? "tr-TR" : "en-US", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            )}
          </div>
        </div>
        {type !== "managed" && (
          <div className="shrink-0 flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 px-3 py-1.5 rounded-lg text-xs border border-indigo-100 dark:border-indigo-800/50 shadow-sm">
            <span className="opacity-70 font-medium">{t("creatorLabel")}:</span>
            <span className="font-bold truncate max-w-[80px] sm:max-w-[120px]">{session.creatorName}</span>
            <button onClick={(e) => { e.stopPropagation(); onLeave && onLeave(session.code); }} className="p-1.5 bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400 rounded-lg transition-colors border border-red-100 dark:border-red-900/30" title={t("leaveSession")}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        )}
      </div>
      {type === "managed" && (
        <div className="flex flex-wrap items-center justify-end gap-2 mt-2 pt-3 border-t border-gray-50 dark:border-gray-700/50">
          <div className="flex items-center bg-gray-50 dark:bg-gray-900/50 rounded-lg p-0.5 border border-gray-100 dark:border-gray-700">
            <button onClick={(e) => { e.stopPropagation(); const link = `${window.location.origin}/join/${session.code}`; navigator.clipboard.writeText(link); alert(t("copied")); }} className="p-1.5 rounded-md transition-all text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-gray-700">
              {t("copyLink")}
            </button>
            <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-0.5"></div>
            <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(session.code); alert(t("copied")); }} className="p-1.5 rounded-md transition-all text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-gray-700">
              {t("copyCode")}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={(e) => { e.stopPropagation(); onReset && onReset(session.code); }} className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors" title={t("resetSession")}>
              <RefreshIcon />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onDelete && onDelete(session.code); }} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title={t("deleteSession")}>
              <TrashIcon />
            </button>
            <Link href={`/admin/monitor?code=${session.code}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all active:scale-95">
              <span>{t("trackButton")}</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}