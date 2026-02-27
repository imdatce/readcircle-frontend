/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Dua Objesi Tipi
interface DuaItem {
  id: string;
  name: string; // Kimin için?
  intention: string; // Hangi niyetle? (Örn: Şifa, Sınav başarısı)
  count: number; // Kaç kere dua edildi?
  dateAdded: string; // Eklenme tarihi
}

export default function MyDuasPage() {
  const router = useRouter();
  const [duasList, setDuasList] = useState<DuaItem[]>([]);
  const [newName, setNewName] = useState("");
  const [newIntention, setNewIntention] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  // Sayfa yüklendiğinde Local Storage'dan verileri çek
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
    const savedDuas = localStorage.getItem("my_duas_list");
    if (savedDuas) {
      try {
        setDuasList(JSON.parse(savedDuas));
      } catch (e) {
        console.error("Dua listesi okunamadı", e);
      }
    }
  }, []);

  // Liste güncellendiğinde Local Storage'a kaydet
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("my_duas_list", JSON.stringify(duasList));
    }
  }, [duasList, isMounted]);

  // Yeni Dua Ekleme Fonksiyonu
  const handleAddDua = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newDua: DuaItem = {
      id: Date.now().toString(),
      name: newName.trim(),
      intention: newIntention.trim() || "Genel hayır ve iyilik niyetiyle...",
      count: 0,
      dateAdded: new Date().toLocaleDateString("tr-TR"),
    };

    setDuasList([newDua, ...duasList]);
    setNewName("");
    setNewIntention("");
  };

  // Dua Sayısını Artırma (Dua Ettim Butonu)
  const handlePray = (id: string) => {
    setDuasList((prevList) =>
      prevList.map((dua) =>
        dua.id === id ? { ...dua, count: dua.count + 1 } : dua,
      ),
    );
    // Hafif titreşim (Telefonda)
    if (navigator.vibrate) navigator.vibrate(50);
  };

  // Listeden Silme
  const handleDelete = (id: string) => {
    if (
      window.confirm(
        "Bu kişiyi dua listenizden silmek istediğinize emin misiniz?",
      )
    ) {
      setDuasList(duasList.filter((dua) => dua.id !== id));
    }
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[#FDFCF7] dark:bg-[#061612] py-8 px-4 sm:px-6 transition-colors duration-500 relative overflow-hidden">
      {/* Arka Plan Dekoratif Işıkları */}
      <div className="absolute top-0 left-0 w-[300px] h-[300px] bg-emerald-400/10 dark:bg-emerald-600/10 rounded-full blur-3xl opacity-50 pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-teal-400/5 dark:bg-teal-600/10 rounded-full blur-3xl opacity-50 pointer-events-none translate-x-1/3 translate-y-1/3"></div>

      <div className="max-w-3xl mx-auto space-y-8 relative z-10">
        {/* --- ÜST BAŞLIL VE GERİ BUTONU --- */}
        <div className="flex flex-col sm:flex-row gap-4 items-center sm:justify-between bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl p-4 sm:p-5 rounded-[1.5rem] shadow-sm border border-emerald-100 dark:border-emerald-900/30">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => router.back()}
              className="p-2.5 bg-white dark:bg-gray-800 text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-all active:scale-95 shrink-0"
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
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                Kişisel Dua Listem
              </h1>
              <p className="text-gray-500 dark:text-gray-400 font-medium text-xs mt-0.5">
                Sevdikleriniz için niyet edin ve dua edin.
              </p>
            </div>
          </div>
          <div className="text-3xl">🤲</div>
        </div>

        {/* --- YENİ DUA EKLEME FORMU --- */}
        <form
          onSubmit={handleAddDua}
          className="bg-white/80 dark:bg-[#0a1f1a] backdrop-blur-md rounded-[2rem] p-5 sm:p-6 shadow-sm border border-emerald-100 dark:border-emerald-900/30"
        >
          <h2 className="text-lg font-black text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
            <span className="text-emerald-500">✨</span> Yeni Kişi Ekle
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1">
                Kimin için dua edeceksiniz?
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Örn: Annem, Ahmet, Hastalar..."
                className="w-full bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-emerald-300 dark:focus:border-emerald-700 rounded-xl px-4 py-3 text-sm font-bold text-gray-800 dark:text-white outline-none transition-all placeholder:font-medium placeholder:text-gray-400"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1">
                Niyetiniz / İsteğiniz nedir? (İsteğe bağlı)
              </label>
              <input
                type="text"
                value={newIntention}
                onChange={(e) => setNewIntention(e.target.value)}
                placeholder="Örn: Şifa bulması için, sınavı için..."
                className="w-full bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-emerald-300 dark:focus:border-emerald-700 rounded-xl px-4 py-3 text-sm font-bold text-gray-800 dark:text-white outline-none transition-all placeholder:font-medium placeholder:text-gray-400"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={!newName.trim()}
            className="mt-4 w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3.5 rounded-xl font-bold shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
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
            Listeye Ekle
          </button>
        </form>

        {/* --- DUA LİSTESİ --- */}
        <div className="space-y-4">
          <h2 className="text-lg font-black text-gray-800 dark:text-gray-200 ml-2">
            Dua Ettiklerim ({duasList.length})
          </h2>

          {duasList.length === 0 ? (
            <div className="text-center py-10 bg-white/50 dark:bg-gray-900/30 rounded-[2rem] border border-dashed border-gray-200 dark:border-gray-800">
              <span className="text-4xl block mb-3 opacity-50">🕊️</span>
              <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">
                Listeniz şu an boş. Sevdiklerinizi ekleyerek onlara dua etmeye
                başlayın.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {duasList.map((dua) => (
                <div
                  key={dua.id}
                  className="group relative bg-white dark:bg-gray-900 p-5 rounded-[1.5rem] shadow-sm border border-emerald-50 dark:border-emerald-900/20 hover:border-emerald-200 dark:hover:border-emerald-800 transition-all duration-300"
                >
                  {/* Silme Butonu (Hover Olunca Çıkar) */}
                  <button
                    onClick={() => handleDelete(dua.id)}
                    className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Sil"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>

                  <div className="pr-6">
                    <h3 className="text-lg font-black text-gray-800 dark:text-gray-100">
                      {dua.name}
                    </h3>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1 mb-4 italic">
                      "{dua.intention}"
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800/60">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                        Dua Sayısı
                      </span>
                      <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 leading-none mt-1">
                        {dua.count}
                      </span>
                    </div>

                    <button
                      onClick={() => handlePray(dua.id)}
                      className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-90"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                      Dua Ettim
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
