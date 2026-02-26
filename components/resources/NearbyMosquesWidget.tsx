/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";

// Mesafe Hesaplama Fonksiyonu (Kuş Uçuşu Metre)
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // Dünya yarıçapı (metre)
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export default function NearbyMosquesWidget() {
  const [mosques, setMosques] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const findMosques = () => {
    setError("");
    setLoading(true);
    setHasSearched(true);

    if (!navigator.geolocation) {
      setError("Tarayıcınız konum özelliğini desteklemiyor.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const userLat = position.coords.latitude;
        const userLon = position.coords.longitude;

        try {
          // Çapı tam 10 km (10000 metre) yaptık.
          const radius = 10000;
          const query = `
            [out:json][timeout:25];
            (
              node["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${userLat},${userLon});
              way["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${userLat},${userLon});
            );
            out center;
          `;

          const encodedQuery = encodeURIComponent(query);

          // YEDEK SUNUCULAR
          const endpoints = [
            "https://overpass-api.de/api/interpreter",
            "https://lz4.overpass-api.de/api/interpreter",
            "https://overpass.kumi.systems/api/interpreter",
          ];

          let data = null;
          let fetchSuccess = false;

          for (const endpoint of endpoints) {
            try {
              const res = await fetch(`${endpoint}?data=${encodedQuery}`);

              if (res.ok) {
                data = await res.json();
                fetchSuccess = true;
                break; // Başarılı olursa döngüden çık
              } else {
                // 429, 504 vb. HERHANGİ BİR hatada diğer sunucuya geç
                console.warn(
                  `${endpoint} başarısız (Hata Kodu: ${res.status}), diğerine geçiliyor...`,
                );
              }
            } catch (e) {
              console.warn(`${endpoint} yanıt vermedi, diğerine geçiliyor...`);
            }
          }

          if (!fetchSuccess || !data) {
            throw new Error("Tüm sunucular meşgul veya zaman aşımına uğradı.");
          }

          // Gelen verileri işle ve mesafeyi hesapla
          const processedMosques = data.elements.map((el: any) => {
            const mLat = el.lat || el.center?.lat;
            const mLon = el.lon || el.center?.lon;
            const name = el.tags?.name || "İsimsiz Cami / Mescit";
            const distance = getDistance(userLat, userLon, mLat, mLon);

            return { id: el.id, name, lat: mLat, lon: mLon, distance };
          });

          // Mesafeye göre sırala ve en yakın 5'ini al
          const sorted = processedMosques
            .sort((a: any, b: any) => a.distance - b.distance)
            .slice(0, 5);

          if (sorted.length === 0) {
            setError(
              `Çevrenizde (${radius / 1000} km) kayıtlı cami bulunamadı.`,
            );
          } else {
            setMosques(sorted);
          }
        } catch (err: any) {
          console.error(err);
          setError(
            "Harita sunucuları şu an çok yoğun. Lütfen 1-2 dakika bekleyip tekrar deneyin.",
          );
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error(err);
        setError(
          "Konum izni reddedildi veya konum alınamadı. Lütfen tarayıcı ayarlarından izin verin.",
        );
        setLoading(false);
      },
    );
  };

  return (
    <div className="bg-white/80 dark:bg-[#0a1f1a] backdrop-blur-md rounded-[2.5rem] p-5 md:p-6 shadow-sm border border-emerald-100 dark:border-emerald-900/30 relative overflow-hidden mt-6">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <div>
            <h3 className="text-xl md:text-2xl font-black text-gray-800 dark:text-white flex items-center gap-2">
              Yakındaki Camiler
              <span className="text-emerald-500">🕌</span>
            </h3>
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-1">
              Konumunuza en yakın ibadethaneleri bulun.
            </p>
          </div>

          <button
            onClick={findMosques}
            disabled={loading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm transition-all active:scale-95 disabled:opacity-70"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Aranıyor...
              </>
            ) : (
              <>
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
                Yakınımda Bul
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-2xl text-sm font-bold border border-red-100 dark:border-red-900/30">
            {error}
          </div>
        )}

        {!loading && !error && hasSearched && mosques.length > 0 && (
          <div className="grid grid-cols-1 gap-3 mt-4 animate-in fade-in slide-in-from-bottom-4">
            {mosques.map((mosque, index) => (
              <div
                key={mosque.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-black shrink-0">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 dark:text-gray-200">
                      {mosque.name}
                    </h4>
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-500 mt-0.5">
                      {mosque.distance < 1000
                        ? `${Math.round(mosque.distance)} metre uzaklıkta`
                        : `${(mosque.distance / 1000).toFixed(1)} km uzaklıkta`}
                    </p>
                  </div>
                </div>

                {/* DOĞRU GOOGLE MAPS LİNKİ VE DÜZELTİLMİŞ SVG ETİKETİ */}
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${mosque.lat},${mosque.lon}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 p-2.5 bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors shrink-0"
                  title="Yol Tarifi Al"
                >
                  <span className="text-xs font-bold hidden sm:block">GİT</span>
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
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                    />
                  </svg>
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
