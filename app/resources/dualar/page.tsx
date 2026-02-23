/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import ReadingModal, {
  ReadingModalContent,
} from "@/components/modals/ReadingModal";
import { CevsenBab, Resource } from "@/types";

// Sayfada gösterilecek duaların listesi ve tasarımları
const DUALAR_LIST = [
  {
    id: "bedir",
    title: "Eshab-ı Bedir",
    codeKey: "BEDIR",
    type: "LIST_BASED",
    desc: "Bedir ehlinin mübarek isimleri",
    color: "emerald",
  },
  {
    id: "uhud",
    title: "Şüheda-i Uhud",
    codeKey: "UHUD",
    type: "LIST_BASED",
    desc: "Uhud şehitlerinin mübarek isimleri",
    color: "emerald",
  },
  {
    id: "tevhidname",
    title: "Tevhidname",
    codeKey: "TEVHIDNAME",
    type: "LIST_BASED",
    desc: "Tevhid hakikatleri ve zikirleri",
    color: "blue",
  },
  {
    id: "tefriciye",
    title: "Salât-ı Tefriciye",
    codeKey: "TEFRICIYE",
    type: "COUNTABLE",
    desc: "Sıkıntıların def'i için okunan salavat",
    color: "amber",
  },
  {
    id: "munciye",
    title: "Salât-ı Münciye",
    codeKey: "MUNCIYE",
    type: "COUNTABLE",
    desc: "Tüncînâ Duası ve Salavatı",
    color: "amber",
  },
  {
    id: "salavat",
    title: "Özel Salavatlar",
    codeKey: "OZELSALAVAT",
    type: "COUNTABLE",
    desc: "Peygamber Efendimiz'e (asm) salavatlar",
    color: "indigo",
  },
  {
    id: "kurandualari",
    title: "Kur'an'dan Dualar",
    codeKey: "KURANDUALARI",
    type: "LIST_BASED",
    desc: "Kur'an'da geçen Peygamber duaları",
    color: "amber",
  },
];

const colorStyles: Record<string, string> = {
  emerald:
    "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/50 hover:border-emerald-300",
  blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800/50 hover:border-blue-300",
  amber:
    "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800/50 hover:border-amber-300",
  indigo:
    "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800/50 hover:border-indigo-300",
};

export default function DualarPage() {
  const router = useRouter();
  const { t, language } = useLanguage();

  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalContent, setModalContent] = useState<ReadingModalContent | null>(
    null,
  );

  // Tüm kaynakları Backend'den (Redis Cache üzerinden) çek
  useEffect(() => {
    const fetchResources = async () => {
      try {
        const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(
          /\/$/,
          "",
        );
        const res = await fetch(`${apiUrl}/api/distribution/resources`);
        if (res.ok) {
          const data = await res.json();
          setResources(data);
        }
      } catch (error) {
        console.error("Kaynaklar çekilemedi:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, []);

  const handleOpenDua = (duaConfig: (typeof DUALAR_LIST)[0]) => {
    // 1. Tıklanan duayı çekilen resources listesinden bul
    const resource = resources.find((r) => r.codeKey === duaConfig.codeKey);

    if (!resource) {
      alert("Bu içerik henüz sisteme yüklenmemiş.");
      return;
    }

    // 2. Dili seç
    let translation = resource.translations?.find(
      (trans: any) => trans.langCode === language,
    );
    if (!translation) {
      translation =
        resource.translations?.find((trans: any) => trans.langCode === "tr") ||
        resource.translations?.[0];
    }

    const description = translation?.description;
    if (!description) {
      alert("İçerik bulunamadı.");
      return;
    }

    let parsedModalContent: ReadingModalContent;

    // 3. Tipine göre veriyi ayrıştır
    if (duaConfig.type === "COUNTABLE") {
      const parts = description.split("|||");

      parsedModalContent = {
        title: duaConfig.title,
        type: "SALAVAT",
        salavatData: {
          arabic: parts[0]?.trim() || "",
          transcript: parts[1]?.trim() || "",
          meaning: parts[2]?.trim() || "",
        },
        codeKey: duaConfig.codeKey,
        // DİKKAT: assignmentId alanını kaldırdık. Böylece ReadingModal Zikirmatik'i GÖSTERMEYECEK.
      };
    } else {
      // LIST_BASED (Bedir, Uhud, Tevhidname vb.)
      let separator = "###";
      if (
        (duaConfig.codeKey === "BEDIR" || duaConfig.codeKey === "UHUD") &&
        !description.includes("###")
      ) {
        separator = "\n";
      }

      const allParts = description
        .split(separator)
        .filter((p: string) => p.trim().length > 0);

      const parsedData: CevsenBab[] = allParts.map(
        (rawPart: string, index: number) => {
          const parts = rawPart.split("|||");
          return {
            babNumber: index + 1,
            arabic: parts[0]?.trim() || rawPart.trim(),
            transcript: parts[1]?.trim() || rawPart.trim(),
            meaning: parts[2]?.trim() || "",
          };
        },
      );

      parsedModalContent = {
        title: duaConfig.title,
        type: "CEVSEN",
        cevsenData: parsedData,
        startUnit: 1,
        codeKey: duaConfig.codeKey,
      };
    }

    setModalContent(parsedModalContent);
  };

  return (
    <div className="min-h-screen bg-[#FDFCF7] dark:bg-[#061612] py-8 px-4 sm:px-6 transition-colors duration-500">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Üst Başlık (Geri Butonu ile) */}
        <div className="flex items-center justify-between bg-white/50 dark:bg-[#0a1f1a] backdrop-blur-md p-4 rounded-[2rem] border border-blue-100/20 dark:border-blue-900/30 shadow-sm">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full transition-all group"
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
          <h1 className="text-sm md:text-base font-black text-blue-800 dark:text-blue-100 uppercase tracking-[0.2em]">
            Dualar ve Virdler
          </h1>
          <div className="w-10"></div>
        </div>

        {/* Dualar Grid Listesi */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="bg-white/80 dark:bg-[#0a1f1a] rounded-[2.5rem] border border-blue-100/50 dark:border-blue-900/30 shadow-xl p-4 md:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {DUALAR_LIST.map((dua) => (
                <button
                  key={dua.id}
                  onClick={() => handleOpenDua(dua)}
                  className={`group p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg text-left relative overflow-hidden ${colorStyles[dua.color]}`}
                >
                  <div className="relative z-10 flex flex-col gap-2">
                    <h2 className="font-black text-lg tracking-tight">
                      {dua.title}
                    </h2>
                    <p className="text-xs opacity-80 leading-relaxed font-medium line-clamp-2">
                      {dua.desc}
                    </p>
                  </div>
                  {/* Dekoratif Arka Plan İkonu */}
                  <svg
                    className="absolute -bottom-4 -right-4 w-24 h-24 opacity-10 group-hover:scale-110 transition-transform duration-500"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        )}
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
          userName="Serbest Okuma"
          localCounts={{}} // SIFIRLANDI
          onDecrementCount={() => {}} // SIFIRLANDI
          t={t}
        />
      )}
    </div>
  );
}
