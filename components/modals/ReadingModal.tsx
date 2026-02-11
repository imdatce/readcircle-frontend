/* eslint-disable @next/next/no-img-element */
import React, { useState } from "react";
import { CevsenBab, ViewMode, DistributionSession } from "@/types";
import { useLanguage } from "@/context/LanguageContext";
import Zikirmatik from "../common/Zikirmatik";
import {
  formatArabicText,
  formatLatinText,
  formatMeaningText,
  formatStyledText,
  renderUhudList,
} from "@/utils/text-formatter";

export interface ReadingModalContent {
  title: string;
  type: "SIMPLE" | "CEVSEN" | "SALAVAT" | "QURAN";
  simpleItems?: string[];
  cevsenData?: CevsenBab[];
  salavatData?: { arabic: string; transcript: string; meaning: string };
  isArabic?: boolean;
  startUnit?: number;
  codeKey?: string;
  endUnit?: number;
  currentUnit?: number;
  assignmentId?: number;
}

interface ReadingModalProps {
  content: ReadingModalContent;
  onClose: () => void;
  onUpdateContent: (newContent: ReadingModalContent | null) => void;
  session?: DistributionSession;
  userName: string | null;
  localCounts: Record<number, number>;
  onDecrementCount: (id: number) => void;
  t: (key: string) => string;
}

