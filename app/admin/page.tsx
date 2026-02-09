/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";

interface Resource {
  id: number;
  codeKey: string;
  type: string;
  totalUnits: number;
  translations: { name: string }[];
}

export default function AdminPage() {
  const { t } = useLanguage();
  const { user, token } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);

  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [participants, setParticipants] = useState<number>(10);
  const [customTotals, setCustomTotals] = useState<Record<string, string>>({});
  const [createdLink, setCreatedLink] = useState<string>("");
  const [createdCode, setCreatedCode] = useState<string>("");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

  useEffect(() => {
    if (!apiUrl) return;
    if (!token) return;

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    fetch(`${apiUrl}/api/distribution/resources`, { headers })
      .then((res) => {
        if (!res.ok) throw new Error("Veri çekilemedi: " + res.status);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setResources(data);
        } else {
          console.error("Beklenmeyen veri formatı:", data);
          setResources([]);
        }
      })
      .catch((err) => {
        console.error("Fetch hatası:", err);
        setResources([]);
      });
  }, [apiUrl, token]);

  useEffect(() => {
    const savedData = sessionStorage.getItem("adminState");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.selectedResources)
          setSelectedResources(parsed.selectedResources);
        if (parsed.participants) setParticipants(parsed.participants);
        if (parsed.customTotals) setCustomTotals(parsed.customTotals);
        if (parsed.createdLink) setCreatedLink(parsed.createdLink);
        if (parsed.createdCode) setCreatedCode(parsed.createdCode);
      } catch (e) {
        console.error("Hafıza okuma hatası", e);
      }
    }
  }, []);

  useEffect(() => {
    const dataToSave = {
      selectedResources,
      participants,
      customTotals,
      createdLink,
      createdCode,
    };
    sessionStorage.setItem("adminState", JSON.stringify(dataToSave));
  }, [selectedResources, participants, customTotals, createdLink, createdCode]);

  const handleCheckboxChange = (id: string) => {
    if (selectedResources.includes(id)) {
      setSelectedResources(selectedResources.filter((rId) => rId !== id));
      const newTotals = { ...customTotals };
      delete newTotals[id];
      setCustomTotals(newTotals);
    } else {
      setSelectedResources([...selectedResources, id]);
    }
  };

  const handleCreate = async () => {
    if (!user || !token) {
      alert(t("loginRequired"));
      return;
    }
    if (selectedResources.length === 0) return alert(t("alertSelectResource"));

    try {
      const payload = {
        resourceIds: selectedResources.map((id) => Number(id)),
        participants: participants,
        customTotals: customTotals,
      };

      const res = await fetch(`${apiUrl}/api/distribution/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        try {
          const errorJson = JSON.parse(errorText);
          if (typeof errorJson === "object") {
            const msg = Object.values(errorJson).join("\n");
            throw new Error(msg || errorText);
          }
        } catch (e) {}
        throw new Error(`Hata ${res.status}: ${errorText}`);
      }

      const data = await res.json();
      const link = `${window.location.origin}/join/${data.code}`;
      setCreatedCode(data.code);
      setCreatedLink(link);
      sessionStorage.removeItem("adminState");
    } catch (err: any) {
      console.error(err);
      alert(err.message || t("errorOccurred"));
    }
  };
  const handleResetData = async () => {
    if (!confirm(t("confirmReset") || "Emin misiniz?")) return;
    if (!token) return;

    try {
      const res = await fetch(`${apiUrl}/api/distribution/init`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const text = await res.text();
      alert(text);

      sessionStorage.removeItem("adminState");

      window.location.reload();
    } catch (e) {
      alert("Hata");
    }
  };

  const safeResources = Array.isArray(resources) ? resources : [];
  const distributedResources = safeResources.filter((r) => r.type !== "JOINT");
  const individualResources = safeResources.filter((r) => r.type === "JOINT");

  const selectedResourcesWithInput = selectedResources
    .map((id) => safeResources.find((r) => r.id.toString() === id))
    .filter((r) => r && (r.type === "COUNTABLE" || r.type === "JOINT"));

  const renderList = (list: Resource[]) => (
    <div className="space-y-2">
      {list.map((r) => (
        <div
          key={r.id}
          className="flex items-center p-2 hover:bg-gray-50 rounded border border-transparent hover:border-gray-200 transition"
        >
          <input
            type="checkbox"
            id={`res-${r.id}`}
            value={r.id}
            checked={selectedResources.includes(r.id.toString())}
            onChange={() => handleCheckboxChange(r.id.toString())}
            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
          />
          <label
            htmlFor={`res-${r.id}`}
            className="ml-3 text-gray-800 cursor-pointer select-none flex-1"
          >
            {r.translations[0]?.name}{" "}
            <span className="text-xs text-gray-400 ml-1">({r.codeKey})</span>
          </label>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-full relative">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <button
            onClick={handleResetData}
            className="text-xs text-red-500 underline hover:text-red-700"
          >
            {t("refresh")}
          </button>
          {user && (
            <span className="text-xs text-blue-600 font-bold">👤 {user}</span>
          )}
        </div>

        {distributedResources.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-bold text-blue-700 uppercase tracking-wide mb-2 flex items-center">
              {t("distributedResources") || "Paylaşılan Kaynaklar"}
            </h3>
            <div className="border border-gray-200 rounded-lg p-2 max-h-48 overflow-y-auto">
              {renderList(distributedResources)}
            </div>
          </div>
        )}

        {individualResources.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-bold text-green-700 uppercase tracking-wide mb-2 flex items-center">
              {t("individualResources") || "Bireysel Kaynaklar"}
            </h3>
            <div className="border border-gray-200 rounded-lg p-2 max-h-48 overflow-y-auto">
              {renderList(individualResources)}
            </div>
          </div>
        )}

        {selectedResourcesWithInput.length > 0 && (
          <div className="mb-6 animate-in fade-in slide-in-from-top-2 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="block text-amber-800 font-bold mb-3 text-sm border-b border-amber-200 pb-2">
              {t("setTargetCounts") || "Hedef Sayıları Belirle (Opsiyonel)"}
            </p>

            {selectedResourcesWithInput.map(
              (r) =>
                r && (
                  <div key={r.id} className="mb-3 last:mb-0 flex flex-col">
                    <label className="text-xs font-bold text-gray-700 mb-1">
                      {r.translations[0]?.name}
                    </label>
                    <div className="flex items-center">
                      <input
                        type="number"
                        placeholder={r.totalUnits.toString()}
                        className="w-full border p-2 rounded text-black text-sm focus:border-amber-500 outline-none bg-white"
                        value={customTotals[r.id.toString()] || ""}
                        onChange={(e) =>
                          setCustomTotals({
                            ...customTotals,
                            [r.id.toString()]: e.target.value,
                          })
                        }
                      />
                      <span className="ml-2 text-xs text-gray-500 whitespace-nowrap">
                        {t("default") || "Varsayılan"}: {r.totalUnits}
                      </span>
                    </div>
                  </div>
                ),
            )}
          </div>
        )}

        <div className="mb-6">
          <label className="block text-gray-700 font-bold mb-2">
            {t("participantCount") || "Kaç Kişi Okuyacak?"}
          </label>
          <input
            type="number"
            className="w-full border-2 border-gray-200 p-3 rounded-lg text-black focus:border-blue-500 outline-none transition"
            value={participants}
            onChange={(e) => setParticipants(Number(e.target.value))}
            placeholder="10"
            min="1"
          />
        </div>

        <button
          onClick={handleCreate}
          disabled={!user}
          className="w-full bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 transition font-bold shadow-md active:scale-[0.98] disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {user
            ? t("createDistribution") || "DAĞITIMI OLUŞTUR"
            : t("loginRequired") || "Lütfen Giriş Yapın"}
        </button>

        {createdLink && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded text-center">
            <p className="text-green-800 font-bold mb-2">
              {t("linkCreated") || "Link Oluşturuldu:"}
            </p>
            <a
              href={createdLink}
              target="_blank"
              className="text-blue-600 underline text-sm break-all font-mono block mb-3"
            >
              {createdLink}
            </a>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => navigator.clipboard.writeText(createdLink)}
                className="px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-100 text-black text-sm font-bold transition shadow-sm"
              >
                {t("copy") || "Kopyala"}
              </button>

              <a
                href={`/admin/monitor?code=${createdCode}`}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-bold transition shadow-sm flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
                {t("trackButton") || "Takip Et"}
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
