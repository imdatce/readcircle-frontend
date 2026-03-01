/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import Zikirmatik from "@/components/common/Zikirmatik";

interface GunlukDua {
  id: number;
  title: string;
  arabic: string;
  latin: string;
  meaning: string;
  targetCount: number;
}

export default function GunlukDualarPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [duaList, setDuaList] = useState<GunlukDua[]>([]);
  const [loading, setLoading] = useState(true);

  // Zikirmatik Modal State'leri
  const [selectedDua, setSelectedDua] = useState<GunlukDua | null>(null);
  const [currentCount, setCurrentCount] = useState(0);

  useEffect(() => {
    const fetchDualar = async () => {
      try {
        const baseUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
        const url = new URL("/api/distribution/resources", baseUrl);

        const res = await fetch(url.toString());
        if (res.ok) {
          const data = await res.json();
          const resource = data.find((r: any) => r.codeKey === "GUNLUKDUALAR");

          if (resource && resource.translations?.length > 0) {
            // Dil kontrolü: Seçili dile uygun translation'ı bul
            let translation = resource.translations.find(
              (tr: any) => tr.langCode === language,
            );
            if (!translation) {
              // Bulamazsa fallback olarak 'tr'yi veya ilk geleni kullan
              translation =
                resource.translations.find((tr: any) => tr.langCode === "tr") ||
                resource.translations[0];
            }

            const description = translation.description;
            if (description) {
              const parts = description
                .split("###")
                .filter((p: string) => p.trim().length > 0);

              const parsedDualar = parts.map((raw: string, index: number) => {
                const itemParts = raw.split("|||");
                const fullMeaning = itemParts[2]?.trim() || "";

                let extractedTitle = "";
                let extractedMeaning = fullMeaning;

                // Parantez içindeki başlığı (Örn: "(Evden Çıkarken)") yakala ve anlamdan ayır
                const match = fullMeaning.match(/^\((.*?)\)\s*(.*)/);
                if (match) {
                  extractedTitle = match[1];
                  extractedMeaning = match[2];
                }

                return {
                  id: index + 1,
                  title: extractedTitle,
                  arabic: itemParts[0]?.trim() || "",
                  latin: itemParts[1]?.trim() || "",
                  meaning: extractedMeaning,
                  targetCount: parseInt(itemParts[3]?.trim() || "1", 10),
                };
              });
              setDuaList(parsedDualar);
            }
          }
        }
      } catch (error) {
        console.error("Günlük Dualar çekilemedi:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDualar();
  }, [language]); // Dile bağımlı hale getirildi

  const openZikirmatik = (dua: GunlukDua) => {
    setSelectedDua(dua);
    setCurrentCount(dua.targetCount);
  };

  return (
    <div className="min-h-screen bg-[#FDFCF7] dark:bg-[#061612] py-8 px-4 sm:px-6 transition-colors duration-500 relative">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Üst Başlık */}
        <div className="flex items-center justify-between bg-white/50 dark:bg-[#0a1f1a] backdrop-blur-md p-4 rounded-[2rem] border border-blue-100/20 dark:border-blue-900/30 shadow-sm">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full transition-all group"
            title={t("back") || "Geri"}
          >
            <svg
              className="w-6 h-6 text-blue-600 dark:text-blue-400 group-hover:-translate-x-1 transition-transform"
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
          <h1 className="text-sm md:text-base font-black text-blue-800 dark:text-blue-100 uppercase tracking-[0.2em] text-center">
            {t("dailyPrayersTitle") || "Günlük Dualar (Hisnul Müslim)"}
          </h1>
          <div className="w-10"></div>
        </div>

        {/* Liste */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {duaList.map((dua) => (
              <button
                key={dua.id}
                onClick={() => openZikirmatik(dua)}
                className="group flex flex-col items-center text-center p-6 bg-white dark:bg-[#0a1f1a] rounded-3xl border border-blue-100 dark:border-blue-900/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden w-full"
              >
                <div className="absolute -right-4 -top-4 w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500 pointer-events-none"></div>

                {/* Durum Başlığı */}
                {dua.title && (
                  <div className="mb-4 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider relative z-10">
                    {dua.title}
                  </div>
                )}

                <span className="text-2xl font-arabic text-blue-600 dark:text-blue-400 mb-3 relative z-10 leading-loose w-full">
                  {dua.arabic}
                </span>
                <span className="font-semibold text-gray-800 dark:text-gray-200 relative z-10 text-sm italic mb-2 w-full">
                  {dua.latin}
                </span>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-2 relative z-10 line-clamp-3 w-full">
                  {dua.meaning}
                </span>

                {dua.targetCount > 1 && (
                  <div className="mt-4 flex items-center justify-center gap-2 bg-blue-50 dark:bg-blue-900/30 px-4 py-1.5 rounded-full relative z-10">
                    <span className="text-xs font-bold text-blue-700 dark:text-blue-400">
                      {t("targetLabel") || "Hedef"}: {dua.targetCount}{" "}
                      {t("repetition") || "Tekrar"}
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Zikirmatik Modalı */}
      {selectedDua && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-[#0a1f1a] rounded-[2.5rem] w-full max-w-lg p-6 md:p-8 shadow-2xl relative border border-blue-100 dark:border-blue-800/50 flex flex-col items-center animate-in zoom-in-95 duration-300">
            <button
              onClick={() => setSelectedDua(null)}
              className="absolute top-4 right-4 p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-red-100 hover:text-red-600 transition-colors"
              title={t("close") || "Kapat"}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div className="max-h-[50vh] overflow-y-auto w-full text-center px-2 scrollbar-hide">
              {/* Modaldaki Durum Başlığı */}
              {selectedDua.title && (
                <h4 className="text-sm md:text-base font-black text-blue-700 dark:text-blue-300 mb-4 uppercase tracking-[0.1em] border-b border-blue-100 dark:border-blue-900/50 pb-2 inline-block">
                  {selectedDua.title}
                </h4>
              )}

              <h2 className="text-3xl md:text-4xl font-arabic leading-loose text-blue-600 dark:text-blue-400 mb-4 w-full">
                {selectedDua.arabic}
              </h2>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3 italic w-full">
                {selectedDua.latin}
              </h3>
              <p className="text-base text-gray-600 dark:text-gray-300 mb-6 font-medium w-full">
                {selectedDua.meaning}
              </p>
            </div>

            <div className="w-full transform scale-110 mb-2 mt-4 flex justify-center">
              <Zikirmatik
                currentCount={currentCount}
                onDecrement={() =>
                  setCurrentCount((prev) => Math.max(0, prev - 1))
                }
                t={t}
              />
            </div>

            {currentCount === 0 && (
              <div className="mt-4 px-6 py-2 bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400 font-bold rounded-full animate-pulse text-center">
                {t("readingCompleted") || "Okuma Tamamlandı! 🤲"}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
