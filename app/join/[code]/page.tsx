/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { use, useEffect, useState, useCallback, useRef } from "react";
import {
  DistributionSession,
  Assignment,
  CevsenBab,
  ZikirmatikProps,
} from "@/types";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

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

type ViewMode = "ARABIC" | "LATIN" | "MEANING";

export default function JoinPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { t } = useLanguage();
  const { user } = useAuth();

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

  const [readingModalContent, setReadingModalContent] = useState<{
    title: string;
    type: "SIMPLE" | "CEVSEN" | "SALAVAT";
    simpleItems?: string[];
    cevsenData?: CevsenBab[];
    salavatData?: { arabic: string; transcript: string; meaning: string };
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
      await fetch(
        `${apiUrl}/api/distribution/update-progress/${assignmentId}?count=${newCount}`,
        {
          method: "POST",
          cache: "no-store",
        },
      );
    } catch (e) {
      console.error("Save progress failed", e);
      setLocalCounts((prev) => ({
        ...prev,
        [assignmentId]: currentCount,
      }));
    }
  };

  const handleOpenQuran = (pageNumber: number) => {
    const url = `https://kuran.hayrat.com.tr/icerik/kuran_hizmetlerimiz/kuran-oku.aspx?sayfa=${pageNumber}`;
    window.open(url, "_blank");
  };

  const handleTakePart = async (assignmentId: number) => {
    if (!userName) {
      alert(t("alertEnterName"));
      return;
    }

    try {
      const res = await fetch(
        `${apiUrl}/api/distribution/take/${assignmentId}?name=${userName}`,
      );

      if (res.status === 409) {
        alert(t("errorAlreadyTaken"));
        fetchSession();
        return;
      }

      if (!res.ok) {
        const text = await res.text();
        const displayMsg = text.includes("{") ? t("errorOccurred") : text;
        alert(t("alertStatus") + displayMsg);
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

    let nameToUse = user;
    if (!nameToUse && userName) nameToUse = userName;

    if (!nameToUse) return;

    try {
      const res = await fetch(
        `${apiUrl}/api/distribution/cancel/${assignmentId}?name=${nameToUse}`,
        {
          method: "POST",
        },
      );

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
    let nameToUse = user;
    if (!nameToUse && userName) nameToUse = userName;

    if (!nameToUse) return;

    if (!confirm(t("confirmComplete"))) return;

    try {
      const res = await fetch(
        `${apiUrl}/api/distribution/complete/${assignmentId}?name=${encodeURIComponent(nameToUse)}`,
        { method: "POST" },
      );

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

  const handleOpenReading = (assignment: Assignment) => {
    const resource = assignment.resource;
    const description = resource.translations?.[0]?.description;
    if (!description) return;

    if (resource.type === "COUNTABLE" || resource.type === "JOINT") {
      const parts = description.split("|||");

      if (resource.codeKey === "UHUD") {
        setReadingModalContent({
          title: resource.translations?.[0]?.name || t("readingTitle"),
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
        title: resource.translations?.[0]?.name || t("readingTitle"),
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
      if (
        resource.codeKey === "BEDIR" ||
        resource.codeKey === "CEVSEN" ||
        resource.codeKey === "UHUD" ||
        resource.codeKey === "TEVHIDNAME"
      ) {
        const allParts = description.split("###");
        const selectedPartsRaw = allParts.slice(
          Math.max(0, assignment.startUnit - 1),
          Math.min(allParts.length, assignment.endUnit),
        );

        const parsedData: CevsenBab[] = selectedPartsRaw.map(
          (rawPart, index) => {
            const parts = rawPart.split("|||");
            return {
              babNumber: assignment.startUnit + index,
              arabic: parts[0]?.trim() || "",
              transcript: parts[1]?.trim() || "",
              meaning: parts[2]?.trim() || t("translationPending"),
            };
          },
        );

        setReadingModalContent({
          title: resource.translations?.[0]?.name || t("readingTitle"),
          type: "CEVSEN",
          cevsenData: parsedData,
          startUnit: assignment.startUnit,
          codeKey: resource.codeKey,
          assignmentId: assignment.id,
        });
        setActiveTab("ARABIC");
      }
    }
  };

  const getSplitGroups = () => {
    if (!session) return { distributed: {}, individual: {} };

    const distributed: Record<string, Assignment[]> = {};
    const individual: Record<string, Assignment[]> = {};

    session.assignments.forEach((assignment) => {
      const resourceName =
        assignment.resource?.translations?.[0]?.name ||
        assignment.resource?.codeKey ||
        t("otherResource");
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

  const renderUhudList = (text: string, type: "ARABIC" | "LATIN") => {
    const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
    const isArabic = type === "ARABIC";
    const dir = isArabic ? "rtl" : "ltr";

    const sizeClass = isArabic
      ? fontSizes.ARABIC[fontLevel]
      : fontSizes.LATIN[fontLevel];

    const fontClass = isArabic
      ? `font-serif leading-[3.5rem] text-emerald-950 ${sizeClass}`
      : `font-serif leading-relaxed text-emerald-900 ${sizeClass}`;

    return (
      <div
        className="bg-emerald-50/80 rounded-2xl border border-emerald-100 p-2 md:p-4 shadow-inner"
        dir={dir}
      >
        <div className="space-y-0 divide-y divide-emerald-200/60">
          {lines.map((line, index) => (
            <div
              key={index}
              className="flex items-start py-3 group hover:bg-emerald-100/80 transition-colors px-3 rounded-lg"
            >
              <div
                className={`
                            flex-shrink-0 w-8 h-8 rounded-full 
                            flex items-center justify-center 
                            text-sm font-bold shadow-sm border
                            mt-1
                            ${isArabic ? "ml-4" : "mr-4"}
                            bg-white text-emerald-700 border-emerald-200
                            group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600
                            transition-all
                        `}
              >
                {index + 1}
              </div>
              <p className={`${fontClass} flex-1 pt-0.5`}>{line.trim()}</p>
            </div>
          ))}
        </div>
      </div>
    );
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

                  return (
                    <div
                      key={item.id}
                      className={`
                            relative p-5 rounded-xl border transition-all duration-300 shadow-sm
                            ${
                              isCompleted
                                ? "bg-green-50 border-green-200 opacity-80"
                                : item.isTaken
                                  ? isAssignedToUser
                                    ? "bg-blue-50/50 border-blue-200 ring-1 ring-blue-100"
                                    : "bg-gray-50 border-gray-200 opacity-75 grayscale-[0.5]"
                                  : "bg-white border-gray-100 hover:shadow-md hover:border-emerald-200"
                            }
                        `}
                    >
                      <div className="absolute top-4 right-4">
                        {isCompleted ? (
                          <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
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
                            </svg>
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
                                  : item.resource.translations?.[0]?.unitName ||
                                    t("part")) + ":"}

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
                      <div className="flex flex-col gap-1 items-center w-full">
                        {" "}
                        {item.isTaken ? (
                          <>
                            {item.resource.type === "COUNTABLE" ||
                            item.resource.type === "JOINT" ? (
                              <div className="w-full flex flex-col items-center">
                                <Zikirmatik
                                  currentCount={safeCount}
                                  onDecrement={() => decrementCount(item.id)}
                                  t={t}
                                  readOnly={!isAssignedToUser}
                                />

                                {isAssignedToUser && (
                                  <button
                                    onClick={() => handleOpenReading(item)}
                                    className="mt-2 text-blue-600 text-sm font-semibold underline hover:text-blue-800"
                                  >
                                    {t("takeRead")} ({t("readText")})
                                  </button>
                                )}
                              </div>
                            ) : item.resource.type === "LIST_BASED" ? (
                              isAssignedToUser ? (
                                <button
                                  onClick={() => handleOpenReading(item)}
                                  className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-bold shadow transition flex items-center justify-center gap-2"
                                >
                                  {t("takeRead")}
                                </button>
                              ) : (
                                <button
                                  disabled
                                  className="w-full py-2 bg-gray-300 text-gray-600 rounded cursor-not-allowed text-sm font-bold shadow-inner border border-gray-400"
                                >
                                  {t("full")}
                                </button>
                              )
                            ) : item.resource.type === "PAGED" ? (
                              isAssignedToUser ? (
                                <button
                                  onClick={() =>
                                    handleOpenQuran(item.startUnit)
                                  }
                                  className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-bold shadow transition flex items-center justify-center gap-2"
                                >
                                  {t("takeRead")} ({t("goToSite")})
                                </button>
                              ) : (
                                <button
                                  disabled
                                  className="w-full py-2 bg-gray-300 text-gray-600 rounded cursor-not-allowed text-sm font-bold shadow-inner border border-gray-400"
                                >
                                  {t("full")}
                                </button>
                              )
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
                      {isAssignedToUser && (
                        <div className="mt-3 w-full space-y-2">
                          {!isCompleted && (
                            <button
                              onClick={() => handleCompletePart(item.id)}
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
                              </svg>
                              {t("finished")}
                            </button>
                          )}

                          <button
                            onClick={() => handleCancelPart(item.id)}
                            className="w-full group flex items-center justify-center gap-2 py-2 bg-white border-2 border-red-100 text-red-500 rounded-xl hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all duration-200 font-bold text-sm shadow-sm active:scale-95"
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
                            </svg>
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
        <div className="bg-white p-6 rounded-lg shadow mb-8 text-center">
          <h1 className="text-3xl font-bold text-red-800 mb-2">
            {t("joinTitle")}
          </h1>
          <div className="mb-6">
            {isClient && user ? (
              <div className="relative">
                <label htmlFor="participant-name" className="sr-only">
                  {t("participantName")}
                </label>
                <input
                  id="participant-name"
                  name="participantName"
                  type="text"
                  value={user}
                  readOnly
                  title={t("participantName")}
                  className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-500 font-bold cursor-not-allowed focus:outline-none"
                />
                <div className="absolute right-3 top-3 text-green-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
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
                  onChange={(e) => setUserName(e.target.value)}
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
                      onClick={() =>
                        setFontLevel((prev) => Math.max(0, prev - 1))
                      }
                      disabled={fontLevel === 0}
                      className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded disabled:opacity-30 transition font-serif font-bold"
                      aria-label="Küçült"
                    >
                      A-
                    </button>
                    <div className="w-px h-4 bg-blue-400/50 mx-1"></div>
                    <button
                      onClick={() =>
                        setFontLevel((prev) => Math.min(4, prev + 1))
                      }
                      disabled={fontLevel === 4}
                      className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded disabled:opacity-30 transition font-serif font-bold text-xl"
                      aria-label="Büyüt"
                    >
                      A+
                    </button>
                  </div>
                  <button
                    onClick={() => setReadingModalContent(null)}
                    aria-label={t("closeWindow")}
                    className="text-white hover:bg-blue-700 p-1 rounded-full transition"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18 18 6M6 6l12 12"
                      />
                    </svg>
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
                        className="pl-2 border-b border-gray-100 pb-2 last:border-0 hover:bg-gray-50 transition text-lg"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                )}

              {readingModalContent.type === "CEVSEN" &&
                readingModalContent.cevsenData && (
                  <div>
                    {readingModalContent.cevsenData.map((bab, index) => (
                      <div
                        key={index}
                        className="mb-2 pb-2 border-b border-gray-100 last:border-0"
                      >
                        <div className="flex justify-center mb-2">
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-bold shadow-sm border border-blue-200 tracking-wide uppercase text-xs">
                            {readingModalContent.codeKey === "CEVSEN"
                              ? `${bab.babNumber}. ${t("chapter")}`
                              : `${bab.babNumber}. ${t("group")}`}
                          </span>
                        </div>

                        {activeTab === "ARABIC" && (
                          <div
                            className={
                              ["UHUD", "BEDIR"].includes(
                                readingModalContent.codeKey || "",
                              )
                                ? ""
                                : "text-right font-serif text-3xl leading-relaxed"
                            }
                            dir="rtl"
                          >
                            {["UHUD", "BEDIR"].includes(
                              readingModalContent.codeKey || "",
                            )
                              ? renderUhudList(bab.arabic, "ARABIC")
                              : formatArabicText(bab.arabic)}
                          </div>
                        )}

                        {activeTab === "LATIN" && (
                          <div
                            className={
                              ["UHUD", "BEDIR"].includes(
                                readingModalContent.codeKey || "",
                              )
                                ? ""
                                : "text-left font-serif text-xl leading-relaxed"
                            }
                          >
                            {["UHUD", "BEDIR"].includes(
                              readingModalContent.codeKey || "",
                            )
                              ? renderUhudList(bab.transcript, "LATIN")
                              : formatLatinText(bab.transcript)}
                          </div>
                        )}

                        {activeTab === "MEANING" &&
                          !["BEDIR", "UHUD", "TEVHIDNAME"].includes(
                            readingModalContent.codeKey || "",
                          ) && (
                            <div className="bg-gradient-to-br from-emerald-50 to-white p-3 rounded-xl border-l-4 border-emerald-500 shadow-inner">
                              <div className="flex items-center mb-2 text-emerald-700">
                                <span className="font-bold text-[10px] uppercase tracking-widest">
                                  {t("translationTitle")}
                                </span>
                              </div>
                              <div className="text-sm">
                                {formatMeaningText(bab.meaning)}
                              </div>
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                )}

              {readingModalContent.type === "SALAVAT" &&
                readingModalContent.salavatData && (
                  <div className="flex flex-col items-center w-full h-full">
                    <div className="w-full flex-1 overflow-y-auto p-2">
                      {activeTab === "ARABIC" && (
                        <>
                          {(
                            readingModalContent.salavatData.arabic || ""
                          ).startsWith("IMAGE_MODE") ? (
                            <div className="flex flex-col gap-4 w-full items-center">
                              {readingModalContent.salavatData.arabic
                                .replace("IMAGE_MODE:::", "")
                                .split(",")
                                .map((imgSrc, index) => (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    key={index}
                                    src={imgSrc.trim()}
                                    alt={`${t("arabicPage")} ${index + 1}`}
                                    className="w-full h-auto rounded-lg shadow-md border border-gray-200"
                                  />
                                ))}
                            </div>
                          ) : (
                            <div
                              className="text-center font-serif text-3xl leading-[4.5rem] py-4"
                              dir="rtl"
                            >
                              {readingModalContent.salavatData.arabic}
                            </div>
                          )}
                        </>
                      )}

                      {activeTab === "LATIN" &&
                        formatStyledText(
                          readingModalContent.salavatData.transcript,
                          "LATIN",
                        )}

                      {activeTab === "MEANING" && (
                        <>
                          {(
                            readingModalContent.salavatData.meaning || ""
                          ).startsWith("IMAGE_MODE") ? (
                            <div className="flex flex-col gap-4 w-full items-center">
                              {readingModalContent.salavatData.meaning
                                .replace("IMAGE_MODE:::", "")
                                .split(",")
                                .map((imgSrc, index) => (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    key={index}
                                    src={imgSrc.trim()}
                                    alt={`${t("meaningPage")} ${index + 1}`}
                                    className="w-full h-auto rounded-lg shadow-md border border-gray-200"
                                  />
                                ))}
                            </div>
                          ) : (
                            formatStyledText(
                              readingModalContent.salavatData.meaning,
                              "MEANING",
                            )
                          )}
                        </>
                      )}
                    </div>

                    {readingModalContent.assignmentId && (
                      <div className="mt-4 pt-4 border-t w-full flex flex-col items-center bg-gray-50 rounded-b-xl pb-4 shrink-0">
                        <p className="text-gray-500 text-sm mb-2 font-semibold">
                          {t("clickToCount")}
                        </p>

                        {(() => {
                          const currentAssignment = session?.assignments.find(
                            (a) => a.id === readingModalContent.assignmentId,
                          );
                          const isOwner =
                            currentAssignment &&
                            currentAssignment.assignedToName === userName;
                          const safeCount =
                            localCounts[readingModalContent.assignmentId!] ??
                            (currentAssignment
                              ? currentAssignment.endUnit -
                                currentAssignment.startUnit +
                                1
                              : 0);

                          return (
                            <Zikirmatik
                              currentCount={safeCount}
                              onDecrement={() =>
                                decrementCount(
                                  readingModalContent.assignmentId!,
                                )
                              }
                              isModal={true}
                              t={t as unknown as (key: string) => string}
                              readOnly={!isOwner}
                            />
                          );
                        })()}
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
