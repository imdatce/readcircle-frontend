import React from "react";
import PrayerTimesWidget from "@/components/resources/PrayerTimesWidget";
import DailyInspirationWidget from "@/components/resources/DailyInspirationWidget";
import NearbyMosquesWidget from "@/components/resources/NearbyMosquesWidget";
import QiblaWidget from "@/components/resources/QiblaWidget";
import ReligiousDaysWidget from "@/components/resources/ReligiousDaysWidget"; 

export const metadata = {
  title: "Namaz Vakitleri | ReadCircle",
  description:
    "Günlük namaz vakitlerinizi takip edin ve çevrenizdeki camileri bulun.",
};

export default function PrayerTimesPage() {
  return (
    <div className="relative min-h-screen bg-[#FDFCF7] dark:bg-[#061612] py-10 sm:py-16 px-4 sm:px-6 overflow-hidden transition-colors duration-700">
      {/* --- MODERN ARKA PLAN IŞIKLARI (AMBİANS) --- */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-teal-500/10 dark:bg-teal-500/5 rounded-full blur-[100px] pointer-events-none" />
      {/* ------------------------------------------- */}

      <div className="relative max-w-4xl mx-auto space-y-12 sm:space-y-16 z-10">
        {/* --- WIDGET ALANLARI (KADEMELİ ANİMASYON) --- */}
        <div className="space-y-8 sm:space-y-10">
          {/* 1. Vakitler Widget'ı */}
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both delay-150">
            <PrayerTimesWidget />
          </div>

          {/* 2. Yakındaki Camiler */}
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both delay-300">
            <NearbyMosquesWidget />
          </div>

          {/* YENİ: KIBLE PUSULASI */}
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both delay-300">
            <QiblaWidget />
          </div>
          {/* YENİ: DİNİ GÜNLER BİLEŞENİ */}
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both delay-600">
            <ReligiousDaysWidget />
          </div>

          {/* 3. Günün İçerikleri */}
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both delay-500">
            <DailyInspirationWidget />
          </div>
        </div>
      </div>
    </div>
  );
}
