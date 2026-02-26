/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";

// Mevcut Modüller
import { FARZ_PRAYERS, OTHER_PRAYERS } from "@/constants/prayersConfig";
import {
  PrayersLoading,
  PrayersOnboarding,
} from "@/components/prayers/PrayerViews";
import PrayerDayRow from "@/components/prayers/PrayerDayRow";

// --- TİPLER ---
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

interface KazaDebts {
  fajr: number;
  dhuhr: number;
  asr: number;
  maghrib: number;
  isha: number;
  witr: number;
}

// --- KAZA NAMAZI BİLEŞENİ ---
const KazaTracker = ({ t, token }: { t: any; token: string | null }) => {
  const [debts, setDebts] = useState<KazaDebts | null>(null);
  const [setupMode, setSetupMode] = useState(false);
  const [calcType, setCalcType] = useState<"time" | "manual">("time");
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  const [loading, setLoading] = useState(true);
  // Zaman girdileri
  const [years, setYears] = useState<number | "">("");
  const [months, setMonths] = useState<number | "">("");
  const [days, setDays] = useState<number | "">("");

  // Manuel girdiler
  const [manualDebts, setManualDebts] = useState<KazaDebts>({
    fajr: 0,
    dhuhr: 0,
    asr: 0,
    maghrib: 0,
    isha: 0,
    witr: 0,
  });

  useEffect(() => {
    const fetchStatus = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API_URL}/api/kaza/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          // ÇÖZÜM: ESLint hatasını önlemek için microtask kullanıyoruz
          Promise.resolve().then(() => {
            setDebts(data);
            // Eğer borçlar boşsa kurulumu aç
            const isNew = data.fajr === 0 && data.dhuhr === 0 && data.asr === 0;
            if (isNew) setSetupMode(true);
            setLoading(false);
          });
        }
      } catch (e) {
        console.error("Kaza verisi çekilemedi", e);
        setLoading(false);
      }
    };
    fetchStatus();
  }, [API_URL, token]);

  // Hesapla ve Kaydet
  // Borçları Kaydetme Fonksiyonu (POST)
  const handleSaveDebts = async () => {
    // 1. Önce değişkeni tanımlıyoruz
    let newDebts: KazaDebts;

    // 2. Hesaplama mantığını kuruyoruz
    if (calcType === "time") {
      const y = Number(years) || 0;
      const m = Number(months) || 0;
      const d = Number(days) || 0;
      const totalDays = y * 365 + m * 30 + d;

      newDebts = {
        fajr: totalDays,
        dhuhr: totalDays,
        asr: totalDays,
        maghrib: totalDays,
        isha: totalDays,
        witr: totalDays,
      };
    } else {
      newDebts = {
        fajr: Number(manualDebts.fajr) || 0,
        dhuhr: Number(manualDebts.dhuhr) || 0,
        asr: Number(manualDebts.asr) || 0,
        maghrib: Number(manualDebts.maghrib) || 0,
        isha: Number(manualDebts.isha) || 0,
        witr: Number(manualDebts.witr) || 0,
      };
    }

    // 3. Şimdi backend'e gönderiyoruz
    try {
      const res = await fetch(`${API_URL}/api/kaza/initialize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newDebts), // Değişken burada artık tanımlı
      });

      if (res.ok) {
        const data = await res.json();
        setDebts(data);
        setSetupMode(false);
      }
    } catch (e) {
      alert("Borçlar kaydedilemedi.");
    }
  };
  // Kaza Kılındı (Sayısını 1 Azalt)
  const handleDecrement = async (prayerKey: string) => {
    try {
      const res = await fetch(`${API_URL}/api/kaza/decrement`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ prayer: prayerKey }),
      });
      if (res.ok) {
        const data = await res.json();
        setDebts(data);
        if (navigator.vibrate) navigator.vibrate(20);
      }
    } catch (e) {
      console.error("Güncellenemedi");
    }
  };

  // Kurulum (Onboarding) Ekranı
  if (setupMode) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-3xl md:rounded-[2.5rem] shadow-xl shadow-gray-200/40 dark:shadow-none border border-amber-100 dark:border-amber-900/30 p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4">
        <div className="text-center max-w-lg mx-auto mb-8">
          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">
            Kaza Namazı Hesaplama
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
            Geçmiş kaza namazı borçlarınızı hesaplayın ve sistemli bir şekilde
            eritmeye başlayın.
          </p>
        </div>

        <div className="max-w-xl mx-auto space-y-6">
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl">
            <button
              onClick={() => setCalcType("time")}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${calcType === "time" ? "bg-white dark:bg-gray-700 text-amber-600 shadow-sm" : "text-gray-500"}`}
            >
              Zaman ile Hesapla
            </button>
            <button
              onClick={() => setCalcType("manual")}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${calcType === "manual" ? "bg-white dark:bg-gray-700 text-amber-600 shadow-sm" : "text-gray-500"}`}
            >
              Vakit Bazında Gir
            </button>
          </div>

          {calcType === "time" && (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">
                  YIL
                </label>
                <input
                  type="number"
                  min="0"
                  value={years}
                  onChange={(e) =>
                    setYears(e.target.value ? Number(e.target.value) : "")
                  }
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-center text-lg font-bold outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">
                  AY
                </label>
                <input
                  type="number"
                  min="0"
                  value={months}
                  onChange={(e) =>
                    setMonths(e.target.value ? Number(e.target.value) : "")
                  }
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-center text-lg font-bold outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">
                  GÜN
                </label>
                <input
                  type="number"
                  min="0"
                  value={days}
                  onChange={(e) =>
                    setDays(e.target.value ? Number(e.target.value) : "")
                  }
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-center text-lg font-bold outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="0"
                />
              </div>
            </div>
          )}

          {calcType === "manual" && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { key: "fajr", label: "Sabah" },
                { key: "dhuhr", label: "Öğle" },
                { key: "asr", label: "İkindi" },
                { key: "maghrib", label: "Akşam" },
                { key: "isha", label: "Yatsı" },
                { key: "witr", label: "Vitir" },
              ].map((item) => (
                <div key={item.key}>
                  <label className="block text-xs font-bold text-gray-500 mb-1">
                    {item.label}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={(manualDebts as any)[item.key] || ""}
                    onChange={(e) =>
                      setManualDebts({
                        ...manualDebts,
                        [item.key]: Number(e.target.value),
                      })
                    }
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-center text-lg font-bold outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="0"
                  />
                </div>
              ))}
            </div>
          )}

          <button
            onClick={handleSaveDebts}
            className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black uppercase tracking-widest text-sm shadow-lg active:scale-95 transition-all"
          >
            Hesapla ve Başla
          </button>
        </div>
      </div>
    );
  }

  if (!debts) return null;

  // Takip (Tracker) Ekranı
  const CARDS = [
    {
      key: "fajr",
      title: "Sabah",
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-900/20",
      border: "border-blue-100 dark:border-blue-800/30",
    },
    {
      key: "dhuhr",
      title: "Öğle",
      color: "text-amber-500",
      bg: "bg-amber-50 dark:bg-amber-900/20",
      border: "border-amber-100 dark:border-amber-800/30",
    },
    {
      key: "asr",
      title: "İkindi",
      color: "text-orange-500",
      bg: "bg-orange-50 dark:bg-orange-900/20",
      border: "border-orange-100 dark:border-orange-800/30",
    },
    {
      key: "maghrib",
      title: "Akşam",
      color: "text-rose-500",
      bg: "bg-rose-50 dark:bg-rose-900/20",
      border: "border-rose-100 dark:border-rose-800/30",
    },
    {
      key: "isha",
      title: "Yatsı",
      color: "text-indigo-500",
      bg: "bg-indigo-50 dark:bg-indigo-900/20",
      border: "border-indigo-100 dark:border-indigo-800/30",
    },
    {
      key: "witr",
      title: "Vitir",
      color: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      border: "border-emerald-100 dark:border-emerald-800/30",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white dark:bg-gray-900 p-4 md:p-6 rounded-3xl md:rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800">
        <div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white">
            Kaza Namazlarım
          </h2>
          <p className="text-xs font-medium text-gray-500 mt-1">
            Namaz kıldıkça butona tıklayarak borcunuzu düşün.
          </p>
        </div>
        <button
          onClick={() => setSetupMode(true)}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold transition-colors"
        >
          Düzenle
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {CARDS.map((card) => {
          const debtCount = debts[card.key as keyof KazaDebts];
          const isCompleted = debtCount <= 0;

          return (
            <div
              key={card.key}
              className={`flex flex-col bg-white dark:bg-gray-900 rounded-3xl border shadow-sm p-4 relative overflow-hidden transition-all ${isCompleted ? "opacity-60 border-gray-100 dark:border-gray-800" : card.border}`}
            >
              {/* Arka plan dekoru */}
              <div
                className={`absolute -bottom-6 -right-6 w-24 h-24 rounded-full opacity-20 blur-2xl pointer-events-none ${card.bg}`}
              ></div>

              <div className="flex justify-between items-center mb-4 relative z-10">
                <span className="font-bold text-gray-600 dark:text-gray-300 text-sm tracking-wide uppercase">
                  {card.title}
                </span>
                {!isCompleted && (
                  <span
                    className="flex h-2 w-2 rounded-full bg-current opacity-50"
                    style={{ color: card.color }}
                  ></span>
                )}
              </div>

              <div className="flex-1 flex flex-col items-center justify-center py-4 relative z-10">
                <span
                  className={`text-4xl md:text-5xl font-black tracking-tighter ${isCompleted ? "text-gray-300 dark:text-gray-700" : "text-gray-800 dark:text-white"}`}
                >
                  {debtCount}
                </span>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                  KALDI
                </span>
              </div>

              <button
                onClick={() => handleDecrement(card.key as keyof KazaDebts)}
                disabled={isCompleted}
                className={`mt-2 w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2 relative z-10 ${
                  isCompleted
                    ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-default"
                    : "bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:shadow-sm"
                }`}
              >
                {isCompleted ? (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    BİTTİ
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4 text-emerald-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    -1
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- ANA SAYFA İÇERİĞİ (GÜNLÜK VE KAZA SEKME KONTROLÜ) ---
function PrayersContent() {
  const { user, token } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Tab State
  const tabParam = searchParams.get("tab") as "gunluk" | "kaza" | null;
  const [activeTab, setActiveTab] = useState<"gunluk" | "kaza">("gunluk");

  useEffect(() => {
    if (tabParam === "gunluk" || tabParam === "kaza") {
      Promise.resolve().then(() => setActiveTab(tabParam));
    }
  }, [tabParam]);

  const handleTabChange = (tab: "gunluk" | "kaza") => {
    setActiveTab(tab);
    router.replace(`/prayers?tab=${tab}`, { scroll: false });
  };

  // Günlük Takip State'leri
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

  // Günlük Takip Fonksiyonları
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
  if (status && !status.enabled && activeTab === "gunluk") {
    // Sadece günlük sekmesindeysek ve aktif değilse onboarding göster.
    // Kaza sekmesinde bunu göstermiyoruz.
    return (
      <div className="min-h-screen bg-[#FDFDFD] dark:bg-gray-950 py-6 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* TAB MENÜ */}
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl w-fit mx-auto shadow-inner">
            {/* activeTab kesinlikle "gunluk" olduğu için aktif stilleri doğrudan verdik */}
            <button
              onClick={() => handleTabChange("gunluk")}
              className="px-6 py-2.5 rounded-xl text-sm font-bold transition-all uppercase tracking-wider bg-white dark:bg-gray-700 text-teal-600 shadow-sm"
            >
              Günlük Namaz Takibi
            </button>
            <button
              onClick={() => handleTabChange("kaza")}
              className="px-6 py-2.5 rounded-xl text-sm font-bold transition-all uppercase tracking-wider text-gray-500 hover:text-gray-700 dark:text-gray-400"
            >
              Kaza Namazı Takibi
            </button>
          </div>
          <PrayersOnboarding t={t} onEnable={handleEnableTracking} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] dark:bg-gray-950 py-6 md:py-10 px-3 sm:px-4 md:px-8 transition-colors duration-500">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Üst Başlık ve Geri Butonu */}
        <div className="flex items-center justify-between bg-white dark:bg-gray-900 p-4 md:p-5 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800">
          <button
            onClick={() => router.push("/")}
            className="p-2.5 bg-gray-50 dark:bg-gray-800 text-gray-500 hover:text-teal-600 rounded-xl transition-all shadow-inner shrink-0"
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
          <div className="flex bg-gray-100 dark:bg-gray-800/80 p-1.5 rounded-2xl shadow-inner border border-gray-200/50 dark:border-gray-700/50">
            <button
              onClick={() => handleTabChange("gunluk")}
              className={`px-4 sm:px-8 py-2 md:py-2.5 rounded-xl text-[10px] sm:text-xs font-black transition-all uppercase tracking-widest ${
                activeTab === "gunluk"
                  ? "bg-white dark:bg-gray-700 text-teal-600 dark:text-teal-400 shadow-md transform scale-[1.02]"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
              }`}
            >
              Günlük Namaz Takibi
            </button>
            <button
              onClick={() => handleTabChange("kaza")}
              className={`px-4 sm:px-8 py-2 md:py-2.5 rounded-xl text-[10px] sm:text-xs font-black transition-all uppercase tracking-widest ${
                activeTab === "kaza"
                  ? "bg-white dark:bg-gray-700 text-amber-600 dark:text-amber-400 shadow-md transform scale-[1.02]"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
              }`}
            >
              Kaza Namazı Takibi
            </button>
          </div>
          <div className="w-10"></div>
        </div>

        {/* KAZA SEKME İÇERİĞİ */}
        {activeTab === "kaza" && <KazaTracker t={t} token={token} />}
        {/* GÜNLÜK SEKME İÇERİĞİ */}
        {activeTab === "gunluk" && (
          <>
            {/* AY VE YIL SEÇİCİ */}
            <div className="flex justify-end mb-2">
              <div className="flex items-center gap-2 md:gap-3 bg-white dark:bg-gray-900 p-2 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm w-full md:w-auto justify-center">
                <select
                  value={currentMonth}
                  onChange={(e) => setCurrentMonth(Number(e.target.value))}
                  title={t("selectMonth") || "Ay Seç"} // EKLENDİ
                  aria-label={t("selectMonth") || "Ay Seç"} // EKLENDİ
                  className="bg-transparent text-sm md:text-base font-bold text-gray-700 dark:text-gray-200 py-1 px-3 outline-none cursor-pointer"
                >
                  {getMonthNames().map((m, i) => (
                    <option key={i} value={i + 1} className="dark:bg-gray-800">
                      {m}
                    </option>
                  ))}
                </select>
                <div className="w-px h-5 bg-gray-200 dark:bg-gray-700"></div>
                <select
                  value={currentYear}
                  onChange={(e) => setCurrentYear(Number(e.target.value))}
                  title={t("selectYear") || "Yıl Seç"} // EKLENDİ
                  aria-label={t("selectYear") || "Yıl Seç"} // EKLENDİ
                  className="bg-transparent text-sm md:text-base font-bold text-gray-700 dark:text-gray-200 py-1 px-3 outline-none cursor-pointer"
                >
                  {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
                    <option key={y} value={y} className="dark:bg-gray-800">
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* TABLO */}
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
          </>
        )}
      </div>
    </div>
  );
}

// Ana Sayfa Bileşenini Suspense İle Sarmalıyoruz
export default function PrayersPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FDFDFD] dark:bg-gray-950">
          <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
        </div>
      }
    >
      <PrayersContent />
    </Suspense>
  );
}
