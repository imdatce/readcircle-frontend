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
          throw new Error(t("sessionExpired"));
        }
        if (!res.ok) throw new Error("Fetch failed");
        return res.json();
      })
      .then((data) => setResources(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err));
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
    const dataToSave = { selectedResources, participants, customTotals };
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
      const resource = resources.find((r) => r.id.toString() === id);
      if (resource) {
        const isDistributed =
          resource.type !== "JOINT" &&
          resource.codeKey !== "TEFRICIYE" &&
          resource.codeKey !== "MUNCIYE";
        if (isDistributed) setCustomTotals((prev) => ({ ...prev, [id]: "1" }));
      }
    }
  };

  const handleCreate = async () => {
    if (!user || !token) {
      alert(t("loginRequired"));
      return;
    }
    if (selectedResources.length === 0) {
      alert(t("alertSelectResource"));
      return;
    }
    setLoading(true);
    try {
      const payload = {
        resourceIds: selectedResources.map((id) => Number(id)),
        participants: parseInt(participants) || 10,
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
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setCreatedCode(data.code);
      setCreatedLink(`${window.location.origin}/join/${data.code}`);
      setCreatedSessionName(data.description || "");
      sessionStorage.removeItem("adminState");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      alert(err.message || t("errorOccurred"));
    } finally {
      setLoading(false);
    }
  };

  const allSelectedResources = selectedResources
    .map((id) => resources.find((r) => r.id.toString() === id))
    .filter((r): r is Resource => r !== undefined);

  return (
    <div className="min-h-screen pb-20 pt-6 px-4 md:px-8 bg-transparent">
      <div className="max-w-2xl mx-auto mb-8 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors font-bold text-sm dark:text-gray-400"
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
          {t("createDistTitle")}
        </h1>
      </div>

      <div className="max-w-2xl mx-auto space-y-8">
        {!createdLink ? (
          <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 rounded-[2rem] p-6 md:p-8 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Halka İsmi */}
            <div className="mb-6">
              <label className="block text-sm font-bold mb-2 dark:text-gray-300">
                {t("sessionNameLabel")}
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("sessionNamePlaceholder")}
                className="w-full p-3 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-xl outline-none focus:border-blue-500 transition-all dark:text-white"
              />
            </div>

            {/* Katılımcı Sayısı */}
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
                  className="w-full bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-xl pl-4 pr-16 py-3 text-lg font-bold text-gray-800 dark:text-white outline-none focus:border-blue-500 transition-all"
                  placeholder="10"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm pointer-events-none">
                  {t("person")}
                </div>
              </div>
            </div>

            {/* Birleştirilmiş Kaynak Listesi */}
            <div className="mb-8">
              <h3 className="flex items-center gap-2 text-sm font-bold text-blue-600 uppercase tracking-wide mb-4 dark:text-blue-400">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                {t("resourceSelection")}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {resources.map((r) => {
                  const isSelected = selectedResources.includes(
                    r.id.toString(),
                  );
                  return (
                    <div
                      key={r.id}
                      onClick={() => handleCheckboxChange(r.id.toString())}
                      className={`flex items-center p-4 rounded-xl border transition-all duration-200 cursor-pointer select-none ${isSelected ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800" : "bg-white border-gray-100 dark:bg-gray-800 dark:border-gray-700 hover:border-blue-100"}`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${isSelected ? "border-blue-500 bg-blue-500" : "border-gray-300"}`}
                      >
                        {isSelected && (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={4}
                          >
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span
                        className={`ml-3 font-medium text-sm truncate ${isSelected ? "text-blue-700 dark:text-blue-300" : "text-gray-700 dark:text-gray-300"}`}
                      >
                        {getDisplayName(r)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Adet ve Hedef Sayı Girişleri */}
            {allSelectedResources.length > 0 && (
              <div className="mb-8 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-2xl p-5 space-y-4 animate-in zoom-in-95 duration-300">
                <h3 className="flex items-center gap-2 text-sm font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide border-b border-amber-100 dark:border-amber-900/30 pb-2">
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
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                    />
                  </svg>
                  {t("setTargetCounts")}
                </h3>
                {allSelectedResources.map((r) => {
                  const isDistributed =
                    r.type !== "JOINT" &&
                    r.codeKey !== "TEFRICIYE" &&
                    r.codeKey !== "MUNCIYE";
                  const defaultValue = isDistributed
                    ? "1"
                    : r.totalUnits.toString();

                  return (
                    <div
                      key={r.id}
                      className="flex items-center justify-between gap-4"
                    >
                      <label className="text-sm font-bold text-gray-700 dark:text-gray-300 truncate">
                        {getDisplayName(r)}
                      </label>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                          {isDistributed ? t("pieces") : t("default")}
                        </span>
                        <input
                          type="number"
                          min="1"
                          className="w-20 bg-white dark:bg-gray-800 border border-amber-200 dark:border-gray-700 rounded-lg px-2 py-1.5 text-sm font-black text-center outline-none focus:ring-2 focus:ring-amber-500/30 dark:text-white"
                          value={customTotals[r.id.toString()] || ""}
                          onChange={(e) =>
                            setCustomTotals({
                              ...customTotals,
                              [r.id.toString()]: e.target.value,
                            })
                          }
                          placeholder={defaultValue}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <button
              onClick={handleCreate}
              disabled={loading || selectedResources.length === 0}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-blue-600/40 transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2"
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
                    className="h-5 w-5"
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
        ) : (
          /* Başarı Ekranı */
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-green-200 dark:border-green-900 rounded-[2.5rem] p-8 md:p-12 text-center animate-in fade-in zoom-in duration-500 shadow-2xl">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-black mb-2 dark:text-white">
              {t("sessionCreated")}
            </h2>
            {createdSessionName && (
              <p className="text-xl text-blue-600 font-bold mb-8">
                {createdSessionName}
              </p>
            )}

            <div className="bg-gray-50 dark:bg-black/20 p-6 rounded-2xl mb-8 border border-gray-100 dark:border-gray-800">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                {t("sessionCodePlaceholder")}
              </p>
              <span className="text-4xl font-mono font-black text-blue-600 tracking-[0.3em]">
                {createdCode}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(createdCode);
                  alert(t("codeCopied"));
                }}
                className="w-full py-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-2 border-gray-100 dark:border-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
              >
                {t("copyCode")}
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(createdLink);
                  alert(t("copied"));
                }}
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30"
              >
                {t("copyLink")}
              </button>
              <Link
                href={`/join/${createdCode}`}
                className="block w-full py-4 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/30"
              >
                {t("startReading")}
              </Link>
            </div>

            <button
              onClick={() => setCreatedLink("")}
              className="mt-8 text-sm text-gray-400 hover:text-gray-600 underline transition-colors"
            >
              {t("createNewOne")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
