"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";

const TOTAL_IMAGES = 5;

export default function HomeAyahSection() {
  const { language } = useLanguage();
  const [isMounted, setIsMounted] = useState(false);
  const [randomId, setRandomId] = useState(1);

  useEffect(() => {
    const randomNum = Math.floor(Math.random() * TOTAL_IMAGES) + 1;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRandomId(randomNum);
     setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="w-full h-[150px] md:h-[250px]"></div>;

  return (
    <div className="relative w-full h-[150px] md:h-[250px] rounded-lg overflow-hidden shadow-sm border border-emerald-500/30">
      <Image
        src={`/background/ayah/ayah-${language}-${randomId}.jpg`}
        alt={`Ayah ${randomId}`}
        fill
        className="object-cover"
        priority
      />
    </div>
  );
}
