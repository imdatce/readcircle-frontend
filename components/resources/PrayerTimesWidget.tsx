/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/context/LanguageContext"; // i18n EKLENDİ

export default function PrayerTimesWidget() {
  const { t } = useLanguage(); // ÇEVİRİ FONKSİYONU
  const [timings, setTimings] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState(true);

  // YENİ EKLENEN STATE: Lokasyonun hafızadan okunup okunmadığını takip eder
  const [isLocationLoaded, setIsLocationLoaded] = useState(false);

  // Vakit İsimleri (İngilizce -> Dil Karşılığı)
  const PRAYER_NAMES: Record<string, string> = {
    Fajr: t("prayerFajr") || "İmsak",
    Sunrise: t("prayerSunrise") || "Güneş",
    Dhuhr: t("prayerDhuhr") || "Öğle",
    Asr: t("prayerAsr") || "İkindi",
    Maghrib: t("prayerMaghrib") || "Akşam",
    Isha: t("prayerIsha") || "Yatsı",
  };

  const [showMonthly, setShowMonthly] = useState(false);
  const [monthlyTimings, setMonthlyTimings] = useState<any[]>([]);
  const [monthlyLoading, setMonthlyLoading] = useState(false);

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

  useEffect(() => {
    const loadLocation = () => {
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

      // EKLENDİ: Hafıza kontrolü bitti, artık API çağrısı yapılabilir
      setIsLocationLoaded(true);
    };

    loadLocation();

    window.addEventListener("locationUpdated", loadLocation);
    return () => window.removeEventListener("locationUpdated", loadLocation);
  }, []);

  useEffect(() => {
    // EKLENDİ: Lokasyon henüz okunmadıysa fonksiyonu durdur (API'ye gitme)
    if (!isLocationLoaded) return;

    async function fetchPrayerTimes() {
      setLoading(true);
      setShowMonthly(false);
      setMonthlyTimings([]);

      try {
        const fullAddress = `${district ? district + ", " : ""}${city}, ${country}`;
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, "0");
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const yyyy = today.getFullYear();
        const formattedDate = `${dd}-${mm}-${yyyy}`;

        const res = await fetch(
          `https://api.aladhan.com/v1/timingsByAddress/${formattedDate}?address=${encodeURIComponent(fullAddress)}&method=13`,
          { cache: "no-store" },
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

    // EKLENDİ: isLocationLoaded state'i dependency dizisine eklendi
  }, [city, country, district, isLocationLoaded]);

  const handleToggleMonthly = async () => {
    if (showMonthly) {
      setShowMonthly(false);
      return;
    }

    setShowMonthly(true);

    if (monthlyTimings.length > 0) return;

    setMonthlyLoading(true);
    try {
      const date = new Date();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const fullAddress = `${district ? district + ", " : ""}${city}, ${country}`;

      const res = await fetch(
        `https://api.aladhan.com/v1/calendarByAddress?address=${encodeURIComponent(fullAddress)}&method=13&month=${month}&year=${year}`,
      );
      const data = await res.json();

      if (data.code === 200) {
        setMonthlyTimings(data.data);
      }
    } catch (err) {
      console.error("Aylık vakitler çekilemedi", err);
    } finally {
      setMonthlyLoading(false);
    }
  };

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
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEditCountry(val);
    setFilteredCountries(
      val.length > 0
        ? countryList.filter((c) =>
            c.toLowerCase().startsWith(val.toLowerCase()),
          )
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
        ? cityList.filter((c) => c.toLowerCase().startsWith(val.toLowerCase()))
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
        const norm = (s: string) =>
          s.replace(/İ/g, "I").replace(/ı/g, "i").toLowerCase();

        const province = data.data.find(
          (p: any) => norm(p.name) === norm(selected),
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
        const norm = (s: string) =>
          s.replace(/İ/g, "I").replace(/ı/g, "i").toLowerCase();
        setFilteredDistricts(
          turkeyDistricts.filter((d) => norm(d).includes(norm(val))),
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
      if (turkeyDistricts.length > 0 && !editDistrict)
        setFilteredDistricts(turkeyDistricts);
    } else {
      setShowDistrictList(false);
    }
  };

  const handleSaveLocation = async () => {
    if (editCountry.trim() && editCity.trim()) {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/auth/update-location`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                city: editCity.trim(),
                country: editCountry.trim(),
                district: editDistrict.trim(),
              }),
            },
          );
        } catch (error) {
          console.error("Lokasyon sunucuya kaydedilemedi:", error);
        }
      }

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

  const cleanTime = (timeString: string) => timeString.split(" ")[0];

  return (
    <div className="bg-white/80 dark:bg-[#0a1f1a] backdrop-blur-md rounded-[2.5rem] p-5 md:p-6 shadow-sm border border-emerald-100 dark:border-emerald-900/30 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

      <div className="flex flex-col mb-6 relative z-50">
        <div className="w-full">
          <h3 className="text-xl md:text-2xl font-black text-gray-800 dark:text-white flex items-center gap-2">
            {t("prayerTimesTitle") || "Namaz Vakitleri"}
            <span className="text-emerald-500 text-2xl leading-none">۞</span>
          </h3>

          {isEditing ? (
            <div className="flex flex-col gap-3 mt-4 w-full animate-in fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="relative">
                  <input
                    type="text"
                    value={editCountry}
                    onChange={handleCountryChange}
                    placeholder={
                      t("countryPlaceholder") || "Ülke (Örn: Turkey)"
                    }
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
                <div className="relative">
                  <input
                    type="text"
                    value={editCity}
                    onChange={handleCityChange}
                    placeholder={
                      t("cityPlaceholder") || "Şehir (Örn: İstanbul)"
                    }
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
                    placeholder={
                      t("districtPlaceholder") || "İlçe (Örn: Fatih)"
                    }
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
                            className="px-3 py-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 cursor-pointer"
                          >
                            {d}
                          </li>
                        ))
                      ) : (
                        <li className="px-3 py-2 text-gray-400 italic">
                          {t("noResultFound") || "Sonuç bulunamadı."}
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
                  {t("save") || "Kaydet"}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-6 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-gray-300 transition-colors"
                >
                  {t("cancel") || "İptal"}
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
                title={t("changeLocation") || "Lokasyonu Değiştir"}
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
        <>
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

          <div className="mt-6 flex justify-center relative z-10">
            <button
              onClick={handleToggleMonthly}
              className="flex items-center gap-2 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-full border border-emerald-100 dark:border-emerald-800/50"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {showMonthly
                ? t("hideMonthlyCalendar") || "Aylık İmsakiyeyi Gizle"
                : t("showMonthlyCalendar") || "Aylık İmsakiyeyi Gör"}
            </button>
          </div>

          {showMonthly && (
            <div className="mt-6 pt-6 border-t border-emerald-100 dark:border-emerald-900/30 animate-in slide-in-from-top-4 fade-in duration-500 relative z-10">
              {monthlyLoading ? (
                <div className="flex flex-col items-center justify-center py-8 gap-3">
                  <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
                  <p className="text-sm font-bold text-gray-500">
                    {t("loadingMonthlyData") || "Aylık veriler yükleniyor..."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto hide-scrollbar rounded-2xl border border-gray-100 dark:border-gray-800">
                  <table className="w-full text-sm text-left whitespace-nowrap">
                    <thead className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-bold uppercase text-xs">
                      <tr>
                        <th className="px-4 py-3 rounded-tl-xl">
                          {t("dateCol") || "Tarih"}
                        </th>
                        <th className="px-4 py-3">{PRAYER_NAMES.Fajr}</th>
                        <th className="px-4 py-3">{PRAYER_NAMES.Sunrise}</th>
                        <th className="px-4 py-3">{PRAYER_NAMES.Dhuhr}</th>
                        <th className="px-4 py-3">{PRAYER_NAMES.Asr}</th>
                        <th className="px-4 py-3">{PRAYER_NAMES.Maghrib}</th>
                        <th className="px-4 py-3 rounded-tr-xl">
                          {PRAYER_NAMES.Isha}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {monthlyTimings.map((day: any, idx: number) => {
                        const isToday =
                          day.date.gregorian.day ===
                          String(new Date().getDate()).padStart(2, "0");

                        return (
                          <tr
                            key={idx}
                            className={`hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors ${isToday ? "bg-emerald-50 dark:bg-emerald-900/30 border-l-4 border-emerald-500" : "bg-white dark:bg-[#0a1f1a]"}`}
                          >
                            <td className="px-4 py-3 font-bold text-gray-800 dark:text-gray-200">
                              {day.date.readable.split(" ")[0]}{" "}
                              {day.date.readable.split(" ")[1]}
                              {isToday && (
                                <span className="ml-2 text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                                  {t("today") || "Bugün"}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-emerald-700 dark:text-emerald-400 font-medium">
                              {cleanTime(day.timings.Fajr)}
                            </td>
                            <td className="px-4 py-3 text-emerald-700 dark:text-emerald-400 font-medium">
                              {cleanTime(day.timings.Sunrise)}
                            </td>
                            <td className="px-4 py-3 text-emerald-700 dark:text-emerald-400 font-medium">
                              {cleanTime(day.timings.Dhuhr)}
                            </td>
                            <td className="px-4 py-3 text-emerald-700 dark:text-emerald-400 font-medium">
                              {cleanTime(day.timings.Asr)}
                            </td>
                            <td className="px-4 py-3 text-emerald-700 dark:text-emerald-400 font-medium">
                              {cleanTime(day.timings.Maghrib)}
                            </td>
                            <td className="px-4 py-3 text-emerald-700 dark:text-emerald-400 font-medium">
                              {cleanTime(day.timings.Isha)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="text-center bg-red-50 dark:bg-red-900/20 rounded-2xl p-4 border border-red-100 dark:border-red-900/30 relative z-10">
          <p className="text-red-600 dark:text-red-400 font-bold text-sm">
            {t("locationNotFound") ||
              "Lokasyon bulunamadı. Lütfen İngilizce karakterler kullanmaya dikkat edin (Örn: Uskudar)."}
          </p>
        </div>
      )}
    </div>
  );
}
