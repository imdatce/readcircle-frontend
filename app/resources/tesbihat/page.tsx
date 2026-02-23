/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

// --- YARDIMCI BİLEŞENLER (UI) ---
const SectionCard = ({
  title,
  instruction,
  children,
}: {
  title?: string;
  instruction?: string;
  children: React.ReactNode;
}) => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 dark:border-gray-800 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
    {title && (
      <h3 className="font-black text-emerald-700 dark:text-emerald-400 mb-1.5 text-[length:calc(16px+var(--font-offset))] transition-all">
        {title}
      </h3>
    )}
    {instruction && (
      <p className="font-bold text-gray-500 dark:text-gray-400 mb-3 pb-2 border-b border-gray-100 dark:border-gray-800 text-[length:calc(11px+var(--font-offset-small))] transition-all">
        {instruction}
      </p>
    )}
    <div className="space-y-2 text-gray-800 dark:text-gray-200 font-serif leading-relaxed text-[length:calc(15px+var(--font-offset))] transition-all">
      {children}
    </div>
  </div>
);

const Badge = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center justify-center font-sans font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded ml-1.5 align-middle transform -translate-y-px text-[length:calc(9px+var(--font-offset-small))] transition-all">
    {children}
  </span>
);

const Line = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => <p className={`mb-1 ${className}`}>{children}</p>;

const InstructionText = ({ children }: { children: React.ReactNode }) => (
  <p className="font-sans font-bold text-emerald-600/80 dark:text-emerald-400/80 my-2.5 uppercase tracking-wide text-[length:calc(10px+var(--font-offset-small))] transition-all">
    {children}
  </p>
);

// --- ORTAK DUA BİLEŞENLERİ ---
const SalatenTuncina = () => (
  <>
    <Line>
      Allâhumme salli ‘alâ seyyidinâ Muhammedin ve ‘alâ âl-i seyyidinâ Muhammed.
    </Line>
    <Line>Salâten tuncînâ bihâ min cemî’i’l-ehvâli ve’l-‘âfât.</Line>
    <Line>Ve takdî lenâ bihâ cemî’a’l-hâcât.</Line>
    <Line>Ve tutahhirunâ bihâ min cemî’i’s-seyyiât.</Line>
    <Line>Ve terfe’unâ bihâ ‘indeke a’le’d-derecât.</Line>
    <Line>
      Ve tubelliğunâ bihâ aksa’l-ğâyât, min cemî’i’l-hayrâti fi’l-hayâti ve
      be’de’l-memât.
    </Line>
    <Line>Âmîn Yâ Mucîbe’d-de’avât, ve’l-hamdu lillâhi Rabbi’l ‘âlemîn.</Line>
  </>
);

const AyetulKursiVeTesbihler = () => (
  <>
    <Line>
      Subhanellâhi ve’l-hamdu lillâhi ve lâ ilâhe illallâhu ve’llâhu ekber, ve
      lâ havle ve lâ kuvvete illâ billâhi’l-‘aliyyi’l-‘azîm.
    </Line>
    <InstructionText>Bu duâdan sonra "Âyetü'l Kürsî" okunur:</InstructionText>
    <Line>Bismillâhirrahmânirrahîm.</Line>
    <Line>
      Allâhu lâ ilâhe illâ huve’l-Hayyu’l-Kayyûm, lâ te’huzuhû sinetun ve lâ
      nevm, lehû mâ fi’s-semâvâti ve mâ fi’l-ard, men ze’llezî yeşfe’u ‘indehû
      illâ bi iznih, ye’lemu mâ beyne eydîhim ve mâ halfehum, ve lâ yuhîtûne bi
      şey’in min ‘ilmihî illâ bimâ şâ’, vesi’a kursiyyuhu’s-semâvâti ve’l-ard,
      ve lâ ye’ûduhû hifzuhumâ ve huve’l-‘Aliyyu’l-‘Azîm.
    </Line>
    <InstructionText>Daha sonra Tesbihler çekilir:</InstructionText>
    <Line>
      Subhânellâhi bukraten ve esîlâ <Badge>33 defa Subhanallah</Badge>
    </Line>
    <Line>
      Elhamdulillâhi hamden kesîrâ <Badge>33 defa Elhamdulillah</Badge>
    </Line>
    <Line>
      Allâhu Ekberu kebîrâ <Badge>33 defa Allâhu Ekber</Badge>
    </Line>
    <InstructionText>
      Akabinde şu dua okunur ve Namaz Duası yapılır:
    </InstructionText>
    <Line>
      Lâ ilâhe illallâhu vahdehû lâ şerîke leh, lehu’l-mulku ve lehu’l-hamdu ve
      huve ‘alâ kulli şey’in kadîr ve ileyhi’l-masîr.
    </Line>
  </>
);

