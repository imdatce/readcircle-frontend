/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React from "react";
import { FARZ_PRAYERS, OTHER_PRAYERS } from "@/constants/prayersConfig";

interface PrayerDayRowProps {
  day: number;
  dateStr: string;
  log: any;
  farzCompleted: number;
  otherCompleted: number;
  isToday: boolean;
  expandedDay: number | null;
  expandedCategory: "farz" | "diger" | null;
  updatingStr: string | null;
  toggleExpand: (day: number, category: "farz" | "diger") => void;
  togglePrayer: (
    dateStr: string,
    prayerKey: string,
    currentValue: boolean,
  ) => void;
  t: any;
}

export default function PrayerDayRow({
  day,
  dateStr,
  log,
  farzCompleted,
  otherCompleted,
  isToday,
  expandedDay,
  expandedCategory,
  updatingStr,
  toggleExpand,
  togglePrayer,
  t,
}: PrayerDayRowProps) {
  const isFarzExpanded = expandedDay === day && expandedCategory === "farz";
  const isOtherExpanded = expandedDay === day && expandedCategory === "diger";

  return (
    <React.Fragment>
      <tr
        className={`transition-colors ${isToday ? "bg-teal-50/40 dark:bg-teal-900/10" : "hover:bg-gray-50/50 dark:hover:bg-gray-800/50"}`}
      >
        <td
          className={`py-4 px-2 md:px-4 border-r border-gray-50 dark:border-gray-800 text-center font-black text-sm md:text-xl ${isToday ? "text-teal-600 dark:text-teal-400" : "text-gray-500 dark:text-gray-400"}`}
        >
          <div
            className={`w-8 h-8 md:w-12 md:h-12 mx-auto flex items-center justify-center rounded-xl ${isToday ? "bg-teal-100 dark:bg-teal-900/50" : ""}`}
          >
            {day}
          </div>
        </td>

        <td className="py-2 px-1 md:px-3 text-center">
          <button
            onClick={() => toggleExpand(day, "farz")}
            className={`w-full py-2.5 md:py-3 px-1 md:px-4 rounded-xl md:rounded-2xl border-2 transition-all font-bold text-[11px] md:text-sm flex items-center justify-center gap-1 md:gap-2 active:scale-95 ${isFarzExpanded ? "bg-teal-50 border-teal-500 text-teal-700 dark:bg-teal-900/30 dark:border-teal-400 dark:text-teal-300" : "bg-white border-gray-100 text-gray-600 hover:border-teal-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:border-teal-800"}`}
          >
            <span className="hidden sm:inline">
              {t("farzPrayers") || "Farzlar"}:
            </span>
            <span
              className={
                farzCompleted === 5 ? "text-teal-600 dark:text-teal-400" : ""
              }
            >
              {farzCompleted} / 5
            </span>
            <svg
              className={`hidden md:block w-4 h-4 transition-transform ${isFarzExpanded ? "rotate-180 text-teal-500" : "text-gray-400"}`}
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
          </button>
        </td>

        <td className="py-2 px-1 md:px-3 text-center">
          <button
            onClick={() => toggleExpand(day, "diger")}
            className={`w-full py-2.5 md:py-3 px-1 md:px-4 rounded-xl md:rounded-2xl border-2 transition-all font-bold text-[11px] md:text-sm flex items-center justify-center gap-1 md:gap-2 active:scale-95 ${isOtherExpanded ? "bg-purple-50 border-purple-500 text-purple-700 dark:bg-purple-900/30 dark:border-purple-400 dark:text-purple-300" : "bg-white border-gray-100 text-gray-600 hover:border-purple-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:border-purple-800"}`}
          >
            <span className="hidden sm:inline">
              {t("otherPrayers") || "Diğer"}:
            </span>
            <span
              className={
                otherCompleted === 4
                  ? "text-purple-600 dark:text-purple-400"
                  : ""
              }
            >
              {otherCompleted} / 4
            </span>
            <svg
              className={`hidden md:block w-4 h-4 transition-transform ${isOtherExpanded ? "rotate-180 text-purple-500" : "text-gray-400"}`}
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
          </button>
        </td>

        <td className="py-2 px-2 md:px-4 text-center">
          <div className="flex flex-col items-center justify-center gap-1">
            <span className="text-[10px] md:text-xs font-black text-teal-700 dark:text-teal-300 bg-teal-100/50 dark:bg-teal-900/30 px-1.5 md:px-2 py-0.5 rounded w-full max-w-[85px] truncate border border-teal-200/50 dark:border-teal-800/50">
              {farzCompleted} {t("farzCompletedText") || "Farz"}
            </span>
            <span className="text-[10px] md:text-xs font-black text-purple-700 dark:text-purple-300 bg-purple-100/50 dark:bg-purple-900/30 px-1.5 md:px-2 py-0.5 rounded w-full max-w-[85px] truncate border border-purple-200/50 dark:border-purple-800/50">
              {otherCompleted} {t("otherCompletedText") || "Diğer"}
            </span>
          </div>
        </td>
      </tr>

      {(isFarzExpanded || isOtherExpanded) && (
        <tr className="bg-gray-50/50 dark:bg-gray-800/30 border-b-2 border-gray-100 dark:border-gray-800">
          <td colSpan={4} className="p-3 md:p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 md:gap-3 max-w-3xl mx-auto animate-in slide-in-from-top-2 fade-in duration-200">
              {(isFarzExpanded ? FARZ_PRAYERS : OTHER_PRAYERS).map((key) => {
                const isChecked = log ? (log as any)[key] : false;
                const isUpdating = updatingStr === `${dateStr}-${key}`;
                const activeColor = isFarzExpanded
                  ? "bg-teal-500 hover:bg-teal-600 shadow-teal-500/30"
                  : "bg-purple-500 hover:bg-purple-600 shadow-purple-500/30";

                return (
                  <button
                    key={key}
                    disabled={isUpdating}
                    onClick={() => togglePrayer(dateStr, key, isChecked)}
                    className={`relative flex flex-col items-center justify-center p-3 md:p-4 rounded-xl md:rounded-2xl border-2 transition-all duration-300 active:scale-95 group overflow-hidden ${isUpdating ? "opacity-60 cursor-wait" : ""} ${isChecked ? `${activeColor} border-transparent text-white shadow-lg` : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300"}`}
                  >
                    <span
                      className={`text-xs md:text-base font-bold z-10 ${isChecked ? "text-white" : ""}`}
                    >
                      {t(key) || key}
                    </span>
                    <span
                      className={`text-[9px] md:text-xs font-medium z-10 mt-1 ${isChecked ? "text-white/80" : "text-gray-400"}`}
                    >
                      {isChecked
                        ? t("completed") || "Kılındı"
                        : t("notCompleted") || "Kılınmadı"}
                    </span>
                    {isChecked && (
                      <svg
                        className="absolute -right-2 -bottom-2 w-10 h-10 md:w-12 md:h-12 text-white opacity-20"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                    {isUpdating && (
                      <div className="absolute inset-0 bg-white/50 dark:bg-black/50 flex items-center justify-center z-20">
                        <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-gray-800 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </td>
        </tr>
      )}
    </React.Fragment>
  );
}
