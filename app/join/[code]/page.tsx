/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { use, useState, useMemo, useCallback } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useDistributionSession } from "@/hooks/useDistributionSession";
import ReadingModal from "@/components/modals/ReadingModal";
import { useRouter } from "next/navigation";
import {
  CATEGORY_ORDER,
  CATEGORY_MAPPING,
  RESOURCE_PRIORITY,
} from "@/constants/adminConfig";
import { GLAD_TIDINGS } from "@/constants/gladTidings";
import {
  StatCard,
  JoinLoading,
  NamePromptModal,
  GladTidingsModal,
} from "@/components/join/JoinWidgets";
import AssignmentCard from "@/components/join/AssignmentCard";

export default function JoinPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const router = useRouter();
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
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [pendingPartId, setPendingPartId] = useState<number | null>(null);
  const [tempName, setTempName] = useState("");
  const [completedAyah, setCompletedAyah] = useState<any>(null);

  const isGuestUser =
    !userName ||
    userName.toLowerCase().startsWith("guest") ||
    userName.startsWith("GUguest");

  const handlePartClick = (partId: number) => {
    if (isGuestUser) {
      setPendingPartId(partId);
      setTempName("");
      setIsNameModalOpen(true);
    } else {
      actions.handleTakePart(partId);
    }
  };

  const handleNameModalSubmit = async () => {
    if (!tempName.trim()) return;
    const finalName = tempName.trim();
    localStorage.setItem("guestUserName", finalName);
    setUserName(finalName);
    if (pendingPartId !== null) {
      await actions.handleTakePart(pendingPartId, finalName);
    }
    setIsNameModalOpen(false);
    setPendingPartId(null);
  };

  const handleFinishClick = async (partId: number, resource: any) => {
    actions.handleCompletePart(partId);
    const typeName =
      typeof resource.type === "string" ? resource.type : resource.type?.name;
    const upperType = typeName?.toUpperCase();
    if (
      (upperType === "COUNTABLE" || upperType === "JOINT") &&
      actions.updateLocalCount
    ) {
      actions.updateLocalCount(partId, 0);
    }
    const randomAyah =
      GLAD_TIDINGS[Math.floor(Math.random() * GLAD_TIDINGS.length)];
    setCompletedAyah(randomAyah);
  };

  // i18n standardına uygun kategori başlıkları
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
    const rawGroups: Record<string, any> = {};

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

    const categories: Record<string, any[]> = {};
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

  if (loading) return <JoinLoading t={t} />;

  if (error || !session)
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-center bg-[#FDFCF7] dark:bg-[#061612] relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-red-400/10 dark:bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="bg-white/80 dark:bg-[#0a1f1a]/80 backdrop-blur-xl p-8 md:p-10 rounded-[2.5rem] shadow-2xl border border-red-100 dark:border-red-900/30 max-w-md w-full animate-in zoom-in-95 duration-500 relative z-10">
          <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-red-100 dark:border-red-800/50">
            <svg
              className="w-10 h-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <h2 className="text-xl md:text-2xl font-black text-gray-800 dark:text-white mb-3">
            {t("circleNotFound") || "Halka Bulunamadı"}
          </h2>

          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
            {t("invalidCodeDesc") ||
              "Girdiğiniz davet kodu geçersiz veya silinmiş olabilir."}{" "}
            (
            <span className="font-bold text-gray-700 dark:text-gray-300">
              {code}
            </span>
            )
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push("/sessions")}
              className="w-full py-3.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold transition-all active:scale-95"
            >
              {t("tryCodeAgain") || "Tekrar Kod Girmeyi Dene"}
            </button>
            <button
              onClick={() => router.push("/")}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-500/20 transition-all active:scale-95"
            >
              {t("backHome") || "Ana Sayfaya Dön"}
            </button>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-transparent pb-10">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-100 dark:border-gray-800 h-14 md:h-16 flex items-center px-4">
        <div className="max-w-4xl mx-auto w-full flex justify-between items-center">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-gray-500 hover:text-emerald-600 transition-colors font-bold text-xs md:text-sm outline-none"
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
            <span>{t("back") || "Geri"}</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {t("sessionCode") || "Halka Kodu"}:
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
            {t("circle") || "Halka"}: {session.description || t("joinTitle")}
          </h1>
          {isGuestUser && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {t("guestMessage") ||
                "Lütfen almak istediğiniz cüzü/zikri seçin."}
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
                                userName={userName}
                                actions={actions}
                                t={t}
                                isOwner={isOwner}
                                deviceId={deviceId}
                                onTakeClick={handlePartClick}
                                onFinishClick={handleFinishClick}
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

      <NamePromptModal
        isOpen={isNameModalOpen}
        onClose={() => setIsNameModalOpen(false)}
        onSubmit={handleNameModalSubmit}
        tempName={tempName}
        setTempName={setTempName}
        t={t}
      />
      <GladTidingsModal
        completedAyah={completedAyah}
        onClose={() => setCompletedAyah(null)}
        t={t}
      />

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
          onCompleteAssignment={(id) => {
            const assignment = session?.assignments.find((a) => a.id === id);
            if (assignment) handleFinishClick(id, assignment.resource);
          }}
        />
      )}
    </div>
  );
}
