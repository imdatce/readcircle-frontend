 "use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import LoginRequiredModal from "@/components/LoginRequiredModal";
import { useAuth } from "@/context/AuthContext";

export default function AgendaPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { user } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Hydration hatasını ve ESLint uyarısını önlemek için
  useEffect(() => {
    // requestAnimationFrame kullanarak işlemi asenkron hale getiriyoruz
    const handle = requestAnimationFrame(() => {
      setIsMounted(true);
    });

    return () => cancelAnimationFrame(handle);
  }, []);
  const handleCardClick = (href: string) => {
    if (!isMounted) return;
    if (!user) {
      setIsModalOpen(true);
    } else {
      router.push(href);
    }
  };

  // Menü öğelerini t() fonksiyonuna bağlayarak dinamik hale getirdik
  const menuItems = useMemo(
    () => [
      {
        title: t("dailyPrayerTracking") || "Günlük Namaz Takibi",
        description:
          t("dailyPrayerDesc") ||
          "Beş vakit namazını takip et, huzura odaklan.",
        href: "/prayers?tab=gunluk",
        icon: (
          <svg
            className="w-8 h-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ),
        color: "bg-teal-500",
        lightColor: "bg-teal-50 dark:bg-teal-900/20",
        textColor: "text-teal-700 dark:text-teal-400",
      },
      {
        title: t("qadaPrayerTracking") || "Kaza Namazı Takibi",
        description:
          t("qadaPrayerDesc") || "Geçmiş borçlarını planla ve adım adım bitir.",
        href: "/prayers?tab=kaza",
        icon: (
          <svg
            className="w-8 h-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ),
        color: "bg-amber-500",
        lightColor: "bg-amber-50 dark:bg-amber-900/20",
        textColor: "text-amber-700 dark:text-amber-400",
      },
      {
        title: t("myHatimJourney") || "Hatim Yolculuğum",
        description:
          t("hatimJourneyDesc") ||
          "Kur'an ile bağını koparma, hedefine yaklaş.",
        href: "/resources/quran",
        icon: (
          <svg
            className="w-8 h-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        ),
        color: "bg-emerald-500",
        lightColor: "bg-emerald-50 dark:bg-emerald-900/20",
        textColor: "text-emerald-700 dark:text-emerald-400",
      },
      {
        title: t("dailyDhikrTracking") || "Günlük Zikir Takibi",
        description:
          t("dailyDhikrDesc") ||
          "Dilini ve kalbini zikirle diri tut, virdini tamamla.",
        href: "/agenda/dhikr",
        icon: (
          <svg
            className="w-8 h-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
            />
          </svg>
        ),
        color: "bg-blue-500",
        lightColor: "bg-blue-50 dark:bg-blue-900/20",
        textColor: "text-blue-700 dark:text-blue-400",
      },
      {
        title: t("personalDuaList") || "Kişisel Dua Listem",
        description:
          t("personalDuaDesc") ||
          "Sevdiklerini ekle, niyet et ve onlara dua et.",
        href: "/agenda/dualarim",
        icon: (
          <svg
            className="w-8 h-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
            />
          </svg>
        ),
        color: "bg-rose-500",
        lightColor: "bg-rose-50 dark:bg-rose-900/20",
        textColor: "text-rose-700 dark:text-rose-400",
      },
    ],
    [t],
  );

  return (
    <div className="min-h-screen bg-[#FDFCF7] dark:bg-[#061612] py-8 px-4 sm:px-6 transition-colors duration-500 relative">
      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        {/* Başlık Bölümü */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
            {t("agendaPageTitle") || "Manevi Ajandam"}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            {t("agendaPageSubtitle") ||
              "Gelişimini takip et, ibadetlerini düzenle."}
          </p>
        </div>

        {/* Menü Kartları Grid Yapısı */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {menuItems.map((item, index) => (
            <div
              key={index}
              onClick={() => handleCardClick(item.href)}
              className={`cursor-pointer group relative overflow-hidden p-6 rounded-[2.5rem] border border-transparent hover:border-gray-200 dark:hover:border-gray-800 transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-none hover:-translate-y-1 ${item.lightColor}`}
            >
              <div className="flex items-start gap-5">
                <div
                  className={`w-14 h-14 rounded-2xl ${item.color} text-white flex items-center justify-center shadow-lg shadow-current/20 group-hover:scale-110 transition-transform duration-500 shrink-0`}
                >
                  {item.icon}
                </div>

                <div className="space-y-1">
                  <h3 className={`text-xl font-black ${item.textColor}`}>
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="absolute bottom-4 right-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300">
                <svg
                  className={`w-6 h-6 ${item.textColor}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* GİRİŞ MODALI */}
      {isMounted && (
        <LoginRequiredModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={t("loginRequiredTitle") || "Giriş Yapmanız Gerekiyor"}
          message={
            t("loginRequiredAgendaDesc") ||
            "Ajandanıza erişmek ve ibadetlerinizi takip etmek için lütfen hesabınıza giriş yapın."
          }
        />
      )}
    </div>
  );
}
