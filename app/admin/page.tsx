/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Resource } from "@/types";
import Link from "next/link";

/**
 * CATEGORY DEFINITIONS
 * Defines the strict order of categories for the UI display.
 */
const CATEGORY_ORDER = [
  "MAIN", // Quran
  "SURAHS", // Specific Surahs (Yasin, Fetih)
  "PRAYERS", // Prayers (Cevşen, Tevhidname)
  "SALAWATS", // Salawats
  "NAMES", // Names of Allah/Prophet/Companions (Bedir, Uhud)
  "DHIKRS", // General Dhikrs
] as const;

/**
 * MAPPING CONFIGURATION
 * Maps specific resource codes to their display categories.
 */
const CATEGORY_MAPPING: Record<string, (typeof CATEGORY_ORDER)[number]> = {
  // Quran
  QURAN: "MAIN",

  // Surahs
  FETIH: "SURAHS",
  YASIN: "SURAHS",
  WAQIA: "SURAHS",
  FATIHA: "SURAHS",
  IHLAS: "SURAHS",
  FELAK: "SURAHS",
  NAS: "SURAHS",

  // Prayers
  CEVSEN: "PRAYERS",
  TEVHIDNAME: "PRAYERS",

  // Salawats
  OZELSALAVAT: "SALAWATS",
  TEFRICIYE: "SALAWATS",
  MUNCIYE: "SALAWATS",

  // Names
  BEDIR: "NAMES",
  UHUD: "NAMES",

  // Dhikrs
  YALATIF: "DHIKRS",
  YAHAFIZ: "DHIKRS",
  YAFETTAH: "DHIKRS",
  HASBUNALLAH: "DHIKRS",
  LAHAVLE: "DHIKRS",
};

/**
 * PRIORITY SORTING
 * Defines the specific sort order of resources within their categories.
 */
const RESOURCE_PRIORITY = [
  "QURAN",
  "FETIH",
  "YASIN",
  "WAQIA",
  "FATIHA",
  "IHLAS",
  "FELAK",
  "NAS",

  "CEVSEN",
  "TEVHIDNAME",
  "OZELSALAVAT",
  "TEFRICIYE",
  "MUNCIYE",
  "BEDIR",
  "UHUD",
];

// Resources that imply a 'Count' based distribution rather than 'Part' based.
const MULTIPLIER_KEYWORDS = [
  "KURAN",
  "QURAN",
  "CEVSEN",
  "BEDIR",
  "UHUD",
  "TEVHIDNAME",
];

