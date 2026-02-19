/* eslint-disable @next/next/no-img-element */
import React, { useState, useMemo, useEffect } from "react";
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

// --- TİPLER ---
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

// --- SABİTLER: Dil Koduna Göre Kaynak Eşleştirmesi ---
const EDITION_MAPPING: Record<string, string> = {
  tr: "tr.diyanet",
  en: "en.sahih",
  fr: "fr.hamidullah",
  de: "de.abullaimr",
  ru: "ru.kuliev",
  id: "id.indonesian",
  az: "az.mammadaliyev",
  ar: "ar.jalalayn",

  // ÖZEL: Kürtçe (Kurmançi) için özel bir işaretleyici kullanıyoruz
  ku: "special_quranenc_kurmanji",
  kmr: "special_quranenc_kurmanji", // Eğer dil kodun kmr ise

  default: "en.sahih",
};

// --- YARDIMCI FONKSİYON: QuranEnc API'den Veri İşleme ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchKurdishForPage(structureData: any) {
  try {
    // 1. Sayfadaki benzersiz sure numaralarını bul
    const surahsOnPage = new Set<number>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    structureData.forEach((ayah: any) => surahsOnPage.add(ayah.surah.number));

    // 2. Her bir sure için QuranEnc'ten veri çek (Latin Kürtçe)
    // DÜZELTME: API anahtarı 'kurdish_kurmanji' yerine 'kurmanji_ismail' yapıldı.
    const quranEncPromises = Array.from(surahsOnPage).map((surahNo) =>
      fetch(
        `https://quranenc.com/api/v1/translation/sura/kurmanji_ismail/${surahNo}`,
      )
        .then(async (res) => {
          if (!res.ok) {
            // Hata detayını konsola yazdıralım
            console.error(
              `QuranEnc Hatası (Sure: ${surahNo}):`,
              res.status,
              res.statusText,
            );
            throw new Error(`QuranEnc API hatası: ${res.status}`);
          }
          return res.json();
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .then((data) => ({ surahNo, result: data.result as any[] })),
    );

    const translations = await Promise.all(quranEncPromises);

    // 3. Çekilen veriyi hızlı erişim için haritala (Map)
    const translationMap: { [key: string]: string } = {};

    translations.forEach(({ surahNo, result }) => {
      if (Array.isArray(result)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        result.forEach((item: any) => {
          const key = `${String(surahNo)}:${String(item.aya)}`;
          translationMap[key] = item.translation;
        });
      }
    });

    // 4. Orijinal yapıdaki metinleri Kürtçe ile değiştir
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mergedData = structureData.map((ayah: any) => {
      const key = `${String(ayah.surah.number)}:${String(ayah.numberInSurah)}`;
      const kurdishText = translationMap[key];

      return {
        ...ayah,
        text: kurdishText || `[Çeviri bulunamadı] ${ayah.text}`,
      };
    });

    return {
      ayahs: mergedData,
    };
  } catch (error) {
    console.error("Kürtçe API Hatası (Detay):", error);
    return null;
  }
}

// --- YARDIMCI FONKSİYON: Ana API Çağrısı ---
async function fetchQuranTranslationPage(
  pageNumber: number,
  editionOrKey: string,
) {
  try {
    // A. EĞER KÜRTÇE İSE: ÖZEL MANTIK
    if (editionOrKey === "special_quranenc_kurmanji") {
      // Önce sayfa yapısını (hangi ayetler var) almak için hafif bir Arapça kaynak çek
      const structRes = await fetch(
        `https://api.alquran.cloud/v1/page/${pageNumber}/quran-uthmani`,
      );
      const structData = await structRes.json();

      if (structData.code === 200 && structData.data && structData.data.ayahs) {
        // Sonra bu yapıyı kullanarak QuranEnc'ten Kürtçeleri getir
        const kurdishResult = await fetchKurdishForPage(structData.data.ayahs);
        // Eğer Kürtçe çekme başarısız olduysa (CORS vb), null dön ki sonsuz döngü olmasın
        return kurdishResult;
      }
      return null;
    }

    // B. NORMAL DİLLER (Diyanet, Sahih vs.)
    const res = await fetch(
      `https://api.alquran.cloud/v1/page/${pageNumber}/${editionOrKey}`,
    );
    const data = await res.json();
    if (data.code === 200 && data.data && data.data.ayahs) {
      return {
        ayahs: data.data.ayahs,
      };
    }
    return null;
  } catch (error) {
    console.error("Meal çekilemedi:", error);
    return null;
  }
}

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

  // --- STATE'LER ---
  const [activeQuranTab, setActiveQuranTab] = useState<"ORIGINAL" | "MEAL">(
    "ORIGINAL",
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [mealData, setMealData] = useState<any[]>([]);
  const [loadingMeal, setLoadingMeal] = useState(false);

  const currentPage = content.currentUnit || content.startUnit || 1;

  // --- EFFECT: Dinamik Meal Verisini Çekme ---
  useEffect(() => {
    if (content.type === "QURAN" && activeQuranTab === "MEAL") {
      setLoadingMeal(true);
      setMealData([]); // Önceki veriyi temizle

      // 1. Dil koduna göre kaynağı seç (tr -> tr.diyanet, ku -> special...)
      const targetEdition =
        EDITION_MAPPING[language] || EDITION_MAPPING["default"];

      // 2. API çağrısını yap
      fetchQuranTranslationPage(currentPage, targetEdition)
        .then((result) => {
          if (result) {
            setMealData(result.ayahs);
          }
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

  // --- MERKEZİ VERİ İŞLEME MANTIĞI (Processed Data) ---
  const processedData = useMemo(() => {
    if (
      (content.type !== "CEVSEN" && content.type !== "SURAS") ||
      !content.cevsenData
    )
      return null;

    const codeKey = (content.codeKey || "").toUpperCase();
    const isBedirGroup = ["BEDIR", "UHUD", "TEVHIDNAME"].includes(codeKey);
    const isSurahGroup =
      content.type === "SURAS" || ["YASIN", "FETIH"].includes(codeKey);

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
        } as CevsenBab);
      }

      if (content.startUnit && content.endUnit) {
        const rangeCount = content.endUnit - content.startUnit + 1;
        const slicedData: CevsenBab[] = [];
        for (let i = 0; i < rangeCount; i++) {
          const targetIndex = (content.startUnit - 1 + i) % totalLen;
          if (masterList[targetIndex]) {
            slicedData.push({ ...masterList[targetIndex] });
          }
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
            } as CevsenBab);
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

  // --- SAYFA DEĞİŞTİRME ---
  const changePage = (offset: number) => {
    const current = content.currentUnit || content.startUnit || 1;
    const min = content.startUnit || 1;
    const max = content.endUnit || 604;
    const next = Math.min(Math.max(current + offset, min), max);
    if (next !== current) {
      onUpdateContent({ ...content, currentUnit: next });
    }
  };

  const isFirstPage = currentPage === (content.startUnit || 1);
  const isLastPage = currentPage === (content.endUnit || 604);
  const isSurahGroup = processedData?.isSurah || false;
  const isBedirGroup = processedData?.mode === "LIST";

  // --- NAVİGASYON BİLEŞENİ ---
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-gray-100 dark:bg-black rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[95vh] border border-white/10 dark:border-gray-800">
        {/* --- HEADER --- */}
        <div className="p-4 md:p-5 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex flex-col gap-3 shrink-0 shadow-sm z-20">
          <div className="flex justify-between items-center">
            <h3 className="font-black text-base md:text-xl tracking-tight text-gray-800 dark:text-white truncate mr-2">
              {getDisplayTitle()}
            </h3>
            <div className="flex items-center gap-2 md:gap-3">
              {!(isSurahGroup && activeTab === "ARABIC") &&
                content.type !== "QURAN" && (
                  <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-1 border border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => setFontLevel((p) => Math.max(0, p - 1))}
                      disabled={fontLevel === 0}
                      className="w-8 h-8 flex items-center justify-center hover:bg-white dark:hover:bg-gray-700 rounded-lg disabled:opacity-30 transition font-serif font-bold text-gray-600 dark:text-gray-300 text-xs shadow-sm"
                    >
                      A-
                    </button>
                    <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1"></div>
                    <button
                      onClick={() => setFontLevel((p) => Math.min(8, p + 1))}
                      disabled={fontLevel === 8}
                      className="w-8 h-8 flex items-center justify-center hover:bg-white dark:hover:bg-gray-700 rounded-lg disabled:opacity-30 transition font-serif font-bold text-gray-600 dark:text-gray-300 text-base shadow-sm"
                    >
                      A+
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

          {/* --- KURAN SEKMELERİ --- */}
          {content.type === "QURAN" && (
            <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveQuranTab("ORIGINAL")}
                className={`flex-1 py-2 text-xs md:text-sm font-bold rounded-lg transition-all ${activeQuranTab === "ORIGINAL" ? "bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm" : "text-gray-500 hover:text-gray-700 dark:text-gray-400"}`}
              >
                {t("Original") || "Orijinal"}
              </button>
              <button
                onClick={() => setActiveQuranTab("MEAL")}
                className={`flex-1 py-2 text-xs md:text-sm font-bold rounded-lg transition-all ${activeQuranTab === "MEAL" ? "bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm" : "text-gray-500 hover:text-gray-700 dark:text-gray-400"}`}
              >
                {t("tabMeaning") || "Meal"}
              </button>
            </div>
          )}

          {/* --- DİĞER SEKMELER --- */}
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

        {/* --- CONTENT AREA --- */}
        <div className="flex-1 overflow-y-auto bg-gray-100 dark:bg-black p-4 md:p-6 scroll-smooth">
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

          {(content.type === "QURAN" ||
            (isSurahGroup && activeTab === "ARABIC")) && (
            <div className="flex flex-col items-center min-h-full max-w-2xl mx-auto pb-4">
              <PaginationBar />
              <div className="flex-1 w-full bg-white dark:bg-gray-900 rounded-[2rem] p-2 md:p-4 border border-gray-200 dark:border-gray-800 shadow-sm min-h-[50vh] relative">
                {activeQuranTab === "ORIGINAL" ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <img
                      // src={`https://raw.githubusercontent.com/GovarJabbar/Quran-PNG/master/${String(currentPage).padStart(3, "0")}.png`}
                      src={`https://quran.islam-db.com/data/pages/quranpages_1024/images/page${String(currentPage).padStart(3, "0")}.png`}
                      alt={`Page ${currentPage}`}
                      className="max-w-full h-auto object-contain rounded-xl dark:invert dark:opacity-90"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.parentElement!.innerHTML += `<div class="text-red-500 p-4 text-center text-xs">Page not found</div>`;
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-full h-full p-2 md:p-4">
                    {loadingMeal ? (
                      <div className="flex flex-col items-center justify-center h-40 space-y-4">
                        <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                          {t("loading")}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
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
            processedData &&
            !(isSurahGroup && activeTab === "ARABIC") && (
              <div className="space-y-3 max-w-3xl mx-auto px-1">
                {processedData.data.map((bab, index) => {
                  const mode = processedData.mode;
                  let displayLabel: string | number = bab.babNumber;
                  if (mode === "SURAH_CARD")
                    displayLabel = `${t("verse") || "Ayet"} ${bab.babNumber}`;
                  const isCard = mode === "LIST" || mode === "SURAH_CARD";
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
                        {activeTab === "ARABIC" && !isSurahGroup && (
                          <div
                            className={
                              isCard
                                ? "w-full"
                                : "text-center font-serif leading-[2.4] py-2 text-gray-800 dark:text-gray-100"
                            }
                            dir="rtl"
                          >
                            {isCard
                              ? renderUhudList(
                                  bab.arabic,
                                  "ARABIC",
                                  fontLevel,
                                  displayLabel,
                                )
                              : formatArabicText(bab.arabic, fontLevel)}
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
                            {isCard
                              ? renderUhudList(
                                  bab.transcript,
                                  "LATIN",
                                  fontLevel,
                                  displayLabel,
                                )
                              : formatLatinText(bab.transcript, fontLevel)}
                          </div>
                        )}
                        {activeTab === "MEANING" &&
                          mode !== "LIST" &&
                          (isCard ? (
                            <div className="w-full">
                              {renderUhudList(
                                bab.meaning,
                                "MEANING",
                                fontLevel,
                                displayLabel,
                              )}
                            </div>
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
                  {(() => {
                    const currentAssignment = session?.assignments.find(
                      (a) => a.id === content.assignmentId,
                    );
                    const isOwner =
                      currentAssignment &&
                      currentAssignment.assignedToName === userName;
                    const safeCount =
                      localCounts[content.assignmentId!] ??
                      (currentAssignment
                        ? currentAssignment.endUnit -
                          currentAssignment.startUnit +
                          1
                        : 0);
                    const totalTarget = currentAssignment
                      ? currentAssignment.endUnit -
                        currentAssignment.startUnit +
                        1
                      : 0;
                    return (
                      <Zikirmatik
                        currentCount={safeCount}
                        onDecrement={() =>
                          onDecrementCount(content.assignmentId!)
                        }
                        isModal={true}
                        t={t}
                        readOnly={!isOwner}
                        totalCount={totalTarget}
                      />
                    );
                  })()}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shrink-0 z-20">
          <button
            onClick={onClose}
            className="w-full py-4 bg-gray-900 dark:bg-gray-800 text-white rounded-2xl hover:bg-black dark:hover:bg-gray-700 transition-all font-black uppercase tracking-[0.2em] text-xs shadow-lg active:scale-[0.98]"
          >
            {t("close")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReadingModal;
