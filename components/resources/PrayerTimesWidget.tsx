/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useRef } from "react";

const PRAYER_NAMES: Record<string, string> = {
  Fajr: "İmsak",
  Sunrise: "Güneş",
  Dhuhr: "Öğle",
  Asr: "İkindi",
  Maghrib: "Akşam",
  Isha: "Yatsı",
};

const normalizeTR = (s: string) =>
  s
    .toUpperCase()
    .replace(/İ/g, "I")
    .replace(/İ/g, "i")
    .replace(/Ğ/g, "G")
    .replace(/Ş/g, "S")
    .replace(/Ü/g, "U")
    .replace(/Ö/g, "O")
    .replace(/Ç/g, "C")

    .replace(/ğ/g, "g")
    .replace(/Ğ/g, "g")
    .replace(/ş/g, "s")
    .replace(/Ş/g, "s")
    .replace(/ü/g, "u")
    .replace(/Ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/Ö/g, "o")
    .replace(/Ç/g, "ç")
    .replace(/Ç/g, "c")
    .replace(/Ç/g, "C")

    .replace(/ğ/g, "g")
    .replace(/Ğ/g, "g")
    .replace(/ş/g, "s")
    .replace(/Ş/g, "s")
    .replace(/ü/g, "u")
    .replace(/Ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/Ö/g, "o");

