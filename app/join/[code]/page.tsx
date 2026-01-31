"use client";

import { use, useEffect, useState, useCallback } from "react";
import { DistributionSession, Assignment } from "@/types";
import { useLanguage } from "@/context/LanguageContext";


const Zikirmatik = ({
    currentCount,
    onDecrement,
    isModal = false,
    t,
    readOnly = false
}: {
    currentCount: number,
    onDecrement: () => void,
    isModal?: boolean,
    t: (key: string) => string,
    readOnly?: boolean
}) => {
    return (
        <div className={`flex flex-col items-center ${isModal ? 'mt-8' : 'mt-3'}`}>
            <button
                onClick={readOnly ? undefined : onDecrement}
                disabled={currentCount === 0 || readOnly}
                className={`
                    rounded-full flex flex-col items-center justify-center 
                    shadow-lg border-4 transition transform 
                    ${isModal ? 'w-32 h-32' : 'w-24 h-24'} 
                    
                    ${currentCount === 0
                        ? 'bg-green-100 border-green-500 text-green-700 cursor-default'
                        : readOnly
                            ? 'bg-gray-200 border-gray-300 text-gray-500 cursor-not-allowed opacity-80'
                            : 'bg-blue-600 border-blue-400 text-white hover:bg-blue-700 cursor-pointer active:scale-95'
                    }
                `}
            >
                <span className={`${isModal ? 'text-4xl' : 'text-3xl'} font-bold font-mono`}>
                    {currentCount}
                </span>
                <span className="text-xs font-light">
                    {currentCount === 0 ? t('completed') : (readOnly ? "" : t('decrease'))}
                </span>
            </button>
            {currentCount > 0 && (
                <p className="text-xs text-gray-500 mt-2">{t('remaining')}</p>
            )}
            {currentCount === 0 && (
                <p className="text-xs text-green-600 font-bold mt-2">{t('allahAccept')}</p>
            )}
        </div>
    );
};

