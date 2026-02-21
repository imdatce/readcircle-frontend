/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { use, useState, useMemo, useCallback, useEffect } from "react";
import Link from "next/link";
import { Assignment } from "@/types";
import { useLanguage } from "@/context/LanguageContext";
import Zikirmatik from "@/components/common/Zikirmatik";
import ReadingModal from "@/components/modals/ReadingModal";
import { useDistributionSession } from "@/hooks/useDistributionSession";
import QRCode from "react-qr-code";
// --- CATEGORY DEFINITIONS ---
const CATEGORY_ORDER = [
  "MAIN",
  "SURAHS",
  "PRAYERS",
  "SALAWATS",
  "NAMES",
  "DHIKRS",
] as const;

const CATEGORY_MAPPING: Record<string, (typeof CATEGORY_ORDER)[number]> = {
  QURAN: "MAIN",
  FETIH: "SURAHS",
  YASIN: "SURAHS",
  WAQIA: "SURAHS",
  FATIHA: "SURAHS",
  IHLAS: "SURAHS",
  FELAK: "SURAHS",
  NAS: "SURAHS",

  CEVSEN: "PRAYERS",
  TEVHIDNAME: "PRAYERS",
  OZELSALAVAT: "SALAWATS",
  TEFRICIYE: "SALAWATS",
  MUNCIYE: "SALAWATS",
  BEDIR: "NAMES",
  UHUD: "NAMES",
  YALATIF: "DHIKRS",
  YAHAFIZ: "DHIKRS",
  YAFETTAH: "DHIKRS",
  HASBUNALLAH: "DHIKRS",
  LAHAVLE: "DHIKRS",
};

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

  // --- NAME PROMPT MODAL STATE ---
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [pendingPartId, setPendingPartId] = useState<number | null>(null);

  const isGuestUser =
    !userName ||
    userName.toLowerCase().startsWith("guest") ||
    userName.startsWith("GUguest");

  const [tempName, setTempName] = useState("");

  // Handle Part Selection Click
  const handlePartClick = (partId: number) => {
    if (isGuestUser) {
      setPendingPartId(partId);

      // We reset it here instead of inside a useEffect.
      // If it's a guest, the input will come up empty; otherwise (rarely happens), it will write the existing name.
      setTempName("");

      setIsNameModalOpen(true);
    } else {
      actions.handleTakePart(partId);
    }
  };

  // --- CRITICAL FIX HERE ---
  const handleNameModalSubmit = async () => {
    if (!tempName.trim()) return;

    const finalName = tempName.trim();

    // 1. Update LocalStorage (For persistence)
    localStorage.setItem("guestUserName", finalName);

    // 2. Update State (So UI updates instantly)
    setUserName(finalName);

    // 3. MANUALLY send the new name to the API (Don't wait for State!)
    if (pendingPartId !== null) {
      // ATTENTION: your actions.handleTakePart function must accept the name as the 2nd parameter!
      // (See: Step 1)
      await actions.handleTakePart(pendingPartId, finalName);
    }

    setIsNameModalOpen(false);
    setPendingPartId(null);
  };

  const getCategoryTitle = useCallback(
    (catKey: string) => {
      const keys: Record<string, string> = {
        MAIN: "catMain",
        SURAHS: "catSurahs",
        PRAYERS: "catPrayers",
        SALAWATS: "catSalawats",
        NAMES: "catNames",
        DHIKRS: "catDhikrs",
      };
      return t(keys[catKey] || catKey);
    },
    [t],
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

    // --- GROUPING AND SORTING LOGIC REMAINS THE SAME HERE ---
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

      if (!rawGroups[rName])
        rawGroups[rName] = { assignments: {}, codeKey, resourceName: rName };
      if (!rawGroups[rName].assignments[a.participantNumber])
        rawGroups[rName].assignments[a.participantNumber] = [];
      rawGroups[rName].assignments[a.participantNumber].push(a);
    });

    const categories: Record<string, GroupData[]> = {};
    CATEGORY_ORDER.forEach((cat) => (categories[cat] = []));

    Object.values(rawGroups).forEach((group) => {
      const upperCode = group.codeKey.toUpperCase();
      const category = CATEGORY_MAPPING[upperCode] || "DHIKRS";
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
  }, [session, language, t, getCategoryTitle]);

  if (loading) return <LoadingScreen t={t} />;

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
        <div className="text-center mb-8 md:mb-10">
          <h1 className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white mb-2 leading-tight">
            {t("circle")}: {session.description || t("joinTitle")}
          </h1>
          {isGuestUser && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {t("guestMessage") || "Please select the part you want to take."}
            </p>
          )}
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
                            {Object.keys(group.assignments).length} {t("part")}
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
                                userName={userName} // Context's (newly updated) name
                                actions={actions}
                                t={t}
                                isOwner={isOwner}
                                deviceId={deviceId}
                                onTakeClick={handlePartClick}
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
      </main>

      {/* --- NAME PROMPT MODAL --- */}
      {isNameModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-6 md:p-8 w-full max-w-sm shadow-2xl border border-gray-100 dark:border-gray-800 animate-in zoom-in-95 duration-200">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-600 dark:text-blue-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-7 h-7"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">
                {t("joinTitle") || "What is your name?"}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("joinIntro") || "Please enter your name to take the part."}
              </p>
            </div>
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              placeholder={t("yourNamePlaceholder") || "Full Name"}
              className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-xl text-lg font-bold text-center outline-none focus:border-blue-500 transition-all dark:text-white mb-4"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleNameModalSubmit()}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setIsNameModalOpen(false)}
                className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleNameModalSubmit}
                disabled={!tempName.trim()}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:shadow-none"
              >
                {t("continue")}
              </button>
            </div>
          </div>
        </div>
      )}

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
  onTakeClick,
}: any) {
  const first = assignments[0];
  const isTaken = first.isTaken;

  // --- CHECK OPTIMIZATION ---
  const isAssignedToMe = first.deviceId === deviceId;

  // Clean up spaces and convert to lowercase to compare
  const assignedName = first.assignedToName
    ? first.assignedToName.trim().toLowerCase()
    : "";
  const currentName = userName ? userName.trim().toLowerCase() : "";

  const isAssignedToUserName = currentName && assignedName === currentName;
  const isMyAssignment = isAssignedToMe || isAssignedToUserName;
  // ------------------------------

  const canSeeDetails = isOwner || isMyAssignment;
  const isCompleted = first.isCompleted;

  const getTypeName = (resource: any) => {
    const rawType = resource.type;
    return (
      typeof rawType === "string" ? rawType : rawType?.name
    )?.toUpperCase();
  };

  // --- CARD STYLES (MADE MORE VISIBLE) ---
  let cardStyle =
    "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md transition-all"; // Idle (Not selected yet)

  if (isCompleted && isMyAssignment) {
    // Completed (Green and prominent border)
    cardStyle =
      "bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-400 dark:border-emerald-600 shadow-md opacity-90";
  } else if (isMyAssignment) {
    // Selected but not finished (Blue, glowing, stands out)
    cardStyle =
      "bg-blue-50/50 dark:bg-blue-900/20 border-2 border-blue-500 ring-4 ring-blue-500/20 shadow-xl scale-[1.02] z-10";
  } else if (isTaken) {
    // Taken by someone else (Gray, pale)
    cardStyle =
      "bg-gray-50/80 dark:bg-gray-800/80 border-gray-100 dark:border-gray-700 opacity-50 grayscale-[0.5] pointer-events-none"; // Prevent clicking on someone else's with pointer-events-none
  }

  let displayName = "";
  let statusText = t("statusEmpty");

  if (isTaken) {
    if (canSeeDetails) {
      if (isMyAssignment) {
        statusText = t("yourTask");
        displayName = "";
      } else {
        statusText = t("taken");
        displayName = first.assignedToName;
      }
    } else {
      statusText = t("taken");
      displayName = "";
    }
  }

  return (
    <div
      className={`p-4 md:p-6 rounded-[1.8rem] md:rounded-[2.5rem] transition-all duration-300 relative flex flex-col ${cardStyle}`}
    >
      <div className="flex justify-between items-start mb-4 md:mb-6">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1.5 md:mb-2">
            <span
              className={`text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] ${
                isCompleted
                  ? "text-emerald-600 dark:text-emerald-400"
                  : isMyAssignment
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {t("part")} {participantNumber}
            </span>
            {isMyAssignment && !isCompleted && (
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></span>
            )}
            {isCompleted && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            )}
          </div>
          <div className="flex flex-wrap gap-1 md:gap-1.5">
            {assignments.map((a: any, idx: number) => {
              const typeName = getTypeName(a.resource);
              const isPaged = typeName === "PAGED";
              const count = a.endUnit - a.startUnit + 1;

              const isQuran =
                a.resource?.codeKey?.toUpperCase().includes("QURAN") ||
                a.resource?.codeKey?.toUpperCase().includes("KURAN");
              const displayStart =
                isQuran && a.startUnit > 1 ? a.startUnit - 1 : a.startUnit;
              const displayEnd =
                isQuran && a.endUnit > 1 ? a.endUnit - 1 : a.endUnit;
              const juzNumber = isQuran ? Math.ceil(displayStart / 20) : 0;

              return (
                <span
                  key={idx}
                  className={`text-[9px] md:text-[10px] font-black px-2 py-0.5 rounded-md border shadow-inner ${
                    isCompleted
                      ? "bg-emerald-100/50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700"
                      : isMyAssignment
                        ? "bg-blue-100/50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200/50 dark:border-gray-700/50"
                  }`}
                >
                  {isPaged
                    ? isQuran
                      ? `${t("juz")} ${juzNumber} | ${t("page")}: ${displayStart}-${displayEnd}`
                      : `${t("page")}: ${displayStart}-${displayEnd}`
                    : `${count} ${t("pieces")}`}
                </span>
              );
            })}
          </div>
        </div>
        <div className="shrink-0 ml-2">
          {isCompleted ? (
            <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-md transform scale-110">
              <svg
                className="w-5 h-5 md:w-6 md:h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={4}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          ) : isTaken ? (
            <div
              className={`px-2.5 py-1 md:px-4 md:py-1.5 rounded-xl border-2 flex flex-col items-center leading-tight transition-all ${
                isMyAssignment
                  ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30"
                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400"
              }`}
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
            <span className="bg-gray-50 dark:bg-gray-800 text-gray-400 text-[8px] md:text-[9px] font-black px-3 py-1.5 md:px-4 md:py-2 rounded-full uppercase tracking-widest border border-gray-200 dark:border-gray-700 shadow-inner">
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
            <div
              className={`scale-100 md:scale-125 transform transition-all duration-500 mb-6 md:mb-8 mt-2 md:mt-4 ${
                isCompleted
                  ? "opacity-70 pointer-events-none"
                  : "hover:scale-105 md:hover:scale-130"
              }`}
            >
              <Zikirmatik
                currentCount={
                  localCounts[first.id] ?? first.endUnit - first.startUnit + 1
                }
                onDecrement={() => actions.decrementCount(first.id)}
                t={t}
                readOnly={!isMyAssignment || isCompleted}
              />
            </div>
          )}
        {isMyAssignment && !isCompleted && (
          <div className="w-full space-y-2 md:space-y-2.5 mt-2 animate-in fade-in slide-in-from-top-4 duration-500">
            {assignments.map((a: any, idx: number) => {
              const isQuran =
                a.resource?.codeKey?.toUpperCase().includes("QURAN") ||
                a.resource?.codeKey?.toUpperCase().includes("KURAN");
              const displayStart =
                isQuran && a.startUnit > 1 ? a.startUnit - 1 : a.startUnit;
              const displayEnd =
                isQuran && a.endUnit > 1 ? a.endUnit - 1 : a.endUnit;
              const juzNumber = isQuran ? Math.ceil(displayStart / 20) : 0;

              return (
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
                      ? isQuran
                        ? `(${t("juz")} ${juzNumber}, ${displayStart}-${displayEnd})`
                        : `(${displayStart}-${displayEnd})`
                      : ""}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div
        className={`mt-4 md:mt-8 pt-4 md:pt-6 border-t-2 border-dashed ${
          isCompleted
            ? "border-emerald-200 dark:border-emerald-800"
            : isMyAssignment
              ? "border-blue-200 dark:border-blue-800"
              : "border-gray-100 dark:border-gray-800"
        }`}
      >
        {!isTaken ? (
          <button
            onClick={() => onTakeClick(first.id)}
            className="w-full py-3.5 md:py-4 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-2 border-dashed border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 rounded-xl md:rounded-2xl font-black text-xs md:text-sm hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-all active:scale-95 shadow-sm"
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
                  className="w-full py-3.5 md:py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl md:rounded-[1.2rem] font-black text-xs md:text-xs uppercase tracking-[0.15em] md:tracking-[0.2em] shadow-xl shadow-emerald-500/40 active:scale-95 transition-all flex items-center justify-center gap-2 md:gap-3 border-b-2 md:border-b-4 border-emerald-700"
                >
                  <svg
                    className="w-4 h-4 md:w-5 md:h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={4}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
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
                className={`w-full py-3 md:py-3.5 rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-widest transition-all active:scale-95 border-2 ${
                  isCompleted
                    ? "bg-white dark:bg-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 border-gray-200 dark:border-gray-700"
                    : "bg-red-50 hover:bg-red-100 dark:bg-red-900/10 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50"
                }`}
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
              {t("serverWakingUpPart1") ||
                "Waking up server. This process might take "}
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                30-40 {t("seconds") || "seconds"}
              </span>{" "}
              {t("serverWakingUpPart2") ||
                "please wait without closing the tab."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
