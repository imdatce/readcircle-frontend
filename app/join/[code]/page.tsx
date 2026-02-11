/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { use, useState, useMemo } from "react";
import Link from "next/link";
import { Assignment } from "@/types";
import { useLanguage } from "@/context/LanguageContext";
import Zikirmatik from "@/components/common/Zikirmatik";
import ReadingModal from "@/components/modals/ReadingModal";
import { useDistributionSession } from "@/hooks/useDistributionSession";

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
  } = useDistributionSession(code);

  const [activeTab, setActiveTab] = useState<"distributed" | "individual">(
    "distributed",
  );
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {},
  );

  const [tempName, setTempName] = useState(userName || "");

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

  const getSplitGroups = () => {
    if (!session) return { distributed: {}, individual: {} };

    const distributed: Record<string, Assignment[]> = {};
    const individual: Record<string, Assignment[]> = {};

    session.assignments.forEach((assignment) => {
      let translation = assignment.resource?.translations?.find(
        (t) => t.langCode === language,
      );
      if (!translation) {
        translation =
          assignment.resource?.translations?.find((t) => t.langCode === "tr") ||
          assignment.resource?.translations?.[0];
      }
      const resourceName =
        translation?.name || assignment.resource?.codeKey || t("otherResource");
      const type = assignment.resource.type;

      if (type === "JOINT") {
        if (!individual[resourceName]) individual[resourceName] = [];
        individual[resourceName].push(assignment);
      } else {
        if (!distributed[resourceName]) distributed[resourceName] = [];
        distributed[resourceName].push(assignment);
      }
    });

    return { distributed, individual };
  };

  const { distributed, individual } = getSplitGroups();
  const hasDistributed = Object.keys(distributed).length > 0;
  const hasIndividual = Object.keys(individual).length > 0;

  if (!hasDistributed && hasIndividual && activeTab === "distributed") {
    setActiveTab("individual");
  }

  const handleNameSubmit = () => {
    if (tempName.trim()) {
      setUserName(tempName.trim());
      localStorage.setItem("guestUserName", tempName.trim());
    }
  };

  const toggleGroup = (groupName: string) => {
    setExpandedGroups((prev) => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-transparent">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium animate-pulse">
            {t("loading")}
          </p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex h-screen items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl text-center max-w-md w-full border border-red-100">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            {t("errorOccurred")}
          </h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <Link
            href="/"
            className="inline-block w-full py-3 bg-gray-800 text-white rounded-xl font-bold"
          >
            {t("backHome")}
          </Link>
        </div>
      </div>
    );

  if (!session) return null;

  return (
    <div className="min-h-screen bg-transparent pb-20">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 shadow-sm transition-all">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 dark:text-gray-300 transition-colors group"
          >
            <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 group-hover:bg-emerald-50 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </div>
            <span className="font-bold text-sm hidden sm:inline">
              {t("backHome")}
            </span>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 mt-6 md:mt-10">
        {!userName ? (
          <div className="max-w-md mx-auto bg-white dark:bg-gray-900 rounded-[2rem] p-8 shadow-xl border border-emerald-100 dark:border-emerald-900/30 text-center">
            <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">👋</span>
            </div>
            <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-2">
              {t("joinTitle")}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
              {t("joinIntro")}
            </p>
            <div className="space-y-4">
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                placeholder={t("yourName")}
                className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-emerald-500 rounded-2xl text-lg font-bold text-center outline-none transition-all text-gray-800 dark:text-white"
                onKeyDown={(e) => e.key === "Enter" && handleNameSubmit()}
              />
              <button
                onClick={handleNameSubmit}
                disabled={!tempName.trim()}
                className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50"
              >
                {t("continue")}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3 mb-8">
              <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm text-center">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                  {t("total")}
                </p>
                <p className="text-2xl font-black text-gray-800 dark:text-white">
                  {stats.total}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30 shadow-sm text-center">
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">
                  {t("distributed")}
                </p>
                <p className="text-2xl font-black text-blue-600 dark:text-blue-400">
                  {stats.distributed}
                  <span className="text-xs ml-1 opacity-60">
                    %{stats.distPercent}
                  </span>
                </p>
              </div>
              <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 shadow-sm text-center">
                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">
                  {t("completed")}
                </p>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {stats.completed}
                  <span className="text-xs ml-1 opacity-60">
                    %{stats.compPercent}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex p-1.5 bg-white dark:bg-gray-900/60 backdrop-blur rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 mb-8 mx-auto max-w-lg">
              {hasDistributed && (
                <button
                  onClick={() => setActiveTab("distributed")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                    activeTab === "distributed"
                      ? "bg-emerald-500 text-white shadow-md"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {t("distributedResources")}
                </button>
              )}
              {hasIndividual && (
                <button
                  onClick={() => setActiveTab("individual")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                    activeTab === "individual"
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {t("individualResources")}
                </button>
              )}
            </div>

            <div className="space-y-6">
              {activeTab === "distributed" && (
                <ResourceGroupList
                  groups={distributed}
                  expandedGroups={expandedGroups}
                  toggleGroup={toggleGroup}
                  localCounts={localCounts}
                  userName={userName}
                  actions={actions}
                  language={language}
                  t={t}
                  themeColor="emerald"
                />
              )}
              {activeTab === "individual" && (
                <ResourceGroupList
                  groups={individual}
                  expandedGroups={expandedGroups}
                  toggleGroup={toggleGroup}
                  localCounts={localCounts}
                  userName={userName}
                  actions={actions}
                  language={language}
                  t={t}
                  themeColor="blue"
                />
              )}
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

function ResourceGroupList({
  groups,
  expandedGroups,
  toggleGroup,
  localCounts,
  userName,
  actions,
  language,
  t,
  themeColor,
}: any) {
  const isEmerald = themeColor === "emerald";
  const activeColorClass = isEmerald ? "text-emerald-600" : "text-blue-600";
  const activeBgClass = isEmerald ? "bg-emerald-100" : "bg-blue-100";
  const darkActiveBgClass = isEmerald
    ? "dark:bg-emerald-900/40"
    : "dark:bg-blue-900/40";

  return Object.entries(groups).map(([resourceName, assignments]: any) => {
    const isOpen = expandedGroups[resourceName] || false;

    const totalCount = assignments.length;
    const takenCount = assignments.filter((a: any) => a.isTaken).length;
    const completedCount = assignments.filter((a: any) => a.isCompleted).length;

    const percentage = Math.round((takenCount / totalCount) * 100);
    const completedPercentage = Math.round((completedCount / totalCount) * 100);

    return (
      <div
        key={resourceName}
        className="bg-white dark:bg-gray-900 rounded-[1.5rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md mb-4"
      >
        <button
          onClick={() => toggleGroup(resourceName)}
          className="w-full flex flex-col md:flex-row items-center justify-between p-5 bg-white hover:bg-gray-50/50 transition duration-200 dark:bg-gray-900 dark:hover:bg-gray-800/50 gap-4"
        >
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div
              className={`h-12 w-12 rounded-2xl flex items-center justify-center shadow-inner transition-colors duration-300 shrink-0 ${
                isOpen
                  ? `${isEmerald ? "bg-emerald-500" : "bg-blue-600"} text-white`
                  : `${activeBgClass} ${activeColorClass} ${darkActiveBgClass} dark:${isEmerald ? "text-emerald-400" : "text-blue-400"}`
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6"
              >
                {isEmerald ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                )}
              </svg>
            </div>

            <div className="text-left">
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 leading-tight">
                {resourceName}
              </h2>
              <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 mt-0.5 uppercase tracking-tight">
                {totalCount} {t("part")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
            <div className="flex flex-col items-end min-w-[180px] flex-1 md:flex-none group relative">
              <div className="flex justify-between w-full items-end mb-1.5 px-1 gap-4">
                <div className="flex flex-col items-start">
                  <span className="text-[9px] font-bold text-blue-400 uppercase tracking-wider leading-none mb-1">
                    {t("distributed")}
                  </span>
                  <span className="text-sm font-black text-blue-600 dark:text-blue-400">
                    %{percentage}
                  </span>
                </div>

                <div className="flex flex-col items-end">
                  <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-wider leading-none mb-1">
                    {t("completed")}
                  </span>
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                    %{completedPercentage}
                  </span>
                </div>
              </div>

              <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden shadow-inner border border-gray-200 dark:border-gray-700 relative">
                <div
                  className="absolute top-0 left-0 h-full bg-blue-100 dark:bg-blue-900/40 transition-all duration-500 ease-out border-r border-blue-200 dark:border-blue-800"
                  style={{ width: `${percentage}%` }}
                />
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all duration-700 ease-out shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                  style={{ width: `${completedPercentage}%` }}
                >
                  <div className="absolute top-0 right-0 bottom-0 w-0.5 bg-white/30"></div>
                </div>
              </div>
            </div>

            <div className="hidden md:block h-8 w-px bg-gray-200 dark:bg-gray-800"></div>

            <div
              className={`w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 dark:bg-gray-800 transform transition-transform duration-300 shrink-0 ${
                isOpen ? "rotate-180 bg-gray-200 dark:bg-gray-700" : "rotate-0"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-4 h-4 text-gray-500 dark:text-gray-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                />
              </svg>
            </div>
          </div>
        </button>

        {isOpen && (
          <div className="p-4 bg-gray-50/50 border-t border-gray-100 animate-in fade-in slide-in-from-top-1 duration-300 dark:bg-black/20 dark:border-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assignments.map((item: any) => (
                <AssignmentCard
                  key={item.id}
                  item={item}
                  localCounts={localCounts}
                  userName={userName}
                  actions={actions}
                  language={language}
                  t={t}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  });
}

function AssignmentCard({
  item,
  localCounts,
  userName,
  actions,
  language,
  t,
}: any) {
  const defaultTotal = item.endUnit - item.startUnit + 1;
  const safeCount = localCounts[item.id] ?? defaultTotal;
  const isAssignedToUser = userName && item.assignedToName === userName;
  const isCompleted = item.isCompleted || false;

  let translation = item.resource.translations?.find(
    (t: any) => t.langCode === language,
  );
  if (!translation)
    translation =
      item.resource.translations?.find((t: any) => t.langCode === "tr") ||
      item.resource.translations?.[0];

  let cardStyle =
    "bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700";
  let glowStyle = "hover:border-blue-300 dark:hover:border-blue-700";

  if (isCompleted) {
    cardStyle =
      "bg-emerald-50/80 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800";
    glowStyle = "";
  } else if (isAssignedToUser) {
    cardStyle =
      "bg-white border-blue-200 ring-2 ring-blue-50 dark:bg-gray-800 dark:border-blue-900 dark:ring-blue-900/20 shadow-lg transform scale-[1.01]";
    glowStyle = "";
  } else if (item.isTaken) {
    cardStyle =
      "bg-gray-50 border-gray-100 opacity-60 grayscale-[0.8] dark:bg-gray-900 dark:border-gray-800";
    glowStyle = "";
  }

  return (
    <div
      className={`relative p-5 rounded-[1.5rem] border transition-all duration-300 shadow-sm ${cardStyle} ${glowStyle}`}
    >
      <div className="flex justify-between items-start mb-6">
        <div>
          <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
            {t("part") || "PARÇA"} {item.participantNumber}
          </span>
          <div className="text-sm font-bold text-gray-800 dark:text-gray-200">
            {item.resource.type === "JOINT"
              ? `${t("target")}:`
              : (item.resource.type === "PAGED" ? t("page") : t("pieces")) +
                ":"}
            {item.resource.type === "JOINT" ? (
              <span className="ml-1 font-black text-blue-600 dark:text-blue-400">
                {item.endUnit}
              </span>
            ) : (
              <span className="ml-1 font-black text-gray-900 dark:text-white">
                {item.startUnit} - {item.endUnit}
              </span>
            )}
          </div>
        </div>

        <div>
          {isCompleted ? (
            <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-3 h-3"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              {t("completed") || "TAMAMLANDI"}
            </span>
          ) : item.isTaken ? (
            <span
              className={`inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${isAssignedToUser ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/30" : "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"}`}
            >
              {isAssignedToUser
                ? t("yourTask") || "SENİN GÖREVİN"
                : item.assignedToName}
            </span>
          ) : (
            <span className="inline-flex items-center bg-green-50 text-green-600 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider border border-green-100 dark:bg-green-900/10 dark:text-green-400 dark:border-green-900/30">
              {t("statusEmpty") || "BOŞ"}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center justify-center gap-4 mb-4">
        {item.isTaken && (
          <>
            {(item.resource.type === "COUNTABLE" ||
              item.resource.type === "JOINT") && (
              <div className="scale-110">
                <Zikirmatik
                  currentCount={safeCount}
                  onDecrement={() => actions.decrementCount(item.id)}
                  t={t}
                  readOnly={!isAssignedToUser}
                />
              </div>
            )}

            {isAssignedToUser && (
              <button
                onClick={() =>
                  item.resource.type === "PAGED"
                    ? actions.openReadingModal(
                        item,
                        item.startUnit,
                        item.endUnit,
                      )
                    : actions.openReadingModal(item)
                }
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/30"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                {t("readText") || "Metni Oku"}
              </button>
            )}
          </>
        )}

        {!item.isTaken && <div className="py-8"></div>}
      </div>

      {isAssignedToUser && (
        <div className="flex gap-3 w-full mt-auto pt-2">
          {!isCompleted && (
            <button
              onClick={() => {
                actions.handleCompletePart(item.id);

                if (
                  (item.resource.type === "COUNTABLE" ||
                    item.resource.type === "JOINT") &&
                  actions.updateLocalCount
                ) {
                  actions.updateLocalCount(item.id, 0);
                }
              }}
              className="flex-1 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all active:scale-95 text-sm font-bold flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              {t("finish")}
            </button>
          )}

          <button
            onClick={() => {
              actions.handleCancelPart(item.id);

              if (
                (item.resource.type === "COUNTABLE" ||
                  item.resource.type === "JOINT") &&
                actions.updateLocalCount
              ) {
                const initialValue = item.endUnit - item.startUnit + 1;
                actions.updateLocalCount(item.id, initialValue);
              }
            }}
            className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap
              ${
                isCompleted
                  ? "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                  : "bg-white text-red-500 border-red-100 hover:bg-red-50 hover:border-red-200 dark:bg-transparent dark:text-red-400 dark:border-red-900/30 dark:hover:bg-red-900/10"
              }`}
          >
            {isCompleted ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                  />
                </svg>
                {t("undo") || "Geri Al"}
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
                {t("giveUp") || "Vazgeç"}
              </>
            )}
          </button>
        </div>
      )}

      {!item.isTaken && (
        <button
          onClick={() => actions.handleTakePart(item.id)}
          className="w-full py-3 bg-white border-2 border-dashed border-emerald-200 text-emerald-600 rounded-xl hover:bg-emerald-50 hover:border-emerald-400 hover:text-emerald-700 transition-all active:scale-95 text-sm font-bold flex items-center justify-center gap-2 mt-4 dark:bg-gray-800/50 dark:border-emerald-900/40 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
        >
          {t("select") || "Seç"}
        </button>
      )}
    </div>
  );
}