const KelimeiTevhidVeSalavat = ({ baslangic }: { baslangic: string }) => (
  <>
    <InstructionText>
      Duâdan sonra 1 defa "{baslangic}" ve 33 defa Lâ ilâhe illallah denilir.
    </InstructionText>
    <Line>
      Lâ ilâhe illallah <Badge>33 defa</Badge>
    </Line>
    <InstructionText>
      33'üncüsünde şu ilave edilir ve tesbihata devam edilir:
    </InstructionText>
    <Line>Muhammedu’r-Rasûlullahi sallâllâhu te’âlâ aleyhi ve sellem.</Line>
    {baslangic === "Fa’lem ennehû" && (
      <Line>
        Lâ ilâhe illallâhu’l-Meliku’l-Hakku’l-Mubîn, Muhammedu’r-Rasûlullahi
        Sâdiku’l-va’di’l-emîn. <Badge>10 defa</Badge>
      </Line>
    )}
    <InstructionText>Salavatlar:</InstructionText>
    <Line>
      Bismillâhirrahmânirrahîm. İnne’llâhe ve melâiketehû yusallûne
      ‘ale’n-nebiyy, yâ eyyuhe’llezîne âmenû sallû aleyhi ve sellimû teslîmâ,
      lebbeyk.
    </Line>
    <Line>
      Allâhumme salli ‘alâ seyyidinâ Muhammedin ve ‘alâ âl-i seyyidinâ Muhammed,
      bi ‘adedi kulli dâin ve devâin ve bârik ve sellim ‘aleyhi ve ‘aleyhim
      kesîrân <Badge>3 defa</Badge> kesîrâ.
    </Line>
    <Line>
      Salli ve sellim Yâ Rabbi ‘alâ habîbike Muhammedin ve ‘alâ cemî’i’l-enbiyâi
      ve’l-murselîn, ve ‘alâ âl’-i kullin ve sahbi kullin ecme’în, âmîn
      ve’l-hamdu li’llâhi Rabbi’l-‘alemîn.
    </Line>
    <Line>Elfu elfi salâtin ve elfu elfi selâmin ‘aleyke Yâ Râsulallâh</Line>
    <Line>Elfu elfi salâtin ve elfu elfi selâmin ‘aleyke Yâ Habîballâh</Line>
    <Line>
      Elfu elfi salâtin ve elfu elfi selâmin ‘aleyke Yâ Emîne vahyillâh.
    </Line>
    <Line>
      Allâhumme salli ve sellim ve bârik ‘alâ seyyidinâ Muhammedin ve ‘alâ
      ‘âlihî ve ashâbih, bi ‘adedi evrâki’l-eşcâr, ve emvâci’l-bihâr, ve
      katerâti’l-emtâr. Vağfir lenâ ve’rhamnâ ve’ltuf binâ Yâ İlâhenâ bi kulli
      salâtin minhâ şehadeh, eşhedu en lâ ilâhe illa’llâh, ve eşhedu enne
      Muhammede’r-Rasûlullahi sallallâhu te’âlâ ‘aleyhi ve sellem.
    </Line>
  </>
);

const IsmiAzam = () => {
  const lines = [
    "Yâ Cemîlu Yâ Allah, Yâ Karîbu Yâ Allah",
    "Yâ Mucîbu Yâ Allah, Yâ Habîbu Yâ Allah",
    "Yâ Raûfu Yâ Allah, Yâ Atûfu Yâ Allah",
    "Yâ Ma’rûfu Yâ Allah, Yâ Latîfu Yâ Allah",
    "Yâ Azîmu Yâ Allah, Yâ Hannânu Yâ Allah",
    "Yâ Mennânu Yâ Allah, Yâ Deyyânu Yâ Allah",
    "Yâ Subhânu Yâ Allah, Yâ Emânu Yâ Allah",
    "Yâ Burhânu Yâ Allah, Yâ Sultânu Yâ Allah",
    "Yâ Muste’ânu Yâ Allah, Yâ Muhsinu Yâ Allah",
    "Yâ Mute’âl Yâ Allah, Yâ Rahmânu Yâ Allah",
    "Yâ Rahîmu Yâ Allah, Yâ Kerîmu Yâ Allah",
    "Yâ Mecîdu Yâ Allah, Yâ Ferdu Yâ Allah",
    "Yâ Vitru Yâ Allah, Yâ Ehadu Yâ Allah",
    "Yâ Samedu Yâ Allah, Yâ Mahmûdu Yâ Allah",
    "Yâ Sâdika’l-va’di Yâ Allah, Yâ ‘Aliyyu Yâ Allah",
    "Yâ Ğaniyyu Yâ Allah, Yâ Şâfî Yâ Allah",
    "Yâ Kâfî Yâ Allah, Yâ Mu’âfî Yâ Allah",
    "Yâ Bâkî Yâ Allah, Yâ Hâdî Yâ Allah",
    "Yâ Kâdiru Yâ Allah, Yâ Sâtiru Yâ Allah",
    "Yâ Kahhâru Yâ Allah, Yâ Cebbâru Yâ Allah",
    "Yâ Ğaffâru Yâ Allah, Yâ Fettâhu Yâ Allah",
  ];
  return (
    <>
      <Line>Bismillâhirrahmânirrahîm</Line>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-0.5 mb-2.5 text-[length:calc(14px+var(--font-offset))]">
        {lines.map((l, i) => (
          <span key={i} className="transition-all">
            {l}
          </span>
        ))}
      </div>
      <InstructionText>
        Sonra eller yukarı kaldırılır ve şöyle duâ edilir:
      </InstructionText>
      <Line>
        Yâ Rabbe’s-semâvâti ve’l-ard, Yâ Ze’l-celâli ve’l-ikrâm. Nes’eluke bi
        hakkı hâzihi’l-esmâi kullihâ en tusalliye ‘alâ seyyidinâ Muhammedin ve
        ‘alâ âl-i seyyidinâ Muhammed, ve’rham seyyidenâ Muhammeden kemâ salleyte
        ve sellemte ve bârakte ve rahimte ve terahhamte ‘alâ seyyidinâ İbrâhîme
        ve ‘alâ âl-i seyyidinâ İbrâhîme fi’l-‘âlemîn, Rabbenâ inneke hamîdun
        mecîd, bi rahmetike Yâ Erhame’r-Râhimîn, ve’l-hamdu lillâhi
        Rabbi’l-‘alemîn.
      </Line>
    </>
  );
};

