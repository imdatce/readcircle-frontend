import React from "react";
// Bir önceki adımda oluşturduğumuz widget'ı içe aktarıyoruz.
// Eğer dosya yolunuz farklıysa burayı kendinize göre güncelleyebilirsiniz.
import PrayerTimesWidget from "@/components/resources/PrayerTimesWidget";
import DailyInspirationWidget from "@/components/resources/DailyInspirationWidget";

export const metadata = {
  title: "Namaz Vakitleri | ReadCircle",
  description: "Günlük namaz vakitlerinizi takip edin.",
};

export default function PrayerTimesPage() {
  return (
    <div className="min-h-screen bg-[#FDFCF7] dark:bg-[#061612] py-8 px-4 sm:px-6 transition-colors duration-500">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Sayfa Başlığı */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
            Namaz Vakitleri
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Vakitleri takip et, ibadetlerini zamanında eda et.
          </p>
        </div>

        {/* Vakitler Widget'ı */}
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
          <PrayerTimesWidget />
          <DailyInspirationWidget />
        </div>

        {/* Alt Bilgi / Motivasyon */}
        <div className="pt-8 text-center animate-in fade-in duration-1000 delay-300">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-full border border-gray-100 dark:border-gray-800 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
              Namaz dinin direğidir
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
