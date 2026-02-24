// fe/utils/sessionUtils.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { SessionSummary } from "@/types";

export const ORDER_PRIORITY = [
  "QURAN", "CEVSEN", "TEVHIDNAME", "FETIH", "YASIN", 
  "FATIHA","AYETELKURSU", "IHLAS", "FELAK", "NAS", "WAQIA", 
  "BEDIR", "UHUD", "OZELSALAVAT", "MUNCIYE", 
  "TEFRICIYE", "YALATIF", "YAHAFIZ", "YAFETTAH", 
  "HASBUNALLAH", "LAHAVLE",
];

export const sortSessions = (sessions: SessionSummary[]) => {
  return [...sessions].sort((a, b) => {
    const codeA = (
      (a as any).resourceCode || (a as any).codeKey || (a as any).resource?.codeKey || ""
    ).toUpperCase();
    const codeB = (
      (b as any).resourceCode || (b as any).codeKey || (b as any).resource?.codeKey || ""
    ).toUpperCase();

    const indexA = ORDER_PRIORITY.indexOf(codeA);
    const indexB = ORDER_PRIORITY.indexOf(codeB);

    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;

    return b.id - a.id;
  });
};