/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { CevsenBab, ViewMode, DistributionSession } from "@/types";
import Zikirmatik from "../common/Zikirmatik";
import { useLanguage } from "@/context/LanguageContext";
import {
  formatArabicText,
  formatLatinText,
  formatMeaningText,
  formatStyledText,
  renderUhudList,
  fontSizes,
} from "@/utils/text-formatter";

export interface ReadingModalContent {
  title: string;
  type: "SIMPLE" | "CEVSEN" | "SALAVAT" | "QURAN" | "SURAS";
  simpleItems?: string[];
  cevsenData?: CevsenBab[];
  salavatData?: { arabic: string; transcript: string; meaning: string };
  isArabic?: boolean;
  startUnit?: number;
  codeKey?: string;
  endUnit?: number;
  currentUnit?: number;
  assignmentId?: number;
}

interface ReadingModalProps {
  content: ReadingModalContent;
  onClose: () => void;
  onUpdateContent: (newContent: ReadingModalContent | null) => void;
  session?: DistributionSession;
  userName: string | null;
  localCounts: Record<number, number>;
  onDecrementCount: (id: number) => void;
  t: (key: string) => string;
}

const EDITION_MAPPING: Record<string, string> = {
  tr: "tr.diyanet",
  en: "en.sahih",
  fr: "fr.hamidullah",
  de: "de.abullaimr",
  ru: "ru.kuliev",
  id: "id.indonesian",
  az: "az.mammadaliyev",
  ar: "ar.jalalayn",
  ku: "special_quranenc_kurmanji",
  kmr: "special_quranenc_kurmanji",
  default: "en.sahih",
};

async function fetchKurdishForPage(structureData: any) {
  try {
    const surahsOnPage = new Set<number>();
    structureData.forEach((ayah: any) => surahsOnPage.add(ayah.surah.number));
    const quranEncPromises = Array.from(surahsOnPage).map((surahNo) =>
      fetch(
        `https://quranenc.com/api/v1/translation/sura/kurmanji_ismail/${surahNo}`,
      )
        .then(async (res) => {
          if (!res.ok) throw new Error(`QuranEnc API error: ${res.status}`);
          return res.json();
        })
        .then((data) => ({ surahNo, result: data.result as any[] })),
    );
    const translations = await Promise.all(quranEncPromises);
    const translationMap: { [key: string]: string } = {};
    translations.forEach(({ surahNo, result }) => {
      if (Array.isArray(result)) {
        result.forEach((item: any) => {
          const key = `${String(surahNo)}:${String(item.aya)}`;
          translationMap[key] = item.translation;
        });
      }
    });
    const mergedData = structureData.map((ayah: any) => {
      const key = `${String(ayah.surah.number)}:${String(ayah.numberInSurah)}`;
      return {
        ...ayah,
        text: translationMap[key] || `[Translation not found] ${ayah.text}`,
      };
    });
    return { ayahs: mergedData };
  } catch (error) {
    console.error("Kurdish API Error:", error);
    return null;
  }
}

async function fetchQuranTranslationPage(
  pageNumber: number,
  editionOrKey: string,
) {
  try {
    if (editionOrKey === "special_quranenc_kurmanji") {
      const structRes = await fetch(
        `https://api.alquran.cloud/v1/page/${pageNumber}/quran-uthmani`,
      );
      const structData = await structRes.json();
      if (structData.code === 200 && structData.data?.ayahs) {
        return await fetchKurdishForPage(structData.data.ayahs);
      }
      return null;
    }
    const res = await fetch(
      `https://api.alquran.cloud/v1/page/${pageNumber}/${editionOrKey}`,
    );
    const data = await res.json();
    if (data.code === 200 && data.data?.ayahs)
      return { ayahs: data.data.ayahs };
    return null;
  } catch (error) {
    console.error("Could not fetch translation:", error);
    return null;
  }
}

// ================================================================
// CEVSEN GRID DISPLAY
// ================================================================
const SUBHANEKE_RE = /s[üu]bh[âa]neke|سُبْحَانَكَ|سبحانك/i;

const Medal = ({ number }: { number: number }) => (
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
    <span className="relative z-10 text-white font-bold text-[11px] md:text-sm drop-shadow font-sans leading-none">
      {number}
    </span>
  </span>
);

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