const TercumanIsmiAzam = () => {
  const lines = [
    "Subhâneke Yâ Allah te'âleyte Yâ Rahmân",
    "Subhâneke Yâ Rahîm te'âleyte Yâ Kerîm",
    "Subhâneke Yâ Hamîd te'âleyte Yâ Hakîm",
    "Subhâneke Yâ Mecîd te'âleyte Yâ Melik",
    "Subhâneke Yâ Kuddûs te'âleyte Yâ Selâm",
    "Subhâneke Yâ Mu'min te'âleyte Yâ Muheymin",
    "Subhâneke Yâ Azîz te'âleyte Yâ Cebbâr",
    "Subhâneke Yâ Mutekebbir te'âleyte Yâ Hâlik",
    "Subhâneke Yâ Evvel te'âleyte Yâ Âhir",
    "Subhâneke Yâ Zâhir te'âleyte Yâ Bâtın",
    "Subhâneke Yâ Bâri' te'âleyte Yâ Musavvir",
    "Subhâneke Yâ Tevvâb te'âleyte Yâ Vehhâb",
    "Subhâneke Yâ Bâis te'âleyte Yâ Vâris",
    "Subhâneke Yâ Kadîm te'âleyte Yâ Mukîm",
    "Subhâneke Yâ Ferd te'âleyte Yâ Vitr",
    "Subhâneke Yâ Nûr te'âleyte Yâ Settâr",
    "Subhâneke Yâ Celîl te'âleyte Yâ Cemîl",
    "Subhâneke Yâ Kâhir te'âleyte Yâ Kâdir",
    "Subhâneke Yâ Melik te'âleyte Yâ Muktedir",
    "Subhâneke Yâ 'Alîm te'âleyte Yâ 'Allâm",
    "Subhâneke Yâ 'Azîm te'âleyte Yâ Ğafûr",
    "Subhâneke Yâ Halîm te'âleyte Yâ Vedûd",
    "Subhâneke Yâ Şehîd te'âleyte Yâ Şâhid",
    "Subhâneke Yâ Kebîr te'âleyte Yâ Mute'âl",
    "Subhâneke Yâ Nûr te'âleyte Yâ Latîf",
    "Subhâneke Yâ Semî' te'âleyte Yâ Kefîl",
    "Subhâneke Yâ Karîb te'âleyte Yâ Basîr",
    "Subhâneke Yâ Hakk te'âleyte Yâ Mubîn",
    "Subhâneke Yâ Raûf te'âleyte Yâ Rahîm",
    "Subhâneke Yâ Tâhir te'âleyte Yâ Mutahhir",
    "Subhâneke Yâ Mucemmil te'âleyte Yâ Mufaddil",
    "Subhâneke Yâ Muzhir te'âleyte Yâ Mun'im",
    "Subhâneke Yâ Deyyân te'âleyte Yâ Sultân",
    "Subhâneke Yâ Hannân te'âleyte Yâ Mennân",
    "Subhâneke Yâ Ehad te'âleyte Yâ Samed",
    "Subhâneke Yâ Hayy te'âleyte Yâ Kayyûm",
    "Subhâneke Yâ Adl te'âleyte Yâ Hakem",
    "Subhâneke Yâ Ferd te'âleyte Yâ Kuddûs",
  ];
  return (
    <>
      <Line>Bismillâhirrahmânirrahîm</Line>
      <div className="space-y-1.5 mb-4">
        {lines.map((l, i) => (
          <div
            key={i}
            className="flex flex-col border-b border-gray-100 dark:border-gray-800 pb-1.5"
          >
            <span className="font-semibold text-[length:calc(14px+var(--font-offset))] transition-all">
              {l}
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 mt-0.5 text-[length:calc(10px+var(--font-offset-small))] transition-all">
              ecirnâ mine'n-nâr bi 'afvike Yâ Rahmân
            </span>
          </div>
        ))}
      </div>
      <InstructionText>
        Sonra eller yukarı kaldırılır ve şöyle duâ edilir:
      </InstructionText>
      <Line>
        Âmîn. Subhâneke âhiyyen şerâhiyyen te’aleyte lâ ilâhe illâ ente ecirnâ
        ve ecir Üstâzenâ ve Hocaefendi ve vâlidînâ ve rufekâenâ ve ecdâdenâ ve
        ceddâtinâ ve e’mâmenâ ve ‘ammâtinâ ve ehvâlenâ ve hâlâtinâ ve ihvânenâ
        ve ehavâtinâ ve ekribâena ve esdikâenâ ve sadâikanâ ve ehbâbenâ ve
        ehibbâenâ’l mu’minîne ve’l-mu’minâti ve’l-muslimîne ve’l-muslimâti fî
        hidmetinâ fî kulli enhâi’l-‘âlem ve fî kulli nevâhi’l-hayâti ve cemî’a
        tullâbi’n-nûri mine’n-nâr.
      </Line>
      <InstructionText>
        Burada avuç içleri aşağı çevirilerek duâya devam edilir:
      </InstructionText>
      <Line>
        Ve min kulli nâr, vehfeznâ min şerri’n-nefsi ve’ş-şeytân, ve min
        şerri’l-cinni ve’l-insân, ve min şerri’l-bid’ati ve’d-dalâlâti
        ve’l-ilhâdi ve’t-tuğyân.
      </Line>
      <InstructionText>
        Denildikten sonra avuç içleri tekrar yukarı çevirilerek duâya devam
        edilir:
      </InstructionText>
      <Line>
        Bi afvike Yâ Mucîr, bi fadlike Yâ Ğaffâr, birahmetike Yâ
        Erhame’r-râhimîn. Allâhumme edhilne’l-cennete me’a’l-ebrâr bi şefâ’ati
        nebiyyike’l-muhtâr, ve âlihi’l-ethâr, ve eshâbihi’l-ahyâr, ve sellim mâ
        dâme’l-leylu ve’n-nehâr, Âmîn, ve’l-hamdu lillâhi Rabbi’l-‘âlemîn.
      </Line>
    </>
  );
};

