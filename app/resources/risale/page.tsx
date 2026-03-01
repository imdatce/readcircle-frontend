/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { RISALE_BOOKS, GITHUB_RAW_BASE } from "@/constants/risaleConfig";
import {
  RisaleBookCard,
  ChapterItem,
} from "@/components/resources/RisaleWidgets";

function RisaleContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  const bookParam = searchParams.get("book");
  const fileParam = searchParams.get("file");

  const [view, setView] = useState<"books" | "chapters" | "reading">("books");
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const [fontLevel, setFontLevel] = useState(3);
  const [isSepia, setIsSepia] = useState(false);
  const [autoScrollSpeed, setAutoScrollSpeed] = useState(1);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // === SON OKUNAN TAKİBİ İÇİN STATE ===
  const [lastRead, setLastRead] = useState<{ book: any; file: any } | null>(
    null,
  );

  useEffect(() => {
    const saved = localStorage.getItem("risale_last_read");
    if (saved) {
      try {
        setLastRead(JSON.parse(saved));
      } catch (e) {
        console.error("Okuma geçmişi yüklenemedi", e);
      }
    }
  }, [view]); // Görünüm her değiştiğinde geçmişi tazele

  const wakeLockRef = useRef<any>(null);
  useEffect(() => {
    const requestWakeLock = async () => {
      try {
        if ("wakeLock" in navigator && view === "reading") {
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
    if (view === "reading") requestWakeLock();
    else releaseWakeLock();
    return () => releaseWakeLock();
  }, [view]);

  const handleSelectBook = async (book: any, autoFile?: string) => {
    setSelectedBook(book);
    setLoading(true);
    setView("chapters");
    try {
      const res = await fetch(
        `/api/risale/files?folder=${encodeURIComponent(book.folder)}`,
      );
      if (res.ok) {
        const data = await res.json();
        const htmlFiles = data.filter((f: any) => f.name.endsWith(".html"));
        setChapters(htmlFiles);

        if (autoFile) {
          const targetFile = htmlFiles.find(
            (f: any) =>
              f.name.toLowerCase() === autoFile.toLowerCase() ||
              f.name.toLowerCase().includes(autoFile.toLowerCase()),
          );
          if (targetFile) handleSelectChapter(targetFile, book);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (!autoFile) setLoading(false);
    }
  };

  const handleSelectChapter = async (file: any, bookObj = selectedBook) => {
    setLoading(true);
    setView("reading");

    // === OKUMA GEÇMİŞİNİ KAYDET ===
    localStorage.setItem(
      "risale_last_read",
      JSON.stringify({ book: bookObj, file }),
    );

    try {
      const res = await fetch(
        `${GITHUB_RAW_BASE}/${encodeURIComponent(bookObj.folder)}/${encodeURIComponent(file.name)}`,
      );
      if (res.ok) {
        const html = await res.text();
        setContent(html);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bookParam) {
      const targetBook = RISALE_BOOKS.find(
        (b) => b.folder.toLowerCase() === bookParam.toLowerCase(),
      );
      if (targetBook && (!selectedBook || selectedBook.id !== targetBook.id)) {
        Promise.resolve().then(() =>
          handleSelectBook(targetBook, fileParam || undefined),
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookParam]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const toggleFullScreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  useEffect(() => {
    const root = window.document.documentElement;
    const currentTheme = localStorage.getItem("theme");

    if (isSepia) {
      root.classList.remove("dark");
    } else {
      if (currentTheme === "dark") root.classList.add("dark");
      else if (
        !currentTheme &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      )
        root.classList.add("dark");
    }
    return () => {
      if (currentTheme === "dark") root.classList.add("dark");
    };
  }, [isSepia]);

  // === OTOMATİK KAYDIRMA MANTIĞI ===
  useEffect(() => {
    if (!isAutoScrolling || view !== "reading") return;

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
  }, [isAutoScrolling, autoScrollSpeed, view, isFullscreen]);

  const cycleSpeed = () => {
    const speeds = [0.5, 1, 1.5, 2, 3];
    const nextIndex = (speeds.indexOf(autoScrollSpeed) + 1) % speeds.length;
    setAutoScrollSpeed(speeds[nextIndex]);
    if (typeof navigator !== "undefined" && navigator.vibrate)
      navigator.vibrate(15);
  };

  const handleFontChange = (level: number) => {
    setFontLevel(level);
    if (typeof navigator !== "undefined" && navigator.vibrate)
      navigator.vibrate(10);
  };

  const goBack = () => {
    if (view === "reading") {
      setIsAutoScrolling(false);
      setView("chapters");
      router.replace(`/resources/risale?book=${selectedBook.folder}`, {
        scroll: false,
      });
    } else if (view === "chapters") {
      setView("books");
      router.replace("/resources/risale", { scroll: false });
    } else {
      router.back();
    }
  };

  const handleBookCardClick = (book: any) => {
    router.replace(`/resources/risale?book=${book.folder}`, { scroll: false });
    handleSelectBook(book);
  };

  // === KALDIĞIM YERE GİT FONKSİYONU ===
  const handleContinueReading = () => {
    if (lastRead) {
      router.replace(
        `/resources/risale?book=${lastRead.book.folder}&file=${lastRead.file.name}`,
        { scroll: false },
      );
      handleSelectBook(lastRead.book, lastRead.file.name);
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${isSepia && view === "reading" ? "sepia-theme bg-[#F4ECD8]" : "bg-[#FDFCF7] dark:bg-[#061612] py-8"}`}
    >
      <div
        className={`max-w-4xl mx-auto space-y-6 ${isSepia && view === "reading" ? "py-8" : ""} px-4 sm:px-6`}
      >
        {view !== "reading" && (
          <div className="flex items-center justify-between bg-white/50 dark:bg-[#0a1f1a] backdrop-blur-md p-4 rounded-[2rem] border border-emerald-100/20 dark:border-emerald-900/30 shadow-sm">
            <button
              onClick={goBack}
              className="p-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-full transition-all group"
              title={t("back") || "Geri"}
            >
              <svg
                className="w-6 h-6 text-emerald-600 dark:text-emerald-400 group-hover:-translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <h1 className="text-sm md:text-base font-black text-emerald-800 dark:text-emerald-100 uppercase tracking-[0.2em]">
              {view === "books"
                ? t("risaleTitle") || "Risale-i Nur Külliyatı"
                : selectedBook?.name}
            </h1>
            <div className="w-10"></div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-emerald-600 dark:text-emerald-400 font-bold tracking-widest animate-pulse text-xs uppercase">
              {t("compilingTexts") || "Metin Hazırlanıyor..."}
            </p>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* KALDIĞIM YERDEN DEVAM ET BUTONU */}
            {view === "books" && lastRead && (
              <div className="mb-8">
                <button
                  onClick={handleContinueReading}
                  className="w-full flex items-center justify-between p-4 md:p-5 bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-700 dark:to-teal-800 hover:from-emerald-500 hover:to-teal-500 text-white rounded-[2rem] shadow-lg shadow-emerald-500/20 dark:shadow-emerald-900/30 transition-all duration-300 group active:scale-[0.98] border border-emerald-400/30 dark:border-emerald-500/20"
                >
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md group-hover:scale-110 transition-transform duration-300">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-black text-sm md:text-lg uppercase tracking-wider text-emerald-50">
                        {t("continueReading") || "Okumaya Devam Et"}
                      </h3>
                      <p className="text-emerald-100/80 text-xs md:text-sm font-medium mt-0.5 truncate max-w-[200px] md:max-w-md">
                        {lastRead.book.name} /{" "}
                        {lastRead.file.name.replace(".html", "")}
                      </p>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                    <svg
                      className="w-5 h-5 opacity-90 group-hover:opacity-100 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </button>
              </div>
            )}

            {/* KİTAPLAR GÖRÜNÜMÜ */}
            {view === "books" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {RISALE_BOOKS.map((book) => (
                  <RisaleBookCard
                    key={book.id}
                    book={book}
                    onClick={() => handleBookCardClick(book)}
                  />
                ))}
              </div>
            )}

            {/* BÖLÜM LİSTESİ */}
            {view === "chapters" && (
              <div className="bg-white/80 dark:bg-[#0a1f1a] rounded-[2.5rem] border border-emerald-100/50 dark:border-emerald-900/30 shadow-xl overflow-hidden p-2 md:p-4">
                <div className="grid grid-cols-1 gap-1">
                  {chapters.map((file, i) => (
                    <ChapterItem
                      key={i}
                      file={file}
                      onClick={() => {
                        router.replace(
                          `/resources/risale?book=${selectedBook.folder}&file=${file.name}`,
                          { scroll: false },
                        );
                        handleSelectChapter(file);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* OKUMA GÖRÜNÜMÜ */}
            {view === "reading" && (
              <div
                ref={scrollContainerRef}
                onPointerDown={(e) => {
                  const target = e.target as HTMLElement;
                  if (target.closest("button") || target.closest(".sticky"))
                    return;
                  if (isAutoScrolling) {
                    setIsAutoScrolling(false);
                    (window as any)._justStoppedScroll = true;
                    setTimeout(() => {
                      (window as any)._justStoppedScroll = false;
                    }, 300);
                  }
                }}
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  if (target.closest("button") || target.closest(".sticky"))
                    return;
                  if ((window as any)._justStoppedScroll) return;
                  toggleFullScreen();
                }}
                className={`relative transition-all duration-500 cursor-pointer ${!isAutoScrolling ? "scroll-smooth" : "scroll-auto"} ${isFullscreen ? `fixed inset-0 z-[9999] overflow-y-auto px-0 py-8 ${isSepia ? "sepia-theme bg-[#F4ECD8]" : "bg-[#FDFCF7] dark:bg-[#061612]"}` : "min-h-screen"}`}
              >
                {isFullscreen && (
                  <style>{`header, #sub-navigation { display: none !important; }`}</style>
                )}

                <div
                  className={`sticky z-50 p-3 md:p-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 flex flex-col gap-3 shrink-0 shadow-sm transition-all duration-500 ${isFullscreen ? "top-0 opacity-0 hover:opacity-100 pointer-events-auto" : "top-16 md:top-20 opacity-100 rounded-[2rem] border mt-[-1.5rem] mb-4"}`}
                >
                  <div className="flex justify-between items-center max-w-5xl mx-auto w-full px-2">
                    <h3 className="font-black text-xs md:text-base tracking-tight text-emerald-700 dark:text-emerald-400 truncate mr-2">
                      {selectedBook?.name}
                    </h3>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-2xl p-1.5 border border-gray-200 dark:border-gray-700">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFontChange(Math.max(0, fontLevel - 1));
                          }}
                          disabled={fontLevel === 0}
                          title={t("decreaseFont") || "Yazıyı Küçült"}
                          className="w-8 h-8 flex items-center justify-center hover:bg-white dark:hover:bg-gray-700 rounded-lg disabled:opacity-30 transition font-serif font-bold text-gray-600 dark:text-gray-300 text-xs shadow-sm"
                        >
                          A-
                        </button>
                        <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1"></div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFontChange(Math.min(8, fontLevel + 1));
                          }}
                          disabled={fontLevel === 8}
                          title={t("increaseFont") || "Yazıyı Büyüt"}
                          className="w-8 h-8 flex items-center justify-center hover:bg-white dark:hover:bg-gray-700 rounded-lg disabled:opacity-30 transition font-serif font-bold text-gray-600 dark:text-gray-300 text-base shadow-sm"
                        >
                          A+
                        </button>
                        <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1"></div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsSepia((prev) => !prev);
                            if (
                              typeof navigator !== "undefined" &&
                              navigator.vibrate
                            )
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
                          onClick={(e) => {
                            e.stopPropagation();
                            cycleSpeed();
                          }}
                          className="w-8 h-8 flex items-center justify-center rounded-lg font-bold text-[10px] hover:bg-white dark:hover:bg-gray-700 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          title={t("scrollSpeed") || "Kaydırma Hızı"}
                        >
                          {autoScrollSpeed}x
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsAutoScrolling((prev) => !prev);
                            if (
                              typeof navigator !== "undefined" &&
                              navigator.vibrate
                            )
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
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFullScreen();
                            if (
                              typeof navigator !== "undefined" &&
                              navigator.vibrate
                            )
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

                      <button
                        onClick={goBack}
                        className="bg-gray-200 dark:bg-gray-800 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 text-gray-500 dark:text-gray-400 p-2 rounded-full transition-all duration-200 active:scale-90"
                        title={t("close") || "Kapat"}
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
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                <div
                  className={`mx-auto transition-all duration-700 select-none ${isFullscreen ? "max-w-full px-6 pt-10" : "max-w-4xl p-6 md:p-12 bg-white/40 dark:bg-gray-900/40 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800"}`}
                >
                  <div
                    className={`risale-content prose prose-emerald dark:prose-invert max-w-none font-serif leading-[1.8] font-level-${fontLevel}`}
                    dangerouslySetInnerHTML={{ __html: content }}
                  />
                </div>

                {!isFullscreen && (
                  <div className="mt-16 pt-8 pb-32 border-t border-emerald-100 dark:border-emerald-900/30 text-center">
                    <button
                      onClick={goBack}
                      className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                    >
                      {t("backToChapterList") || "Bölüm Listesine Dön"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function RisalePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FDFCF7] dark:bg-[#061612]">
          <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
        </div>
      }
    >
      <RisaleContent />
    </Suspense>
  );
}
