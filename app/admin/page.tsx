/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Resource } from "@/types";
import Link from "next/link";

// --- KATEGORİ TANIMLARI ---
const CATEGORY_ORDER = [
  "MAIN", // Kuran
  "SURAHS", // Sureler (Yasin, Fetih)
  "PRAYERS", // Dualar (Cevşen, Tevhidname)
  "SALAWATS", // Salavatlar
  "NAMES", // İsimler (Bedir, Uhud)
  "DHIKRS", // Zikirler (Kalanlar)
] as const;

const CATEGORY_MAPPING: Record<string, (typeof CATEGORY_ORDER)[number]> = {
  // Kuran
  QURAN: "MAIN",

  // Sureler
  FETIH: "SURAHS",
  YASIN: "SURAHS",

  // Dualar
  CEVSEN: "PRAYERS",
  TEVHIDNAME: "PRAYERS",

  // Salavatlar
  OZELSALAVAT: "SALAWATS",
  TEFRICIYE: "SALAWATS",
  MUNCIYE: "SALAWATS",

  // İsimler
  BEDIR: "NAMES",
  UHUD: "NAMES",

  // Zikirler
  YALATIF: "DHIKRS",
  YAHAFIZ: "DHIKRS",
  YAFETTAH: "DHIKRS",
  HASBUNALLAH: "DHIKRS",
  LAHAVLE: "DHIKRS",
};

// Kaynakların kendi içindeki sıralaması
const RESOURCE_PRIORITY = [
  "QURAN",
  "FETIH",
  "YASIN",
  "CEVSEN",
  "TEVHIDNAME",
  "OZELSALAVAT",
  "TEFRICIYE",
  "MUNCIYE",
  "BEDIR",
  "UHUD",
];

// --- GRUP A: Adet (Kopya) Bazlı Çoğaltılacak Kaynaklar ---
const MULTIPLIER_KEYWORDS = [
  "KURAN",
  "QURAN",
  "CEVSEN",
  "BEDIR",
  "UHUD",
  "TEVHIDNAME",
];

