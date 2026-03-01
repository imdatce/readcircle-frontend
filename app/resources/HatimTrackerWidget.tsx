"use client";
import React, { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext"; // i18n hook eklendi

interface HatimTrackerWidgetProps {
  lastReadPage?: number | null;
  onContinueReading?: () => void;
}

export default function HatimTrackerWidget({
  lastReadPage,
  onContinueReading,
}: HatimTrackerWidgetProps) {
  const { t } = useLanguage(); // i18n kullanımı eklendi
  const [dailyGoal, setDailyGoal] = useState<number>(20);
  const [todayRead, setTodayRead] = useState<number>(0);

  const totalRead = lastReadPage || 0;
  const totalPages = 604;

  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [customGoal, setCustomGoal] = useState("");

  const loadTodayProgress = () => {
    const todayStr = new Date().toISOString().split("T")[0];
    const savedDataStr = localStorage.getItem("hatim_progress_today");

    if (savedDataStr) {
      const parsed = JSON.parse(savedDataStr);
      if (parsed.date === todayStr) {
        setTodayRead(parsed.count);
      } else {
        setTodayRead(0);
      }
    }
  };

  useEffect(() => {
    // ESLint (cascading renders) hatasını önlemek için işlemleri bir sonraki döngüye (asenkron) erteliyoruz
    const timer = setTimeout(() => {
      const savedGoal = localStorage.getItem("hatim_daily_goal");
      if (savedGoal) {
        setDailyGoal(parseInt(savedGoal, 10));
      }
      setCustomGoal(savedGoal || "20");

      // Sayfa yüklendiğinde bugünün okuma sayısını getir
      loadTodayProgress();
    }, 0);

    // Diğer sayfalardan (Modal'dan) gelen anlık güncellemeleri dinle
    window.addEventListener("hatim_progress_updated", loadTodayProgress);

    return () => {
      clearTimeout(timer); // Bileşen unmount olduğunda timer'ı temizle
      window.removeEventListener("hatim_progress_updated", loadTodayProgress);
    };
  }, []);

  const currentJuz = Math.ceil(totalRead / 20) || 1;
  const dailyPercent = Math.min((todayRead / dailyGoal) * 100, 100);
  const hatimPercent =
    totalRead > 0 ? ((totalRead / totalPages) * 100).toFixed(1) : "0.0";

  const isGoalReached = todayRead >= dailyGoal && dailyGoal > 0;

  const handleSaveGoal = (newGoal: number) => {
    if (newGoal > 0 && newGoal <= 604) {
      setDailyGoal(newGoal);
      setIsEditingGoal(false);
      localStorage.setItem("hatim_daily_goal", newGoal.toString());
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-5 md:p-6 shadow-sm border border-emerald-100 dark:border-emerald-900/30 w-full relative overflow-hidden group">
      {/* Dekoratif Arka Plan */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

      {/* --- HEDEF DÜZENLEME EKRANI (OVERLAY) --- */}
      {isEditingGoal && (
        <div className="absolute inset-0 z-20 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-200">
          <h3 className="text-lg font-black text-gray-800 dark:text-white mb-4 text-center">
            {t("setDailyGoalTitle") || "Günlük Hedefini Belirle!"}
          </h3>

          <div className="grid grid-cols-3 gap-2 w-full mb-4 max-w-sm">
            <button
              onClick={() => handleSaveGoal(5)}
              className="py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-xl font-bold text-sm transition-colors border border-emerald-200 dark:border-emerald-800"
            >
              5 {t("pageWord") || "Sayfa"}
            </button>
            <button
              onClick={() => handleSaveGoal(10)}
              className="py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-xl font-bold text-sm transition-colors border border-emerald-200 dark:border-emerald-800"
            >
              10 {t("pageWord") || "Sayfa"}
            </button>
            <button
              onClick={() => handleSaveGoal(20)}
              className="py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-xl font-bold text-sm transition-colors border border-emerald-200 dark:border-emerald-800"
            >
              {t("oneJuzLabel") || "1 Cüz (20)"}
            </button>
          </div>

          <div className="flex w-full gap-2 mb-6 max-w-sm">
            <input
              type="number"
              value={customGoal}
              onChange={(e) => setCustomGoal(e.target.value)}
              className="flex-1 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 text-center font-bold text-gray-800 dark:text-white focus:border-emerald-500 outline-none"
              placeholder={t("customGoalPlaceholder") || "Özel"}
              min="1"
              max="604"
            />
            <button
              onClick={() => handleSaveGoal(Number(customGoal))}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold transition-colors"
            >
              {t("save") || "Kaydet"}
            </button>
          </div>

          <button
            onClick={() => setIsEditingGoal(false)}
            className="text-sm font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 underline underline-offset-4"
          >
            {t("cancel") || "Vazgeç"}
          </button>
        </div>
      )}
      {/* -------------------------------------- */}

      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl md:text-2xl font-black text-gray-800 dark:text-white flex items-center gap-2">
            {t("myHatimJourney") || "Hatim Yolculuğum"}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">
            {totalRead === 0 ? (
              <span>
                {t("notStartedReading") || "Henüz okumaya başlamadınız"}
              </span>
            ) : (
              <span>
                {t("currentlyAtPrefix") || "Şu an "}
                <strong className="text-emerald-600">
                  {currentJuz}. {t("juzWord") || "Cüz"}
                </strong>
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => setIsEditingGoal(true)}
          className="text-xs font-bold text-gray-400 hover:text-emerald-600 bg-gray-50 dark:bg-gray-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 px-3 py-1.5 rounded-lg transition-all border border-transparent hover:border-emerald-200 dark:border-emerald-800"
        >
          {t("changeGoalBtn") || "Hedefi Değiştir"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* GÜNLÜK HEDEF KARTI */}
        <div
          className={`rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all duration-500 border ${isGoalReached ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 shadow-[0_0_15px_rgba(16,185,129,0.15)] scale-[1.02]" : "bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800"}`}
        >
          <div className="relative w-16 h-16 mb-2 flex items-center justify-center">
            <svg
              className="w-full h-full transform -rotate-90"
              viewBox="0 0 36 36"
            >
              <path
                className={
                  isGoalReached
                    ? "text-emerald-200/50 dark:text-emerald-800/50"
                    : "text-gray-200 dark:text-gray-700"
                }
                strokeDasharray="100, 100"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                strokeWidth="3"
                fill="none"
              />
              <path
                className="text-emerald-500 transition-all duration-1000 ease-out"
                strokeDasharray={`${dailyPercent}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span
                className={`text-sm font-black leading-none ${isGoalReached ? "text-emerald-700 dark:text-emerald-400" : "text-gray-800 dark:text-white"}`}
              >
                {todayRead}
              </span>
              <span
                className={`text-[9px] font-bold uppercase ${isGoalReached ? "text-emerald-500/80" : "text-gray-400"}`}
              >
                /{dailyGoal}
              </span>
            </div>
          </div>

          {isGoalReached ? (
            <div className="flex flex-col items-center animate-in zoom-in duration-300">
              <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                <svg
                  className="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                {t("congratulationsLabel") || "Tebrikler!"}
              </span>
              <span className="text-[9px] font-bold text-emerald-500/80 dark:text-emerald-400/80 mt-0.5">
                {t("goalReachedLabel") || "Hedefe Ulaştınız"}
              </span>
            </div>
          ) : (
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              {t("dailyGoalLabel") || "Günlük Hedef"}
            </p>
          )}
        </div>

        {/* GENEL HATİM KARTI */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center text-center">
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mb-1">
            % {hatimPercent}
          </div>
          <p className="text-xs font-bold text-gray-600 dark:text-gray-300">
            {totalRead} / {totalPages} {t("pageWord") || "Sayfa"}
          </p>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-2">
            {t("hatimProgressLabel") || "Hatim İlerlemesi"}
          </p>
        </div>
      </div>

      {/* Ana Progress Bar */}
      <div className="space-y-2 mb-6">
        <div className="flex justify-between text-xs font-bold">
          <span className="text-emerald-600 dark:text-emerald-400">
            {t("fatihaLabel") || "Fatiha"}
          </span>
          <span className="text-gray-400">{t("nasLabel") || "Nas"}</span>
        </div>
        <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-1000 ease-out relative"
            style={{ width: `${hatimPercent}%` }}
          >
            {totalRead > 0 && (
              <div className="absolute top-0 right-0 bottom-0 left-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[progress_1s_linear_infinite]"></div>
            )}
          </div>
        </div>
      </div>

      {/* KALDIĞIN YERDEN DEVAM ET BUTONU */}
      {lastReadPage ? (
        <button
          onClick={onContinueReading}
          className="w-full flex items-center justify-between p-4 md:p-5 bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-700 dark:to-teal-800 hover:from-emerald-500 hover:to-teal-500 text-white rounded-[2rem] shadow-lg shadow-emerald-500/20 dark:shadow-emerald-900/30 transition-all duration-300 group active:scale-[0.98] border border-emerald-400/30 dark:border-emerald-500/20"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md group-hover:scale-110 transition-transform duration-300">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <div className="text-left">
              <h3 className="font-black text-sm md:text-lg uppercase tracking-wider text-emerald-50">
                {t("goToLastReadLabel") || "Kaldığım Yere Git"}
              </h3>
              <p className="text-emerald-100/80 text-xs md:text-sm font-medium mt-0.5">
                {t("pageWord") || "Sayfa"} {lastReadPage}
              </p>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
            <svg
              className="w-5 h-5 opacity-90 group-hover:opacity-100 group-hover:translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </button>
      ) : (
        <div className="w-full py-4 bg-gray-100 dark:bg-gray-800 text-gray-400 rounded-2xl font-bold text-center border border-gray-200 dark:border-gray-700 cursor-default">
          {t("noReadingHistoryMsg") ||
            "Henüz okuma geçmişiniz yok. Cüz veya Sure seçerek başlayın."}
        </div>
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `@keyframes progress { 0% { background-position: 1rem 0; } 100% { background-position: 0 0; } }`,
        }}
      />
    </div>
  );
}
