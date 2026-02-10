/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { use, useState } from "react";
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

  // Tüm mantığı hook'tan çekiyoruz
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

  const toggleGroup = (groupName: string) => {
    setExpandedGroups((prev) => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  // Gruplama mantığı (View Logic olduğu için burada kalabilir veya ayrı bir utils'e alınabilir)
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

    [distributed, individual].forEach((group) => {
      Object.keys(group).forEach((key) => {
        group[key].sort((a, b) => a.participantNumber - b.participantNumber);
      });
    });

    return { distributed, individual };
  };

  const renderGroupList = (groups: Record<string, Assignment[]>) => {
    return Object.entries(groups).map(([resourceName, assignments]) => {
      const isOpen = expandedGroups[resourceName] || false;
      return (
        <div
          key={resourceName}
          className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-4 dark:bg-gray-900 dark:border-gray-800 transition-colors duration-300"
        >
          <button
            onClick={() => toggleGroup(resourceName)}
            className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition duration-200 dark:bg-gray-900 dark:hover:bg-gray-800"
          >
            <div className="flex items-center">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center mr-3 ${isOpen ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
                  />
                </svg>
              </div>
              <div className="text-left">
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                  {resourceName}
                </h2>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {assignments.length} {t("person")} / {t("part")}
                </span>
              </div>
            </div>
            <div
              className={`transform transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5 text-gray-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m19.5 8.25-7.5 7.5-7.5-7.5"
                />
              </svg>
            </div>
          </button>

          {isOpen && (
            <div className="p-4 bg-gray-50 border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-300 dark:bg-gray-950 dark:border-gray-800">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {assignments.map((item) => {
                  const defaultTotal = item.endUnit - item.startUnit + 1;
                  const safeCount = localCounts[item.id] ?? defaultTotal;
                  const isAssignedToUser =
                    userName && item.assignedToName === userName;
                  const isCompleted = item.isCompleted || false;

                  let translation = item.resource.translations?.find(
                    (t) => t.langCode === language,
                  );
                  if (!translation)
                    translation =
                      item.resource.translations?.find(
                        (t) => t.langCode === "tr",
                      ) || item.resource.translations?.[0];

                  return (
                    <div
                      key={item.id}
                      className={`relative p-5 rounded-xl border transition-all duration-300 shadow-sm ${
                        isCompleted
                          ? "bg-green-50 border-green-200 opacity-80 dark:bg-green-900/20 dark:border-green-900"
                          : item.isTaken
                            ? isAssignedToUser
                              ? "bg-blue-50/50 border-blue-200 ring-1 ring-blue-100 dark:bg-blue-900/20 dark:border-blue-900 dark:ring-blue-900"
                              : "bg-gray-50 border-gray-200 opacity-75 grayscale-[0.5] dark:bg-gray-800/50 dark:border-gray-700"
                            : "bg-white border-gray-100 hover:shadow-md hover:border-emerald-200 dark:bg-gray-800 dark:border-gray-700 dark:hover:border-emerald-800"
                      }`}
                    >
                      <div className="absolute top-4 right-4">
                        {isCompleted ? (
                          <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 dark:bg-green-900 dark:text-green-300">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3 w-3"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>{" "}
                            {t("completed")}
                          </span>
                        ) : item.isTaken ? (
                          <span className="bg-gray-200 text-gray-600 text-xs font-bold px-2 py-1 rounded-full dark:bg-gray-700 dark:text-gray-300">
                            {item.assignedToName}
                          </span>
                        ) : (
                          <span className="bg-emerald-100 text-emerald-600 text-xs font-bold px-2 py-1 rounded-full animate-pulse dark:bg-emerald-900 dark:text-emerald-300">
                            {t("statusEmpty")}
                          </span>
                        )}
                      </div>

                      <div className="mb-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-gray-800 dark:text-gray-200">
                            {item.participantNumber}. {t("person")}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {item.resource.type === "JOINT"
                            ? `${t("target")}:`
                            : (item.resource.type === "PAGED"
                                ? t("page")
                                : item.resource.type === "COUNTABLE"
                                  ? t("pieces")
                                  : translation?.unitName || t("part")) + ":"}
                          {item.resource.type === "JOINT" ? (
                            <span className="ml-1 font-bold">
                              {item.endUnit} {t("pieces")}
                            </span>
                          ) : (
                            <span>
                              {" "}
                              {item.startUnit} - {item.endUnit}
                            </span>
                          )}
                          {item.resource.type === "COUNTABLE" && (
                            <span className="ml-2 font-bold text-blue-600 dark:text-blue-400">
                              ({t("total")}: {item.endUnit - item.startUnit + 1}
                              )
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-1 items-center w-full">
                        {item.isTaken ? (
                          <>
                            {item.resource.type === "COUNTABLE" ||
                            item.resource.type === "JOINT" ? (
                              <div className="w-full flex flex-col items-center">
                                <Zikirmatik
                                  currentCount={safeCount}
                                  onDecrement={() =>
                                    actions.decrementCount(item.id)
                                  }
                                  t={t}
                                  readOnly={!isAssignedToUser}
                                />
                                {isAssignedToUser && (
                                  <button
                                    onClick={() =>
                                      actions.openReadingModal(item)
                                    }
                                    className="mt-2 text-blue-600 text-sm font-semibold underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                  >
                                    {t("takeRead")} ({t("readText")})
                                  </button>
                                )}
                              </div>
                            ) : // LIST_BASED ve PAGED için butonlar
                            isAssignedToUser ? (
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
                                className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-bold shadow transition flex items-center justify-center gap-2"
                              >
                                {t("takeRead")}
                              </button>
                            ) : (
                              <button
                                disabled
                                className="w-full py-2 bg-gray-300 text-gray-600 rounded cursor-not-allowed text-sm font-bold shadow-inner border border-gray-400 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600"
                              >
                                {t("full")}
                              </button>
                            )}
                          </>
                        ) : (
                          <button
                            onClick={() => actions.handleTakePart(item.id)}
                            className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 active:bg-blue-800 text-sm font-bold transition transform hover:scale-[1.02]"
                          >
                            {t("select")}
                          </button>
                        )}
                      </div>

                      {isAssignedToUser && (
                        <div className="mt-3 w-full space-y-2">
                          {!isCompleted && (
                            <button
                              onClick={() =>
                                actions.handleCompletePart(item.id)
                              }
                              className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 shadow-md hover:shadow-lg transition-all active:scale-95 font-bold text-sm"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>{" "}
                              {t("finished")}
                            </button>
                          )}
                          <button
                            onClick={() => actions.handleCancelPart(item.id)}
                            className="w-full group flex items-center justify-center gap-2 py-2 bg-white border-2 border-red-100 text-red-500 rounded-xl hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all duration-200 font-bold text-sm shadow-sm active:scale-95 dark:bg-red-900/10 dark:border-red-900/30 dark:text-red-400 dark:hover:bg-red-900/20"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={2.5}
                              stroke="currentColor"
                              className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 18 18 6M6 6l12 12"
                              />
                            </svg>{" "}
                            {t("cancelRead")}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      );
    });
  };

  if (loading)
    return (
      <div className="p-10 text-center font-bold text-gray-600 dark:text-gray-300">
        {t("loading")}
      </div>
    );
  if (error)
    return (
      <div className="p-10 text-center text-red-500 font-bold">{error}</div>
    );
  if (!session) return null;

  const { distributed, individual } = getSplitGroups();

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 relative dark:bg-gray-950 transition-colors duration-300">
      <Link
        href="/"
        className="fixed top-24 left-4 z-50 flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-full shadow-md border border-gray-200 hover:bg-gray-100 hover:text-blue-600 transition-all font-bold text-sm dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
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

      <div className="max-w-4xl mx-auto">
        {!userName && (
          <div className="bg-white p-6 rounded-lg shadow mb-8 text-center dark:bg-gray-900 dark:text-gray-100 transition-colors">
            <h1 className="text-3xl font-bold text-red-800 mb-2 dark:text-red-400">
              {t("joinTitle")}
            </h1>
            <div className="mb-6">
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded shadow-sm dark:bg-blue-900/20 dark:border-blue-600">
                <p className="text-sm text-red-700 font-bold mb-2 dark:text-red-300">
                  {t("joinIntro")}
                </p>
                <input
                  type="text"
                  placeholder={t("yourName")}
                  onChange={(e) => {
                    const val = e.target.value;
                    setUserName(val);
                    localStorage.setItem("guestUserName", val);
                  }}
                  className="w-full p-2 border border-blue-300 rounded font-bold text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-800 dark:border-blue-700 dark:text-gray-100"
                />
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 md:gap-8 items-start mt-10">
          <div className="w-full">
            {Object.keys(distributed).length > 0 && (
              <div className="mb-6 md:mb-0">
                <h2 className="text-lg md:text-2xl font-extrabold text-gray-800 border-b-2 border-gray-200 pb-2 md:pb-4 mb-4 md:mb-6 flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-3 sticky top-0 bg-gray-50 z-10 pt-2 shadow-sm dark:text-white dark:border-gray-700 dark:bg-gray-950 transition-colors">
                  <span className="p-1.5 md:p-2 bg-blue-100 text-blue-600 rounded-lg shadow-sm dark:bg-blue-900/40 dark:text-blue-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 md:h-6 md:w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </span>
                  {t("distributedResources")}
                </h2>
                <div className="flex flex-col gap-3 md:gap-5">
                  {renderGroupList(distributed)}
                </div>
              </div>
            )}
          </div>

          <div className="w-full">
            {Object.keys(individual).length > 0 && (
              <div>
                <h2 className="text-lg md:text-2xl font-extrabold text-gray-800 border-b-2 border-gray-200 pb-2 md:pb-4 mb-4 md:mb-6 flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-3 sticky top-0 bg-gray-50 z-10 pt-2 shadow-sm dark:text-white dark:border-gray-700 dark:bg-gray-950 transition-colors">
                  <span className="p-1.5 md:p-2 bg-emerald-100 text-emerald-600 rounded-lg shadow-sm dark:bg-emerald-900/40 dark:text-emerald-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 md:h-6 md:w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </span>
                  {t("individualResources")}
                </h2>
                <div className="flex flex-col gap-3 md:gap-5">
                  {renderGroupList(individual)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

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
