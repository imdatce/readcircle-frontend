"use client";

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import JoinPageClient from '@/app/join/JoinPageClient';

function JoinContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code'); // URL'den ?code=XYZ123 kısmını alır

  if (!code) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Geçersiz veya eksik kod!
      </div>
    );
  }

  return <JoinPageClient code={code} />;
}

export default function JoinPage() {
  return (
    // useSearchParams kullanırken Next.js Suspense zorunlu tutar
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>}>
      <JoinContent />
    </Suspense>
  );
}