export default function AdminPage() {
  // Context Hooks
  const { t, language } = useLanguage();
  const { user, token, logout } = useAuth();

  // State Management
  const [resources, setResources] = useState<Resource[]>([]);
  const [description, setDescription] = useState("");
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [participants, setParticipants] = useState<string>("10");
  const [customTotals, setCustomTotals] = useState<Record<string, string>>({});

  // Creation Result State
  const [createdLink, setCreatedLink] = useState<string>("");
  const [createdCode, setCreatedCode] = useState<string>("");
  const [createdSessionName, setCreatedSessionName] = useState<string>("");

  // UI State
  const [loading, setLoading] = useState(false); // For button loading state
  const [isFetchingResources, setIsFetchingResources] = useState(true); // For initial page load
  const [deviceId, setDeviceId] = useState("");
  const [isAuthChecked, setIsAuthChecked] = useState(false); // For authorization check process

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

  /**
   * Helper to resolve the correct display name based on current language.
   * Falls back to 'tr' or the code key if translation is missing.
   */
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

  /**
   * Device ID Management
   * Generates or retrieves a unique ID for the device to track session ownership locally.
   */
  useEffect(() => {
    let id = localStorage.getItem("deviceId");
    if (!id) {
      id =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
      localStorage.setItem("deviceId", id);
    }
    setDeviceId(id);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAuthChecked(true);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  /**
   * Helper to get localized Category Titles.
   */
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

  // Fetch available resources on mount
  useEffect(() => {
    if (!apiUrl || !token) {
      // If there is no token, do not make an API request, stop loading state.
      setIsFetchingResources(false);
      return;
    }

    setIsFetchingResources(true);
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
      .catch((err) => console.error(err))
      .finally(() => setIsFetchingResources(false));
  }, [apiUrl, token, logout, t]);

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

      // Inner Category Sorting
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
      const finalDescription =
        description.trim() === "" ? t("defaultSessionName") : description;

      const payload = {
        resourceIds: selectedResources.map((id) => Number(id)),
        participants: parseInt(participants) || 10,
        customTotals: customTotals,
        description: finalDescription, // Using finalDescription instead of original 'description'
        ownerDeviceId: deviceId,
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

      // Displayed name is taken from the backend or fallback to our default name
      setCreatedSessionName(data.description || finalDescription);

      sessionStorage.removeItem("adminState");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      alert(err.message || t("errorOccurred"));
    } finally {
      setLoading(false);
    }
  };

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

  // --- RENDER PROCESS ---

  // 1. First wait for the authorization (localStorage read) check
  if (!isAuthChecked) {
    return <LoadingScreen t={t} />;
  }

  // 2. If unauthorized (Not Logged In), show warning screen
  if (!user || !token) {
    return (
      <div className="flex h-screen items-center justify-center bg-transparent p-4">
        <div className="bg-white dark:bg-gray-900 p-8 rounded-[2rem] shadow-xl text-center max-w-md w-full border border-red-100 dark:border-red-900/30 animate-in fade-in zoom-in-95 duration-300">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 dark:bg-red-900/20 shadow-inner">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-8 h-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-2">
            {t("loginRequired")}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium">
            {t("unauthorizedAccess") ||
              "Please log in to access this page and create a new circle."}
          </p>
          <Link
            href="/login"
            className="inline-flex w-full py-4 items-center justify-center bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-500/30"
          >
            {t("getStarted")}
          </Link>
        </div>
      </div>
    );
  }

  // 3. If logged in but resources are still fetching from API, wait
  if (isFetchingResources) {
    return <LoadingScreen t={t} />;
  }

  // 4. If everything is OK, show the normal Admin (Creation) Page
  return (
    <div className="min-h-screen pb-10 pt-4 md:pt-6 px-4 bg-transparent">
      {/* Header Bar */}
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
          /* --- CREATION FORM --- */
          <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 rounded-[2rem] md:rounded-[2.5rem] p-5 md:p-10 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Session Name Input */}
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

            {/* Participant Count Input */}
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

            {/* Resource Selection Grid */}
            <div className="mb-8 md:mb-10">
              <h3 className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4 dark:text-blue-400 ml-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                {t("resourceSelection")}
              </h3>

              <div className="space-y-6">
                {categorizedResources.map((category: any) => (
                  <div key={category.key}>
                    {/* Category Divider */}
                    <div className="flex items-center gap-3 mb-3 px-1">
                      <div className="h-px bg-gray-200 dark:bg-gray-700 flex-1"></div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        {category.title}
                      </span>
                      <div className="h-px bg-gray-200 dark:bg-gray-700 flex-1"></div>
                    </div>

                    {/* Resources Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
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
                            className={`flex items-center p-4 md:p-5 rounded-xl md:rounded-2xl border-2 transition-all duration-300 cursor-pointer select-none ${isSelected ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 shadow-md transform scale-[1.01]" : "bg-white dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 hover:border-blue-100 dark:hover:border-gray-700"}`}
                          >
                            <div
                              className={`w-6 h-6 md:w-7 md:h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${isSelected ? "border-blue-500 bg-blue-500" : "border-gray-200"}`}
                            >
                              {isSelected && (
                                <svg
                                  className="w-3.5 h-3.5 md:w-4 md:h-4 text-white"
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
                              className={`ml-3.5 font-bold text-base md:text-lg truncate ${isSelected ? "text-blue-700 dark:text-blue-300" : "text-gray-600 dark:text-gray-400"}`}
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

            {/* Target Counts Configuration */}
            {allSelectedResources.length > 0 && (
              <div className="mb-8 md:mb-10 bg-amber-50/50 dark:bg-amber-900/10 border-2 border-amber-100 dark:border-amber-900/20 rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-6 space-y-4 animate-in zoom-in-95 duration-300">
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
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/50 dark:bg-black/10 p-4 md:p-5 rounded-xl border border-amber-50 dark:border-gray-800"
                      >
                        <label className="text-sm md:text-base font-bold text-gray-700 dark:text-gray-300 truncate">
                          {getDisplayName(r)}
                        </label>
                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                          <span className="text-[9px] font-black text-gray-400 uppercase bg-gray-100 dark:bg-gray-800 px-2.5 py-1.5 rounded-md">
                            {isMult ? t("pieces") : t("target")}
                          </span>
                          <input
                            type="number"
                            min="1"
                            className="w-24 md:w-28 bg-white dark:bg-gray-800 border-2 border-amber-200 dark:border-gray-700 rounded-xl px-3 py-2 text-base md:text-lg font-black text-center outline-none focus:border-amber-500 dark:text-white"
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
          /* --- SUCCESS SCREEN --- */
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
                  alert(t("copied"));
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

              {/* WhatsApp Share Button */}
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  t("whatsappShareText")
                    .replace(
                      "{name}",
                      createdSessionName ? `"${createdSessionName}" ` : "",
                    )
                    .replace("{link}", createdLink)
                    .replace("{code}", createdCode),
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="sm:col-span-2 block w-full py-3.5 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl md:rounded-2xl font-bold shadow-md transition-all active:scale-95 text-sm flex items-center justify-center gap-2"
              >
                <svg
                  className="w-5 h-5 md:w-6 md:h-6 fill-current"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <span>{t("shareWhatsapp")}</span>
              </a>

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

function LoadingScreen({ t }: { t: any }) {
  const [isSlowLoad, setIsSlowLoad] = useState(false);

  useEffect(() => {
    // Assume the server is in sleep mode after 4 seconds
    const timer = setTimeout(() => setIsSlowLoad(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex h-screen items-center justify-center bg-transparent px-4 text-center">
      <div className="flex flex-col items-center gap-5">
        <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-emerald-100 dark:border-emerald-900/50 border-t-emerald-600 dark:border-t-emerald-500 rounded-full animate-spin"></div>

        <div className="flex flex-col gap-3 items-center">
          <p className="text-gray-800 dark:text-gray-200 font-bold animate-pulse text-base md:text-lg">
            {t("loading")}
          </p>

          {isSlowLoad && (
            <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm max-w-[280px] animate-in fade-in duration-1000 leading-relaxed bg-emerald-50 dark:bg-emerald-900/10 p-3 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
              {t("serverWakingUpPart1")}
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                30-40 {t("seconds")}
              </span>{" "}
              {t("serverWakingUpPart2")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
