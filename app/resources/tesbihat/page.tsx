/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useState, useEffect, Suspense, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

// --- SEPYA (OKUMA) MODU İÇİN CONTEXT ---
const ReadingContext = React.createContext({ isSepia: false });

// --- YARDIMCI BİLEŞENLER (UI) ---
const SectionCard = ({
  title,
  instruction,
  children,
}: {
  title?: string;
  instruction?: string;
  children: React.ReactNode;
}) => {
  const { isSepia } = React.useContext(ReadingContext);
  return (
    <div
      className={`rounded-2xl p-4 sm:p-5 shadow-sm border mb-4 animate-in fade-in slide-in-from-bottom-4 duration-500 transition-colors ${
        isSepia
          ? "bg-[#fdf9f2] border-[#e8dcc4]"
          : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800"
      }`}
    >
      {title && (
        <h3
          className={`font-black mb-1.5 text-[length:calc(16px+var(--font-offset))] transition-colors ${
            isSepia
              ? "text-amber-900"
              : "text-emerald-700 dark:text-emerald-400"
          }`}
        >
          {title}
        </h3>
      )}
      {instruction && (
        <p
          className={`font-bold mb-3 pb-2 border-b text-[length:calc(11px+var(--font-offset-small))] transition-colors ${
            isSepia
              ? "text-amber-700/70 border-amber-200/50"
              : "text-gray-500 dark:text-gray-400 border-gray-100 dark:border-gray-800"
          }`}
        >
          {instruction}
        </p>
      )}
      <div
        className={`space-y-2 font-serif leading-relaxed text-[length:calc(15px+var(--font-offset))] transition-colors ${
          isSepia ? "text-[#432C0A]" : "text-gray-800 dark:text-gray-200"
        }`}
      >
        {children}
      </div>
    </div>
  );
};

// Mini Zikirmatik Bileşeni
const MiniZikirmatik = ({
  target,
  label,
}: {
  target: number;
  label?: string;
}) => {
  const [count, setCount] = useState(target);
  const isCompleted = count === 0;
  const { isSepia } = React.useContext(ReadingContext);

  return (
    <div className="inline-flex items-center gap-2 align-middle">
      {label && (
        <span
          className={`hidden sm:inline-block text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-colors ${
            isSepia
              ? "text-amber-800/60"
              : "text-emerald-800/70 dark:text-emerald-200/60"
          }`}
        >
          {label}
        </span>
      )}

      <button
        onClick={(e) => {
          e.stopPropagation(); // Tam ekran tetiklenmesini engelle
          if (count > 0) setCount(count - 1);
        }}
        disabled={isCompleted}
        className={`group relative flex items-center gap-1.5 p-1 pr-1.5 rounded-full border transition-all duration-500 select-none ${
          isCompleted
            ? isSepia
              ? "bg-amber-100/50 border-amber-200 shadow-[0_0_12px_rgba(217,119,6,0.1)] cursor-default"
              : "bg-gradient-to-r from-emerald-100 to-teal-50 dark:from-emerald-900/40 dark:to-teal-900/30 border-emerald-200/80 dark:border-emerald-700/50 shadow-[0_0_12px_rgba(16,185,129,0.15)] cursor-default"
            : isSepia
              ? "bg-amber-50/50 border-amber-200/60 hover:border-amber-400 hover:shadow-md cursor-pointer active:scale-95"
              : "bg-gradient-to-r from-amber-50 to-emerald-50 dark:from-amber-900/20 dark:to-emerald-900/20 border-amber-200/60 dark:border-emerald-800/50 hover:border-emerald-300 dark:hover:border-emerald-600 hover:shadow-md cursor-pointer active:scale-95"
        }`}
        style={{ fontSize: "calc(12px + var(--font-offset-small))" }}
      >
        <div
          className={`flex items-center justify-center min-w-[2.2rem] py-0.5 px-2 rounded-full font-bold shadow-[inset_0_1px_4px_rgba(0,0,0,0.08)] transition-colors duration-500 ${
            isCompleted
              ? isSepia
                ? "bg-amber-50 text-amber-700"
                : "bg-white/60 dark:bg-black/20 text-emerald-700 dark:text-emerald-300"
              : isSepia
                ? "bg-white/80 text-amber-900"
                : "bg-white/80 dark:bg-gray-950/50 text-emerald-800 dark:text-amber-100/90"
          }`}
        >
          {count}
        </div>

        <div
          className={`flex items-center justify-center w-6 h-6 rounded-full shadow-sm transition-all duration-300 ${
            isCompleted
              ? isSepia
                ? "bg-amber-500 text-white shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                : "bg-emerald-500 text-white shadow-[0_0_8px_rgba(16,185,129,0.5)]"
              : isSepia
                ? "bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-[0_2px_5px_rgba(245,158,11,0.25)]"
                : "bg-gradient-to-br from-emerald-400 to-emerald-600 dark:from-emerald-600 dark:to-emerald-800 text-white shadow-[0_2px_5px_rgba(16,185,129,0.25)]"
          }`}
        >
          {isCompleted ? (
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            <svg
              className="w-3.5 h-3.5 opacity-90"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M20 12H4"
              />
            </svg>
          )}
        </div>
      </button>
    </div>
  );
};

