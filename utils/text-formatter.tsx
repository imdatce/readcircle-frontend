import React from "react";

export const fontSizes = {
  ARABIC: [
    "text-xl",
    "text-2xl",
    "text-3xl",
    "text-4xl",
    "text-5xl",
    "text-6xl",
    "text-7xl",
    "text-8xl",
    "text-9xl",
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

// Arapça sayıları dini motifli parantez içine alan fonksiyon
export const decorateArabicNumbers = (text: string) => {
  if (!text) return "";

  // Metindeki tüm sayıları bul (Arapça veya Latin rakamları)
  return text.replace(/(\d+)/g, (match) => {
    // Rakamları Arapça karşılıklarına çevir (0->٠, 1->١ ...)
    const arabicDigits = match.replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[parseInt(d)]);

    // Kur'an ayet sonu parantezi (U+06DD ve U+FD3E/FD3F benzeri karakterler)
    // En yaygın ve temiz görünen stil: ﴾ ١ ﴿
    return ` ﴾${arabicDigits}﴿ `;
  });
};

// --- YARDIMCI: Metni Satırlara Bölüp Paragraf Yapan Fonksiyon ---
const renderTextAsParagraphs = (
  text: string,
  className: string,
  isRtl: boolean = false,
) => {
  if (!text) return null;
  const lines = text.split("\n").filter((line) => line.trim() !== "");

  if (lines.length === 0) return null;

  return (
    <div className="space-y-6">
      {lines.map((line, index) => (
        <p key={index} className={className} dir={isRtl ? "rtl" : "ltr"}>
          {line}
        </p>
      ))}
    </div>
  );
};

// --- KART GÖRÜNÜMÜ RENDER FONKSİYONU ---
export const renderUhudList = (
  text: string,
  mode: "ARABIC" | "LATIN" | "MEANING",
  fontLevel: number,
  label: string | number,
) => {
  if (!text) return null;

  // Font seçimi
  let fontSizeClass = "";
  if (mode === "ARABIC") fontSizeClass = fontSizes.ARABIC[fontLevel];
  else if (mode === "LATIN") fontSizeClass = fontSizes.LATIN[fontLevel];
  else fontSizeClass = fontSizes.MEANING[fontLevel];

  // HİZALAMA MANTIĞI (DÜZELTİLDİ)
  // flex-row-reverse KALDIRILDI.
  // dir="rtl" olan yerde (Arapça) flex-row zaten sağdan başlar (Numara sağda).
  // dir="ltr" olan yerde (Latin) flex-row soldan başlar (Numara solda).
  const containerClass = "flex items-start gap-4 w-full";

  // Metin Hizalama
  const textClass =
    mode === "ARABIC"
      ? `font-serif leading-loose text-right w-full ${fontSizeClass}`
      : `font-serif leading-loose text-left w-full ${fontSizeClass} text-gray-700 dark:text-gray-300`;

  return (
    <div className="py-2 px-1 w-full">
      <div className={containerClass}>
        {/* ETİKET ROZETİ (Ayet No / Sıra No) */}
        {/* shrink-0: Metin uzun olsa bile rozet küçülmesin */}
        <div className="shrink-0 flex items-center justify-center min-w-[2.5rem] w-auto h-8 px-3 rounded-full bg-emerald-600/10 text-emerald-600 border border-emerald-600/20 font-black text-[10px] md:text-xs uppercase tracking-wide mt-1 whitespace-nowrap dark:bg-emerald-500/20 dark:text-emerald-400">
          {label}
        </div>
        {/* METİN */}
        <div className={textClass}>{text}</div>
      </div>
    </div>
  );
};
export const formatArabicText = (text: string, fontLevel: number) => {
  const className = `${fontSizes.ARABIC[fontLevel]} leading-loose`;
  return renderTextAsParagraphs(text, className, true);
};

export const formatLatinText = (text: string, fontLevel: number) => {
  const className = `${fontSizes.LATIN[fontLevel]} leading-relaxed`;
  return renderTextAsParagraphs(text, className, false);
};

export const formatMeaningText = (text: string, fontLevel: number) => {
  const className = `${fontSizes.MEANING[fontLevel]} leading-loose text-gray-700 dark:text-gray-300`;
  return renderTextAsParagraphs(text, className, false);
};

export const formatStyledText = (
  text: string,
  mode: "LATIN" | "MEANING",
  fontLevel: number,
) => {
  const size =
    mode === "LATIN"
      ? fontSizes.LATIN[fontLevel]
      : fontSizes.MEANING[fontLevel];
  const className = `${size} leading-loose`;
  return renderTextAsParagraphs(text, className, false);
};
