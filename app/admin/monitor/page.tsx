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
      if (!res.ok) throw new Error(t("errorInvalidCode"));
      const data: DistributionSession = await res.json();
      setSession(data);
    } catch (err) {
      setError(t("errorInvalidCode"));
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
  }, [searchParams]);

  const handleTrackClick = () => {
    fetchData(code);
  };

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
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            {t("monitorTitle")}
          </h1>
        </div>

        <Link
          href="/"
          className="fixed top-4 left-4 z-50 flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-full shadow-md border border-gray-200 hover:bg-gray-100 hover:text-blue-600 transition-all font-bold text-sm"
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
          <span className="hidden sm:inline">
            {t("backHome") || "Ana Sayfa"}
          </span>
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg mb-6 border border-red-200 font-bold text-center">
          {error}
        </div>
      )}

      {session && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {Object.entries(groupedData).map(([resourceName, assignments]) => {
            const isOpen = expandedResources[resourceName];

            const totalCount = assignments.length;
            const takenCount = assignments.filter((a) => a.isTaken).length;
            const percentage = Math.round((takenCount / totalCount) * 100);

            return (
              <div
                key={resourceName}
                className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => toggleResource(resourceName)}
                  className="w-full bg-gray-50 px-6 py-5 border-b border-gray-200 flex justify-between items-center hover:bg-gray-100 transition duration-150 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`transition-transform duration-300 ${isOpen ? "rotate-90" : "rotate-0"}`}
                    >
                      <svg
                        className="w-5 h-5 text-gray-500"
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
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                      {resourceName}
                    </h3>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="hidden md:flex flex-col items-end mr-4">
                      <span className="text-xs text-gray-500 font-bold mb-1">
                        {t("occupancy")}:{" "}
                        <span
                          className={
                            percentage === 100
                              ? "text-green-600"
                              : "text-blue-600"
                          }
                        >
                          %{percentage}
                        </span>
                      </span>

                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${percentage === 100 ? "bg-green-500" : "bg-blue-500"}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full font-bold text-sm border ${isOpen ? "bg-blue-600 text-white border-blue-600" : "bg-white text-blue-600 border-blue-200"}`}
                    >
                      {assignments.length} {t("part")}
                    </span>
                  </div>
                </button>

                {isOpen && (
                  <div className="overflow-x-auto animate-in slide-in-from-top-2 fade-in duration-300">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-gray-500 text-xs uppercase tracking-wider border-b">
                          <th className="px-6 py-3 font-semibold">#</th>
                          <th className="px-6 py-3 font-semibold">
                            {t("resource")}
                          </th>
                          <th className="px-6 py-3 font-semibold">
                            {t("assignedTo")}
                          </th>
                          <th className="px-6 py-3 font-semibold text-center">
                            {t("progress")}
                          </th>
                          <th className="px-6 py-3 font-semibold text-right">
                            {t("statusHeader")}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {assignments.map((item) => (
                          <tr
                            key={item.id}
                            className={`hover:bg-gray-50 transition ${item.isTaken ? "bg-white" : "bg-slate-50"}`}
                          >
                            <td className="px-6 py-4 text-gray-500 font-mono text-sm">
                              {item.participantNumber}
                            </td>
                            <td className="px-6 py-4 text-gray-800 font-medium">
                              {item.resource.type === "JOINT"
                                ? t("target")
                                : (item.resource.type === "PAGED"
                                    ? t("page")
                                    : t("part")) +
                                  ` ${item.startUnit} - ${item.endUnit}`}
                            </td>
                            <td className="px-6 py-4">
                              {item.isTaken ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-xs uppercase">
                                    {item.assignedToName?.substring(0, 2)}
                                  </div>
                                  <span className="font-bold text-gray-900">
                                    {item.assignedToName}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-gray-400 italic text-sm">
                                  -
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-center">
                              {item.resource.type === "COUNTABLE" ||
                              item.resource.type === "JOINT" ? (
                                <div className="flex flex-col items-center">
                                  <span className="text-xs text-gray-400 font-bold mb-1">
                                    {t("targetLabel")}:{" "}
                                    {item.endUnit - item.startUnit + 1}
                                  </span>

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
                                        className={`inline-block px-3 py-1 rounded font-bold text-sm border 
                                                                                ${
                                                                                  isFinished
                                                                                    ? "bg-green-100 text-green-700 border-green-300"
                                                                                    : "bg-amber-50 text-amber-800 border-amber-200"
                                                                                }`}
                                      >
                                        {displayVal}
                                        <span className="text-[10px] ml-1 uppercase">
                                          {t("remaining") || "KALAN"}
                                        </span>
                                      </span>
                                    );
                                  })()}
                                </div>
                              ) : (
                                <span className="text-gray-400 text-xs">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              {item.isTaken ? (
                                <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200">
                                  <svg
                                    className="w-3 h-3"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  {t("statusTaken")}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs font-bold border border-gray-200">
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
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <Suspense
        fallback={<div className="text-center p-10">Yükleniyor...</div>}
      >
        <MonitorContent />
      </Suspense>
    </div>
  );
}