export default function PrayerTimesWidget() {
  const [timings, setTimings] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState(true);

  const [country, setCountry] = useState("Turkey");
  const [city, setCity] = useState("Istanbul");
  const [district, setDistrict] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [editCountry, setEditCountry] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editDistrict, setEditDistrict] = useState("");

  const [countryList, setCountryList] = useState<string[]>([]);
  const [cityList, setCityList] = useState<string[]>([]);
  const [turkeyDistricts, setTurkeyDistricts] = useState<string[]>([]);

  const [filteredCountries, setFilteredCountries] = useState<string[]>([]);
  const [filteredCities, setFilteredCities] = useState<string[]>([]);
  const [filteredDistricts, setFilteredDistricts] = useState<string[]>([]);
  const [showDistrictList, setShowDistrictList] = useState(false);

  const districtTimeout = useRef<any>(null);

  // 1. Hafızadan Yükle
  useEffect(() => {
    const savedLoc = localStorage.getItem("prayer_location");
    if (savedLoc) {
      try {
        const parsed = JSON.parse(savedLoc);
        if (parsed.country && parsed.city) {
          setCountry(parsed.country);
          setCity(parsed.city);
          if (parsed.district) setDistrict(parsed.district);
        }
      } catch (e) {
        console.error("Hafıza okuma hatası", e);
      }
    }
  }, []);

  // 2. Vakitleri Çek
  useEffect(() => {
    async function fetchPrayerTimes() {
      setLoading(true);
      try {
        const fullAddress = `${district ? district + ", " : ""}${city}, ${country}`;
        const res = await fetch(
          `https://api.aladhan.com/v1/timingsByAddress?address=${encodeURIComponent(fullAddress)}&method=13`,
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
  }, [city, country, district]);

  const handleEditOpen = async () => {
    setIsEditing(true);
    setEditCountry(country);
    setEditCity(city);
    setEditDistrict(district);
    setFilteredCountries([]);
    setFilteredCities([]);
    setFilteredDistricts([]);
    setShowDistrictList(false);

    if (countryList.length === 0) {
      try {
        const res = await fetch(
          "https://countriesnow.space/api/v0.1/countries/iso",
        );
        const data = await res.json();
        if (!data.error) setCountryList(data.data.map((c: any) => c.name));
      } catch (err) {
        console.error("Ülkeler yüklenemedi", err);
      }
    }

    if (country.trim()) {
      try {
        const res = await fetch(
          "https://countriesnow.space/api/v0.1/countries/cities",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ country }),
          },
        );
        const data = await res.json();
        if (!data.error) setCityList(data.data);
      } catch (err) {
        console.error("Şehirler yüklenemedi", err);
      }
    }

    if (country.toLowerCase() === "turkey" && city.trim()) {
      try {
        const res = await fetch("https://turkiyeapi.dev/api/v1/provinces");
        const data = await res.json();
        const province = data.data.find(
          (p: any) => normalizeTR(p.name) === normalizeTR(city),
        );
        if (province) {
          const dList = province.districts.map((d: any) => d.name);
          setTurkeyDistricts(dList);
        }
      } catch (err) {
        console.error("İlçeler yüklenemedi", err);
      }
    }
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEditCountry(val);
    setCityList([]);
    setEditCity("");
    setEditDistrict("");
    setTurkeyDistricts([]);
    setFilteredCountries(
      val.length > 0
        ? countryList.filter((c) => normalizeTR(c).includes(normalizeTR(val)))
        : [],
    );
  };

  const handleCountrySelect = async (selected: string) => {
    setEditCountry(selected);
    setFilteredCountries([]);
    setEditCity("");
    setEditDistrict("");
    setCityList([]);
    setTurkeyDistricts([]);

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
      if (!data.error) setCityList(data.data);
    } catch (err) {
      console.error("Şehirler yüklenemedi", err);
    }
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEditCity(val);
    setFilteredCities(
      val.length > 0
        ? cityList.filter((c) => normalizeTR(c).includes(normalizeTR(val)))
        : [],
    );
  };

  const handleCitySelect = async (selected: string) => {
    setEditCity(selected);
    setFilteredCities([]);
    setEditDistrict("");
    setFilteredDistricts([]);
    setShowDistrictList(false);

    if (
      editCountry.toLowerCase() === "turkey" ||
      editCountry.toLowerCase() === "türkiye"
    ) {
      try {
        const res = await fetch("https://turkiyeapi.dev/api/v1/provinces");
        const data = await res.json();
        const province = data.data.find(
          (p: any) => normalizeTR(p.name) === normalizeTR(selected),
        );
        if (province) {
          const dList = province.districts.map((d: any) => d.name);
          setTurkeyDistricts(dList);
          setFilteredDistricts(dList);
        } else {
          setTurkeyDistricts([]);
        }
      } catch (err) {
        console.error("Türkiye ilçeleri çekilemedi", err);
      }
    } else {
      setTurkeyDistricts([]);
    }
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEditDistrict(val);
    setShowDistrictList(true);

    if (turkeyDistricts.length > 0) {
      if (val.trim() === "") {
        setFilteredDistricts(turkeyDistricts);
      } else {
        setFilteredDistricts(
          turkeyDistricts.filter((d) =>
            normalizeTR(d).includes(normalizeTR(val)),
          ),
        );
      }
    } else {
      if (districtTimeout.current) clearTimeout(districtTimeout.current);
      if (val.trim().length >= 2 && editCity && editCountry) {
        districtTimeout.current = setTimeout(async () => {
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(val + ", " + editCity + ", " + editCountry)}&format=json&limit=10`,
            );
            const data = await res.json();
            const validClasses = ["place", "boundary"];
            const filteredResults = data.filter((item: any) =>
              validClasses.includes(item.class),
            );
            const uniqueNames = Array.from(
              new Set(filteredResults.map((item: any) => item.name)),
            ) as string[];
            setFilteredDistricts(uniqueNames.slice(0, 5));
          } catch (err) {}
        }, 500);
      } else {
        setFilteredDistricts([]);
      }
    }
  };

  const handleDistrictSelect = (selected: string) => {
    setEditDistrict(selected);
    setShowDistrictList(false);
  };

  const toggleDistrictDropdown = () => {
    if (!showDistrictList) {
      setShowDistrictList(true);
      if (turkeyDistricts.length > 0 && !editDistrict) {
        setFilteredDistricts(turkeyDistricts);
      }
    } else {
      setShowDistrictList(false);
    }
  };

  const handleSaveLocation = () => {
    if (editCountry.trim() && editCity.trim()) {
      setCountry(editCountry.trim());
      setCity(editCity.trim());
      setDistrict(editDistrict.trim());

      localStorage.setItem(
        "prayer_location",
        JSON.stringify({
          country: editCountry.trim(),
          city: editCity.trim(),
          district: editDistrict.trim(),
        }),
      );
      setIsEditing(false);
    }
  };

  return (
    <div className="bg-white/80 dark:bg-[#0a1f1a] backdrop-blur-md rounded-[2.5rem] p-5 md:p-6 shadow-sm border border-emerald-100 dark:border-emerald-900/30 relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

      <div className="flex flex-col mb-6 relative z-10">
        <div className="w-full">
          <h3 className="text-xl md:text-2xl font-black text-gray-800 dark:text-white flex items-center gap-2">
            Namaz Vakitleri
            <span className="text-emerald-500">🌙</span>
          </h3>

          {isEditing ? (
            <div className="flex flex-col gap-3 mt-4 w-full animate-in fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* ÜLKE KUTUSU */}
                <div className="relative">
                  <input
                    type="text"
                    value={editCountry}
                    onChange={handleCountryChange}
                    placeholder="Ülke (Örn: Turkey)"
                    className="w-full bg-white dark:bg-gray-800 border-2 border-emerald-200 dark:border-emerald-700 rounded-xl px-3 py-2 text-sm font-bold text-gray-800 dark:text-white outline-none focus:border-emerald-500 shadow-sm"
                  />
                  {filteredCountries.length > 0 && (
                    <ul className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-40 overflow-y-auto hide-scrollbar text-sm">
                      {filteredCountries.map((c) => (
                        <li
                          key={c}
                          onClick={() => handleCountrySelect(c)}
                          className="px-3 py-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 cursor-pointer"
                        >
                          {c}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* ŞEHİR KUTUSU */}
                <div className="relative">
                  <input
                    type="text"
                    value={editCity}
                    onChange={handleCityChange}
                    placeholder="Şehir (Örn: Istanbul)"
                    className="w-full bg-white dark:bg-gray-800 border-2 border-emerald-200 dark:border-emerald-700 rounded-xl px-3 py-2 text-sm font-bold text-gray-800 dark:text-white outline-none focus:border-emerald-500 shadow-sm disabled:opacity-50"
                  />
                  {filteredCities.length > 0 && (
                    <ul className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-40 overflow-y-auto hide-scrollbar text-sm">
                      {filteredCities.map((c) => (
                        <li
                          key={c}
                          onClick={() => handleCitySelect(c)}
                          className="px-3 py-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 cursor-pointer"
                        >
                          {c}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* İLÇE KUTUSU */}
                <div className="relative">
                  <input
                    type="text"
                    value={editDistrict}
                    onChange={handleDistrictChange}
                    onFocus={() => {
                      setShowDistrictList(true);
                      if (turkeyDistricts.length > 0 && !editDistrict)
                        setFilteredDistricts(turkeyDistricts);
                    }}
                    placeholder="İlçe (Örn: Uskudar)"
                    className="w-full bg-white dark:bg-gray-800 border-2 border-emerald-200 dark:border-emerald-700 rounded-xl px-3 py-2 pr-10 text-sm font-bold text-gray-800 dark:text-white outline-none focus:border-emerald-500 shadow-sm"
                  />
                  <button
                    onClick={toggleDistrictDropdown}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 transition-colors"
                  >
                    <svg
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  {showDistrictList && (
                    <ul className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-40 overflow-y-auto hide-scrollbar text-sm">
                      {filteredDistricts.length > 0 ? (
                        filteredDistricts.map((d, i) => (
                          <li
                            key={i}
                            onClick={() => handleDistrictSelect(d)}
                            className="px-3 py-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 cursor-pointer text-gray-700 dark:text-gray-200"
                          >
                            {d}
                          </li>
                        ))
                      ) : turkeyDistricts.length === 0 ? (
                        <li className="px-3 py-2 text-gray-400 italic">
                          Aramak için harf girin...
                        </li>
                      ) : (
                        <li className="px-3 py-2 text-gray-400 italic">
                          Sonuç bulunamadı.
                        </li>
                      )}
                    </ul>
                  )}
                </div>
              </div>

              <div className="flex gap-2 mt-1">
                <button
                  onClick={handleSaveLocation}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl text-sm font-bold shadow-sm transition-colors"
                >
                  Kaydet
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-6 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-gray-300 transition-colors"
                >
                  İptal
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 mt-2">
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest capitalize">
                {district ? `${district}, ` : ""}
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
            Lokasyon bulunamadı. Lütfen geçerli bir şehir girin.
          </p>
        </div>
      )}
    </div>
  );
}
