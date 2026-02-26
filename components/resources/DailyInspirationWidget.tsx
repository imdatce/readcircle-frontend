/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useState, useEffect } from "react";

// KENDİ MİNİ VERİTABANIMIZ - 20 Günlük Döngü
const DAILY_CONTENTS = [
  {
    ayet: { text: "Şüphesiz Allah, adaleti, iyilik yapmayı, yakınlara yardım etmeyi emreder...", source: "Nahl Suresi, 90" },
    hadis: { text: "Sizin en hayırlınız, Kur'an'ı öğrenen ve öğretendir.", source: "Buhârî, Fezâilü'l-Kur'ân 21" },
    dua: { text: "Allahım! Fayda vermeyen ilimden, huşû duymayan kalpten, doymayan nefisten ve kabul olunmayan duadan sana sığınırım.", source: "Müslim, Zikir 73" }
  },
  {
    ayet: { text: "Kullarım sana beni sorduklarında bilsinler ki şüphesiz ben onlara çok yakınım...", source: "Bakara Suresi, 186" },
    hadis: { text: "Ameller niyetlere göredir. Herkes sadece niyetinin karşılığını alır.", source: "Buhârî, Bed'ü'l-Vahy 1" },
    dua: { text: "Rabbimiz! Bize dünyada da iyilik ver, ahirette de iyilik ver ve bizi ateş azabından koru.", source: "Bakara Suresi, 201" }
  },
  {
    ayet: { text: "Öyleyse yalnız beni anın ki ben de sizi anayım. Bana şükredin, sakın nankörlük etmeyin.", source: "Bakara Suresi, 152" },
    hadis: { text: "Kolaylaştırın, zorlaştırmayın; müjdeleyin, nefret ettirmeyin.", source: "Buhârî, İlim 11" },
    dua: { text: "Ey kalpleri evirip çeviren Allahım! Kalbimi dinin üzerine sabit kıl.", source: "Tirmizî, Kader 7" }
  },
  {
    ayet: { text: "De ki: Ey kendilerinin aleyhine aşırı giden kullarım! Allah'ın rahmetinden ümidinizi kesmeyin. Şüphesiz Allah bütün günahları affeder.", source: "Zümer Suresi, 53" },
    hadis: { text: "Dua, ibadetin ta kendisidir.", source: "Tirmizî, Daavât 1" },
    dua: { text: "Allahım! Sen affedicisin, kerimsin, affetmeyi seversin, beni de affet.", source: "Tirmizî, Daavât 84" }
  },
  {
    ayet: { text: "Şüphesiz her zorlukla beraber bir kolaylık vardır.", source: "İnşirâh Suresi, 5" },
    hadis: { text: "Müslümanın başına gelen her yorgunluk, hastalık, sıkıntı, hatta batan dikene kadar her şey, günahlarına kefaret olur.", source: "Buhârî, Merdâ 1" },
    dua: { text: "Allahım! Bedenime, gözüme ve kulağıma sıhhat ve afiyet ver. Senden başka ilâh yoktur.", source: "Ebû Dâvûd, Edeb 101" }
  },
  {
    ayet: { text: "Onlar, inananlar ve kalpleri Allah'ı anmakla huzura kavuşanlardır. Bilin ki kalpler ancak Allah'ı anmakla huzur bulur.", source: "Ra'd Suresi, 28" },
    hadis: { text: "Allah sizin suretlerinize ve mallarınıza bakmaz; bilakis kalplerinize ve amellerinize bakar.", source: "Müslim, Birr 34" },
    dua: { text: "Allahım! Senden hidayet, takva, iffet ve gönül zenginliği (kanaat) dilerim.", source: "Müslim, Zikir 73" }
  },
  {
    ayet: { text: "Eğer şükrederseniz, size olan nimetimi kesinlikle artırırım.", source: "İbrâhim Suresi, 7" },
    hadis: { text: "İnsanlara teşekkür etmeyen, Allah'a da şükretmez.", source: "Tirmizî, Birr 35" },
    dua: { text: "Allahım! Seni zikretmek, sana şükretmek ve sana güzelce ibadet etmek için bana yardım et.", source: "Ebû Dâvûd, Vitir 26" }
  },
  {
    ayet: { text: "Onlar bollukta da darlıkta da Allah yolunda harcarlar, öfkelerini yenerler ve insanları affederler.", source: "Âl-i İmrân Suresi, 134" },
    hadis: { text: "Güçlü kimse güreşte yenen değil, öfke anında kendine hakim olandır.", source: "Buhârî, Edeb 76" },
    dua: { text: "Allahım! Yaratılışımı güzel yaptın, ahlakımı da güzelleştir.", source: "Ahmed b. Hanbel, el-Müsned" }
  },
  {
    ayet: { text: "Allah hiçbir kimseyi, gücünün yetmediği bir şeyle yükümlü kılmaz.", source: "Bakara Suresi, 286" },
    hadis: { text: "Sabır, (insanın yolunu aydınlatan) bir ışıktır.", source: "Müslim, Tahâret 1" },
    dua: { text: "Rabbimiz! Bizden öncekilere yüklediğin gibi bize de ağır yük yükleme. Bizi affet, bizi bağışla, bize acı.", source: "Bakara Suresi, 286" }
  },
  {
    ayet: { text: "Kitaptan sana vahyolunanı oku, namazı da dosdoğru kıl. Çünkü namaz, insanı hayasızlıktan ve kötülükten alıkoyar.", source: "Ankebût Suresi, 45" },
    hadis: { text: "Cennetin anahtarı namazdır.", source: "Tirmizî, Tahâret 1" },
    dua: { text: "Rabbim! Beni ve soyumdan gelecekleri namazı devamlı kılanlardan eyle. Rabbimiz, duamı kabul et!", source: "İbrâhim Suresi, 40" }
  },
  {
    ayet: { text: "Müminler ancak kardeştirler. Öyleyse kardeşlerinizin arasını düzeltin.", source: "Hucurât Suresi, 10" },
    hadis: { text: "Hiçbiriniz kendisi için istediğini kardeşi için de istemedikçe hakkıyla iman etmiş olmaz.", source: "Buhârî, Îmân 7" },
    dua: { text: "Allahım! Kalplerimizi birleştir, aramızı düzelt ve bizi kurtuluş yollarına ilet.", source: "Ebû Dâvûd, Salât 178" }
  },
  {
    ayet: { text: "Rahmân'ın kulları, yeryüzünde vakar ve tevazu ile yürüyen kimselerdir. Cahiller onlara laf attıkları zaman, 'Selâm!' der (geçer)ler.", source: "Furkân Suresi, 63" },
    hadis: { text: "Haya ancak hayır getirir.", source: "Buhârî, Edeb 77" },
    dua: { text: "Allahım! Nefsime takvasını ver ve onu temizle. Onu en iyi temizleyecek olan sensin.", source: "Müslim, Zikir 73" }
  },
  {
    ayet: { text: "Ben cinleri ve insanları, ancak bana kulluk etsinler diye yarattım.", source: "Zâriyât Suresi, 56" },
    hadis: { text: "İhsan, Allah'ı görüyormuşsun gibi O'na ibadet etmendir. Sen O'nu görmesen de O seni görür.", source: "Buhârî, Îmân 37" },
    dua: { text: "Rabbimiz! Bizi doğru yola ilettikten sonra kalplerimizi saptırma. Bize katından bir rahmet ver.", source: "Âl-i İmrân Suresi, 8" }
  },
  {
    ayet: { text: "Bir kere karar verip azmettin mi, artık Allah'a tevekkül et. Şüphesiz Allah, tevekkül edenleri sever.", source: "Âl-i İmrân Suresi, 159" },
    hadis: { text: "(Önce) Deveni bağla, sonra tevekkül et.", source: "Tirmizî, Kıyamet 60" },
    dua: { text: "Bismillâh, Allah'a tevekkül ettim. Güç ve kuvvet ancak Allah'tandır.", source: "Ebû Dâvûd, Edeb 103" }
  },
  {
    ayet: { text: "Rabbim! Benim ilmimi artır.", source: "Tâhâ Suresi, 114" },
    hadis: { text: "İki günü birbirine eşit olan ziyandadır.", source: "Beyhakî, Şüabü'l-Îmân" },
    dua: { text: "Allahım! Senden faydalı ilim, temiz rızık ve kabul edilmiş amel isterim.", source: "İbn Mâce, İkāmetü's-salât 32" }
  },
  {
    ayet: { text: "Her nefis ölümü tadacaktır. Sizi bir imtihan olarak hayır ile de şer ile de deniyoruz.", source: "Enbiyâ Suresi, 35" },
    hadis: { text: "Dünyada sanki bir garip veya bir yolcu gibi ol.", source: "Buhârî, Rikâk 3" },
    dua: { text: "Allahım! Benim hayatımı her türlü hayrın artmasına vesile kıl. Ölümümü de her türlü şerden kurtuluş eyle.", source: "Müslim, Zikir 71" }
  },
  {
    ayet: { text: "Bana dua edin, size icabet edeyim (duanızı kabul edeyim).", source: "Mü'min Suresi, 60" },
    hadis: { text: "Dua müminin silahı, dinin direği, göklerin ve yerin nurudur.", source: "Hâkim, el-Müstedrek" },
    dua: { text: "Rabbimiz! Hesap kurulacağı gün beni, anamı, babamı ve müminleri bağışla.", source: "İbrâhim Suresi, 41" }
  },
  {
    ayet: { text: "Ey iman edenler! Allah'tan korkun ve herkes yarına (ahirete) ne hazırladığına baksın.", source: "Haşr Suresi, 18" },
    hadis: { text: "Akıllı kimse, nefsini hesaba çeken ve ölümden sonrası için çalışandır.", source: "Tirmizî, Kıyamet 25" },
    dua: { text: "Allahım! Bütün işlerimizin sonunu hayır eyle; dünyada rezil olmaktan ve ahiret azabından bizi koru.", source: "Ahmed b. Hanbel, el-Müsned" }
  },
  {
    ayet: { text: "Eğer yüz çevirirlerse de ki: Allah bana yeter. O'ndan başka ilâh yoktur. Ben sadece O'na güvenip dayanırım.", source: "Tevbe Suresi, 129" },
    hadis: { text: "Kim sabah ve akşam yedi kere 'Hasbiyallahu la ilahe illa hu...' derse, Allah onun dünya ve ahiret sıkıntılarına yeter.", source: "Ebû Dâvûd, Edeb 100" },
    dua: { text: "Ey Hayy ve Kayyûm olan Allahım! Yalnızca senin rahmetine sığınıyorum. Benim bütün işlerimi düzelt.", source: "Hâkim, el-Müstedrek" }
  },
  {
    ayet: { text: "Allah, göklerin ve yerin nurudur...", source: "Nûr Suresi, 35" },
    hadis: { text: "Her kim sabah namazını kılarsa o, Allah'ın güvencesi (koruması) altındadır.", source: "Müslim, Mesâcid 261" },
    dua: { text: "Allahım! Kalbime bir nur, gözüme bir nur, kulağıma bir nur ver. Önümü, arkamı, sağımı, solumu, üstümü, altımı nurlandır.", source: "Buhârî, Daavât 9" }
  }
];

