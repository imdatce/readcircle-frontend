/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import ReadingModal, {
  ReadingModalContent,
} from "@/components/modals/ReadingModal";
import { CevsenBab, Resource } from "@/types";

const colorStyles: Record<string, string> = {
  emerald:
    "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/50 hover:border-emerald-300",
  blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800/50 hover:border-blue-300",
  amber:
    "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800/50 hover:border-amber-300",
  indigo:
    "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800/50 hover:border-indigo-300",
  // Sabah duaları için mor rengini ekledik
  violet:
    "bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 border-violet-100 dark:border-violet-800/50 hover:border-violet-300",
};

// --- ANA İÇERİK BİLEŞENİ ---
function DualarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, language } = useLanguage();

  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalContent, setModalContent] = useState<ReadingModalContent | null>(
    null,
  );

  const duaParam = searchParams.get("dua");

  const DUALAR_LIST = useMemo(
    () => [
      {
        id: "esmaulhusna",
        title: t("duaEsmaTitle") || "Esma-ül Hüsna",
        codeKey: "ESMAULHUSNA",
        type: "CUSTOM_PAGE",
        desc: t("duaEsmaDesc") || "Allah'ın 99 İsmi, faziletleri ve zikirleri",
        color: "emerald",
      },
      {
        id: "tefriciye",
        title: t("duaTefriciyeTitle") || "Salât-ı Tefriciye",
        codeKey: "TEFRICIYE",
        type: "COUNTABLE",
        desc: t("duaTefriciyeDesc") || "Sıkıntıların def'i için okunan salavat",
        color: "indigo",
      },
      {
        id: "munciye",
        title: t("duaMunciyeTitle") || "Salât-ı Münciye",
        codeKey: "MUNCIYE",
        type: "COUNTABLE",
        desc: t("duaMunciyeDesc") || "Tüncînâ Duası ve Salavatı",
        color: "indigo",
      },
      {
        id: "salavat",
        title: t("duaSalavatTitle") || "Özel Salavatlar",
        codeKey: "OZELSALAVAT",
        type: "COUNTABLE",
        desc: t("duaSalavatDesc") || "Peygamber Efendimiz'e (asm) salavatlar",
        color: "indigo",
      },
      {
        id: "kurandualari",
        title: t("duaKuranTitle") || "Kur'an'dan Dualar",
        codeKey: "KURANDUALARI",
        type: "LIST_BASED",
        desc: t("duaKuranDesc") || "Kur'an'da geçen Peygamber duaları",
        color: "blue",
      },
      {
        id: "gunluk-dualar",
        title: t("duaDailyTitle") || "Günlük Dualar",
        codeKey: "GUNLUKDUALAR",
        type: "CUSTOM_PAGE",
        desc:
          t("duaDailyDesc") ||
          "Hisnul Müslim'den sabah/akşam zikirleri ve günlük dualar",
        color: "blue",
      },
      // YENİ KARTLAR BURAYA EKLENDİ
      {
        id: "sabah-dualari",
        title: t("sabahDualariTitle") || "Sabah Duaları",
        codeKey: "SABAHDUALARI",
        type: "CUSTOM_PAGE", // Tıklanınca /resources/sabah-dualari sayfasına gider
        desc:
          t("sabahDualariDesc") ||
          "Güne bereketle başlamak için okunacak dualar",
        color: "violet",
      },
      {
        id: "aksam-dualari",
        title: t("aksamDualariTitle") || "Akşam Duaları",
        codeKey: "AKSAMDUALARI",
        type: "CUSTOM_PAGE", // Tıklanınca /resources/aksam-dualari sayfasına gider
        desc:
          t("aksamDualariDesc") || "Geceye huzurla girmek için okunacak dualar",
        color: "indigo",
      },
      {
        id: "tevhidname",
        title: t("duaTevhidnameTitle") || "Tevhidname",
        codeKey: "TEVHIDNAME",
        type: "LIST_BASED",
        desc: t("duaTevhidnameDesc") || "Tevhid hakikatleri ve zikirleri",
        color: "blue",
      },
      {
        id: "bedir",
        title: t("duaBedirTitle") || "Ashab-ı Bedir",
        codeKey: "BEDIR",
        type: "LIST_BASED",
        desc: t("duaBedirDesc") || "Bedir ehlinin mübarek isimleri",
        color: "amber",
      },
      {
        id: "uhud",
        title: t("duaUhudTitle") || "Şüheda-i Uhud",
        codeKey: "UHUD",
        type: "LIST_BASED",
        desc: t("duaUhudDesc") || "Uhud şehitlerinin mübarek isimleri",
        color: "amber",
      },
    ],
    [t],
  );

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const baseUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
        const url = new URL("/api/distribution/resources", baseUrl);

        const res = await fetch(url.toString());
        if (res.ok) {
          const data = await res.json();
          setResources(data);
        } else {
          console.error(`API Error: ${res.status} ${res.statusText}`);
        }
      } catch (error) {
        console.error("Kaynaklar çekilemedi:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, []);

  useEffect(() => {
    if (!loading && resources.length > 0 && duaParam) {
      const targetDua = DUALAR_LIST.find((d) => d.id === duaParam);
      if (targetDua) {
        Promise.resolve().then(() => handleOpenDua(targetDua, true));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, resources, duaParam, DUALAR_LIST]);

  const handleOpenDua = (
    duaConfig: (typeof DUALAR_LIST)[0],
    isAuto = false,
  ) => {
    if (!isAuto) {
      router.replace(`/resources/dualar?dua=${duaConfig.id}`, {
        scroll: false,
      });
    }

    if (duaConfig.type === "CUSTOM_PAGE") {
      router.push(`/resources/${duaConfig.id}`);
      return;
    }

    const resource = resources.find((r) => r.codeKey === duaConfig.codeKey);

    if (!resource) {
      alert(t("contentNotUploaded") || "Bu içerik henüz sisteme yüklenmemiş.");
      return;
    }

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
      alert(t("contentNotFound") || "İçerik bulunamadı.");
      return;
    }

    let parsedModalContent: ReadingModalContent;

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
        ignoreSavedProgress: true,
      };
    } else {
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
        ignoreSavedProgress: true,
      };
    }

    setModalContent(parsedModalContent);
  };

  const handleCloseModal = () => {
    setModalContent(null);
    router.replace("/resources/dualar", { scroll: false });
  };

  return (
    <div className="min-h-screen bg-[#FDFCF7] dark:bg-[#061612] py-8 px-4 sm:px-6 transition-colors duration-500">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Üst Başlık */}
        <div className="flex items-center justify-between bg-white/50 dark:bg-[#0a1f1a] backdrop-blur-md p-4 rounded-[2rem] border border-blue-100/20 dark:border-blue-900/30 shadow-sm">
          <button
            onClick={() => router.push("/resources")}
            className="p-2 hover:bg-blue-50 dark:bg-transparent dark:hover:bg-blue-900/30 rounded-full transition-all group"
            title={t("backToResources") || "Geri"}
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
            {t("dualarTitle") || "Dualar ve Virdler"}
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
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Okuma Modalı */}
      {modalContent && (
        <ReadingModal
          content={modalContent}
          onClose={handleCloseModal}
          onUpdateContent={(newContent) => setModalContent(newContent || null)}
          userName={t("freeReading") || "Serbest Okuma"}
          localCounts={{}}
          onDecrementCount={() => {}}
          t={t}
        />
      )}
    </div>
  );
}

export default function DualarPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FDFCF7] dark:bg-[#061612]">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      }
    >
      <DualarContent />
    </Suspense>
  );
}
