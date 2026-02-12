/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { Resource } from "@/types";
import Link from "next/link";

export default function AdminPage() {
  const { t, language } = useLanguage();
  const { user, token, logout } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [description, setDescription] = useState("");
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [participants, setParticipants] = useState<string>("10");
  const [customTotals, setCustomTotals] = useState<Record<string, string>>({});
  const [createdLink, setCreatedLink] = useState<string>("");
  const [createdCode, setCreatedCode] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [createdSessionName, setCreatedSessionName] = useState<string>("");
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

  const getDisplayName = (resource: Resource) => {
    let translation = resource.translations?.find(
      (tr) => tr.langCode === language,
    );
    if (!translation) {
      translation = resource.translations?.find((tr) => tr.langCode === "tr");
    }
    return translation ? translation.name : resource.codeKey;
  };

  useEffect(() => {
    if (!apiUrl || !token) return;

    const headers = { Authorization: `Bearer ${token}` };

    fetch(`${apiUrl}/api/distribution/resources`, { headers })
      .then((res) => {
        if (res.status === 401 || res.status === 403) {
          logout();
          throw new Error(t("sessionExpired") || "Session expired");
        }
        if (!res.ok) throw new Error("Fetch failed");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) setResources(data);
        else setResources([]);
      })
      .catch((err) => {
        console.error(err);
        setResources([]);
      });
  }, [apiUrl, token, logout, t]);

  useEffect(() => {
    const savedData = sessionStorage.getItem("adminState");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.selectedResources)
          setSelectedResources(parsed.selectedResources);
        if (parsed.participants) setParticipants(String(parsed.participants));
        if (parsed.customTotals) setCustomTotals(parsed.customTotals);
      } catch (e) {
        console.error("Storage error", e);
      }
    }
  }, []);

  useEffect(() => {
    const dataToSave = {
      selectedResources,
      participants,
      customTotals,
    };
    sessionStorage.setItem("adminState", JSON.stringify(dataToSave));
  }, [selectedResources, participants, customTotals]);

  const handleCheckboxChange = (id: string) => {
    if (selectedResources.includes(id)) {
      setSelectedResources(selectedResources.filter((rId) => rId !== id));
      const newTotals = { ...customTotals };
      delete newTotals[id];
      setCustomTotals(newTotals);
    } else {
      setSelectedResources([...selectedResources, id]);
    }
  };

  const handleCreate = async () => {
    if (!user || !token) {
      alert(t("loginRequired"));
      return;
    }
    if (selectedResources.length === 0) return alert(t("alertSelectResource"));

    setLoading(true);
    try {
      const participantsNum = parseInt(participants) || 10;
      const payload = {
        resourceIds: selectedResources.map((id) => Number(id)),
        participants: participantsNum,
        customTotals: customTotals,
        description: description,
      };

      const res = await fetch(`${apiUrl}/api/distribution/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error ${res.status}: ${errorText}`);
      }

      const data = await res.json();
      const link = `${window.location.origin}/join/${data.code}`;
      setCreatedCode(data.code);
      setCreatedLink(link);
      setCreatedSessionName(data.description || "");
      sessionStorage.removeItem("adminState");

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      console.error(err);
      alert(err.message || t("errorOccurred"));
    } finally {
      setLoading(false);
    }
  };

  const safeResources = Array.isArray(resources) ? resources : [];
  const distributedResources = safeResources.filter((r) => r.type !== "JOINT");
  const individualResources = safeResources.filter((r) => r.type === "JOINT");

  const selectedResourcesWithInput = selectedResources
    .map((id) => safeResources.find((r) => r.id.toString() === id))
    .filter(
      (r): r is Resource =>
        r !== undefined && (r.type === "COUNTABLE" || r.type === "JOINT"),
    );

  const ResourceItem = ({ r, isSelected, onClick }: any) => (
    <div
      onClick={onClick}
      className={`group flex items-center p-4 rounded-xl border transition-all duration-200 cursor-pointer mb-3 select-none ${
        isSelected
          ? "bg-blue-50 border-blue-200 shadow-sm dark:bg-blue-900/20 dark:border-blue-800"
          : "bg-white border-gray-100 hover:border-blue-100 hover:shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:hover:border-gray-600"
      }`}
    >
      <div
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
          isSelected
            ? "border-blue-500 bg-blue-500 dark:border-blue-400 dark:bg-blue-400"
            : "border-gray-300 group-hover:border-blue-400 dark:border-gray-600"
        }`}
      >
        {isSelected && (
          <svg
            className="w-4 h-4 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </div>
      <span
        className={`ml-3 font-medium text-sm md:text-base ${
          isSelected
            ? "text-blue-700 dark:text-blue-300"
            : "text-gray-700 dark:text-gray-300"
        }`}
      >
        {getDisplayName(r)}
      </span>
    </div>
  );

  return (
    <div className="min-h-screen pb-20 pt-6 px-4 md:px-8 bg-transparent">
      <div className="max-w-2xl mx-auto mb-8 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors font-bold text-sm dark:text-gray-400 dark:hover:text-blue-400"
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
          {t("backHome")}
        </Link>
        <h1 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-emerald-600 dark:from-blue-400 dark:to-emerald-400">
          {t("createDistTitle") || "Yeni Halka"}
        </h1>
      </div>

      <div className="max-w-2xl mx-auto space-y-8">
        {createdLink && (
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-green-200 dark:border-green-900 rounded-[2rem] p-8 shadow-xl shadow-green-900/5 animate-in fade-in slide-in-from-top-4">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 dark:bg-green-900/30 dark:text-green-400">
              <svg
                className="w-8 h-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-2">
              {t("sessionCreated")}:
            </h2>
            {createdSessionName && (
              <p className="text-4xl font-medium text-blue-600 dark:text-blue-400 text-center -mt-1 mb-6">
                {createdSessionName}
              </p>
            )}

            <div className="bg-gray-50 dark:bg-black/20 p-4 rounded-xl border border-gray-200 dark:border-gray-800 mb-6 flex flex-col items-center">
              <span className="text-sm font-bold text-gray-400 mb-1">
                {t("sessionCodePlaceholder")}:
              </span>
              <span className="text-3xl font-mono font-black text-blue-600 dark:text-blue-400 tracking-widest">
                {createdCode}
              </span>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(createdCode);
                  alert(t("codeCopied"));
                }}
                className="w-full py-4 bg-white text-gray-800 border-2 border-gray-100 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-200 transition-all active:scale-95 flex items-center justify-center gap-2 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                  />
                </svg>
                {t("copyCode")}
              </button>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(createdLink);
                  alert(t("copied"));
                }}
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
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
                    d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
                {t("copyLink")}
              </button>

              <Link
                href={`/admin/monitor?code=${createdCode}`}
                className="w-full py-4 bg-white text-gray-700 border-2 border-gray-200 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95 flex items-center justify-center gap-2 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700"
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
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                {t("trackButton")}
              </Link>
            </div>

            <Link
              href={`/join/${createdCode}`}
              className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
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
              {t("startReading") || "Okumaya Başla"}
            </Link>
            <button
              onClick={() => {
                setCreatedLink("");
                setCreatedCode("");
                setSelectedResources([]);
                setCustomTotals({});
              }}
              className="mt-6 text-sm text-gray-400 hover:text-gray-600 underline w-full text-center"
            >
              {t("createNewOne") || "Yeni bir tane daha oluştur"}
            </button>
          </div>
        )}

        {!createdLink && (
          <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 rounded-[2rem] p-6 md:p-8 shadow-xl">
            <div className="mb-4">
              <label className="block text-sm font-bold mb-2 dark:text-gray-300">
                Halka İsmi (İsteğe Bağlı)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Örn: Ramazan Hatmi, Aile Salavatı..."
                className="w-full p-3 border rounded-xl dark:bg-gray-800 dark:border-gray-700"
              />
            </div>

            <div className="mb-8">
              <label className="block text-sm font-bold text-gray-500 uppercase tracking-wide mb-3 dark:text-gray-400">
                {t("participantCount")}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  value={participants}
                  onChange={(e) => setParticipants(e.target.value)}
                  className="w-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl pl-4 pr-16 py-3 text-lg font-bold text-gray-800 dark:text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="10"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm pointer-events-none">
                  {t("person")}
                </div>
              </div>
            </div>

            {distributedResources.length > 0 && (
              <div className="mb-8">
                <h3 className="flex items-center gap-2 text-sm font-bold text-blue-600 uppercase tracking-wide mb-4 dark:text-blue-400">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  {t("sharedResources")}
                </h3>
                <div className="grid grid-cols-1 gap-1">
                  {distributedResources.map((r) => (
                    <ResourceItem
                      key={r.id}
                      r={r}
                      isSelected={selectedResources.includes(r.id.toString())}
                      onClick={() => handleCheckboxChange(r.id.toString())}
                    />
                  ))}
                </div>
              </div>
            )}

            {individualResources.length > 0 && (
              <div className="mb-8">
                <h3 className="flex items-center gap-2 text-sm font-bold text-emerald-600 uppercase tracking-wide mb-4 dark:text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  {t("fixedResources")}
                </h3>
                <div className="grid grid-cols-1 gap-1">
                  {individualResources.map((r) => (
                    <ResourceItem
                      key={r.id}
                      r={r}
                      isSelected={selectedResources.includes(r.id.toString())}
                      onClick={() => handleCheckboxChange(r.id.toString())}
                    />
                  ))}
                </div>
              </div>
            )}

            {selectedResourcesWithInput.length > 0 && (
              <div className="mb-8 animate-in fade-in slide-in-from-top-2">
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-5">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-4 border-b border-amber-200 dark:border-amber-800/50 pb-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {t("setTargetCounts")}
                  </h3>

                  <div className="space-y-4">
                    {selectedResourcesWithInput.map((r) => (
                      <div
                        key={r.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                          {getDisplayName(r)}
                        </label>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-medium text-gray-400">
                            {t("default")}: {r.totalUnits}
                          </span>
                          <input
                            type="number"
                            placeholder={r.totalUnits.toString()}
                            className="w-24 bg-white dark:bg-gray-800 border border-amber-300 dark:border-amber-700 rounded-lg px-3 py-1.5 text-sm font-bold text-center focus:ring-2 focus:ring-amber-500/50 outline-none"
                            value={customTotals[r.id.toString()] || ""}
                            onChange={(e) =>
                              setCustomTotals({
                                ...customTotals,
                                [r.id.toString()]: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

             <button
              onClick={handleCreate}
              disabled={loading || selectedResources.length === 0}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-600/20 hover:shadow-blue-600/40 transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  {t("processing")}
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {t("createButton")}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
