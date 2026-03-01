/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
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

const SUBHANEKE_RE =
  /(s[üu]bh[âa]neke|سُبْحَانَكَ|سبحانك|glory|praise|noksan|münezzeh|sübhânsın|seni her türlü|seni bütün|seni tenzih|sen aczden)/i;

// === 1. ARAPÇA PARSER ===
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
  if (parts.length > 10) header = parts.shift() || "";

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

// === 3. TÜRKÇE & MEAL PARSER ===
function parseMeaningEn(raw: string) {
  const lines = raw
    .replace(/###\s*$/, "")
    .trim()
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l !== "");
  let Praise = "";

  const subhIdx = lines.findIndex((l) => SUBHANEKE_RE.test(l));
  if (subhIdx >= 0) {
    Praise = lines.splice(subhIdx).join(" ");
  }

  const items = lines
    .map((l) =>
      l.replace(/^[\(\[\{]?[\d\u0660-\u0669]+[\)\]\}\.\-\s]+/, "").trim(),
    )
    .filter((l) => l.length > 0);

  return { header: "", items, Praise };
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

// === UI BİLEŞENLERİ ===
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
}: any) => {
  const cellClass =
    "flex items-center gap-3 py-2 px-2 border-b border-amber-900/10 dark:border-amber-100/10 hover:bg-amber-50/60 dark:hover:bg-amber-900/15 rounded-xl transition-colors group";
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
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>("ARABIC");

  const [texts, setTexts] = useState<Record<TabType, string>>({
    ARABIC: "",
    LATIN: "",
    MEANING: "",
  });
  const [loading, setLoading] = useState(false);
  const [fontLevel, setFontLevel] = useState(3);

  // === YENİ ÖZELLİK STATELERİ ===
  const [isSepia, setIsSepia] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [autoScrollSpeed, setAutoScrollSpeed] = useState(1);
  const [barVisible, setBarVisible] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Sekmeler dil değiştiğinde güncellenecek şekilde useMemo içine alındı
  const TABS: { id: TabType; label: string }[] = useMemo(
    () => [
      { id: "ARABIC", label: t("tabArabic") || "Arapça" },
      { id: "LATIN", label: t("tabLatin") || "Okunuşu" },
      { id: "MEANING", label: t("tabMeaning") || "Türkçe" },
    ],
    [t],
  );

  // Wake Lock API
  const wakeLockRef = useRef<any>(null);
  useEffect(() => {
    const requestWakeLock = async () => {
      try {
        if ("wakeLock" in navigator)
          wakeLockRef.current = await (navigator as any).wakeLock.request(
            "screen",
          );
      } catch (err) {
        console.error(`Wake Lock hatası:`, err);
      }
    };
    const releaseWakeLock = () => {
      if (wakeLockRef.current !== null) {
        wakeLockRef.current.release().then(() => {
          wakeLockRef.current = null;
        });
      }
    };
    requestWakeLock();
    return () => releaseWakeLock();
  }, []);

  useEffect(() => {
    const fetchCevsenData = async () => {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

      // Seçili dile göre meal dosyasının ismini belirliyoruz
      let meaningFileName = "cevsen_tr.txt";
      if (language === "en") {
        meaningFileName = "cevsen_en.txt";
      }

      const urls: Record<TabType, string> = {
        ARABIC: `${apiUrl}/cevsen.txt`,
        LATIN: `${apiUrl}/cevsen_latin.txt`,
        MEANING: `${apiUrl}/${meaningFileName}`, // Dinamik hale getirdik
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
  }, [language]);

  // Oto-Kaydırma
  useEffect(() => {
    if (!isAutoScrolling) return;

    let animationFrameId: number;
    let lastTime: number | null = null;
    const scroller = isFullscreen ? scrollContainerRef.current : window;
    if (!scroller) return;

    let exactScrollY =
      isFullscreen && scrollContainerRef.current
        ? scrollContainerRef.current.scrollTop
        : window.scrollY;
    const baseSpeed = 40;

    const scrollStep = (timestamp: number) => {
      if (lastTime === null) lastTime = timestamp;
      const deltaTime = timestamp - lastTime;
      lastTime = timestamp;

      if (deltaTime > 0 && deltaTime < 100) {
        const moveBy = (baseSpeed * autoScrollSpeed * deltaTime) / 1000;
        exactScrollY += moveBy;

        const maxScroll =
          isFullscreen && scrollContainerRef.current
            ? scrollContainerRef.current.scrollHeight -
              scrollContainerRef.current.clientHeight
            : document.documentElement.scrollHeight - window.innerHeight;

        if (exactScrollY >= maxScroll - 1) {
          if (isFullscreen && scrollContainerRef.current)
            scrollContainerRef.current.scrollTo({
              top: maxScroll,
              behavior: "auto",
            });
          else window.scrollTo({ top: maxScroll, behavior: "auto" });
          setIsAutoScrolling(false);
          return;
        }

        if (isFullscreen && scrollContainerRef.current)
          scrollContainerRef.current.scrollTo({
            top: exactScrollY,
            behavior: "auto",
          });
        else window.scrollTo({ top: exactScrollY, behavior: "auto" });
      }
      animationFrameId = requestAnimationFrame(scrollStep);
    };

    animationFrameId = requestAnimationFrame(scrollStep);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isAutoScrolling, autoScrollSpeed, isFullscreen]);

  // Manuel kaydırmada oto-kaydırmayı durdur
  useEffect(() => {
    const handleInteraction = (e: Event) => {
      if (isAutoScrolling) {
        if (e.target instanceof Element && e.target.closest("button, a, input"))
          return;
        if (e.type === "wheel" && Math.abs((e as WheelEvent).deltaY) > 10)
          setIsAutoScrolling(false);
        else if (e.type === "touchstart" || e.type === "touchmove")
          setIsAutoScrolling(false);
      }
    };
    window.addEventListener("wheel", handleInteraction, { passive: true });
    window.addEventListener("touchstart", handleInteraction, { passive: true });
    window.addEventListener("touchmove", handleInteraction, { passive: true });
    return () => {
      window.removeEventListener("wheel", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
      window.removeEventListener("touchmove", handleInteraction);
    };
  }, [isAutoScrolling]);

  const cycleSpeed = () => {
    const speeds = [0.5, 1, 1.5, 2, 3];
    const nextIdx = (speeds.indexOf(autoScrollSpeed) + 1) % speeds.length;
    setAutoScrollSpeed(speeds[nextIdx]);
    if (typeof navigator !== "undefined" && navigator.vibrate)
      navigator.vibrate(15);
  };

  const getAllBabs = (fullText: string) => {
    if (!fullText) return [];

    // Metin içinde ### varsa, doğrudan en temiz yöntem olarak ondan bölelim
    if (fullText.includes("###")) {
      return fullText
        .split(/###/g)
        .map((chunk) => chunk.trim())
        .filter((chunk) => chunk !== "");
    }

    // Eğer ### yoksa eski yöntemle satır satır okuyup bölme
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
      )
        continue;
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

    const rows: Array<[string, string | null]> = [];
    for (let i = 0; i < items.length; i += 2)
      rows.push([items[i], items[i + 1] ?? null]);

    return (
      <div
        key={babNumber}
        className="mb-16 scroll-mt-24"
        id={`bab-${babNumber}`}
      >
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="h-[2px] bg-gradient-to-r from-transparent to-amber-300 dark:to-amber-700 w-16 md:w-32 rounded-full"></div>
          <h2 className="font-serif text-xl md:text-3xl font-black text-amber-700 dark:text-amber-500 tracking-widest drop-shadow-sm">
            {t("babWord") || "BÂB"} {babNumber}
          </h2>
          <div className="h-[2px] bg-gradient-to-l from-transparent to-amber-300 dark:to-amber-700 w-16 md:w-32 rounded-full"></div>
        </div>

        <div
          className={`relative rounded-[2rem] shadow-2xl max-w-5xl mx-auto overflow-hidden animate-in fade-in zoom-in-95 duration-500 transition-colors ${isSepia ? "bg-[#fdf9f2]" : "bg-[#fdf9f2] dark:bg-[#0f1117]"}`}
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
              {subhaneke && (
                <div className="mt-8 pt-6 border-t-2 border-dashed border-red-700/20 dark:border-red-500/25 text-center relative">
                  <span
                    className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 text-red-700/30 dark:text-red-500/35 text-xl select-none transition-colors ${isSepia ? "bg-[#fdf9f2]" : "bg-[#fdf9f2] dark:bg-[#0f1117]"}`}
                  >
                    ۞
                  </span>
                  <p
                    className={`font-serif font-black leading-[2.6] tracking-wide text-red-700 dark:text-red-500 ${activeTab === "ARABIC" ? fontClass : activeTab === "LATIN" ? `italic ${fontSizes.LATIN[fontLevel]}` : fontSizes.MEANING[fontLevel]}`}
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
  const lastScrollY = React.useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY < 80) setBarVisible(true);
      else if (currentY > lastScrollY.current + 8) setBarVisible(false);
      else if (currentY < lastScrollY.current - 8) setBarVisible(true);
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleContentClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button, a, input")) return;
    setIsFullscreen(!isFullscreen);
  };

  const isHeaderVisible = barVisible && !isFullscreen;

  return (
    <div
      ref={scrollContainerRef}
      onClick={handleContentClick}
      className={`font-sans transition-colors duration-500 px-2 sm:px-6 lg:px-8 ${!isAutoScrolling ? "scroll-smooth" : "scroll-auto"} ${isFullscreen ? "fixed inset-0 z-[9999] overflow-y-auto py-8" : "min-h-screen py-8"} ${isSepia ? "sepia-theme bg-[#F4ECD8]" : "bg-[#F8FAFC] dark:bg-gray-950"}`}
    >
      <div className="max-w-5xl mx-auto space-y-6">
        <div
          className={`flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl p-4 sm:p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 sticky top-4 z-50 transition-all duration-300 ${isHeaderVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-6 pointer-events-none"}`}
        >
          <div className="flex items-center gap-4">
            <Link
              href="/resources"
              className="p-3 bg-gray-50 dark:bg-gray-800 text-gray-500 hover:text-amber-600 dark:hover:text-amber-400 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95 shrink-0"
              title={t("backToResources") || "Kütüphaneye Dön"}
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
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-none flex items-center gap-3">
              {t("cevsenTitle") || "Cevşen-i Kebir"}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl shrink-0">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 sm:px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 ${activeTab === tab.id ? "bg-white dark:bg-gray-700 text-amber-600 dark:text-amber-400 shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl shrink-0">
              <button
                onClick={() => setFontLevel((prev) => Math.max(0, prev - 1))}
                disabled={fontLevel === 0}
                title={t("decreaseFont") || "Yazıyı Küçült"}
                className="w-8 h-8 flex items-center justify-center hover:bg-white dark:hover:bg-gray-700 rounded-lg disabled:opacity-30 transition font-serif font-bold text-gray-600 dark:text-gray-300 text-xs shadow-sm"
              >
                A-
              </button>
              <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1"></div>
              <button
                onClick={() => setFontLevel((prev) => Math.min(6, prev + 1))}
                disabled={fontLevel === 6}
                title={t("increaseFont") || "Yazıyı Büyüt"}
                className="w-8 h-8 flex items-center justify-center hover:bg-white dark:hover:bg-gray-700 rounded-lg disabled:opacity-30 transition font-serif font-bold text-gray-600 dark:text-gray-300 text-base shadow-sm"
              >
                A+
              </button>
              <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1"></div>
              <button
                onClick={() => {
                  setIsSepia(!isSepia);
                  if (typeof navigator !== "undefined" && navigator.vibrate)
                    navigator.vibrate(20);
                }}
                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-300 ${isSepia ? "bg-[#432C0A]/10 text-[#432C0A] shadow-inner" : "hover:bg-white dark:hover:bg-gray-700 text-amber-600 dark:text-amber-500 hover:text-amber-800"}`}
                title={t("eyeProtection") || "Okuma Modu (Sepya)"}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
              <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1"></div>
              <button
                onClick={cycleSpeed}
                className="w-8 h-8 flex items-center justify-center rounded-lg font-bold text-[10px] hover:bg-white dark:hover:bg-gray-700 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                title={t("scrollSpeed") || "Kaydırma Hızı"}
              >
                {autoScrollSpeed}x
              </button>
              <button
                onClick={() => {
                  setIsAutoScrolling((prev) => !prev);
                  if (typeof navigator !== "undefined" && navigator.vibrate)
                    navigator.vibrate(20);
                }}
                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-300 ${isAutoScrolling ? "bg-blue-600/15 text-blue-600 dark:text-blue-400 shadow-inner" : "hover:bg-white dark:hover:bg-gray-700 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400"}`}
                title={
                  isAutoScrolling
                    ? t("stopAutoScroll") || "Durdur"
                    : t("startAutoScroll") || "Oynat"
                }
              >
                {isAutoScrolling ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M6 6h4v12H6zm8 0h4v12h-4z" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>
              <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1"></div>
              <button
                onClick={() => {
                  setIsFullscreen(!isFullscreen);
                  if (typeof navigator !== "undefined" && navigator.vibrate)
                    navigator.vibrate(20);
                }}
                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-300 ${isFullscreen ? "bg-blue-600/15 text-blue-600 dark:text-blue-400 shadow-inner" : "hover:bg-white dark:hover:bg-gray-700 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"}`}
                title={t("fullscreen") || "Tam Ekran"}
              >
                {isFullscreen ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-transparent relative overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-amber-500 bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="w-12 h-12 border-4 border-current border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="font-bold animate-pulse tracking-widest uppercase text-sm">
                {t("compilingTexts") || "Metinler Derleniyor..."}
              </p>
            </div>
          ) : (
            <div className="w-full pb-20">
              {allBabs.map((babText, index) =>
                renderBabCard(babText, index + 1),
              )}
              <div className="mt-10 text-center opacity-50">
                <p className="text-sm font-bold text-gray-400 tracking-[0.3em] uppercase">
                  {t("endOfCevsen") || "Cevşen-i Kebir'in Sonu"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