// Zikir Satırı
const ZikirRow = ({
  text,
  target,
  label,
}: {
  text: React.ReactNode;
  target: number;
  label?: string;
}) => {
  const { isSepia } = React.useContext(ReadingContext);
  return (
    <div
      className={`flex items-center justify-between gap-4 p-3 sm:p-4 rounded-2xl border my-3 shadow-sm transition-all hover:shadow-md ${
        isSepia
          ? "bg-amber-50/50 border-amber-200/50 hover:bg-amber-100/50"
          : "bg-emerald-50/40 dark:bg-emerald-900/10 border-emerald-100/60 dark:border-emerald-800/30 hover:bg-emerald-50/70 dark:hover:bg-emerald-900/20"
      }`}
    >
      <span
        className={`flex-1 leading-relaxed font-serif text-[length:calc(15px+var(--font-offset))] transition-colors ${
          isSepia ? "text-[#432C0A]" : "text-gray-800 dark:text-gray-200"
        }`}
      >
        {text}
      </span>
      <div className="shrink-0">
        <MiniZikirmatik target={target} label={label} />
      </div>
    </div>
  );
};

const Line = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => <p className={`mb-1 ${className}`}>{children}</p>;

const InstructionText = ({ children }: { children: React.ReactNode }) => {
  const { isSepia } = React.useContext(ReadingContext);
  return (
    <p
      className={`font-sans font-bold my-2.5 uppercase tracking-wide text-[length:calc(10px+var(--font-offset-small))] transition-colors ${
        isSepia
          ? "text-amber-700/80"
          : "text-emerald-600/80 dark:text-emerald-400/80"
      }`}
    >
      {children}
    </p>
  );
};

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
    <Line>Subhânellâhi bukraten ve esîlâ</Line>

    <ZikirRow text="Subhanallah" target={33} label="Subhanallah" />
    <Line>Elhamdulillâhi hamden kesîrâ</Line>

    <ZikirRow text="Elhamdulillah" target={33} label="Elhamdulillah" />
    <Line>Allâhu Ekberu kebîrâ</Line>

    <ZikirRow text="Allâhu Ekber" target={33} label="Allâhu Ekber" />

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
    <ZikirRow text="Lâ ilâhe illallah" target={33} label="Kelime-i Tevhid" />
    <InstructionText>
      33'üncüsünde şu ilave edilir ve tesbihata devam edilir:
    </InstructionText>
    <Line>Muhammedu’r-Rasûlullahi sallâllâhu te’âlâ aleyhi ve sellem.</Line>
    {baslangic === "Fa’lem ennehû" && (
      <ZikirRow
        text="Lâ ilâhe illallâhu’l-Meliku’l-Hakku’l-Mubîn, Muhammedu’r-Rasûlullahi Sâdiku’l-va’di’l-emîn."
        target={10}
      />
    )}
    <InstructionText>Salavatlar:</InstructionText>
    <Line>
      Bismillâhirrahmânirrahîm. İnne’llâhe ve melâiketehû yusallûne
      ‘ale’n-nebiyy, yâ eyyuhe’llezîne âmenû sallû aleyhi ve sellimû teslîmâ,
      lebbeyk.
    </Line>
    <ZikirRow
      text="Allâhumme salli ‘alâ seyyidinâ Muhammedin ve ‘alâ âl-i seyyidinâ Muhammed, bi ‘adedi kulli dâin ve devâin ve bârik ve sellim ‘aleyhi ve ‘aleyhim kesîrân kesîrâ."
      target={3}
    />
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
      <div className="col-span-full">
        <ZikirRow text="Allâhumme ecirnâ mine’n-nâr" target={7} />
      </div>
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
    <ZikirRow text="Allâhumme edhilne’l-cennete me’a’l-ebrâr" target={3} />
    <Line>
      Bi-şefâ’ati nebiyyike’l-muhtâr, ve âlihi’l-ethâr, ve eshâbihi’l-ehyâr, ve
      sellim mâ dâme’l-leylu ve’n-nehâr, Âmîn, ve’l-hamdu lillâhi
      Rabbi’l-‘âlemîn.
    </Line>
  </>
);

