"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SubNavigation() {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Halkalar",
      href: "/sessions",
      icon: (
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
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
    },
    {
      name: "Kaynaklar",
      href: "/resources",
      icon: (
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
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
    },
    {
      name: "Ajandam",
      href: "/agenda",
      icon: (
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
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </svg>
      ),
    },
    // === YENİ: VAKİTLER BUTONU ===
    {
      name: "Vakitler",
      href: "/prayer-times",
      icon: (
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
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  ];

  return (
    <nav className="w-full bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 sticky top-0 z-40">
      <div className="max-w-4xl mx-auto px-1 py-1.5">
        {/* Grid yapısını 4'e böldük (grid-cols-4) */}
        <div className="grid grid-cols-4 gap-1">
          {navItems.map((item) => {
            // === MANTIKSAL GÜNCELLEME BURADA ===
            let isActive = false;

            if (item.href === "/agenda") {
              // Kur'an sayfası da Ajanda'nın bir parçası sayılsın
              isActive =
                pathname?.startsWith("/agenda") ||
                pathname?.startsWith("/resources/quran");
            } else if (item.href === "/resources") {
              // Kur'an sayfası hariç diğer kaynaklarda "Kaynaklar" aktif olsun
              isActive =
                pathname?.startsWith("/resources") &&
                !pathname?.startsWith("/resources/quran");
            } else {
              isActive = pathname?.startsWith(item.href);
            }
            // ==================================
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all duration-300 ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                }`}
              >
                <span
                  className={`mb-0.5 ${isActive ? "text-white" : "text-emerald-600 dark:text-emerald-500"}`}
                >
                  {item.icon}
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-tight">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
