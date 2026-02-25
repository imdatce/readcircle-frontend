/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

// === TİPLER VE GEREKSİNİMLER ===
type TabType = "ARABIC" | "LATIN" | "MEANING";

const fontSizes = {
  ARABIC: [
    "text-xl",
    "text-2xl",
    "text-3xl",
    "text-4xl",
    "text-5xl",
    "text-6xl",
    "text-7xl",
  ],
  LATIN: [
    "text-sm",
    "text-base",
    "text-lg",
    "text-xl",
    "text-2xl",
    "text-3xl",
    "text-4xl",
  ],
  MEANING: [
    "text-xs",
    "text-sm",
    "text-base",
    "text-lg",
    "text-xl",
    "text-2xl",
    "text-3xl",
  ],
};

// Ortak Sübhâneke Yakalayıcı (TÜRKÇE İÇİN "sen aczden" EKLENDİ)
const SUBHANEKE_RE =
  /(s[üu]bh[âa]neke|سُبْحَانَكَ|سبحانك|glory|noksan|münezzeh|sübhânsın|seni her türlü|seni bütün|seni tenzih|sen aczden)/i;

// === 1. ARAPÇA PARSER (ReadingModal ile birebir aynı) ===
function parseArabic(raw: string) {
  const text = raw.replace(/###\s*$/, "").trim();
  const parts = text
    .split(/[\u0660-\u0669]+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
    
  if (parts.length < 2) return { header: "", items: [text], subhaneke: "" };
  
  const subhaneke = SUBHANEKE_RE.test(parts[parts.length - 1])
    ? parts.pop()!
    : "";
    
  let header = "";
  const items = [...parts];
  
  if (items[0]?.includes("بِسْمِ") || items[0]?.includes("اَللّٰهُمَّ")) {
    const lastYaIdx = items[0].lastIndexOf("يَا");
    if (lastYaIdx > 10) {
      header = items[0].slice(0, lastYaIdx).trim();
      items[0] = items[0].slice(lastYaIdx).trim();
    }
  }
  
  return { header, items, subhaneke };
}

// === 2. LATİNCE PARSER ===
function parseLatin(raw: string) {
  const text = raw.replace(/###\s*$/, "").trim();
  const match = text.match(SUBHANEKE_RE);
  let subhaneke = "";
  let mainText = text;

  if (match && match.index !== undefined) {
    subhaneke = text.slice(match.index).trim();
    mainText = text.slice(0, match.index).trim();
  }

  const parts = mainText
    .split(/\s+\d{1,2}[\.\-\)\s]+(?=[A-ZÂÎÛÜÖ])/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  let header = "";
  if (parts.length > 10) {
    header = parts.shift() || "";
  }

  return { header, items: parts, subhaneke };
}

// === 3. TÜRKÇE & MEAL PARSER ===
function parseMeaning(raw: string) {
  const lines = raw
    .replace(/###\s*$/, "")
    .trim()
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l !== "");
  let subhaneke = "";

  const subhIdx = lines.findIndex((l) => SUBHANEKE_RE.test(l));
  if (subhIdx >= 0) {
    subhaneke = lines.splice(subhIdx).join(" ");
  }

  const items = lines
    .map((l) =>
      l.replace(/^[\(\[\{]?[\d\u0660-\u0669]+[\)\]\}\.\-\s]+/, "").trim(),
    )
    .filter((l) => l.length > 0);

  return { header: "", items, subhaneke };
}

// Arapça rakamlara dönüştürme
const toArabicNumeral = (num: number) => {
  const arabicNumbers = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return num
    .toString()
    .split("")
    .map((digit) => arabicNumbers[parseInt(digit)])
    .join("");
};

// === UI BİLEŞENLERİ (ReadingModal'dan Uyarlandı) ===
const Medal = ({ number, isArabic }: { number: number; isArabic: boolean }) => (
  <span className="relative flex items-center justify-center shrink-0 w-9 h-9 md:w-11 md:h-11">
    <svg
      className="absolute inset-0 w-full h-full text-amber-700/80 dark:text-amber-500/80 drop-shadow"
      viewBox="0 0 100 100"
    >
      <path
        fill="currentColor"
        d="M50 5 L55 30 L75 15 L65 38 L92 38 L73 55 L85 80 L62 68 L50 95 L38 68 L15 80 L27 55 L8 38 L35 38 L25 15 L45 30 Z"
      />
      <circle
        cx="50"
        cy="50"
        r="25"
        fill="none"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="1.5"
      />
    </svg>
    <span className="relative z-10 text-white font-bold text-[11px] md:text-sm drop-shadow font-sans leading-none mt-px">
      {isArabic ? toArabicNumeral(number) : number}
    </span>
  </span>
);

const DecoStar = () => (
  <span className="text-amber-400/30 text-xs select-none opacity-0 group-hover:opacity-100 transition-opacity mt-1 shrink-0">
    ✦
  </span>
);

const GridRow = ({
  right,
  left,
  rightNum,
  leftNum,
  fontClass,
  isRtl,
  mode,
}: {
  right: string;
  left: string | null;
  rightNum: number;
  leftNum: number;
  fontClass: string;
  isRtl: boolean;
  mode: TabType;
}) => {
  const cellClass =
    "flex items-center gap-3 py-2 px-2 border-b border-amber-900/10 dark:border-amber-100/10 " +
    "hover:bg-amber-50/60 dark:hover:bg-amber-900/15 rounded-xl transition-colors group";
  const textClass = [
    "flex-1 font-serif",
    mode === "ARABIC"
      ? `leading-[2.3] text-gray-900 dark:text-gray-100 ${fontClass}`
      : mode === "LATIN"
        ? `leading-loose text-gray-800 dark:text-gray-200 ${fontClass}`
        : `leading-relaxed text-gray-700 dark:text-gray-300 ${fontClass}`,
  ].join(" ");

  return (
    <React.Fragment>
      <div className={cellClass} dir={isRtl ? "rtl" : "ltr"}>
        <Medal number={rightNum} isArabic={isRtl} />
        <span className={textClass}>{right}</span>
        <DecoStar />
      </div>
      {left ? (
        <div className={cellClass} dir={isRtl ? "rtl" : "ltr"}>
          <Medal number={leftNum} isArabic={isRtl} />
          <span className={textClass}>{left}</span>
          <DecoStar />
        </div>
      ) : (
        <div />
      )}
    </React.Fragment>
  );
};

// ================================================================
// ANA SAYFA BİLEŞENİ
// ================================================================
export default function CevsenPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>("ARABIC");

  const [texts, setTexts] = useState<Record<TabType, string>>({
    ARABIC: "",
    LATIN: "",
    MEANING: "",
  });
  const [loading, setLoading] = useState(false);
  const [fontLevel, setFontLevel] = useState(3);

  const TABS: { id: TabType; label: string }[] = [
    { id: "ARABIC", label: "Arapça" },
    { id: "LATIN", label: "Okunuşu" },
    { id: "MEANING", label: "Türkçe" },
  ];

  useEffect(() => {
    const fetchCevsenData = async () => {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

      const urls: Record<TabType, string> = {
        ARABIC: `${apiUrl}/cevsen.txt`,
        LATIN: `${apiUrl}/cevsen_latin.txt`,
        MEANING: `${apiUrl}/cevsen_tr.txt`,
      };

      try {
        const fetchedTexts = { ...texts };
        await Promise.all(
          (Object.keys(urls) as TabType[]).map(async (key) => {
            try {
              const res = await fetch(urls[key as TabType]);
              if (res.ok) fetchedTexts[key as TabType] = await res.text();
            } catch (err) {}
          }),
        );
        setTexts(fetchedTexts);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchCevsenData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getAllBabs = (fullText: string) => {
    if (!fullText) return [];

    const lines = fullText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l !== "");
    const chunks: string[] = [];
    let currentChunk: string[] = [];

    for (const line of lines) {
      if (
        line.length <= 25 &&
        /^[\-\=\*\s]*((b[aâ]b|bölüm|chapter|الباب)?\s*[\d\u0660-\u0669]+)[\.\-\=\*\s]*$/i.test(
          line,
        )
      ) {
        continue;
      }
      currentChunk.push(line);
      if (SUBHANEKE_RE.test(line)) {
        chunks.push(currentChunk.join("\n"));
        currentChunk = [];
      }
    }
    if (currentChunk.length > 0) chunks.push(currentChunk.join("\n"));

    return chunks;
  };

  const renderBabCard = (rawText: string, babNumber: number) => {
    let parsed;
    if (activeTab === "ARABIC") parsed = parseArabic(rawText);
    else if (activeTab === "LATIN") parsed = parseLatin(rawText);
    else parsed = parseMeaning(rawText);

    const { header, items, subhaneke } = parsed;
    const isRtl = activeTab === "ARABIC";
    const fontClass =
      activeTab === "ARABIC"
        ? fontSizes.ARABIC[fontLevel]
        : activeTab === "LATIN"
          ? fontSizes.LATIN[fontLevel]
          : fontSizes.MEANING[fontLevel];

    // Öğeleri Modal'daki gibi 2'li satırlar (Grid) haline getiriyoruz
    const rows: Array<[string, string | null]> = [];
    for (let i = 0; i < items.length; i += 2) {
      rows.push([items[i], items[i + 1] ?? null]);
    }

    return (
      <div
        key={babNumber}
        className="mb-16 scroll-mt-24"
        id={`bab-${babNumber}`}
      >
        {/* Bâb Başlığı */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="h-[2px] bg-gradient-to-r from-transparent to-amber-300 dark:to-amber-700 w-16 md:w-32 rounded-full"></div>
          <h2 className="font-serif text-xl md:text-3xl font-black text-amber-700 dark:text-amber-500 tracking-widest drop-shadow-sm">
            BÂB {babNumber}
          </h2>
          <div className="h-[2px] bg-gradient-to-l from-transparent to-amber-300 dark:to-amber-700 w-16 md:w-32 rounded-full"></div>
        </div>

        {/* Ana Okuma Kartı */}
        <div
          className="relative bg-[#fdf9f2] dark:bg-[#0f1117] rounded-[2rem] shadow-2xl max-w-5xl mx-auto overflow-hidden animate-in fade-in zoom-in-95 duration-500"
          dir={isRtl ? "rtl" : "ltr"}
        >
          <div className="m-3 rounded-[1.5rem] border-[6px] border-double border-amber-800/25 dark:border-amber-600/25 p-4 md:p-8 relative z-10">
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.04] dark:opacity-[0.03]"
              style={{
                backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(180,120,40,0.15) 20px, rgba(180,120,40,0.15) 21px)`,
              }}
            />

            <div className="relative z-10">
              {/* Header */}
              {header && (
                <div className="mb-6 text-center">
                  <p
                    className={`font-serif text-amber-900 dark:text-amber-400 leading-[2.4] ${fontClass}`}
                    dir={isRtl ? "rtl" : "ltr"}
                  >
                    {header}
                  </p>
                  <div className="mx-auto mt-3 w-48 h-[2px] bg-gradient-to-r from-transparent via-amber-700/40 dark:via-amber-500/40 to-transparent rounded-full" />
                </div>
              )}

              {/* Liste (GridRow formatı - 2 Sütun) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                {rows.map((row, i) => (
                  <GridRow
                    key={i}
                    right={row[0]}
                    left={row[1]}
                    rightNum={i * 2 + 1}
                    leftNum={i * 2 + 2}
                    fontClass={fontClass}
                    isRtl={isRtl}
                    mode={activeTab}
                  />
                ))}
              </div>

              {/* Sübhâneke */}
              {subhaneke && (
                <div className="mt-8 pt-6 border-t-2 border-dashed border-red-700/20 dark:border-red-500/25 text-center relative">
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#fdf9f2] dark:bg-[#0f1117] px-3 text-red-700/30 dark:text-red-500/35 text-xl select-none">
                    ۞
                  </span>
                  <p
                    className={`font-serif font-black leading-[2.6] tracking-wide text-red-700 dark:text-red-500 ${
                      activeTab === "ARABIC"
                        ? fontClass
                        : activeTab === "LATIN"
                          ? `italic ${fontSizes.LATIN[fontLevel]}`
                          : fontSizes.MEANING[fontLevel]
                    }`}
                    dir={isRtl ? "rtl" : "ltr"}
                  >
                    {subhaneke}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const allBabs = getAllBabs(texts[activeTab]);

  // Hide on scroll down, show on scroll up
  const [barVisible, setBarVisible] = useState(true);
  const lastScrollY = React.useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY < 80) {
        setBarVisible(true);
      } else if (currentY > lastScrollY.current + 8) {
        setBarVisible(false);
      } else if (currentY < lastScrollY.current - 8) {
        setBarVisible(true);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-gray-950 py-8 px-2 sm:px-6 lg:px-8 font-sans scroll-smooth">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Üst Bar */}
        <div
          className={`flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl p-4 sm:p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 sticky top-4 z-50 transition-all duration-300 ${barVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-6 pointer-events-none"}`}
        >
          <div className="flex items-center gap-4">
            <Link
              href="/resources"
              className="p-3 bg-gray-50 dark:bg-gray-800 text-gray-500 hover:text-amber-600 dark:hover:text-amber-400 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95 shrink-0"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-none flex items-center gap-3">
                {t("cevsen") || "Cevşen-i Kebir"}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Sekmeler */}
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl shrink-0">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 sm:px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 ${
                    activeTab === tab.id
                      ? "bg-white dark:bg-gray-700 text-amber-600 dark:text-amber-400 shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl shrink-0">
                <button
                  onClick={() => setFontLevel((prev) => Math.max(0, prev - 1))}
                  disabled={fontLevel === 0}
                  className="w-10 h-10 flex items-center justify-center bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-amber-600 rounded-xl shadow-sm transition-colors font-bold text-sm disabled:opacity-30"
                >
                  A-
                </button>
                <button
                  onClick={() => setFontLevel((prev) => Math.min(6, prev + 1))}
                  disabled={fontLevel === 6}
                  className="w-10 h-10 flex items-center justify-center bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-amber-600 rounded-xl shadow-sm transition-colors font-bold text-lg disabled:opacity-30"
                >
                  A+
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* İçerik */}
        <div className="bg-transparent relative overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-amber-500 bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="w-12 h-12 border-4 border-current border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="font-bold animate-pulse tracking-widest uppercase text-sm">
                Metinler Derleniyor...
              </p>
            </div>
          ) : (
            <div className="w-full pb-20">
              {allBabs.map((babText, index) =>
                renderBabCard(babText, index + 1),
              )}
              <div className="mt-10 text-center opacity-50">
                <p className="text-sm font-bold text-gray-400 tracking-[0.3em] uppercase">
                  Cevşen-i Kebir'in Sonu
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