export default function JoinPage({ params }: { params: Promise<{ code: string }> }) {

    const { code } = use(params);
    const { t } = useLanguage();

    const [session, setSession] = useState<DistributionSession | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [userName, setUserName] = useState("");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    const [localCounts, setLocalCounts] = useState<Record<number, number>>({});
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

    type ViewMode = 'ARABIC' | 'LATIN' | 'MEANING';

    interface CevsenBab {
        babNumber: number;
        arabic: string;
        transcript: string;
        meaning: string;
    }

    const [readingModalContent, setReadingModalContent] = useState<{
        title: string,
        type: "SIMPLE" | "CEVSEN" | "SALAVAT",
        simpleItems?: string[],
        cevsenData?: CevsenBab[],
        salavatData?: { arabic: string, transcript: string, meaning: string },
        isArabic?: boolean,
        startUnit?: number,
        codeKey?: string,
        assignmentId?: number
    } | null>(null);

    const [activeTab, setActiveTab] = useState<ViewMode>('ARABIC');

    const fetchSession = useCallback(async () => {
        try {
            const res = await fetch(`${apiUrl}/api/distribution/get/${code}?t=${Date.now()}`, {
                cache: "no-store"
            });
            if (!res.ok) throw new Error("Veri çekilemedi");

            const data: DistributionSession = await res.json();
            setSession(data);

            setLocalCounts(prev => {
                const newCounts = { ...prev };
                let hasChange = false;

                data.assignments.forEach(a => {
                    if (a.resource.type === "COUNTABLE" || a.resource.type === "JOINT") {
                        const defaultTotal = a.endUnit - a.startUnit + 1;

                        const backendCount = (a as unknown as { currentCount?: number | null }).currentCount;

                        const isMyAssignment = a.assignedToName === userName;

                        const iHaveLocalData = newCounts[a.id] !== undefined;
                        if (isMyAssignment && iHaveLocalData) {
                            return;
                        }

                        let valueToSet = defaultTotal;
                        if (backendCount !== undefined && backendCount !== null) {
                            valueToSet = backendCount;
                        }

                        if (newCounts[a.id] !== valueToSet) {
                            newCounts[a.id] = valueToSet;
                            hasChange = true;
                        }
                    }
                });

                return hasChange ? newCounts : prev;
            });

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [apiUrl, code, userName]);

    useEffect(() => {
        fetchSession();
    }, [fetchSession]);

    const decrementCount = async (assignmentId: number) => {
        const currentCount = localCounts[assignmentId];

        if (currentCount === undefined || currentCount <= 0) return;

        const newCount = currentCount - 1;

        setLocalCounts(prev => ({
            ...prev,
            [assignmentId]: newCount
        }));

        try {
            await fetch(`${apiUrl}/api/distribution/update-progress/${assignmentId}?count=${newCount}`, {
                method: 'POST',
                cache: 'no-store'
            });
        } catch (e) {
            console.error("İlerleme kaydedilemedi", e);
        }
    };

    const handleOpenQuran = (pageNumber: number) => {
        const url = `https://kuran.hayrat.com.tr/icerik/kuran_hizmetlerimiz/kuran-oku.aspx?sayfa=${pageNumber}`;
        window.open(url, "_blank");
    };

    const handleTakePart = async (assignmentId: number) => {
        // 1. İsim Kontrolü
        if (!userName) {
            alert(t('alertEnterName'));
            return;
        }

        try {
            // 2. API İsteği (Parçayı Al)
            const res = await fetch(
                `${apiUrl}/api/distribution/take/${assignmentId}?name=${userName}`
            );

            // Başkası almışsa uyar
            if (res.status === 409) {
                alert(t('errorAlreadyTaken'));
                fetchSession();
                return;
            }

            if (!res.ok) {
                const text = await res.text();
                const displayMsg = text.includes("{") ? t('errorOccurred') : text;
                alert(t('alertStatus') + displayMsg);
                fetchSession();
                return;
            }

            // 3. BAŞARI SENARYOSU
            // Sadece listeyi güncelle ve başarı mesajı ver.
            // YÖNLENDİRME KODLARINI (handleOpenQuran vb.) BURADAN SİLDİK.

            alert(t('alertTakenSuccess')); // "Parça başarıyla alındı"
            fetchSession(); // Listeyi yenile ki buton "OKU"ya dönüşsün

        } catch (err) {
            console.error(err);
            alert(t('errorOccurred'));
            fetchSession();
        }
    };

    const handleOpenReading = (assignment: Assignment) => {
        const resource = assignment.resource;
        const description = resource.translations?.[0]?.description;
        if (!description) return;

        if (resource.type === "COUNTABLE" || resource.type === "JOINT") {
            const parts = description.split("|||");
            setReadingModalContent({
                title: resource.translations?.[0]?.name || "Okuma",
                type: "SALAVAT",
                salavatData: {
                    arabic: parts[0]?.trim() || "",
                    transcript: parts[1]?.trim() || "",
                    meaning: parts[2]?.trim() || ""
                },
                codeKey: resource.codeKey,
                assignmentId: assignment.id
            });
            setActiveTab('ARABIC');
        }
        else if (resource.type === "LIST_BASED") {
            if (resource.codeKey === "BEDIR" || resource.codeKey === "CEVSEN") {
                const allParts = description.split("###");
                const selectedPartsRaw = allParts.slice(assignment.startUnit - 1, assignment.endUnit);

                const parsedData: CevsenBab[] = selectedPartsRaw.map((rawPart, index) => {
                    const parts = rawPart.split("|||");
                    return {
                        babNumber: assignment.startUnit + index,
                        arabic: parts[0]?.trim() || "",
                        transcript: parts[1]?.trim() || "",
                        meaning: parts[2]?.trim() || "Meal hazırlanıyor..."
                    };
                });

                setReadingModalContent({
                    title: resource.translations?.[0]?.name || "Okuma",
                    type: "CEVSEN",
                    cevsenData: parsedData,
                    startUnit: assignment.startUnit,
                    codeKey: resource.codeKey,
                    assignmentId: assignment.id
                });
                setActiveTab('ARABIC');
            }
        }
    };

    const getSplitGroups = () => {
        if (!session) return { distributed: {}, individual: {} };

        const distributed: Record<string, Assignment[]> = {};
        const individual: Record<string, Assignment[]> = {};

        session.assignments.forEach((assignment) => {
            const resourceName = assignment.resource?.translations?.[0]?.name || assignment.resource?.codeKey || "Diğer";
            const type = assignment.resource.type;

            if (type === "JOINT") {
                if (!individual[resourceName]) individual[resourceName] = [];
                individual[resourceName].push(assignment);
            } else {
                if (!distributed[resourceName]) distributed[resourceName] = [];
                distributed[resourceName].push(assignment);
            }
        });

        [distributed, individual].forEach(group => {
            Object.keys(group).forEach(key => {
                group[key].sort((a, b) => a.participantNumber - b.participantNumber);
            });
        });

        return { distributed, individual };
    };

    const toggleGroup = (groupName: string) => {
        setExpandedGroups(prev => ({ ...prev, [groupName]: !prev[groupName] }));
    };

    const formatArabicText = (text: string) => {
        const parts = text.split(/([١٢٣٤٥٦٧٨٩٠]+)/g);
        return (
            <div className="leading-[4.5rem]">
                {parts.map((part, index) => {
                    if (/^[١٢٣٤٥٦٧٨٩٠]+$/.test(part)) {
                        return (
                            <span key={index} className="inline-flex items-center justify-center mx-1 w-9 h-9 rounded-full bg-amber-100 text-amber-700 border border-amber-300 font-bold text-xl align-middle shadow-sm">
                                {part}
                            </span>
                        );
                    }
                    if (part.includes("سُبْحَانَكَ")) {
                        const subParts = part.split("سُبْحَانَكَ");
                        return (
                            <span key={index}>
                                {subParts[0]} <br />
                                <div className="mt-6 mb-2 p-4 bg-emerald-50 border-r-4 border-emerald-500 rounded-l-lg text-emerald-900 font-bold text-2xl shadow-inner text-center">
                                    سُبْحَانَكَ {subParts[1]}
                                </div>
                            </span>
                        );
                    }
                    return <span key={index}>{part}</span>;
                })}
            </div>
        );
    };


    const formatLatinText = (text: string) => {
        const parts = text.split(/(\d+\s)/g);
        return (
            <div className="text-xl md:text-2xl text-gray-800 font-serif leading-[3.5rem]">
                {parts.map((part, index) => {
                    if (/^\d+\s$/.test(part)) {
                        const number = part.trim();
                        return (
                            <span key={index} className="inline-flex items-center justify-center mx-2 w-8 h-8 rounded-full bg-amber-100 text-amber-700 border border-amber-300 font-sans font-bold text-lg align-middle shadow-sm">
                                {number}
                            </span>
                        );
                    }
                    if (part.toLowerCase().includes("sübhâneke")) {
                        const subParts = part.split(/sübhâneke/i);
                        return (
                            <span key={index}>
                                {subParts[0]} <br />
                                <div className="mt-6 mb-2 p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-lg text-emerald-900 font-bold text-xl shadow-inner text-center font-sans">
                                    Sübhâneke {subParts[1]}
                                </div>
                            </span>
                        );
                    }
                    return <span key={index}>{part}</span>;
                })}
            </div>
        );
    };

    const formatStyledText = (text: string, type: 'LATIN' | 'MEANING') => {
        const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);

        return (
            <div className="space-y-3">
                {lines.map((line, index) => (
                    <div
                        key={index}
                        className={`
                        relative p-4 rounded-xl border flex gap-4 items-start transition-all hover:shadow-md
                        ${type === 'LATIN'
                                ? 'bg-white border-gray-200 text-gray-800 font-serif text-lg italic'
                                : 'bg-emerald-50 border-emerald-100 text-emerald-900 font-sans text-base'}
                    `}
                    >
                        <div className={`
                        flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm
                        ${type === 'LATIN'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-emerald-200 text-emerald-800'}
                    `}>
                            {index + 1}
                        </div>

                        <p className="leading-relaxed mt-1">
                            {line.trim()}
                        </p>
                    </div>
                ))}
            </div>
        );
    };

    const formatMeaningText = (text: string) => {
        const lines = text.split(/[-•\n]/).filter(line => line.trim().length > 0);

        return (
            <div className="space-y-4">
                {lines.map((line, index) => (
                    <div key={index} className="flex items-start group">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] font-bold mt-1 mr-3 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                            {index + 1}
                        </div>
                        <p className="text-gray-800 text-lg leading-relaxed font-medium italic">
                            {line.trim()}
                        </p>
                    </div>
                ))}
            </div>
        );
    };

    const renderGroupList = (groups: Record<string, Assignment[]>) => {
        return Object.entries(groups).map(([resourceName, assignments]) => {
            const isOpen = expandedGroups[resourceName] || false;
            return (
                <div key={resourceName} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-4">
                    <button onClick={() => toggleGroup(resourceName)} className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition duration-200">
                        <div className="flex items-center">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-3 ${isOpen ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600'}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" /></svg>
                            </div>
                            <div className="text-left">
                                <h2 className="text-lg font-bold text-gray-800">{resourceName}</h2>
                                <span className="text-xs text-gray-500">{assignments.length} {t('person')} / {t('part')}</span>
                            </div>
                        </div>
                        <div className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>
                        </div>
                    </button>

                    {isOpen && (
                        <div className="p-4 bg-gray-50 border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {assignments.map((item) => (
                                    <div key={item.id} className={`p-4 rounded-lg border flex flex-col justify-between transition-all ${item.isTaken ? "bg-gray-100 border-gray-300 opacity-90" : "bg-white border-blue-200 hover:shadow-md"}`}>
                                        <div className="mb-3">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-bold text-gray-800">{item.participantNumber}. {t('person')}</span>
                                                {item.isTaken && item.assignedToName && (<span className="text-xs bg-green-600 text-white px-2 py-1 rounded font-bold">{item.assignedToName}</span>)}
                                            </div>
                                            <div className="text-sm text-gray-600">

                                                {item.resource.type === "JOINT"
                                                    ? `${t('target')}:`
                                                    : (
                                                        item.resource.type === "PAGED" ? t('page') :
                                                            item.resource.type === "COUNTABLE" ? t('pieces') :
                                                                (item.resource.translations?.[0]?.unitName || t('part'))
                                                    ) + ":"
                                                }

                                                {item.resource.type === "JOINT" ? (
                                                    <span className="ml-1 font-bold">{item.endUnit} {t('pieces')}</span>
                                                ) : (
                                                    <span> {item.startUnit} - {item.endUnit}</span>
                                                )}

                                                {item.resource.type === "COUNTABLE" && (
                                                    <span className="ml-2 font-bold text-blue-600">
                                                        ({t('total')}: {item.endUnit - item.startUnit + 1})
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2 items-center w-full">
                                            {item.isTaken ? (
                                                <>
                                                    {item.resource.type === "COUNTABLE" || item.resource.type === "JOINT" ? (
                                                        <div className="w-full flex flex-col items-center">
                                                            <Zikirmatik
                                                                currentCount={localCounts[item.id] || 0}
                                                                onDecrement={() => decrementCount(item.id)}
                                                                t={t as unknown as (key: string) => string}
                                                                readOnly={!userName || item.assignedToName !== userName}
                                                            />

                                                            {item.assignedToName === userName && (
                                                                <button onClick={() => handleOpenReading(item)} className="mt-4 text-blue-600 text-sm font-semibold underline hover:text-blue-800">
                                                                    {t('takeRead')} ({t('readText')})
                                                                </button>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        item.resource.type === "LIST_BASED" ? (
                                                            item.assignedToName === userName ? (
                                                                <button onClick={() => handleOpenReading(item)} className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-bold shadow transition flex items-center justify-center gap-2">
                                                                    {t('takeRead')}
                                                                </button>
                                                            ) : (
                                                                <button disabled className="w-full py-2 bg-gray-300 text-gray-600 rounded cursor-not-allowed text-sm font-bold shadow-inner border border-gray-400">
                                                                    {t('full')}
                                                                </button>
                                                            )
                                                        ) : (
                                                            item.resource.type === "PAGED" ? (
                                                                item.assignedToName === userName ? (
                                                                    <button onClick={() => handleOpenQuran(item.startUnit)} className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-bold shadow transition flex items-center justify-center gap-2">
                                                                        {t('takeRead')} ({t('goToSite')})
                                                                    </button>
                                                                ) : (
                                                                    <button disabled className="w-full py-2 bg-gray-300 text-gray-600 rounded cursor-not-allowed text-sm font-bold shadow-inner border border-gray-400">
                                                                        {t('full')}
                                                                    </button>
                                                                )
                                                            ) : (
                                                                <button disabled className="w-full py-2 bg-gray-300 text-gray-600 rounded cursor-not-allowed text-sm font-bold shadow-inner border border-gray-400">
                                                                    {t('full')}
                                                                </button>
                                                            )
                                                        )
                                                    )}
                                                </>
                                            ) : (
                                                <button onClick={() => handleTakePart(item.id)} className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 active:bg-blue-800 text-sm font-bold transition transform hover:scale-[1.02]">
                                                    {t('select')}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            );
        });
    };

    if (loading) return <div className="p-10 text-center font-bold text-gray-600">{t('loading')}</div>;
    if (error) return <div className="p-10 text-center text-red-500 font-bold">{error}</div>;
    if (!session) return null;

    const { distributed, individual } = getSplitGroups();

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 relative">
            <div className="max-w-4xl mx-auto">

                <div className="bg-white p-6 rounded-lg shadow mb-8 text-center">
                    <h1 className="text-3xl font-bold text-blue-800 mb-2">{t('joinTitle')}</h1>
                    <p className="text-gray-600">{t('joinIntro')}</p>
                    <div className="mt-4 flex justify-center">
                        <input
                            type="text"
                            placeholder={t('yourName')}
                            className="border-2 border-blue-200 p-3 rounded-lg text-black w-full max-w-sm text-center focus:border-blue-500 outline-none transition"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                        />
                    </div>
                </div>

                {Object.keys(distributed).length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-gray-700 border-b border-gray-300 pb-2 mb-4 flex items-center">
                            <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>
                            {t('distributedResources')}
                        </h2>
                        {renderGroupList(distributed)}
                    </div>
                )}

                {Object.keys(individual).length > 0 && (
                    <div>
                        <h2 className="text-xl font-bold text-gray-700 border-b border-gray-300 pb-2 mb-4 flex items-center">
                            <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                            {t('individualResources')}
                        </h2>
                        {renderGroupList(individual)}
                    </div>
                )}

            </div>

            {readingModalContent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">

                        <div className="p-4 bg-blue-600 text-white flex flex-col gap-4 shrink-0">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-lg">{readingModalContent.title}</h3>
                                <button onClick={() => setReadingModalContent(null)} aria-label="Pencereyi Kapat" className="text-white hover:bg-blue-700 p-1 rounded-full transition">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            {(readingModalContent.type === "CEVSEN" || readingModalContent.type === "SALAVAT") && (
                                <div className="flex p-1 bg-blue-800/30 rounded-lg">
                                    <button onClick={() => setActiveTab('ARABIC')} className={`flex-1 py-2 rounded-md text-sm font-bold transition ${activeTab === 'ARABIC' ? 'bg-white text-blue-800 shadow' : 'text-blue-100 hover:bg-white/10'}`}>
                                        {t('tabArabic')}
                                    </button>
                                    <button onClick={() => setActiveTab('LATIN')} className={`flex-1 py-2 rounded-md text-sm font-bold transition ${activeTab === 'LATIN' ? 'bg-white text-blue-800 shadow' : 'text-blue-100 hover:bg-white/10'}`}>
                                        {t('tabLatin')}
                                    </button>
                                    {readingModalContent.codeKey !== "BEDIR" && (
                                        <button onClick={() => setActiveTab('MEANING')} className={`flex-1 py-2 rounded-md text-sm font-bold transition ${activeTab === 'MEANING' ? 'bg-white text-blue-800 shadow' : 'text-blue-100 hover:bg-white/10'}`}>
                                            {t('tabMeaning')}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="p-6 overflow-y-auto text-gray-700 flex-1 bg-white">
                            {readingModalContent.type === "SIMPLE" && readingModalContent.simpleItems && (
                                <ul className="space-y-4 list-decimal list-inside">
                                    {readingModalContent.simpleItems.map((item, index) => (
                                        <li key={index} className="pl-2 border-b border-gray-100 pb-2 last:border-0 hover:bg-gray-50 transition text-lg">{item}</li>
                                    ))}
                                </ul>
                            )}

                            {readingModalContent.type === "CEVSEN" && readingModalContent.cevsenData && (
                                <div>
                                    {readingModalContent.cevsenData.map((bab, index) => (
                                        <div key={index} className="mb-10 pb-8 border-b-2 border-gray-100 last:border-0">
                                            <div className="flex justify-center mb-6">
                                                <span className="bg-blue-100 text-blue-800 px-6 py-2 rounded-full font-bold shadow-sm border border-blue-200 tracking-wide uppercase text-sm">
                                                    {readingModalContent.codeKey === "CEVSEN" ? `${bab.babNumber}. BAB` : `${bab.babNumber}. Grup`}
                                                </span>
                                            </div>

                                            {activeTab === 'ARABIC' && (
                                                <div className="text-right font-serif text-3xl" dir="rtl">
                                                    {formatArabicText(bab.arabic)}
                                                </div>
                                            )}

                                            {activeTab === 'LATIN' && (
                                                <div className="text-left font-serif text-xl">
                                                    {formatLatinText(bab.transcript)}
                                                </div>
                                            )}

                                            {activeTab === 'MEANING' && (
                                                <div className="bg-gradient-to-br from-emerald-50 to-white p-6 rounded-2xl border-l-8 border-emerald-500 shadow-inner">
                                                    <div className="flex items-center mb-4 text-emerald-700">
                                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                                                        <span className="font-bold text-xs uppercase tracking-widest">Türkçe Meali</span>
                                                    </div>
                                                    {formatMeaningText(bab.meaning)}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {readingModalContent.type === "SALAVAT" && readingModalContent.salavatData && (
                                <div className="flex flex-col items-center w-full h-full">

                                    <div className="w-full flex-1 overflow-y-auto p-2">
                                        {activeTab === 'ARABIC' && (
                                            <>
                                                {(readingModalContent.salavatData.arabic || "").startsWith("IMAGE_MODE") ? (
                                                    <div className="flex flex-col items-center gap-4 bg-gray-100 p-2 rounded-lg">
                                                        {(readingModalContent.salavatData.arabic || "")
                                                            .split(":::")[1]
                                                            ?.split(",")
                                                            .map((imgSrc, index) => (
                                                                <div key={index} className="w-full bg-white shadow-md rounded relative overflow-hidden">
                                                                    <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-[10px] px-2 py-1 rounded z-10">
                                                                        {t('page')} {index + 1}
                                                                    </div>
                                                                    <img
                                                                        src={imgSrc ? imgSrc.trim() : ""}
                                                                        alt={`${t('page')} ${index + 1}`}
                                                                        className="w-full h-auto"
                                                                    />
                                                                </div>
                                                            ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-center font-serif text-3xl leading-[4.5rem] py-4" dir="rtl">
                                                        {readingModalContent.salavatData.arabic}
                                                    </div>
                                                )}
                                            </>
                                        )}

                                        {activeTab === 'LATIN' && (
                                            <div className="p-2">
                                                {(readingModalContent.salavatData.transcript || "").startsWith("IMAGE_MODE") ? (
                                                    <div className="flex flex-col items-center gap-4 bg-gray-100 p-2 rounded-lg">
                                                        {(readingModalContent.salavatData.transcript || "")
                                                            .split(":::")[1]
                                                            ?.split(",")
                                                            .map((imgSrc, index) => (
                                                                <div key={index} className="w-full bg-white shadow-md rounded relative overflow-hidden">
                                                                    <div className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] px-2 py-1 rounded z-10 shadow">
                                                                        {t('tabLatin')} - {index + 1}
                                                                    </div>
                                                                    <img
                                                                        src={imgSrc.trim()}
                                                                        alt={`${t('tabLatin')} ${index + 1}`}
                                                                        className="w-full h-auto"
                                                                    />
                                                                </div>
                                                            ))}
                                                    </div>
                                                ) : (
                                                    formatStyledText(readingModalContent.salavatData.transcript, 'LATIN')
                                                )}
                                            </div>
                                        )}

                                        {activeTab === 'MEANING' && (
                                            <div className="p-2 w-full">
                                                {(readingModalContent.salavatData.meaning || "").startsWith("IMAGE_MODE") ? (
                                                    <div className="flex flex-col items-center gap-4 bg-gray-100 p-2 rounded-lg">
                                                        {(readingModalContent.salavatData.meaning || "")
                                                            .split(":::")[1]
                                                            ?.split(",")
                                                            .map((imgSrc, index) => (
                                                                <div key={index} className="w-full bg-white shadow-md rounded relative overflow-hidden">
                                                                    <div className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] px-2 py-1 rounded z-10 shadow">
                                                                        {t('tabMeaning')} - {t('page')} {index + 1}
                                                                    </div>
                                                                    <img
                                                                        src={imgSrc.trim()}
                                                                        alt={`${t('tabMeaning')} ${index + 1}`}
                                                                        className="w-full h-auto"
                                                                    />
                                                                </div>
                                                            ))}
                                                    </div>
                                                ) : (
                                                    formatStyledText(readingModalContent.salavatData.meaning, 'MEANING')
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {readingModalContent.assignmentId && (
                                        <div className="mt-4 pt-4 border-t w-full flex flex-col items-center bg-gray-50 rounded-b-xl pb-4 shrink-0">
                                            <p className="text-gray-500 text-sm mb-2 font-semibold">{t('clickToCount')}</p>

                                            {(() => {
                                                const currentAssignment = session?.assignments.find(a => a.id === readingModalContent.assignmentId);
                                                const isOwner = currentAssignment && currentAssignment.assignedToName === userName;

                                                return (
                                                    <Zikirmatik
                                                        currentCount={localCounts[readingModalContent.assignmentId] || 0}
                                                        onDecrement={() => decrementCount(readingModalContent.assignmentId!)}
                                                        isModal={true}
                                                        t={t as unknown as (key: string) => string}
                                                        readOnly={!isOwner}
                                                    />
                                                );
                                            })()}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="p-4 bg-gray-50 text-center border-t border-gray-200 shrink-0">
                            <button onClick={() => setReadingModalContent(null)} className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition font-bold">
                                {t('cancel') || "Kapat"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}