/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";

// Yeni Modüller
import { FARZ_PRAYERS, OTHER_PRAYERS } from "@/constants/prayersConfig";
import {
  PrayersLoading,
  PrayersOnboarding,
} from "@/components/prayers/PrayerViews";
import PrayerDayRow from "@/components/prayers/PrayerDayRow";

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
        if (res.ok) setLogs(await res.json());
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
          if (data.enabled) fetchMonthlyLogs(currentYear, currentMonth);
          else setLoading(false);
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
        { method: "POST", headers: { Authorization: `Bearer ${token}` } },
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
            status: !currentValue,
          }),
        },
      );
      if (res.ok) fetchMonthlyLogs(currentYear, currentMonth);
      else alert(t("updateFailed") || "Güncellenemedi!");
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
  const getLocalYYYYMMDD = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  const daysCount = getDaysInMonth(currentYear, currentMonth);
  const allDaysArray = Array.from({ length: daysCount }, (_, i) => i + 1);
  const startDateStr = status?.startDate
    ? getLocalYYYYMMDD(new Date(status.startDate))
    : null;

  const daysArray = allDaysArray.filter((day) => {
    const dateStr = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return startDateStr ? dateStr >= startDateStr : true;
  });

  const getLogForDay = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const log = logs.find((l) => l.date === dateStr);
    let farzCompleted = 0,
      otherCompleted = 0;
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

  let monthlyFarzTotal = 0,
    monthlyOtherTotal = 0;
  logs.forEach((log) => {
    FARZ_PRAYERS.forEach((key) => {
      if ((log as any)[key]) monthlyFarzTotal++;
    });
    OTHER_PRAYERS.forEach((key) => {
      if ((log as any)[key]) monthlyOtherTotal++;
    });
  });

  if (loading && !status) return <PrayersLoading />;
  if (status && !status.enabled)
    return <PrayersOnboarding t={t} onEnable={handleEnableTracking} />;

  return (
    <div className="min-h-screen bg-[#FDFDFD] dark:bg-gray-950 py-6 md:py-12 px-2 sm:px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 bg-white dark:bg-gray-900 p-4 md:p-8 rounded-3xl md:rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3 md:gap-5 w-full md:w-auto">
            <button
              onClick={() => router.push("/")}
              className="p-2.5 md:p-3 bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-teal-600 rounded-xl md:rounded-2xl transition-all shadow-inner shrink-0"
              title={t("backHome") || "Ana Sayfa"}
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
            </button>
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
          {/* Aylar ve Yıllar İçin Select Kısmı */}
          <div className="flex items-center gap-2 md:gap-3 bg-gray-50 dark:bg-gray-800 p-1.5 md:p-2 rounded-xl md:rounded-2xl border border-gray-100 dark:border-gray-700 w-full md:w-auto justify-center">
            {/* AY SEÇİCİ */}
            <select
              value={currentMonth}
              onChange={(e) => setCurrentMonth(Number(e.target.value))}
              title={t("selectMonth") || "Ay Seç"}
              aria-label={t("selectMonth") || "Ay Seç"}
              className="bg-transparent text-sm md:text-base font-bold text-gray-700 dark:text-gray-200 py-1.5 px-2 md:px-4 outline-none cursor-pointer text-center"
            >
              {getMonthNames().map((m, i) => (
                <option key={i} value={i + 1} className="dark:bg-gray-800">
                  {m}
                </option>
              ))}
            </select>

            <div className="w-px h-5 md:h-6 bg-gray-300 dark:bg-gray-600"></div>

            {/* YIL SEÇİCİ */}
            <select
              value={currentYear}
              onChange={(e) => setCurrentYear(Number(e.target.value))}
              title={t("selectYear") || "Yıl Seç"}
              aria-label={t("selectYear") || "Yıl Seç"}
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

        {/* TABLE */}
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
                    return (
                      <PrayerDayRow
                        key={day}
                        day={day}
                        dateStr={dateStr}
                        log={log}
                        farzCompleted={farzCompleted}
                        otherCompleted={otherCompleted}
                        isToday={isToday}
                        expandedDay={expandedDay}
                        expandedCategory={expandedCategory}
                        updatingStr={updatingStr}
                        toggleExpand={toggleExpand}
                        togglePrayer={togglePrayer}
                        t={t}
                      />
                    );
                  })
                )}

                {/* MONTHLY TOTAL */}
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
