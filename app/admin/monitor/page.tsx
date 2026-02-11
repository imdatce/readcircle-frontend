/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, Suspense } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { DistributionSession, Assignment } from "@/types";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { useMemo } from "react";

function MonitorContent() {
  const { t, language } = useLanguage();
  const searchParams = useSearchParams();

  const [code, setCode] = useState("");
  const [session, setSession] = useState<DistributionSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedResources, setExpandedResources] = useState<
    Record<string, boolean>
  >({});

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

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const getResourceName = (resource: any) => {
    let trans = resource.translations?.find(
      (tr: any) => tr.langCode === language,
    );
    if (!trans) {
      trans = resource.translations?.find((tr: any) => tr.langCode === "tr");
    }
    if (!trans) {
      trans = resource.translations?.[0];
    }
    return trans?.name || resource.codeKey;
  };

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
      setError("");
      setSession(data);

      setExpandedResources((prev) => {
        if (Object.keys(prev).length > 0) return prev;

        const initialExpanded: Record<string, boolean> = {};
        if (data.assignments && Array.isArray(data.assignments)) {
          data.assignments.forEach((a) => {
            if (a.resource) {
              const name = getResourceName(a.resource);
              initialExpanded[name] = true;
            }
          });
        }
        return initialExpanded;
      });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const groupAssignments = () => {
    if (!session) return {};
    const groups: Record<string, Assignment[]> = {};

    session.assignments.forEach((a) => {
      const name = getResourceName(a.resource);

      if (!groups[name]) groups[name] = [];
      groups[name].push(a);
    });

    Object.keys(groups).forEach((key) => {
      groups[key].sort((a, b) => a.participantNumber - b.participantNumber);
    });

    return groups;
  };

  const toggleResource = (name: string) => {
    setExpandedResources((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const groupedData = groupAssignments();

  if (loading && !session) {
    return (
      <div className="flex h-screen items-center justify-center bg-transparent">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium animate-pulse">
            {t("loading")}
          </p>
        </div>
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="flex h-screen items-center justify-center bg-transparent p-4">
        <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl text-center max-w-md w-full border border-red-100 dark:border-red-900/30">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 dark:bg-red-900/20">
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
                d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
              />
            </svg>
          </div>
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
    <div className="min-h-screen bg-transparent pb-20">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 shadow-sm transition-all">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors group"
          >
            <div className="p-2 rounded-full bg-gray-100 group-hover:bg-blue-50 dark:bg-gray-800 dark:group-hover:bg-blue-900/20 transition-colors">
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

          <div className="flex flex-col items-center">
            <h1 className="text-lg font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              {t("monitorTitle") || "Takip Ekranı"}
            </h1>
            {session && (
              <span className="text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 font-bold bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md mt-0.5">
                {session.code}
              </span>
            )}
          </div>

          <button
            onClick={() => fetchData(code)}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-xs hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm active:scale-95 disabled:opacity-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span className="hidden sm:inline">{t("refresh")}</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-8">
        {session && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm text-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                {t("total")}
              </p>
              <p className="text-3xl font-black text-gray-800 dark:text-white">
                {stats.total}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-blue-100 dark:border-blue-900/30 shadow-sm text-center">
              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">
                {t("distributed")}
              </p>
              <p className="text-3xl font-black text-blue-600 dark:text-blue-400">
                {stats.distributed}
                <span className="text-xs ml-1 opacity-60">
                  %{stats.distPercent}
                </span>
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 shadow-sm text-center">
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">
                {t("completed")}
              </p>
              <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                {stats.completed}
                <span className="text-xs ml-1 opacity-60">
                  %{stats.compPercent}
                </span>
              </p>
            </div>
          </div>
        )}

        {session && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {Object.entries(groupedData).map(([resourceName, assignments]) => {
              const isOpen = expandedResources[resourceName];
              const totalCount = assignments.length;
              const takenCount = assignments.filter((a) => a.isTaken).length;
              const completedCount = assignments.filter(
                (a) => a.isCompleted,
              ).length;

              const percentage = Math.round((takenCount / totalCount) * 100);
              const completedPercentage = Math.round(
                (completedCount / totalCount) * 100,
              );

              return (
                <div
                  key={resourceName}
                  className="bg-white dark:bg-gray-900 rounded-[1.5rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-visible transition-all duration-300 hover:shadow-md"
                >
                  <button
                    onClick={() => toggleResource(resourceName)}
                    className="w-full bg-white dark:bg-gray-900 px-6 py-5 flex flex-col md:flex-row justify-between items-center hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition duration-150 cursor-pointer gap-6 group rounded-[1.5rem]"
                  >
                    <div className="flex items-center gap-4 w-full md:w-auto">
                      <div
                        className={`transition-all duration-300 p-2.5 rounded-2xl shadow-inner flex items-center justify-center ${isOpen ? "bg-blue-600 text-white shadow-blue-500/30" : "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"}`}
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={isOpen ? "M19 9l-7 7-7-7" : "M9 5l7 7-7 7"}
                          />
                        </svg>
                      </div>
                      <div className="text-left">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {resourceName}
                        </h3>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">
                          <span className="text-green-600 dark:text-green-400 font-bold">
                            {completedCount}
                          </span>{" "}
                          / {totalCount} {t("completed")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                      <div className="flex flex-col items-end min-w-[180px] flex-1 md:flex-none group relative">
                        <div className="flex justify-between w-full items-end mb-2 px-1 gap-4">
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
                        <div className="w-full h-3.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden shadow-inner border border-gray-200 dark:border-gray-700 relative">
                          <div
                            className="absolute top-0 left-0 h-full bg-blue-100 dark:bg-blue-900/30 rounded-full transition-all duration-500 ease-out border-r border-blue-200 dark:border-blue-800"
                            style={{ width: `${percentage}%` }}
                          />
                          <div
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                            style={{ width: `${completedPercentage}%` }}
                          />
                        </div>
                      </div>
                      <div className="hidden md:block h-8 w-px bg-gray-200 dark:bg-gray-800"></div>
                      <span className="px-3 py-1 rounded-lg font-bold text-sm bg-gray-50 text-gray-600 border border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 whitespace-nowrap">
                        {assignments.length} {t("part")}
                      </span>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="overflow-x-auto animate-in slide-in-from-top-2 fade-in duration-300 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-black/20">
                      <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                          <tr className="text-gray-400 dark:text-gray-500 text-[11px] uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">
                            <th className="px-6 py-4 font-bold w-16 text-center">
                              #
                            </th>
                            <th className="px-6 py-4 font-bold">
                              {t("resource")}
                            </th>
                            <th className="px-6 py-4 font-bold">
                              {t("assignedTo")}
                            </th>
                            <th className="px-6 py-4 font-bold text-center">
                              {t("status") || "Durum"}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
                          {assignments.map((item) => (
                            <tr
                              key={item.id}
                              className={`transition duration-150 hover:bg-white dark:hover:bg-gray-800/50 ${item.isTaken ? "" : "bg-gray-50/50 dark:bg-gray-900/30"}`}
                            >
                              <td className="px-6 py-4 text-gray-400 dark:text-gray-500 font-mono text-sm font-bold text-center">
                                {item.participantNumber}
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm font-bold text-gray-700 dark:text-gray-200">
                                  {item.resource.type === "PAGED"
                                    ? t("page")
                                    : t("part")}{" "}
                                  {item.startUnit} - {item.endUnit}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                {item.isTaken ? (
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs uppercase shadow-sm border ${item.isCompleted ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30" : "bg-blue-100 text-blue-700 border-blue-200"}`}
                                    >
                                      {item.assignedToName?.substring(0, 2)}
                                    </div>
                                    <span
                                      className={`font-bold text-sm ${item.isCompleted ? "text-green-900 dark:text-green-400" : "text-gray-900 dark:text-gray-200"}`}
                                    >
                                      {item.assignedToName}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                    {t("statusEmpty")}
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-center">
                                {item.isCompleted ? "✅" : "---"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default function MonitorPage() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-transparent">
      <Suspense
        fallback={
          <div className="flex h-screen items-center justify-center bg-transparent">
            <div className="text-gray-500 font-bold animate-pulse">
              {t("loading")}
            </div>
          </div>
        }
      >
        <MonitorContent />
      </Suspense>
    </div>
  );
}
