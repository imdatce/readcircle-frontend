import React from "react";
import { CevsenBab } from "@/types";

export const fontSizes = {
   ARABIC: [
    "text-lg",  
    "text-xl",  
    "text-2xl",  
    "text-3xl",  
    "text-4xl",  
    "text-5xl",  
    "text-6xl",  
    "text-7xl",  
    "text-8xl",  
  ],
   LATIN: [
    "text-sm",
    "text-base",
    "text-lg",
    "text-xl",  
    "text-2xl",
    "text-3xl",
    "text-4xl",
    "text-5xl",
    "text-6xl",
  ],
   MEANING: [
    "text-xs",
    "text-sm",
    "text-base",
    "text-lg",  
    "text-xl",
    "text-2xl",
    "text-3xl",
    "text-4xl",
    "text-5xl",
  ],
};

export const formatArabicText = (text: string, fontLevel: number) => {
  const parts = text.split(/([١٢٣٤٥٦٧٨٩٠]+)/g);
  const currentFontClass = fontSizes.ARABIC[fontLevel];

  return (
    <div className={`leading-relaxed ${currentFontClass}`}>
      {parts.map((part, index) => {
        if (/^[١٢٣٤٥٦٧٨٩٠]+$/.test(part)) {
          return (
            <span
              key={index}
              className="inline-flex items-center justify-center mx-1 w-9 h-9 rounded-full bg-amber-100 text-amber-700 border border-amber-300 font-bold text-xl align-middle shadow-sm dark:bg-amber-900/50 dark:text-amber-400 dark:border-amber-700"
            >
              {part}
            </span>
          );
        }
        if (part.includes("سُبْحَانَكَ")) {
          const subParts = part.split("سُبْحَانَكَ");
          return (
            <span key={index}>
              {subParts[0]} <br />
              <div
                className={`mt-6 mb-2 p-4 bg-emerald-50 border-r-4 border-emerald-500 rounded-l-lg text-emerald-900 font-bold shadow-inner text-center ${fontSizes.ARABIC[fontLevel]} dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-600`}
              >
                سُبْحَانَكَ {subParts[1]}
              </div>
            </span>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </div>
  );
};

export const formatLatinText = (text: string, fontLevel: number) => {
  const parts = text.split(/(\d+\s)/g);
  const currentFontClass = fontSizes.LATIN[fontLevel];
  return (
    <div
      className={`${currentFontClass} text-gray-800 dark:text-gray-200 font-serif leading-relaxed`}
    >
      {parts.map((part, index) => {
        if (/^\d+\s$/.test(part)) {
          return (
            <span
              key={index}
              className="inline-flex items-center justify-center mx-2 w-8 h-8 rounded-full bg-amber-100 text-amber-700 border border-amber-300 font-sans font-bold text-lg align-middle shadow-sm dark:bg-amber-900/50 dark:text-amber-400 dark:border-amber-700"
            >
              {part.trim()}
            </span>
          );
        }
        if (part.toLowerCase().includes("sübhâneke")) {
          const subParts = part.split(/sübhâneke/i);
          return (
            <span key={index}>
              {subParts[0]} <br />
              <div
                className={`mt-6 mb-2 p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-lg text-emerald-900 font-bold shadow-inner text-center font-sans ${currentFontClass} dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-600`}
              >
                Sübhâneke {subParts[1]}
              </div>
            </span>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </div>
  );
};

export const formatStyledText = (
  text: string,
  type: "LATIN" | "MEANING",
  fontLevel: number,
) => {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  const sizeClass =
    type === "LATIN"
      ? fontSizes.LATIN[fontLevel]
      : fontSizes.MEANING[fontLevel];
  return (
    <div className="space-y-3">
      {lines.map((line, index) => (
        <div
          key={index}
          className={`relative p-4 rounded-xl border flex gap-4 items-start transition-all hover:shadow-md ${
            type === "LATIN"
              ? `bg-white border-gray-200 text-gray-800 font-serif italic ${sizeClass} dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200`
              : `bg-emerald-50 border-emerald-100 text-emerald-900 font-sans ${sizeClass} dark:bg-emerald-900/10 dark:border-emerald-800 dark:text-emerald-300`
          }`}
        >
          <div
            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${
              type === "LATIN"
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                : "bg-emerald-200 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200"
            }`}
          >
            {index + 1}
          </div>
          <p className="leading-relaxed mt-1">{line.trim()}</p>
        </div>
      ))}
    </div>
  );
};

export const formatMeaningText = (text: string, fontLevel: number) => {
  const lines = text.split(/[-•\n]/).filter((line) => line.trim().length > 0);
  const sizeClass = fontSizes.MEANING[fontLevel];
  return (
    <div className="space-y-4">
      {lines.map((line, index) => (
        <div key={index} className="flex items-start group">
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] font-bold mt-1 mr-3 group-hover:bg-emerald-500 group-hover:text-white transition-colors dark:bg-emerald-900 dark:text-emerald-400 dark:group-hover:bg-emerald-600 dark:group-hover:text-white">
            {index + 1}
          </div>
          <p
            className={`text-gray-800 dark:text-gray-300 leading-relaxed font-medium italic ${sizeClass}`}
          >
            {line.trim()}
          </p>
        </div>
      ))}
    </div>
  );
};

export const renderUhudList = (
  text: string,
  type: "ARABIC" | "LATIN",
  fontLevel: number,
) => {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  const isArabic = type === "ARABIC";
  const dir = isArabic ? "rtl" : "ltr";
  const sizeClass = isArabic
    ? fontSizes.ARABIC[fontLevel]
    : fontSizes.LATIN[fontLevel];
  const fontClass = isArabic
    ? `font-serif leading-[3.5rem] text-emerald-950 dark:text-emerald-100 ${sizeClass}`
    : `font-serif leading-relaxed text-emerald-900 dark:text-emerald-200 ${sizeClass}`;

  return (
    <div
      className="bg-emerald-50/80 rounded-2xl border border-emerald-100 p-2 md:p-4 shadow-inner dark:bg-emerald-900/20 dark:border-emerald-800"
      dir={dir}
    >
      <div className="space-y-0 divide-y divide-emerald-200/60 dark:divide-emerald-700/50">
        {lines.map((line, index) => (
          <div
            key={index}
            className="flex items-start py-3 group hover:bg-emerald-100/80 dark:hover:bg-emerald-800/30 transition-colors px-3 rounded-lg"
          >
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm border mt-1 ${isArabic ? "ml-4" : "mr-4"} bg-white text-emerald-700 border-emerald-200 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-all dark:bg-emerald-900 dark:text-emerald-300 dark:border-emerald-700`}
            >
              {index + 1}
            </div>
            <p className={`${fontClass} flex-1 pt-0.5`}>{line.trim()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
