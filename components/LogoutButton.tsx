"use client";

import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

export default function LogoutButton() {
    const { user, logout } = useAuth();
    const { t } = useLanguage();

     if (!user) return null;

    return (
        <button
            onClick={logout}
            className="fixed top-4 right-4 z-[9999] flex items-center gap-2 px-4 py-2 bg-white text-red-600 rounded-full shadow-md border border-gray-200 hover:bg-red-50 hover:border-red-200 transition-all font-bold text-sm"
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            <span className="hidden sm:inline">{t('logoutButton') || "Çıkış Yap"}</span>
        </button>
    );
}