function parseLatin(raw: string) {
  const text = raw.replace(/###\s*$/, "").trim();
  const subhIdx = text.search(/\ss[üu]bh[âa]neke/i);
  const mainText = subhIdx > 0 ? text.slice(0, subhIdx).trim() : text;
  const subhaneke = subhIdx > 0 ? text.slice(subhIdx).trim() : "";

  const tokens: { num: number; index: number; start: number }[] = [];
  const re = /(?:^|(?<=\s))(\d{1,2})(?=\s+[A-ZÂÎÛÜÖa-zâîûüöğışçĞİŞÇ])/g;
  let m: RegExpExecArray | null;

  while ((m = re.exec(mainText)) !== null) {
    tokens.push({
      num: parseInt(m[1]),
      index: m.index,
      start: m.index + m[0].length,
    });
  }

  if (tokens.length === 0) return { header: mainText, items: [], subhaneke };

  const header = mainText.slice(0, tokens[0].index).trim();
  const items: string[] = tokens.map((tok, i) => {
    const end = i + 1 < tokens.length ? tokens[i + 1].index : mainText.length;
    return mainText.slice(tok.start, end).trim();
  });

  return { header, items, subhaneke };
}

function parseMeaning(raw: string) {
  const text = raw.replace(/###\s*$/, "").trim();
  let paragraphs = text
    .split(/\n{2,}/)
    .map((p) => p.replace(/\n/g, " ").trim())
    .filter((p) => p.length > 0);
  if (paragraphs.length < 3) {
    paragraphs = text
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
  }
  const subhIdx = paragraphs.findIndex((p) => SUBHANEKE_RE.test(p));
  const subhaneke = subhIdx >= 0 ? paragraphs.splice(subhIdx).join(" ") : "";
  return { header: "", items: paragraphs, subhaneke };
}

const DecoStar = () => (
  <span className="text-amber-400/30 text-xs select-none opacity-0 group-hover:opacity-100 transition-opacity">
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
  mode: "ARABIC" | "LATIN" | "MEANING";
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
        <Medal number={rightNum} />
        <span className={textClass}>{right}</span>
        <DecoStar />
      </div>
      {left ? (
        <div className={cellClass} dir={isRtl ? "rtl" : "ltr"}>
          <Medal number={leftNum} />
          <span className={textClass}>{left}</span>
          <DecoStar />
        </div>
      ) : (
        <div />
      )}
    </React.Fragment>
  );
};

// ── SURAH VERSES GRID ──────────────────────────────────────
const SurahVerseGrid = ({
  babs,
  activeTab,
  fontLevel,
}: {
  babs: CevsenBab[];
  activeTab: "ARABIC" | "LATIN" | "MEANING";
  fontLevel: number;
}) => {
  const isRtl = activeTab === "ARABIC";
  const fontClass =
    activeTab === "ARABIC"
      ? fontSizes.ARABIC[fontLevel]
      : activeTab === "LATIN"
        ? fontSizes.LATIN[fontLevel]
        : fontSizes.MEANING[fontLevel];

  const items = babs
    .map((b) =>
      activeTab === "ARABIC"
        ? b.arabic
        : activeTab === "LATIN"
          ? b.transcript
          : b.meaning,
    )
    .filter((t) => t?.trim().length > 0);

  const parsed = items.map((item, idx) => {
    const cleaned = item.replace(/^"+|"+$/g, "").trim();
    const m = cleaned.match(/^(\d+)[-.:]\s*([\s\S]*)/);
    const rawText = m ? m[2].trim() : cleaned;
    const finalText = rawText.replace(/^"+|"+$/g, "").trim();
    return { num: m ? parseInt(m[1]) : idx + 1, text: finalText };
  });

  const rows: Array<[(typeof parsed)[0], (typeof parsed)[0] | null]> = [];
  for (let i = 0; i < parsed.length; i += 2) {
    rows.push([parsed[i], parsed[i + 1] ?? null]);
  }

  const cellClass =
    "flex items-center gap-3 py-2 px-2 border-b border-amber-900/10 dark:border-amber-100/10 " +
    "hover:bg-amber-50/60 dark:hover:bg-amber-900/15 rounded-xl transition-colors group";
  const textClass = [
    "flex-1 font-serif",
    activeTab === "ARABIC"
      ? `leading-[2.3] text-gray-900 dark:text-gray-100 ${fontClass}`
      : activeTab === "LATIN"
        ? `leading-loose text-gray-800 dark:text-gray-200 ${fontClass}`
        : `leading-relaxed text-gray-700 dark:text-gray-300 ${fontClass}`,
  ].join(" ");

  return (
    <div
      className="relative bg-[#fdf9f2] dark:bg-[#0f1117] rounded-[2rem] shadow-2xl max-w-5xl mx-auto my-4 overflow-hidden"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="m-3 rounded-[1.5rem] border-[6px] border-double border-amber-800/25 dark:border-amber-600/25 p-4 md:p-8">
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04] dark:opacity-[0.03]"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(180,120,40,0.15) 20px, rgba(180,120,40,0.15) 21px)`,
          }}
        />
        <div className="relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
            {rows.map((row, i) => (
              <React.Fragment key={i}>
                <div className={cellClass} dir={isRtl ? "rtl" : "ltr"}>
                  <Medal number={row[0].num} />
                  <span className={textClass}>{row[0].text}</span>
                  <DecoStar />
                </div>
                {row[1] ? (
                  <div className={cellClass} dir={isRtl ? "rtl" : "ltr"}>
                    <Medal number={row[1].num} />
                    <span className={textClass}>{row[1].text}</span>
                    <DecoStar />
                  </div>
                ) : (
                  <div />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const CevsenGridDisplay = ({
  text,
  fontLevel,
  mode = "ARABIC",
}: {
  text: string;
  fontLevel: number;
  mode?: "ARABIC" | "LATIN" | "MEANING";
}) => {
  const parsed = useMemo(() => {
    if (mode === "ARABIC") return parseArabic(text);
    if (mode === "LATIN") return parseLatin(text);
    return parseMeaning(text);
  }, [text, mode]);

  const { header, items, subhaneke } = parsed;
  const isRtl = mode === "ARABIC";
  const fontClass =
    mode === "ARABIC"
      ? fontSizes.ARABIC[fontLevel]
      : mode === "LATIN"
        ? fontSizes.LATIN[fontLevel]
        : fontSizes.MEANING[fontLevel];

  if (items.length < 2) {
    return (
      <div
        className={`font-serif leading-[2.4] py-2 text-center text-gray-800 dark:text-gray-100 ${fontClass}`}
        dir={isRtl ? "rtl" : "ltr"}
      >
        {text.replace(/###\s*$/, "").trim()}
      </div>
    );
  }

  const rows: Array<[string, string | null]> = [];
  for (let i = 0; i < items.length; i += 2) {
    rows.push([items[i], items[i + 1] ?? null]);
  }

  return (
    <div
      className="relative bg-[#fdf9f2] dark:bg-[#0f1117] rounded-[2rem] shadow-2xl max-w-5xl mx-auto my-4 overflow-hidden"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="m-3 rounded-[1.5rem] border-[6px] border-double border-amber-800/25 dark:border-amber-600/25 p-4 md:p-8">
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
                mode={mode}
              />
            ))}
          </div>
          {subhaneke && (
            <div className="mt-8 pt-6 border-t-2 border-dashed border-red-700/20 dark:border-red-500/25 text-center relative">
              <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#fdf9f2] dark:bg-[#0f1117] px-3 text-red-700/30 dark:text-red-500/35 text-xl select-none">
                ۞
              </span>
              <p
                className={`font-serif font-black leading-[2.6] tracking-wide text-red-700 dark:text-red-500 ${
                  mode === "ARABIC"
                    ? fontClass
                    : mode === "LATIN"
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
  );
};

// ================================================================
// MAIN MODAL
// ================================================================
const ReadingModal: React.FC<ReadingModalProps> = ({
  content,
  onClose,
  onUpdateContent,
  session,
  userName,
  localCounts,
  onDecrementCount,
  t,
}) => {
  const { language } = useLanguage();
  const [fontLevel, setFontLevel] = useState(3);
  const [activeTab, setActiveTab] = useState<ViewMode>("ARABIC");
  const [activeQuranTab, setActiveQuranTab] = useState<"ORIGINAL" | "MEAL">(
    "ORIGINAL",
  );
  const [mealData, setMealData] = useState<any[]>([]);
  const [loadingMeal, setLoadingMeal] = useState(false);

  // Özellik Stateleri
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSepia, setIsSepia] = useState(false);

  // Geri Yükleme ve Hafıza Stateleri
  const [isRestoring, setIsRestoring] = useState(true);
  const latestScrollY = useRef<number>(0);

  // Teleprompter Stateleri
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [autoScrollSpeed, setAutoScrollSpeed] = useState(1); // 0.5, 1, 1.5, 2, 3

  const currentPage = content.currentUnit || content.startUnit || 1;
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // Hesaplamalar
  const safeStart = content.startUnit || currentPage;
  const safeEnd = content.endUnit || currentPage;
  const totalPages = safeEnd - safeStart + 1;
  const currentPageIdx = currentPage - safeStart;
  const initialProgress =
    totalPages > 1 ? (currentPageIdx * 100) / totalPages : 0;

  // --- HAFIZA (LOCALSTORAGE) ANAHTARI OLUŞTURMA ---
  const storageKey = useMemo(() => {
    if (content.assignmentId)
      return `readcircle_progress_assign_${content.assignmentId}`;
    if (content.codeKey) return `readcircle_progress_code_${content.codeKey}`;
    return `readcircle_progress_type_${content.type}`;
  }, [content.assignmentId, content.codeKey, content.type]);

  // --- BAŞLANGIÇTA FONT VE KALDIĞI YERİ GERİ YÜKLEME ---
  useEffect(() => {
    // 1. Font Büyüklüğünü Geri Yükle
    const savedFont = localStorage.getItem("readcircle_font_level");
    if (savedFont) setFontLevel(Number(savedFont));

    // 2. Kaldığı Sayfayı ve Pozisyonu Geri Yükle
    setIsRestoring(true);
    try {
      const savedProgress = localStorage.getItem(storageKey);
      if (savedProgress) {
        const { unit, scrollY } = JSON.parse(savedProgress);

        const validUnit = Math.max(
          content.startUnit || 1,
          Math.min(unit, content.endUnit || 604),
        );
        if (validUnit !== (content.currentUnit || content.startUnit || 1)) {
          onUpdateContent({ ...content, currentUnit: validUnit });
        }

        // DOM'un render olabilmesi için küçük bir gecikme
        setTimeout(() => {
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollY;
            latestScrollY.current = scrollY;
            const { scrollHeight, clientHeight } = scrollContainerRef.current;
            updateProgressBar(scrollY, scrollHeight - clientHeight);
          }
          setIsRestoring(false);
        }, 200);
      } else {
        setIsRestoring(false);
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      setIsRestoring(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);
  // ----------------------------------------------------

  // Font Değişimini Kaydetme Fonksiyonu
  const handleFontChange = (newLevel: number) => {
    setFontLevel(newLevel);
    localStorage.setItem("readcircle_font_level", newLevel.toString());
  };

  // --- İLERLEME ÇUBUĞU (GPU ACCELERATED - RE-RENDER YOK) ---
  const updateProgressBar = useCallback(
    (scrollTop: number, maxScroll: number) => {
      if (!progressBarRef.current) return;
      const scrollPct =
        maxScroll <= 0
          ? 100
          : Math.min(100, Math.max(0, (scrollTop / maxScroll) * 100));
      const unifiedPct =
        totalPages > 1
          ? (currentPageIdx * 100 + scrollPct) / totalPages
          : scrollPct;

      progressBarRef.current.style.transform = `scaleX(${unifiedPct / 100})`;
    },
    [totalPages, currentPageIdx],
  );

  const handleScroll = () => {
    if (isAutoScrolling) return;

    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        scrollContainerRef.current;
      latestScrollY.current = scrollTop; // Kullanıcı kaydırdıkça konumu hafızaya al
      updateProgressBar(scrollTop, scrollHeight - clientHeight);
    }
  };

 // 1. SADECE Sayfa (İleri/Geri) değiştiğinde Scroll'u en başa (0'a) al
  useEffect(() => {
    if (isRestoring) return; 
    
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
      latestScrollY.current = 0;
      const { scrollHeight, clientHeight } = scrollContainerRef.current;
      updateProgressBar(0, scrollHeight - clientHeight);
    }
    // Sekme (Arapça/Latin) veya Tam Ekran değişiminde başa sarmaması için sadece currentPage'i dinliyoruz
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // 2. Sekme veya Tam Ekran (isFullscreen) değiştiğinde Scroll'u SIFIRLAMA, sadece Çubuğu o anki yerine göre güncelle
  useEffect(() => {
    if (isRestoring) return;
    
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      updateProgressBar(scrollTop, scrollHeight - clientHeight);
    }
  }, [activeTab, activeQuranTab, isFullscreen, updateProgressBar, isRestoring]);

  // --- KALDIĞI YERİ KAYDETME (PERİYODİK VE UNMOUNT) ---
  useEffect(() => {
    if (isRestoring) return;

    const saveProgress = () => {
      const payload = JSON.stringify({
        unit: currentPage,
        scrollY: latestScrollY.current,
      });
      localStorage.setItem(storageKey, payload);
    };

    // Her 2 saniyede bir arka planda kaydet
    const interval = setInterval(saveProgress, 2000);

    return () => {
      clearInterval(interval);
      saveProgress(); // Modal kapanırken kesinlikle kaydet
    };
  }, [storageKey, currentPage, isRestoring]);
  // ----------------------------------------------------

  // --- LAYOUT THRASHING'SİZ YAĞ GİBİ AKAN OTOMATİK KAYDIRMA ---
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el || !isAutoScrolling) return;

    let animationFrameId: number;
    let lastTime: number | null = null;
    let exactScrollY = el.scrollTop;

    const cachedScrollHeight = el.scrollHeight;
    const cachedClientHeight = el.clientHeight;
    const maxScroll = cachedScrollHeight - cachedClientHeight;

    const baseSpeed = 40;

    const scrollStep = (timestamp: number) => {
      if (lastTime === null) lastTime = timestamp;
      const deltaTime = timestamp - lastTime;
      lastTime = timestamp;

      if (deltaTime > 0 && deltaTime < 100) {
        const moveBy = (baseSpeed * autoScrollSpeed * deltaTime) / 1000;
        exactScrollY += moveBy;

        if (exactScrollY >= maxScroll - 1) {
          el.scrollTop = maxScroll;
          latestScrollY.current = maxScroll;
          updateProgressBar(maxScroll, maxScroll);
          setIsAutoScrolling(false);
          return;
        }

        el.scrollTop = exactScrollY;
        latestScrollY.current = exactScrollY;
        updateProgressBar(exactScrollY, maxScroll);
      }

      animationFrameId = requestAnimationFrame(scrollStep);
    };

    animationFrameId = requestAnimationFrame(scrollStep);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    isAutoScrolling,
    autoScrollSpeed,
    currentPageIdx,
    totalPages,
    updateProgressBar,
  ]);

  const cycleSpeed = () => {
    const speeds = [0.5, 1, 1.5, 2, 3];
    const nextIdx = (speeds.indexOf(autoScrollSpeed) + 1) % speeds.length;
    setAutoScrollSpeed(speeds[nextIdx]);
    if (typeof navigator !== "undefined" && navigator.vibrate)
      navigator.vibrate(15);
  };
  // ------------------------------------------------

  // --- WAKE LOCK API ---
  const wakeLockRef = useRef<any>(null);
  useEffect(() => {
    const requestWakeLock = async () => {
      try {
        if ("wakeLock" in navigator) {
          wakeLockRef.current = await (navigator as any).wakeLock.request(
            "screen",
          );
        }
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

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") requestWakeLock();
    };

    requestWakeLock();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      releaseWakeLock();
    };
  }, []);
  // -----------------------

  useEffect(() => {
    if (content.type === "QURAN" && activeQuranTab === "MEAL") {
      setLoadingMeal(true);
      setMealData([]);
      const targetEdition =
        EDITION_MAPPING[language] || EDITION_MAPPING["default"];
      fetchQuranTranslationPage(currentPage, targetEdition)
        .then((result) => {
          if (result) setMealData(result.ayahs);
        })
        .finally(() => setLoadingMeal(false));
    }
  }, [currentPage, activeQuranTab, content.type, language]);

  const getDisplayTitle = () => {
    if (!content.codeKey) return content.title;
    const translated = t(`resource_${content.codeKey}`);
    return translated === `resource_${content.codeKey}`
      ? content.title
      : translated;
  };

  const processedData = useMemo(() => {
    if (
      (content.type !== "CEVSEN" && content.type !== "SURAS") ||
      !content.cevsenData
    )
      return null;
    const codeKey = (content.codeKey || "").toUpperCase();
    const isBedirGroup = ["BEDIR", "UHUD", "TEVHIDNAME"].includes(codeKey);
    const isSurahGroup =
      content.type === "SURAS" ||
      ["YASIN", "FETIH", "FATIHA", "IHLAS"].includes(codeKey);

    if (isBedirGroup) {
      const rawArabic = content.cevsenData.map((b) => b.arabic).join("\n");
      const rawLatin = content.cevsenData.map((b) => b.transcript).join("\n");
      const splitRegex = /###|\r\n|\r|\n/g;
      const arabicLines = rawArabic
        .split(splitRegex)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);
      const latinLines = rawLatin
        .split(splitRegex)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);
      const totalLen = Math.max(arabicLines.length, latinLines.length);
      const masterList: CevsenBab[] = [];
      for (let i = 0; i < totalLen; i++) {
        masterList.push({
          babNumber: i + 1,
          arabic: arabicLines[i] || "",
          transcript: latinLines[i] || "",
          meaning: "",
        });
      }
      if (content.startUnit && content.endUnit) {
        const rangeCount = content.endUnit - content.startUnit + 1;
        const slicedData: CevsenBab[] = [];
        for (let i = 0; i < rangeCount; i++) {
          const targetIndex = (content.startUnit - 1 + i) % totalLen;
          if (masterList[targetIndex])
            slicedData.push({ ...masterList[targetIndex] });
        }
        return { mode: "LIST", data: slicedData, isSurah: false };
      }
      return { mode: "LIST", data: masterList, isSurah: false };
    }

    if (isSurahGroup) {
      const newData: CevsenBab[] = [];
      let counter = 1;
      content.cevsenData.forEach((bab) => {
        const latinLines = bab.transcript
          ? bab.transcript.split("\n").filter((l) => l.trim().length > 0)
          : [];
        const meaningLines = bab.meaning
          ? bab.meaning.split("\n").filter((l) => l.trim().length > 0)
          : [];
        const maxLen = Math.max(latinLines.length, meaningLines.length);
        if (maxLen > 0) {
          for (let i = 0; i < maxLen; i++) {
            newData.push({
              babNumber: counter++,
              arabic: "",
              transcript: latinLines[i] || "",
              meaning: meaningLines[i] || "",
            });
          }
        }
      });
      return {
        mode: "SURAH_CARD",
        data: newData.length > 0 ? newData : content.cevsenData,
        isSurah: true,
      };
    }

    return { mode: "BLOCK", data: content.cevsenData, isSurah: false };
  }, [content]);

  const changePage = (offset: number) => {
    const current = content.currentUnit || content.startUnit || 1;
    const min = content.startUnit || 1;
    const max = content.endUnit || 604;
    const next = Math.min(Math.max(current + offset, min), max);

    if (next !== current) {
      onUpdateContent({ ...content, currentUnit: next });
      if (typeof navigator !== "undefined" && navigator.vibrate)
        navigator.vibrate(30);
    }
  };

  const currentAssignment = content.assignmentId
    ? session?.assignments.find((a) => a.id === content.assignmentId)
    : undefined;
  const isOwner =
    currentAssignment && currentAssignment.assignedToName === userName;
  const totalTarget = currentAssignment
    ? currentAssignment.endUnit - currentAssignment.startUnit + 1
    : 0;
  const safeCount = content.assignmentId
    ? (localCounts[content.assignmentId] ?? totalTarget)
    : 0;

  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleContentClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button, a, input")) return;

    if (isAutoScrolling) {
      setIsAutoScrolling(false);
      return;
    }

    if (content.assignmentId && isOwner) {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
        if (safeCount > 0) {
          onDecrementCount(content.assignmentId);
          if (typeof navigator !== "undefined" && navigator.vibrate)
            navigator.vibrate(50);
        }
      } else {
        clickTimeoutRef.current = setTimeout(() => {
          setIsFullscreen((prev) => !prev);
          clickTimeoutRef.current = null;
        }, 250);
      }
    } else {
      setIsFullscreen((prev) => !prev);
    }
  };

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isAutoScrolling) setIsAutoScrolling(false);
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchStartX.current - touchEndX;
    const deltaY = touchStartY.current - touchEndY;

    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 0) changePage(1);
      else changePage(-1);
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const isFirstPage = currentPage === (content.startUnit || 1);
  const isLastPage = currentPage === (content.endUnit || 604);
  const isSurahGroup = processedData?.isSurah || false;
  const isBedirGroup = processedData?.mode === "LIST";

  const PaginationBar = () => (
    <div className="flex items-center justify-between w-full my-3 shrink-0 bg-white dark:bg-gray-900 p-2 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
      <button
        onClick={() => changePage(-1)}
        disabled={isFirstPage}
        className="px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-20 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all"
      >
        <span>←</span> {t("previous")}
      </button>
      <span className="font-black text-xs text-gray-800 dark:text-white uppercase tracking-[0.2em]">
        {t("page")} {currentPage}
      </span>
      <button
        onClick={() => changePage(1)}
        disabled={isLastPage}
        className="px-4 py-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 disabled:opacity-20 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all"
      >
        {t("next")} <span>→</span>
      </button>
    </div>
  );

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300 ${isFullscreen ? "p-0" : "p-2 md:p-4"}`}
    >
      <div
        className={`relative w-full max-w-4xl overflow-hidden flex flex-col transition-all duration-500 ${isSepia ? "sepia-theme !bg-[#F4ECD8]" : "bg-gray-100 dark:bg-black"} ${isFullscreen ? "h-screen max-h-screen rounded-none border-none" : "max-h-[95vh] rounded-[1.5rem] md:rounded-[2.5rem] border border-white/10 dark:border-gray-800 shadow-2xl"}`}
      >
        {/* DONANIMSAL (GPU) İVMELİ İLERLEME ÇUBUĞU */}
        <div className="absolute top-0 left-0 w-full h-[3px] bg-black/5 dark:bg-white/5 z-[60]">
          <div
            ref={progressBarRef}
            className="h-full bg-emerald-500 dark:bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.8)] origin-left"
            style={{ transform: `scaleX(${initialProgress / 100})` }}
          />
        </div>

        {/* HEADER */}
        {!isFullscreen && (
          <div className="p-4 md:p-5 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex flex-col gap-3 shrink-0 shadow-sm z-20 animate-in slide-in-from-top-4">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-base md:text-xl tracking-tight text-gray-800 dark:text-white truncate mr-2">
                {getDisplayTitle()}
              </h3>
              <div className="flex items-center gap-2 md:gap-3">
                {!(isSurahGroup && activeTab === "ARABIC") &&
                  content.type !== "QURAN" && (
                    <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-1 border border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() =>
                          handleFontChange(Math.max(0, fontLevel - 1))
                        }
                        disabled={fontLevel === 0}
                        className="w-8 h-8 flex items-center justify-center hover:bg-white dark:hover:bg-gray-700 rounded-lg disabled:opacity-30 transition font-serif font-bold text-gray-600 dark:text-gray-300 text-xs shadow-sm"
                      >
                        A-
                      </button>
                      <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1"></div>
                      <button
                        onClick={() =>
                          handleFontChange(Math.min(8, fontLevel + 1))
                        }
                        disabled={fontLevel === 8}
                        className="w-8 h-8 flex items-center justify-center hover:bg-white dark:hover:bg-gray-700 rounded-lg disabled:opacity-30 transition font-serif font-bold text-gray-600 dark:text-gray-300 text-base shadow-sm"
                      >
                        A+
                      </button>

                      <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1"></div>
                      <button
                        onClick={() => {
                          setIsSepia(!isSepia);
                          if (
                            typeof navigator !== "undefined" &&
                            navigator.vibrate
                          )
                            navigator.vibrate(20);
                        }}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-300 ${
                          isSepia
                            ? "bg-[#432C0A]/10 text-[#432C0A] shadow-inner"
                            : "hover:bg-white dark:hover:bg-gray-700 text-amber-600 dark:text-amber-500 hover:text-amber-800"
                        }`}
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

                      {/* Hız Kontrol Butonu */}
                      <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1"></div>
                      <button
                        onClick={cycleSpeed}
                        className="w-8 h-8 flex items-center justify-center rounded-lg font-bold text-[10px] hover:bg-white dark:hover:bg-gray-700 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        title={t("scrollSpeed") || "Kaydırma Hızı"}
                      >
                        {autoScrollSpeed}x
                      </button>

                      {/* Teleprompter Oynat/Duraklat Butonu */}
                      <button
                        onClick={() => {
                          setIsAutoScrolling(!isAutoScrolling);
                          if (
                            typeof navigator !== "undefined" &&
                            navigator.vibrate
                          )
                            navigator.vibrate(20);
                        }}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-300 ${
                          isAutoScrolling
                            ? "bg-blue-600/15 text-blue-600 dark:text-blue-400 shadow-inner"
                            : "hover:bg-white dark:hover:bg-gray-700 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400"
                        }`}
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
                    </div>
                  )}
                <button
                  onClick={onClose}
                  className="bg-gray-200 dark:bg-gray-800 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 text-gray-500 dark:text-gray-400 p-2 rounded-full transition-all duration-200 active:scale-90"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18 18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {content.type === "QURAN" && (
              <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setActiveQuranTab("ORIGINAL")}
                  className={`flex-1 py-2 text-xs md:text-sm font-bold rounded-lg transition-all ${activeQuranTab === "ORIGINAL" ? "bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm" : "text-gray-500 hover:text-gray-700 dark:text-gray-400"}`}
                >
                  {t("Original") || "Original"}
                </button>
                <button
                  onClick={() => setActiveQuranTab("MEAL")}
                  className={`flex-1 py-2 text-xs md:text-sm font-bold rounded-lg transition-all ${activeQuranTab === "MEAL" ? "bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm" : "text-gray-500 hover:text-gray-700 dark:text-gray-400"}`}
                >
                  {t("tabMeaning") || "Meaning"}
                </button>
              </div>
            )}

            {content.type !== "SIMPLE" && content.type !== "QURAN" && (
              <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                {(["ARABIC", "LATIN", "MEANING"] as const).map((tab) => {
                  if (tab === "MEANING" && isBedirGroup) return null;
                  if (content.codeKey === "OZELSALAVAT" && tab === "LATIN")
                    return null;
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 py-2 rounded-lg text-[10px] md:text-xs font-black transition-all duration-300 uppercase tracking-widest ${activeTab === tab ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-white shadow-md transform scale-[1.02]" : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"}`}
                    >
                      {t(`tab${tab.charAt(0) + tab.slice(1).toLowerCase()}`)}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* CONTENT */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          onWheel={(e) => {
            if (isAutoScrolling && Math.abs(e.deltaY) > 10)
              setIsAutoScrolling(false);
          }}
          className={`flex-1 overflow-y-auto cursor-pointer overscroll-none ${!isAutoScrolling ? "scroll-smooth" : "scroll-auto"} ${isSepia ? "!bg-[#F4ECD8]" : "bg-gray-100 dark:bg-black"} ${isFullscreen ? "p-6 md:p-10" : "p-4 md:p-6"}`}
          style={{
            willChange: "scroll-position",
            WebkitOverflowScrolling: "touch",
          }}
          onClick={handleContentClick}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {content.type === "SIMPLE" && content.simpleItems && (
            <div className="space-y-3 max-w-2xl mx-auto">
              {content.simpleItems.map((item, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex gap-4 items-center"
                >
                  <span className="w-8 h-8 flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-black rounded-full text-xs">
                    {index + 1}
                  </span>
                  <span className="text-lg font-medium text-gray-700 dark:text-gray-200">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          )}

          {content.type === "QURAN" && (
            <div className="flex flex-col items-center min-h-full max-w-2xl mx-auto pb-4">
              <PaginationBar />
              <div className="flex-1 w-full bg-white dark:bg-gray-900 rounded-[2rem] p-2 md:p-4 border border-gray-200 dark:border-gray-800 shadow-sm min-h-[50vh] relative">
                {activeQuranTab === "ORIGINAL" ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <img
                      src={`https://quran.islam-db.com/data/pages/quranpages_1024/images/page${String(currentPage).padStart(3, "0")}.png`}
                      alt={`Page ${currentPage}`}
                      className="max-w-full h-auto object-contain rounded-xl dark:invert dark:opacity-90"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="w-full h-full p-2 md:p-4">
                    {loadingMeal ? (
                      <div className="flex flex-col items-center justify-center h-40 space-y-4">
                        <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {mealData.map((ayah: any, idx: number) => (
                          <div key={idx} className="flex flex-col gap-2">
                            <div className="flex items-start gap-3">
                              <span className="shrink-0 flex items-center justify-center w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-black rounded-full shadow-sm mt-1">
                                {ayah.numberInSurah}
                              </span>
                              <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed font-serif">
                                {ayah.text}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <PaginationBar />
            </div>
          )}

          {(content.type === "CEVSEN" || content.type === "SURAS") &&
            processedData && (
              <div className="space-y-3 max-w-3xl mx-auto px-1">
                {processedData.mode === "SURAH_CARD" && (
                  <>
                    {activeTab === "ARABIC" &&
                      (content.cevsenData &&
                      content.cevsenData[0]?.arabic?.includes(
                        "IMAGE_MODE:::",
                      ) ? (
                        content.cevsenData.map((bab, i) =>
                          bab.arabic.includes("IMAGE_MODE:::") ? (
                            <img
                              key={i}
                              src={bab.arabic
                                .replace("IMAGE_MODE:::", "")
                                .trim()}
                              className="w-full rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 mb-4"
                              alt="Surah"
                            />
                          ) : null,
                        )
                      ) : (
                        <SurahVerseGrid
                          babs={processedData.data}
                          activeTab="ARABIC"
                          fontLevel={fontLevel}
                        />
                      ))}
                    {(activeTab === "LATIN" || activeTab === "MEANING") && (
                      <SurahVerseGrid
                        babs={processedData.data}
                        activeTab={activeTab}
                        fontLevel={fontLevel}
                      />
                    )}
                  </>
                )}

                {processedData.mode !== "SURAH_CARD" &&
                  processedData.data.map((bab, index) => {
                    const mode = processedData.mode;
                    const displayLabel: string | number = bab.babNumber;
                    const isCard = mode === "LIST";
                    const containerClasses = isCard
                      ? "bg-white dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/50 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] rounded-[1.5rem] p-4 md:p-5 hover:border-emerald-100 dark:hover:border-emerald-900/30 transition-colors"
                      : "";

                    return (
                      <div
                        key={index}
                        className={`animate-in fade-in slide-in-from-bottom-4 duration-500 ${containerClasses}`}
                        style={{ animationDelay: `${index * 10}ms` }}
                      >
                        {mode === "BLOCK" && (
                          <div className="flex items-center justify-center gap-4 my-8 opacity-90 group">
                            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent dark:via-emerald-500/40">
                              <div className="w-1 h-1 bg-emerald-400/60 rounded-full ml-auto translate-x-2"></div>
                            </div>
                            <div className="relative flex items-center justify-center w-12 h-12 shrink-0">
                              <div className="absolute w-9 h-9 border border-emerald-600/20 dark:border-emerald-400/20 rotate-45 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-sm shadow-sm transition-transform duration-500 group-hover:rotate-[225deg]"></div>
                              <div className="absolute w-9 h-9 border border-emerald-600/20 dark:border-emerald-400/20 rotate-0 bg-white dark:bg-gray-900 rounded-sm shadow-sm transition-transform duration-500 group-hover:rotate-180"></div>
                              <span className="relative z-10 font-serif font-bold text-lg text-emerald-700 dark:text-emerald-400 drop-shadow-sm">
                                {bab.babNumber}
                              </span>
                            </div>
                            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent dark:via-emerald-500/40">
                              <div className="w-1 h-1 bg-emerald-400/60 rounded-full mr-auto -translate-x-2"></div>
                            </div>
                          </div>
                        )}

                        <div className="w-full">
                          {activeTab === "ARABIC" && (
                            <div
                              className={
                                isCard || content.type === "CEVSEN"
                                  ? "w-full"
                                  : "text-center font-serif leading-[2.4] py-2 text-gray-800 dark:text-gray-100"
                              }
                              dir="rtl"
                            >
                              {bab.arabic.includes("IMAGE_MODE:::") ? (
                                <img
                                  src={bab.arabic
                                    .replace("IMAGE_MODE:::", "")
                                    .trim()}
                                  className="w-full rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800"
                                  alt="Arabic"
                                />
                              ) : isCard ? (
                                renderUhudList(
                                  bab.arabic,
                                  "ARABIC",
                                  fontLevel,
                                  displayLabel,
                                )
                              ) : content.type === "CEVSEN" ? (
                                <CevsenGridDisplay
                                  text={bab.arabic}
                                  fontLevel={fontLevel}
                                  mode="ARABIC"
                                />
                              ) : (
                                formatArabicText(bab.arabic, fontLevel)
                              )}
                            </div>
                          )}

                          {activeTab === "LATIN" && (
                            <div
                              className={
                                isCard
                                  ? "w-full"
                                  : "text-left font-serif leading-relaxed py-2 text-gray-700 dark:text-gray-300"
                              }
                            >
                              {isCard ? (
                                renderUhudList(
                                  bab.transcript,
                                  "LATIN",
                                  fontLevel,
                                  displayLabel,
                                )
                              ) : content.type === "CEVSEN" ? (
                                <CevsenGridDisplay
                                  text={bab.transcript}
                                  fontLevel={fontLevel}
                                  mode="LATIN"
                                />
                              ) : (
                                formatLatinText(bab.transcript, fontLevel)
                              )}
                            </div>
                          )}

                          {activeTab === "MEANING" &&
                            mode !== "LIST" &&
                            (content.type === "CEVSEN" ? (
                              <CevsenGridDisplay
                                text={bab.meaning}
                                fontLevel={fontLevel}
                                mode="MEANING"
                              />
                            ) : (
                              <div className="bg-emerald-50/40 dark:bg-emerald-900/10 p-4 rounded-2xl border border-emerald-100/50 dark:border-emerald-800/30">
                                <div className="text-gray-700 dark:text-gray-300 italic font-medium leading-relaxed text-sm">
                                  {formatMeaningText(bab.meaning, fontLevel)}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

          {content.type === "SALAVAT" && content.salavatData && (
            <div className="flex flex-col items-center w-full max-w-2xl mx-auto space-y-6">
              {(activeTab === "ARABIC" &&
                content.salavatData.arabic.includes("IMAGE_MODE")) ||
              (activeTab === "LATIN" &&
                content.salavatData.transcript.includes("IMAGE_MODE")) ||
              (activeTab === "MEANING" &&
                content.salavatData.meaning.includes("IMAGE_MODE")) ? (
                <div className="flex flex-col gap-4 w-full">
                  {(activeTab === "ARABIC"
                    ? content.salavatData.arabic
                    : activeTab === "LATIN"
                      ? content.salavatData.transcript
                      : content.salavatData.meaning
                  )
                    .replace("IMAGE_MODE:::", "")
                    .split(",")
                    .map((src, i) => (
                      <img
                        key={i}
                        src={src.trim()}
                        className="w-full rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800"
                        alt="Salavat"
                      />
                    ))}
                </div>
              ) : (
                <div className="w-full bg-white dark:bg-gray-900 p-6 md:p-8 rounded-[2rem] shadow-sm border border-gray-200 dark:border-gray-800">
                  {activeTab === "ARABIC" && (
                    <div
                      className={`text-center font-serif leading-[3.8rem] text-gray-800 dark:text-gray-100 ${fontSizes.ARABIC[fontLevel]}`}
                      dir="rtl"
                    >
                      {content.salavatData.arabic}
                    </div>
                  )}
                  {activeTab === "LATIN" &&
                    formatStyledText(
                      content.salavatData.transcript,
                      "LATIN",
                      fontLevel,
                    )}
                  {activeTab === "MEANING" &&
                    formatStyledText(
                      content.salavatData.meaning,
                      "MEANING",
                      fontLevel,
                    )}
                </div>
              )}
              {content.assignmentId && (
                <div className="w-full flex flex-col items-center bg-white dark:bg-gray-900 rounded-[2rem] p-6 shadow-md border border-gray-100 dark:border-gray-800">
                  <Zikirmatik
                    currentCount={safeCount}
                    onDecrement={() => onDecrementCount(content.assignmentId!)}
                    isModal={true}
                    t={t}
                    readOnly={!isOwner}
                    totalCount={totalTarget}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* FOOTER */}
        {!isFullscreen && (
          <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shrink-0 z-20 animate-in slide-in-from-bottom-4">
            <button
              onClick={onClose}
              className="w-full py-4 bg-gray-900 dark:bg-gray-800 text-white rounded-2xl hover:bg-black dark:hover:bg-gray-700 transition-all font-black uppercase tracking-[0.2em] text-xs shadow-lg active:scale-[0.98]"
            >
              {t("close")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReadingModal;
