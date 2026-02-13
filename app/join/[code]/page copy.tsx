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

  const isCreator = session?.creatorName === userName;
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
      const codeKey = assignment.resource.codeKey; // Kaynak kodunu alıyoruz

      // --- MANTIK DEĞİŞİKLİĞİ BURADA ---
      // Eğer tip JOINT ise VEYA kod 'TEFRICIYE' veya 'MUNCIYE' ise Bireysel'e at
      const isIndividual = 
          type === "JOINT" || 
          codeKey === "TEFRICIYE" || 
          codeKey === "MUNCIYE";

      if (isIndividual) {
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
        <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl text-center max-w-md w-full border border-red-100 dark:border-red-900/30">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            {t("errorOccurred")}
          </h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <Link
            href="/"
            className="inline-block w-full py-3 bg-gray-800 text-white rounded-xl font-bold hover:bg-gray-900 transition"
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
            <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20 transition-colors">
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
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              {t("sessionCode")}:
            </span>
            <span className="text-sm font-black text-gray-800 dark:text-white bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg">
              {session.code}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 mt-6 md:mt-10">
        {!userName ? (
          <div className="max-w-md mx-auto bg-white dark:bg-gray-900 rounded-[2rem] p-8 shadow-2xl shadow-emerald-100/50 dark:shadow-none border border-emerald-50 dark:border-emerald-900/30 text-center relative overflow-hidden animate-in fade-in zoom-in duration-500">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-teal-500"></div>

            <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <span className="text-5xl animate-bounce">👋</span>
            </div>

            <h2 className="text-3xl font-black bg-gradient-to-br from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-3">
              {session.description || t("joinTitle")}
            </h2>

            <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium leading-relaxed">
              {t("joinIntro")}
            </p>

            <div className="space-y-4">
              <div className="relative group">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  placeholder={t("yourNamePlaceholder")}
                  className="w-full px-6 py-5 bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 focus:border-emerald-500 dark:focus:border-emerald-500 rounded-2xl text-lg font-bold text-center outline-none transition-all text-gray-800 dark:text-white group-hover:bg-white dark:group-hover:bg-gray-800 shadow-sm focus:shadow-md placeholder-gray-400"
                  onKeyDown={(e) => e.key === "Enter" && handleNameSubmit()}
                />
              </div>
              <button
                onClick={handleNameSubmit}
                disabled={!tempName.trim()}
                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-emerald-200 dark:shadow-none hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
              >
                {t("continue")}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="inline-flex items-center gap-2 py-1 px-3 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 text-xs font-bold tracking-wider mb-3 border border-blue-100 dark:border-blue-800">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                {t("welcomeUser")?.replace("{name}", userName)}
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-2 leading-tight">
                {session.description || t("joinTitle")}
              </h1>
            </div>

            <div className="grid grid-cols-3 gap-3 md:gap-6 mb-10">
              <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow text-center group">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 group-hover:text-gray-600 transition-colors">
                  {t("totalParts")}
                </p>
                <p className="text-2xl md:text-3xl font-black text-gray-800 dark:text-white">
                  {stats.total}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-blue-100 dark:border-blue-900/30 shadow-sm hover:shadow-md hover:shadow-blue-100/50 transition-all text-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-bl-[2rem] -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2">
                  {t("distributed")}
                </p>
                <div className="flex flex-col items-center leading-none gap-1">
                  <span className="text-2xl md:text-3xl font-black text-blue-600 dark:text-blue-400">
                    {stats.distributed}
                  </span>
                  <span className="text-[10px] font-bold text-blue-400/80 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                    %{stats.distPercent}
                  </span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-emerald-100 dark:border-emerald-900/30 shadow-sm hover:shadow-md hover:shadow-emerald-100/50 transition-all text-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-bl-[2rem] -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-2">
                  {t("completed")}
                </p>
                <div className="flex flex-col items-center leading-none gap-1">
                  <span className="text-2xl md:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                    {stats.completed}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-500/80 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
                    %{stats.compPercent}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex p-1.5 bg-gray-100/80 dark:bg-gray-800/60 backdrop-blur rounded-2xl shadow-inner border border-gray-200/50 dark:border-gray-700/50 mb-8 mx-auto max-w-lg">
              {hasDistributed && (
                <button
                  onClick={() => setActiveTab("distributed")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                    activeTab === "distributed"
                      ? "bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm scale-[1.02] ring-1 ring-black/5"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white/50"
                  }`}
                >
                  {t("distributedResources")}
                </button>
              )}
              {hasIndividual && (
                <button
                  onClick={() => setActiveTab("individual")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                    activeTab === "individual"
                      ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm scale-[1.02] ring-1 ring-black/5"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white/50"
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
                  isCreator={isCreator}
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
                  isCreator={isCreator}
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
  isCreator,
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

  const sortOrder = [
    "kuran",
    "cevşen",
    "tefriciye",
    "münciye",
    "tevhidname",
    "bedir",
    "fatiha",
    "yasin",
    "uhud",
    "salavat",
    "latif",
    "hafız",
    "fettah",
    "lahavle",
    "hasbunallah",
  ];

  const getPriority = (name: string) => {
    const lowerName = name.toLocaleLowerCase("tr");
    const index = sortOrder.findIndex(
      (key) =>
        lowerName.includes(key) ||
        lowerName.includes(
          key
            .replace("ş", "s")
            .replace("ı", "i")
            .replace("ü", "u")
            .replace("ç", "c")
            .replace("ö", "o"),
        ),
    );
    return index !== -1 ? index + 1 : 999;
  };

  const sortedEntries = Object.entries(groups).sort(([nameA], [nameB]) => {
    return getPriority(nameA) - getPriority(nameB);
  });

  return sortedEntries.map(([resourceName, assignments]: any) => {
    const isOpen = expandedGroups[resourceName] || false;
    const totalCount = assignments.length;
    const takenCount = assignments.filter((a: any) => a.isTaken).length;
    const completedCount = assignments.filter((a: any) => a.isCompleted).length;
    const percentage = Math.round((takenCount / totalCount) * 100);
    const completedPercentage = Math.round((completedCount / totalCount) * 100);

    return (
      <div
        key={resourceName}
        className="bg-white dark:bg-gray-900 rounded-[1.8rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md mb-4"
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
              {assignments
                .sort(
                  (a: any, b: any) => a.participantNumber - b.participantNumber,
                )
                .map((item: any) => (
                  <AssignmentCard
                    key={item.id}
                    item={item}
                    localCounts={localCounts}
                    userName={userName}
                    isCreator={isCreator}
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

function AssignmentCard({ participantNumber, assignments, localCounts, userName, actions, t }: any) {
  const first = assignments[0];
  const isTaken = first.isTaken;
  const isAssignedToUser = userName && first.assignedToName === userName;
  const isCompleted = first.isCompleted;

  // Kart Stilleri
  let cardStyle = "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-sm";
  if (isCompleted && isAssignedToUser) {
    cardStyle = "bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800 shadow-emerald-500/5";
  } else if (isAssignedToUser) {
    cardStyle = "bg-white dark:bg-gray-900 border-blue-500 ring-4 ring-blue-500/5 shadow-2xl scale-[1.02] z-10";
  } else if (isTaken) {
    cardStyle = "bg-gray-50/80 dark:bg-gray-900/80 border-gray-100 dark:border-gray-800 opacity-60 grayscale-[0.5]";
  }

  return (
    <div className={`p-6 rounded-[2.5rem] border transition-all duration-500 relative flex flex-col ${cardStyle}`}>
      {/* Üst Kısım: Başlık ve Durum Etiketi */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1.5">
             <span className="text-[10px] font-black text-blue-500 dark:text-blue-400 uppercase tracking-[0.2em]">{t("part")} {participantNumber}</span>
             {isAssignedToUser && !isCompleted && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></span>
             )}
          </div>
          
          <div className="space-y-4">
            {assignments.map((a: any, idx: number) => {
               const rawType = a.resource.type;
               const typeName = (typeof rawType === 'string' ? rawType : rawType?.name)?.toUpperCase();
               const isPaged = typeName === "PAGED";
               const isJoint = typeName === "JOINT";

               return (
                <div key={idx} className="flex flex-col gap-3 p-4 bg-gray-50/50 dark:bg-black/20 rounded-[1.5rem] border border-gray-100 dark:border-gray-800 group transition-all hover:bg-white dark:hover:bg-gray-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                      {isJoint ? t("target") : (isPaged ? t("page") : t("pieces"))}
                    </span>
                    <span className={`text-sm font-black ${isAssignedToUser ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                      {isJoint ? a.endUnit : `${a.startUnit} - ${a.endUnit}`}
                    </span>
                  </div>
                  
                  {/* OKUMAYA BAŞLA BUTONU */}
                  {isAssignedToUser && !isCompleted && (
                    <button 
                      onClick={() => actions.openReadingModal(a, a.startUnit, a.endUnit)} 
                      className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-[11px] font-black text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all active:scale-95 uppercase tracking-widest"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                      {t("readText")}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Sağ Üst: Durum Rozeti */}
        <div className="shrink-0 ml-3">
          {isCompleted ? (
            <div className="flex flex-col items-center">
               <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 rounded-full flex items-center justify-center mb-1 border border-emerald-200 dark:border-emerald-800">
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
               </div>
               <span className="text-[8px] font-black text-emerald-600 uppercase tracking-tighter">{t("completed")}</span>
            </div>
          ) : isTaken ? (
            <div className={`px-3 py-1.5 rounded-full border-2 flex flex-col items-center gap-0.5 ${isAssignedToUser ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-500/20' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'}`}>
              <span className={`text-[8px] font-black uppercase tracking-[0.1em] ${isAssignedToUser ? 'text-blue-100' : 'text-gray-400'}`}>
                {isAssignedToUser ? t("yourTask") : t("taken")}
              </span>
              <span className={`text-[10px] font-black truncate max-w-[60px] text-center ${isAssignedToUser ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                {isAssignedToUser ? userName : (first.assignedToName || "--")}
              </span>
            </div>
          ) : (
            <span className="bg-white dark:bg-gray-800 text-gray-400 text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border border-gray-100 dark:border-gray-800">{t("statusEmpty")}</span>
          )}
        </div>
      </div>

      {/* Orta Kısım: Zikirmatik */}
      <div className="flex flex-col items-center justify-center py-4 flex-1">
        {isTaken && (() => {
          const type = (typeof first.resource.type === 'string' ? first.resource.type : first.resource.type?.name)?.toUpperCase();
          return (type === "COUNTABLE" || type === "JOINT");
        })() && (
          <div className="flex flex-col items-center gap-4">
            <div className="scale-125 transform transition-transform hover:scale-130">
              <Zikirmatik 
                currentCount={localCounts[first.id] ?? (first.endUnit - first.startUnit + 1)} 
                onDecrement={() => actions.decrementCount(first.id)} 
                t={t} 
                readOnly={!isAssignedToUser} 
              />
            </div>
            {isAssignedToUser && !isCompleted && (
              <span className="text-[10px] font-bold text-gray-400 animate-pulse flex items-center gap-2">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" /></svg>
                {t("tapToCount") || "SAYMAK İÇİN DOKUN"}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Alt Kısım: Ana Butonlar */}
      <div className="mt-6">
        {!isTaken ? (
          <button 
            onClick={() => actions.handleTakePart(first.id)} 
            className="w-full py-4 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-2 border-dashed border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 rounded-2xl font-black text-sm hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all active:scale-95 shadow-sm"
          >
            {t("select")}
          </button>
        ) : isAssignedToUser && (
          <div className="flex flex-col gap-3">
            {!isCompleted ? (
              <button 
                onClick={() => {
                   actions.handleCompletePart(first.id);
                   const type = (typeof first.resource.type === 'string' ? first.resource.type : first.resource.type?.name)?.toUpperCase();
                   if ((type === "COUNTABLE" || type === "JOINT") && actions.updateLocalCount) {
                      actions.updateLocalCount(first.id, 0);
                   }
                }} 
                className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path d="M5 13l4 4L19 7" /></svg>
                {t("finish")}
              </button>
            ) : null}
            
            <button 
              onClick={() => {
                 actions.handleCancelPart(first.id);
                 const type = (typeof first.resource.type === 'string' ? first.resource.type : first.resource.type?.name)?.toUpperCase();
                 if ((type === "COUNTABLE" || type === "JOINT") && actions.updateLocalCount) {
                    const initial = first.endUnit - first.startUnit + 1;
                    actions.updateLocalCount(first.id, initial);
                 }
              }} 
              className={`w-full py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 border-2 ${
                isCompleted 
                ? 'bg-white dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700' 
                : 'bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/30'
              }`}
            >
              {isCompleted ? t("undo") : t("giveUp")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
