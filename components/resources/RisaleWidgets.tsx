/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useLanguage } from "@/context/LanguageContext";

// Kitap Kartı
export function RisaleBookCard({ book, onClick }: any) {
  const { t } = useLanguage();

  // Eğer dil dosyasında kitabın key'i varsa (örn: resource_SOZLER) onu kullan,
  // yoksa orijinal book.name değerini bas.
  const translatedName = book.codeKey
    ? t(`resource_${book.codeKey}`)
    : book.name;
  const displayName = translatedName.startsWith("resource_")
    ? book.name
    : translatedName;

  return (
    <button
      onClick={() => onClick(book)}
      className="p-5 bg-white dark:bg-gray-900 rounded-[1.8rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-md transition-all text-left group flex items-center justify-between"
    >
      <span className="text-base md:text-lg font-bold text-gray-800 dark:text-white group-hover:text-emerald-600 transition-colors">
        {displayName}
      </span>
      <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </button>
  );
}

// Bölüm/Dosya Listesi Öğesi
export function ChapterItem({ file, onClick }: any) {
  const { t } = useLanguage();

  // Dosya adındaki temizlik işlemleri
  const rawName = file.name.replace(".html", "").replace(/^\d+\s*-?\s*/, "");

  // Bölüm adlarını da opsiyonel olarak çevrilebilir yapalım (Key formatı: chapter_Sözler)
  const translatedChapter = t(`chapter_${rawName}`);
  const displayName =
    translatedChapter === `chapter_${rawName}` ? rawName : translatedChapter;

  return (
    <button
      onClick={() => onClick(file)}
      className="w-full p-4 bg-gray-50/50 dark:bg-white/5 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl border border-transparent hover:border-emerald-200 transition-all text-left text-sm md:text-base font-medium text-gray-700 dark:text-gray-300 flex justify-between items-center group"
    >
      <span className="truncate">{displayName}</span>
      <span className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-all translate-x-[-4px] group-hover:translate-x-0">
        →
      </span>
    </button>
  );
}
