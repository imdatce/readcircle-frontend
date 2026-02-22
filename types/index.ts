export const SUPPORTED_LANGUAGES = ['tr', 'en', 'ku', 'ar', 'fr', "nl"] as const;

export type Language = (typeof SUPPORTED_LANGUAGES)[number];

export type ViewMode = "ARABIC" | "LATIN" | "MEANING";

export interface Resource {
  id: number;
  type: "COUNTABLE" | "PAGED" | "JOINT" | "LIST_BASED";
  codeKey: string;
  translations: ResourceTranslation[];
  totalUnits: number;
}


export interface ResourceTranslation {
  langCode: string;
  name: string;
  description?: string;
  unitName?: string;
}

export interface Assignment {
  id: number;
  resource: Resource;
  participantNumber: number;
  startUnit: number;
  endUnit: number;
  isTaken: boolean;
  assignedToName?: string;
  isCompleted?: boolean;
  currentCount?: number;
}

export interface DistributionSession {
  id: number;
  code: string;
  description?: string;
  participants: number;
  creatorName?: string;
  assignments: Assignment[];
  ownerDeviceId?: string; 
  createdAt?: string;
}
export interface SessionSummary {
  id: number;
  code: string;
  description: string;
  creatorName?: string;
  createdAt?: string;
}

export interface CevsenBab {
  babNumber: number;
  arabic: string;
  transcript: string;
  meaning: string;
}

export interface ZikirmatikProps {
  currentCount: number;
  onDecrement: () => void;
  isModal?: boolean;
  t: (key: string) => string;
  readOnly?: boolean;
}


export interface AuthContextType {
  user: string | null;
  role: string | null; // <--- YENİ EKLENDİ
  token: string | null;
  login: (username: string, token: string, role?: string) => void; // role parametresi eklendi
  logout: () => void;
  deleteAccount: () => Promise<void>;
  updateName: (newName: string) => Promise<void>;
  updatePassword: (currentPass: string, newPass: string) => Promise<void>;
}