export default function DailyInspirationWidget() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Hydration hatalarını önlemek için bileşenin yüklendiğini belirtiyoruz
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  // Sunucu tarafında render edilmesini engelle
  if (!isMounted) return null;

  // Yılın kaçıncı gününde olduğumuzu anlık olarak hesapla
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = (now.getTime() - start.getTime()) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  // Günü 20'ye (dizi uzunluğuna) bölerek kalanı bul, böylece her gün sıradaki gelir
  const index = dayOfYear % DAILY_CONTENTS.length;
  const content = DAILY_CONTENTS[index];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
      
      {/* GÜNÜN AYETİ KARTI */}
      <div className="bg-white/80 dark:bg-[#0a1f1a] backdrop-blur-md rounded-3xl p-5 shadow-sm border border-emerald-100 dark:border-emerald-900/30 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-400/10 rounded-full blur-2xl -mr-8 -mt-8"></div>
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">📖</span>
            <h4 className="font-black text-sm text-gray-800 dark:text-gray-200 uppercase tracking-wider">Günün Ayeti</h4>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-sm font-medium leading-relaxed flex-1 italic">
            "{content.ayet.text}"
          </p>
          <p className="text-xs font-bold text-emerald-600 dark:text-emerald-500 mt-4 text-right">
            — {content.ayet.source}
          </p>
        </div>
      </div>

      {/* GÜNÜN HADİSİ KARTI */}
      <div className="bg-white/80 dark:bg-[#0a1f1a] backdrop-blur-md rounded-3xl p-5 shadow-sm border border-blue-100 dark:border-blue-900/30 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-400/10 rounded-full blur-2xl -mr-8 -mt-8"></div>
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">💬</span>
            <h4 className="font-black text-sm text-gray-800 dark:text-gray-200 uppercase tracking-wider">Günün Hadisi</h4>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-sm font-medium leading-relaxed flex-1 italic">
            "{content.hadis.text}"
          </p>
          <p className="text-xs font-bold text-blue-600 dark:text-blue-500 mt-4 text-right">
            — {content.hadis.source}
          </p>
        </div>
      </div>

      {/* GÜNÜN DUASI KARTI */}
      <div className="bg-white/80 dark:bg-[#0a1f1a] backdrop-blur-md rounded-3xl p-5 shadow-sm border border-amber-100 dark:border-amber-900/30 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/10 rounded-full blur-2xl -mr-8 -mt-8"></div>
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400">🤲</span>
            <h4 className="font-black text-sm text-gray-800 dark:text-gray-200 uppercase tracking-wider">Günün Duası</h4>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-sm font-medium leading-relaxed flex-1 italic">
            "{content.dua.text}"
          </p>
          <p className="text-xs font-bold text-amber-600 dark:text-amber-500 mt-4 text-right">
            — {content.dua.source}
          </p>
        </div>
      </div>

    </div>
  );
}