// fe/constants/adminConfig.ts

export const CATEGORY_ORDER = [
  "MAIN", // Quran
  "SURAHS", // Specific Surahs (Yasin, Fetih)
  "PRAYERS", // Prayers (Cevşen, Tevhidname)
  "SALAWATS", // Salawats
  "NAMES", // Names of Allah/Prophet/Companions (Bedir, Uhud)
  "DHIKRS", // General Dhikrs
] as const;

export const CATEGORY_MAPPING: Record<string, (typeof CATEGORY_ORDER)[number]> = {
  QURAN: "MAIN",
  FETIH: "SURAHS",
  YASIN: "SURAHS",
  WAQIA: "SURAHS",
  FATIHA: "SURAHS",
  AYETELKURSU: "SURAHS",
  IHLAS: "SURAHS",
  FELAK: "SURAHS",
  NAS: "SURAHS",
  CEVSEN: "PRAYERS",
  TEVHIDNAME: "PRAYERS",
  OZELSALAVAT: "SALAWATS",
  TEFRICIYE: "SALAWATS",
  MUNCIYE: "SALAWATS",
  BEDIR: "NAMES",
  UHUD: "NAMES",
  YALATIF: "DHIKRS",
  YAHAFIZ: "DHIKRS",
  YAFETTAH: "DHIKRS",
  HASBUNALLAH: "DHIKRS",
  LAHAVLE: "DHIKRS",
};

export const RESOURCE_PRIORITY = [
  "QURAN",
  "FETIH",
  "YASIN",
  "WAQIA",
  "FATIHA",
  "AYETELKURSU",
  "IHLAS",
  "FELAK",
  "NAS",
  "CEVSEN",
  "TEVHIDNAME",
  "OZELSALAVAT",
  "TEFRICIYE",
  "MUNCIYE",
  "BEDIR",
  "UHUD",
];

export const MULTIPLIER_KEYWORDS = [
  "KURAN",
  "QURAN",
  "CEVSEN",
  "BEDIR",
  "UHUD",
  "TEVHIDNAME",
];