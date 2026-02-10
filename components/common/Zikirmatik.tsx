import React from "react";
import { ZikirmatikProps } from "@/types";

const Zikirmatik = ({
  currentCount,
  onDecrement,
  isModal = false,
  t,
  readOnly = false,
}: ZikirmatikProps) => {
  return (
    <div className={`flex flex-col items-center ${isModal ? "mt-8" : "mt-3"}`}>
      <button
        onClick={readOnly ? undefined : onDecrement}
        disabled={currentCount === 0 || readOnly}
        aria-label={t("decrease")}
        className={`
                    rounded-full flex flex-col items-center justify-center 
                    shadow-lg border-4 transition transform 
                    ${isModal ? "w-32 h-32" : "w-24 h-24"} 
                    
                    ${
                      currentCount === 0
                        ? "bg-green-100 border-green-500 text-green-700 cursor-default dark:bg-green-900/30 dark:border-green-600 dark:text-green-400"
                        : readOnly
                          ? "bg-gray-200 border-gray-300 text-gray-500 cursor-not-allowed opacity-80 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400"
                          : "bg-blue-600 border-blue-400 text-white hover:bg-blue-700 cursor-pointer active:scale-95 dark:bg-blue-700 dark:border-blue-500 dark:hover:bg-blue-600"
                    }
                `}
      >
        <span
          className={`${isModal ? "text-4xl" : "text-3xl"} font-bold font-mono`}
        >
          {currentCount}
        </span>
        <span className="text-xs font-light">
          {currentCount === 0 ? t("completed") : readOnly ? "" : t("decrease")}
        </span>
      </button>
      {currentCount > 0 && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          {t("remaining")}
        </p>
      )}
      {currentCount === 0 && (
        <p className="text-xs text-green-600 dark:text-green-400 font-bold mt-2">
          {t("allahAccept")}
        </p>
      )}
    </div>
  );
};

export default Zikirmatik;
