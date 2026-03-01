 "use client";

import React, { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

function AboutContent() {
  const router = useRouter();
  const { t } = useLanguage();
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);

  const features = [
    {
      title: t("featureHatimTitle") || "Hatim Halkaları",
      desc:
        t("featureHatimDesc") ||
        "Kullanıcıların bir araya gelerek cüzleri paylaştığı, uzaktan da olsa topluluk bilincini yaşatan dijital dağıtım sistemi.",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-900/20",
      border: "hover:border-blue-200 dark:hover:border-blue-800",
    },
    {
      title: t("featureLibraryTitle") || "Kapsamlı Kütüphane",
      desc:
        t("featureLibraryDesc") ||
        "Kur'an-ı Kerim, Risale-i Nur Külliyatı, Büyük Cevşen ve Günlük Dualar... Hepsi tek bir ekranda, okuma modlarıyla elinizin altında.",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      border: "hover:border-emerald-200 dark:hover:border-emerald-800",
    },
    {
      title: t("featureTrackingTitle") || "Akıllı İbadet Takibi",
      desc:
        t("featureTrackingDesc") ||
        "Bulunduğunuz konuma özel namaz vakitleri, kaza borcu hesaplayıcı ve ezber bozmayan akıllı zikirmatik özellikleri.",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-900/20",
      border: "hover:border-amber-200 dark:hover:border-amber-800",
    },
    {
      title: t("featureFocusTitle") || "Odaklanmış Deneyim",
      desc:
        t("featureFocusDesc") ||
        "Reklam yok, dikkat dağıtıcı bildirim yok. Sadece siz ve ibadetiniz. Gece modu ve sepya okuma filtreleriyle gözünüzü yormayan tasarım.",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      ),
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-900/20",
      border: "hover:border-purple-200 dark:hover:border-purple-800",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FDFCF7] dark:bg-[#061612] py-8 sm:py-12 px-4 sm:px-6 transition-colors duration-500 font-sans">
      <div className="max-w-4xl mx-auto space-y-8 sm:space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
        {/* Üst Başlık ve Geri Butonu */}
        <div className="flex items-center justify-between bg-white/50 dark:bg-[#0a1f1a] backdrop-blur-md p-4 rounded-[2rem] border border-emerald-100/20 dark:border-emerald-900/30 shadow-sm">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-full transition-all group"
          >
            <svg
              className="w-6 h-6 text-emerald-600 dark:text-emerald-400 group-hover:-translate-x-1 transition-transform"
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
          </button>
          <h1 className="text-sm md:text-base font-black text-emerald-800 dark:text-emerald-100 uppercase tracking-[0.2em]">
            {t("aboutUsTitle") || "Hakkımızda"}
          </h1>
          <div className="w-10"></div>
        </div>

        {/* 1. HERO (KAHRAMAN) ALANI */}
        <div className="relative bg-white dark:bg-gray-900 rounded-[3rem] p-8 md:p-16 shadow-xl shadow-emerald-900/5 border border-emerald-50 dark:border-gray-800 overflow-hidden text-center flex flex-col items-center">
          <div className="absolute -top-32 -left-32 w-64 h-64 bg-emerald-400/20 rounded-full blur-[80px] pointer-events-none"></div>
          <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-amber-400/10 rounded-full blur-[80px] pointer-events-none"></div>

          <div className="relative z-10 w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[2rem] rotate-3 flex items-center justify-center mb-8 shadow-lg shadow-emerald-500/30">
            <div className="absolute inset-0 bg-white/20 rounded-[2rem] -rotate-6 transition-transform hover:rotate-0 duration-500"></div>
            <svg
              className="w-12 h-12 text-white relative z-20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>

          <h2 className="relative z-10 text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-4 leading-tight">
            {t("heroTitleLine1") || "Manevi Yaşamınızı"} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">
              {t("heroTitleLine2") || "Dijitalde Yeşertin"}
            </span>
          </h2>

          <p className="relative z-10 text-gray-600 dark:text-gray-300 text-base md:text-lg leading-relaxed max-w-2xl mx-auto font-medium mt-4">
            <strong className="text-emerald-700 dark:text-emerald-400 font-black">
              SURA
            </strong>{" "}
            {t("heroDescription") ||
              "(Spiritual Union for Reflection & Affinity), modern çağın hızında maneviyatını korumak ve geliştirmek isteyenler için özel olarak tasarlandı."}
          </p>
        </div>

        {/* 2. HİKAYEMİZ & VİZYON */}
        <div className="bg-emerald-50/50 dark:bg-[#0a1f1a]/50 rounded-[2.5rem] p-8 md:p-10 border border-emerald-100 dark:border-emerald-900/30">
          <h3 className="text-xl font-black text-emerald-800 dark:text-emerald-400 mb-4 uppercase tracking-widest text-center">
            {t("whyWeAreHereTitle") || "Neden Buradayız?"}
          </h3>
          <div className="space-y-4 text-gray-700 dark:text-gray-300 text-sm md:text-base leading-relaxed text-center max-w-3xl mx-auto">
            <p
              dangerouslySetInnerHTML={{
                __html:
                  t("whyWeAreHereP1") ||
                  "Günümüzde ekran başında geçirdiğimiz süre artarken, manevi alışkanlıklarımızı sürdürmek giderek zorlaşıyor. SURA olarak biz, teknolojiyi dikkat dağıtıcı bir unsur olmaktan çıkarıp, <b>kulluk şuurumuzu besleyen bir araca</b> dönüştürmek için yola çıktık.",
              }}
            />
            <p
              dangerouslySetInnerHTML={{
                __html:
                  t("whyWeAreHereP2") ||
                  "İsmimiz <b>SURA</b> (Spiritual Union for Reflection & Affinity); tefekkür, manevi bağ ve ünsiyet için ruhsal bir birlikteliği ifade ediyor. Hem tekil ibadetlerinizde derinleştiğiniz hem de uzaklardaki kardeşlerinizle aynı hatim veya zikir halkasında buluştuğunuz dijital bir sığınak tasarladık.",
              }}
            />
          </div>
        </div>

        {/* 3. ÖNE ÇIKAN ÖZELLİKLER (GRID) */}
        <div className="space-y-6">
          <h3 className="text-center text-lg md:text-xl font-black text-gray-800 dark:text-gray-200 uppercase tracking-widest px-4">
            {t("whatIsOnOurPlatformTitle") || "Platformumuzda Neler Var?"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`bg-white dark:bg-gray-900 rounded-[2rem] p-6 shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-800 transition-all duration-300 hover:-translate-y-1 ${feature.border} group`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${feature.bg} ${feature.color}`}
                  >
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-2">
                      {feature.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. TEŞEKKÜR / KAPANIŞ VE BAĞIŞ (DONATION) ALANI */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-800 rounded-[2.5rem] p-8 md:p-12 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col items-center">
            <svg
              className="w-8 h-8 text-emerald-200/50 mb-4"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>

            <h2 className="text-xl md:text-3xl font-black text-white mb-4 tracking-tight">
              {t("adFreeFreeForYouTitle") || "Reklamsız. Ücretsiz. Sizin İçin."}
            </h2>

            <p className="text-emerald-100/90 mb-8 max-w-lg mx-auto text-sm md:text-base leading-relaxed">
              {t("donationDescription") ||
                "SURA'nın büyümesine, sunucu maliyetlerine ve yeni özelliklerin geliştirilmesine maddi olarak destek olmak isterseniz bağışta bulunabilirsiniz."}
            </p>

            {/* Aksiyon Butonları */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full">
              <button
                onClick={() => setIsDonationModalOpen(true)}
                className="w-full sm:w-auto px-8 py-3.5 bg-white text-emerald-900 hover:bg-emerald-50 rounded-2xl font-black uppercase tracking-widest text-xs sm:text-sm transition-all shadow-lg active:scale-95 border border-transparent flex items-center justify-center gap-2"
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
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                {t("donateButton") || "Bağış Yap"}
              </button>

              <button
                onClick={() =>
                  window.open(
                    "https://mail.google.com/mail/?view=cm&fs=1&to=imdatcelikuu@gmail.com",
                    "_blank",
                  )
                }
                className="w-full sm:w-auto px-8 py-3.5 bg-emerald-800/50 hover:bg-emerald-800 text-white border border-emerald-700/50 hover:border-emerald-600 rounded-2xl font-black uppercase tracking-widest text-xs sm:text-sm transition-all shadow-lg active:scale-95 backdrop-blur-md flex items-center justify-center gap-2"
              >
                {t("contactUsButton") || "İletişime Geç"}
              </button>
            </div>
          </div>
        </div>

        {/* Footer Link / Versiyon */}
        <div className="text-center pb-8">
          <p className="text-xs font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest">
            SURA App © {new Date().getFullYear()}
          </p>
        </div>
      </div>

      {/* IBAN BAĞIŞ MODALI */}
      {isDonationModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-6 md:p-8 max-w-md w-full shadow-2xl relative animate-in zoom-in-95">
            {/* Kapatma Butonu */}
            <button
              onClick={() => setIsDonationModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600 dark:text-emerald-400">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white">
                {t("donationModalTitle") || "Destek Olun"}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {t("donationModalDesc") ||
                  "Aşağıdaki banka hesap bilgilerini kullanarak projemize destekte bulunabilirsiniz. Allah razı olsun."}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800 space-y-3">
              <div>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                  {t("bankNameLabel") || "Banka"}
                </p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {t("bankNameValue") || "Ziraat Bankası"}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                  {t("receiverNameLabel") || "Alıcı Adı Soyadı"}
                </p>
                <div className="flex items-center justify-between gap-2 bg-white dark:bg-gray-900 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    İmdat Çelik
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText("İmdat Çelik");
                      alert(t("nameCopiedAlert") || "İsim Kopyalandı!");
                    }}
                    className="p-1.5 text-gray-500 hover:text-emerald-600 transition-colors"
                    title={t("copyButtonTooltip") || "Kopyala"}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                  {t("ibanLabel") || "IBAN"}
                </p>
                <div className="flex items-center justify-between gap-2 bg-white dark:bg-gray-900 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
                  <code className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    TR00 0000 0000 0000 0000 0000 00
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        "TR00 0000 0000 0000 0000 0000 00",
                      );
                      alert(t("ibanCopiedAlert") || "IBAN Kopyalandı!");
                    }}
                    className="p-1.5 text-gray-500 hover:text-emerald-600 transition-colors"
                    title={t("copyButtonTooltip") || "Kopyala"}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AboutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FDFCF7] dark:bg-[#061612]">
          <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
        </div>
      }
    >
      <AboutContent />
    </Suspense>
  );
}
