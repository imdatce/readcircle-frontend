/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React from "react";
import Link from "next/link";
import { SessionSummary } from "@/types";
import { sortSessions } from "@/utils/sessionUtils";

export function ManagedSessionsAccordion({
  isOpen,
  onToggle,
  sessions,
  t,
}: {
  isOpen: boolean;
  onToggle: () => void;
  sessions: SessionSummary[];
  t: any;
}) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-6 sm:p-8 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors outline-none"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl shadow-sm">
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z"
              />
            </svg>
          </div>
          <div className="text-left">
            <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
              {t("managedSessions") || "Yönettiğim Halkalar"}
            </h3>
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1.5">
              {sessions.length} {t("circle") || "Halka"}
            </p>
          </div>
        </div>
        <div
          className={`p-2 rounded-full transition-transform duration-300 ${isOpen ? "rotate-180 bg-gray-100 dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-800"}`}
        >
          <svg
            className="w-6 h-6 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="p-6 sm:p-8 pt-0 border-t border-gray-100 dark:border-gray-800 animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
            {sessions.length > 0 ? (
              sortSessions(sessions).map((session, i) => (
                <Link
                  key={i}
                  href={`/admin/monitor?code=${session.code}`}
                  className="bg-gray-50/50 dark:bg-gray-800/30 rounded-[1.5rem] p-5 border border-gray-200/60 dark:border-gray-700/50 shadow-sm hover:shadow hover:-translate-y-1 hover:border-emerald-200 dark:hover:border-emerald-800 transition-all duration-300 group flex flex-col min-h-[130px]"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 tracking-wide">
                      {session.code}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/30 transition-colors shadow-sm shrink-0">
                      <svg
                        className="w-4 h-4 text-emerald-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2.5"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-auto">
                    <div className="text-gray-700 dark:text-gray-300 font-bold line-clamp-2 leading-snug text-sm">
                      {session.description ||
                        t("unnamedCircle") ||
                        "İsimsiz Halka"}
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full py-8 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl bg-gray-50/50 dark:bg-gray-800/30">
                <p className="text-gray-500 font-medium">
                  {t("noManagedCircles") ||
                    "Henüz yönettiğiniz bir halka bulunmuyor."}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function JoinedSessionsAccordion({
  isOpen,
  onToggle,
  sessions,
  t,
}: {
  isOpen: boolean;
  onToggle: () => void;
  sessions: SessionSummary[];
  t: any;
}) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-6 sm:p-8 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors outline-none"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl shadow-sm">
            <svg
              className="w-6 h-6"
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
          <div className="text-left">
            <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
              {t("participatedCircles") || "Katıldığım Halkalar"}
            </h3>
            <p className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-1.5">
              {sessions.length} {t("circle") || "Halka"}
            </p>
          </div>
        </div>
        <div
          className={`p-2 rounded-full transition-transform duration-300 ${isOpen ? "rotate-180 bg-gray-100 dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-800"}`}
        >
          <svg
            className="w-6 h-6 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="p-6 sm:p-8 pt-0 border-t border-gray-100 dark:border-gray-800 animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
            {sessions.length > 0 ? (
              sortSessions(sessions).map((session, i) => (
                <Link
                  key={i}
                  href={`/join/${session.code}`}
                  className="bg-gray-50/50 dark:bg-gray-800/30 rounded-[1.5rem] p-5 border border-gray-200/60 dark:border-gray-700/50 shadow-sm hover:shadow hover:-translate-y-1 hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300 group flex flex-col min-h-[130px]"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="text-lg font-black text-blue-600 dark:text-blue-400 tracking-wide">
                      {session.code}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors shadow-sm shrink-0">
                      <svg
                        className="w-4 h-4 text-blue-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2.5"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-auto">
                    <div className="text-gray-700 dark:text-gray-300 font-bold line-clamp-2 leading-snug text-sm mb-2">
                      {session.description ||
                        t("unnamedCircle") ||
                        "İsimsiz Halka"}
                    </div>
                    {session.creatorName && (
                      <span className="inline-block px-2.5 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                        {session.creatorName}
                      </span>
                    )}
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full py-8 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl bg-gray-50/50 dark:bg-gray-800/30">
                <p className="text-gray-500 font-medium">
                  {t("noParticipatedCircles") ||
                    "Henüz hiçbir halkaya katılmadınız."}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
