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

export interface Assignment {
  id: number;
  participantNumber: number;
  startUnit: number;
  endUnit: number;
  isTaken: boolean;
  assignedToName: string | null;
  resource: Resource; 
}

export interface DistributionSession {
  id: number;
  uniqueCode: string;
  totalParticipants: number;
  createdAt: string;
  resources: Resource[]; 
  assignments: Assignment[];
}