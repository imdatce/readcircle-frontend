"use client";
import Link from "next/link";
import QRCode from "react-qr-code";
import { useLanguage } from "@/context/LanguageContext";

interface SuccessViewProps {
  createdSessionName: string;
  createdCode: string;
  createdLink: string;
  creatorName: string;
  onReset: () => void;
}

export default function SuccessView({
  createdSessionName,
  createdCode,
  createdLink,
  creatorName,
  onReset,
}: SuccessViewProps) {
  const { t } = useLanguage();

  const handleCopyCode = () => {
    navigator.clipboard.writeText(createdCode);
    alert(t("copied") || "Kopyalandı!");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(createdLink);
    alert(t("copied") || "Kopyalandı!");
  };

  // Dinamik WhatsApp metni için güvenli fallback.
  // Bu metni doğrudan dil dosyasından çekeceğiz ama eksikse bozulmasını istemeyiz.
  const whatsappTemplate =
    t("whatsappShareText") ||
    "{creator} sizi {name} halkasına davet ediyor.\n\nKatılmak için tıklayın: {link}\n\nVeya kod ile katılın: {code}";

  const whatsappMessage = whatsappTemplate
    .replace("{creator}", creatorName)
    .replace("{name}", createdSessionName ? `"${createdSessionName}" ` : "")
    .replace("{link}", createdLink)
    .replace("{code}", createdCode);

  return (
    <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl border border-green-200 dark:border-green-900 rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-14 text-center animate-in fade-in zoom-in duration-500 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
      <div className="w-16 h-16 md:w-24 md:h-24 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto mb-6 md:mb-8 transform rotate-3 shadow-inner">
        <svg
          className="w-8 h-8 md:w-12 md:h-12"
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
      </div>
      <h2 className="text-xl md:text-3xl font-black mb-1.5 dark:text-white leading-tight">
        {t("sessionCreated") || "Halka Başarıyla Oluşturuldu"}
      </h2>
      {createdSessionName && (
        <p className="text-sm md:text-xl text-blue-600 dark:text-blue-400 font-bold mb-8">
          &quot;{createdSessionName}&quot;
        </p>
      )}
      <div className="bg-gray-50 dark:bg-black/30 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] mb-8 md:mb-10 border-2 border-dashed border-gray-200 dark:border-gray-800">
        <p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
          {t("sessionCodePlaceholder") || "DAVET KODU"}
        </p>
        <span className="text-2xl md:text-5xl font-mono font-black text-blue-600 dark:text-blue-400 tracking-[0.1em] md:tracking-[0.2em]">
          {createdCode}
        </span>
      </div>

      <div className="flex flex-col items-center justify-center mb-8 p-6 bg-white rounded-[1.5rem] border-2 border-gray-100 shadow-sm mx-auto w-fit">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
          {t("scanQrToJoin") || "KATILMAK İÇİN TARATIN"}
        </p>
        <div className="p-2 bg-white rounded-xl">
          <QRCode value={createdLink} size={160} level="H" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        <button
          onClick={handleCopyCode}
          className="w-full py-3.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-2 border-gray-100 dark:border-gray-700 rounded-xl md:rounded-2xl font-bold hover:bg-gray-50 transition-all active:scale-95 text-sm"
        >
          {t("copyCode") || "Kodu Kopyala"}
        </button>
        <button
          onClick={handleCopyLink}
          className="w-full py-3.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl md:rounded-2xl font-bold active:scale-95 text-sm"
        >
          {t("copyLink") || "Bağlantıyı Kopyala"}
        </button>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="sm:col-span-2 block w-full py-3.5 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl md:rounded-2xl font-bold shadow-md transition-all active:scale-95 text-sm flex items-center justify-center gap-2"
        >
          <svg
            className="w-5 h-5 md:w-6 md:h-6 fill-current"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          <span>{t("shareWhatsapp") || "WhatsApp ile Gönder"}</span>
        </a>
        <Link
          href={`/join/${createdCode}`}
          className="sm:col-span-2 block w-full py-4 md:py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl md:rounded-2xl font-black text-base md:text-lg shadow-lg active:scale-95 transition-all"
        >
          {t("startReading") || "Okumaya Başla"}
        </Link>
      </div>
      <button
        onClick={onReset}
        className="mt-8 text-[10px] font-bold text-gray-400 hover:text-gray-600 underline transition-colors tracking-widest uppercase"
      >
        {t("createNewOne") || "Yeni Bir Halka Daha Kur"}
      </button>
    </div>
  );
}
