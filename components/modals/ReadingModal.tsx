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
  fontSizes,
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
  const [fontLevel, setFontLevel] = useState(3);

  const getDisplayTitle = () => {
    if (!content.codeKey) return content.title;
    const translated = t(`resource_${content.codeKey}`);
    return translated === `resource_${content.codeKey}`
      ? content.title
      : translated;
  };

  const [activeTab, setActiveTab] = useState<ViewMode>("ARABIC");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] border border-white/20 dark:border-gray-800">
        <div className="p-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex flex-col gap-4 shrink-0 shadow-md z-10">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-xl tracking-tight text-white/95">
              {getDisplayTitle()}
            </h3>
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-blue-800/30 rounded-xl p-1 border border-white/10">
                <button
                  onClick={() => setFontLevel((prev) => Math.max(0, prev - 1))}
                  disabled={fontLevel === 0}
                  className="w-9 h-9 flex items-center justify-center hover:bg-white/20 rounded-lg disabled:opacity-30 transition font-serif font-bold text-sm"
                  title={t("decreaseFont")}
                >
                  A-
                </button>
                <div className="w-px h-4 bg-white/20 mx-1"></div>
                <button
                  onClick={() => setFontLevel((prev) => Math.min(8, prev + 1))}
                  disabled={fontLevel === 8}
                  className="w-9 h-9 flex items-center justify-center hover:bg-white/20 rounded-lg disabled:opacity-30 transition font-serif font-bold text-lg"
                  title={t("increaseFont")}
                >
                  A+
                </button>
              </div>

              <button
                onClick={onClose}
                className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-all duration-200"
                title={t("close")}
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
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {(content.type === "CEVSEN" || content.type === "SALAVAT") && (
            <div className="flex p-1 bg-blue-800/30 rounded-xl backdrop-blur-sm">
              <button
                onClick={() => setActiveTab("ARABIC")}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                  activeTab === "ARABIC"
                    ? "bg-white text-blue-700 shadow-sm transform scale-[1.02]"
                    : "text-blue-100 hover:bg-white/10"
                }`}
              >
                {t("tabArabic")}
              </button>
              <button
                onClick={() => setActiveTab("LATIN")}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                  activeTab === "LATIN"
                    ? "bg-white text-blue-700 shadow-sm transform scale-[1.02]"
                    : "text-blue-100 hover:bg-white/10"
                }`}
              >
                {t("tabLatin")}
              </button>
              {content.codeKey !== "BEDIR" &&
                content.codeKey !== "UHUD" &&
                content.codeKey !== "TEVHIDNAME" && (
                  <button
                    onClick={() => setActiveTab("MEANING")}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                      activeTab === "MEANING"
                        ? "bg-white text-blue-700 shadow-sm transform scale-[1.02]"
                        : "text-blue-100 hover:bg-white/10"
                    }`}
                  >
                    {t("tabMeaning")}
                  </button>
                )}
            </div>
          )}
        </div>

        <div className="p-4 md:p-8 overflow-y-auto text-gray-700 flex-1 bg-white dark:bg-gray-900 dark:text-gray-200 scroll-smooth">
          {content.type === "SIMPLE" && content.simpleItems && (
            <ul className="space-y-4">
              {content.simpleItems.map((item, index) => (
                <li
                  key={index}
                  className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 text-lg font-medium leading-relaxed"
                >
                  <div className="flex gap-3">
                    <span className="text-blue-500 font-bold select-none">
                      {index + 1}.
                    </span>
                    <span>{item}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {content.type === "CEVSEN" && content.cevsenData && (
            <div className="space-y-8">
              {content.cevsenData.map((bab, index) => (
                <div key={index} className="relative">
                  <div className="flex items-center justify-center mb-6">
                    <div className="h-px bg-gray-200 dark:bg-gray-800 flex-1 max-w-[100px]"></div>
                    <span className="bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-widest border border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-900/50 mx-4">
                      {content.codeKey === "CEVSEN"
                        ? `${bab.babNumber}. ${t("chapter")}`
                        : `${bab.babNumber}. ${t("group")}`}
                    </span>
                    <div className="h-px bg-gray-200 dark:bg-gray-800 flex-1 max-w-[100px]"></div>
                  </div>

                  {activeTab === "ARABIC" && (
                    <div
                      className={
                        ["UHUD", "BEDIR"].includes(content.codeKey || "")
                          ? ""
                          : "text-center font-serif text-3xl leading-[2.5] text-gray-800 dark:text-gray-100"
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
                          : "text-left font-serif text-xl leading-relaxed text-gray-700 dark:text-gray-300"
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
                      <div className="bg-emerald-50/60 dark:bg-emerald-900/10 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-800/30">
                        <div className="flex items-center gap-2 mb-3 text-emerald-700 dark:text-emerald-400">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="font-bold text-xs uppercase tracking-widest">
                            {t("translationTitle")}
                          </span>
                        </div>
                        <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {formatMeaningText(bab.meaning, fontLevel)}
                        </div>
                      </div>
                    )}
                </div>
              ))}
            </div>
          )}

          {content.type === "SALAVAT" && content.salavatData && (
            <div className="flex flex-col items-center w-full">
              <div className="w-full">
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
                              className="w-full h-auto rounded-xl shadow-lg border border-gray-100 dark:border-gray-800"
                            />
                          ))}
                      </div>
                    ) : (
                      <div
                        className={`text-center font-serif leading-[4rem] py-4 text-gray-800 dark:text-gray-100 ${fontSizes.ARABIC[fontLevel]}`}
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
                              className="w-full h-auto rounded-xl shadow-lg border border-gray-100 dark:border-gray-800"
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
                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 w-full flex flex-col items-center">
              

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
              <div className="flex items-center justify-between w-full mb-6 px-2 shrink-0 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-xl border border-gray-200 dark:border-gray-700">
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
                  className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 disabled:opacity-30 disabled:shadow-none hover:bg-gray-50 dark:hover:bg-gray-700 font-bold text-gray-600 dark:text-gray-300 transition-all text-sm flex items-center gap-2"
                >
                  <span>←</span> {t("previous")}
                </button>

                <span className="font-bold text-lg text-gray-800 dark:text-white">
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md shadow-blue-500/20 disabled:opacity-30 disabled:shadow-none hover:bg-blue-700 font-bold transition-all text-sm flex items-center gap-2"
                >
                  {t("next")} <span>→</span>
                </button>
              </div>

              <div className="flex-1 w-full overflow-y-auto flex flex-col items-center bg-gray-50/50 dark:bg-black/20 rounded-2xl border border-gray-200 dark:border-gray-800 p-2">
                <img
                  src={`https://raw.githubusercontent.com/GovarJabbar/Quran-PNG/master/${String(content.currentUnit).padStart(3, "0")}.png`}
                  alt={`Page ${content.currentUnit}`}
                  className="max-w-full h-auto object-contain shadow-2xl rounded-xl bg-white"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.parentElement!.innerHTML += `<div class="text-red-500 p-4 text-center font-bold">Sayfa yüklenemedi. <br/><span class="text-sm font-normal text-gray-500">Lütfen internet bağlantınızı kontrol edin.</span></div>`;
                  }}
                />
              </div>

              <div className="flex items-center justify-between w-full mt-6 px-2 shrink-0">
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
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 font-bold text-gray-600 dark:text-gray-300 transition-colors disabled:opacity-0"
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
                  className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 font-bold transition-colors disabled:opacity-0"
                >
                  {t("next")} →
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-900/80 backdrop-blur text-center border-t border-gray-200 dark:border-gray-800 shrink-0">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-12 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all font-bold shadow-sm"
          >
            {t("close")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReadingModal;
