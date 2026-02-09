/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { use, useEffect, useState, useCallback, useRef } from "react";
import {
  DistributionSession,
  Assignment,
  CevsenBab,
  ViewMode,
  ZikirmatikProps,
} from "@/types";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

// --- ZİKİRMATİK BİLEŞENİ ---
const Zikirmatik = ({
  currentCount,
  onDecrement,
  isModal = false,
  t,
  readOnly = false,
}: ZikirmatikProps) => {
  return (
    <div className={`flex flex-col items-center ${isModal ? "mt-8" : "mt-3"}`}>
      <button
        onClick={readOnly ? undefined : onDecrement}
        disabled={currentCount === 0 || readOnly}
        aria-label={t("decrease")}
        className={`
                    rounded-full flex flex-col items-center justify-center 
                    shadow-lg border-4 transition transform 
                    ${isModal ? "w-32 h-32" : "w-24 h-24"} 
                    
                    ${
                      currentCount === 0
                        ? "bg-green-100 border-green-500 text-green-700 cursor-default"
                        : readOnly
                          ? "bg-gray-200 border-gray-300 text-gray-500 cursor-not-allowed opacity-80"
                          : "bg-blue-600 border-blue-400 text-white hover:bg-blue-700 cursor-pointer active:scale-95"
                    }
                `}
      >
        <span
          className={`${isModal ? "text-4xl" : "text-3xl"} font-bold font-mono`}
        >
          {currentCount}
        </span>
        <span className="text-xs font-light">
          {currentCount === 0 ? t("completed") : readOnly ? "" : t("decrease")}
        </span>
      </button>
      {currentCount > 0 && (
        <p className="text-xs text-gray-500 mt-2">{t("remaining")}</p>
      )}
      {currentCount === 0 && (
        <p className="text-xs text-green-600 font-bold mt-2">
          {t("allahAccept")}
        </p>
      )}
    </div>
  );
};

