/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, Suspense, useMemo, useCallback } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { DistributionSession, Assignment } from "@/types";
import { useSearchParams, useRouter } from "next/navigation";
// Modüllerimiz
import {
  CATEGORY_ORDER,
  CATEGORY_MAPPING,
  RESOURCE_PRIORITY,
} from "@/constants/adminConfig";
import AdminLoading from "@/components/admin/AdminLoading";
import MonitorStats from "@/components/admin/monitor/MonitorStats";
import AddResourceModal from "@/components/admin/monitor/AddResourceModal";
import ResourceAccordion from "@/components/admin/monitor/ResourceAccordion";

function MonitorContent() {
  const { t, language } = useLanguage();
  const { token } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [targetCount, setTargetCount] = useState<string>("1");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [allResources, setAllResources] = useState<any[]>([]);
  const [selectedResourceId, setSelectedResourceId] = useState<string>("");
  const [addingResource, setAddingResource] = useState(false);

  const [code, setCode] = useState("");
  const [session, setSession] = useState<DistributionSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedResources, setExpandedResources] = useState<
    Record<string, boolean>
  >({});

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // i18n'e uygun şekilde refactor edildi
  const getCategoryTitle = useCallback(
    (catKey: string) => {
      const keys: Record<string, string> = {
        MAIN: "categoryMain",
        SURAHS: "categorySurahs",
        PRAYERS: "categoryPrayers",
        SALAWATS: "categorySalawats",
        NAMES: "categoryNames",
        DHIKRS: "categoryDhikrs",
      };
      const translationKey = keys[catKey];
      return translationKey ? t(translationKey) : catKey;
    },
    [t],
  );

  const getResourceName = useCallback(
    (resource: any) => {
      let trans = resource.translations?.find(
        (tr: any) => tr.langCode === language,
      );
      if (!trans)
        trans = resource.translations?.find((tr: any) => tr.langCode === "tr");
      if (!trans) trans = resource.translations?.[0];
      return trans?.name || resource.codeKey;
    },
    [language],
  );

  const stats = useMemo(() => {
    if (!session || !session.assignments || session.assignments.length === 0) {
      return {
        total: 0,
        distributed: 0,
        completed: 0,
        distPercent: 0,
        compPercent: 0,
      };
    }
    const total = session.assignments.length;
    const distributed = session.assignments.filter((a) => a.isTaken).length;
    const completed = session.assignments.filter((a) => a.isCompleted).length;

    return {
      total,
      distributed,
      completed,
      distPercent: Math.round((distributed / total) * 100) || 0,
      compPercent: Math.round((completed / total) * 100) || 0,
    };
  }, [session]);

  const fetchData = async (codeToFetch: string) => {
    if (!codeToFetch) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `${apiUrl}/api/distribution/get/${codeToFetch}?t=${Date.now()}`,
      );
      if (!res.ok) {
        if (res.status === 404) throw new Error(t("errorInvalidCode"));
        throw new Error(t("errorOccurred"));
      }

      const data: DistributionSession = await res.json();
      const currentUser = localStorage.getItem("username");
      const creator = data.creatorName || (data as any).ownerName;

      if (!currentUser || currentUser !== creator) {
        throw new Error(
          t("unauthorizedAccessDesc") ||
            "Bu paneli sadece dağıtımı oluşturan kişi görüntüleyebilir.",
        );
      }

      setSession(data);
    } catch (err: any) {
      console.error("Fetch Error:", err);
      setError(err.message || t("errorInvalidCode"));
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const urlCode = searchParams.get("code");
    if (urlCode) {
      setCode(urlCode);
      fetchData(urlCode);
    }
  }, [searchParams]);

  useEffect(() => {
    if (token) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/distribution/resources`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          const EXCLUDED_RESOURCE_KEYS = [
            "ESMAULHUSNA",
            "GUNLUKDUALAR",
            "KURANDUALARI",
            "DUALAR",
          ];

          const filteredResources = data.filter((resource: any) => {
            const upperCode = resource.codeKey?.toUpperCase() || "";
            return !EXCLUDED_RESOURCE_KEYS.includes(upperCode);
          });

          setAllResources(filteredResources);
        })
        .catch(console.error);
    }
  }, [token]);

  const handleAddResource = async () => {
    if (!selectedResourceId || !targetCount) return;
    setAddingResource(true);
    try {
      const queryParams = new URLSearchParams({
        resourceId: selectedResourceId,
        totalUnits: targetCount,
      }).toString();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/distribution/${code}/add-resource?${queryParams}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (res.ok) {
        alert(t("resourceAdded"));
        setIsAddModalOpen(false);
        setTargetCount("1");
        fetchData(code);
      } else {
        alert(t("errorPrefix") + " " + (await res.text()));
      }
    } catch (e) {
      console.error(e);
      alert(t("errorOccurred"));
    } finally {
      setAddingResource(false);
    }
  };

  const categorizedGroups = useMemo(() => {
    if (!session) return [];

    const rawGroups: Record<string, any> = {};
    session.assignments.forEach((a) => {
      const name = getResourceName(a.resource);
      const codeKey = a.resource?.codeKey || "";
      if (!rawGroups[name])
        rawGroups[name] = { assignments: [], codeKey, resourceName: name };
      rawGroups[name].assignments.push(a);
    });

    Object.values(rawGroups).forEach((group) =>
      group.assignments.sort(
        (a: any, b: any) => a.participantNumber - b.participantNumber,
      ),
    );

    const categories: Record<string, any[]> = {};
    CATEGORY_ORDER.forEach((cat) => (categories[cat] = []));

    Object.values(rawGroups).forEach((group) => {
      const category =
        CATEGORY_MAPPING[group.codeKey.toUpperCase()] || "DHIKRS";
      if (categories[category]) categories[category].push(group);
      else categories["DHIKRS"].push(group);
    });

    return CATEGORY_ORDER.map((catKey) => {
      const items = categories[catKey];
      if (items.length === 0) return null;
      items.sort((a, b) => {
        const indexA = RESOURCE_PRIORITY.indexOf(a.codeKey.toUpperCase());
        const indexB = RESOURCE_PRIORITY.indexOf(b.codeKey.toUpperCase());
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return a.resourceName.localeCompare(b.resourceName);
      });
      return { key: catKey, title: getCategoryTitle(catKey), items };
    }).filter(Boolean);
  }, [session, getCategoryTitle, getResourceName]);

  const toggleResource = (name: string) =>
    setExpandedResources((prev) => ({ ...prev, [name]: !prev[name] }));

  if (loading && !session) return <AdminLoading />;

  if (error && !session) {
    return (
      <div className="flex h-screen items-center justify-center bg-transparent p-4">
        <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl text-center max-w-md w-full border border-red-100 dark:border-red-900/30">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            {t("errorOccurred")}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">{error}</p>
          <Link
            href="/"
            className="inline-block w-full py-3 bg-gray-800 text-white rounded-xl font-bold hover:bg-gray-900 transition"
          >
            {t("backHome")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-black/90 pb-20 font-sans">
      {/* 1. YEPYENİ MODERN VE İNCE ÜST MENÜ (HEADER) */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-950/80 backdrop-blur-2xl border-b border-gray-200/60 dark:border-gray-800/60 shadow-sm transition-all">
        <div className="max-w-6xl mx-auto px-4 h-16 md:h-20 flex items-center justify-between gap-2 md:gap-4">
          {/* Sol: Geri Dön Butonu */}
          <button
            onClick={() => router.back()}
            className="group flex items-center gap-2 p-1.5 md:px-3 md:py-2 text-gray-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400 transition-colors rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800/50 shrink-0 outline-none"
          >
            <div className="p-1.5 md:p-2 rounded-lg bg-gray-100 dark:bg-gray-800 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 md:h-5 md:w-5 transform group-hover:-translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </div>
            <span className="font-bold text-sm hidden sm:block tracking-wide">
              {t("back") || "Geri"}
            </span>
          </button>

          {/* Orta: Ufak Canlı İzleme Rozeti */}
          <div className="flex-1 flex justify-center min-w-0">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-900 rounded-full border border-gray-200/50 dark:border-gray-800 shadow-inner truncate max-w-full">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[9px] md:text-xs font-black uppercase tracking-[0.2em] text-gray-600 dark:text-gray-300 truncate">
                {t("monitorTitle") || "Canlı İzleme"}
              </span>
            </div>
          </div>

          {/* Sağ: Aksiyon Butonları */}
          <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
            <button
              onClick={() => fetchData(code)}
              disabled={loading}
              title={t("refresh")}
              className="group flex items-center justify-center w-10 h-10 md:w-auto md:h-10 md:px-4 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-xs hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:border-emerald-800 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 md:h-4 md:w-4 text-gray-400 group-hover:text-emerald-500 transition-all ${loading ? "animate-spin text-emerald-500" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span className="hidden md:inline ml-2">
                {t("refresh") || "Yenile"}
              </span>
            </button>

            {session && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                title={t("addResource")}
                className="flex items-center justify-center w-10 h-10 md:w-auto md:h-10 md:px-4 bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-500 rounded-xl font-bold text-xs transition-all shadow-md shadow-blue-500/20 active:scale-95"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 md:h-4 md:w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span className="hidden md:inline ml-1.5">
                  {t("addResource") || "Kaynak Ekle"}
                </span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-6 md:mt-10">
        {/* 2. ANA BAŞLIK BÖLÜMÜ (HERO SECTION) */}
        {session && (
          <div className="mb-8 md:mb-12 text-center flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Tarih Rozeti */}
            {session.createdAt && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/50 shadow-sm mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-[10px] md:text-xs font-bold text-gray-600 dark:text-gray-300">
                  {new Date(session.createdAt).toLocaleDateString(
                    language === "tr" ? "tr-TR" : "en-US",
                    { year: "numeric", month: "long", day: "numeric" },
                  )}
                </span>
              </div>
            )}

            {/* Büyük Renkli Halka Adı */}
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-blue-600 dark:from-emerald-400 dark:via-teal-400 dark:to-blue-400 leading-tight drop-shadow-sm max-w-4xl px-4 py-1">
              {session.description}
            </h2>

            {/* Zarif Alt Çizgi Detayı */}
            <div className="w-16 h-1.5 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full mt-5 opacity-80"></div>
          </div>
        )}

        {/* İstatistik Kartları Buradan İtibaren Başlıyor */}
        {session && <MonitorStats stats={stats} t={t} />}
        {session && (
          <ResourceAccordion
            categorizedGroups={categorizedGroups}
            expandedResources={expandedResources}
            toggleResource={toggleResource}
            t={t}
          />
        )}
      </main>

      <AddResourceModal
        t={t}
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        allResources={allResources}
        selectedResourceId={selectedResourceId}
        setSelectedResourceId={setSelectedResourceId}
        targetCount={targetCount}
        setTargetCount={setTargetCount}
        handleAddResource={handleAddResource}
        addingResource={addingResource}
        getResourceName={getResourceName}
      />
    </div>
  );
}

export default function MonitorPage() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-transparent">
      <Suspense fallback={<AdminLoading />}>
        <MonitorContent />
      </Suspense>
    </div>
  );
}
