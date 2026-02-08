"use client";

import { useState, useEffect, Suspense } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { DistributionSession, Assignment } from "@/types";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function MonitorContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();

  const [code, setCode] = useState("");
  const [session, setSession] = useState<DistributionSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedResources, setExpandedResources] = useState<
    Record<string, boolean>
  >({});

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const fetchData = async (codeToFetch: string) => {
    if (!codeToFetch) return;
    setLoading(true);
    setError("");
    setSession(null);
    setExpandedResources({});

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

      const initialExpanded: Record<string, boolean> = {};

       if (data.assignments && Array.isArray(data.assignments)) {
        data.assignments.forEach((a) => {
          if (a.resource) {
            const name =
              a.resource.translations?.[0]?.name || a.resource.codeKey;
            initialExpanded[name] = true;
          }
        });
      }

      setExpandedResources(initialExpanded);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      const name = a.resource.translations?.[0]?.name || a.resource.codeKey;
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

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <span className="w-2 h-8 bg-blue-600 rounded-full inline-block"></span>
            {t("monitorTitle")}
          </h1>
          {session && (
            <p className="text-gray-500 mt-1 ml-4 font-mono text-sm">
              {t("distCode")}:{" "}
              <span className="font-bold text-gray-800">
                {session.code}
              </span>
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => fetchData(code)}
            className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 border border-blue-200 rounded-full font-bold text-sm hover:bg-blue-50 transition shadow-sm"
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
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {t("refresh")}
          </button>

          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-full shadow-md hover:bg-gray-900 transition-all font-bold text-sm"
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span className="hidden sm:inline">{t("backHome")}</span>
          </Link>
        </div>
      </div>

      {loading && (
        <div className="text-center p-12 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">{t("loading")}</p>
        </div>
      )}

      {error && !session && (
        <div className="p-6 bg-red-50 text-red-700 rounded-xl mb-6 border border-red-200 font-bold text-center shadow-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 mx-auto mb-2 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          {error}
        </div>
      )}

      {session && !loading && (
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
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-md"
              >
                <button
                  onClick={() => toggleResource(resourceName)}
                  className="w-full bg-gray-50/50 px-6 py-5 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center hover:bg-gray-50 transition duration-150 cursor-pointer gap-4"
                >
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div
                      className={`transition-transform duration-300 p-1 rounded-full bg-white border shadow-sm ${isOpen ? "rotate-90 text-blue-600 border-blue-200" : "rotate-0 text-gray-400 border-gray-200"}`}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-bold text-gray-800">
                        {resourceName}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {completedCount} / {totalCount} {t("completed")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                    <div className="flex flex-col items-end min-w-[120px]">
                      <div className="flex justify-between w-full text-xs font-bold mb-1.5">
                        <span className="text-gray-400">{t("occupancy")}</span>
                        <span
                          className={
                            percentage === 100
                              ? "text-green-600"
                              : "text-blue-600"
                          }
                        >
                          %{percentage}
                        </span>
                      </div>

                      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                        <div className="relative w-full h-full">
                          <div
                            className="absolute top-0 left-0 h-full bg-blue-400 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                          <div
                            className="absolute top-0 left-0 h-full bg-green-500 rounded-full transition-all duration-700"
                            style={{ width: `${completedPercentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="hidden md:block h-8 w-px bg-gray-200"></div>

                    <span
                      className={`px-3 py-1 rounded-lg font-bold text-sm border shadow-sm ${isOpen ? "bg-white text-blue-700 border-blue-200" : "bg-gray-50 text-gray-600 border-gray-200"}`}
                    >
                      {assignments.length} {t("part")}
                    </span>
                  </div>
                </button>

                {isOpen && (
                  <div className="overflow-x-auto animate-in slide-in-from-top-2 fade-in duration-300">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/50 text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100">
                          <th className="px-6 py-3 font-bold w-16">#</th>
                          <th className="px-6 py-3 font-bold">
                            {t("resource")}
                          </th>
                          <th className="px-6 py-3 font-bold">
                            {t("assignedTo")}
                          </th>
                          <th className="px-6 py-3 font-bold text-center">
                            {t("progress")}
                          </th>
                          <th className="px-6 py-3 font-bold text-right">
                            {t("statusHeader")}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {assignments.map((item) => (
                          <tr
                            key={item.id}
                            className={`hover:bg-blue-50/30 transition duration-150 ${item.isTaken ? "bg-white" : "bg-slate-50/30"}`}
                          >
                            <td className="px-6 py-4 text-gray-400 font-mono text-sm font-semibold">
                              {item.participantNumber}
                            </td>
                            <td className="px-6 py-4 text-gray-700 font-medium">
                              {item.resource.type === "JOINT"
                                ? t("target")
                                : (item.resource.type === "PAGED"
                                    ? t("page")
                                    : t("part")) +
                                  ` ${item.startUnit} - ${item.endUnit}`}
                            </td>
                            <td className="px-6 py-4">
                              {item.isTaken ? (
                                <div className="flex items-center gap-2.5">
                                  <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs uppercase shadow-sm border ${
                                      item.isCompleted
                                        ? "bg-green-100 text-green-700 border-green-200"
                                        : "bg-blue-100 text-blue-700 border-blue-200"
                                    }`}
                                  >
                                    {item.assignedToName?.substring(0, 2)}
                                  </div>
                                  <span
                                    className={`font-bold ${item.isCompleted ? "text-green-900" : "text-gray-900"}`}
                                  >
                                    {item.assignedToName}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-gray-300 italic text-sm pl-2">
                                  -
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-center">
                              {item.resource.type === "COUNTABLE" ||
                              item.resource.type === "JOINT" ? (
                                <div className="flex flex-col items-center">
                                  {(() => {
                                    const progressItem = item as unknown as {
                                      currentCount?: number;
                                    };
                                    const current = progressItem.currentCount;
                                    const total =
                                      item.endUnit - item.startUnit + 1;
                                    const displayVal =
                                      current !== undefined && current !== null
                                        ? current
                                        : total;
                                    const isFinished = displayVal === 0;

                                    return (
                                      <span
                                        className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold border 
                                            ${
                                              isFinished
                                                ? "bg-green-50 text-green-600 border-green-200"
                                                : "bg-amber-50 text-amber-600 border-amber-200"
                                            }`}
                                      >
                                        {displayVal}
                                        <span className="text-[9px] ml-1 opacity-70 uppercase">
                                          {t("remaining")}
                                        </span>
                                      </span>
                                    );
                                  })()}
                                </div>
                              ) : (
                                <span className="text-gray-300 text-xs">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              {item.isCompleted ? (
                                <span className="inline-flex items-center gap-1.5 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm shadow-green-200">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-3.5 h-3.5"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  {t("completed")}
                                </span>
                              ) : item.isTaken ? (
                                <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold border border-blue-200">
                                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                                  {t("statusTaken")}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-400 px-3 py-1 rounded-full text-xs font-bold border border-gray-200">
                                  {t("statusEmpty")}
                                </span>
                              )}
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
    </div>
  );
}

export default function MonitorPage() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-gray-50/50">
      <Suspense
        fallback={
          <div className="text-center p-10 text-gray-500">{t("loading")}</div>
        }
      >
        <MonitorContent />
      </Suspense>
    </div>
  );
}
