/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RISALE_BOOKS, GITHUB_RAW_BASE } from "@/constants/risaleConfig";
import {
  RisaleBookCard,
  ChapterItem,
} from "@/components/resources/RisaleWidgets";

export default function RisalePage() {
  const router = useRouter();
  const [view, setView] = useState<"books" | "chapters" | "reading">("books");
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(false);
  // Sayfanın içindeki mevcut statelerin yanına şunları ekle:
  const [fontLevel, setFontLevel] = useState(3); // Varsayılan font seviyesi
  const [isSepia, setIsSepia] = useState(false);
  const [autoScrollSpeed, setAutoScrollSpeed] = useState(1);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      // Tam ekrana geç
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Tam ekran hatası: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      // Tam ekrandan çık
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
    const currentTheme = localStorage.getItem("theme"); // Uygulamanın tema tercihini buradan okuduğunu varsayıyoruz

    if (isSepia) {
      // Sepya açıldığında karanlık modu zorla kaldır
      root.classList.remove("dark");
    } else {
      // Sepya kapandığında, eğer kullanıcı normalde "dark" kullanıyorsa geri yükle
      if (currentTheme === "dark") {
        root.classList.add("dark");
      } else if (
        !currentTheme &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      ) {
        // Eğer localStorage boşsa ama sistem teması karanlıksa yine geri yükle
        root.classList.add("dark");
      }
    }

    // Sayfadan tamamen çıkınca (unmount) dark modu orijinal haline döndür
    return () => {
      if (currentTheme === "dark") root.classList.add("dark");
    };
  }, [isSepia]);

  // Otomatik Kaydırma Mantığı
  useEffect(() => {
    let scrollInterval: any;
    if (isAutoScrolling) {
      scrollInterval = setInterval(() => {
        window.scrollBy({ top: autoScrollSpeed, behavior: "smooth" });
      }, 50);
    }
    return () => clearInterval(scrollInterval);
  }, [isAutoScrolling, autoScrollSpeed]);

  const cycleSpeed = () => {
    const speeds = [1, 2, 3, 5];
    const nextIndex = (speeds.indexOf(autoScrollSpeed) + 1) % speeds.length;
    setAutoScrollSpeed(speeds[nextIndex]);
  };

  const handleFontChange = (level: number) => {
    setFontLevel(level);
    if (typeof navigator !== "undefined" && navigator.vibrate)
      navigator.vibrate(10);
  };
  // 1. Kitap seçildiğinde o klasördeki HTML dosyalarını listele
  const handleSelectBook = async (book: any) => {
    setSelectedBook(book);
    setLoading(true);
    setView("chapters");
    try {
      const res = await fetch(
        `/api/risale/files?folder=${encodeURIComponent(book.folder)}`,
      );
      if (res.ok) {
        const data = await res.json();
        // Sadece .html dosyalarını filtrele
        setChapters(data.filter((f: any) => f.name.endsWith(".html")));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // 2. Dosya seçildiğinde içeriğini Raw URL üzerinden çek
  const handleSelectChapter = async (file: any) => {
    setLoading(true);
    setView("reading");
    try {
      const res = await fetch(
        `${GITHUB_RAW_BASE}/${encodeURIComponent(selectedBook.folder)}/${encodeURIComponent(file.name)}`,
      );
      if (res.ok) {
        const html = await res.text();
        // GitHub'dan gelen HTML içindeki font veya stil çakışmalarını önlemek için basit temizlik yapılabilir
        setContent(html);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (view === "reading") {
      setIsAutoScrolling(false); // Okuma modundan çıkarken durdur
      setView("chapters");
    } else if (view === "chapters") setView("books");
    else router.back();
  };

  return (
    <div className="min-h-screen bg-[#FDFCF7] dark:bg-[#061612] py-8 px-4 sm:px-6 transition-colors duration-500">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Modernize Edilmiş Header */}
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
                    onClick={handleSelectBook}
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
                      onClick={handleSelectChapter}
                    />
                  ))}
                </div>
              </div>
            )}

            {view === "reading" && (
              <div
                // 1. Tıklandığında tam ekranı aç/kapat (Akıllı Kontrol ile)
                onClick={(e) => {
                  // Eğer tıklanan yer bir buton veya toolbar ise tam ekranı tetikleme
                  const target = e.target as HTMLElement;
                  if (target.closest("button") || target.closest(".sticky"))
                    return;

                  toggleFullScreen();
                }}
                // 2. Etkileşime girildiğinde (dokunma/tıklama) kaydırmayı durdur
                onPointerDown={() => setIsAutoScrolling(false)}
                className={`relative min-h-screen transition-all duration-500 cursor-pointer
      ${isSepia ? "sepia-mode" : ""} 
      ${isFullscreen ? "bg-white dark:bg-[#061612]" : ""}`}
              >
                {/* ÜST ARAÇ ÇUBUĞU */}
                <div
                  className={`sticky top-0 z-50 p-3 md:p-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 flex flex-col gap-3 shrink-0 shadow-md transition-all duration-500
      ${isFullscreen ? "opacity-0 hover:opacity-100 pointer-events-auto" : "opacity-100"}`}
                >
                  <div className="flex justify-between items-center max-w-5xl mx-auto w-full">
                    <h3 className="font-black text-sm md:text-lg tracking-tight text-emerald-700 dark:text-emerald-400 truncate mr-2">
                      {selectedBook?.name}
                    </h3>

                    <div className="flex items-center gap-2">
                      {/* Kontroller Kutusu */}
                      <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-1 border border-gray-200 dark:border-gray-700">
                        <button
                          onClick={() =>
                            handleFontChange(Math.max(0, fontLevel - 1))
                          }
                          className="w-8 h-8 flex items-center justify-center font-bold text-xs"
                        >
                          A-
                        </button>
                        <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>
                        <button
                          onClick={() =>
                            handleFontChange(Math.min(8, fontLevel + 1))
                          }
                          className="w-8 h-8 flex items-center justify-center font-bold text-base"
                        >
                          A+
                        </button>

                        <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-0.5"></div>

                        <button
                          onClick={() => setIsSepia(!isSepia)}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg ${isSepia ? "bg-amber-200 text-amber-900" : "text-amber-600"}`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2.5}
                          >
                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </button>

                        <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-0.5"></div>

                        {/* Manuel Tam Ekran Butonu (Hala orada durması iyidir) */}
                        <button
                          onClick={toggleFullScreen}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg ${isFullscreen ? "bg-emerald-600 text-white" : "text-gray-500"}`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d={
                                isFullscreen
                                  ? "M9 9L4 4m0 0l5 0m-5 0l0 5m11-5l5 5m0-5l-5 0"
                                  : "M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5"
                              }
                            />
                          </svg>
                        </button>

                        <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-0.5"></div>

                        <button
                          onClick={cycleSpeed}
                          className="w-8 h-8 flex items-center justify-center font-bold text-[10px] text-blue-500"
                        >
                          {autoScrollSpeed}x
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsAutoScrolling(!isAutoScrolling);
                          }}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg ${isAutoScrolling ? "bg-blue-600 text-white animate-pulse" : "text-blue-500"}`}
                        >
                          {isAutoScrolling ? "■" : "▶"}
                        </button>
                      </div>

                      <button
                        onClick={goBack}
                        className="bg-gray-100 dark:bg-gray-800 text-gray-500 p-2 rounded-full hover:bg-red-50 transition-all"
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
                  className={`mx-auto transition-all duration-700 select-none
      ${isFullscreen ? "max-w-full px-6 pt-10" : "max-w-4xl p-6 md:p-12"}`}
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
                      className="px-8 py-3 bg-emerald-600 text-white rounded-full font-bold shadow-lg shadow-emerald-500/20 active:scale-95"
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
