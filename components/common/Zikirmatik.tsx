import React, { useState } from "react";
import { ZikirmatikProps } from "@/types";

interface ExtendedZikirmatikProps extends ZikirmatikProps {
  totalCount?: number;
}

const Zikirmatik = ({
  currentCount,
  onDecrement,
  isModal = false,
  t,
  readOnly = false,
  totalCount,
}: ExtendedZikirmatikProps) => {
  const isCompleted = currentCount <= 0;

  // Sadece totalCount yoksa kullanılacak yerel tavan değerini tutuyoruz.
  const [localMax, setLocalMax] = useState<number>(
    currentCount > 0 ? currentCount : 1,
  );

  // DÜZELTME: useEffect yerine render sırasında state kontrolü yapıyoruz.
  // Bu, React'in önerdiği "Adjusting state from props" yöntemidir.
  // Eğer totalCount yoksa ve currentCount elimizdeki max'tan büyükse, max'ı güncelle.
  if (!totalCount && currentCount > localMax) {
    setLocalMax(currentCount);
  }

  // Nihai Tavan Değer Hesabı:
  const finalMax = totalCount && totalCount > 0 ? totalCount : localMax;

  // Sıfıra bölünme hatasını önlemek için güvenlik kontrolü
  const safeMax = finalMax > 0 ? finalMax : 1;

  // Yüzde hesabı
  const percentage = Math.min(100, Math.max(0, (currentCount / safeMax) * 100));

  // SVG Çember Ayarları
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const containerSize = isModal ? "w-64 h-64" : "w-48 h-48";
  const buttonSize = isModal ? "w-40 h-40" : "w-28 h-28";
  const textSize = isModal ? "text-6xl" : "text-4xl";

  return (
    <div
      className={`flex flex-col items-center justify-center ${isModal ? "mt-4" : "mt-2"}`}
    >
      <div
        className={`relative flex items-center justify-center ${containerSize}`}
      >
        {/* PROGRESS HALKASI (SVG) */}
        <svg
          className="absolute inset-0 w-full h-full -rotate-90 transform drop-shadow-xl z-0"
          viewBox="0 0 100 100"
        >
          {/* Arka Plan Halkası */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="4"
            className="text-gray-200 dark:text-gray-800"
          />

          {/* İlerleme Halkası */}
          {!isCompleted && (
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className={`
                transition-all duration-500 ease-out
                ${readOnly ? "text-gray-400 dark:text-gray-600" : "text-emerald-500 dark:text-emerald-400"}
                dark:drop-shadow-[0_0_4px_rgba(52,211,153,0.5)]
              `}
            />
          )}
        </svg>

        {/* DIŞ ÇERÇEVE */}
        <div
          className={`
            relative flex items-center justify-center rounded-full
            bg-gradient-to-b from-gray-100 to-gray-300
            dark:from-gray-800 dark:to-black
            shadow-[0_10px_30px_rgba(0,0,0,0.15)]
            dark:shadow-[inset_0_2px_4px_rgba(255,255,255,0.1)]
            border border-white/50 dark:border-gray-700
            z-10
            ${isModal ? "w-52 h-52" : "w-36 h-36"} 
          `}
        >
          <div className="absolute top-3 w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-700 shadow-inner"></div>

          {/* ANA BUTON */}
          <button
            onClick={readOnly ? undefined : onDecrement}
            disabled={isCompleted || readOnly}
            aria-label={t("decrease")}
            className={`
              relative flex flex-col items-center justify-center rounded-full 
              transition-all duration-200 ease-out
              group
              ${buttonSize}
              
              ${
                isCompleted
                  ? "bg-gradient-to-br from-emerald-50 to-emerald-100 border-4 border-emerald-400/30 cursor-default shadow-inner dark:from-emerald-900/20 dark:to-emerald-950/50 dark:border-emerald-800/50"
                  : readOnly
                    ? "bg-gray-100 border-4 border-gray-200 cursor-not-allowed opacity-70 dark:bg-gray-800 dark:border-gray-700"
                    : "bg-gradient-to-br from-emerald-500 to-teal-600 border-4 border-emerald-300/20 shadow-[0_10px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_15px_25px_rgba(16,185,129,0.4)] hover:scale-[1.02] active:scale-95 active:shadow-inner cursor-pointer dark:from-gray-800 dark:to-gray-900 dark:border-gray-700 dark:shadow-black/50"
              }
            `}
          >
            {!readOnly && !isCompleted && (
              <div className="absolute top-0 left-0 w-full h-full rounded-full bg-gradient-to-b from-white/20 to-transparent pointer-events-none opacity-50 dark:opacity-10"></div>
            )}

            <div className="flex flex-col items-center leading-none select-none z-10">
              <span
                className={`
                  font-mono font-bold tracking-wider transition-colors duration-300 drop-shadow-sm
                  ${textSize} mb-1
                  ${
                    isCompleted
                      ? "text-emerald-600 dark:text-emerald-400"
                      : readOnly
                        ? "text-gray-400 dark:text-gray-600"
                        : "text-white dark:text-emerald-500 dark:drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                  }
                `}
              >
                {currentCount}
              </span>

              <span
                className={`text-[9px] font-bold uppercase tracking-[0.2em] 
                  ${
                    isCompleted
                      ? "text-emerald-500 dark:text-emerald-600"
                      : "text-emerald-100/80 dark:text-gray-500"
                  }
                  ${readOnly ? "text-gray-400" : ""}
                `}
              >
                {isCompleted ? t("completed") : t("remaining")}
              </span>
            </div>
          </button>
        </div>
      </div>

      <div className="h-8 mt-4 flex items-center justify-center">
        {isCompleted ? (
          <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-full border border-emerald-200 dark:border-emerald-800 animate-in fade-in slide-in-from-bottom-2">
            <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
              {t("allahAccept")}
            </span>
          </div>
        ) : (
          <span className="text-xs font-medium text-gray-400 dark:text-gray-600 tracking-wide animate-pulse">
            {readOnly ? t("waitingForUser") || "..." : t("tapToCount") || "..."}
          </span>
        )}
      </div>
    </div>
  );
};

export default Zikirmatik;
