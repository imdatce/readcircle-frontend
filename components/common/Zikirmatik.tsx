import React from "react";
import { ZikirmatikProps } from "@/types";

const Zikirmatik = ({
  currentCount,
  onDecrement,
  isModal = false,
  t,
  readOnly = false,
}: ZikirmatikProps) => {
  const isCompleted = currentCount === 0;

  return (
    <div
      className={`flex flex-col items-center justify-center ${isModal ? "mt-6" : "mt-2"}`}
    >
      <div className="relative group">
        {!readOnly && !isCompleted && (
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full blur opacity-20 group-hover:opacity-50 transition duration-500"></div>
        )}

        <button
          onClick={readOnly ? undefined : onDecrement}
          disabled={isCompleted || readOnly}
          aria-label={t("decrease")}
          className={`
            relative flex flex-col items-center justify-center rounded-full transition-all duration-200 ease-out border-4
            ${isModal ? "w-40 h-40" : "w-28 h-28"}
            
            ${
              isCompleted
                ? "bg-emerald-50 border-emerald-200 cursor-default shadow-none dark:bg-emerald-900/20 dark:border-emerald-800"
                : readOnly
                  ? "bg-gray-100 border-gray-200 cursor-default opacity-80 dark:bg-gray-800 dark:border-gray-700"
                  : "bg-gradient-to-br from-blue-500 to-indigo-600 border-white/20 shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02] active:scale-95 cursor-pointer dark:border-gray-700"
            }
          `}
        >
          <div className="flex flex-col items-center leading-none select-none">
            <span
              className={`font-mono font-bold tracking-tighter transition-colors duration-300 ${
                isModal ? "text-5xl mb-1" : "text-4xl mb-1"
              } ${
                isCompleted
                  ? "text-emerald-500 dark:text-emerald-400"
                  : readOnly
                    ? "text-gray-400 dark:text-gray-500"
                    : "text-white drop-shadow-md"
              }`}
            >
              {currentCount}
            </span>

            <span
              className={`text-[10px] font-bold uppercase tracking-widest ${
                isCompleted
                  ? "text-emerald-400 dark:text-emerald-600"
                  : readOnly
                    ? "text-gray-400"
                    : "text-blue-100/80"
              }`}
            >
              {isCompleted
                ? t("completed")
                : readOnly
                  ? t("remaining")
                  : t("decrease")}
            </span>
          </div>

          {!readOnly && !isCompleted && (
            <div className="absolute top-0 left-0 w-full h-full rounded-full bg-gradient-to-b from-white/20 to-transparent pointer-events-none"></div>
          )}
        </button>
      </div>

      <div className="h-6 mt-3 flex items-center justify-center">
        {isCompleted ? (
          <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-in fade-in slide-in-from-bottom-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            {t("allahAccept")}
          </span>
        ) : (
          <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
            {readOnly
              ? t("waitingForUser") || "Kullanıcı bekleniyor..."
              : t("tapToCount") || "Saymak için dokun"}
          </span>
        )}
      </div>
    </div>
  );
};

export default Zikirmatik;
