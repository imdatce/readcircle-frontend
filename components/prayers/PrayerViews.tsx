/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Link from "next/link";

export function PrayersLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 text-teal-600">
      <div className="w-12 h-12 border-4 border-current border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

export function PrayersOnboarding({
  t,
  onEnable,
}: {
  t: any;
  onEnable: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-gray-950 dark:to-teal-900/20 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-teal-100 dark:border-teal-900/30 max-w-lg text-center">
        <div className="w-20 h-20 bg-teal-100 dark:bg-teal-900/40 text-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3">
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
              d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-4 leading-tight">
          {t("startTrackingQuestion")}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          {t("startTrackingDesc")}
        </p>
        <div className="space-y-3">
          <button
            onClick={onEnable}
            className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-teal-500/20 transition-all active:scale-[0.98]"
          >
            {t("yesStart")}
          </button>
          <Link
            href="/"
            className="block w-full py-4 text-gray-400 hover:text-gray-600 font-medium transition-colors"
          >
            {t("noMaybeLater")}
          </Link>
        </div>
      </div>
    </div>
  );
}