const EcirnaIstiazeleri = () => (
  <>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1.5 mb-4 text-[length:calc(14px+var(--font-offset))] transition-all">
      <span className="col-span-full mb-1">
        Allâhumme ecirnâ mine’n-nâr <Badge>7 defa</Badge>
      </span>
      <span>Allâhumme ecirnâ min kulli nâr</span>
      <span>Allâhumme ecirnâ mine’l-fitneti’d-dînîyyeti ve’d-dünyeviyyeh</span>
      <span>Allâhumme ecirnâ min fitneti âhiri’z-zamân</span>
      <span>Allâhumme ecirnâ min fitneti’l-mesîhi’deccâli ve’s-sufyân</span>
      <span>
        Allâhumme ecirnâ mine’d-dalâlâti ve’l-bid’iyyâti ve’l-beliyyât
      </span>
      <span>Allâhumme ecirnâ min şerri’n-nefsi’l emmârah</span>
      <span>
        Allâhumme ecirnâ min şurûri’n-nufûsi’l-emmârati’l-fir’avniyyeh
      </span>
      <span>Allâhumme ecirnâ min şerri’n-nisâ’</span>
      <span>Allâhumme ecirnâ min belâi’n-nisâ’</span>
      <span>Allâhumme ecirnâ min fitneti’n-nisâ’</span>
      <span>Allâhumme ecirnâ min azâbi’l-kabr</span>
      <span>Allâhumme ecirnâ min azâbi yevmi'l-kıyâmeh</span>
      <span>Allâhumme ecirnâ min azâbi cehennem</span>
      <span>Allâhumme ecirnâ min azâbi kahrik</span>
      <span>Allâhumme ecirnâ min nâri kahrik</span>
      <span>Allâhumme ecirnâ min azâbi’l-kabri ve’n-nîrân</span>
      <span>
        Allâhumme ecirnâ mine’r-riyâ’i ve’s-sum’ati ve’l-ucubi ve’l-fahr
      </span>
      <span>Allâhumme ecirnâ min tecâvuzi’l-mulhidîn</span>
      <span>Allâhumme ecirnâ min şerri’l-munafikîn</span>
      <span>Allâhumme ecirnâ min fitneti’l-fasikîn.</span>
    </div>
    <Line>
      Allahumme ecirnâ ve ecir Üstâzenâ ve Hocaefendi ve vâlidînâ ve rufekâenâ
      ve ecdâdenâ ve ceddâtinâ ve e’mâmenâ ve ‘ammâtina ve ahvâlenâ ve hâlâtinâ
      ve ihvânenâ ve ahavâtinâ ve ekribâenâ ve esdikâenâ ve sadâikanâ ve
      ahbâbenâ ve ehibbâena’l-mu’minîne ve’l-mu’minât ve’l-muslimîne
      ve’l-muslimât fî hidmetinâ fî kulli enhâi’l-‘âlem ve fî kulli
      nevâhi’l-hayât(h) ve cemî’a tullâbi’n-nûri mine’n-nâr ve min kulli nâr.
    </Line>
    <InstructionText>
      Avuç içleri yukarı çevirilerek istiâzeye devam edilir:
    </InstructionText>
    <Line>
      Bi ‘afvike Yâ Mucîr, bi fadlike Yâ Ğaffâr, bi rahmetike Yâ
      Erhame’r-Râhimîn.
    </Line>
    <Line>
      Allâhumme edhilne’l-cennete me’a’l-ebrâr <Badge>3 defa</Badge>
    </Line>
    <Line>
      Bi-şefâ’ati nebiyyike’l-muhtâr, ve âlihi’l-ethâr, ve eshâbihi’l-ehyâr, ve
      sellim mâ dâme’l-leylu ve’n-nehâr, Âmîn, ve’l-hamdu lillâhi
      Rabbi’l-‘âlemîn.
    </Line>
  </>
);

