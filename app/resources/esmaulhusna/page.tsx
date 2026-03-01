/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import Zikirmatik from "@/components/common/Zikirmatik";

interface Esma {
  id: number;
  arabic: string;
  latin: string;
  meaning: string;
  targetCount: number;
}

export default function EsmaUlHusnaPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [esmaList, setEsmaList] = useState<Esma[]>([]);
  const [loading, setLoading] = useState(true);

  // Zikirmatik Modal State'leri
  const [selectedEsma, setSelectedEsma] = useState<Esma | null>(null);
  const [currentCount, setCurrentCount] = useState(0);

  useEffect(() => {
    const fetchEsma = async () => {
      try {
        const baseUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
        const url = new URL("/api/distribution/resources", baseUrl);

        const res = await fetch(url.toString());
        if (res.ok) {
          const data = await res.json();
          const esmaResource = data.find(
            (r: any) => r.codeKey === "ESMAULHUSNA",
          );

          if (esmaResource && esmaResource.translations?.length > 0) {
            // Dil kontrolü: Seçili dile uygun translation'ı bul
            let translation = esmaResource.translations.find(
              (tr: any) => tr.langCode === language,
            );
            if (!translation) {
              // Bulamazsa fallback olarak 'tr'yi veya ilk geleni kullan
              translation =
                esmaResource.translations.find(
                  (tr: any) => tr.langCode === "tr",
                ) || esmaResource.translations[0];
            }

            const description = translation.description;
            if (description) {
              const parts = description
                .split("###")
                .filter((p: string) => p.trim().length > 0);

              const parsedEsma = parts.map((raw: string, index: number) => {
                const itemParts = raw.split("|||");
                return {
                  id: index + 1,
                  arabic: itemParts[0]?.trim() || "",
                  latin: itemParts[1]?.trim() || "",
                  meaning: itemParts[2]?.trim() || "",
                  targetCount: parseInt(itemParts[3]?.trim() || "100", 10),
                };
              });
              setEsmaList(parsedEsma);
            }
          }
        }
      } catch (error) {
        console.error("Esma-ül Hüsna çekilemedi:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEsma();
  }, [language]); // Dile bağımlı hale getirildi

  const openZikirmatik = (esma: Esma) => {
    setSelectedEsma(esma);
    setCurrentCount(esma.targetCount);
  };

  return (
    <div className="min-h-screen bg-[#FDFCF7] dark:bg-[#061612] py-8 px-4 sm:px-6 transition-colors duration-500 relative">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Üst Başlık */}
        <div className="flex items-center justify-between bg-white/50 dark:bg-[#0a1f1a] backdrop-blur-md p-4 rounded-[2rem] border border-emerald-100/20 dark:border-emerald-900/30 shadow-sm">
          <button
            onClick={() => router.back()}
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
            {t("esmaTitle") || "Esma-ül Hüsna"}
          </h1>
          <div className="w-10"></div>
        </div>

        {/* Liste */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {esmaList.map((esma) => (
              <button
                key={esma.id}
                onClick={() => openZikirmatik(esma)}
                className="group flex flex-col items-center p-6 bg-white dark:bg-[#0a1f1a] rounded-3xl border border-emerald-100 dark:border-emerald-900/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden text-left w-full"
              >
                <div className="absolute -right-4 -top-4 w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500 pointer-events-none"></div>

                <span className="text-3xl font-arabic text-emerald-600 dark:text-emerald-400 mb-3 relative z-10 w-full text-center">
                  {esma.arabic}
                </span>
                <span className="font-bold text-gray-800 dark:text-gray-100 relative z-10 text-lg w-full text-center">
                  {esma.latin}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center line-clamp-2 h-8 relative z-10 w-full">
                  {esma.meaning}
                </span>

                <div className="mt-4 flex items-center justify-center gap-2 bg-emerald-50 dark:bg-emerald-900/30 px-4 py-1.5 rounded-full relative z-10 w-full">
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    {t("targetLabel") || "Hedef"}: {esma.targetCount}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Zikirmatik Modalı */}
      {selectedEsma && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-[#0a1f1a] rounded-[2.5rem] w-full max-w-md p-6 shadow-2xl relative border border-emerald-100 dark:border-emerald-800/50 flex flex-col items-center animate-in zoom-in-95 duration-300">
            <button
              onClick={() => setSelectedEsma(null)}
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

            <h2 className="text-4xl font-arabic text-emerald-600 dark:text-emerald-400 mt-4 mb-2 text-center w-full">
              {selectedEsma.arabic}
            </h2>
            <h3 className="text-2xl font-black text-gray-800 dark:text-white mb-2 text-center w-full">
              {selectedEsma.latin}
            </h3>
            <p className="text-sm text-center text-gray-600 dark:text-gray-300 mb-8 px-4 w-full">
              {selectedEsma.meaning}
            </p>

            <div className="w-full transform scale-110 mb-4 flex justify-center">
              <Zikirmatik
                currentCount={currentCount}
                onDecrement={() =>
                  setCurrentCount((prev) => Math.max(0, prev - 1))
                }
                t={t}
              />
            </div>

            {currentCount === 0 && (
              <div className="mt-4 px-6 py-2 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400 font-bold rounded-full animate-bounce text-center">
                {t("targetReached") || "Hedefe Ulaşıldı! 🤲"}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