const ReadingModal: React.FC<ReadingModalProps> = ({
  content,
  onClose,
  onUpdateContent,
  session,
  userName,
  localCounts,
  onDecrementCount,
  t,
}) => {
  const [fontLevel, setFontLevel] = useState(1);
  const { language } = useLanguage();

  const getDisplayTitle = () => {
    if (!content.codeKey) return content.title;
    return t(`resource_${content.codeKey}`);
  };

  const [activeTab, setActiveTab] = useState<ViewMode>("ARABIC");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] dark:bg-gray-900">
        <div className="p-4 bg-blue-600 text-white flex flex-col gap-4 shrink-0">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg">{getDisplayTitle()}</h3>
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-blue-700/50 rounded-lg p-1 mr-2 border border-blue-500/30">
                <button
                  onClick={() => setFontLevel((prev) => Math.max(0, prev - 1))}
                  disabled={fontLevel === 0}
                  className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded disabled:opacity-30 transition font-serif font-bold"
                >
                  A-
                </button>
                <div className="w-px h-4 bg-blue-400/50 mx-1"></div>
                <button
                  onClick={() => setFontLevel((prev) => Math.min(4, prev + 1))}
                  disabled={fontLevel === 4}
                  className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded disabled:opacity-30 transition font-serif font-bold text-xl"
                >
                  A+
                </button>
              </div>
              <button
                onClick={onClose}
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

          {(content.type === "CEVSEN" || content.type === "SALAVAT") && (
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
              {content.codeKey !== "BEDIR" &&
                content.codeKey !== "UHUD" &&
                content.codeKey !== "TEVHIDNAME" && (
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

        <div className="p-6 overflow-y-auto text-gray-700 flex-1 bg-white dark:bg-gray-900 dark:text-gray-200">
          {content.type === "SIMPLE" && content.simpleItems && (
            <ul className="space-y-4 list-decimal list-inside">
              {content.simpleItems.map((item, index) => (
                <li
                  key={index}
                  className="pl-2 border-b border-gray-100 pb-2 last:border-0 hover:bg-gray-50 transition text-lg dark:border-gray-800 dark:hover:bg-gray-800"
                >
                  {item}
                </li>
              ))}
            </ul>
          )}

          {content.type === "CEVSEN" && content.cevsenData && (
            <div>
              {content.cevsenData.map((bab, index) => (
                <div
                  key={index}
                  className="mb-2 pb-2 border-b border-gray-100 last:border-0 dark:border-gray-800"
                >
                  <div className="flex justify-center mb-2">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-bold shadow-sm border border-blue-200 tracking-wide uppercase text-xs dark:bg-blue-900 dark:text-blue-200 dark:border-blue-800">
                      {content.codeKey === "CEVSEN"
                        ? `${bab.babNumber}. ${t("chapter")}`
                        : `${bab.babNumber}. ${t("group")}`}
                    </span>
                  </div>

                  {activeTab === "ARABIC" && (
                    <div
                      className={
                        ["UHUD", "BEDIR"].includes(content.codeKey || "")
                          ? ""
                          : "text-right font-serif text-3xl leading-relaxed"
                      }
                      dir="rtl"
                    >
                      {["UHUD", "BEDIR"].includes(content.codeKey || "")
                        ? renderUhudList(bab.arabic, "ARABIC", fontLevel)
                        : formatArabicText(bab.arabic, fontLevel)}
                    </div>
                  )}

                  {activeTab === "LATIN" && (
                    <div
                      className={
                        ["UHUD", "BEDIR"].includes(content.codeKey || "")
                          ? ""
                          : "text-left font-serif text-xl leading-relaxed"
                      }
                    >
                      {["UHUD", "BEDIR"].includes(content.codeKey || "")
                        ? renderUhudList(bab.transcript, "LATIN", fontLevel)
                        : formatLatinText(bab.transcript, fontLevel)}
                    </div>
                  )}

                  {activeTab === "MEANING" &&
                    !["BEDIR", "UHUD", "TEVHIDNAME"].includes(
                      content.codeKey || "",
                    ) && (
                      <div className="bg-gradient-to-br from-emerald-50 to-white p-3 rounded-xl border-l-4 border-emerald-500 shadow-inner dark:from-emerald-900/10 dark:to-gray-900 dark:border-emerald-700">
                        <div className="flex items-center mb-2 text-emerald-700 dark:text-emerald-400">
                          <span className="font-bold text-[10px] uppercase tracking-widest">
                            {t("translationTitle")}
                          </span>
                        </div>
                        <div className="text-sm">
                          {formatMeaningText(bab.meaning, fontLevel)}
                        </div>
                      </div>
                    )}
                </div>
              ))}
            </div>
          )}

          {content.type === "SALAVAT" && content.salavatData && (
            <div className="flex flex-col items-center w-full h-full">
              <div className="w-full flex-1 overflow-y-auto p-2">
                {activeTab === "ARABIC" && (
                  <>
                    {(content.salavatData.arabic || "").startsWith(
                      "IMAGE_MODE",
                    ) ? (
                      <div className="flex flex-col gap-4 w-full items-center">
                        {content.salavatData.arabic
                          .replace("IMAGE_MODE:::", "")
                          .split(",")
                          .map((imgSrc, index) => (
                            <img
                              key={index}
                              src={imgSrc.trim()}
                              alt={`${t("arabicPage")} ${index + 1}`}
                              className="w-full h-auto rounded-lg shadow-md border border-gray-200 dark:border-gray-700"
                            />
                          ))}
                      </div>
                    ) : (
                      <div
                        className="text-center font-serif text-3xl leading-[4.5rem] py-4"
                        dir="rtl"
                      >
                        {content.salavatData.arabic}
                      </div>
                    )}
                  </>
                )}

                {activeTab === "LATIN" &&
                  formatStyledText(
                    content.salavatData.transcript,
                    "LATIN",
                    fontLevel,
                  )}

                {activeTab === "MEANING" && (
                  <>
                    {(content.salavatData.meaning || "").startsWith(
                      "IMAGE_MODE",
                    ) ? (
                      <div className="flex flex-col gap-4 w-full items-center">
                        {content.salavatData.meaning
                          .replace("IMAGE_MODE:::", "")
                          .split(",")
                          .map((imgSrc, index) => (
                            <img
                              key={index}
                              src={imgSrc.trim()}
                              alt={`${t("meaningPage")} ${index + 1}`}
                              className="w-full h-auto rounded-lg shadow-md border border-gray-200 dark:border-gray-700"
                            />
                          ))}
                      </div>
                    ) : (
                      formatStyledText(
                        content.salavatData.meaning,
                        "MEANING",
                        fontLevel,
                      )
                    )}
                  </>
                )}
              </div>

              {content.assignmentId && (
                <div className="mt-4 pt-4 border-t w-full flex flex-col items-center bg-gray-50 rounded-b-xl pb-4 shrink-0 dark:bg-gray-800 dark:border-gray-700">
                  <p className="text-gray-500 text-sm mb-2 font-semibold dark:text-gray-400">
                    {t("clickToCount")}
                  </p>

                  {(() => {
                    const currentAssignment = session?.assignments.find(
                      (a) => a.id === content.assignmentId,
                    );
                    const isOwner =
                      currentAssignment &&
                      currentAssignment.assignedToName === userName;
                    const safeCount =
                      localCounts[content.assignmentId!] ??
                      (currentAssignment
                        ? currentAssignment.endUnit -
                          currentAssignment.startUnit +
                          1
                        : 0);

                    return (
                      <Zikirmatik
                        currentCount={safeCount}
                        onDecrement={() =>
                          onDecrementCount(content.assignmentId!)
                        }
                        isModal={true}
                        t={t}
                        readOnly={!isOwner}
                      />
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          {content.type === "QURAN" && content.currentUnit && (
            <div className="flex flex-col items-center h-full">
              <div className="flex items-center justify-between w-full mb-4 px-2 shrink-0">
                <button
                  onClick={() => {
                    onUpdateContent({
                      ...content,
                      currentUnit: Math.max(
                        content.startUnit!,
                        content.currentUnit! - 1,
                      ),
                    });
                  }}
                  disabled={content.currentUnit === content.startUnit}
                  className="px-4 py-2 bg-gray-100 rounded-lg disabled:opacity-30 hover:bg-gray-200 font-bold transition-colors dark:bg-gray-800 dark:hover:bg-gray-700"
                >
                  ← {t("previous")}
                </button>

                <span className="font-bold text-lg text-gray-700 dark:text-gray-200">
                  {t("page")} {content.currentUnit}
                </span>

                <button
                  onClick={() => {
                    onUpdateContent({
                      ...content,
                      currentUnit: Math.min(
                        content.endUnit!,
                        content.currentUnit! + 1,
                      ),
                    });
                  }}
                  disabled={content.currentUnit === content.endUnit}
                  className="px-4 py-2 bg-gray-100 rounded-lg disabled:opacity-30 hover:bg-gray-200 font-bold transition-colors dark:bg-gray-800 dark:hover:bg-gray-700"
                >
                  {t("next")} →
                </button>
              </div>

              <div className="flex-1 w-full overflow-y-auto flex flex-col items-center bg-gray-50 rounded-lg border border-gray-200 p-1 dark:bg-gray-800 dark:border-gray-700">
                <img
                  src={`https://raw.githubusercontent.com/GovarJabbar/Quran-PNG/master/${String(content.currentUnit).padStart(3, "0")}.png`}
                  alt={`Page ${content.currentUnit}`}
                  className="max-w-full h-auto object-contain shadow-lg mb-4 bg-white rounded-lg"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.parentElement!.innerHTML += `<div class="text-red-500 p-4">Sayfa yüklenemedi.</div>`;
                  }}
                />

                <div className="flex items-center justify-between w-full p-4 mt-auto border-t border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800">
                  <button
                    onClick={() => {
                      onUpdateContent({
                        ...content,
                        currentUnit: Math.max(
                          content.startUnit!,
                          content.currentUnit! - 1,
                        ),
                      });
                    }}
                    disabled={content.currentUnit === content.startUnit}
                    className="px-6 py-3 bg-gray-100 rounded-lg disabled:opacity-30 hover:bg-gray-200 font-bold text-gray-700 transition-colors flex-1 mr-2 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                  >
                    ← {t("previous")}
                  </button>

                  <button
                    onClick={() => {
                      onUpdateContent({
                        ...content,
                        currentUnit: Math.min(
                          content.endUnit!,
                          content.currentUnit! + 1,
                        ),
                      });
                    }}
                    disabled={content.currentUnit === content.endUnit}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg disabled:opacity-30 hover:bg-blue-700 font-bold transition-colors flex-1 ml-2"
                  >
                    {t("next")} →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-gray-50 text-center border-t border-gray-200 shrink-0 dark:bg-gray-900 dark:border-gray-800">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition font-bold dark:bg-gray-700 dark:hover:bg-gray-600"
          >
            {t("close")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReadingModal;
