/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useRef } from "react";

// Vakit İsimleri (İngilizce -> Türkçe)
const PRAYER_NAMES: Record<string, string> = {
  Fajr: "İmsak",
  Sunrise: "Güneş",
  Dhuhr: "Öğle",
  Asr: "İkindi",
  Maghrib: "Akşam",
  Isha: "Yatsı",
};

export default function PrayerTimesWidget() {
  const [timings, setTimings] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState(true);

  // --- LOKASYON STATELERİ ---
  const [country, setCountry] = useState("Turkey");
  const [city, setCity] = useState("Istanbul");

  // --- DÜZENLEME (AUTOCOMPLETE) STATELERİ ---
  const [isEditing, setIsEditing] = useState(false);
  const [editCountry, setEditCountry] = useState("");
  const [editCity, setEditCity] = useState("");

  // API'den Gelen Listeler
  const [countryList, setCountryList] = useState<string[]>([]);
  const [cityList, setCityList] = useState<string[]>([]);

  // Kullanıcının yazdığına göre filtrelenen (Ekranda görünen) listeler
  const [filteredCountries, setFilteredCountries] = useState<string[]>([]);
  const [filteredCities, setFilteredCities] = useState<string[]>([]);

  const wrapperRef = useRef<HTMLDivElement>(null);

  // 1. Sayfa yüklendiğinde hafızadaki lokasyonu al
  useEffect(() => {
    const savedLoc = localStorage.getItem("prayer_location");
    if (savedLoc) {
      const parsed = JSON.parse(savedLoc);
      if (parsed.country && parsed.city) {
        setCountry(parsed.country);
        setCity(parsed.city);
      }
    }
  }, []);

  // 2. Şehir/Ülke değiştiğinde namaz vakitlerini Aladhan API'den çek
  useEffect(() => {
    async function fetchPrayerTimes() {
      setLoading(true);
      try {
        const res = await fetch(
          `https://api.aladhan.com/v1/timingsByAddress?address=${encodeURIComponent(
            `${city}, ${country}`,
          )}&method=13`,
        );
        const data = await res.json();

        if (data.code === 200) {
          setTimings(data.data.timings);
        } else {
          setTimings(null);
        }
      } catch (error) {
        console.error("Vakitler çekilemedi:", error);
        setTimings(null);
      } finally {
        setLoading(false);
      }
    }

    fetchPrayerTimes();
  }, [city, country]);

  // 3. Düzenleme Modu Açıldığında Ülke Listesini Çek
  const handleEditOpen = async () => {
    setIsEditing(true);
    setEditCountry(country);
    setEditCity(city);
    setFilteredCountries([]);
    setFilteredCities([]);

    if (countryList.length === 0) {
      try {
        const res = await fetch(
          "https://countriesnow.space/api/v0.1/countries/iso",
        );
        const data = await res.json();
        if (!data.error) {
          setCountryList(data.data.map((c: any) => c.name));
        }
      } catch (err) {
        console.error("Ülkeler yüklenemedi", err);
      }
    }
  };

  // 4. Ülke Yazarken Filtreleme
  const handleCountryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEditCountry(val);
    if (val.length > 0) {
      const matches = countryList.filter((c) =>
        c.toLowerCase().startsWith(val.toLowerCase()),
      );
      setFilteredCountries(matches);
    } else {
      setFilteredCountries([]);
    }
  };

  // 5. Ülke Seçildiğinde O Ülkenin Şehirlerini Çek
  const handleCountrySelect = async (selected: string) => {
    setEditCountry(selected);
    setFilteredCountries([]);
    setEditCity(""); // Şehri sıfırla
    setCityList([]);

    try {
      const res = await fetch(
        "https://countriesnow.space/api/v0.1/countries/cities",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ country: selected }),
        },
      );
      const data = await res.json();
      if (!data.error) {
        setCityList(data.data);
      }
    } catch (err) {
      console.error("Şehirler yüklenemedi", err);
    }
  };

  // 6. Şehir Yazarken Filtreleme
  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEditCity(val);
    if (val.length > 0) {
      const matches = cityList.filter((c) =>
        c.toLowerCase().startsWith(val.toLowerCase()),
      );
      setFilteredCities(matches);
    } else {
      setFilteredCities([]);
    }
  };

  // 7. Şehir Seçimi
  const handleCitySelect = (selected: string) => {
    setEditCity(selected);
    setFilteredCities([]);
  };

  // 8. Kaydet Butonu
  const handleSaveLocation = () => {
    if (editCountry.trim() && editCity.trim()) {
      setCountry(editCountry.trim());
      setCity(editCity.trim());
      localStorage.setItem(
        "prayer_location",
        JSON.stringify({
          country: editCountry.trim(),
          city: editCity.trim(),
        }),
      );
      setIsEditing(false);
    }
  };

  return (
    <div
      ref={wrapperRef}
      className="bg-white/80 dark:bg-[#0a1f1a] backdrop-blur-md rounded-[2.5rem] p-5 md:p-6 shadow-sm border border-emerald-100 dark:border-emerald-900/30 relative"
    >
      {/* Dekoratif Arka Plan Işığı */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 relative z-10 gap-4">
        <div className="w-full">


          {/* --- LOKASYON DÜZENLEME ARAYÜZÜ --- */}
          {isEditing ? (
            <div className="flex flex-col gap-3 mt-4 w-full max-w-md animate-in fade-in">
              <div className="flex gap-2">
                {/* ÜLKE İNPUTU */}
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={editCountry}
                    onChange={handleCountryChange}
                    placeholder="Ülke (Örn: Belgium, Turkey)"
                    className="w-full bg-white dark:bg-gray-800 border-2 border-emerald-200 dark:border-emerald-700 rounded-xl px-3 py-2 text-sm font-bold text-gray-800 dark:text-white outline-none focus:border-emerald-500 shadow-sm"
                  />
                  {filteredCountries.length > 0 && (
                    <ul className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-40 overflow-y-auto overflow-x-hidden hide-scrollbar text-sm">
                      {filteredCountries.map((c) => (
                        <li
                          key={c}
                          onClick={() => handleCountrySelect(c)}
                          className="px-3 py-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 cursor-pointer text-gray-700 dark:text-gray-200"
                        >
                          {c}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* ŞEHİR İNPUTU */}
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={editCity}
                    onChange={handleCityChange}
                    placeholder="Şehir (Örn: Brussels)"
                    className="w-full bg-white dark:bg-gray-800 border-2 border-emerald-200 dark:border-emerald-700 rounded-xl px-3 py-2 text-sm font-bold text-gray-800 dark:text-white outline-none focus:border-emerald-500 shadow-sm disabled:opacity-50"
                  />
                  {filteredCities.length > 0 && (
                    <ul className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-40 overflow-y-auto overflow-x-hidden hide-scrollbar text-sm">
                      {filteredCities.map((c) => (
                        <li
                          key={c}
                          onClick={() => handleCitySelect(c)}
                          className="px-3 py-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 cursor-pointer text-gray-700 dark:text-gray-200"
                        >
                          {c}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* BUTONLAR */}
              <div className="flex gap-2">
                <button
                  onClick={handleSaveLocation}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl text-sm font-bold shadow-sm transition-colors"
                >
                  Kaydet
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-gray-300 transition-colors"
                >
                  İptal
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 mt-2">
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest capitalize">
                {city}, {country}
              </p>
              <button
                onClick={handleEditOpen}
                className="bg-gray-100 dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors border border-gray-200 dark:border-gray-700"
                title="Lokasyonu Değiştir"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-6">
          <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
        </div>
      ) : timings ? (
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 relative z-10">
          {Object.keys(PRAYER_NAMES).map((key) => {
            const trName = PRAYER_NAMES[key];
            const time = timings[key];

            return (
              <div
                key={key}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all duration-300 cursor-default"
              >
                <span className="text-[10px] md:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">
                  {trName}
                </span>
                <span className="text-lg md:text-xl font-black text-emerald-700 dark:text-emerald-400">
                  {time}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center bg-red-50 dark:bg-red-900/20 rounded-2xl p-4 border border-red-100 dark:border-red-900/30 relative z-10">
          <p className="text-red-600 dark:text-red-400 font-bold text-sm">
            Lokasyon bulunamadı. Lütfen uluslararası (İngilizce) isimleri
            seçtiğinizden veya doğru yazdığınızdan emin olun.
          </p>
        </div>
      )}
    </div>
  );
}
