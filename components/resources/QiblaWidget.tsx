/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useCallback } from "react";

// Kâbe'nin Koordinatları
const KAABA_LAT = 21.422487;
const KAABA_LON = 39.826206;

// Kıble Açısını Hesaplayan Formül
function getQiblaAngle(lat: number, lon: number) {
  const PI = Math.PI;
  const latK = KAABA_LAT * (PI / 180.0);
  const lonK = KAABA_LON * (PI / 180.0);
  const phi = lat * (PI / 180.0);
  const lambda = lon * (PI / 180.0);

  const y = Math.sin(lonK - lambda);
  const x =
    Math.cos(phi) * Math.tan(latK) - Math.sin(phi) * Math.cos(lonK - lambda);

  const qibla = Math.atan2(y, x) * (180.0 / PI);
  return (qibla + 360) % 360;
}

export default function QiblaWidget() {
  const [qiblaAngle, setQiblaAngle] = useState<number | null>(null);
  const [compassHeading, setCompassHeading] = useState<number>(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCompassActive, setIsCompassActive] = useState(false);

  // Konum Bulma
  const findLocation = () => {
    setLoading(true);
    setError("");
    if (!navigator.geolocation) {
      setError("Tarayıcınız konum özelliğini desteklemiyor.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const angle = getQiblaAngle(
          position.coords.latitude,
          position.coords.longitude,
        );
        setQiblaAngle(Math.round(angle));
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setError(
          "Konum izni reddedildi. Kıbleyi hesaplamak için konum gereklidir.",
        );
        setLoading(false);
      },
    );
  };

  // Pusula Verisini Okuma
   const handleOrientation = useCallback((event: any) => {
    let heading = 0;
    if (event.webkitCompassHeading) {
      heading = event.webkitCompassHeading;
    } else if (event.alpha) {
      heading = 360 - event.alpha;
    }
    setCompassHeading(heading);
  }, []);

  // Pusula İzni İsteme
  const startCompass = async () => {
     if (
      typeof (DeviceOrientationEvent as any).requestPermission === "function"
    ) {
      try {
         const permission = await (
          DeviceOrientationEvent as any
        ).requestPermission();
        if (permission === "granted") {
          window.addEventListener("deviceorientation", handleOrientation, true);
          setIsCompassActive(true);
        } else {
          setError("Pusula sensörü izni reddedildi.");
        }
      } catch (err) {
        setError("Pusula başlatılamadı. Cihazınız desteklemiyor olabilir.");
      }
    } else {
      window.addEventListener(
        "deviceorientationabsolute",
        handleOrientation,
        true,
      );
      setIsCompassActive(true);
    }
  };

  useEffect(() => {
    return () => {
      window.removeEventListener("deviceorientation", handleOrientation, true);
      window.removeEventListener(
        "deviceorientationabsolute",
        handleOrientation,
        true,
      );
    };
  }, [handleOrientation]);

  // --- MATEMATİK VE HİZALAMA MANTIĞI ---
  const rotation = qiblaAngle !== null ? qiblaAngle - compassHeading : 0;
  const normalizedRotation = ((rotation % 360) + 360) % 360;
  const shortestDiff =
    normalizedRotation > 180 ? 360 - normalizedRotation : normalizedRotation;

  // Eğer henüz hesaplanmadıysa "isAligned" false kalır, hesaplandıysa ve sapma 5 dereceden az ise tam kıblededir!
  const isAligned = qiblaAngle !== null && shortestDiff <= 5;

  // Titreşim (Haptic Feedback) - Tam kıbleye gelince titrer
  useEffect(() => {
    if (isAligned && navigator.vibrate) {
      navigator.vibrate(50);
    }
  }, [isAligned]);

  // Akıllı Yönlendirici Metin
  const getDirectionText = () => {
    if (isAligned) return "Tam Kıbledesiniz!";
    if (normalizedRotation > 5 && normalizedRotation <= 180)
      return "Sağa doğru dönün ➔";
    if (normalizedRotation > 180 && normalizedRotation < 355)
      return "⬅ Sola doğru dönün";
    return "";
  };

  return (
    <div
      className={`bg-white/80 dark:bg-[#0a1f1a] backdrop-blur-md rounded-[2.5rem] p-5 md:p-6 shadow-sm border transition-colors duration-500 relative overflow-hidden mt-6 flex flex-col ${isAligned ? "border-emerald-500/50 shadow-emerald-500/20" : "border-emerald-100 dark:border-emerald-900/30"}`}
    >
      {/* Arka Plan Parlaması (Yeşil veya Standart) */}
      <div
        className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none transition-colors duration-500 ${isAligned ? "bg-emerald-400/20" : "bg-emerald-400/10"}`}
      ></div>

      <div className="relative z-10 w-full">
        {/* BAŞLIK VE BUTON (Diğer Widget'larla Aynı Hizalama) */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h3 className="text-xl md:text-2xl font-black text-gray-800 dark:text-white flex items-center gap-2">
              Kıble Pusulası
              <span className="text-emerald-500 text-2xl leading-none">🕋</span>
            </h3>
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-1">
              Seccadeyi Kâbe ikonuyla hizalayın.
            </p>
          </div>

          {/* Sadece qiblaAngle hesaplanmadıysa (başlangıçta) butonu sağda göster */}
          {qiblaAngle === null && (
            <button
              onClick={findLocation}
              disabled={loading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm transition-all active:scale-95 disabled:opacity-70"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
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
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              )}
              Hesapla
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm font-bold mb-4 border border-red-100 dark:border-red-900/30 text-center">
            {error}
          </div>
        )}

        {/* PUSULA ALANI (Bu Kısım Ortalanmış Kalır) */}
        {qiblaAngle !== null && (
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-700 w-full mt-2">
            {/* Yönlendirme Metni */}
            <div
              className={`mb-4 px-4 py-1.5 rounded-full text-sm font-black transition-colors duration-500 ${isAligned ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400" : "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400"}`}
            >
              {getDirectionText()}
            </div>

            {/* PUSULA DAİRESİ */}
            <div className="relative w-64 h-64 md:w-72 md:h-72 rounded-full border-4 border-gray-100 dark:border-gray-800 shadow-inner bg-gray-50/50 dark:bg-gray-800/20 flex items-center justify-center my-4">
              {/* SABİT SECCADE (Kullanıcının Telefonu) */}
              <div
                className={`absolute z-20 flex flex-col items-center justify-center transition-colors duration-500 ${isAligned ? "text-emerald-500" : "text-red-500"}`}
              >
                <svg viewBox="0 0 64 100" className="w-16 h-28 drop-shadow-xl">
                  {/* Seccade Dış Hat */}
                  <path
                    d="M12 90 V35 L32 10 L52 35 V90 Z"
                    fill="currentColor"
                  />
                  {/* Seccade İç Desen */}
                  <path
                    d="M18 84 V38 L32 20 L46 38 V84 Z"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeOpacity="0.5"
                  />
                  {/* Seccade Secde Yeri Noktası */}
                  <circle
                    cx="32"
                    cy="35"
                    r="4"
                    fill="white"
                    fillOpacity="0.8"
                  />
                </svg>
              </div>

              {/* DÖNEN ÇEMBER VE KÂBE İKONU */}
              <div
                className={`w-full h-full absolute transition-transform duration-300 ease-out rounded-full border-4 border-dashed ${isAligned ? "border-emerald-400" : "border-gray-300 dark:border-gray-600"}`}
                style={{ transform: `rotate(${rotation}deg)` }}
              >
                {/* Çemberin Üstündeki Kâbe İşaretçisi */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center shadow-lg border-2 border-gray-100 dark:border-gray-800 z-30">
                  <span className="text-xl leading-none">🕋</span>
                </div>
              </div>
            </div>

            {/* CANLI PUSULA BUTONU */}
            {!isCompassActive && (
              <button
                onClick={startCompass}
                className="mt-6 flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all hover:opacity-90 active:scale-95"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Canlı Pusulayı Aç
              </button>
            )}

            {isCompassActive && (
              <p className="mt-6 text-xs text-gray-500 font-medium max-w-xs text-center">
                Telefonunuzu yere paralel tutun ve 8 (sekiz) çizecek şekilde
                hareket ettirerek kalibre edin.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