// --- ANA SAYFA BİLEŞENİ ---
function TesbihatContent() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();

  const vakitParam = searchParams.get("vakit") as
    | "sabah"
    | "ogle"
    | "ikindi"
    | "aksam"
    | "yatsi"
    | null;
  const [activeTab, setActiveTab] = useState<
    "sabah" | "ogle" | "ikindi" | "aksam" | "yatsi"
  >("sabah");

  const [fontOffset, setFontOffset] = useState(0);

  // === YENİ ÖZELLİK STATELERİ ===
  const [isSepia, setIsSepia] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [autoScrollSpeed, setAutoScrollSpeed] = useState(1);
  const [barVisible, setBarVisible] = useState(true);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Wake Lock API (Ekranın kapanmasını önler)
  const wakeLockRef = useRef<any>(null);
  useEffect(() => {
    const requestWakeLock = async () => {
      try {
        if ("wakeLock" in navigator) {
          wakeLockRef.current = await (navigator as any).wakeLock.request(
            "screen",
          );
        }
      } catch (err) {
        console.error(`Wake Lock hatası:`, err);
      }
    };
    const releaseWakeLock = () => {
      if (wakeLockRef.current !== null) {
        wakeLockRef.current.release().then(() => {
          wakeLockRef.current = null;
        });
      }
    };
    requestWakeLock();
    return () => releaseWakeLock();
  }, []);

  // Sepya Modu Dark Mode Geçişi
  useEffect(() => {
    const root = window.document.documentElement;
    const currentTheme = localStorage.getItem("theme");

    if (isSepia) {
      root.classList.remove("dark");
    } else {
      if (currentTheme === "dark") {
        root.classList.add("dark");
      } else if (
        !currentTheme &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      ) {
        root.classList.add("dark");
      }
    }

    return () => {
      if (currentTheme === "dark") root.classList.add("dark");
    };
  }, [isSepia]);

  // Otomatik Kaydırma Algoritması
  useEffect(() => {
    if (!isAutoScrolling) return;

    let animationFrameId: number;
    let lastTime: number | null = null;

    const scroller = isFullscreen ? scrollContainerRef.current : window;
    if (!scroller) return;

    let exactScrollY =
      isFullscreen && scrollContainerRef.current
        ? scrollContainerRef.current.scrollTop
        : window.scrollY;

    const baseSpeed = 40;

    const scrollStep = (timestamp: number) => {
      if (lastTime === null) lastTime = timestamp;
      const deltaTime = timestamp - lastTime;
      lastTime = timestamp;

      if (deltaTime > 0 && deltaTime < 100) {
        const moveBy = (baseSpeed * autoScrollSpeed * deltaTime) / 1000;
        exactScrollY += moveBy;

        const maxScroll =
          isFullscreen && scrollContainerRef.current
            ? scrollContainerRef.current.scrollHeight -
              scrollContainerRef.current.clientHeight
            : document.documentElement.scrollHeight - window.innerHeight;

        // Sayfa sonuna gelindiyse durdur
        if (exactScrollY >= maxScroll - 1) {
          if (isFullscreen && scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({
              top: maxScroll,
              behavior: "auto",
            });
          } else {
            window.scrollTo({ top: maxScroll, behavior: "auto" });
          }
          setIsAutoScrolling(false);
          return;
        }

        // Pozisyonu güncelle (CSS Smooth Scroll'u EZEREK)
        if (isFullscreen && scrollContainerRef.current) {
          scrollContainerRef.current.scrollTo({
            top: exactScrollY,
            behavior: "auto",
          });
        } else {
          window.scrollTo({ top: exactScrollY, behavior: "auto" });
        }
      }

      animationFrameId = requestAnimationFrame(scrollStep);
    };

    animationFrameId = requestAnimationFrame(scrollStep);

    return () => cancelAnimationFrame(animationFrameId);
  }, [isAutoScrolling, autoScrollSpeed, isFullscreen]);

  // Manuel kaydırmada oto-kaydırmayı durdur
  useEffect(() => {
    const handleInteraction = (e: Event) => {
      if (isAutoScrolling) {
        if (
          e.target instanceof Element &&
          e.target.closest("button, a, input")
        ) {
          return;
        }

        if (e.type === "wheel" && Math.abs((e as WheelEvent).deltaY) > 10) {
          setIsAutoScrolling(false);
        } else if (
          e.type === "touchstart" ||
          e.type === "touchmove" ||
          e.type === "mousedown"
        ) {
          setIsAutoScrolling(false);
        }
      }
    };
    window.addEventListener("wheel", handleInteraction, { passive: true });
    window.addEventListener("touchstart", handleInteraction, { passive: true });
    window.addEventListener("touchmove", handleInteraction, { passive: true });
    window.addEventListener("mousedown", handleInteraction, { passive: true });

    return () => {
      window.removeEventListener("wheel", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
      window.removeEventListener("touchmove", handleInteraction);
      window.removeEventListener("mousedown", handleInteraction);
    };
  }, [isAutoScrolling]);

  // Tam ekranı algılama
  const toggleFullScreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  const cycleSpeed = () => {
    const speeds = [0.5, 1, 1.5, 2, 3];
    const nextIndex = (speeds.indexOf(autoScrollSpeed) + 1) % speeds.length;
    setAutoScrollSpeed(speeds[nextIndex]);
    if (typeof navigator !== "undefined" && navigator.vibrate)
      navigator.vibrate(15);
  };

  // Sekme Dinleyicileri
  useEffect(() => {
    const validTabs = ["sabah", "ogle", "ikindi", "aksam", "yatsi"];
    if (vakitParam && validTabs.includes(vakitParam)) {
      Promise.resolve().then(() => setActiveTab(vakitParam));
    }
  }, [vakitParam]);

  useEffect(() => {
    const saved = localStorage.getItem("tesbihat_font_offset");
    if (saved) {
      Promise.resolve().then(() => setFontOffset(Number(saved)));
    }
  }, []);

  const handleFontChange = (newOffset: number) => {
    setFontOffset(newOffset);
    localStorage.setItem("tesbihat_font_offset", newOffset.toString());
  };

  const handleTabClick = (
    tabId: "sabah" | "ogle" | "ikindi" | "aksam" | "yatsi",
  ) => {
    setActiveTab(tabId);
    router.replace(`/resources/tesbihat?vakit=${tabId}`, { scroll: false });
  };

  const TABS = [
    { id: "sabah", label: "Sabah Namazı" },
    { id: "ogle", label: "Öğle Namazı" },
    { id: "ikindi", label: "İkindi Namazı" },
    { id: "aksam", label: "Akşam Namazı" },
    { id: "yatsi", label: "Yatsı Namazı" },
  ] as const;

  // Üst çubuk gizleme mantığı
  const lastScrollY = React.useRef(0);
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY < 80) {
        setBarVisible(true);
      } else if (currentY > lastScrollY.current + 8) {
        setBarVisible(false);
      } else if (currentY < lastScrollY.current - 8) {
        setBarVisible(true);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isHeaderVisible = barVisible && !isFullscreen;

  return (
    <ReadingContext.Provider value={{ isSepia }}>
      <div
        ref={scrollContainerRef}
        onPointerDown={(e) => {
          const target = e.target as HTMLElement;
          if (target.closest("button") || target.closest(".sticky")) return;

          if (isAutoScrolling) {
            setIsAutoScrolling(false);
            (window as any)._justStoppedScroll = true;
            setTimeout(() => {
              (window as any)._justStoppedScroll = false;
            }, 300);
          }
        }}
        onClick={(e) => {
          const target = e.target as HTMLElement;
          if (target.closest("button") || target.closest(".sticky")) return;
          if ((window as any)._justStoppedScroll) return;
          toggleFullScreen();
        }}
        className={`transition-colors duration-500 cursor-pointer ${
          !isAutoScrolling ? "scroll-smooth" : "scroll-auto"
        } ${
          isFullscreen
            ? `fixed inset-0 z-[9999] overflow-y-auto px-3 sm:px-6 lg:px-8 py-6 ${
                isSepia
                  ? "sepia-theme bg-[#F4ECD8]"
                  : "bg-[#F8FAFC] dark:bg-gray-950"
              }`
            : `min-h-screen py-6 px-3 sm:px-6 lg:px-8 ${
                isSepia
                  ? "sepia-theme bg-[#F4ECD8]"
                  : "bg-[#F8FAFC] dark:bg-gray-950"
              }`
        }`}
      >
        <div className="max-w-3xl mx-auto space-y-4">
          {/* YENİ ÜST ARAÇ ÇUBUĞU (Header) */}
          <div
            className={`sticky top-2 sm:top-4 z-50 p-3 sm:p-4 backdrop-blur-xl border shadow-sm transition-all duration-300 flex flex-col gap-3 ${
              isHeaderVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 -translate-y-6 pointer-events-none"
            } ${
              isSepia
                ? "bg-[#Fdf9f2]/90 border-[#e8dcc4] rounded-[2rem]"
                : "bg-white/90 dark:bg-gray-900/90 border-gray-200 dark:border-gray-800 rounded-[2rem]"
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
              <div className="flex items-center gap-3">
                <Link
                  href="/resources"
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl sm:rounded-2xl shadow-sm hover:shadow transition-all active:scale-95 shrink-0"
                >
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6"
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
                  <h1 className="text-lg sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-none mb-1">
                    {t("tesbihatlar") || "Tesbihatlar"}
                  </h1>
                </div>
              </div>

              {/* Kontrol Butonları */}
              <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl shrink-0 w-fit">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFontChange(Math.max(-8, fontOffset - 2));
                  }}
                  disabled={fontOffset === -8}
                  className="w-8 h-8 flex items-center justify-center hover:bg-white dark:hover:bg-gray-700 rounded-lg disabled:opacity-30 transition font-serif font-bold text-gray-600 dark:text-gray-300 text-xs shadow-sm"
                >
                  A-
                </button>
                <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1"></div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFontChange(Math.min(12, fontOffset + 2));
                  }}
                  disabled={fontOffset === 12}
                  className="w-8 h-8 flex items-center justify-center hover:bg-white dark:hover:bg-gray-700 rounded-lg disabled:opacity-30 transition font-serif font-bold text-gray-600 dark:text-gray-300 text-base shadow-sm"
                >
                  A+
                </button>

                <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1"></div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsSepia((prev) => !prev);
                    if (typeof navigator !== "undefined" && navigator.vibrate)
                      navigator.vibrate(20);
                  }}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-300 ${
                    isSepia
                      ? "bg-[#432C0A]/10 text-[#432C0A] shadow-inner"
                      : "hover:bg-white dark:hover:bg-gray-700 text-amber-600 dark:text-amber-500 hover:text-amber-800"
                  }`}
                  title="Okuma Modu (Sepya)"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </button>

                <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1"></div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    cycleSpeed();
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-lg font-bold text-[10px] hover:bg-white dark:hover:bg-gray-700 text-gray-500 hover:text-blue-600 transition-colors"
                >
                  {autoScrollSpeed}x
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsAutoScrolling((prev) => !prev);
                    if (typeof navigator !== "undefined" && navigator.vibrate)
                      navigator.vibrate(20);
                  }}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-300 ${
                    isAutoScrolling
                      ? "bg-blue-600/15 text-blue-600 shadow-inner"
                      : "hover:bg-white dark:hover:bg-gray-700 text-gray-500 hover:text-blue-600"
                  }`}
                >
                  {isAutoScrolling ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M6 6h4v12H6zm8 0h4v12h-4z" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>

                <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1"></div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFullScreen();
                    if (typeof navigator !== "undefined" && navigator.vibrate)
                      navigator.vibrate(20);
                  }}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-300 ${
                    isFullscreen
                      ? "bg-blue-600/15 text-blue-600 shadow-inner"
                      : "hover:bg-white dark:hover:bg-gray-700 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                  }`}
                >
                  {isFullscreen ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* SEKMELER */}
            <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-1">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTabClick(tab.id);
                  }}
                  className={`px-3 py-2 rounded-xl font-bold text-[11px] sm:text-xs whitespace-nowrap transition-all duration-300 ${
                    activeTab === tab.id
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                      : isSepia
                        ? "bg-[#fdf9f2] text-amber-900 border border-[#e8dcc4] hover:bg-amber-100"
                        : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-800 hover:bg-emerald-50 dark:hover:bg-gray-800"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* İÇERİK ALANLARI */}
          <div
            className="pb-20 pt-4"
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
                  <ZikirRow text="Estağfirullâh" target={3} />
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
                    Allâhumme innâ nukaddimu ‘ileyke beyne yedey kulli nefesin
                    ve lemhatin ve lahzatin ve tarfetin yetrifû bihâ
                    ehlu’s-semâvâti ve ehlu’l-eradîne şehadeten, eşhedu en...
                  </Line>
                  <InstructionText>
                    Akabinde 9 defa şu cümle-i tevhid söylenir:
                  </InstructionText>
                  <ZikirRow
                    text="Lâ ilâhe illallâhu vahdehû lâ şerîke leh, lehu’l-mulku ve lehu’l-hamdu ve huve ‘alâ kulli şey’in Kadîr."
                    target={10}
                  />
                  <InstructionText>Onuncusunda ise;</InstructionText>
                  <Line>
                    Lâ ilâhe illallâhu vahdehû lâ şerîke leh, lehu’l-mulku ve
                    lehu’l-hamdu yuhyî ve yumît, ve huve hayyun lâ yemût,
                    biyedihi’l-hayr, ve huve ‘alâ kulli şey’in Kadîrun ve
                    ileyhi’l masîr.
                  </Line>
                  <InstructionText>
                    Denildikten sonra, eller duâ için kaldırılır ve aşağıdaki
                    "Ecirnâ" istiâzeleri okunur:
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
                  <ZikirRow
                    text="E’ûzu bi’llahi’s-semî’i’l-‘alîmi mine’ş-şeytânirracîm"
                    target={3}
                  />
                  <Line>Bismillâhirrahmânirrahîm</Line>
                  <Line>
                    Huve’llâhullezî lâ ilâhe illâhû, ‘Âlimu’l-ğaybi
                    ve’ş-şehâdeti Huve’r-Rahmânu’r-Rahîm.
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
                  <ZikirRow text="Estağfirullâh" target={3} />
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
                    letedhulunne’l-mescide’l-harâme inşâallâhu âminîne
                    muhallikîne ru’ûsekum ve mukassirîne lâ tehâfûn, fe ‘alime
                    mâ lem te’lemû fece’ale min dûni zâlike fethan karîbâ.
                  </Line>
                  <Line>
                    Huve’llezî ersele Rasûlehû bi’l-hudâ ve dîni’l-hakki li
                    yuzhirahû ‘ale’d-dîni kullih, ve kefâ bi’llâhi şehîdâ.
                  </Line>
                  <Line>
                    Muhammedu’r-Rasûlullâh, ve’llezîne me’ahû eşiddâu
                    âle’l-kuffâri ruhamâu beynehum terâhum rukke’an succeden
                    yebteğûne fadlen mine’llâhi ve ridvânâ, sîmâhum fî vucûhihim
                    min eseri’s-sucûd, zâlike meseluhum fi’t-tevrâh, ve
                    meseluhum fi’l-incîli ke zer’in ehrace şet’ehû fe âzerahû
                    fe’steğleza fe’stevâ ‘alâ sûgıhî yu’cibu’z-zurrâ’a li yeğîza
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
                  <ZikirRow text="Estağfirullâh" target={3} />
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
                    zâlike’l-yevmu’l-hakk, fe men şâe’t-tehaze ilâ Rabbihî
                    meâbâ, innâ enzernâkum azâben karîbâ, yevme yenzuru’l-mer’u
                    mâ kaddemet yedâhu ve yekûlu’l-kâfiru yâ leytenî kuntu
                    turâbâ.
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
                  <ZikirRow text="Estağfirullâh" target={3} />
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
                  <ZikirRow
                    text="Lâ ilâhe illallâhu vahdehû lâ şerîke leh, lehu’l-mulku ve lehu’l-hamdu ve huve ‘alâ kulli şey’in Kadîr."
                    target={10}
                  />
                  <InstructionText>Onuncusunda ise;</InstructionText>
                  <Line>
                    Lâ ilâhe illallâhu vahdehû lâ şerîke leh, lehu’l-mulku ve
                    lehu’l-hamdu yuhyî ve yumît, ve huve hayyun lâ yemût,
                    biyedihi’l-hayr, ve huve ‘alâ kulli şey’in Kadîrun ve
                    ileyhi’l masîr.
                  </Line>
                  <InstructionText>
                    Denildikten sonra, eller duâ için kaldırılır ve aşağıdaki
                    "Ecirnâ" istiâzeleri okunur:
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
                  <ZikirRow
                    text="E’ûzu bi’llahi’s-semî’i’l-‘alîmi mine’ş-şeytânirracîm"
                    target={3}
                  />
                  <Line>Bismillâhirrahmânirrahîm</Line>
                  <Line>
                    Huve’llâhullezî lâ ilâhe illâhû, ‘Âlimu’l-ğaybi
                    ve’ş-şehâdeti huve’r-Rahmânu’r-Rahîm.
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
                  <ZikirRow text="Estağfirullâh" target={3} />
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
                    Âmene’r-rasûlu bimâ unzile ileyhi mi’r-rabbihî
                    ve’l-mu’minûn. Kullun âmene bi’llâhi ve melâiketihî ve
                    kutubihî ve rusulih, la nuferriku beyne
                    ehadi’m-mi’r-rusulih, ve kâlû semi’nâ ve ata’nâ ğufrâneke
                    Rabbenâ ve ileyke’l-masîr.
                  </Line>
                  <Line>
                    Lâ yukellifullâhu nefsen illâ vus’ahâ, lehâ mâ kesebet ve
                    ‘aleyhâ me’ktesebet.
                  </Line>
                  <Line>Rabbenâ lâ tuâhiznâ in nesînâ ev ahta’nâ.</Line>
                  <Line>
                    Rabbenâ ve lâ tahmil ‘aleynâ isran kemâ hameltehû
                    ‘ale’llezîne min kablinâ.
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
    </ReadingContext.Provider>
  );
}

// Ana Sayfa Bileşenini Suspense İle Sarmalıyoruz
export default function TesbihatPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FDFDFD] dark:bg-gray-950">
          <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
        </div>
      }
    >
      <TesbihatContent />
    </Suspense>
  );
}
