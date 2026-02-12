/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { DistributionSession, Assignment } from "@/types";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React from "react";
import { useAuth } from "@/context/AuthContext";

function MonitorContent() {
  const { t, language } = useLanguage();
  const { token } = useAuth();
  const searchParams = useSearchParams();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [allResources, setAllResources] = useState<any[]>([]);
  const [selectedResourceId, setSelectedResourceId] = useState<string>("");
  const [addingResource, setAddingResource] = useState(false);
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

  useEffect(() => {
    if (token) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/distribution/resources`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => setAllResources(data))
        .catch(console.error);
    }
  }, [token]);

  const handleAddResource = async () => {
    if (!selectedResourceId) return;
    setAddingResource(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/distribution/${code}/add-resource?resourceId=${selectedResourceId}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.ok) {
        alert("Kaynak eklendi!");
        setIsAddModalOpen(false);
        fetchData(code);
      } else {
        const msg = await res.text();
        alert("Hata: " + msg);
      }
    } catch (e) {
      console.error(e);
      alert("Bir hata oluştu.");
    } finally {
      setAddingResource(false);
    }
  };

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
    <div className="min-h-screen bg-gray-50/50 dark:bg-black/90 pb-20 font-sans">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 shadow-sm transition-all">
        <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 text-gray-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400 transition-all group"
          >
            <div className="p-2.5 rounded-xl bg-gray-100 group-hover:bg-emerald-50 dark:bg-gray-800 dark:group-hover:bg-emerald-900/20 transition-colors">
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
            <span className="font-bold text-sm hidden sm:inline tracking-wide">
              {t("backHome")}
            </span>
          </Link>

          <div className="flex flex-col items-center justify-center">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <h1 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
                {t("monitorTitle") || "CANLI TAKİP"}
              </h1>
            </div>
            {session && (
              <h1 className="text-xl md:text-2xl font-black text-gray-800 dark:text-white text-center leading-none">
                {session.description}
              </h1>
            )}
          </div>

          <div className="flex items-center">
            <button
              onClick={() => fetchData(code)}
              disabled={loading}
              className="group flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-xs hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:border-emerald-900 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-400 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 text-gray-400 group-hover:text-emerald-500 transition-colors ${loading ? "animate-spin text-emerald-500" : ""}`}
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

            {session && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition-all shadow-sm active:scale-95 ml-2"
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span>Kaynak Ekle</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-8">
        {session && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="relative bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                {t("total")}
              </p>
              <p className="text-4xl font-black text-gray-800 dark:text-white tracking-tight">
                {stats.total}
              </p>
            </div>

            <div className="relative bg-white dark:bg-gray-900 p-6 rounded-3xl border border-blue-100 dark:border-blue-900/30 shadow-sm overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 text-blue-500 opacity-5 group-hover:opacity-10 transition-opacity">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2">
                    {t("distributed")}
                  </p>
                  <p className="text-4xl font-black text-blue-600 dark:text-blue-400 tracking-tight">
                    {stats.distributed}
                  </p>
                </div>
                <span className="text-lg font-bold text-blue-300 dark:text-blue-500/50 mb-1">
                  %{stats.distPercent}
                </span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full mt-4 overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${stats.distPercent}%` }}
                ></div>
              </div>
            </div>

            <div className="relative bg-white dark:bg-gray-900 p-6 rounded-3xl border border-emerald-100 dark:border-emerald-900/30 shadow-sm overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 text-emerald-500 opacity-5 group-hover:opacity-10 transition-opacity">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-2">
                    {t("completed")}
                  </p>
                  <p className="text-4xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                    {stats.completed}
                  </p>
                </div>
                <span className="text-lg font-bold text-emerald-300 dark:text-emerald-500/50 mb-1">
                  %{stats.compPercent}
                </span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full mt-4 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                  style={{ width: `${stats.compPercent}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {session && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
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
                  className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg"
                >
                  <button
                    onClick={() => toggleResource(resourceName)}
                    className="w-full bg-white dark:bg-gray-900 px-6 py-6 flex flex-col md:flex-row justify-between items-center hover:bg-gray-50/80 dark:hover:bg-gray-800/30 transition duration-200 cursor-pointer gap-6 group"
                  >
                    <div className="flex items-center gap-5 w-full md:w-auto">
                      <div
                        className={`transition-all duration-500 w-12 h-12 rounded-2xl shadow-inner flex items-center justify-center shrink-0 ${isOpen ? "bg-emerald-500 text-white shadow-emerald-500/30 rotate-90" : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"}`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2.5}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8.25 4.5l7.5 7.5-7.5 7.5"
                          />
                        </svg>
                      </div>
                      <div className="text-left">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {resourceName}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="flex items-center gap-1 text-[10px] font-bold bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full">
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
                            {completedCount}
                          </span>
                          <span className="text-xs text-gray-400 font-medium">
                            / {totalCount} {t("part")}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-800/50 md:bg-transparent md:border-0 md:p-0">
                      <div className="flex flex-col items-end min-w-[200px] flex-1 md:flex-none relative">
                        <div className="flex justify-between w-full mb-2 text-xs font-bold">
                          <span className="text-blue-500">
                            Dağıtılan: %{percentage}
                          </span>
                          <span className="text-emerald-600 dark:text-emerald-400">
                            Biten: %{completedPercentage}
                          </span>
                        </div>

                        <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner relative">
                          <div
                            className="absolute top-0 left-0 h-full bg-blue-300 dark:bg-blue-800 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${percentage}%` }}
                          />
                          <div
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all duration-700 ease-out shadow-[0_0_12px_rgba(16,185,129,0.6)]"
                            style={{ width: `${completedPercentage}%` }}
                          >
                            <div className="absolute top-0 right-0 bottom-0 w-0.5 bg-white/30"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="animate-in slide-in-from-top-2 fade-in duration-300 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-black/20">
                      <div className="overflow-x-auto p-2 md:p-6">
                        <table className="w-full text-left border-collapse min-w-[600px]">
                          <thead>
                            <tr className="text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-widest border-b border-gray-100 dark:border-gray-800">
                              <th className="px-4 py-3 text-center w-16">#</th>
                              <th className="px-4 py-3">{t("resource")}</th>
                              <th className="px-4 py-3">{t("assignedTo")}</th>
                              <th className="px-4 py-3 text-right">
                                {t("status") || "Durum"}
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                            {assignments.map((item) => (
                              <tr
                                key={item.id}
                                className={`group transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-900/40 rounded-lg ${item.isCompleted ? "bg-emerald-50/30 dark:bg-emerald-900/10" : ""}`}
                              >
                                <td className="px-4 py-4 text-center">
                                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-mono text-sm font-bold group-hover:bg-white dark:group-hover:bg-gray-700 shadow-sm transition-colors">
                                    {item.participantNumber}
                                  </span>
                                </td>

                                <td className="px-4 py-4">
                                  <div className="flex flex-col">
                                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                                      {item.resource.type === "PAGED"
                                        ? t("page")
                                        : t("part")}{" "}
                                      <span className="text-emerald-600 dark:text-emerald-400">
                                        {item.startUnit} - {item.endUnit}
                                      </span>
                                    </span>
                                  </div>
                                </td>

                                <td className="px-4 py-4">
                                  {item.isTaken ? (
                                    <div className="flex items-center gap-3">
                                      <div
                                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-sm ring-2 ring-white dark:ring-gray-900 ${
                                          item.isCompleted
                                            ? "bg-gradient-to-br from-emerald-400 to-green-600 text-white"
                                            : "bg-gradient-to-br from-blue-400 to-indigo-600 text-white"
                                        }`}
                                      >
                                        {item.assignedToName
                                          ?.substring(0, 2)
                                          .toUpperCase()}
                                      </div>
                                      <span
                                        className={`font-bold text-sm ${item.isCompleted ? "text-emerald-700 dark:text-emerald-400" : "text-gray-700 dark:text-gray-300"}`}
                                      >
                                        {item.assignedToName}
                                      </span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2 opacity-50">
                                      <div className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-700 bg-transparent"></div>
                                      <span className="text-xs font-medium text-gray-400 italic">
                                        {t("statusEmpty") || "Henüz alınmadı"}
                                      </span>
                                    </div>
                                  )}
                                </td>

                                <td className="px-4 py-4 text-right">
                                  {item.isCompleted ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30 shadow-sm">
                                      <svg
                                        className="w-3.5 h-3.5"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                      Tamamlandı
                                    </span>
                                  ) : item.isTaken ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
                                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                                      Okunuyor
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold text-gray-400 bg-gray-50 border border-gray-200 dark:bg-gray-800/50 dark:border-gray-700">
                                      Boşta
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-800">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              Halkaya Kaynak Ekle
            </h3>

            <div className="space-y-4">
              <label
                htmlFor="resourceSelect"
                className="block text-sm font-medium text-gray-500 dark:text-gray-400"
              >
                Eklemek istediğiniz kaynağı seçin:
              </label>

              <select
                id="resourceSelect"
                aria-label="Kaynak Seçimi"
                className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-gray-700 dark:text-gray-200 outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedResourceId}
                onChange={(e) => setSelectedResourceId(e.target.value)}
              >
                <option value="">Seçiniz...</option>
                {allResources.map((res) => {
                  const translation =
                    res.translations?.find(
                      (t: any) => t.langCode === language,
                    ) ||
                    res.translations?.find((t: any) => t.langCode === "tr") ||
                    res.translations?.[0];
                  const name = translation ? translation.name : res.codeKey;
                  return (
                    <option key={res.id} value={res.id}>
                      {name}
                    </option>
                  );
                })}
              </select>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition dark:bg-gray-800 dark:text-gray-400"
                >
                  İptal
                </button>
                <button
                  onClick={handleAddResource}
                  disabled={!selectedResourceId || addingResource}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-500/20 disabled:opacity-50"
                >
                  {addingResource ? "Ekleniyor..." : "Ekle"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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
