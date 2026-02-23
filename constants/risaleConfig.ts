export const RISALE_REPO = "alitekdemir/Risale-i-Nur-Diyanet";
export const RISALE_BRANCH = "master"; // veya linkteki spesifik commit: "1dad9ea73618772d5daecad19e8ccb27c0923d27"

export const RISALE_BOOKS = [
  { id: "01", name: "Sözler", folder: "html/01 Sözler" },
  { id: "02", name: "Mektubat", folder: "html/02 Mektubat" },
  { id: "03", name: "Lem'alar", folder: "html/03 Lem'alar" },
  { id: "04", name: "Şuâlar", folder: "html/04 Şuâlar" },
  { id: "05", name: "Tarihçe-i Hayat", folder: "html/05 Tarihçe-i Hayat" },
  { id: "06", name: "Mesnevî-i Nuriye", folder: "html/06 Mesnevî-i Nuriye" },
  { id: "07", name: "İşaratü'l-i'caz", folder: "html/07 İşaratü'l-i'caz" },
  { id: "08", name: "Sikke-i Tasdik-i Gaybî ", folder: "html/08 Sikke-i Tasdik-i Gaybî" },
  { id: "09", name: "Barla Lâhikası", folder: "html/09 Barla Lâhikası" },
  { id: "10", name: "Kastamonu Lâhikası", folder: "html/10 Kastamonu Lâhikası" },
  { id: "11", name: "Emirdağ Lâhikası 1", folder: "html/11 Emirdağ Lâhikası 1" },
  { id: "12", name: "Emirdağ Lâhikası 2", folder: "html/12 Emirdağ Lâhikası 2" },
  { id: "13", name: "Küçük Kitaplar ", folder: "html/14 Küçük Kitaplar" },

];

export const GITHUB_API_BASE = `https://api.github.com/repos/${RISALE_REPO}/contents`;
export const GITHUB_RAW_BASE = `https://raw.githubusercontent.com/${RISALE_REPO}/${RISALE_BRANCH}`;