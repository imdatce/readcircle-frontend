/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import ReadingModal, {
  ReadingModalContent,
} from "@/components/modals/ReadingModal";
import { CevsenBab, Resource } from "@/types";

// Tema renkleri
const colorStyles: Record<string, string> = {
  emerald:
    "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50 hover:bg-emerald-100 dark:hover:bg-emerald-800/40 hover:border-emerald-300 dark:hover:border-emerald-600 shadow-sm shadow-emerald-100/50 dark:shadow-none",
  blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/50 hover:bg-blue-100 dark:hover:bg-blue-800/40 hover:border-blue-300 dark:hover:border-blue-600 shadow-sm shadow-blue-100/50 dark:shadow-none",
  amber:
    "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/50 hover:bg-amber-100 dark:hover:bg-amber-800/40 hover:border-amber-300 dark:hover:border-amber-600 shadow-sm shadow-amber-100/50 dark:shadow-none",
  indigo:
    "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/50 hover:bg-indigo-100 dark:hover:bg-indigo-800/40 hover:border-indigo-300 dark:hover:border-indigo-600 shadow-sm shadow-indigo-100/50 dark:shadow-none",
  violet:
    "bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800/50 hover:bg-violet-100 dark:hover:bg-violet-800/40 hover:border-violet-300 dark:hover:border-violet-600 shadow-sm shadow-violet-100/50 dark:shadow-none",
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

  // Duaları Kategorilere Ayırdık
  const DUALAR_CATEGORIES = useMemo(
    () => [
      {
        categoryTitle: t("categoryTimePrayers") || "Vakit Duaları",
        colorTheme: "violet",
        items: [
          {
            id: "sabah-dualari",
            title: t("sabahDualariTitle") || "Sabah Duaları",
            codeKey: "SABAHDUALARI",
            type: "CUSTOM_PAGE",
            desc: t("sabahDualariDesc") || "Güne bereketle başlamak için",
            color: "violet",
          },
          {
            id: "ogle-dualari",
            title: t("ogleDualariTitle") || "Öğle Duaları",
            codeKey: "OGLEDUALARI",
            type: "CUSTOM_PAGE",
            desc: t("ogleDualariDesc") || "Günü bereketle devam ettirmek için",
            color: "violet",
          },
          {
            id: "ikindi-dualari",
            title: t("ikindiDualariTitle") || "İkindi Duaları",
            codeKey: "IKINDIDUALARI",
            type: "CUSTOM_PAGE",
            desc:
              t("ikindiDualariDesc") || "İkindi vaktini bereketlendirmek için",
            color: "violet",
          },
          {
            id: "aksam-dualari",
            title: t("aksamDualariTitle") || "Akşam Duaları",
            codeKey: "AKSAMDUALARI",
            type: "CUSTOM_PAGE",
            desc: t("aksamDualariDesc") || "Geceye huzurla girmek için",
            color: "violet",
          },
          {
            id: "yatsi-dualari",
            title: t("yatsiDualariTitle") || "Yatsı Duaları",
            codeKey: "YATSIDUALARI",
            type: "CUSTOM_PAGE",
            desc: t("yatsiDualariDesc") || "Günü huşu ile kapatmak için",
            color: "violet",
          },
        ],
      },
      {
        categoryTitle: t("categorySalavats") || "Salavat-ı Şerifeler",
        colorTheme: "indigo",
        items: [
          {
            id: "tefriciye",
            title: t("duaTefriciyeTitle") || "Salât-ı Tefriciye",
            codeKey: "TEFRICIYE",
            type: "COUNTABLE",
            desc:
              t("duaTefriciyeDesc") || "Sıkıntıların def'i için okunan salavat",
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
            desc:
              t("duaSalavatDesc") || "Peygamber Efendimiz'e (asm) salavatlar",
            color: "indigo",
          },
        ],
      },
      {
        categoryTitle: t("categoryKuran") || "Kur'an & Hadis Duaları",
        colorTheme: "blue",
        items: [
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
              t("duaDailyDesc") || "Hisnul Müslim'den sabah/akşam zikirleri",
            color: "blue",
          },
          {
            id: "tevhidname",
            title: t("duaTevhidnameTitle") || "Tevhidname",
            codeKey: "TEVHIDNAME",
            type: "LIST_BASED",
            desc: t("duaTevhidnameDesc") || "Tevhid hakikatleri ve zikirleri",
            color: "blue",
          },
        ],
      },
      {
        categoryTitle: t("categoryEsma") || "Esma & Şüheda",
        colorTheme: "emerald", // Karma olabilir, ana hatlarıyla yeşil-sarı tonları
        items: [
          {
            id: "esmaulhusna",
            title: t("duaEsmaTitle") || "Esma-ül Hüsna",
            codeKey: "ESMAULHUSNA",
            type: "CUSTOM_PAGE",
            desc:
              t("duaEsmaDesc") || "Allah'ın 99 İsmi, faziletleri ve zikirleri",
            color: "emerald",
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
      },
    ],
    [t],
  );

  // Tüm duaları tek bir düz listede tutan yardımcı array (URL yönlendirmeleri için)
  const FLAT_DUALAR_LIST = useMemo(() => {
    return DUALAR_CATEGORIES.flatMap((category) => category.items);
  }, [DUALAR_CATEGORIES]);

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
      const targetDua = FLAT_DUALAR_LIST.find((d) => d.id === duaParam);
      if (targetDua) {
        Promise.resolve().then(() => handleOpenDua(targetDua, true));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, resources, duaParam, FLAT_DUALAR_LIST]);

  const handleOpenDua = (duaConfig: any, isAuto = false) => {
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#061612] py-8 px-4 sm:px-6 transition-colors duration-500">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Üst Başlık */}
        <div className="flex items-center justify-between bg-white dark:bg-[#0a1f1a] shadow-sm p-4 rounded-3xl border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => router.push("/resources")}
            className="p-2 bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-blue-900/50 dark:hover:text-blue-400 rounded-full transition-all group"
            title={t("backToResources") || "Geri"}
          >
            <svg
              className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform"
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
          <h1 className="text-base md:text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest">
            {t("dualarTitle") || "Dualar ve Virdler"}
          </h1>
          <div className="w-9"></div> {/* Balans için boş div */}
        </div>

        {/* Kategorize Edilmiş Grid Yapısı */}
        {loading ? (
          <div className="flex justify-center items-center py-32">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-12 pb-10">
            {DUALAR_CATEGORIES.map((category, idx) => (
              <section
                key={idx}
                className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both"
                style={{ animationDelay: `${idx * 150}ms` }}
              >
                {/* Kategori Başlığı */}
                <div className="flex items-center mb-5 px-2">
                  <h3
                    className={`text-xl md:text-2xl font-black text-${category.colorTheme}-700 dark:text-${category.colorTheme}-400 tracking-tight`}
                  >
                    {category.categoryTitle}
                  </h3>
                  <div
                    className={`ml-4 h-px flex-grow bg-gradient-to-r from-${category.colorTheme}-200 to-transparent dark:from-${category.colorTheme}-800/60`}
                  ></div>
                </div>

                {/* Kategori İçi Kartlar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                  {category.items.map((dua) => (
                    <button
                      key={dua.id}
                      onClick={() => handleOpenDua(dua)}
                      className={`group p-5 md:p-6 rounded-3xl border transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg text-left relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${dua.color}-400 dark:focus:ring-offset-[#061612] ${colorStyles[dua.color]}`}
                    >
                      <div className="relative z-10 flex flex-col gap-2.5">
                        <h2 className="font-extrabold text-lg md:text-xl tracking-tight leading-tight">
                          {dua.title}
                        </h2>
                        <p className="text-xs md:text-sm opacity-80 leading-relaxed font-medium">
                          {dua.desc}
                        </p>
                      </div>

                      {/* Kart İçi Dekoratif İkon (Opsiyonel görsel şıklık) */}
                      <div className="absolute -right-4 -bottom-4 opacity-[0.04] dark:opacity-[0.02] transform group-hover:scale-110 transition-transform duration-500">
                        <svg
                          className="w-32 h-32"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            ))}
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
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#061612]">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin"></div>
        </div>
      }
    >
      <DualarContent />
    </Suspense>
  );
}
