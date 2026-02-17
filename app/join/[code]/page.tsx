/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { use, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { Assignment } from "@/types";
import { useLanguage } from "@/context/LanguageContext";
import Zikirmatik from "@/components/common/Zikirmatik";
import ReadingModal from "@/components/modals/ReadingModal";
import { useDistributionSession } from "@/hooks/useDistributionSession";

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

export default function JoinPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { t, language } = useLanguage();
  const { code } = use(params);

  const {
    session,
    loading,
    error,
    localCounts,
    userName,
    setUserName,
    readingModalContent,
    setReadingModalContent,
    actions,
    deviceId,
  } = useDistributionSession(code);

  const isOwner = session?.ownerDeviceId === deviceId;

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {},
  );
  const [tempName, setTempName] = useState(userName || "");

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

  const stats = useMemo(() => {
    if (!session?.assignments?.length)
      return {
        total: 0,
        distributed: 0,
        completed: 0,
        distPercent: 0,
        compPercent: 0,
      };
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

  const categorizedGroups = useMemo(() => {
    if (!session) return [];

    type GroupData = {
      assignments: Record<number, Assignment[]>;
      codeKey: string;
      resourceName: string;
    };

    const rawGroups: Record<string, GroupData> = {};

    session.assignments.forEach((a) => {
      const translation =
        a.resource?.translations?.find((tr) => tr.langCode === language) ||
        a.resource?.translations?.find((tr) => tr.langCode === "tr") ||
        a.resource?.translations?.[0];

      const rName =
        translation?.name || a.resource?.codeKey || t("otherResource");
      const codeKey = a.resource?.codeKey || "";

      if (!rawGroups[rName]) {
        rawGroups[rName] = {
          assignments: {},
          codeKey: codeKey,
          resourceName: rName,
        };
      }

      if (!rawGroups[rName].assignments[a.participantNumber]) {
        rawGroups[rName].assignments[a.participantNumber] = [];
      }
      rawGroups[rName].assignments[a.participantNumber].push(a);
    });

    const categories: Record<string, GroupData[]> = {};
    CATEGORY_ORDER.forEach((cat) => (categories[cat] = []));

    Object.values(rawGroups).forEach((group) => {
      const upperCode = group.codeKey.toUpperCase();
      const category = CATEGORY_MAPPING[upperCode] || "DHIKRS";

      if (categories[category]) {
        categories[category].push(group);
      } else {
        categories["DHIKRS"].push(group);
      }
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

      return {
        key: catKey,
        title: getCategoryTitle(catKey),
        items: items,
      };
    }).filter(Boolean);
  }, [session, language, t, getCategoryTitle]);

  const handleNameSubmit = () => {
    if (tempName.trim()) {
      setUserName(tempName.trim());
      localStorage.setItem("guestUserName", tempName.trim());
    }
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-transparent px-4 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium animate-pulse text-sm md:text-base">
            {t("loading")}
          </p>
        </div>
      </div>
    );

  if (error || !session)
    return (
      <div className="flex h-screen items-center justify-center p-6 text-center">
        <div className="bg-white dark:bg-gray-900 p-6 md:p-8 rounded-3xl shadow-xl border border-red-100 dark:border-red-900/30 max-w-md w-full">
          <h2 className="text-lg md:text-xl font-bold text-gray-800 dark:text-white mb-4">
            {t("errorOccurred")}
          </h2>
          <Link
            href="/"
            className="inline-block px-8 py-3 bg-gray-800 text-white rounded-xl font-bold text-sm md:text-base"
          >
            {t("backHome")}
          </Link>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-transparent pb-10">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-100 dark:border-gray-800 h-14 md:h-16 flex items-center px-4">
        <div className="max-w-4xl mx-auto w-full flex justify-between items-center">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-gray-500 hover:text-emerald-600 transition-colors font-bold text-xs md:text-sm"
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
          <div className="flex items-center gap-2">
            <span className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {t("sessionCode")}:
            </span>
            <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 md:px-3 md:py-1 rounded-lg text-[10px] md:text-xs font-black text-gray-700 dark:text-gray-300">
              #{session.code}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 mt-6 md:mt-10">
        {!userName ? (
          <div className="max-w-md mx-auto bg-white dark:bg-gray-900 rounded-[2rem] p-6 md:p-12 shadow-2xl border border-emerald-50 dark:border-emerald-900/20 text-center animate-in zoom-in-95 duration-500">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto mb-6 md:mb-8 shadow-inner">
              <span className="text-3xl md:text-4xl animate-bounce">👋</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black mb-3 md:mb-4 dark:text-white leading-tight">
              {session.description || t("joinTitle")}
            </h2>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-6 md:mb-8 font-medium">
              {t("joinIntro")}
            </p>
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              placeholder={t("yourNamePlaceholder")}
              className="w-full px-4 py-4 md:px-6 md:py-5 bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl text-base md:text-lg font-bold text-center mb-4 outline-none focus:border-emerald-500 transition-all dark:text-white"
              onKeyDown={(e) => e.key === "Enter" && handleNameSubmit()}
            />
            <button
              onClick={handleNameSubmit}
              disabled={!tempName.trim()}
              className="w-full py-3.5 md:py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-black text-base md:text-lg shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-all"
            >
              {t("continue")}
            </button>
          </div>
        ) : (
          <>
            <div className="text-center mb-8 md:mb-10">
              <h1 className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white mb-2 leading-tight">
                {t("circle")}: {session.description || t("joinTitle")}
              </h1>
            </div>

            <div className="grid grid-cols-3 gap-2 md:gap-6 mb-8 md:mb-10">
              <StatCard label={t("total")} value={stats.total} />
              <StatCard
                label={t("distributed")}
                value={stats.distributed}
                percent={stats.distPercent}
                color="blue"
              />
              <StatCard
                label={t("completed")}
                value={stats.completed}
                percent={stats.compPercent}
                color="emerald"
              />
            </div>

            <div className="space-y-8 md:space-y-10 pb-20">
              {categorizedGroups.map((category: any) => (
                <div
                  key={category.key}
                  className="animate-in fade-in slide-in-from-bottom-4 duration-700"
                >
                  <div className="flex items-center gap-4 mb-4 md:mb-5 px-1">
                    <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent flex-1 opacity-50"></div>
                    <h2 className="text-sm md:text-base font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] md:tracking-[0.3em] text-center whitespace-nowrap">
                      {category.title}
                    </h2>
                    <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent flex-1 opacity-50"></div>
                  </div>

                  <div className="space-y-4 md:space-y-6">
                    {category.items.map((group: any) => (
                      <div
                        key={group.resourceName}
                        className="bg-white dark:bg-gray-900 rounded-[1.5rem] md:rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md"
                      >
                        <button
                          onClick={() =>
                            setExpandedGroups((p) => ({
                              ...p,
                              [group.resourceName]: !p[group.resourceName],
                            }))
                          }
                          className="w-full flex items-center justify-between p-4 md:p-6 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-all"
                        >
                          <div className="flex items-center gap-3 md:gap-4 text-left min-w-0">
                            <div
                              className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl shrink-0 flex items-center justify-center shadow-inner transition-colors ${expandedGroups[group.resourceName] ? "bg-emerald-500 text-white" : "bg-blue-50 dark:bg-blue-900/20 text-blue-600"}`}
                            >
                              <svg
                                className="w-5 h-5 md:w-6 md:h-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13"
                                />
                              </svg>
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-sm md:text-lg font-black text-gray-800 dark:text-gray-100 leading-tight truncate">
                                {group.resourceName}
                              </h3>
                              <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                                {Object.keys(group.assignments).length}{" "}
                                {t("part")}
                              </p>
                            </div>
                          </div>
                          <div
                            className={`w-8 h-8 md:w-10 md:h-10 shrink-0 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center transition-transform duration-300 ${expandedGroups[group.resourceName] ? "rotate-180" : ""}`}
                          >
                            <svg
                              className="w-4 h-4 md:w-5 md:h-5 text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={3}
                            >
                              <path d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </button>

                        {expandedGroups[group.resourceName] && (
                          <div className="p-3 md:p-6 bg-gray-50/50 dark:bg-black/10 border-t border-gray-50 dark:border-gray-800 animate-in slide-in-from-top-2 duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                              {Object.entries(group.assignments)
                                .sort(([pA], [pB]) => Number(pA) - Number(pB))
                                .map(([pNum, subAssignments]) => (
                                  <AssignmentCard
                                    key={pNum}
                                    participantNumber={Number(pNum)}
                                    assignments={subAssignments}
                                    localCounts={localCounts}
                                    userName={userName}
                                    actions={actions}
                                    t={t}
                                    isOwner={isOwner}
                                    deviceId={deviceId}
                                  />
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {readingModalContent && (
        <ReadingModal
          content={readingModalContent}
          onClose={() => setReadingModalContent(null)}
          onUpdateContent={setReadingModalContent}
          session={session}
          userName={userName}
          localCounts={localCounts}
          onDecrementCount={actions.decrementCount}
          t={t}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, percent, color = "gray" }: any) {
  const colorClasses: any = {
    blue: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 border-blue-100 dark:border-blue-900/30",
    emerald:
      "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30",
    gray: "text-gray-800 bg-white dark:bg-gray-900 dark:text-white border-gray-100 dark:border-gray-800",
  };
  return (
    <div
      className={`p-3 md:p-5 rounded-2xl md:rounded-3xl border shadow-sm text-center ${colorClasses[color] || colorClasses.gray}`}
    >
      <p className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] mb-1 md:mb-1.5 opacity-60 truncate">
        {label}
      </p>
      <div className="flex flex-col items-center leading-none">
        <span className="text-xl md:text-3xl font-black">{value}</span>
        {percent !== undefined && (
          <span className="text-[8px] md:text-[10px] font-bold mt-1 md:mt-1.5 opacity-80 bg-white/50 dark:bg-black/20 px-1.5 py-0.5 rounded-full">
            %{percent}
          </span>
        )}
      </div>
    </div>
  );
}

function AssignmentCard({
  participantNumber,
  assignments,
  localCounts,
  userName,
  actions,
  t,
  isOwner,
  deviceId,
}: any) {
  const first = assignments[0];
  const isTaken = first.isTaken;

  const isAssignedToMe = first.deviceId === deviceId;
  const isAssignedToUserName = userName && first.assignedToName === userName;
  const isMyAssignment = isAssignedToMe || isAssignedToUserName;
  const canSeeDetails = isOwner || isMyAssignment;
  const isCompleted = first.isCompleted;

  const getTypeName = (resource: any) => {
    const rawType = resource.type;
    return (
      typeof rawType === "string" ? rawType : rawType?.name
    )?.toUpperCase();
  };

  let cardStyle =
    "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-sm";

  if (isCompleted && isMyAssignment) {
    cardStyle =
      "bg-emerald-50/30 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800 shadow-sm";
  } else if (isMyAssignment) {
    cardStyle =
      "bg-white dark:bg-gray-900 border-blue-500 ring-4 ring-blue-500/5 shadow-xl scale-[1.01] z-10";
  } else if (isTaken) {
    cardStyle =
      "bg-gray-50/80 dark:bg-gray-900/80 border-gray-100 dark:border-gray-800 opacity-60 grayscale-[0.5]";
  }

  // --- İSİM ve DURUM METNİ ---
  let displayName = "";
  let statusText = t("statusEmpty");

  if (isTaken) {
    if (canSeeDetails) {
      if (isMyAssignment) {
        statusText = t("yourTask");
        displayName = "";
      } else {
        // GÜNCELLEME: "Alındı" -> t("taken")
        statusText = t("taken");
        displayName = first.assignedToName;
      }
    } else {
      // GÜNCELLEME: "Alındı" -> t("taken")
      statusText = t("taken");
      displayName = "";
    }
  }

  return (
    <div
      className={`p-4 md:p-6 rounded-[1.8rem] md:rounded-[2.5rem] border transition-all duration-500 relative flex flex-col ${cardStyle}`}
    >
      <div className="flex justify-between items-start mb-4 md:mb-6">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1.5 md:mb-2">
            <span className="text-[9px] md:text-[10px] font-black text-blue-500 dark:text-blue-400 uppercase tracking-[0.15em]">
              {t("part")} {participantNumber}
            </span>
            {isMyAssignment && !isCompleted && (
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></span>
            )}
          </div>

          <div className="flex flex-wrap gap-1 md:gap-1.5">
            {assignments.map((a: any, idx: number) => {
              const typeName = getTypeName(a.resource);
              const isPaged = typeName === "PAGED";
              const count = a.endUnit - a.startUnit + 1;

              return (
                <span
                  key={idx}
                  className="text-[9px] md:text-[10px] font-black text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md border border-gray-200/50 dark:border-gray-700/50 shadow-inner"
                >
                  {
                    isPaged
                      ? `${t("page")}: ${a.startUnit}-${a.endUnit}`
                      : `${count} ${t("pieces")}` // GÜNCELLEME: Fallback "Adet" kaldırıldı
                  }
                </span>
              );
            })}
          </div>
        </div>

        <div className="shrink-0 ml-2">
          {isCompleted ? (
            <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-200 dark:border-emerald-800 shadow-sm">
              <svg
                className="w-5 h-5 md:w-6 md:h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
          ) : isTaken ? (
            <div
              className={`px-2.5 py-1 md:px-4 md:py-1.5 rounded-xl border-2 flex flex-col items-center leading-tight transition-all ${isMyAssignment ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20" : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-400"}`}
            >
              <span className="text-[6px] md:text-[7px] font-black uppercase tracking-[0.1em] mb-0.5">
                {statusText}
              </span>
              {displayName && (
                <span className="text-[8px] md:text-[10px] font-black truncate max-w-[50px] md:max-w-[70px]">
                  {displayName}
                </span>
              )}
            </div>
          ) : (
            <span className="bg-gray-50 dark:bg-gray-800 text-gray-400 text-[8px] md:text-[9px] font-black px-3 py-1.5 md:px-4 md:py-2 rounded-full uppercase tracking-widest border border-gray-100 dark:border-gray-700 shadow-inner">
              {t("statusEmpty")}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center justify-center py-2 md:py-4 flex-1">
        {isTaken &&
          canSeeDetails &&
          (getTypeName(first.resource) === "COUNTABLE" ||
            getTypeName(first.resource) === "JOINT") && (
            <div className="scale-100 md:scale-125 transform transition-all duration-500 mb-6 md:mb-8 mt-2 md:mt-4 hover:scale-105 md:hover:scale-130">
              <Zikirmatik
                currentCount={
                  localCounts[first.id] ?? first.endUnit - first.startUnit + 1
                }
                onDecrement={() => actions.decrementCount(first.id)}
                t={t}
                readOnly={!isMyAssignment}
              />
            </div>
          )}

        {isMyAssignment && !isCompleted && (
          <div className="w-full space-y-2 md:space-y-2.5 mt-2 animate-in fade-in slide-in-from-top-4 duration-500">
            {assignments.map((a: any, idx: number) => (
              <button
                key={idx}
                onClick={() =>
                  actions.openReadingModal(a, a.startUnit, a.endUnit)
                }
                className="w-full py-3 md:py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl md:rounded-[1.2rem] font-black text-[10px] md:text-xs uppercase tracking-[0.1em] md:tracking-[0.15em] shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 md:gap-3 border-b-2 md:border-b-4 border-blue-800"
              >
                <svg
                  className="w-4 h-4 md:w-5 md:h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span>
                  {t("readText")}{" "}
                  {assignments.length > 1
                    ? `(${a.startUnit}-${a.endUnit})`
                    : ""}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 md:mt-8 pt-4 md:pt-6 border-t-2 border-dashed border-gray-50 dark:border-gray-800">
        {!isTaken ? (
          <button
            onClick={() => actions.handleTakePart(first.id)}
            className="w-full py-3.5 md:py-4 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-2 border-dashed border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 rounded-xl md:rounded-2xl font-black text-xs md:text-sm hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all active:scale-95 shadow-sm"
          >
            {t("select")}
          </button>
        ) : (
          isMyAssignment && (
            <div className="flex flex-col gap-2 md:gap-3">
              {!isCompleted && (
                <button
                  onClick={() => {
                    actions.handleCompletePart(first.id);
                    const typeName = getTypeName(first.resource);
                    if (
                      (typeName === "COUNTABLE" || typeName === "JOINT") &&
                      actions.updateLocalCount
                    ) {
                      actions.updateLocalCount(first.id, 0);
                    }
                  }}
                  className="w-full py-3.5 md:py-4 bg-emerald-600 text-white rounded-xl md:rounded-[1.2rem] font-black text-xs md:text-xs uppercase tracking-[0.15em] md:tracking-[0.2em] shadow-2xl shadow-emerald-500/30 active:scale-95 transition-all flex items-center justify-center gap-2 md:gap-3 border-b-2 md:border-b-4 border-emerald-800"
                >
                  <svg
                    className="w-4 h-4 md:w-5 md:h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={4}
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  {t("finish")}
                </button>
              )}

              <button
                onClick={() => {
                  actions.handleCancelPart(first.id);
                  const typeName = getTypeName(first.resource);
                  if (
                    (typeName === "COUNTABLE" || typeName === "JOINT") &&
                    actions.updateLocalCount
                  ) {
                    const initial = first.endUnit - first.startUnit + 1;
                    actions.updateLocalCount(first.id, initial);
                  }
                }}
                className={`w-full py-3 md:py-3.5 rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-widest transition-all active:scale-95 border-2 ${isCompleted ? "bg-white dark:bg-gray-800 text-gray-400 border-gray-100 dark:border-gray-700" : "bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/30"}`}
              >
                {isCompleted ? t("undo") : t("giveUp")}
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