// --- ANA SAYFA BİLEŞENİ ---
export default function JoinPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { t, language } = useLanguage();
  const { user, token } = useAuth();
  const [fontLevel, setFontLevel] = useState(1);
  const { code } = use(params);

  const fontSizes = {
    ARABIC: ["text-2xl", "text-3xl", "text-4xl", "text-5xl", "text-6xl"],
    LATIN: ["text-lg", "text-xl", "text-2xl", "text-3xl", "text-4xl"],
    MEANING: ["text-base", "text-lg", "text-xl", "text-2xl", "text-3xl"],
  };

  const [userName, setUserName] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [session, setSession] = useState<DistributionSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const [localCounts, setLocalCounts] = useState<Record<number, number>>({});
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {},
  );
  const dataFetchedRef = useRef(false);

  // Modal State'i
  const [readingModalContent, setReadingModalContent] = useState<{
    title: string;
    type: "SIMPLE" | "CEVSEN" | "SALAVAT" | "QURAN_PAGES";
    simpleItems?: string[];
    cevsenData?: CevsenBab[];
    salavatData?: { arabic: string; transcript: string; meaning: string };
    quranPages?: number[];
    isArabic?: boolean;
    startUnit?: number;
    codeKey?: string;
    assignmentId?: number;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<ViewMode>("ARABIC");

  useEffect(() => {
    setIsClient(true);
    if (user) {
      setUserName(user);
    }
  }, [user]);

  useEffect(() => {
    const savedName = localStorage.getItem("guestUserName");
    if (savedName) {
      setUserName(savedName);
    }
  }, []);

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/api/distribution/get/${code}`, {
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        throw new Error(`${t("errorFetchFailed")} ${res.status}`);
      }

      const data: DistributionSession = await res.json();
      setSession(data);

      setLocalCounts((prev) => {
        const newCounts = { ...prev };
        data.assignments.forEach((a: Assignment) => {
          if (a.resource.type === "COUNTABLE" || a.resource.type === "JOINT") {
            const defaultTotal = a.endUnit - a.startUnit + 1;
            const backendCount = a.currentCount;
            if (backendCount !== undefined && backendCount !== null) {
              newCounts[a.id] = backendCount;
            } else {
              if (newCounts[a.id] === undefined) {
                newCounts[a.id] = defaultTotal;
              }
            }
          }
        });
        return newCounts;
      });
    } catch (err: any) {
      console.error("🔴 Error:", err);
      setError(err.message || t("unexpectedError"));
    } finally {
      setLoading(false);
    }
  }, [apiUrl, code, t]);

  useEffect(() => {
    if (dataFetchedRef.current) return;
    dataFetchedRef.current = true;
    fetchSession();
  }, [fetchSession]);

  const decrementCount = async (assignmentId: number) => {
    const currentCount = localCounts[assignmentId];
    if (currentCount === undefined || currentCount <= 0) return;
    const newCount = currentCount - 1;

    setLocalCounts((prev) => ({
      ...prev,
      [assignmentId]: newCount,
    }));

    try {
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      // DÜZELTME: let -> const (Çünkü artık tek satırda tanımlıyoruz ve değiştirmiyoruz)
      const nameToUse = userName || localStorage.getItem("guestUserName");

      if (!token && !nameToUse) {
        alert(t("alertEnterName"));
        setLocalCounts((prev) => ({ ...prev, [assignmentId]: currentCount }));
        return;
      }

      let updateUrl = `${apiUrl}/api/distribution/update-progress/${assignmentId}?count=${newCount}`;
      if (!token && nameToUse)
        updateUrl += `&name=${encodeURIComponent(nameToUse)}`;

      await fetch(updateUrl, {
        method: "POST",
        headers: headers,
        cache: "no-store",
      });

      if (newCount === 0) {
        let completeUrl = `${apiUrl}/api/distribution/complete/${assignmentId}`;
        if (!token && nameToUse)
          completeUrl += `?name=${encodeURIComponent(nameToUse)}`;
        const resComplete = await fetch(completeUrl, {
          method: "POST",
          headers: headers,
        });
        if (resComplete.ok) {
          dataFetchedRef.current = false;
          fetchSession();
        }
      }
    } catch (e) {
      console.error("Save progress failed", e);
      setLocalCounts((prev) => ({ ...prev, [assignmentId]: currentCount }));
    }
  };

  const handleOpenQuran = (assignment: Assignment) => {
    const start = assignment.startUnit;
    const end = assignment.endUnit;
    const pages: number[] = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    setReadingModalContent({
      title: `${t("page") || "Sayfa"} ${start} - ${end}`,
      type: "QURAN_PAGES",
      quranPages: pages,
      assignmentId: assignment.id,
      codeKey: "QURAN",
    });
  };

  const handleTakePart = async (assignmentId: number) => {
    if (!userName) {
      alert(t("alertEnterName"));
      return;
    }
    try {
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(
        `${apiUrl}/api/distribution/take/${assignmentId}?name=${encodeURIComponent(userName)}`,
        { method: "POST", headers: headers },
      );

      if (res.status === 409) {
        alert(t("errorAlreadyTaken"));
        fetchSession();
        return;
      }
      if (!res.ok) {
        const text = await res.text();
        alert(t("alertStatus") + text);
        fetchSession();
        return;
      }
      alert(t("alertTakenSuccess"));
      dataFetchedRef.current = false;
      fetchSession();
    } catch (err) {
      console.error(err);
      alert(t("errorOccurred"));
      fetchSession();
    }
  };

  const handleCancelPart = async (assignmentId: number) => {
    if (!confirm(t("confirmCancel"))) return;

    // DÜZELTME: let -> const
    const nameToUse = user || userName || localStorage.getItem("guestUserName");

    if (!nameToUse) return;

    try {
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      let url = `${apiUrl}/api/distribution/cancel/${assignmentId}`;
      if (!token) url += `?name=${encodeURIComponent(nameToUse)}`;

      const res = await fetch(url, { method: "POST", headers: headers });
      if (res.ok) {
        dataFetchedRef.current = false;
        fetchSession();
      } else {
        alert(t("cancelFailed"));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCompletePart = async (assignmentId: number) => {
    // DÜZELTME: let -> const
    const nameToUse = user || userName || localStorage.getItem("guestUserName");

    if (!nameToUse) return;
    if (!confirm(t("confirmComplete"))) return;

    try {
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      let url = `${apiUrl}/api/distribution/complete/${assignmentId}`;
      if (!token) url += `?name=${encodeURIComponent(nameToUse)}`;

      const res = await fetch(url, { method: "POST", headers: headers });
      if (res.ok) {
        dataFetchedRef.current = false;
        fetchSession();
      } else {
        const msg = await res.text();
        alert(t("errorPrefix") + msg);
      }
    } catch (e) {
      console.error(e);
      alert(t("connectionError"));
    }
  };

  // --- METİN FORMATLAMA YARDIMCILARI ---
  const formatArabicText = (text: string) => {
    const parts = text.split(/([١٢٣٤٥٦٧٨٩٠]+)/g);
    const currentFontClass = fontSizes.ARABIC[fontLevel];
    return (
      <div className={`leading-relaxed ${currentFontClass}`}>
        {parts.map((part, index) => {
          if (/^[١٢٣٤٥٦٧٨٩٠]+$/.test(part)) {
            return (
              <span
                key={index}
                className="inline-flex items-center justify-center mx-1 w-9 h-9 rounded-full bg-amber-100 text-amber-700 border border-amber-300 font-bold text-xl align-middle shadow-sm"
              >
                {part}
              </span>
            );
          }
          if (part.includes("سُبْحَانَكَ")) {
            const subParts = part.split("سُبْحَانَكَ");
            return (
              <span key={index}>
                {subParts[0]} <br />
                <div
                  className={`mt-6 mb-2 p-4 bg-emerald-50 border-r-4 border-emerald-500 rounded-l-lg text-emerald-900 font-bold shadow-inner text-center ${fontSizes.ARABIC[fontLevel]}`}
                >
                  سُبْحَانَكَ {subParts[1]}
                </div>
              </span>
            );
          }
          return <span key={index}>{part}</span>;
        })}
      </div>
    );
  };
  const formatLatinText = (text: string) => {
    const parts = text.split(/(\d+\s)/g);
    const currentFontClass = fontSizes.LATIN[fontLevel];
    return (
      <div
        className={`${currentFontClass} text-gray-800 font-serif leading-relaxed`}
      >
        {parts.map((part, index) => {
          if (/^\d+\s$/.test(part)) {
            return (
              <span
                key={index}
                className="inline-flex items-center justify-center mx-2 w-8 h-8 rounded-full bg-amber-100 text-amber-700 border border-amber-300 font-sans font-bold text-lg align-middle shadow-sm"
              >
                {part.trim()}
              </span>
            );
          }
          if (part.toLowerCase().includes("sübhâneke")) {
            const subParts = part.split(/sübhâneke/i);
            return (
              <span key={index}>
                {subParts[0]} <br />
                <div
                  className={`mt-6 mb-2 p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-lg text-emerald-900 font-bold shadow-inner text-center font-sans ${currentFontClass}`}
                >
                  Sübhâneke {subParts[1]}
                </div>
              </span>
            );
          }
          return <span key={index}>{part}</span>;
        })}
      </div>
    );
  };
  const formatStyledText = (text: string, type: "LATIN" | "MEANING") => {
    const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
    const sizeClass =
      type === "LATIN"
        ? fontSizes.LATIN[fontLevel]
        : fontSizes.MEANING[fontLevel];
    return (
      <div className="space-y-3">
        {lines.map((line, index) => (
          <div
            key={index}
            className={`relative p-4 rounded-xl border flex gap-4 items-start transition-all hover:shadow-md ${type === "LATIN" ? `bg-white border-gray-200 text-gray-800 font-serif italic ${sizeClass}` : `bg-emerald-50 border-emerald-100 text-emerald-900 font-sans ${sizeClass}`}`}
          >
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${type === "LATIN" ? "bg-blue-100 text-blue-700" : "bg-emerald-200 text-emerald-800"}`}
            >
              {index + 1}
            </div>
            <p className="leading-relaxed mt-1">{line.trim()}</p>
          </div>
        ))}
      </div>
    );
  };
  const formatMeaningText = (text: string) => {
    const lines = text.split(/[-•\n]/).filter((line) => line.trim().length > 0);
    const sizeClass = fontSizes.MEANING[fontLevel];
    return (
      <div className="space-y-4">
        {lines.map((line, index) => (
          <div key={index} className="flex items-start group">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] font-bold mt-1 mr-3 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
              {index + 1}
            </div>
            <p
              className={`text-gray-800 leading-relaxed font-medium italic ${sizeClass}`}
            >
              {line.trim()}
            </p>
          </div>
        ))}
      </div>
    );
  };


  const handleOpenReading = (assignment: Assignment) => {
    console.log("handleOpenReading tetiklendi:", assignment); // Debug log

    const resource = assignment.resource;

    // Çeviri Bulma Mantığı
    let translation = resource.translations?.find(
      (trans) => trans.langCode === language,
    );

    if (!translation) {
      translation = resource.translations?.find(
        (trans) => trans.langCode === "tr",
      );
    }
    if (
      !translation &&
      resource.translations &&
      resource.translations.length > 0
    ) {
      translation = resource.translations[0];
    }

    const description = translation?.description;

    if (!description) {
      console.warn("İçerik açıklaması bulunamadı.");
      return;
    }

    const title = translation?.name || resource.codeKey || t("readingTitle");

    // Mantık
    if (resource.type === "COUNTABLE" || resource.type === "JOINT") {
      const parts = description.split("|||");
      if (resource.codeKey === "UHUD") {
        setReadingModalContent({
          title: title,
          type: "CEVSEN",
          cevsenData: [
            {
              babNumber: 1,
              arabic: parts[0]?.trim() || "",
              transcript: parts[1]?.trim() || "",
              meaning: parts[2]?.trim() || "",
            },
          ],
          startUnit: 1,
          codeKey: "UHUD",
          assignmentId: assignment.id,
        });
        setActiveTab("ARABIC");
        return;
      }

      setReadingModalContent({
        title: title,
        type: "SALAVAT",
        salavatData: {
          arabic: parts[0]?.trim() || "",
          transcript: parts[1]?.trim() || "",
          meaning: parts[2]?.trim() || "",
        },
        codeKey: resource.codeKey,
        assignmentId: assignment.id,
      });
      setActiveTab("ARABIC");
    } else if (resource.type === "LIST_BASED") {
      const allParts = description.split("###");
      const selectedPartsRaw = allParts.slice(
        Math.max(0, assignment.startUnit - 1),
        Math.min(allParts.length, assignment.endUnit),
      );

      const parsedData: CevsenBab[] = selectedPartsRaw.map((rawPart, index) => {
        const parts = rawPart.split("|||");
        return {
          babNumber: assignment.startUnit + index,
          arabic: parts[0]?.trim() || "",
          transcript: parts[1]?.trim() || "",
          meaning: parts[2]?.trim() || t("translationPending"),
        };
      });

      setReadingModalContent({
        title: title,
        type: "CEVSEN",
        cevsenData: parsedData,
        startUnit: assignment.startUnit,
        codeKey: resource.codeKey,
        assignmentId: assignment.id,
      });
      setActiveTab("ARABIC");
    } else {
      // Fallback: Basit metin
      setReadingModalContent({
        title: title,
        type: "SIMPLE",
        simpleItems: [description],
        assignmentId: assignment.id,
      });
    }
  };

  const getSplitGroups = () => {
    if (!session) return { distributed: {}, individual: {} };

    const distributed: Record<string, Assignment[]> = {};
    const individual: Record<string, Assignment[]> = {};

    session.assignments.forEach((assignment) => {
      // Dinamik İsimlendirme
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

  const toggleGroup = (groupName: string) => {
    setExpandedGroups((prev) => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  const renderGroupList = (groups: Record<string, Assignment[]>) => {
    return Object.entries(groups).map(([resourceName, assignments]) => {
      const isOpen = expandedGroups[resourceName] || false;
      return (
        <div
          key={resourceName}
          className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-4"
        >
          <button
            onClick={() => toggleGroup(resourceName)}
            className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition duration-200"
          >
            <div className="flex items-center">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center mr-3 ${isOpen ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-600"}`}
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
                <h2 className="text-lg font-bold text-gray-800">
                  {resourceName}
                </h2>
                <span className="text-xs text-gray-500">
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
            <div className="p-4 bg-gray-50 border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {assignments.map((item) => {
                  const defaultTotal = item.endUnit - item.startUnit + 1;
                  const safeCount = localCounts[item.id] ?? defaultTotal;
                  const isAssignedToUser =
                    isClient && userName && item.assignedToName === userName;
                  const isCompleted = item.isCompleted || false;

                  let translation = item.resource.translations?.find(
                    (t) => t.langCode === language,
                  );
                  if (!translation) {
                    translation =
                      item.resource.translations?.find(
                        (t) => t.langCode === "tr",
                      ) || item.resource.translations?.[0];
                  }

                  return (
                    <div
                      key={item.id}
                      className={`relative p-5 rounded-xl border transition-all duration-300 shadow-sm ${isCompleted ? "bg-green-50 border-green-200 opacity-80" : item.isTaken ? (isAssignedToUser ? "bg-blue-50/50 border-blue-200 ring-1 ring-blue-100" : "bg-gray-50 border-gray-200 opacity-75 grayscale-[0.5]") : "bg-white border-gray-100 hover:shadow-md hover:border-emerald-200"}`}
                    >
                      {/* Durum Etiketleri */}
                      <div className="absolute top-4 right-4">
                        {isCompleted ? (
                          <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                            {t("completed")}
                          </span>
                        ) : item.isTaken ? (
                          <span className="bg-gray-200 text-gray-600 text-xs font-bold px-2 py-1 rounded-full">
                            {item.assignedToName}
                          </span>
                        ) : (
                          <span className="bg-emerald-100 text-emerald-600 text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                            {t("statusEmpty")}
                          </span>
                        )}
                      </div>

                      {/* Bilgi Alanı */}
                      <div className="mb-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-gray-800">
                            {item.participantNumber}. {t("person")}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
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
                            <span className="ml-2 font-bold text-blue-600">
                              ({t("total")}: {item.endUnit - item.startUnit + 1}
                              )
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Buton Alanı */}
                      <div className="flex flex-col gap-1 items-center w-full">
                        {item.isTaken ? (
                          <>
                            {/* Zikirmatik varsa göster */}
                            {(item.resource.type === "COUNTABLE" ||
                              item.resource.type === "JOINT") && (
                              <div className="w-full flex flex-col items-center">
                                <Zikirmatik
                                  currentCount={safeCount}
                                  onDecrement={() => decrementCount(item.id)}
                                  t={t}
                                  readOnly={!isAssignedToUser}
                                />
                              </div>
                            )}

                            {/* OKUMA / GİT BUTONU */}
                            {isAssignedToUser ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // KURAN İSE ÖZEL FONKSİYON, DEĞİLSE GENEL
                                  if (item.resource.codeKey === "QURAN") {
                                    handleOpenQuran(item);
                                  } else {
                                    handleOpenReading(item);
                                  }
                                }}
                                className="mt-2 w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-bold shadow transition flex items-center justify-center gap-2"
                              >
                                {t("takeRead") || "Oku"}
                              </button>
                            ) : (
                              <button
                                disabled
                                className="w-full py-2 bg-gray-300 text-gray-600 rounded cursor-not-allowed text-sm font-bold shadow-inner border border-gray-400"
                              >
                                {t("full")}
                              </button>
                            )}
                          </>
                        ) : (
                          <button
                            onClick={() => handleTakePart(item.id)}
                            className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 active:bg-blue-800 text-sm font-bold transition transform hover:scale-[1.02]"
                          >
                            {t("select")}
                          </button>
                        )}
                      </div>

                      {/* Alt Aksiyonlar (Tamamla / İptal) */}
                      {isAssignedToUser && (
                        <div className="mt-3 w-full space-y-2">
                          {!isCompleted && (
                            <button
                              onClick={() => handleCompletePart(item.id)}
                              className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 shadow-md hover:shadow-lg transition-all active:scale-95 font-bold text-sm"
                            >
                              {t("finished")}
                            </button>
                          )}
                          <button
                            onClick={() => handleCancelPart(item.id)}
                            className="w-full group flex items-center justify-center gap-2 py-2 bg-white border-2 border-red-100 text-red-500 rounded-xl hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all duration-200 font-bold text-sm shadow-sm active:scale-95"
                          >
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
      <div className="p-10 text-center font-bold text-gray-600">
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
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 relative">
      <Link
        href="/"
        className="fixed top-4 left-4 z-40 flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-full shadow-md border border-gray-200 hover:bg-gray-100 hover:text-blue-600 transition-all font-bold text-sm"
      >
        <span className="hidden sm:inline">{t("backHome")}</span>
      </Link>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow mb-8 text-center">
          <h1 className="text-3xl font-bold text-red-800 mb-2">
            {t("joinTitle")}
          </h1>
          <div className="mb-6">
            {isClient && user ? (
              <div className="relative">
                <input
                  type="text"
                  value={user}
                  placeholder="text"
                  readOnly
                  className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-500 font-bold cursor-not-allowed focus:outline-none"
                />
                <div className="absolute right-3 top-3 text-green-600">✓</div>
              </div>
            ) : (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded shadow-sm">
                <p className="text-sm text-red-700 font-bold mb-2">
                  {t("joinIntro")}
                </p>
                <input
                  type="text"
                  placeholder={t("yourName")}
                  value={userName || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setUserName(val);
                    localStorage.setItem("guestUserName", val);
                  }}
                  className="w-full p-2 border border-blue-300 rounded font-bold text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            )}
          </div>
        </div>

        {Object.keys(distributed).length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-700 border-b border-gray-300 pb-2 mb-4 flex items-center">
              {t("distributedResources")}
            </h2>
            {renderGroupList(distributed)}
          </div>
        )}

        {Object.keys(individual).length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-700 border-b border-gray-300 pb-2 mb-4 flex items-center">
              {t("individualResources")}
            </h2>
            {renderGroupList(individual)}
          </div>
        )}
      </div>

      {readingModalContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 bg-blue-600 text-white flex flex-col gap-4 shrink-0">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg">
                  {readingModalContent.title}
                </h3>
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-blue-700/50 rounded-lg p-1 mr-2 border border-blue-500/30">
                    <button
                      onClick={() => setFontLevel((p) => Math.max(0, p - 1))}
                      className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded font-bold"
                    >
                      A-
                    </button>
                    <button
                      onClick={() => setFontLevel((p) => Math.min(4, p + 1))}
                      className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded font-bold"
                    >
                      A+
                    </button>
                  </div>
                  <button
                    onClick={() => setReadingModalContent(null)}
                    className="text-white hover:bg-blue-700 p-1 rounded-full"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {(readingModalContent.type === "CEVSEN" ||
                readingModalContent.type === "SALAVAT") && (
                <div className="flex p-1 bg-blue-800/30 rounded-lg">
                  <button
                    onClick={() => setActiveTab("ARABIC")}
                    className={`flex-1 py-2 rounded-md text-sm font-bold transition ${activeTab === "ARABIC" ? "bg-white text-blue-800 shadow" : "text-blue-100 hover:bg-white/10"}`}
                  >
                    {t("tabArabic")}
                  </button>
                  <button
                    onClick={() => setActiveTab("LATIN")}
                    className={`flex-1 py-2 rounded-md text-sm font-bold transition ${activeTab === "LATIN" ? "bg-white text-blue-800 shadow" : "text-blue-100 hover:bg-white/10"}`}
                  >
                    {t("tabLatin")}
                  </button>
                  {readingModalContent.codeKey !== "BEDIR" &&
                    readingModalContent.codeKey !== "UHUD" &&
                    readingModalContent.codeKey !== "TEVHIDNAME" && (
                      <button
                        onClick={() => setActiveTab("MEANING")}
                        className={`flex-1 py-2 rounded-md text-sm font-bold transition ${activeTab === "MEANING" ? "bg-white text-blue-800 shadow" : "text-blue-100 hover:bg-white/10"}`}
                      >
                        {t("tabMeaning")}
                      </button>
                    )}
                </div>
              )}
            </div>

            <div className="p-6 overflow-y-auto text-gray-700 flex-1 bg-white">
              {readingModalContent.type === "SIMPLE" &&
                readingModalContent.simpleItems && (
                  <ul className="space-y-4 list-decimal list-inside">
                    {readingModalContent.simpleItems.map((item, index) => (
                      <li
                        key={index}
                        className="pl-2 border-b border-gray-100 pb-2 hover:bg-gray-50 text-lg"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                )}

              {readingModalContent.type === "QURAN_PAGES" &&
                readingModalContent.quranPages && (
                  <div className="flex flex-col items-center gap-6 bg-amber-50/30 p-2 md:p-6">
                    {readingModalContent.quranPages.map((pageNumber) => {
                      const paddedPage = pageNumber.toString().padStart(3, "0");
                      const imageUrl = `https://verses.quran.com/mus-haf/madani/png_big/${paddedPage}.png`;
                      return (
                        <div
                          key={pageNumber}
                          className="w-full max-w-2xl bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200"
                        >
                          <div className="bg-gray-100 px-4 py-2 border-b text-center text-gray-500 font-bold text-sm">
                            {t("page") || "Sayfa"} {pageNumber}
                          </div>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={imageUrl}
                            alt={`Sayfa ${pageNumber}`}
                            className="w-full h-auto object-contain"
                            loading="lazy"
                          />
                        </div>
                      );
                    })}
                    {readingModalContent.assignmentId && (
                      <div className="sticky bottom-0 bg-white/95 backdrop-blur shadow-2xl border-t border-gray-200 w-full p-4 rounded-xl mt-4 flex justify-center">
                        <div className="flex flex-col items-center">
                          <p className="text-gray-500 text-xs mb-2 font-bold uppercase tracking-wider">
                            {t("clickToCount")}
                          </p>
                          <Zikirmatik
                            currentCount={
                              localCounts[readingModalContent.assignmentId!] ??
                              1
                            }
                            onDecrement={() =>
                              decrementCount(readingModalContent.assignmentId!)
                            }
                            isModal={true}
                            t={t as unknown as (key: string) => string}
                            readOnly={
                              !(
                                isClient &&
                                userName &&
                                session?.assignments.find(
                                  (a) =>
                                    a.id === readingModalContent.assignmentId,
                                )?.assignedToName === userName
                              )
                            }
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

              {readingModalContent.type === "CEVSEN" &&
                readingModalContent.cevsenData && (
                  <div>
                    {readingModalContent.cevsenData.map((bab, index) => (
                      <div
                        key={index}
                        className="mb-2 pb-2 border-b border-gray-100"
                      >
                        <div className="flex justify-center mb-2">
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-bold text-xs">
                            {bab.babNumber}. {t("chapter")}
                          </span>
                        </div>
                        {activeTab === "ARABIC" && (
                          <div
                            className="text-right font-serif text-3xl leading-relaxed"
                            dir="rtl"
                          >
                            {formatArabicText(bab.arabic)}
                          </div>
                        )}
                        {activeTab === "LATIN" && (
                          <div className="text-left font-serif text-xl leading-relaxed">
                            {formatLatinText(bab.transcript)}
                          </div>
                        )}
                        {activeTab === "MEANING" &&
                          !["BEDIR", "UHUD", "TEVHIDNAME"].includes(
                            readingModalContent.codeKey || "",
                          ) && (
                            <div className="bg-emerald-50 p-3 rounded-xl text-sm">
                              {formatMeaningText(bab.meaning)}
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                )}

              {readingModalContent.type === "SALAVAT" &&
                readingModalContent.salavatData && (
                  <div className="flex flex-col items-center w-full">
                    {activeTab === "ARABIC" && (
                      <div
                        className="text-center font-serif text-3xl leading-[4.5rem] py-4"
                        dir="rtl"
                      >
                        {readingModalContent.salavatData.arabic}
                      </div>
                    )}
                    {activeTab === "LATIN" &&
                      formatStyledText(
                        readingModalContent.salavatData.transcript,
                        "LATIN",
                      )}
                    {activeTab === "MEANING" &&
                      formatStyledText(
                        readingModalContent.salavatData.meaning,
                        "MEANING",
                      )}

                    {readingModalContent.assignmentId && (
                      <div className="mt-4 pt-4 border-t w-full flex flex-col items-center bg-gray-50 rounded-b-xl pb-4 shrink-0">
                        <Zikirmatik
                          currentCount={
                            localCounts[readingModalContent.assignmentId!] ??
                            100
                          }
                          onDecrement={() =>
                            decrementCount(readingModalContent.assignmentId!)
                          }
                          isModal={true}
                          t={t as unknown as (key: string) => string}
                          readOnly={false}
                        />
                      </div>
                    )}
                  </div>
                )}
            </div>

            <div className="p-4 bg-gray-50 text-center border-t border-gray-200 shrink-0">
              <button
                onClick={() => setReadingModalContent(null)}
                className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition font-bold"
              >
                {t("close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
