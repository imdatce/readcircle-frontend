export interface ResourceTranslation {
  id: number;
  langCode: string;
  name: string;
  unitName: string;
  description: string;
}

export interface Resource {
  id: number;
  codeKey: string;
  type: "PAGED" | "LIST_BASED" | "COUNTABLE" | "JOINT";
  totalUnits: number;
  translations: ResourceTranslation[];
}

export interface SessionSummary {
  id: number;
  code: string;
  description: string;
  creatorName?: string;
}

export interface CevsenBab {
  babNumber: number;
  arabic: string;
  transcript: string;
  meaning: string;
}

export interface Assignment {
  id: number;
  resource: Resource;
  participantNumber: number;
  startUnit: number;
  endUnit: number;
  isTaken: boolean;
  assignedToName: string | null;
  currentCount?: number | null;
  isCompleted?: boolean;
}
export interface DistributionSession {
  id: number;
  uniqueCode: string;
  totalParticipants: number;
  createdAt: string;
  resources: Resource[];
  assignments: Assignment[];
}
export interface SessionSummary {
  id: number;
  code: string;
  description: string;
  creatorName?: string;
}

export interface AuthContextType {
  user: string | null;
  token: string | null;
  login: (username: string, token: string) => void;
  logout: () => void;
}

export interface ZikirmatikProps {
  currentCount: number;
  onDecrement: () => void;
  isModal?: boolean;
  t: (key: string) => string;
  readOnly?: boolean;
}

export type Language = 'tr' | 'en' | 'ku';