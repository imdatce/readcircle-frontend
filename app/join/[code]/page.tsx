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

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {},
  );
  const [tempName, setTempName] = useState(userName || "");

  // İstatistikler
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

  // Kaynak Gruplandırma (Wrapped parçalar için)
  const resourceGroups = useMemo(() => {
    if (!session) return {};
    const groups: Record<string, Record<number, Assignment[]>> = {};

    session.assignments.forEach((a) => {
      const translation =
        a.resource?.translations?.find((tr) => tr.langCode === language) ||
        a.resource?.translations?.find((tr) => tr.langCode === "tr") ||
        a.resource?.translations?.[0];

      const rName =
        translation?.name || a.resource?.codeKey || t("otherResource");

      if (!groups[rName]) groups[rName] = {};
      if (!groups[rName][a.participantNumber])
        groups[rName][a.participantNumber] = [];
      groups[rName][a.participantNumber].push(a);
    });
    return groups;
  }, [session, language, t]);

  const handleNameSubmit = () => {
    if (tempName.trim()) {
      setUserName(tempName.trim());
      localStorage.setItem("guestUserName", tempName.trim());
    }
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

  if (error || !session)
    return (
      <div className="flex h-screen items-center justify-center p-4 text-center">
        <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-xl border border-red-100 dark:border-red-900/30 max-w-md w-full">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
            {t("errorOccurred")}
          </h2>
          <Link
            href="/"
            className="inline-block px-8 py-3 bg-gray-800 text-white rounded-xl font-bold"
          >
            {t("backHome")}
          </Link>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-transparent pb-20">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-100 dark:border-gray-800 h-16 flex items-center px-4">
        <div className="max-w-4xl mx-auto w-full flex justify-between items-center">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-500 hover:text-emerald-600 transition-colors font-bold text-sm"
          >
            <svg
              className="w-5 h-5"
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
            <span className="hidden sm:inline">{t("backHome")}</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {t("sessionCode")}:
            </span>
            <span className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-lg text-xs font-black text-gray-700 dark:text-gray-300">
              #{session.code}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 mt-6 md:mt-10">
        {!userName ? (
          <div className="max-w-md mx-auto bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-emerald-50 dark:border-emerald-900/20 text-center animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/30 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
              <span className="text-4xl animate-bounce">👋</span>
            </div>
            <h2 className="text-3xl font-black mb-4 dark:text-white">
              {session.description || t("joinTitle")}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium">
              {t("joinIntro")}
            </p>
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              placeholder={t("yourNamePlaceholder")}
              className="w-full px-6 py-5 bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl text-lg font-bold text-center mb-4 outline-none focus:border-emerald-500 transition-all dark:text-white"
              onKeyDown={(e) => e.key === "Enter" && handleNameSubmit()}
            />
            <button
              onClick={handleNameSubmit}
              disabled={!tempName.trim()}
              className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-black text-lg shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-all"
            >
              {t("continue")}
            </button>
          </div>
        ) : (
          <>
            <div className="text-center mb-10">
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-2 leading-tight">
                {session.description || t("joinTitle")}
              </h1>
              <div className="inline-flex items-center gap-2 text-[10px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-800 uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                {t("welcomeUser").replace("{name}", userName)}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 md:gap-6 mb-10">
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

            <div className="space-y-6">
              {Object.entries(resourceGroups).map(
                ([resourceName, participantsMap]) => (
                  <div
                    key={resourceName}
                    className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden transition-all duration-300"
                  >
                    <button
                      onClick={() =>
                        setExpandedGroups((p) => ({
                          ...p,
                          [resourceName]: !p[resourceName],
                        }))
                      }
                      className="w-full flex items-center justify-between p-6 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-all"
                    >
                      <div className="flex items-center gap-4 text-left">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner transition-colors ${expandedGroups[resourceName] ? "bg-emerald-500 text-white" : "bg-blue-50 dark:bg-blue-900/20 text-blue-600"}`}
                        >
                          <svg
                            className="w-6 h-6"
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
                        <div>
                          <h3 className="text-lg font-black text-gray-800 dark:text-gray-100 leading-tight">
                            {resourceName}
                          </h3>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                            {Object.keys(participantsMap).length} {t("part")}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center transition-transform duration-300 ${expandedGroups[resourceName] ? "rotate-180" : ""}`}
                      >
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>

                    {expandedGroups[resourceName] && (
                      <div className="p-4 md:p-6 bg-gray-50/50 dark:bg-black/10 border-t border-gray-50 dark:border-gray-800 animate-in slide-in-from-top-2 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Object.entries(participantsMap)
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
                              />
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                ),
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

function StatCard({ label, value, percent, color = "gray" }: any) {
  const colorClasses: any = {
    blue: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 border-blue-100 dark:border-blue-900/30",
    emerald:
      "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30",
    gray: "text-gray-800 bg-white dark:bg-gray-900 dark:text-white border-gray-100 dark:border-gray-800",
  };
  return (
    <div
      className={`p-4 md:p-5 rounded-3xl border shadow-sm text-center ${colorClasses[color] || colorClasses.gray}`}
    >
      <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-1.5 opacity-60">
        {label}
      </p>
      <div className="flex flex-col items-center leading-none">
        <span className="text-2xl md:text-3xl font-black">{value}</span>
        {percent !== undefined && (
          <span className="text-[10px] font-bold mt-1.5 opacity-80 bg-white/50 dark:bg-black/20 px-2 py-0.5 rounded-full">
            %{percent}
          </span>
        )}
      </div>
    </div>
  );
}

function AssignmentCard({ participantNumber, assignments, localCounts, userName, actions, t }: any) {
  const first = assignments[0];
  const isTaken = first.isTaken;
  const isAssignedToUser = userName && first.assignedToName === userName;
  const isCompleted = first.isCompleted;

  // Tip belirleme yardımcısı
  const getTypeName = (resource: any) => {
    const rawType = resource.type;
    return (typeof rawType === 'string' ? rawType : rawType?.name)?.toUpperCase();
  };

  // Kart Stilleri
  let cardStyle = "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-sm";
  if (isCompleted && isAssignedToUser) {
    cardStyle = "bg-emerald-50/30 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800 shadow-sm";
  } else if (isAssignedToUser) {
    cardStyle = "bg-white dark:bg-gray-900 border-blue-500 ring-4 ring-blue-500/5 shadow-2xl scale-[1.02] z-10";
  } else if (isTaken) {
    cardStyle = "bg-gray-50/80 dark:bg-gray-900/80 border-gray-100 dark:border-gray-800 opacity-60 grayscale-[0.5]";
  }

  return (
    <div className={`p-6 rounded-[2.5rem] border transition-all duration-500 relative flex flex-col ${cardStyle}`}>
      
      {/* 1. ÜST BİLGİ: Parça No ve Hedef Rozetleri */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
             <span className="text-[10px] font-black text-blue-500 dark:text-blue-400 uppercase tracking-[0.2em]">{t("part")} {participantNumber}</span>
             {isAssignedToUser && !isCompleted && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></span>}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {assignments.map((a: any, idx: number) => (
              <span key={idx} className="text-[10px] font-black text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-lg border border-gray-200/50 dark:border-gray-700/50 shadow-inner">
                 {(getTypeName(a.resource) === "JOINT" ? t("target") : t("page"))}: {getTypeName(a.resource) === "JOINT" ? a.endUnit : `${a.startUnit}-${a.endUnit}`}
              </span>
            ))}
          </div>
        </div>

        {/* Durum Rozeti */}
        <div className="shrink-0 ml-3">
          {isCompleted ? (
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-200 dark:border-emerald-800 shadow-sm">
               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M5 13l4 4L19 7" /></svg>
            </div>
          ) : isTaken ? (
            <div className={`px-4 py-1.5 rounded-xl border-2 flex flex-col items-center leading-tight transition-all ${isAssignedToUser ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-400'}`}>
              <span className="text-[7px] font-black uppercase tracking-[0.2em] mb-0.5">{isAssignedToUser ? t("yourTask") : t("taken")}</span>
              <span className="text-[10px] font-black truncate max-w-[70px]">{isAssignedToUser ? userName : (first.assignedToName || "--")}</span>
            </div>
          ) : (
            <span className="bg-gray-50 dark:bg-gray-800 text-gray-400 text-[9px] font-black px-4 py-2 rounded-full uppercase tracking-widest border border-gray-100 dark:border-gray-700 shadow-inner">{t("statusEmpty")}</span>
          )}
        </div>
      </div>

      {/* 2. ANA GÖVDE: Zikirmatik & Metni Oku */}
      <div className="flex flex-col items-center justify-center py-4 flex-1">
        
        {/* Zikirmatik (Sadece atanmışsa ve zikir türündeyse) */}
        {isTaken && (getTypeName(first.resource) === "COUNTABLE" || getTypeName(first.resource) === "JOINT") && (
          <div className="scale-125 transform transition-all duration-500 mb-8 mt-4 hover:scale-130">
            <Zikirmatik 
              currentCount={localCounts[first.id] ?? (first.endUnit - first.startUnit + 1)} 
              onDecrement={() => actions.decrementCount(first.id)} 
              t={t} 
              readOnly={!isAssignedToUser} 
            />
          </div>
        )}

        {/* Metni Oku Butonları (Zikirmatik'in Altında) */}
        {isAssignedToUser && !isCompleted && (
          <div className="w-full space-y-2.5 mt-2 animate-in fade-in slide-in-from-top-4 duration-500">
            {assignments.map((a: any, idx: number) => (
              <button 
                key={idx}
                onClick={() => actions.openReadingModal(a, a.startUnit, a.endUnit)} 
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-[1.2rem] font-black text-xs uppercase tracking-[0.15em] shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-3 border-b-4 border-blue-800"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                {t("readText")} {assignments.length > 1 ? `(${a.startUnit}-${a.endUnit})` : ''}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3. ALT AKSİYONLAR: Bitirdim & Vazgeç */}
      <div className="mt-8 pt-6 border-t-2 border-dashed border-gray-50 dark:border-gray-800">
        {!isTaken ? (
          <button 
            onClick={() => actions.handleTakePart(first.id)} 
            className="w-full py-4 bg-white dark:bg-gray-800 border-2 border-dashed border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 rounded-2xl font-black text-sm hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all active:scale-95 shadow-sm"
          >
            {t("select")}
          </button>
        ) : isAssignedToUser && (
          <div className="flex flex-col gap-3">
            {!isCompleted && (
              <button 
                onClick={() => {
                   actions.handleCompletePart(first.id);
                   if ((getTypeName(first.resource) === "COUNTABLE" || getTypeName(first.resource) === "JOINT") && actions.updateLocalCount) {
                      actions.updateLocalCount(first.id, 0);
                   }
                }} 
                className="w-full py-4 bg-emerald-600 text-white rounded-[1.2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-emerald-500/30 active:scale-95 transition-all flex items-center justify-center gap-3 border-b-4 border-emerald-800"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path d="M5 13l4 4L19 7" /></svg>
                {t("finish")}
              </button>
            )}
            <button 
              onClick={() => {
                 actions.handleCancelPart(first.id);
                 if ((getTypeName(first.resource) === "COUNTABLE" || getTypeName(first.resource) === "JOINT") && actions.updateLocalCount) {
                    const initial = first.endUnit - first.startUnit + 1;
                    actions.updateLocalCount(first.id, initial);
                 }
              }} 
              className={`w-full py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 border-2 ${
                isCompleted 
                ? 'bg-white dark:bg-gray-800 text-gray-400 border-gray-100 dark:border-gray-700' 
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
