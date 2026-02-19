import React from "react";

// Font boyutları
export const fontSizes = {
  ARABIC: [
    "text-2xl",
    "text-3xl",
    "text-4xl",
    "text-5xl",
    "text-6xl",
    "text-7xl",
    "text-8xl",
    "text-9xl",
    "text-[10rem]",
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

// Sayıları Arapça Rakamlara Çevirir (1 -> ١)
const toArabicNumerals = (num: string | number) => {
  const digits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return num.toString().replace(/\d/g, (d) => digits[parseInt(d)]);
};

// Besmele Kontrolü
const isBismillah = (text: string) => {
  const cleanText = text.toLowerCase().replace(/[\s\.\,\*\'\"]/g, "");
  return (
    cleanText.includes("bismillahirrahmanirrahim") ||
    (cleanText.includes("bismi") && cleanText.includes("rahim")) ||
    (cleanText.includes("rahman") &&
      cleanText.includes("rahim") &&
      cleanText.includes("allah")) ||
    text.includes("Rahmân ve Rahîm")
  );
};

// --- GÜNCELLENMİŞ AYET RENDER FONKSİYONU ---
const renderVerseLine = (
  line: string,
  index: number,
  className: string,
  mode: "ARABIC" | "LATIN" | "MEANING",
  isRtl: boolean,
) => {
  const cleanLine = line.trim();
  if (!cleanLine) return null;

  // 1. Regex ile "1. Metin" formatını parçala
  const match = cleanLine.match(/^(\d+)\.\s+(.*)/);

  let verseNum = "";
  let verseText = cleanLine;

  if (match) {
    verseNum = match[1]; // "1"
    verseText = match[2]; // "Bismillâhirrahmanirrahim."
  }

  // 2. Besmele Özel Gösterimi
  // --- BESMELE ÖZEL GÖSTERİMİ (BLOK YAPI) ---
  if (isBismillah(verseText) && parseInt(verseNum || "0") <= 1) {
    return (
      <div
        key={`besmele-${index}`}
        className="w-full text-center my-8 md:my-10 animate-in zoom-in-95 duration-700 block"
      >
        <span
          className={`font-serif font-black opacity-90 block text-emerald-700 dark:text-emerald-400 drop-shadow-sm text-2xl md:text-3xl leading-normal`}
        >
          {verseText}
        </span>
        <div className="mx-auto w-40 h-1 bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent mt-3 rounded-full"></div>
      </div>
    );
  }

  // 3. Normal Ayet Gösterimi (SADE DAİRE GÜNCELLEMESİ YAPILDI)
  return (
    <div
      key={index}
      className={`relative py-2.5 px-2 md:px-3 leading-loose transition-colors group rounded-lg hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 ${
        isRtl ? "text-right" : "text-justify"
      }`}
    >
      <p
        className={`${className} inline decoration-clone text-gray-800 dark:text-gray-200`}
      >
        {verseText}

        {/* --- YENİ SADE DAİRE STİLİ --- */}
        {verseNum && (
          <span className="inline-flex items-center justify-center min-w-[30px] h-[30px] px-1 mx-1.5 align-middle select-none">
            <span className="flex items-center justify-center w-full h-full border border-gray-400 dark:border-gray-500 rounded-full text-[0.6em] opacity-80">
              {/* Arapça modundaysa Arapça rakam, değilse Latin rakam */}
              <span
                className={
                  mode === "ARABIC"
                    ? "mt-1 font-serif"
                    : "font-sans font-medium"
                }
              >
                {mode === "ARABIC" || mode === "LATIN"
                  ? toArabicNumerals(verseNum)
                  : verseNum}
              </span>
            </span>
          </span>
        )}
        {/* ----------------------------- */}
      </p>
    </div>
  );
};

// --- FORMATLAYICI FONKSİYONLAR ---

export const formatArabicText = (text: string, fontLevel: number) => {
  const className = `${fontSizes.ARABIC[fontLevel]} font-serif leading-[2.5]`;
  const lines = text.split("\n").filter((line) => line.trim() !== "");

  return (
    <div className="space-y-0 px-1" dir="rtl">
      {lines.map((line, index) =>
        renderVerseLine(line, index, className, "ARABIC", true),
      )}
    </div>
  );
};

export const formatLatinText = (text: string, fontLevel: number) => {
  const className = `${fontSizes.LATIN[fontLevel]} font-serif tracking-wide leading-relaxed`;
  const lines = text.split("\n").filter((line) => line.trim() !== "");

  return (
    <div className="space-y-0 px-1" dir="ltr">
      {lines.map((line, index) =>
        renderVerseLine(line, index, className, "LATIN", false),
      )}
    </div>
  );
};

export const formatMeaningText = (text: string, fontLevel: number) => {
  const className = `${fontSizes.MEANING[fontLevel]} font-sans leading-relaxed`;
  const lines = text.split("\n").filter((line) => line.trim() !== "");

  return (
    <div className="space-y-0 px-1" dir="ltr">
      {lines.map((line, index) =>
        renderVerseLine(line, index, className, "MEANING", false),
      )}
    </div>
  );
};

// Uhud/Bedir Listeleri için
export const renderUhudList = (
  text: string,
  mode: "ARABIC" | "LATIN" | "MEANING",
  fontLevel: number,
  label: string | number,
) => {
  if (!text) return null;

  let fontSizeClass = "";
  if (mode === "ARABIC") fontSizeClass = fontSizes.ARABIC[fontLevel];
  else if (mode === "LATIN") fontSizeClass = fontSizes.LATIN[fontLevel];
  else fontSizeClass = fontSizes.MEANING[fontLevel];

  const containerClass = "flex items-start gap-4 w-full";
  const textClass =
    mode === "ARABIC"
      ? `font-serif leading-loose text-right w-full ${fontSizeClass}`
      : `font-serif leading-loose text-left w-full ${fontSizeClass} text-gray-700 dark:text-gray-300`;

  return (
    <div className="py-3 px-2 w-full border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors rounded-lg">
      <div className={containerClass}>
        <div className="shrink-0 flex items-center justify-center min-w-[2.5rem] w-auto h-8 px-3 rounded-full bg-emerald-600/10 text-emerald-600 border border-emerald-600/20 font-black text-[10px] md:text-xs uppercase tracking-wide mt-1 whitespace-nowrap dark:bg-emerald-500/20 dark:text-emerald-400 shadow-sm">
          {label}
        </div>
        <div className={textClass}>{text}</div>
      </div>
    </div>
  );
};

export const formatStyledText = (
  text: string,
  mode: "LATIN" | "MEANING",
  fontLevel: number,
) => {
  if (mode === "LATIN") return formatLatinText(text, fontLevel);
  return formatMeaningText(text, fontLevel);
};

export const decorateArabicNumbers = (text: string) => text;
