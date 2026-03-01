"use client";
import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { ayahs } from "@/constants/ayahs";

function AyahIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 opacity-80"
    >
      <path
        d="M18 2L21.5 6.5H26.5L28 11.5L33 14.5L31 19.5L33 24.5L28 27.5L26.5 32.5H21.5L18 37L14.5 32.5H9.5L8 27.5L3 24.5L5 19.5L3 14.5L8 11.5L9.5 6.5H14.5L18 2Z"
        className="fill-emerald-600/20 stroke-emerald-600 dark:fill-emerald-400/20 dark:stroke-emerald-400"
        strokeWidth="1.5"
      />
      <circle
        cx="18"
        cy="19.5"
        r="5"
        className="fill-emerald-600 dark:fill-emerald-400"
      />
    </svg>
  );
}

export default function HomeAyahSection() {
  const { t } = useLanguage();
  const [currentAyah, setCurrentAyah] = useState(ayahs[0]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const setRandomData = () => {
      const randomIndex = Math.floor(Math.random() * ayahs.length);
      setCurrentAyah(ayahs[randomIndex]);
      setIsMounted(true);
    };
    setRandomData();
  }, []);

  // Hydration hatasını önlemek için SSR sırasında boş yer tutucu (skeleton) gösteriyoruz
  if (!isMounted) return <div className="py-8 min-h-[150px]"></div>;

  return (
    <div className="relative bg-white/40 dark:bg-gray-900/40 backdrop-blur-md border-y border-emerald-500/30 py-8 px-4 md:px-12 rounded-lg shadow-sm transition-all duration-500">
      <h2
        className="font-serif text-2xl md:text-4xl text-gray-800 dark:text-gray-100 mb-4 leading-relaxed drop-shadow-sm text-center flex items-center justify-center gap-4"
        dir="rtl"
        lang="ar"
      >
        <AyahIcon />
        <span className="leading-tight">{currentAyah.arabic}</span>
        <AyahIcon />
      </h2>
      <div className="flex flex-col items-center gap-2">
        {/* Çeviri dosyasına ulaşılamazsa fallback olarak translationKey değerinin kendisi basılır */}
        <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 italic font-medium font-serif text-center max-w-lg mx-auto">
          &quot;{t(currentAyah.translationKey) || currentAyah.translationKey}
          &quot;
        </p>
        <span className="text-xs text-emerald-600 dark:text-emerald-500 font-bold tracking-widest uppercase opacity-80">
          {currentAyah.reference}
        </span>
      </div>
    </div>
  );
}