// --- ANA SAYFA BİLEŞENİ ---
export default function TesbihatPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<
    "sabah" | "ogle" | "ikindi" | "aksam" | "yatsi"
  >("sabah");

  // Font büyütme/küçültme offset değeri (0, 2, 4, 6, 8, 10, 12)
  const [fontOffset, setFontOffset] = useState(0);

  // Tarayıcı belleğinden font büyüklüğünü yükle
  useEffect(() => {
    const saved = localStorage.getItem("tesbihat_font_offset");
    if (saved) {
      // ESLint uyarısını aşmak için işlemi mikro-görev kuyruğuna (microtask) alıyoruz.
      Promise.resolve().then(() => setFontOffset(Number(saved)));
    }
  }, []);

  const handleFontChange = (newOffset: number) => {
    setFontOffset(newOffset);
    localStorage.setItem("tesbihat_font_offset", newOffset.toString());
  };

  const TABS = [
    { id: "sabah", label: "Sabah Namazı" },
    { id: "ogle", label: "Öğle Namazı" },
    { id: "ikindi", label: "İkindi Namazı" },
    { id: "aksam", label: "Akşam Namazı" },
    { id: "yatsi", label: "Yatsı Namazı" },
  ] as const;

  return (
    <div className="min-h-screen bg-[#FDFDFD] dark:bg-gray-950 py-4 px-3 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Üst Bar: Başlık, Geri Butonu ve Font Ayarı */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/resources"
              className="p-2.5 bg-white dark:bg-gray-900 text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl shadow-sm hover:shadow border border-gray-100 dark:border-gray-800 transition-all active:scale-95 shrink-0"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </Link>
            <div>
              <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight leading-none mb-1">
                {t("tesbihatlar") || "Tesbihatlar"}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-[11px] leading-none">
                Namazlardan sonra okunan faziletli vird ve zikirler.
              </p>
            </div>
          </div>

          {/* A- / A+ Font Kontrolleri */}
          <div className="flex items-center gap-1 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-1.5 rounded-xl shadow-sm w-fit shrink-0">
            <button
              onClick={() => handleFontChange(Math.max(-8, fontOffset - 2))} // 0 yerine -8'e kadar küçültebilir
              disabled={fontOffset === -8}
              className="w-10 h-9 flex items-center justify-center bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-emerald-600 rounded-lg transition-colors font-bold text-sm disabled:opacity-30"
            >
              A-
            </button>
            <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1"></div>
            <button
              onClick={() => handleFontChange(Math.min(12, fontOffset + 2))}
              disabled={fontOffset === 12}
              className="w-10 h-9 flex items-center justify-center bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-emerald-600 rounded-lg transition-colors font-bold text-lg disabled:opacity-30"
            >
              A+
            </button>
          </div>
        </div>

        {/* Sekmeler (Tabs) */}
        <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 rounded-xl font-bold text-[11px] sm:text-xs whitespace-nowrap transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                  : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-800 hover:bg-emerald-50 dark:hover:bg-gray-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* İÇERİK ALANLARI (CSS Değişkeni İle Font Boyutu Kontrolü) */}
        <div
          className="pb-20"
          style={
            {
              "--font-offset": `${fontOffset}px`,
              "--font-offset-small": `${fontOffset * 0.6}px`,
            } as React.CSSProperties
          }
        >
          {/* SABAH NAMAZI */}
          {activeTab === "sabah" && (
            <div>
              <SectionCard
                title="Farz Namazından Sonra"
                instruction="Sabah namazının farzı kılınıp selâm verildikten sonra:"
              >
                <Line>
                  Estağfirullâh <Badge>3 defa</Badge>
                </Line>
                <Line>
                  Allâhumme ente’s-selâmu ve minke’s-selâm, tebârakte Yâ
                  Ze’l-Celâli ve’l İkrâm.
                </Line>
              </SectionCard>

              <SectionCard
                title="Salât-ı Münciye"
                instruction="Eller kaldırılarak okunur:"
              >
                <SalatenTuncina />
              </SectionCard>

              <SectionCard
                title="Kelime-i Tevhid ve İstiâze"
                instruction="Duâ okunduktan sonra 1 defa şu şekilde başlanır:"
              >
                <Line>
                  Allâhumme innâ nukaddimu ‘ileyke beyne yedey kulli nefesin ve
                  lemhatin ve lahzatin ve tarfetin yetrifû bihâ ehlu’s-semâvâti
                  ve ehlu’l-eradîne şehadeten, eşhedu en...
                </Line>
                <InstructionText>
                  Akabinde 9 defa şu cümle-i tevhid söylenir:
                </InstructionText>
                <Line>
                  Lâ ilâhe illallâhu vahdehû lâ şerîke leh, lehu’l-mulku ve
                  lehu’l-hamdu ve huve ‘alâ kulli şey’in Kadîr.{" "}
                  <Badge>9 defa</Badge>
                </Line>
                <InstructionText>Onuncusunda ise;</InstructionText>
                <Line>
                  Lâ ilâhe illallâhu vahdehû lâ şerîke leh, lehu’l-mulku ve
                  lehu’l-hamdu yuhyî ve yumît, ve huve hayyun lâ yemût,
                  biyedihi’l-hayr, ve huve ‘alâ kulli şey’in Kadîrun ve ileyhi’l
                  masîr.
                </Line>
                <InstructionText>
                  Denildikten sonra, eller duâ için kaldırılır (avuç içleri yere
                  bakar şekilde) ve aşağıdaki "Ecirnâ" istiâzeleri okunur:
                </InstructionText>
                <EcirnaIstiazeleri />
              </SectionCard>

              <SectionCard
                title="Tesbihât"
                instruction="Daha sonra tesbihâta devam edilir:"
              >
                <AyetulKursiVeTesbihler />
                <KelimeiTevhidVeSalavat baslangic="Fa’lem ennehû" />
              </SectionCard>

              <SectionCard title="Tercümân-ı İsm-i A'zam Duâsı">
                <TercumanIsmiAzam />
              </SectionCard>

              <SectionCard
                title="Aşr-ı Şerif"
                instruction="Bundan sonra Haşr sûresinin son âyetleri okunur:"
              >
                <Line>
                  E’ûzu bi’llahi’s-semî’i’l-‘alîmi mine’ş-şeytânirracîm{" "}
                  <Badge>3 defa</Badge>
                </Line>
                <Line>Bismillâhirrahmânirrahîm</Line>
                <Line>
                  Huve’llâhullezî lâ ilâhe illâhû, ‘Âlimu’l-ğaybi ve’ş-şehâdeti
                  Huve’r-Rahmânu’r-Rahîm.
                </Line>
                <Line>
                  Huve’llâhullezî lâ ilâhe illâhû,
                  el-Meliku’l-Kuddûsu’s-Selâmu’l-Mu’minu’l-Muheyminu’l-‘Azîzu’l-Cebbâru’l-Mutekebbir,
                  Subhâne’llâhi ammâ yuşrikûn.
                </Line>
                <Line>
                  Huve’llâhu’l-Hâliku’l-Bâriu’l-Musavviru lehu’l-esmâul husnâ,
                  yusebbihu lehû mâ fi’s-semâvâti ve’l-ard, ve
                  huve’l-‘Azîzu’l-Hakîm.
                </Line>
                <Line>Sadekallahu’l-‘Azîm.</Line>
              </SectionCard>
            </div>
          )}

          {/* ÖĞLE NAMAZI */}
          {activeTab === "ogle" && (
            <div>
              <SectionCard
                title="Farz Namazından Sonra"
                instruction="Öğle namazının farzı kılınıp selâm verildikten sonra:"
              >
                <Line>
                  Estağfirullâh <Badge>3 defa</Badge>
                </Line>
                <Line>
                  Allâhumme ente’s-selâmu ve minke’s-selâm, tebârakte Yâ
                  Ze’l-Celâli ve’l İkrâm.
                </Line>
              </SectionCard>

              <SectionCard
                title="Salât-ı Münciye"
                instruction="Eller kaldırılarak okunur:"
              >
                <SalatenTuncina />
              </SectionCard>

              <SectionCard
                title="Tesbihât"
                instruction="Son sünnetten sonra şu duâ okunur:"
              >
                <AyetulKursiVeTesbihler />
                <KelimeiTevhidVeSalavat baslangic="Fe’lem ennehû" />
              </SectionCard>

              <SectionCard title="İsm-i A’zam Duâsı">
                <IsmiAzam />
              </SectionCard>

              <SectionCard
                title="Aşr-ı Şerif"
                instruction="Bundan sonra Fetih sûresi son âyetleri okunur:"
              >
                <Line>E’ûzu bi’llahi mine’ş-şeytânirracîm</Line>
                <Line>Bismillâhirrahmânirrahîm</Line>
                <Line>
                  Lekad sadekallâhu Rasûlehu’r-ru’yâ bi’l-hakk,
                  letedhulunne’l-mescide’l-harâme inşâallâhu âminîne muhallikîne
                  ru’ûsekum ve mukassirîne lâ tehâfûn, fe ‘alime mâ lem te’lemû
                  fece’ale min dûni zâlike fethan karîbâ.
                </Line>
                <Line>
                  Huve’llezî ersele Rasûlehû bi’l-hudâ ve dîni’l-hakki li
                  yuzhirahû ‘ale’d-dîni kullih, ve kefâ bi’llâhi şehîdâ.
                </Line>
                <Line>
                  Muhammedu’r-Rasûlullâh, ve’llezîne me’ahû eşiddâu
                  âle’l-kuffâri ruhamâu beynehum terâhum rukke’an succeden
                  yebteğûne fadlen mine’llâhi ve ridvânâ, sîmâhum fî vucûhihim
                  min eseri’s-sucûd, zâlike meseluhum fi’t-tevrâh, ve meseluhum
                  fi’l-incîli ke zer’in ehrace şet’ehû fe âzerahû fe’steğleza
                  fe’stevâ ‘alâ sûgıhî yu’cibu’z-zurrâ’a li yeğîza
                  bihimu’l-kuffâra ve’adellâhu’llezîne âmenû ve
                  ‘amilu’s-sâlihâti minhum meğfiraten ve ecran azîmâ.
                </Line>
                <Line>Sadekallahu’l-‘Azîm.</Line>
              </SectionCard>
            </div>
          )}

          {/* İKİNDİ NAMAZI */}
          {activeTab === "ikindi" && (
            <div>
              <SectionCard
                title="Farz Namazından Sonra"
                instruction="İkindi namazının farzı kılınıp selâm verildikten sonra:"
              >
                <Line>
                  Estağfirullâh <Badge>3 defa</Badge>
                </Line>
                <Line>
                  Allâhumme ente’s-selâmu ve minke’s-selâm, tebârakte Yâ
                  Ze’l-Celâli ve’l İkrâm.
                </Line>
              </SectionCard>

              <SectionCard
                title="Salât-ı Münciye"
                instruction="Eller kaldırılarak okunur:"
              >
                <SalatenTuncina />
              </SectionCard>

              <SectionCard
                title="Tesbihât"
                instruction="Bundan sonra tesbihâta devam edilir:"
              >
                <AyetulKursiVeTesbihler />
                <KelimeiTevhidVeSalavat baslangic="Fa’lem ennehû" />
              </SectionCard>

              <SectionCard title="Tercümân-ı İsm-i A'zam Duâsı">
                <TercumanIsmiAzam />
              </SectionCard>

              <SectionCard
                title="Aşr-ı Şerif"
                instruction="Bundan sonra Nebe’ Sûresinin 31 ila 40. âyetleri okunur:"
              >
                <Line>E’ûzu bi’llahi mine’ş-şeytânirracîm</Line>
                <Line>Bismillâhirrahmânirrahîm</Line>
                <Line>
                  İnne li’l-muttekîne mefâzâ, hadâika ve e’nâba, ve kevâ’ibe
                  etrâba, ve ke’sen dihâkâ, lâ yesme’ûne fîhâ leğven ve lâ
                  kizzâbâ, cezâen min Rabbike atâen hisâba, Rabbi’s-semâvâti
                  ve’l-‘ardi ve mâ beynehumâ’r-Rahmâni lâ yemlikûne minhu
                  hitâbâ, yevme yekûmu’r-rûhu ve’l-melâiketu saffen lâ
                  yetekellemûne illâ men ezine lehu’r-Rahmânu ve kâle savâbâ,
                  zâlike’l-yevmu’l-hakk, fe men şâe’t-tehaze ilâ Rabbihî meâbâ,
                  innâ enzernâkum azâben karîbâ, yevme yenzuru’l-mer’u mâ
                  kaddemet yedâhu ve yekûlu’l-kâfiru yâ leytenî kuntu turâbâ.
                </Line>
                <Line>Sadekallahu’l-‘Azîm.</Line>
              </SectionCard>
            </div>
          )}

          {/* AKŞAM NAMAZI */}
          {activeTab === "aksam" && (
            <div>
              <SectionCard
                title="Farz Namazından Sonra"
                instruction="Akşam namazının farzı kılınıp selâm verildikten sonra:"
              >
                <Line>
                  Estağfirullâh <Badge>3 defa</Badge>
                </Line>
                <Line>
                  Allâhumme ente’s-selâmu ve minke’s-selâm, tebârakte Yâ
                  Ze’l-Celâli ve’l İkrâm.
                </Line>
              </SectionCard>

              <SectionCard
                title="Salât-ı Münciye"
                instruction="Eller kaldırılarak okunur:"
              >
                <SalatenTuncina />
              </SectionCard>

              <SectionCard
                title="Kelime-i Tevhid ve İstiâze"
                instruction="Sünnetten sonra 1 defa 'Âmennâ biennehû' denilir. Akabinde 9 defa şu cümle-i tevhid söylenir:"
              >
                <Line>
                  Lâ ilâhe illallâhu vahdehû lâ şerîke leh, lehu’l-mulku ve
                  lehu’l-hamdu ve huve ‘alâ kulli şey’in Kadîr.{" "}
                  <Badge>9 defa</Badge>
                </Line>
                <InstructionText>Onuncusunda ise;</InstructionText>
                <Line>
                  Lâ ilâhe illallâhu vahdehû lâ şerîke leh, lehu’l-mulku ve
                  lehu’l-hamdu yuhyî ve yumît, ve huve hayyun lâ yemût,
                  biyedihi’l-hayr, ve huve ‘alâ kulli şey’in Kadîrun ve ileyhi’l
                  masîr.
                </Line>
                <InstructionText>
                  Denildikten sonra, eller duâ için kaldırılır ve (avuç içleri
                  yere bakar şekilde) aşağıdaki "Ecirnâ" istiâzeleri okunur:
                </InstructionText>
                <EcirnaIstiazeleri />
              </SectionCard>

              <SectionCard
                title="Tesbihât"
                instruction="Daha sonra tesbihâta devam edilir:"
              >
                <AyetulKursiVeTesbihler />
                <KelimeiTevhidVeSalavat baslangic="Fe’lem ennehû" />
              </SectionCard>

              <SectionCard title="İsm-i A’zam Duâsı">
                <IsmiAzam />
              </SectionCard>

              <SectionCard
                title="Aşr-ı Şerif"
                instruction="Bundan sonra Haşr sûresinin son âyetleri okunur:"
              >
                <Line>
                  E’ûzu bi’llahi’s-semî’i’l-‘alîmi mine’ş-şeytânirracîm{" "}
                  <Badge>3 defa</Badge>
                </Line>
                <Line>Bismillâhirrahmânirrahîm</Line>
                <Line>
                  Huve’llâhullezî lâ ilâhe illâhû, ‘Âlimu’l-ğaybi ve’ş-şehâdeti
                  huve’r-Rahmânu’r-Rahîm.
                </Line>
                <Line>
                  Huve’llâhullezî lâ ilâhe illâhû,
                  el-Meliku’l-Kuddûsu’s-Selâmu’l-Mu’minu’l-Muheyminu’l-‘Azîzu’l-Cebbâru’l-Mutekebbir,
                  Subhâne’llâhi ammâ yuşrikûn.
                </Line>
                <Line>
                  Huve’llâhu’l-Hâliku’l-Bâriu’l-Musavviru lehu’l-esmâul husnâ,
                  yusebbihu lehû mâ fi’s-semâvâti ve’l-ard, ve
                  huve’l-‘Azîzu’l-Hakîm.
                </Line>
                <Line>Sadekallahu’l-‘Azîm.</Line>
              </SectionCard>
            </div>
          )}

          {/* YATSI NAMAZI */}
          {activeTab === "yatsi" && (
            <div>
              <SectionCard
                title="Farz Namazından Sonra"
                instruction="Yatsı namazının farzı kılınıp selâm verildikten sonra:"
              >
                <Line>
                  Estağfirullâh <Badge>3 defa</Badge>
                </Line>
                <Line>
                  Allâhumme ente’s-selâmu ve minke’s-selâm, tebârakte Yâ
                  Ze’l-Celâli ve’l İkrâm.
                </Line>
              </SectionCard>

              <SectionCard
                title="Salât-ı Münciye"
                instruction="Eller kaldırılarak okunur:"
              >
                <SalatenTuncina />
              </SectionCard>

              <SectionCard
                title="Tesbihât"
                instruction="Son sünnetten ve vitirden sonra şu duâ okunur:"
              >
                <AyetulKursiVeTesbihler />
                <KelimeiTevhidVeSalavat baslangic="Fe’lem ennehû" />
              </SectionCard>

              <SectionCard title="İsm-i A’zam Duâsı">
                <IsmiAzam />
              </SectionCard>

              <SectionCard
                title="Aşr-ı Şerif"
                instruction="Bundan sonra Bakara sûresi 285-286. âyetleri (Âmenerrasûlü) okunur:"
              >
                <Line>E’ûzu bi’llahi mine’ş-şeytânirracîm</Line>
                <Line>Bismillâhirrahmânirrahîm</Line>
                <Line>
                  Âmene’r-rasûlu bimâ unzile ileyhi mi’r-rabbihî ve’l-mu’minûn.
                  Kullun âmene bi’llâhi ve melâiketihî ve kutubihî ve rusulih,
                  la nuferriku beyne ehadi’m-mi’r-rusulih, ve kâlû semi’nâ ve
                  ata’nâ ğufrâneke Rabbenâ ve ileyke’l-masîr.
                </Line>
                <Line>
                  Lâ yukellifullâhu nefsen illâ vus’ahâ, lehâ mâ kesebet ve
                  ‘aleyhâ me’ktesebet.
                </Line>
                <Line>Rabbenâ lâ tuâhiznâ in nesînâ ev ahta’nâ.</Line>
                <Line>
                  Rabbenâ ve lâ tahmil ‘aleynâ isran kemâ hameltehû ‘ale’llezîne
                  min kablinâ.
                </Line>
                <Line>Rabbenâ ve lâ tuhammilnâ mâ lâ tâkate lenâ bih.</Line>
                <Line>
                  Va’fu’annâ va’ğfirlenâ ve’rhamnâ, ente Mevlânâ fe’nsurnâ
                  ‘ale’l-kavmi’l-kâfirîn.
                </Line>
                <Line>Sadekallahu’l-‘Azîm.</Line>
              </SectionCard>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
