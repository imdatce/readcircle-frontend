/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback, useRef, useEffect } from "react";
import { DistributionSession, Assignment, CevsenBab } from "@/types";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { ReadingModalContent } from "@/components/modals/ReadingModal";

export function useDistributionSession(code: string) {
    const { t, language } = useLanguage();
    const { user, token } = useAuth();

    const [session, setSession] = useState<DistributionSession | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [localCounts, setLocalCounts] = useState<Record<number, number>>({});
    const [userName, setUserName] = useState<string | null>(null);
    const dataFetchedRef = useRef(false);

    const [readingModalContent, setReadingModalContent] = useState<ReadingModalContent | null>(null);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    // Kullanıcı adını belirle
    useEffect(() => {
        if (user) {
            setUserName(user);
        } else {
            const savedName = localStorage.getItem("guestUserName");
            if (savedName) setUserName(savedName);
        }
    }, [user]);

    const fetchSession = useCallback(async () => {
        try {
            const res = await fetch(`${apiUrl}/api/distribution/get/${code}`, {
                cache: "no-store",
                headers: { "Content-Type": "application/json" },
            });

            if (!res.ok) throw new Error(`${t("errorFetchFailed")} ${res.status}`);

            const data: DistributionSession = await res.json();
            setSession(data);

            setLocalCounts((prev) => {
                const newCounts = { ...prev };
                data.assignments.forEach((a: Assignment) => {
                    if (a.resource.type === "COUNTABLE" || a.resource.type === "JOINT") {
                        const defaultTotal = a.endUnit - a.startUnit + 1;
                        const backendCount = a.currentCount;
                        if (backendCount !== undefined && backendCount !== null) {
                            newCounts[a.id] = backendCount;
                        } else {
                            if (newCounts[a.id] === undefined) {
                                newCounts[a.id] = defaultTotal;
                            }
                        }
                    }
                });
                return newCounts;
            });
        } catch (err: any) {
            console.error("🔴 Error:", err);
            setError(err.message || t("unexpectedError"));
        } finally {
            setLoading(false);
        }
    }, [apiUrl, code, t]);

    useEffect(() => {
        if (dataFetchedRef.current) return;
        dataFetchedRef.current = true;
        fetchSession();
    }, [fetchSession]);

    const decrementCount = async (assignmentId: number) => {
        const currentCount = localCounts[assignmentId];
        if (currentCount === undefined || currentCount <= 0) return;
        const newCount = currentCount - 1;

        setLocalCounts((prev) => ({ ...prev, [assignmentId]: newCount }));

        // DÜZELTME: let yerine const kullanıldı ve logic tek satıra indi.
        const nameToUse = userName || localStorage.getItem("guestUserName");

        try {
            const headers: Record<string, string> = {};
            if (token) headers["Authorization"] = `Bearer ${token}`;

            if (!token && !nameToUse) {
                alert(t("alertEnterName"));
                setLocalCounts((prev) => ({ ...prev, [assignmentId]: currentCount }));
                return;
            }

            let updateUrl = `${apiUrl}/api/distribution/update-progress/${assignmentId}?count=${newCount}`;
            if (!token && nameToUse) updateUrl += `&name=${encodeURIComponent(nameToUse)}`;

            await fetch(updateUrl, { method: "POST", headers, cache: "no-store" });

            if (newCount === 0) {
                let completeUrl = `${apiUrl}/api/distribution/complete/${assignmentId}`;
                if (!token && nameToUse) completeUrl += `?name=${encodeURIComponent(nameToUse)}`;
                const resComplete = await fetch(completeUrl, { method: "POST", headers });
                if (resComplete.ok) {
                    dataFetchedRef.current = false;
                    fetchSession();
                }
            }
        } catch (e) {
            console.error("Save progress failed", e);
            setLocalCounts((prev) => ({ ...prev, [assignmentId]: currentCount }));
        }
    };

    const handleTakePart = async (assignmentId: number) => {
        if (!userName) {
            alert(t("alertEnterName"));
            return;
        }
        try {
            const headers: Record<string, string> = {};
            if (token) headers["Authorization"] = `Bearer ${token}`;

            const res = await fetch(
                `${apiUrl}/api/distribution/take/${assignmentId}?name=${encodeURIComponent(userName)}`,
                { method: "POST", headers }
            );

            if (res.status === 409) {
                alert(t("errorAlreadyTaken"));
                fetchSession();
                return;
            }
            if (!res.ok) {
                const text = await res.text();
                const displayMsg = text.includes("{") ? t("errorOccurred") : text;
                alert(t("alertStatus") + displayMsg);
                fetchSession();
                return;
            }
            alert(t("alertTakenSuccess"));
            dataFetchedRef.current = false;
            fetchSession();
        } catch (err) {
            console.error(err);
            alert(t("errorOccurred"));
            fetchSession();
        }
    };

    const handleCancelPart = async (assignmentId: number) => {
        if (!confirm(t("confirmCancel"))) return;

        // DÜZELTME: let yerine const
        const nameToUse = userName || localStorage.getItem("guestUserName");
        if (!nameToUse) return;

        try {
            const headers: Record<string, string> = {};
            if (token) headers["Authorization"] = `Bearer ${token}`;
            let url = `${apiUrl}/api/distribution/cancel/${assignmentId}`;
            if (!token) url += `?name=${encodeURIComponent(nameToUse)}`;

            const res = await fetch(url, { method: "POST", headers });
            if (res.ok) {
                dataFetchedRef.current = false;
                fetchSession();
            } else {
                alert(t("cancelFailed"));
            }
        } catch (e) { console.error(e); }
    };

    const handleCompletePart = async (assignmentId: number) => {
        // DÜZELTME: let yerine const
        const nameToUse = userName || localStorage.getItem("guestUserName");

        if (!nameToUse) return;
        if (!confirm(t("confirmComplete"))) return;

        try {
            const headers: Record<string, string> = {};
            if (token) headers["Authorization"] = `Bearer ${token}`;
            let url = `${apiUrl}/api/distribution/complete/${assignmentId}`;
            if (!token) url += `?name=${encodeURIComponent(nameToUse)}`;

            const res = await fetch(url, { method: "POST", headers });
            if (res.ok) {
                dataFetchedRef.current = false;
                fetchSession();
            } else {
                const msg = await res.text();
                alert(t("errorPrefix") + msg);
            }
        } catch (e) {
            console.error(e);
            alert(t("connectionError"));
        }
    };

    const openReadingModal = (assignment: Assignment, startPage?: number, endPage?: number) => {
        if (assignment.resource.type === "PAGED" && startPage && endPage) {
            setReadingModalContent({
                title: `${t("page")} ${startPage} - ${endPage}`,
                type: "QURAN",
                startUnit: startPage,
                endUnit: endPage,
                currentUnit: startPage,
                assignmentId: assignment.id,
            });
            return;
        }

        const resource = assignment.resource;
        let translation = resource.translations?.find((trans) => trans.langCode === language);
        if (!translation) {
            translation = resource.translations?.find((trans) => trans.langCode === "tr") || resource.translations?.[0];
        }
        const description = translation?.description;
        if (!description) {
            console.warn("İçerik bulunamadı");
            return;
        }

        if (resource.type === "COUNTABLE" || resource.type === "JOINT") {
            const parts = description.split("|||");
            if (resource.codeKey === "UHUD") {
                setReadingModalContent({
                    title: resource.translations?.[0]?.name || t("readingTitle"),
                    type: "CEVSEN",
                    cevsenData: [{ babNumber: 1, arabic: parts[0]?.trim() || "", transcript: parts[1]?.trim() || "", meaning: parts[2]?.trim() || "" }],
                    startUnit: 1,
                    codeKey: "UHUD",
                    assignmentId: assignment.id,
                });
                return;
            }
            setReadingModalContent({
                title: resource.translations?.[0]?.name || t("readingTitle"),
                type: "SALAVAT",
                salavatData: { arabic: parts[0]?.trim() || "", transcript: parts[1]?.trim() || "", meaning: parts[2]?.trim() || "" },
                codeKey: resource.codeKey,
                assignmentId: assignment.id,
            });
        } else if (resource.type === "LIST_BASED") {
            let separator = "###";
            if (resource.codeKey === "BEDIR" && !description.includes("###")) separator = "\n";

            const allParts = description.split(separator).filter((p) => p.trim().length > 0);
            const selectedPartsRaw = allParts.slice(Math.max(0, assignment.startUnit - 1), Math.min(allParts.length, assignment.endUnit));

            const parsedData: CevsenBab[] = selectedPartsRaw.map((rawPart, index) => {
                const parts = rawPart.split("|||");
                return {
                    babNumber: assignment.startUnit + index,
                    arabic: parts[0]?.trim() || rawPart.trim(),
                    transcript: parts[1]?.trim() || rawPart.trim(),
                    meaning: parts[2]?.trim() || "",
                };
            });

            setReadingModalContent({
                title: resource.translations?.[0]?.name || t("readingTitle"),
                type: "CEVSEN",
                cevsenData: parsedData,
                startUnit: assignment.startUnit,
                codeKey: resource.codeKey,
                assignmentId: assignment.id,
            });
        }
    };

    return {
        session,
        loading,
        error,
        localCounts,
        userName,
        setUserName,
        readingModalContent,
        setReadingModalContent,
        actions: {
            decrementCount,
            handleTakePart,
            handleCancelPart,
            handleCompletePart,
            openReadingModal
        }
    };
}