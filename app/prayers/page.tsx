/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";

interface PrayerStatus {
  enabled: boolean;
  startDate: string | null;
}

interface PrayerLog {
  id: number;
  date: string;
  fajr: boolean;
  duha: boolean;
  dhuhr: boolean;
  asr: boolean;
  maghrib: boolean;
  awwabin: boolean;
  isha: boolean;
  witr: boolean;
  tahajjud: boolean;
}

const FARZ_PRAYERS = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
const OTHER_PRAYERS = ["tahajjud", "duha", "awwabin", "witr"];

export default function PrayersPage() {
  const { user, token } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<PrayerStatus | null>(null);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [logs, setLogs] = useState<PrayerLog[]>([]);
  const [updatingStr, setUpdatingStr] = useState<string | null>(null);

  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<
    "farz" | "diger" | null
  >(null);

  const fetchMonthlyLogs = useCallback(
    async (year: number, month: number) => {
      if (!token) return;
      try {
        setLoading(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/prayers/monthly?year=${year}&month=${month}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (res.ok) {
          const data = await res.json();
          setLogs(data);
        }
      } catch (e) {
        console.error("Çetele çekilemedi:", e);
      } finally {
        setLoading(false);
      }
    },
    [token],
  );

  useEffect(() => {
    if (!token) return;
    const fetchStatus = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/prayers/status`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (res.ok) {
          const data = await res.json();
          setStatus(data);
          if (data.enabled) {
            fetchMonthlyLogs(currentYear, currentMonth);
          } else {
            setLoading(false);
          }
        }
      } catch (e) {
        setLoading(false);
      }
    };
    fetchStatus();
  }, [token, currentYear, currentMonth, fetchMonthlyLogs]);

  useEffect(() => {
    if (!user) router.push("/");
  }, [user, router]);

  if (!user) return null;

  const handleEnableTracking = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/prayers/enable`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.ok) {
        setStatus({ enabled: true, startDate: new Date().toISOString() });
        fetchMonthlyLogs(currentYear, currentMonth);
      }
    } catch (e) {
      alert(t("errorOccurred") || "Bir hata oluştu");
      setLoading(false);
    }
  };

  const togglePrayer = async (
    dateStr: string,
    prayerKey: string,
    currentValue: boolean,
  ) => {
    const updatingKey = `${dateStr}-${prayerKey}`;
    setUpdatingStr(updatingKey);
    const newStatus = !currentValue;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/prayers/update`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            date: dateStr,
            prayer: prayerKey,
            status: newStatus,
          }),
        },
      );

      if (res.ok) {
        fetchMonthlyLogs(currentYear, currentMonth);
      } else {
        alert(t("updateFailed") || "Güncellenemedi!");
      }
    } catch (e) {
      alert(t("connectionError") || "Bağlantı hatası!");
    } finally {
      setUpdatingStr(null);
    }
  };

  const toggleExpand = (day: number, category: "farz" | "diger") => {
    if (expandedDay === day && expandedCategory === category) {
      setExpandedDay(null);
      setExpandedCategory(null);
    } else {
      setExpandedDay(day);
      setExpandedCategory(category);
    }
  };

  const getDaysInMonth = (year: number, month: number) =>
    new Date(year, month, 0).getDate();
  const getMonthNames = () => [
    t("january"),
    t("february"),
    t("march"),
    t("april"),
    t("may"),
    t("june"),
    t("july"),
    t("august"),
    t("september"),
    t("october"),
    t("november"),
    t("december"),
  ];

  const getLocalYYYYMMDD = (d: Date) => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const daysCount = getDaysInMonth(currentYear, currentMonth);
  const allDaysArray = Array.from({ length: daysCount }, (_, i) => i + 1);

  const startDateStr = status?.startDate
    ? getLocalYYYYMMDD(new Date(status.startDate))
    : null;

  const daysArray = allDaysArray.filter((day) => {
    const dateStr = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    if (startDateStr) {
      return dateStr >= startDateStr;
    }
    return true;
  });

  const getLogForDay = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const log = logs.find((l) => l.date === dateStr);

    let farzCompleted = 0;
    let otherCompleted = 0;

    if (log) {
      FARZ_PRAYERS.forEach((key) => {
        if ((log as any)[key]) farzCompleted++;
      });
      OTHER_PRAYERS.forEach((key) => {
        if ((log as any)[key]) otherCompleted++;
      });
    }

    return { dateStr, log, farzCompleted, otherCompleted };
  };

  // AYLIK TOPLAM HESAPLAMA
  let monthlyFarzTotal = 0;
  let monthlyOtherTotal = 0;
  logs.forEach((log) => {
    FARZ_PRAYERS.forEach((key) => {
      if ((log as any)[key]) monthlyFarzTotal++;
    });
    OTHER_PRAYERS.forEach((key) => {
      if ((log as any)[key]) monthlyOtherTotal++;
    });
  });

  if (loading && !status) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 text-teal-600">
        <div className="w-12 h-12 border-4 border-current border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (status && !status.enabled) {
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
              onClick={handleEnableTracking}
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

  return (
    <div className="min-h-screen bg-[#FDFDFD] dark:bg-gray-950 py-6 md:py-12 px-2 sm:px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 bg-white dark:bg-gray-900 p-4 md:p-8 rounded-3xl md:rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3 md:gap-5 w-full md:w-auto">
            <Link
              href="/profile"
              className="p-2.5 md:p-3 bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-teal-600 rounded-xl md:rounded-2xl transition-all shadow-inner shrink-0"
            >
              <svg
                className="w-5 h-5 md:w-6 md:h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </Link>
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 dark:text-white leading-tight truncate">
                {t("myPrayerLog")}
              </h1>
              <p className="text-[10px] md:text-sm font-bold text-teal-600/70 tracking-wide uppercase mt-0.5">
                {t("startDate") || "BAŞLANGIÇ"}:{" "}
                {status?.startDate
                  ? new Date(status.startDate).toLocaleDateString()
                  : "-"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3 bg-gray-50 dark:bg-gray-800 p-1.5 md:p-2 rounded-xl md:rounded-2xl border border-gray-100 dark:border-gray-700 w-full md:w-auto justify-center">
            <select
              value={currentMonth}
              onChange={(e) => setCurrentMonth(Number(e.target.value))}
              title={t("selectMonth")}
              className="bg-transparent text-sm md:text-base font-bold text-gray-700 dark:text-gray-200 py-1.5 px-2 md:px-4 outline-none cursor-pointer text-center"
            >
              {getMonthNames().map((m, i) => (
                <option key={i} value={i + 1} className="dark:bg-gray-800">
                  {m}
                </option>
              ))}
            </select>
            <div className="w-px h-5 md:h-6 bg-gray-300 dark:bg-gray-600"></div>
            <select
              value={currentYear}
              onChange={(e) => setCurrentYear(Number(e.target.value))}
              title={t("selectYear")}
              className="bg-transparent text-sm md:text-base font-bold text-gray-700 dark:text-gray-200 py-1.5 px-2 md:px-4 outline-none cursor-pointer text-center"
            >
              {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
                <option key={y} value={y} className="dark:bg-gray-800">
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-3xl md:rounded-[2.5rem] shadow-xl shadow-gray-200/40 dark:shadow-none border border-gray-100 dark:border-gray-800 overflow-hidden transition-all">
          <div className="w-full">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-700">
                  <th className="py-4 px-4 font-black text-gray-400 text-[10px] md:text-xs tracking-widest uppercase w-16 text-center">
                    {t("day")}
                  </th>
                  <th className="py-4 px-2 font-black text-gray-400 text-[10px] md:text-xs tracking-widest uppercase text-center w-1/3">
                    {t("farzPrayers")}
                  </th>
                  <th className="py-4 px-2 font-black text-gray-400 text-[10px] md:text-xs tracking-widest uppercase text-center w-1/3">
                    {t("otherPrayers")}
                  </th>
                  <th className="py-4 px-4 font-black text-gray-400 text-[10px] md:text-xs tracking-widest uppercase text-center">
                    {t("summary")}
                  </th>
                </tr>
              </thead>
              <tbody
                className={`divide-y divide-gray-50 dark:divide-gray-800 ${loading ? "opacity-40 grayscale pointer-events-none" : ""}`}
              >
                {daysArray.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-16 px-4 text-center">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                        <svg
                          className="w-8 h-8"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                      </div>
                      <p className="text-gray-500 font-medium">
                        {t("noRecordsForMonth")}
                      </p>
                    </td>
                  </tr>
                ) : (
                  daysArray.map((day) => {
                    const { dateStr, log, farzCompleted, otherCompleted } =
                      getLogForDay(day);
                    const isToday =
                      new Date().toISOString().split("T")[0] === dateStr;

                    const isFarzExpanded =
                      expandedDay === day && expandedCategory === "farz";
                    const isOtherExpanded =
                      expandedDay === day && expandedCategory === "diger";

                    return (
                      <React.Fragment key={day}>
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
                              className={`w-full py-2.5 md:py-3 px-1 md:px-4 rounded-xl md:rounded-2xl border-2 transition-all font-bold text-[11px] md:text-sm flex items-center justify-center gap-1 md:gap-2 active:scale-95
                                ${isFarzExpanded ? "bg-teal-50 border-teal-500 text-teal-700 dark:bg-teal-900/30 dark:border-teal-400 dark:text-teal-300" : "bg-white border-gray-100 text-gray-600 hover:border-teal-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:border-teal-800"}
                              `}
                            >
                              <span className="hidden sm:inline">
                                {t("farzPrayers")}:
                              </span>
                              <span
                                className={
                                  farzCompleted === 5
                                    ? "text-teal-600 dark:text-teal-400"
                                    : ""
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
                              className={`w-full py-2.5 md:py-3 px-1 md:px-4 rounded-xl md:rounded-2xl border-2 transition-all font-bold text-[11px] md:text-sm flex items-center justify-center gap-1 md:gap-2 active:scale-95
                                ${isOtherExpanded ? "bg-purple-50 border-purple-500 text-purple-700 dark:bg-purple-900/30 dark:border-purple-400 dark:text-purple-300" : "bg-white border-gray-100 text-gray-600 hover:border-purple-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:border-purple-800"}
                              `}
                            >
                              <span className="hidden sm:inline">
                                {t("otherPrayers")}:
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
                                {farzCompleted} {t("farzCompletedText")}
                              </span>
                              <span className="text-[10px] md:text-xs font-black text-purple-700 dark:text-purple-300 bg-purple-100/50 dark:bg-purple-900/30 px-1.5 md:px-2 py-0.5 rounded w-full max-w-[85px] truncate border border-purple-200/50 dark:border-purple-800/50">
                                {otherCompleted} {t("otherCompletedText")}
                              </span>
                            </div>
                          </td>
                        </tr>

                        {(isFarzExpanded || isOtherExpanded) && (
                          <tr className="bg-gray-50/50 dark:bg-gray-800/30 border-b-2 border-gray-100 dark:border-gray-800">
                            <td colSpan={4} className="p-3 md:p-6">
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 md:gap-3 max-w-3xl mx-auto animate-in slide-in-from-top-2 fade-in duration-200">
                                {(isFarzExpanded
                                  ? FARZ_PRAYERS
                                  : OTHER_PRAYERS
                                ).map((key) => {
                                  const isChecked = log
                                    ? (log as any)[key]
                                    : false;
                                  const isUpdating =
                                    updatingStr === `${dateStr}-${key}`;
                                  const activeColor = isFarzExpanded
                                    ? "bg-teal-500 hover:bg-teal-600 shadow-teal-500/30"
                                    : "bg-purple-500 hover:bg-purple-600 shadow-purple-500/30";

                                  return (
                                    <button
                                      key={key}
                                      disabled={isUpdating}
                                      onClick={() =>
                                        togglePrayer(dateStr, key, isChecked)
                                      }
                                      className={`relative flex flex-col items-center justify-center p-3 md:p-4 rounded-xl md:rounded-2xl border-2 transition-all duration-300 active:scale-95 group overflow-hidden
                                        ${isUpdating ? "opacity-60 cursor-wait" : ""}
                                        ${
                                          isChecked
                                            ? `${activeColor} border-transparent text-white shadow-lg`
                                            : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300"
                                        }
                                      `}
                                    >
                                      <span
                                        className={`text-xs md:text-base font-bold z-10 ${isChecked ? "text-white" : ""}`}
                                      >
                                        {t(key)}
                                      </span>
                                      <span
                                        className={`text-[9px] md:text-xs font-medium z-10 mt-1 ${isChecked ? "text-white/80" : "text-gray-400"}`}
                                      >
                                        {isChecked
                                          ? t("completed")
                                          : t("notCompleted")}
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
                  })
                )}
                {/* YENİ EKLENEN AYLIK TOPLAM SATIRI BURAYA GELECEK */}
                {daysArray.length > 0 && (
                  <tr className="bg-gray-100/60 dark:bg-gray-800/80 border-t-4 border-gray-200 dark:border-gray-700">
                    <td className="py-6 px-2 md:px-4 border-r border-gray-200 dark:border-gray-700 text-center font-black text-xs md:text-sm text-gray-700 dark:text-gray-300 uppercase tracking-widest sticky left-0 z-10 bg-gray-100/95 dark:bg-gray-800/95">
                      {t("monthlyTotal") || "TOPLAM"}
                    </td>
                    <td className="py-6 px-1 md:px-3 text-center">
                      <span className="text-teal-600 dark:text-teal-400 font-black text-xl md:text-3xl">
                        {monthlyFarzTotal}
                      </span>
                      <span className="text-gray-400 text-[10px] md:text-sm font-bold ml-1">
                        / {daysArray.length * 5}
                      </span>
                    </td>
                    <td className="py-6 px-1 md:px-3 text-center">
                      <span className="text-purple-600 dark:text-purple-400 font-black text-xl md:text-3xl">
                        {monthlyOtherTotal}
                      </span>
                      <span className="text-gray-400 text-[10px] md:text-sm font-bold ml-1">
                        / {daysArray.length * 4}
                      </span>
                    </td>
                    <td className="py-6 px-2 md:px-4 text-center">
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        <span className="text-[10px] md:text-xs font-black text-teal-700 dark:text-teal-300 bg-teal-200/50 dark:bg-teal-900/50 px-2 py-1 rounded w-full max-w-[90px] truncate border border-teal-300/50 dark:border-teal-700/50">
                          {monthlyFarzTotal} {t("farzCompletedText")}
                        </span>
                        <span className="text-[10px] md:text-xs font-black text-purple-700 dark:text-purple-300 bg-purple-200/50 dark:bg-purple-900/50 px-2 py-1 rounded w-full max-w-[90px] truncate border border-purple-300/50 dark:border-purple-700/50">
                          {monthlyOtherTotal} {t("otherCompletedText")}
                        </span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
