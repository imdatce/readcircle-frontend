/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
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
  ignoreSavedProgress?: boolean;
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
  onCompleteAssignment?: (id: number) => void;
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
  nl: "nl.keyzer",
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
        `https://api.alquran.cloud/v1/page/${pageNumber}/quran-simple`,
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

async function fetchWordByWordPage(pageNumber: number, languageCode: string) {
  try {
    const supportedLangs = ["en", "tr"];
    const lang = supportedLangs.includes(languageCode) ? languageCode : "en";
    const res = await fetch(
      `https://api.quran.com/api/v4/verses/by_page/${pageNumber}?words=true&word_fields=text_uthmani,translation&language=${lang}`,
    );
    const data = await res.json();
    if (data && data.verses) return data.verses;
    return null;
  } catch (error) {
    console.error("Word by word verisi çekilemedi:", error);
    return null;
  }
}

const SUBHANEKE_RE =
  /s[üu]bh[âa]neke|سُبْحَانَكَ|سبحانك|glory|praise|noksan|münezzeh/i;

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
}: any) => {
  const cellClass =
    "flex items-center gap-3 py-2 px-2 border-b border-amber-900/10 dark:border-amber-100/10 hover:bg-amber-50/60 dark:hover:bg-amber-900/15 rounded-xl transition-colors group";
  const textClass = [
    `flex-1 ${mode === "ARABIC" ? "font-quran" : "font-serif"}`,
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

const SurahVerseGrid = ({ babs, activeTab, fontLevel }: any) => {
  const isRtl = activeTab === "ARABIC";
  const fontClass =
    activeTab === "ARABIC"
      ? fontSizes.ARABIC[fontLevel]
      : activeTab === "LATIN"
        ? fontSizes.LATIN[fontLevel]
        : fontSizes.MEANING[fontLevel];
  const items = babs
    .map((b: any) =>
      activeTab === "ARABIC"
        ? b.arabic
        : activeTab === "LATIN"
          ? b.transcript
          : b.meaning,
    )
    .filter((t: any) => t?.trim().length > 0);
  const parsed = items.map((item: any, idx: number) => {
    const cleaned = item.replace(/^"+|"+$/g, "").trim();
    const m = cleaned.match(/^(\d+)[-.:]\s*([\s\S]*)/);
    const rawText = m ? m[2].trim() : cleaned;
    return {
      num: m ? parseInt(m[1]) : idx + 1,
      text: rawText.replace(/^"+|"+$/g, "").trim(),
    };
  });

  const rows: Array<any> = [];
  for (let i = 0; i < parsed.length; i += 2) {
    rows.push([parsed[i], parsed[i + 1] ?? null]);
  }
  const cellClass =
    "flex items-center gap-3 py-2 px-2 border-b border-amber-900/10 dark:border-amber-100/10 hover:bg-amber-50/60 dark:hover:bg-amber-900/15 rounded-xl transition-colors group";
  const textClass = [
    `flex-1 ${activeTab === "ARABIC" ? "font-quran" : "font-serif"}`,
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

const CevsenGridDisplay = ({ text, fontLevel, mode = "ARABIC" }: any) => {
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
        className={`${mode === "ARABIC" ? "font-quran" : "font-serif"} leading-[2.4] py-2 text-center text-gray-800 dark:text-gray-100 ${fontClass}`}
        dir={isRtl ? "rtl" : "ltr"}
      >
        {text.replace(/###\s*$/, "").trim()}
      </div>
    );
  }

  const rows: Array<[string, string | null]> = [];
  for (let i = 0; i < items.length; i += 2)
    rows.push([items[i], items[i + 1] ?? null]);

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
                className={`${mode === "ARABIC" ? "font-quran" : "font-serif"} text-amber-900 dark:text-amber-400 leading-[2.4] ${fontClass}`}
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
                className={`font-serif font-black leading-[2.6] tracking-wide text-red-700 dark:text-red-500 ${mode === "ARABIC" ? fontClass : mode === "LATIN" ? `italic ${fontSizes.LATIN[fontLevel]}` : fontSizes.MEANING[fontLevel]}`}
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

const ReadingModal: React.FC<ReadingModalProps> = ({
  content,
  onClose,
  onUpdateContent,
  session,
  userName,
  localCounts,
  onDecrementCount,
  t,
  onCompleteAssignment,
}) => {
  const { language } = useLanguage();
  const [fontLevel, setFontLevel] = useState(3);
  const [activeTab, setActiveTab] = useState<ViewMode>("ARABIC");

  const [activeQuranTab, setActiveQuranTab] = useState<
    "ORIGINAL" | "MEAL" | "INTERACTIVE"
  >("ORIGINAL");

  const [originalData, setOriginalData] = useState<any[]>([]);
  const [loadingOriginal, setLoadingOriginal] = useState(true);

  const [mealData, setMealData] = useState<any[]>([]);
  const [loadingMeal, setLoadingMeal] = useState(false);

  const [interactiveData, setInteractiveData] = useState<any[]>([]);
  const [loadingInteractive, setLoadingInteractive] = useState(false);
  const [activeWordId, setActiveWordId] = useState<number | null>(null);
  const [currentSurahName, setCurrentSurahName] = useState<string>("");

  // SESLENDİRME (AUDIO) STATE'LERİ
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudioIndex, setCurrentAudioIndex] = useState<number | null>(
    null,
  );
  const [pageAudioAyahs, setPageAudioAyahs] = useState<string[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSepia, setIsSepia] = useState(false);

  const [isRestoring, setIsRestoring] = useState(true);
  const latestScrollY = useRef<number>(0);

  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [autoScrollSpeed, setAutoScrollSpeed] = useState(1);

  const currentPage = content.currentUnit || content.startUnit || 1;
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const safeStart = content.startUnit || currentPage;
  const safeEnd = content.endUnit || currentPage;
  const totalPages = safeEnd - safeStart + 1;
  const currentPageIdx = currentPage - safeStart;
  const initialProgress =
    totalPages > 1 ? (currentPageIdx * 100) / totalPages : 0;

  const storageKey = useMemo(() => {
    if (content.assignmentId)
      return `readcircle_progress_assign_${content.assignmentId}`;
    if (content.codeKey) return `readcircle_progress_code_${content.codeKey}`;
    return `readcircle_progress_type_${content.type}`;
  }, [content.assignmentId, content.codeKey, content.type]);

  // Ses dosyasını durdurma işlemleri (sayfa değişince veya kapatılınca)
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    setIsPlaying(false);
    setCurrentAudioIndex(null);
  }, [currentPage]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  // ORIGINAL veri, Surah ismini ve Arka Planda Ses URL'lerini çekme useEffect'i
  useEffect(() => {
    if (content.type === "QURAN") {
      let isMounted = true;
      setLoadingOriginal(true);
      fetch(`https://api.alquran.cloud/v1/page/${currentPage}/quran-simple`)
        .then((res) => res.json())
        .then((data) => {
          if (isMounted && data.code === 200 && data.data?.ayahs?.length > 0) {
            const surahs = Array.from(
              new Set(data.data.ayahs.map((a: any) => a.surah.englishName)),
            );
            setCurrentSurahName(surahs.join(" & "));
            setOriginalData(data.data.ayahs);
          }
        })
        .catch((err) => console.error("Metin alınamadı:", err))
        .finally(() => {
          if (isMounted) setLoadingOriginal(false);
        });

      // Ses verilerini gizlice arka planda çek (Alafasy Edition)
      fetch(`https://api.alquran.cloud/v1/page/${currentPage}/ar.alafasy`)
        .then((res) => res.json())
        .then((data) => {
          if (isMounted && data.code === 200 && data.data?.ayahs) {
            setPageAudioAyahs(data.data.ayahs.map((a: any) => a.audio));
          }
        })
        .catch((err) => console.error("Ses alınamadı:", err));

      return () => {
        isMounted = false;
      };
    }
  }, [currentPage, content.type]);

  // Ses Çalma Fonksiyonu
  const playAudio = (index: number) => {
    if (!pageAudioAyahs[index]) return;

    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    audioRef.current.src = pageAudioAyahs[index];
    audioRef.current
      .play()
      .then(() => {
        setIsPlaying(true);
        setCurrentAudioIndex(index);
      })
      .catch((err) => {
        console.error("Ses çalma hatası:", err);
        setIsPlaying(false);
      });

    audioRef.current.onended = () => {
      if (index + 1 < pageAudioAyahs.length) {
        playAudio(index + 1); // Sonraki ayete geç
      } else {
        setIsPlaying(false);
        setCurrentAudioIndex(null); // Sayfa bitti
      }
    };
  };

  // Play/Pause Butonu Aksiyonu
  const toggleAudio = () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      if (pageAudioAyahs.length === 0) return;
      if (currentAudioIndex !== null) {
        audioRef.current
          ?.play()
          .then(() => setIsPlaying(true))
          .catch(console.error);
      } else {
        playAudio(0); // Baştan başla
      }
    }
  };

  // Ayarların geri yüklenmesi ve scroll
  useEffect(() => {
    const savedFont = localStorage.getItem("readcircle_font_level");
    if (savedFont) setFontLevel(Number(savedFont));
    setIsRestoring(true);
    try {
      const savedProgress = localStorage.getItem(storageKey);
      if (savedProgress && !content.ignoreSavedProgress) {
        const { unit, scrollY } = JSON.parse(savedProgress);
        const validUnit = Math.max(
          content.startUnit || 1,
          Math.min(unit, content.endUnit || 604),
        );
        if (validUnit !== (content.currentUnit || content.startUnit || 1)) {
          onUpdateContent({ ...content, currentUnit: validUnit });
        }
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
    } catch (e) {
      setIsRestoring(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  const handleFontChange = (newLevel: number) => {
    setFontLevel(newLevel);
    localStorage.setItem("readcircle_font_level", newLevel.toString());
  };

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
      latestScrollY.current = scrollTop;
      updateProgressBar(scrollTop, scrollHeight - clientHeight);
    }
  };

  useEffect(() => {
    if (isRestoring) return;
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
      latestScrollY.current = 0;
      const { scrollHeight, clientHeight } = scrollContainerRef.current;
      updateProgressBar(0, scrollHeight - clientHeight);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  useEffect(() => {
    if (isRestoring) return;
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        scrollContainerRef.current;
      updateProgressBar(scrollTop, scrollHeight - clientHeight);
    }
  }, [activeTab, activeQuranTab, isFullscreen, updateProgressBar, isRestoring]);

  useEffect(() => {
    if (isRestoring) return;
    const saveProgress = () => {
      const payload = JSON.stringify({
        unit: currentPage,
        scrollY: latestScrollY.current,
      });
      localStorage.setItem(storageKey, payload);
    };
    const interval = setInterval(saveProgress, 2000);
    return () => {
      clearInterval(interval);
      saveProgress();
    };
  }, [storageKey, currentPage, isRestoring]);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el || !isAutoScrolling) return;

    let animationFrameId: number;
    let lastTime: number | null = null;
    let exactScrollY = el.scrollTop;
    const maxScroll = el.scrollHeight - el.clientHeight;
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
    return () => cancelAnimationFrame(animationFrameId);
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

  const wakeLockRef = useRef<any>(null);
  useEffect(() => {
    const requestWakeLock = async () => {
      try {
        if ("wakeLock" in navigator)
          wakeLockRef.current = await (navigator as any).wakeLock.request(
            "screen",
          );
      } catch (err) {}
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

  // Meal ve İnteraktif veriyi çekme
  useEffect(() => {
    if (content.type === "QURAN") {
      if (activeQuranTab === "MEAL") {
        setLoadingMeal(true);
        setMealData([]);
        const targetEdition =
          EDITION_MAPPING[language] || EDITION_MAPPING["default"];
        fetchQuranTranslationPage(currentPage, targetEdition)
          .then((result) => {
            if (result) setMealData(result.ayahs);
          })
          .finally(() => setLoadingMeal(false));
      } else if (activeQuranTab === "INTERACTIVE") {
        setLoadingInteractive(true);
        setInteractiveData([]);
        fetchWordByWordPage(currentPage, language)
          .then((verses) => {
            if (verses) setInteractiveData(verses);
          })
          .finally(() => setLoadingInteractive(false));
      }
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
      [
        "FATIHA",
        "YASIN",
        "FETIH",
        "WAQIA",
        "AYETELKURSU",
        "IHLAS",
        "FELAK",
        "NAS",
      ].includes(codeKey);

    if (isBedirGroup) {
      const rawArabic = content.cevsenData.map((b) => b.arabic).join("\n");
      const rawLatin = content.cevsenData.map((b) => b.transcript).join("\n");
      const rawMeaning = content.cevsenData.map((b) => b.meaning).join("\n");

      const splitRegex = /###|\r\n|\r|\n/g;
      const arabicLines = rawArabic
        .split(splitRegex)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);
      const latinLines = rawLatin
        .split(splitRegex)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);
      const meaningLines = rawMeaning
        .split(splitRegex)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      const totalLen = Math.max(
        arabicLines.length,
        latinLines.length,
        meaningLines.length,
      );
      const masterList: CevsenBab[] = [];

      for (let i = 0; i < totalLen; i++) {
        masterList.push({
          babNumber: i + 1,
          arabic: arabicLines[i] || "",
          transcript: latinLines[i] || "",
          meaning: meaningLines[i] || "",
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

  const changePage = async (offset: number) => {
    const current = content.currentUnit || content.startUnit || 1;
    const min = content.startUnit || 1;
    const max = content.endUnit || 604;
    const next = Math.min(Math.max(current + offset, min), max);

    if (next !== current) {
      onUpdateContent({ ...content, currentUnit: next });
      if (typeof navigator !== "undefined" && navigator.vibrate)
        navigator.vibrate(30);

      if (offset > 0 && content.type === "QURAN") {
        try {
          const todayStr = new Date().toISOString().split("T")[0];
          const savedDataStr = localStorage.getItem("hatim_progress_today");
          let currentCount = 0;
          if (savedDataStr) {
            const parsed = JSON.parse(savedDataStr);
            if (parsed.date === todayStr) currentCount = parsed.count;
          }
          localStorage.setItem(
            "hatim_progress_today",
            JSON.stringify({ date: todayStr, count: currentCount + 1 }),
          );
          window.dispatchEvent(new Event("hatim_progress_updated"));

          const token = localStorage.getItem("token");
          if (token) {
            await fetch(
              `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/quran-progress/read-page`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              },
            );
          }
        } catch (err) {
          console.error("İlerleme kaydedilemedi:", err);
        }
      }
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
    if (activeWordId) setActiveWordId(null);
    if (content.assignmentId && isOwner) {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
        if (safeCount > 0) {
          onDecrementCount(content.assignmentId);
          if (typeof navigator !== "undefined" && navigator.vibrate)
            navigator.vibrate(50);
          if (safeCount === 1 && onCompleteAssignment) {
            onCompleteAssignment(content.assignmentId);
            onClose();
          }
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
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (
      !isAutoScrolling ||
      touchStartX.current === null ||
      touchStartY.current === null
    )
      return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    if (
      Math.abs(currentX - touchStartX.current) > 10 ||
      Math.abs(currentY - touchStartY.current) > 10
    ) {
      setIsAutoScrolling(false);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchStartX.current - touchEndX;
    const deltaY = touchStartY.current - touchEndY;
    const isRtlReading = content.type === "QURAN" || activeTab === "ARABIC";

    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 0) {
        changePage(isRtlReading ? -1 : 1);
      } else {
        changePage(isRtlReading ? 1 : -1);
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const isFirstPage = currentPage === (content.startUnit || 1);
  const isLastPage = currentPage === (content.endUnit || 604);
  const isSurahGroup = processedData?.isSurah || false;

  const PaginationBar = () => {
    const displayCurrentPage =
      content.type === "QURAN" && currentPage > 1
        ? currentPage - 1
        : currentPage;
    const currentJuz =
      content.type === "QURAN" ? Math.ceil(displayCurrentPage / 20) : 0;
    const isRtlReading = content.type === "QURAN" || activeTab === "ARABIC";

    return (
      <div className="flex items-center justify-between gap-1 md:gap-3 w-full my-3 shrink-0 bg-white dark:bg-gray-900 p-1.5 md:p-2 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <button
          onClick={() => changePage(isRtlReading ? 1 : -1)}
          disabled={isRtlReading ? isLastPage : isFirstPage}
          className={`shrink-0 px-2.5 md:px-4 py-2 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-wider md:tracking-widest flex items-center gap-1 md:gap-2 transition-all ${
            isRtlReading
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 disabled:opacity-20"
              : "bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-20"
          }`}
        >
          <span>←</span>{" "}
          <span className="hidden sm:inline-block">
            {isRtlReading ? t("next") || "Sonraki" : t("previous") || "Önceki"}
          </span>
        </button>

        <span className="flex-1 min-w-0 px-1 font-black text-[10px] md:text-xs text-gray-800 dark:text-white uppercase tracking-wider md:tracking-[0.2em] flex flex-col items-center leading-tight text-center">
          {content.type === "QURAN" && (
            <span className="text-[8px] md:text-[10px] text-emerald-600 dark:text-emerald-400 opacity-90 mb-0.5 truncate w-full">
              {(t("juzWord") || "Cüz").toUpperCase()} {currentJuz}{" "}
              {currentSurahName && <span className="mx-1 opacity-50">•</span>}{" "}
              {currentSurahName}
            </span>
          )}
          <span className="truncate w-full">
            {t("pageWord") || "Sayfa"} {displayCurrentPage}
          </span>
        </span>

        <button
          onClick={() => changePage(isRtlReading ? -1 : 1)}
          disabled={isRtlReading ? isFirstPage : isLastPage}
          className={`shrink-0 px-2.5 md:px-4 py-2 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-wider md:tracking-widest flex items-center gap-1 transition-all ${
            isRtlReading
              ? "bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-20"
              : "bg-blue-600 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 disabled:opacity-20"
          }`}
        >
          <span className="hidden sm:inline-block">
            {isRtlReading ? t("previous") || "Önceki" : t("next") || "Sonraki"}
          </span>{" "}
          <span>→</span>
        </button>
      </div>
    );
  };

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300 ${isFullscreen ? "p-0" : "p-2 md:p-4"}`}
    >
      <div
        className={`relative w-full max-w-4xl overflow-hidden flex flex-col transition-all duration-500 ${isSepia ? "sepia-theme !bg-[#F4ECD8]" : "bg-gray-100 dark:bg-black"} ${isFullscreen ? "h-screen max-h-screen rounded-none border-none" : "max-h-[95vh] rounded-[1.5rem] md:rounded-[2.5rem] border border-white/10 dark:border-gray-800 shadow-2xl"}`}
      >
        <div className="absolute top-0 left-0 w-full h-[3px] bg-black/5 dark:bg-white/5 z-[60]">
          <div
            ref={progressBarRef}
            className="h-full bg-emerald-500 dark:bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.8)] origin-left"
            style={{ transform: `scaleX(${initialProgress / 100})` }}
          />
        </div>

        {!isFullscreen && (
          <div className="p-4 md:p-5 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex flex-col gap-3 shrink-0 shadow-sm z-20 animate-in slide-in-from-top-4">
            <div className="flex justify-between items-center gap-2">
              <h3 className="font-black text-base md:text-xl tracking-tight text-gray-800 dark:text-white truncate">
                {getDisplayTitle()}
              </h3>

              {/* min-w-0 ve flex-1 ile taşmayı engelledik */}
              <div className="flex flex-1 min-w-0 items-center justify-end gap-1.5 md:gap-3">
                {!(isSurahGroup && activeTab === "ARABIC") && (
                  <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-1 border border-gray-200 dark:border-gray-700 overflow-x-auto hide-scrollbar scroll-smooth">
                    {/* SESLENDİRME BUTONU */}
                    {content.type === "QURAN" && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleAudio();
                          }}
                          disabled={pageAudioAyahs.length === 0}
                          className={`h-7 md:h-8 px-2 md:px-2.5 shrink-0 flex items-center justify-center gap-1.5 rounded-lg transition-all duration-300 disabled:opacity-30 font-black text-[9px] md:text-[10px] uppercase tracking-wider ${isPlaying ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400 shadow-inner" : "hover:bg-white dark:hover:bg-gray-700 text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400"}`}
                          title={
                            isPlaying ? "Sesi Durdur" : "Sayfayı Seslendir"
                          }
                        >
                          {isPlaying ? (
                            <>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-3.5 h-3.5"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                              >
                                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                              </svg>
                              {/* Mobilde yazıyı gizler (hidden sm:inline) */}
                              <span className="hidden sm:inline">DURDUR</span>
                            </>
                          ) : (
                            <>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-3.5 h-3.5"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                              >
                                <path d="M8 5v14l11-7z" />
                              </svg>
                              <span className="hidden sm:inline">DİNLE</span>
                            </>
                          )}
                        </button>
                        <div className="w-px h-4 shrink-0 bg-gray-300 dark:bg-gray-600 mx-0.5 md:mx-1"></div>
                      </>
                    )}

                    <button
                      onClick={() =>
                        handleFontChange(Math.max(0, fontLevel - 1))
                      }
                      disabled={fontLevel === 0}
                      title={t("decreaseFont")}
                      className="w-7 h-7 md:w-8 md:h-8 shrink-0 flex items-center justify-center hover:bg-white dark:hover:bg-gray-700 rounded-lg disabled:opacity-30 transition font-serif font-bold text-gray-600 dark:text-gray-300 text-[10px] md:text-xs shadow-sm"
                    >
                      A-
                    </button>
                    <div className="w-px h-4 shrink-0 bg-gray-300 dark:bg-gray-600 mx-0.5 md:mx-1"></div>
                    <button
                      onClick={() =>
                        handleFontChange(Math.min(8, fontLevel + 1))
                      }
                      disabled={fontLevel === 8}
                      title={t("increaseFont")}
                      className="w-7 h-7 md:w-8 md:h-8 shrink-0 flex items-center justify-center hover:bg-white dark:hover:bg-gray-700 rounded-lg disabled:opacity-30 transition font-serif font-bold text-gray-600 dark:text-gray-300 text-[13px] md:text-base shadow-sm"
                    >
                      A+
                    </button>
                    <div className="w-px h-4 shrink-0 bg-gray-300 dark:bg-gray-600 mx-0.5 md:mx-1"></div>
                    <button
                      onClick={() => {
                        setIsSepia(!isSepia);
                        if (
                          typeof navigator !== "undefined" &&
                          navigator.vibrate
                        )
                          navigator.vibrate(20);
                      }}
                      className={`w-7 h-7 md:w-8 md:h-8 shrink-0 flex items-center justify-center rounded-lg transition-all duration-300 ${isSepia ? "bg-[#432C0A]/10 text-[#432C0A] shadow-inner" : "hover:bg-white dark:hover:bg-gray-700 text-amber-600 dark:text-amber-500 hover:text-amber-800"}`}
                      title={t("eyeProtection") || "Okuma Modu"}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-3.5 h-3.5 md:w-4 md:h-4"
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
                    <div className="w-px h-4 shrink-0 bg-gray-300 dark:bg-gray-600 mx-0.5 md:mx-1"></div>
                    <button
                      onClick={() => {
                        setIsFullscreen(true);
                        if (
                          typeof navigator !== "undefined" &&
                          navigator.vibrate
                        )
                          navigator.vibrate(20);
                      }}
                      className="w-7 h-7 md:w-8 md:h-8 shrink-0 flex items-center justify-center rounded-lg transition-all duration-300 hover:bg-white dark:hover:bg-gray-700 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                      title={t("fullscreen")}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-3.5 h-3.5 md:w-4 md:h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                      </svg>
                    </button>
                    <div className="w-px h-4 shrink-0 bg-gray-300 dark:bg-gray-600 mx-0.5 md:mx-1"></div>

                    {/* KAYDIRMA BUTONU */}
                    <button
                      onClick={() => {
                        setIsAutoScrolling(!isAutoScrolling);
                        if (
                          typeof navigator !== "undefined" &&
                          navigator.vibrate
                        )
                          navigator.vibrate(20);
                      }}
                      className={`h-7 md:h-8 px-2 md:px-2.5 shrink-0 flex items-center justify-center gap-1.5 rounded-lg transition-all duration-300 font-black text-[9px] md:text-[10px] uppercase tracking-wider ${isAutoScrolling ? "bg-blue-600/15 text-blue-600 dark:text-blue-400 shadow-inner" : "hover:bg-white dark:hover:bg-gray-700 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400"}`}
                      title={isAutoScrolling ? "Durdur" : "Kaydır"}
                    >
                      {isAutoScrolling ? (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-3.5 h-3.5"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M6 6h4v12H6zm8 0h4v12h-4z" />
                          </svg>
                          <span className="hidden sm:inline">DURDUR</span>
                        </>
                      ) : (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-3.5 h-3.5"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                          <span className="hidden sm:inline">KAYDIR</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
                <button
                  onClick={onClose}
                  className="bg-gray-200 dark:bg-gray-800 shrink-0 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 text-gray-500 dark:text-gray-400 p-1.5 md:p-2 rounded-full transition-all duration-200 active:scale-90"
                  title={t("close") || "Kapat"}
                >
                  <svg
                    className="w-4 h-4 md:w-5 md:h-5"
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
              <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto hide-scrollbar">
                <button
                  onClick={() => setActiveQuranTab("ORIGINAL")}
                  className={`flex-1 min-w-[80px] py-2 px-2 text-[10px] md:text-xs font-bold rounded-lg transition-all uppercase tracking-wider ${activeQuranTab === "ORIGINAL" ? "bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm" : "text-gray-500 hover:text-gray-700 dark:text-gray-400"}`}
                >
                  {t("tabOriginal") || "Orijinal Metin"}
                </button>
                <button
                  onClick={() => setActiveQuranTab("INTERACTIVE")}
                  className={`flex-1 min-w-[80px] py-2 px-2 text-[10px] md:text-xs font-bold rounded-lg transition-all uppercase tracking-wider ${activeQuranTab === "INTERACTIVE" ? "bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm" : "text-gray-500 hover:text-gray-700 dark:text-gray-400"}`}
                >
                  {t("Interactive") || "İnteraktif"}
                </button>
                <button
                  onClick={() => setActiveQuranTab("MEAL")}
                  className={`flex-1 min-w-[80px] py-2 px-2 text-[10px] md:text-xs font-bold rounded-lg transition-all uppercase tracking-wider ${activeQuranTab === "MEAL" ? "bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm" : "text-gray-500 hover:text-gray-700 dark:text-gray-400"}`}
                >
                  {t("Meaning") || "Meal"}
                </button>
              </div>
            )}

            {content.type !== "SIMPLE" && content.type !== "QURAN" && (
              <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                {(["ARABIC", "LATIN", "MEANING"] as const).map((tab) => {
                  if (
                    tab === "MEANING" &&
                    (content.codeKey === "BEDIR" || content.codeKey === "UHUD")
                  )
                    return null;
                  if (tab === "LATIN" && content.codeKey === "TEVHIDNAME")
                    return null;
                  if (content.codeKey === "OZELSALAVAT" && tab === "LATIN")
                    return null;
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 py-2 rounded-lg text-[10px] md:text-xs font-black transition-all duration-300 uppercase tracking-widest ${activeTab === tab ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-white shadow-md transform scale-[1.02]" : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"}`}
                    >
                      {t(`tab${tab.charAt(0) + tab.slice(1).toLowerCase()}`) ||
                        tab}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

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
          onTouchMove={handleTouchMove}
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
              {!isFullscreen && <PaginationBar />}
              <div
                className={`flex-1 w-full rounded-[2rem] p-2 md:p-4 border shadow-sm min-h-[50vh] relative transition-colors ${isSepia ? "bg-[#F4ECD8] border-[#E6D5B8]" : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"}`}
              >
                {/* YENİ Orijinal Metin (Text-Based) GÖRÜNÜMÜ */}
                {activeQuranTab === "ORIGINAL" ? (
                  <div className="w-full h-full p-4 md:p-8 flex flex-col items-center">
                    {loadingOriginal ? (
                      <div className="flex flex-col items-center justify-center h-40">
                        <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      <div
                        className="text-justify text-center w-full max-w-4xl mx-auto leading-[2.25rem] md:leading-[3rem]"
                        dir="rtl"
                      >
                        {originalData.map((ayah: any, idx: number) => (
                          <React.Fragment key={ayah.number}>
                            <span
                              className={`font-quran transition-colors cursor-pointer ${
                                currentAudioIndex === idx
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-gray-900 dark:text-gray-100 hover:text-emerald-700 dark:hover:text-emerald-300"
                              } ${fontSizes.ARABIC[fontLevel] || "text-3xl"}`}
                              style={{ lineHeight: "normal" }}
                              onClick={(e) => {
                                e.stopPropagation();
                                playAudio(idx);
                              }}
                              title="Dinlemek için tıkla"
                            >
                              {ayah.text}
                            </span>
                            <span className="inline-flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-amber-500/30 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs md:text-sm font-black shadow-sm mx-2 align-middle">
                              {ayah.numberInSurah}
                            </span>
                          </React.Fragment>
                        ))}
                      </div>
                    )}
                  </div>
                ) : activeQuranTab === "INTERACTIVE" ? (
                  <div className="w-full h-full p-2 md:p-4">
                    {loadingInteractive ? (
                      <div className="flex flex-col items-center justify-center h-40">
                        <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      <div className="flex flex-col space-y-6 md:space-y-8">
                        {interactiveData.map((verse: any, idx: number) => (
                          <div
                            key={verse.id}
                            className={`flex flex-col rounded-[1.5rem] p-4 md:p-6 shadow-sm border transition-colors cursor-pointer ${
                              currentAudioIndex === idx
                                ? "bg-emerald-50/50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700"
                                : "bg-white/50 dark:bg-gray-800/30 border-amber-900/10 dark:border-amber-100/10 hover:border-emerald-200 dark:hover:border-emerald-800"
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              playAudio(idx);
                            }}
                            title="Dinlemek için tıkla"
                          >
                            <div
                              className="flex flex-wrap justify-start gap-x-3 md:gap-x-4 gap-y-5 md:gap-y-6 leading-[2rem]"
                              dir="rtl"
                            >
                              {verse.words.map((word: any) => (
                                <div
                                  key={word.id}
                                  className={`relative group cursor-pointer flex flex-col items-center justify-center ${word.char_type_name === "end" ? "mx-2" : ""}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveWordId(
                                      activeWordId === word.id ? null : word.id,
                                    );
                                  }}
                                >
                                  {word.char_type_name === "end" ? (
                                    <span className="flex items-center justify-center w-9 h-9 md:w-11 md:h-11 rounded-full border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-sm md:text-base font-black shadow-sm mx-1">
                                      {word.text_uthmani}
                                    </span>
                                  ) : (
                                    <span
                                      className={`font-quran text-gray-800 dark:text-gray-100 transition-colors ${activeWordId === word.id ? "text-emerald-600 dark:text-emerald-400" : "lg:group-hover:text-emerald-600 dark:lg:group-hover:text-emerald-400"} ${fontSizes.ARABIC[fontLevel] || "text-2xl"}`}
                                    >
                                      {word.text_uthmani}
                                    </span>
                                  )}

                                  {word.char_type_name !== "end" &&
                                    word.translation?.text && (
                                      <div
                                        className={`absolute bottom-full mb-2 flex flex-col items-center transition-all duration-300 pointer-events-none z-10 ${activeWordId === word.id ? "opacity-100 scale-100" : "opacity-0 scale-95 lg:group-hover:opacity-100 lg:group-hover:scale-100"}`}
                                      >
                                        <div className="bg-gray-800 dark:bg-gray-700 text-white text-[10px] md:text-xs px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap font-sans font-medium">
                                          {word.translation.text}
                                        </div>
                                        <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-gray-800 dark:border-t-gray-700"></div>
                                      </div>
                                    )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-full p-2 md:p-4">
                    {loadingMeal ? (
                      <div className="flex flex-col items-center justify-center h-40 space-y-4">
                        <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {mealData.map((ayah: any, idx: number) => (
                          <div
                            key={idx}
                            className={`flex flex-col gap-2 p-3 rounded-2xl transition-colors cursor-pointer ${
                              currentAudioIndex === idx
                                ? "bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800"
                                : "border border-transparent hover:bg-gray-50 dark:hover:bg-gray-800"
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              playAudio(idx);
                            }}
                            title="Arapçasını dinlemek için tıkla"
                          >
                            <div className="flex items-start gap-3">
                              <span
                                className={`shrink-0 flex items-center justify-center w-6 h-6 text-[10px] font-black rounded-full shadow-sm mt-1 transition-colors ${
                                  currentAudioIndex === idx
                                    ? "bg-emerald-600 text-white"
                                    : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                                }`}
                              >
                                {ayah.numberInSurah}
                              </span>
                              <p
                                className={`leading-relaxed font-serif transition-all ${currentAudioIndex === idx ? "text-emerald-800 dark:text-emerald-300 font-medium" : "text-gray-700 dark:text-gray-300"} ${fontSizes.MEANING[fontLevel] || "text-base"}`}
                              >
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
            </div>
          )}

          {(content.type === "CEVSEN" || content.type === "SURAS") &&
            processedData && (
              <div className="space-y-3 max-w-3xl mx-auto px-1">
                {/* Diğer içerikler ... */}
              </div>
            )}
        </div>

        {!isFullscreen && (
          <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shrink-0 z-20 animate-in slide-in-from-bottom-4">
            <button
              onClick={onClose}
              className="w-full py-4 bg-gray-900 dark:bg-gray-800 text-white rounded-2xl hover:bg-black dark:hover:bg-gray-700 transition-all font-black uppercase tracking-[0.2em] text-xs shadow-lg active:scale-[0.98]"
            >
              {t("close") || "Kapat"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReadingModal;
