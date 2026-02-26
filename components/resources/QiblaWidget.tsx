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
  return (qibla + 360) % 360; // 0-360 derece arasına normalize et
}

export default function QiblaWidget() {
  const [qiblaAngle, setQiblaAngle] = useState<number | null>(null);
  const [compassHeading, setCompassHeading] = useState<number>(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCompassActive, setIsCompassActive] = useState(false);

  // 1. Kullanıcının Konumunu ve Kıble Açısını Bul
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

  // 2. Canlı Pusula (Cihaz Sensörü) Okuma
  const handleOrientation = useCallback((event: any) => {
    let heading = 0;
    // iOS için webkitCompassHeading, Android için alpha
    if (event.webkitCompassHeading) {
      heading = event.webkitCompassHeading;
    } else if (event.alpha) {
      // Android alpha ters çalışabilir, 360'tan çıkarıyoruz
      heading = 360 - event.alpha;
    }
    setCompassHeading(heading);
  }, []);

  // 3. Pusula İzni İsteme (Özellikle iOS 13+ için zorunlu)
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
          setIsCompassActive(true); // Sadece bu kalacak
        } else {
          setError("Pusula sensörü izni reddedildi.");
        }
      } catch (err) {
        setError("Pusula başlatılamadı. Cihazınız desteklemiyor olabilir.");
      }
    } else {
      // Android veya eski cihazlar (İzin istemeye gerek yok)
      window.addEventListener(
        "deviceorientationabsolute",
        handleOrientation,
        true,
      );
      setIsCompassActive(true); // Sadece bu kalacak
    }
  };

  // Bileşen kalktığında dinleyiciyi temizle
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

  // Pusula ibresinin dönüş açısı (Kıble Açısı - Telefonun Baktığı Yön)
  const rotation = qiblaAngle !== null ? qiblaAngle - compassHeading : 0;

  return (
    <div className="bg-white/80 dark:bg-[#0a1f1a] backdrop-blur-md rounded-[2.5rem] p-6 md:p-8 shadow-sm border border-emerald-100 dark:border-emerald-900/30 relative overflow-hidden mt-6 flex flex-col items-center">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

      <div className="relative z-10 w-full text-center">
        <h3 className="text-xl md:text-2xl font-black text-gray-800 dark:text-white flex items-center justify-center gap-2 mb-2">
          Kıble Pusulası
          <span className="text-emerald-500">🕋</span>
        </h3>
        <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-6">
          Kıble yönünü hassas bir şekilde bulun.
        </p>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm font-bold mb-4 border border-red-100 dark:border-red-900/30">
            {error}
          </div>
        )}

        {qiblaAngle === null ? (
          // BAŞLANGIÇ EKRANI (KONUM İSTEYEN BUTON)
          <button
            onClick={findLocation}
            disabled={loading}
            className="w-full sm:w-auto mx-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold shadow-sm transition-all active:scale-95 disabled:opacity-70"
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
            Kıbleyi Hesapla
          </button>
        ) : (
          // PUSULA EKRANI
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-700">
            <div className="mb-4 text-center">
              <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                {qiblaAngle}°
              </span>
              <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                Kuzeye Göre Kıble Açısı
              </span>
            </div>

            {/* PUSULA ÇEMBERİ */}
            <div className="relative w-64 h-64 md:w-72 md:h-72 rounded-full border-4 border-emerald-100 dark:border-emerald-900/50 shadow-inner bg-gray-50 dark:bg-gray-800/30 flex items-center justify-center my-4">
              {/* Kuzey İşareti (Sabit) */}
              <div className="absolute top-2 text-red-500 font-black text-sm z-20">
                N
              </div>
              <div className="absolute bottom-2 text-gray-400 font-bold text-xs z-20">
                S
              </div>
              <div className="absolute right-3 text-gray-400 font-bold text-xs z-20">
                E
              </div>
              <div className="absolute left-3 text-gray-400 font-bold text-xs z-20">
                W
              </div>

              {/* Dönen Pusula İbresi (Kâbe'yi Gösteren) */}
              <div
                className="w-full h-full absolute transition-transform duration-300 ease-out flex flex-col items-center"
                style={{ transform: `rotate(${rotation}deg)` }}
              >
                {/* İbrenin Üst Tarafı (Kâbe İkonu) */}
                <div className="h-1/2 w-full flex items-start justify-center pt-8">
                  <div className="flex flex-col items-center">
                    <span className="text-4xl filter drop-shadow-md">🕋</span>
                    <div className="w-1 h-12 bg-emerald-500 mt-2 rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Merkez Nokta */}
              <div className="w-4 h-4 rounded-full bg-emerald-600 dark:bg-emerald-400 z-30 shadow-md"></div>
            </div>

            {/* CANLI PUSULA BAŞLATMA BUTONU */}
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
              <p className="mt-6 text-xs text-gray-500 font-medium">
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
