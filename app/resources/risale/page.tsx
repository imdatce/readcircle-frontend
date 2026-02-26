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
  const { t } = useLanguage(); // Çeviri için eklendi

  // URL'den parametreleri alıyoruz
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

  // Wake Lock API (Ekranın kapanmasını önler)
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
    if (view === "reading") {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }
    return () => releaseWakeLock();
  }, [view]);

  // 1. Kitap seçildiğinde o klasördeki HTML dosyalarını listele
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

        // Eğer URL'de bir dosya (file) parametresi de varsa otomatik aç
        if (autoFile) {
          const targetFile = htmlFiles.find(
            (f: any) =>
              f.name.toLowerCase() === autoFile.toLowerCase() ||
              f.name.toLowerCase().includes(autoFile.toLowerCase()),
          );
          if (targetFile) {
            handleSelectChapter(targetFile, book); // Kitap bilgisini de yolluyoruz
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (!autoFile) setLoading(false); // Eğer dosya açılmayacaksa yüklemeyi bitir
    }
  };

  // 2. Dosya seçildiğinde içeriğini Raw URL üzerinden çek
  const handleSelectChapter = async (file: any, bookObj = selectedBook) => {
    setLoading(true);
    setView("reading");
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

  // ==========================================
  // URL DİNLEYİCİSİ (Otomatik Açılma Mantığı)
  // ==========================================
  useEffect(() => {
    if (bookParam) {
      const targetBook = RISALE_BOOKS.find(
        (b) => b.folder.toLowerCase() === bookParam.toLowerCase(),
      );
      if (targetBook && (!selectedBook || selectedBook.id !== targetBook.id)) {
        // ESLint uyarısını aşmak için Promise
        Promise.resolve().then(() =>
          handleSelectBook(targetBook, fileParam || undefined),
        );
      }
    }
    // Sadece bookParam değiştiğinde çalışsın
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookParam]);
  // ==========================================

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Tam ekran hatası: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFsChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    const currentTheme = localStorage.getItem("theme");

    if (isSepia) {
      root.classList.remove("dark");
    } else {
      if (currentTheme === "dark") {
        root.classList.add("dark");
      } else if (
        !currentTheme &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      ) {
        root.classList.add("dark");
      }
    }

    return () => {
      if (currentTheme === "dark") root.classList.add("dark");
    };
  }, [isSepia]);

  // === YENİ NESİL PÜRÜZSÜZ OTOMATİK KAYDIRMA ===
  useEffect(() => {
    if (!isAutoScrolling || view !== "reading") return;

    let animationFrameId: number;
    let lastTime: number | null = null;
    let exactScrollY = window.scrollY;

    const baseSpeed = 40;

    const scrollStep = (timestamp: number) => {
      if (lastTime === null) lastTime = timestamp;
      const deltaTime = timestamp - lastTime;
      lastTime = timestamp;

      if (deltaTime > 0 && deltaTime < 100) {
        const moveBy = (baseSpeed * autoScrollSpeed * deltaTime) / 1000;
        exactScrollY += moveBy;

        const maxScroll =
          document.documentElement.scrollHeight - window.innerHeight;

        if (exactScrollY >= maxScroll - 1) {
          window.scrollTo(0, maxScroll);
          setIsAutoScrolling(false);
          return;
        }

        window.scrollTo(0, exactScrollY);
      }

      animationFrameId = requestAnimationFrame(scrollStep);
    };

    animationFrameId = requestAnimationFrame(scrollStep);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isAutoScrolling, autoScrollSpeed, view]);

  // Manuel kaydırmada oto-kaydırmayı durdur
  useEffect(() => {
    const handleInteraction = (e: Event) => {
      if (isAutoScrolling && view === "reading") {
        if (e.type === "wheel" && Math.abs((e as WheelEvent).deltaY) > 10) {
          setIsAutoScrolling(false);
        } else if (e.type === "touchstart" || e.type === "touchmove") {
          setIsAutoScrolling(false);
        }
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
  }, [isAutoScrolling, view]);

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
      // URL'yi temizle
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

  // Kart tıklamasını sarmalayıp URL'i de değiştiriyoruz
  const handleBookCardClick = (book: any) => {
    router.replace(`/resources/risale?book=${book.folder}`, { scroll: false });
    handleSelectBook(book);
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${isSepia && view === "reading" ? "sepia-theme bg-[#F4ECD8]" : "bg-[#FDFCF7] dark:bg-[#061612] py-8"}`}
    >
      <div
        className={`max-w-4xl mx-auto space-y-6 ${isSepia && view === "reading" ? "py-8" : ""} px-4 sm:px-6`}
      >
        {/* Modernize Edilmiş Header - Sadece Reading modunda gizleniyor (kendi araç çubuğu var) */}
        {view !== "reading" && (
          <div className="flex items-center justify-between bg-white/50 dark:bg-[#0a1f1a] backdrop-blur-md p-4 rounded-[2rem] border border-emerald-100/20 dark:border-emerald-900/30 shadow-sm">
            <button
              onClick={goBack}
              className="p-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-full transition-all group"
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
              {view === "books" ? "Risale-i Nur Külliyatı" : selectedBook?.name}
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
              Metin Hazırlanıyor...
            </p>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
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
                        // Tıklanan bölümün ismini URL'e atıyoruz
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
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  if (target.closest("button") || target.closest(".sticky"))
                    return;
                  toggleFullScreen();
                }}
                className={`relative min-h-screen transition-all duration-500 cursor-pointer ${isFullscreen ? "bg-transparent" : ""}`}
              >
                {/* ÜST ARAÇ ÇUBUĞU - Cevşen/ReadingModal stili ile birebir uyumlu */}
                <div
                  className={`sticky top-0 z-50 p-3 md:p-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 flex flex-col gap-3 shrink-0 shadow-sm transition-all duration-500 ${
                    isFullscreen
                      ? "opacity-0 hover:opacity-100 pointer-events-auto"
                      : "opacity-100 rounded-[2rem] border mt-[-1.5rem] mb-4"
                  }`}
                >
                  <div className="flex justify-between items-center max-w-5xl mx-auto w-full px-2">
                    <h3 className="font-black text-xs md:text-base tracking-tight text-emerald-700 dark:text-emerald-400 truncate mr-2">
                      {selectedBook?.name}
                    </h3>

                    <div className="flex items-center gap-2">
                      {/* Kontroller Kutusu */}
                      <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-2xl p-1.5 border border-gray-200 dark:border-gray-700">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFontChange(Math.max(0, fontLevel - 1));
                          }}
                          disabled={fontLevel === 0}
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
                          className="w-8 h-8 flex items-center justify-center hover:bg-white dark:hover:bg-gray-700 rounded-lg disabled:opacity-30 transition font-serif font-bold text-gray-600 dark:text-gray-300 text-base shadow-sm"
                        >
                          A+
                        </button>

                        {/* Okuma (Sepya) Modu */}
                        <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1"></div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
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

                        {/* Kaydırma Hızı */}
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

                        {/* Oto Kaydırma Başlat/Durdur */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
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

                        {/* Tam Ekran Butonu */}
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
                          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-300 ${
                            isFullscreen
                              ? "bg-blue-600/15 text-blue-600 dark:text-blue-400 shadow-inner"
                              : "hover:bg-white dark:hover:bg-gray-700 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                          }`}
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

                      {/* Geri Dön (Kapat) Butonu */}
                      <button
                        onClick={goBack}
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
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* OKUMA ALANI */}
                <div
                  className={`mx-auto transition-all duration-700 select-none ${
                    isFullscreen
                      ? "max-w-full px-6 pt-10"
                      : "max-w-4xl p-6 md:p-12 bg-white/40 dark:bg-gray-900/40 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800"
                  }`}
                >
                  <div
                    className={`risale-content prose prose-emerald dark:prose-invert max-w-none font-serif leading-[1.8] font-level-${fontLevel}`}
                    dangerouslySetInnerHTML={{ __html: content }}
                  />
                </div>

                {/* Alt Navigasyon (Sadece normal ekranda) */}
                {!isFullscreen && (
                  <div className="mt-16 pt-8 pb-32 border-t border-emerald-100 dark:border-emerald-900/30 text-center">
                    <button
                      onClick={goBack}
                      className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                    >
                      Bölüm Listesine Dön
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
