/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

interface UserDhikr {
  id: string;
  name: string;
  target: number;
}

export default function DhikrAgendaPage() {
  const { t } = useLanguage();
  const [myDhikrs, setMyDhikrs] = useState<UserDhikr[]>([]);
  const [todayProgress, setTodayProgress] = useState<Record<string, number>>(
    {},
  );

  // Modallar
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeZikirmatik, setActiveZikirmatik] = useState<UserDhikr | null>(
    null,
  );

  // Kendi Zikrini Oluşturma Stateleri
  const [customName, setCustomName] = useState("");
  const [customTarget, setCustomTarget] = useState("");

  // Şablondan Seçerken Hedef Belirleme Stateleri
  const [selectedTemplate, setSelectedTemplate] = useState<{
    id: string;
    name: string;
    defaultTarget: number;
  } | null>(null);
  const [templateTarget, setTemplateTarget] = useState("");

  // Hedef Düzenleme Stateleri
  const [editingDhikrId, setEditingDhikrId] = useState<string | null>(null);
  const [editTargetValue, setEditTargetValue] = useState("");

  // Zikirmatik State
  const [currentCount, setCurrentCount] = useState(0);

  // i18n uyumlu şablon listesi (t ile her dilde farklı isim alabilir)
  const PREDEFINED_DHIKRS = useMemo(
    () => [
      {
        id: "estagfirullah",
        name: t("dhikrEstagfirullah") || "Estağfirullah",
        defaultTarget: 100,
      },
      {
        id: "salavat",
        name: t("dhikrSalavat") || "Salavat-ı Şerife",
        defaultTarget: 100,
      },
      {
        id: "kelime_tevhid",
        name: t("dhikrTevhid") || "Lâ ilâhe illallah",
        defaultTarget: 100,
      },
      {
        id: "subhanallah",
        name: t("dhikrSubhanallah") || "Subhanallah",
        defaultTarget: 33,
      },
      {
        id: "elhamdulillah",
        name: t("dhikrElhamdulillah") || "Elhamdulillah",
        defaultTarget: 33,
      },
      {
        id: "allahu_ekber",
        name: t("dhikrAllahuEkber") || "Allahu Ekber",
        defaultTarget: 33,
      },
      {
        id: "hasbunallah",
        name: t("dhikrHasbunallah") || "Hasbunallahu ve ni'mel vekil",
        defaultTarget: 100,
      },
    ],
    [t],
  );

  // Verileri Yükle
  useEffect(() => {
    // 1. Önce verileri hazırlayan bir fonksiyon tanımlıyoruz
    const initializeDhikrData = () => {
      // Zikir listesini al
      const savedDhikrs = localStorage.getItem("my_daily_dhikrs");
      let initialDhikrs: UserDhikr[];

      if (savedDhikrs) {
        initialDhikrs = JSON.parse(savedDhikrs);
      } else {
        initialDhikrs = PREDEFINED_DHIKRS.slice(0, 3).map((d) => ({
          id: d.id,
          name: d.name,
          target: d.defaultTarget,
        }));
        localStorage.setItem("my_daily_dhikrs", JSON.stringify(initialDhikrs));
      }

      // Progress (ilerleme) verisini al
      const todayStr = new Date().toISOString().split("T")[0];
      const savedProgress = localStorage.getItem("dhikr_progress_today");
      let initialProgress = {};

      if (savedProgress) {
        const parsed = JSON.parse(savedProgress);
        if (parsed.date === todayStr) {
          initialProgress = parsed.counts;
        } else {
          localStorage.setItem(
            "dhikr_progress_today",
            JSON.stringify({ date: todayStr, counts: {} }),
          );
        }
      }

      // 2. State'leri tek bir seferde güncelliyoruz
      setMyDhikrs(initialDhikrs);
      setTodayProgress(initialProgress);
    };

    // Fonksiyonu çağır
    initializeDhikrData();
  }, [PREDEFINED_DHIKRS]);

  const handleAddCustom = () => {
    if (!customName.trim() || !customTarget) return;
    const newDhikr: UserDhikr = {
      id: "custom_" + Date.now(),
      name: customName.trim(),
      target: parseInt(customTarget, 10) || 100,
    };
    const updated = [...myDhikrs, newDhikr];
    setMyDhikrs(updated);
    localStorage.setItem("my_daily_dhikrs", JSON.stringify(updated));
    setCustomName("");
    setCustomTarget("");
    setIsAddModalOpen(false);
  };

  const handleTemplateClick = (pd: any) => {
    setSelectedTemplate(pd);
    setTemplateTarget(pd.defaultTarget.toString());
  };

  const confirmAddTemplate = () => {
    if (!selectedTemplate || !templateTarget) return;
    const newDhikr: UserDhikr = {
      id: selectedTemplate.id,
      name: selectedTemplate.name,
      target: parseInt(templateTarget, 10) || selectedTemplate.defaultTarget,
    };
    const updated = [...myDhikrs, newDhikr];
    setMyDhikrs(updated);
    localStorage.setItem("my_daily_dhikrs", JSON.stringify(updated));
    setSelectedTemplate(null);
    setIsAddModalOpen(false);
  };

  const startEditingTarget = (dhikr: UserDhikr, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingDhikrId(dhikr.id);
    setEditTargetValue(dhikr.target.toString());
  };

  const saveEditedTarget = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = myDhikrs.map((d) =>
      d.id === id
        ? { ...d, target: parseInt(editTargetValue, 10) || d.target }
        : d,
    );
    setMyDhikrs(updated);
    localStorage.setItem("my_daily_dhikrs", JSON.stringify(updated));
    setEditingDhikrId(null);
  };

  const openZikirmatik = (dhikr: UserDhikr) => {
    if (editingDhikrId) return;
    setActiveZikirmatik(dhikr);
    setCurrentCount(todayProgress[dhikr.id] || 0);
  };

  const handleDeleteDhikr = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = myDhikrs.filter((d) => d.id !== id);
    setMyDhikrs(updated);
    localStorage.setItem("my_daily_dhikrs", JSON.stringify(updated));
  };

  const closeZikirmatik = () => {
    if (!activeZikirmatik) return;
    const todayStr = new Date().toISOString().split("T")[0];
    const newProgress = {
      ...todayProgress,
      [activeZikirmatik.id]: currentCount,
    };
    setTodayProgress(newProgress);
    localStorage.setItem(
      "dhikr_progress_today",
      JSON.stringify({ date: todayStr, counts: newProgress }),
    );
    setActiveZikirmatik(null);
  };

  const incrementCount = () => {
    if (!activeZikirmatik) return;
    if (currentCount >= activeZikirmatik.target) {
      if (typeof navigator !== "undefined" && navigator.vibrate)
        navigator.vibrate([50, 50, 50]);
      return;
    }
    if (typeof navigator !== "undefined" && navigator.vibrate)
      navigator.vibrate(30);
    setCurrentCount((prev) => prev + 1);
  };

  useEffect(() => {
    if (
      activeZikirmatik &&
      currentCount === activeZikirmatik.target &&
      activeZikirmatik.target > 0
    ) {
      if (typeof navigator !== "undefined" && navigator.vibrate)
        navigator.vibrate([100, 50, 100]);
    }
  }, [currentCount, activeZikirmatik]);

  return (
    <div className="min-h-screen bg-[#FDFCF7] dark:bg-[#061612] py-8 px-4 sm:px-6 transition-colors duration-500">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Üst Bar */}
        <div className="flex items-center justify-between bg-white/50 dark:bg-[#0a1f1a] backdrop-blur-md p-4 rounded-[2rem] border border-blue-100/20 dark:border-blue-900/30 shadow-sm">
          <Link
            href="/"
            className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full transition-all group"
          >
            <svg
              className="w-6 h-6 text-blue-600 dark:text-blue-400 group-hover:-translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Link>
          <h1 className="text-sm md:text-base font-black text-blue-800 dark:text-blue-100 uppercase tracking-[0.2em]">
            {t("dhikrAgendaTitle") || "Günlük Zikir Takibi"}
          </h1>
          <button
            onClick={() => {
              setSelectedTemplate(null);
              setIsAddModalOpen(true);
            }}
            className="p-2 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 rounded-full hover:scale-105 transition-transform"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        </div>

        {/* Özet Kartları */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm text-center">
            <p className="text-3xl font-black text-blue-600 dark:text-blue-400">
              {Object.values(todayProgress).reduce((a, b) => a + b, 0)}
            </p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
              {t("dhikrTodayTotal") || "Bugün Çekilen"}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm text-center">
            <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {
                myDhikrs.filter((d) => (todayProgress[d.id] || 0) >= d.target)
                  .length
              }{" "}
              / {myDhikrs.length}
            </p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
              {t("dhikrCompletedVird") || "Tamamlanan Vird"}
            </p>
          </div>
        </div>

        {/* Zikir Listesi */}
        <div className="space-y-3">
          {myDhikrs.map((dhikr) => {
            const current = todayProgress[dhikr.id] || 0;
            const isCompleted = current >= dhikr.target;
            const percent = Math.min((current / dhikr.target) * 100, 100);

            return (
              <div
                key={dhikr.id}
                onClick={() => openZikirmatik(dhikr)}
                className={`group/card relative overflow-hidden p-5 rounded-3xl border cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.98] ${isCompleted ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800" : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800"}`}
              >
                <div
                  className="absolute inset-y-0 left-0 bg-blue-50 dark:bg-blue-900/10 transition-all duration-1000 ease-out"
                  style={{ width: `${percent}%` }}
                ></div>
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <h3
                      className={`font-bold text-lg flex items-center gap-2 ${isCompleted ? "text-emerald-700 dark:text-emerald-400" : "text-gray-800 dark:text-gray-100"}`}
                    >
                      {isCompleted && (
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                      {dhikr.name}
                    </h3>
                    <div
                      className="flex items-center gap-2 mt-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                        {t("targetLabel") || "Hedef"}:
                      </span>
                      {editingDhikrId === dhikr.id ? (
                        <div className="flex items-center gap-1 animate-in fade-in">
                          <input
                            type="number"
                            value={editTargetValue}
                            placeholder="..."
                            onChange={(e) => setEditTargetValue(e.target.value)}
                            className="w-16 px-2 py-0.5 text-xs font-bold border border-blue-300 dark:border-blue-700 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 outline-none focus:ring-1 focus:ring-blue-500"
                            autoFocus
                          />
                          <button
                            onClick={(e) => saveEditedTarget(dhikr.id, e)}
                            className="w-6 h-6 flex items-center justify-center bg-emerald-100 text-emerald-600 rounded-md hover:bg-emerald-200"
                          >
                            <svg
                              className="w-4 h-4"
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
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 group/edit">
                          <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                            {dhikr.target}
                          </span>
                          <button
                            onClick={(e) => startEditingTarget(dhikr, e)}
                            className="text-gray-400 hover:text-blue-500 opacity-0 group-hover/card:opacity-100 p-1"
                            title={t("editTarget") || "Hedefi Düzenle"}
                          >
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                              />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xl font-black text-blue-600 dark:text-blue-400">
                      {current}
                    </span>
                    <button
                      onClick={(e) => handleDeleteDhikr(dhikr.id, e)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors opacity-0 group-hover/card:opacity-100"
                      title={t("delete") || "Sil"}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {myDhikrs.length === 0 && (
            <div className="text-center py-10 bg-white/50 dark:bg-gray-900/50 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
              <p className="text-gray-500 font-bold">
                {t("emptyDhikrList") || "Listeniz boş."}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {t("addVirdInstruction") ||
                  "Sağ üstteki '+' butonundan yeni vird ekleyebilirsiniz."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* --- YENİ VİRD EKLEME MODALI --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto hide-scrollbar">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-gray-800 dark:text-white">
                {selectedTemplate
                  ? t("setTarget") || "Hedef Belirle"
                  : t("addVird") || "Vird Ekle"}
              </h2>
              <button
                onClick={() => {
                  setSelectedTemplate(null);
                  setIsAddModalOpen(false);
                }}
                className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200"
              >
                <svg
                  className="w-5 h-5 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {selectedTemplate ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
                  <h3 className="font-bold text-lg text-blue-800 dark:text-blue-300">
                    {selectedTemplate.name}
                  </h3>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                    {t("setDailyTargetDesc") ||
                      "Bu zikir için günlük hedefinizi belirleyin."}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    {t("targetNumberLabel") || "Hedef Sayısı"}
                  </label>
                  <input
                    type="number"
                    value={templateTarget}
                    placeholder="..."
                    onChange={(e) => setTemplateTarget(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 font-bold text-gray-800 dark:text-white focus:border-blue-500 outline-none"
                    autoFocus
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setSelectedTemplate(null)}
                    className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl font-bold"
                  >
                    {t("back") || "Geri"}
                  </button>
                  <button
                    onClick={confirmAddTemplate}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold"
                  >
                    {t("saveAndAdd") || "Kaydet ve Ekle"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-3">
                  <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                    {t("createCustomDhikr") || "Kendi Zikrini Oluştur"}
                  </h3>
                  <input
                    type="text"
                    placeholder={
                      t("dhikrNamePlaceholder") || "Zikir Adı (Örn: Ya Şafi)"
                    }
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 text-sm font-medium focus:border-blue-500 outline-none"
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder={t("targetLabel") || "Hedef"}
                      value={customTarget}
                      onChange={(e) => setCustomTarget(e.target.value)}
                      className="w-1/2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 text-sm font-medium focus:border-blue-500 outline-none"
                    />
                    <button
                      onClick={handleAddCustom}
                      className="w-1/2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-colors"
                    >
                      {t("create") || "Oluştur"}
                    </button>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">
                    {t("predefinedTemplates") || "Hazır Şablonlar"}
                  </h3>
                  <div className="space-y-2">
                    {PREDEFINED_DHIKRS.map((pd) => {
                      const isAdded = myDhikrs.some((d) => d.id === pd.id);
                      return (
                        <button
                          key={pd.id}
                          disabled={isAdded}
                          onClick={() => handleTemplateClick(pd)}
                          className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all ${isAdded ? "bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed opacity-50 dark:bg-gray-800/50 dark:border-gray-800" : "bg-white border-blue-100 hover:bg-blue-50 dark:bg-gray-900 dark:border-blue-900/30 dark:hover:bg-blue-900/20"}`}
                        >
                          <div>
                            <h4
                              className={`font-bold ${isAdded ? "" : "text-gray-800 dark:text-gray-200"}`}
                            >
                              {pd.name}
                            </h4>
                          </div>
                          {!isAdded && (
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={3}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M12 4v16m8-8H4"
                                />
                              </svg>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- DEV ZİKİRMATİK EKRANI --- */}
      {activeZikirmatik && (
        <div className="fixed inset-0 z-[9999] bg-[#FDFCF7] dark:bg-[#061612] flex flex-col items-center justify-between animate-in slide-in-from-bottom-full duration-300">
          <div className="w-full flex items-center justify-between p-6">
            <div className="flex-1">
              <h2 className="text-2xl font-black text-gray-800 dark:text-gray-100">
                {activeZikirmatik.name}
              </h2>
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-1">
                {t("targetLabel") || "Hedef"}: {activeZikirmatik.target}
              </p>
            </div>
            <button
              onClick={closeZikirmatik}
              className="w-12 h-12 flex items-center justify-center bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-300 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center w-full px-4">
            <button
              onClick={incrementCount}
              className={`relative group w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center rounded-full transition-all duration-300 ${currentCount >= activeZikirmatik.target ? "bg-emerald-500 shadow-[0_0_60px_rgba(16,185,129,0.5)] scale-105 cursor-default" : "bg-gradient-to-br from-blue-500 to-indigo-600 shadow-[0_20px_50px_rgba(59,130,246,0.4)] active:scale-95 cursor-pointer"}`}
            >
              <svg
                className="absolute inset-0 w-full h-full transform -rotate-90 pointer-events-none"
                viewBox="0 0 100 100"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="48"
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="4"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="48"
                  fill="none"
                  stroke="white"
                  strokeWidth="4"
                  strokeDasharray={`${Math.min((currentCount / activeZikirmatik.target) * 301.59, 301.59)} 301.59`}
                  className="transition-all duration-300 ease-out"
                />
              </svg>
              <div className="text-center">
                <span className="block text-6xl sm:text-7xl font-black text-white drop-shadow-md tracking-tighter tabular-nums">
                  {Math.max(0, activeZikirmatik.target - currentCount)}
                </span>
                {currentCount >= activeZikirmatik.target && (
                  <span className="block mt-4 text-sm font-bold text-emerald-100 uppercase tracking-widest animate-pulse">
                    {t("mayAllahAccept") || "Allah kabul etsin"}
                  </span>
                )}
              </div>
            </button>
            <div className="flex items-center gap-8 mt-16">
              <button
                onClick={() => setCurrentCount(0)}
                className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400 flex items-center justify-center font-bold text-xs uppercase tracking-widest active:scale-95"
              >
                {t("reset") || "Sıfırla"}
              </button>
              <button
                onClick={() => setCurrentCount(Math.max(0, currentCount - 1))}
                className="w-16 h-16 rounded-full bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 flex items-center justify-center active:scale-95"
              >
                <svg
                  className="w-8 h-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20 12H4"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