export default function AdminPage() {
  const { t, language } = useLanguage();
  const { user, token, logout } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [description, setDescription] = useState("");
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [participants, setParticipants] = useState<string>("10");
  const [customTotals, setCustomTotals] = useState<Record<string, string>>({});
  const [createdLink, setCreatedLink] = useState<string>("");
  const [createdCode, setCreatedCode] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [createdSessionName, setCreatedSessionName] = useState<string>("");
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

  const getDisplayName = useCallback(
    (resource: Resource) => {
      let translation = resource.translations?.find(
        (tr) => tr.langCode === language,
      );
      if (!translation) {
        translation = resource.translations?.find((tr) => tr.langCode === "tr");
      }
      return translation ? translation.name : resource.codeKey;
    },
    [language],
  );

  const getCategoryTitle = useCallback(
    (catKey: string) => {
      const titles: Record<string, Record<string, string>> = {
        MAIN: {
          tr: "Kuran-ı Kerim",
          en: "The Holy Quran",
          ar: "القرآن الكريم",
        },
        SURAHS: { tr: "Sureler", en: "Surahs", ar: "سور" },
        PRAYERS: { tr: "Dualar", en: "Prayers", ar: "الأدعية" },
        SALAWATS: { tr: "Salavatlar", en: "Salawats", ar: "الصلوات" },
        NAMES: { tr: "İsimler", en: "Names", ar: "الأسماء" },
        DHIKRS: { tr: "Zikirler", en: "Dhikrs", ar: "الأذكار" },
      };

      const langKey =
        language === "tr" || language === "en" || language === "ar"
          ? language
          : "en";
      return titles[catKey]?.[langKey] || titles[catKey]?.["en"] || catKey;
    },
    [language],
  );

  const isMultiplierResource = (codeKey: string) => {
    if (!codeKey) return false;
    return MULTIPLIER_KEYWORDS.some((keyword) =>
      codeKey.toUpperCase().includes(keyword),
    );
  };

  useEffect(() => {
    if (!apiUrl || !token) return;
    const headers = { Authorization: `Bearer ${token}` };
    fetch(`${apiUrl}/api/distribution/resources`, { headers })
      .then((res) => {
        if (res.status === 401 || res.status === 403) {
          logout();
          throw new Error(t("sessionExpired"));
        }
        if (!res.ok) throw new Error("Fetch failed");
        return res.json();
      })
      .then((data) => {
        setResources(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error(err));
  }, [apiUrl, token, logout, t]);

  // --- KATEGORİLERE GÖRE GRUPLAMA MANTIĞI ---
  const categorizedResources = useMemo(() => {
    if (!resources.length) return [];

    const categories: Record<string, Resource[]> = {};
    CATEGORY_ORDER.forEach((cat) => (categories[cat] = []));

    resources.forEach((resource) => {
      const upperCode = resource.codeKey?.toUpperCase() || "";
      const category = CATEGORY_MAPPING[upperCode] || "DHIKRS";
      if (categories[category]) {
        categories[category].push(resource);
      } else {
        categories["DHIKRS"].push(resource);
      }
    });

    return CATEGORY_ORDER.map((catKey) => {
      const items = categories[catKey];
      if (items.length === 0) return null;

      // Kategori içi sıralama
      items.sort((a, b) => {
        const codeA = (a.codeKey || "").toUpperCase();
        const codeB = (b.codeKey || "").toUpperCase();
        const indexA = RESOURCE_PRIORITY.indexOf(codeA);
        const indexB = RESOURCE_PRIORITY.indexOf(codeB);

        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return getDisplayName(a).localeCompare(getDisplayName(b));
      });

      return {
        key: catKey,
        title: getCategoryTitle(catKey),
        items: items,
      };
    }).filter(Boolean);
  }, [resources, getCategoryTitle, getDisplayName]);

  const handleCheckboxChange = (id: string) => {
    if (selectedResources.includes(id)) {
      setSelectedResources(selectedResources.filter((rId) => rId !== id));
      const newTotals = { ...customTotals };
      delete newTotals[id];
      setCustomTotals(newTotals);
    } else {
      setSelectedResources([...selectedResources, id]);
      const resource = resources.find((r) => r.id.toString() === id);
      if (resource && isMultiplierResource(resource.codeKey)) {
        setCustomTotals((prev) => ({ ...prev, [id]: "1" }));
      }
    }
  };

  const handleCreate = async () => {
    if (!user || !token) {
      alert(t("loginRequired"));
      return;
    }
    if (selectedResources.length === 0) {
      alert(t("alertSelectResource"));
      return;
    }
    setLoading(true);
    try {
      const payload = {
        resourceIds: selectedResources.map((id) => Number(id)),
        participants: parseInt(participants) || 10,
        customTotals: customTotals,
        description: description,
      };
      const res = await fetch(`${apiUrl}/api/distribution/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setCreatedCode(data.code);
      setCreatedLink(`${window.location.origin}/join/${data.code}`);
      setCreatedSessionName(data.description || "");
      sessionStorage.removeItem("adminState");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      alert(err.message || t("errorOccurred"));
    } finally {
      setLoading(false);
    }
  };

  // Seçilen kaynakları da ÖNCELİK SIRASINA göre filtreleyip sıralıyoruz (Inputların düzgün görünmesi için)
  const allSelectedResources = useMemo(() => {
    return resources
      .filter((r) => selectedResources.includes(r.id.toString()))
      .sort((a, b) => {
        const codeA = (a.codeKey || "").toUpperCase();
        const codeB = (b.codeKey || "").toUpperCase();
        const indexA = RESOURCE_PRIORITY.indexOf(codeA);
        const indexB = RESOURCE_PRIORITY.indexOf(codeB);
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return a.id - b.id;
      });
  }, [resources, selectedResources]);

  return (
    <div className="min-h-screen pb-10 pt-4 md:pt-6 px-4 bg-transparent">
      {/* Üst Bar */}
      <div className="max-w-2xl mx-auto mb-6 md:mb-8 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-gray-500 hover:text-blue-600 transition-colors font-bold text-xs md:text-sm"
        >
          <svg
            className="w-4 h-4 md:w-5 md:h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          <span>{t("backHome")}</span>
        </Link>
        <h1 className="text-lg md:text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-emerald-600 dark:from-blue-400 dark:to-emerald-400">
          {t("createDistTitle")}
        </h1>
      </div>

      <div className="max-w-2xl mx-auto space-y-6 md:space-y-8">
        {!createdLink ? (
          /* OLUŞTURMA FORMU */
          <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 rounded-[2rem] md:rounded-[2.5rem] p-5 md:p-10 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Halka İsmi */}
            <div className="mb-5 md:mb-6">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                {t("sessionNameLabel")}
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("sessionNamePlaceholder")}
                className="w-full p-3.5 md:p-4 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl outline-none focus:border-blue-500 transition-all dark:text-white font-bold text-sm md:text-base"
              />
            </div>

            {/* Katılımcı Sayısı */}
            <div className="mb-6 md:mb-8">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                {t("participantCount")}
              </label>
              <div className="relative group">
                <input
                  type="number"
                  min="1"
                  value={participants}
                  onChange={(e) => setParticipants(e.target.value)}
                  className="w-full bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl pl-4 pr-14 py-3.5 md:py-4 text-lg md:text-xl font-black text-gray-800 dark:text-white outline-none focus:border-blue-500 transition-all"
                  placeholder="10"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-[10px] md:text-xs pointer-events-none uppercase">
                  {t("person")}
                </div>
              </div>
            </div>

            {/* Kaynak Seçimi - KATEGORİLENDİRİLMİŞ */}
            <div className="mb-8 md:mb-10">
              <h3 className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4 dark:text-blue-400 ml-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                {t("resourceSelection")}
              </h3>

              <div className="space-y-6">
                {categorizedResources.map((category: any) => (
                  <div key={category.key}>
                    {/* Kategori Ayracı */}
                    <div className="flex items-center gap-3 mb-3 px-1">
                      <div className="h-px bg-gray-200 dark:bg-gray-700 flex-1"></div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        {category.title}
                      </span>
                      <div className="h-px bg-gray-200 dark:bg-gray-700 flex-1"></div>
                    </div>

                    {/* Kaynak Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                      {category.items.map((r: Resource) => {
                        const isSelected = selectedResources.includes(
                          r.id.toString(),
                        );
                        return (
                          <div
                            key={r.id}
                            onClick={() =>
                              handleCheckboxChange(r.id.toString())
                            }
                            className={`flex items-center p-3 md:p-4 rounded-xl md:rounded-2xl border-2 transition-all duration-300 cursor-pointer select-none ${isSelected ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800" : "bg-white dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 hover:border-blue-100 dark:hover:border-gray-700"}`}
                          >
                            <div
                              className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${isSelected ? "border-blue-500 bg-blue-500 scale-105" : "border-gray-200"}`}
                            >
                              {isSelected && (
                                <svg
                                  className="w-3 h-3 md:w-4 md:h-4 text-white"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={4}
                                >
                                  <path d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <span
                              className={`ml-2.5 font-bold text-xs md:text-sm truncate ${isSelected ? "text-blue-700 dark:text-blue-300" : "text-gray-600 dark:text-gray-400"}`}
                            >
                              {getDisplayName(r)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hedef Sayı Girişleri (Mobilde Kompakt) */}
            {allSelectedResources.length > 0 && (
              <div className="mb-8 md:mb-10 bg-amber-50/50 dark:bg-amber-900/10 border-2 border-amber-100 dark:border-amber-900/20 rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-6 space-y-4 animate-in zoom-in-95 duration-300">
                <div className="flex items-center gap-2 border-b border-amber-100 dark:border-amber-900/20 pb-3">
                  <h3 className="text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest">
                    {t("setTargetCounts")}
                  </h3>
                </div>
                <div className="space-y-3">
                  {allSelectedResources.map((r) => {
                    const isMult = isMultiplierResource(r.codeKey);
                    return (
                      <div
                        key={r.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white/50 dark:bg-black/10 p-2.5 md:p-3 rounded-xl border border-amber-50 dark:border-gray-800"
                      >
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 truncate">
                          {getDisplayName(r)}
                        </label>
                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                          <span className="text-[8px] font-black text-gray-400 uppercase bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
                            {isMult
                              ? t("pieces") || "ADET"
                              : t("target") || "HEDEF"}
                          </span>
                          <input
                            type="number"
                            min="1"
                            className="w-20 md:w-24 bg-white dark:bg-gray-800 border-2 border-amber-200 dark:border-gray-700 rounded-xl px-2 py-1.5 text-xs md:text-sm font-black text-center outline-none focus:border-amber-500 dark:text-white"
                            value={customTotals[r.id.toString()] || ""}
                            onChange={(e) =>
                              setCustomTotals({
                                ...customTotals,
                                [r.id.toString()]: e.target.value,
                              })
                            }
                            placeholder={
                              isMult
                                ? "1"
                                : r.totalUnits
                                  ? r.totalUnits.toString()
                                  : "0"
                            }
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              onClick={handleCreate}
              disabled={loading || selectedResources.length === 0}
              className="w-full py-4 md:py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl md:rounded-[1.5rem] font-black text-base md:text-lg shadow-xl hover:shadow-blue-500/40 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 md:h-6 md:w-6"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              <span>{t("createButton")}</span>
            </button>
          </div>
        ) : (
          /* BAŞARI EKRANI (Mobilde Tam Oturur) */
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl border border-green-200 dark:border-green-900 rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-14 text-center animate-in fade-in zoom-in duration-500 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
            <div className="w-16 h-16 md:w-24 md:h-24 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto mb-6 md:mb-8 transform rotate-3 shadow-inner">
              <svg
                className="w-8 h-8 md:w-12 md:h-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-xl md:text-3xl font-black mb-1.5 dark:text-white leading-tight">
              {t("sessionCreated")}
            </h2>
            {createdSessionName && (
              <p className="text-sm md:text-xl text-blue-600 dark:text-blue-400 font-bold mb-8">
                &quot;{createdSessionName}&quot;
              </p>
            )}
            <div className="bg-gray-50 dark:bg-black/30 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] mb-8 md:mb-10 border-2 border-dashed border-gray-200 dark:border-gray-800">
              <p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                {t("sessionCodePlaceholder")}
              </p>
              <span className="text-2xl md:text-5xl font-mono font-black text-blue-600 dark:text-blue-400 tracking-[0.1em] md:tracking-[0.2em]">
                {createdCode}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(createdCode);
                  alert(t("codeCopied"));
                }}
                className="w-full py-3.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-2 border-gray-100 dark:border-gray-700 rounded-xl md:rounded-2xl font-bold hover:bg-gray-50 transition-all active:scale-95 text-sm"
              >
                {t("copyCode")}
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(createdLink);
                  alert(t("copied"));
                }}
                className="w-full py-3.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl md:rounded-2xl font-bold active:scale-95 text-sm"
              >
                {t("copyLink")}
              </button>
              <Link
                href={`/join/${createdCode}`}
                className="sm:col-span-2 block w-full py-4 md:py-5 bg-emerald-600 text-white rounded-xl md:rounded-2xl font-black text-base md:text-lg shadow-lg active:scale-95 transition-all"
              >
                {t("startReading")}
              </Link>
            </div>
            <button
              onClick={() => setCreatedLink("")}
              className="mt-8 text-[10px] font-bold text-gray-400 hover:text-gray-600 underline transition-colors tracking-widest uppercase"
            >
              {t("createNewOne")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
