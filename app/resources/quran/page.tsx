"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { JUZ_DATA, SURAH_DATA } from "@/constants/quranData";
import ReadingModal, {
  ReadingModalContent,
} from "@/components/modals/ReadingModal";
import { useLanguage } from "@/context/LanguageContext";

function QuranContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  // URL'deki "tab" parametresini yakala
  const tabParam = searchParams.get("tab") as "juz" | "surah" | null;
  const pageParam = searchParams.get("page");
  const [activeTab, setActiveTab] = useState<"juz" | "surah">("juz");
  const [searchQuery, setSearchQuery] = useState("");
  const [modalContent, setModalContent] = useState<ReadingModalContent | null>(
    null,
  );

  // Kaldığı yeri tutacak state
  const [lastReadPage, setLastReadPage] = useState<number | null>(null);

  // Hafızadan son okunan sayfayı çek
  useEffect(() => {
    const checkLastRead = () => {
      try {
        const saved = localStorage.getItem("readcircle_progress_type_QURAN");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.unit) {
            setLastReadPage(parsed.unit);
          }
        }
      } catch (error) {
        console.error("Son okuma verisi alınamadı", error);
      }
    };

    checkLastRead();
  }, [modalContent]); // Modal her kapandığında (içerik değiştiğinde) tekrar kontrol et

  // URL'de parametre varsa aktif sekmeyi ona göre güncelle
  useEffect(() => {
    if (tabParam === "juz" || tabParam === "surah") {
      // ESLint React state update uyarısını önlemek için Promise.resolve
      Promise.resolve().then(() => setActiveTab(tabParam));
    }
  }, [tabParam]);

  // Arama filtresi
  const filteredSurahs = SURAH_DATA.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toString() === searchQuery,
  );

  const filteredJuzs = JUZ_DATA.filter((j) =>
    j.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleOpenReading = (startPage: number) => {
    setModalContent({
      type: "QURAN",
      title: "Kur'an-ı Kerim",
      startUnit: 1, // Kuran'ın en başı
      endUnit: 604, // Kuran'ın en sonu
      currentUnit: startPage, // Tıklanan Cüz veya Surenin başlangıç sayfası
      // Modal açılırken eski hafızayı yoksay ve direkt tıklanan bu sayfayı aç
      ignoreSavedProgress: true,
    });
  };

  const handleContinueReading = () => {
    if (lastReadPage) {
      setModalContent({
        type: "QURAN",
        title: "Kur'an-ı Kerim",
        startUnit: 1,
        endUnit: 604,
        currentUnit: lastReadPage,
        // Eski hafızayı kullanması ve tam kaldığı satıra kaydırması için false yapıyoruz
        ignoreSavedProgress: false,
      });
    }
  };

  // URL'den gelen 'page' değerine göre otomatik okuma ekranını aç
  useEffect(() => {
    if (pageParam) {
      const pageNum = parseInt(pageParam, 10);
      if (!isNaN(pageNum)) {
        // ESLint uyarısını aşmak için işlemi mikro-görev kuyruğuna (microtask) alıyoruz.
        Promise.resolve().then(() => handleOpenReading(pageNum));

        // Parametreyi URL'den temizle ki modal kapatıldığında tekrar açılmasın
        router.replace(`/resources/quran?tab=${tabParam || "juz"}`, {
          scroll: false,
        });
      }
    }
  }, [pageParam, tabParam, router]);

  useEffect(() => {
    if (tabParam === "juz" || tabParam === "surah") {
      Promise.resolve().then(() => setActiveTab(tabParam));
    }
  }, [tabParam]);

  // Sekme değiştirildiğinde URL'i de güncelle (Sayfa yenilenmeden)
  const handleTabChange = (tab: "juz" | "surah") => {
    setActiveTab(tab);
    router.replace(`/resources/quran?tab=${tab}`, { scroll: false });
  };

  return (
    <div className="min-h-screen bg-[#FDFCF7] dark:bg-[#061612] py-8 px-4 sm:px-6 transition-colors duration-500">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Üst Başlık (Geri Butonu ile) */}
        <div className="flex items-center justify-between bg-white/50 dark:bg-[#0a1f1a] backdrop-blur-md p-4 rounded-[2rem] border border-amber-100/20 dark:border-amber-900/30 shadow-sm">
          <button
            onClick={() => router.push("/resources")}
            className="p-2 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-full transition-all group"
          >
            <svg
              className="w-6 h-6 text-amber-600 dark:text-amber-400 group-hover:-translate-x-1 transition-transform"
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
          <h1 className="text-sm md:text-base font-black text-amber-800 dark:text-amber-100 uppercase tracking-[0.2em]">
            Kur&apos;an-ı Kerim
          </h1>
          <div className="w-10"></div>
        </div>

        {/* Kaldığın Yerden Devam Et Butonu */}
        {lastReadPage && (
          <button
            onClick={handleContinueReading}
            className="w-full flex items-center justify-between p-4 md:p-5 bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-700 dark:to-teal-800 hover:from-emerald-500 hover:to-teal-500 text-white rounded-[2rem] shadow-lg shadow-emerald-500/20 dark:shadow-emerald-900/30 transition-all duration-300 group active:scale-[0.98] border border-emerald-400/30 dark:border-emerald-500/20"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="font-black text-sm md:text-lg uppercase tracking-wider text-emerald-50">
                  {t("continueReading") || "Kaldığım Yerden Devam Et"}
                </h3>
                <p className="text-emerald-100/80 text-xs md:text-sm font-medium mt-0.5">
                  {t("page") || "Sayfa"} {lastReadPage}
                </p>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
              <svg
                className="w-5 h-5 opacity-90 group-hover:opacity-100 group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </button>
        )}

        {/* Sekmeler ve Arama Çubuğu */}
        <div className="bg-white/80 dark:bg-[#0a1f1a] rounded-[2.5rem] border border-amber-100/50 dark:border-amber-900/30 shadow-xl overflow-hidden p-4 md:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex bg-gray-100 dark:bg-gray-800/50 p-1 rounded-xl w-full sm:w-auto shrink-0">
              <button
                onClick={() => handleTabChange("juz")}
                className={`flex-1 sm:px-6 py-2.5 rounded-lg text-xs font-bold transition-all uppercase tracking-widest ${activeTab === "juz" ? "bg-white dark:bg-gray-700 text-amber-600 dark:text-amber-400 shadow-sm" : "text-gray-500 hover:text-gray-700 dark:text-gray-400"}`}
              >
                Cüzler
              </button>
              <button
                onClick={() => handleTabChange("surah")}
                className={`flex-1 sm:px-6 py-2.5 rounded-lg text-xs font-bold transition-all uppercase tracking-widest ${activeTab === "surah" ? "bg-white dark:bg-gray-700 text-amber-600 dark:text-amber-400 shadow-sm" : "text-gray-500 hover:text-gray-700 dark:text-gray-400"}`}
              >
                Sureler
              </button>
            </div>

            <div className="relative w-full">
              <input
                type="text"
                placeholder={
                  activeTab === "surah"
                    ? "Sure adı veya no ara..."
                    : "Cüz ara..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-shadow"
              />
              <svg
                className="w-5 h-5 absolute right-3 top-2.5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Listeleme Grid Alanı */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {activeTab === "juz"
              ? filteredJuzs.map((juz) => (
                  <button
                    key={juz.id}
                    onClick={() => handleOpenReading(juz.startPage)}
                    className="group p-4 bg-gray-50 dark:bg-gray-800/50 hover:bg-amber-50 dark:hover:bg-amber-900/20 border border-gray-100 dark:border-gray-800 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all hover:-translate-y-1 hover:border-amber-200 dark:hover:border-amber-800"
                  >
                    <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black text-lg">
                      {juz.id}
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                        Cüz
                      </p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                        Sayfa {juz.startPage > 1 ? juz.startPage - 1 : 1}
                      </p>
                    </div>
                  </button>
                ))
              : filteredSurahs.map((surah) => (
                  <button
                    key={surah.id}
                    onClick={() => handleOpenReading(surah.startPage)}
                    className="group p-4 bg-gray-50 dark:bg-gray-800/50 hover:bg-amber-50 dark:hover:bg-amber-900/20 border border-gray-100 dark:border-gray-800 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all hover:-translate-y-1 hover:border-amber-200 dark:hover:border-amber-800 relative overflow-hidden"
                  >
                    <span className="absolute top-2 right-2 text-[9px] font-black text-gray-400 bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded-md">
                      {surah.id}
                    </span>
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mt-2">
                      {surah.name}
                    </p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">
                      {surah.type} • {surah.ayahCount} Ayet
                    </p>
                    <div className="w-full h-px bg-gray-200 dark:bg-gray-700 my-1"></div>
                    <p className="text-[10px] font-medium text-amber-600 dark:text-amber-500">
                      Sayfa {surah.startPage > 1 ? surah.startPage - 1 : 1}
                    </p>
                  </button>
                ))}

            {(activeTab === "juz" && filteredJuzs.length === 0) ||
            (activeTab === "surah" && filteredSurahs.length === 0) ? (
              <div className="col-span-full py-10 text-center text-gray-500 dark:text-gray-400">
                Arama sonucunda eşleşme bulunamadı.
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Okuma Modalı Çağırımı */}
      {modalContent && (
        <ReadingModal
          content={modalContent}
          onClose={() => setModalContent(null)}
          onUpdateContent={(newContent) => {
            if (newContent) setModalContent(newContent);
            else setModalContent(null);
          }}
          userName={null}
          localCounts={{}}
          onDecrementCount={() => {}}
          t={t}
        />
      )}
    </div>
  );
}

// Suspense Sarmalayıcı
export default function QuranPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FDFCF7] dark:bg-[#061612]">
          <div className="w-10 h-10 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
        </div>
      }
    >
      <QuranContent />
    </Suspense>
  );
}
