// components/join/AssignmentCard.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React from "react";
import Zikirmatik from "@/components/common/Zikirmatik";

export default function AssignmentCard({
  participantNumber,
  assignments,
  localCounts,
  userName,
  actions,
  t,
  isOwner,
  deviceId,
  onTakeClick,
  onFinishClick,
}: any) {
  const first = assignments[0];
  const isTaken = first.isTaken;
  const isAssignedToMe = first.deviceId === deviceId;
  const assignedName = first.assignedToName
    ? first.assignedToName.trim().toLowerCase()
    : "";
  const currentName = userName ? userName.trim().toLowerCase() : "";
  const isAssignedToUserName = currentName && assignedName === currentName;
  const isMyAssignment = isAssignedToMe || isAssignedToUserName;
  const canSeeDetails = isOwner || isMyAssignment;

  const isCompleted = first.isCompleted && (isOwner || isMyAssignment);

  const getTypeName = (resource: any) => {
    const rawType = resource.type;
    return (
      typeof rawType === "string" ? rawType : rawType?.name
    )?.toUpperCase();
  };

  let cardStyle =
    "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md transition-all";
  if (isCompleted && isMyAssignment) {
    cardStyle =
      "bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-400 dark:border-emerald-600 shadow-md opacity-90";
  } else if (isMyAssignment) {
    cardStyle =
      "bg-blue-50/50 dark:bg-blue-900/20 border-2 border-blue-500 ring-4 ring-blue-500/20 shadow-xl scale-[1.02] z-10";
  } else if (isTaken) {
    cardStyle =
      "bg-gray-50/80 dark:bg-gray-800/80 border-gray-100 dark:border-gray-700 opacity-50 grayscale-[0.5] pointer-events-none";
  }

  let displayName = "";
  let statusText = t("statusEmpty") || "Boş";

  if (isTaken) {
    if (canSeeDetails) {
      if (isMyAssignment) {
        statusText = t("yourTask") || "Senin Görevin";
        displayName = "";
      } else {
        statusText = first.isCompleted
          ? t("completed") || "Tamamlandı"
          : t("taken") || "Alındı";
        displayName = first.assignedToName;
      }
    } else {
      statusText = t("taken") || "Alındı";
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
              className={`text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] ${isCompleted ? "text-emerald-600 dark:text-emerald-400" : isMyAssignment ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"}`}
            >
              {t("part") || "Parça"} {participantNumber}
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
                  className={`text-[9px] md:text-[10px] font-black px-2 py-0.5 rounded-md border shadow-inner ${isCompleted ? "bg-emerald-100/50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700" : isMyAssignment ? "bg-blue-100/50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700" : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200/50 dark:border-gray-700/50"}`}
                >
                  {isPaged
                    ? isQuran
                      ? `${t("juz") || "Cüz"} ${juzNumber} | ${t("pageWord") || "Sayfa"}: ${displayStart}-${displayEnd}`
                      : `${t("pageWord") || "Sayfa"}: ${displayStart}-${displayEnd}`
                    : `${count} ${t("pieces") || "Adet"}`}
                </span>
              );
            })}
          </div>
        </div>
        <div className="shrink-0 ml-2">
          {(first.isCompleted && isOwner) || isCompleted ? (
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
              className={`px-2.5 py-1 md:px-4 md:py-1.5 rounded-xl border-2 flex flex-col items-center leading-tight transition-all ${isMyAssignment ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30" : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400"}`}
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
              {t("statusEmpty") || "Boş"}
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
              className={`scale-100 md:scale-125 transform transition-all duration-500 mb-6 md:mb-8 mt-2 md:mt-4 ${isCompleted ? "opacity-70 pointer-events-none" : "hover:scale-105 md:hover:scale-130"}`}
            >
              <Zikirmatik
                currentCount={
                  localCounts[first.id] ?? first.endUnit - first.startUnit + 1
                }
                onDecrement={() => {
                  const currentCount =
                    localCounts[first.id] ??
                    first.endUnit - first.startUnit + 1;
                  actions.decrementCount(first.id);
                  if (currentCount === 1 && !isCompleted)
                    onFinishClick(first.id, first.resource);
                }}
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
                    {t("readText") || "Metni Oku"}{" "}
                    {assignments.length > 1
                      ? isQuran
                        ? `(${t("juz") || "Cüz"} ${juzNumber}, ${displayStart}-${displayEnd})`
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
        className={`mt-4 md:mt-8 pt-4 md:pt-6 border-t-2 border-dashed ${isCompleted ? "border-emerald-200 dark:border-emerald-800" : isMyAssignment ? "border-blue-200 dark:border-blue-800" : "border-gray-100 dark:border-gray-800"}`}
      >
        {!isTaken ? (
          <button
            onClick={() => onTakeClick(first.id)}
            className="w-full py-3.5 md:py-4 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-2 border-dashed border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 rounded-xl md:rounded-2xl font-black text-xs md:text-sm hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-all active:scale-95 shadow-sm"
          >
            {t("select") || "Seç"}
          </button>
        ) : (
          isMyAssignment && (
            <div className="flex flex-col gap-2 md:gap-3">
              {!isCompleted && (
                <button
                  onClick={() => onFinishClick(first.id, first.resource)}
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
                  {t("finish") || "Bitir"}
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
                className={`w-full py-3 md:py-3.5 rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-widest transition-all active:scale-95 border-2 ${isCompleted ? "bg-white dark:bg-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 border-gray-200 dark:border-gray-700" : "bg-red-50 hover:bg-red-100 dark:bg-red-900/10 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50"}`}
              >
                {isCompleted ? t("undo") || "Geri Al" : t("giveUp") || "Bırak"}
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
