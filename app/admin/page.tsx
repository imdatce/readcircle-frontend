"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useState, useEffect } from "react";
// Resource tipini types dosyasından veya manuel tanımlayabiliriz.
// Eğer types dosyan yoksa bu interface'i burada tutabilirsin:
interface Resource {
    id: number;
    codeKey: string;
    type: string;
    totalUnits: number;
    translations: { name: string }[];
}

export default function AdminPage() {
    const { t } = useLanguage();
    const [resources, setResources] = useState<Resource[]>([]);
    const [selectedResources, setSelectedResources] = useState<string[]>([]);
    const [participants, setParticipants] = useState<number>(10);

    // API URL'i env'den alıyoruz, yoksa boş string
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

    const [customTotals, setCustomTotals] = useState<Record<string, string>>({});
    const [createdLink, setCreatedLink] = useState<string>("");

    useEffect(() => {
        if (!apiUrl) return;
        fetch(`${apiUrl}/api/distribution/resources`)
            .then((res) => res.json())
            .then((data) => setResources(data))
            .catch((err) => console.error(err));
    }, [apiUrl]);

    const handleCheckboxChange = (id: string) => {
        setCreatedLink("");
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
        if (selectedResources.length === 0) return alert(t('alertSelectResource') || "Lütfen seçim yapınız.");

        const params = new URLSearchParams();
        params.append("resourceIds", selectedResources.join(","));
        params.append("participants", participants.toString());

        const totalsString = Object.entries(customTotals)
            .map(([id, val]) => val ? `${id}:${val}` : null)
            .filter(Boolean)
            .join(",");

        if (totalsString) {
            params.append("customTotals", totalsString);
        }

        try {
            const res = await fetch(`${apiUrl}/api/distribution/create?${params.toString()}`);
            if (!res.ok) throw new Error("Hata");
            const data = await res.json();
            // window.location.origin, tarayıcıda bulunduğun adresi alır (localhost veya site.com)
            setCreatedLink(`${window.location.origin}/join/${data.code}`);
        } catch (err) {
            alert(t('errorOccurred') || "Hata oluştu.");
        }
    };

    const handleResetData = async () => {
        if (!confirm(t('confirmReset') || "Emin misiniz?")) return;
        try {
            const res = await fetch(`${apiUrl}/api/distribution/init`);
            const text = await res.text();
            alert(text);
            window.location.reload();
        } catch (e) {
            alert("Hata");
        }
    }

    // Filtrelemeler
    const distributedResources = resources.filter(r => r.type !== "JOINT");
    const individualResources = resources.filter(r => r.type === "JOINT");

    const selectedResourcesWithInput = selectedResources
        .map(id => resources.find(r => r.id.toString() === id))
        .filter(r => r && (r.type === "COUNTABLE" || r.type === "JOINT"));

    // Liste Render FonksiyonurenderGroupList
    const renderList = (list: Resource[]) => (
        <div className="space-y-2">
            {list.map((r) => (
                <div key={r.id} className="flex items-center p-2 hover:bg-gray-50 rounded border border-transparent hover:border-gray-200 transition">
                    <input
                        type="checkbox"
                        id={`res-${r.id}`}
                        value={r.id}
                        checked={selectedResources.includes(r.id.toString())}
                        onChange={() => handleCheckboxChange(r.id.toString())}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                    />
                    <label htmlFor={`res-${r.id}`} className="ml-3 text-gray-800 cursor-pointer select-none flex-1">
                        {r.translations[0]?.name} <span className="text-xs text-gray-400 ml-1">({r.codeKey})</span>
                    </label>
                </div>
            ))}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-full relative">

                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h1 className="text-2xl font-bold text-gray-800">{t('adminTitle')}</h1>
                    <button onClick={handleResetData} className="text-xs text-red-500 underline hover:text-red-700">
                        {t('refresh')}
                    </button>
                </div>

                {/* PAYLAŞILAN KAYNAKLAR */}
                {distributedResources.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-sm font-bold text-blue-700 uppercase tracking-wide mb-2 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>
                            {t('distributedResources') || "Paylaşılan Kaynaklar"}
                        </h3>
                        <div className="border border-gray-200 rounded-lg p-2 max-h-48 overflow-y-auto">
                            {renderList(distributedResources)}
                        </div>
                    </div>
                )}

                {/* BİREYSEL KAYNAKLAR */}
                {individualResources.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-sm font-bold text-green-700 uppercase tracking-wide mb-2 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                            {t('individualResources') || "Bireysel Kaynaklar"}
                        </h3>
                        <div className="border border-gray-200 rounded-lg p-2 max-h-48 overflow-y-auto">
                            {renderList(individualResources)}
                        </div>
                    </div>
                )}

                {/* HEDEF SAYI GİRİŞLERİ */}
                {selectedResourcesWithInput.length > 0 && (
                    <div className="mb-6 animate-in fade-in slide-in-from-top-2 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="block text-amber-800 font-bold mb-3 text-sm border-b border-amber-200 pb-2">
                            {t('setTargetCounts') || "Hedef Sayıları Belirle (Opsiyonel)"}
                        </p>

                        {selectedResourcesWithInput.map(r => r && (
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
                                        onChange={(e) => setCustomTotals({
                                            ...customTotals,
                                            [r.id.toString()]: e.target.value
                                        })}
                                    />
                                    <span className="ml-2 text-xs text-gray-500 whitespace-nowrap">
                                        {t('default') || "Varsayılan"}: {r.totalUnits}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* KATILIMCI SAYISI */}
                <div className="mb-6">
                    <label className="block text-gray-700 font-bold mb-2">
                        {t('participantCount') || "Kaç Kişi Okuyacak?"}
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

                {/* OLUŞTUR BUTONU */}
                <button
                    onClick={handleCreate}
                    className="w-full bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 transition font-bold shadow-md active:scale-[0.98]"
                >
                    {t('createDistribution') || "DAĞITIMI OLUŞTUR"}
                </button>

                {/* SONUÇ LİNKİ */}
                {createdLink && (
                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded text-center">
                        <p className="text-green-800 font-bold mb-2">
                            {t('linkCreated') || "Link Oluşturuldu:"}
                        </p>
                        <a href={createdLink} target="_blank" className="text-blue-600 underline text-sm break-all font-mono">
                            {createdLink}
                        </a>
                        <button
                            onClick={() => navigator.clipboard.writeText(createdLink)}
                            className="block mx-auto mt-3 text-xs bg-white border border-gray-300 px-3 py-1 rounded hover:bg-gray-100 text-black transition"
                        >
                            {t('copy') || "Kopyala"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}