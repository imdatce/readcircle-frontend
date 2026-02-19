import React from "react";

export const fontSizes = {
  ARABIC: [
    "text-base md:text-xl",
    "text-lg md:text-2xl",
    "text-xl md:text-3xl",
    "text-2xl md:text-4xl",
    "text-3xl md:text-5xl",
    "text-4xl md:text-6xl",
    "text-5xl md:text-7xl",
    "text-6xl md:text-8xl",
    "text-7xl md:text-9xl",
  ],
  LATIN: [
    "text-xs md:text-sm",
    "text-sm md:text-base",
    "text-base md:text-lg",
    "text-lg md:text-xl",
    "text-xl md:text-2xl",
    "text-2xl md:text-3xl",
    "text-3xl md:text-4xl",
    "text-4xl md:text-5xl",
    "text-5xl md:text-6xl",
  ],
  MEANING: [
    "text-[10px] md:text-xs",
    "text-xs md:text-sm",
    "text-sm md:text-base",
    "text-base md:text-lg",
    "text-lg md:text-xl",
    "text-xl md:text-2xl",
    "text-2xl md:text-3xl",
    "text-3xl md:text-4xl",
    "text-4xl md:text-5xl",
  ],
};

const toArabicNumerals = (num: string | number) => {
  const digits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return num.toString().replace(/\d/g, (d) => digits[parseInt(d)]);
};

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

const renderVerseLine = (
  line: string,
  index: number,
  className: string,
  mode: "ARABIC" | "LATIN" | "MEANING",
  isRtl: boolean,
) => {
  const cleanLine = line.trim();
  if (!cleanLine) return null;

  const match = cleanLine.match(/^(\d+)\.\s+(.*)/);

  let verseNum = "";
  let verseText = cleanLine;

  if (match) {
    verseNum = match[1];
    verseText = match[2];
  }
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

        {verseNum && (
          <span className="inline-flex items-center justify-center min-w-[30px] h-[30px] px-1 mx-1.5 align-middle select-none">
            <span className="flex items-center justify-center w-full h-full border border-gray-400 dark:border-gray-500 rounded-full text-[0.6em] opacity-80">
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
      </p>
    </div>
  );
};

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

export const renderCevsenGrid = (text: string, fontLevel: number) => {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 3) {
    return (
      <div
        className={`font-serif leading-[2.4] py-2 ${fontSizes.ARABIC[fontLevel]}`}
      >
        {text}
      </div>
    );
  }

  const lastLine = lines.pop();

  return (
    <div
      className="bg-[#fcfbf9] dark:bg-[#12141a] border-[8px] border-double border-amber-800/20 dark:border-amber-500/20 p-4 md:p-8 rounded-[2rem] shadow-xl max-w-5xl mx-auto my-4 relative overflow-hidden"
      dir="rtl"
    >
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage:
            "url('https://www.transparenttextures.com/patterns/arabesque.png')",
        }}
      ></div>

      <div className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-6 text-center">
          {lines.map((line, index) => {
            const cleanLine = line.replace(/^[\d١-٩]+[\-\.]?\s*/, "");

            return (
              <div
                key={index}
                className="flex items-center justify-between border-b border-amber-900/10 dark:border-amber-100/10 pb-3 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors px-3 rounded-xl group"
              >
                <span className="relative flex items-center justify-center w-10 h-10 md:w-12 md:h-12 shrink-0">
                  <svg
                    className="absolute inset-0 w-full h-full text-amber-700/80 dark:text-amber-500/80 drop-shadow-md"
                    viewBox="0 0 100 100"
                  >
                    <path
                      fill="currentColor"
                      d="M50 5 L60 25 L80 20 L75 40 L95 50 L75 60 L80 80 L60 75 L50 95 L40 75 L20 80 L25 60 L5 50 L25 40 L20 20 L40 25 Z"
                    ></path>
                    <circle
                      cx="50"
                      cy="50"
                      r="28"
                      fill="none"
                      stroke="#fff"
                      strokeWidth="2"
                      opacity="0.5"
                    ></circle>
                  </svg>
                  <span className="relative z-10 text-white font-bold text-sm md:text-base drop-shadow-md font-sans">
                    {index + 1}
                  </span>
                </span>

                <span
                  className={`font-serif flex-1 text-gray-900 dark:text-gray-100 px-4 ${fontSizes.ARABIC[fontLevel]} leading-[2.4] drop-shadow-sm`}
                >
                  {cleanLine}
                </span>

                <span className="text-amber-600/30 dark:text-amber-400/30 text-lg select-none opacity-50 group-hover:opacity-100 transition-opacity">
                  ❖
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-10 pt-8 border-t-[3px] border-dashed border-red-800/20 dark:border-red-500/30 text-center relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#fcfbf9] dark:bg-[#12141a] px-4">
            <span className="text-red-800/30 dark:text-red-500/40 text-2xl">
              ۞
            </span>
          </div>
          <p
            className={`font-serif font-black text-red-700 dark:text-red-500 leading-[2.6] ${fontSizes.ARABIC[fontLevel]} tracking-wide drop-shadow-sm`}
          >
            {lastLine}
          </p>
        </div>
      </div>
    </div>
  );
};

export const decorateArabicNumbers = (text: string) => text;
