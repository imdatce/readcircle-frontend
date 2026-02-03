import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import LanguageSwitcher from "@/app/components/LanguageSwitcher"
import { AuthProvider } from '@/context/AuthContext';
import LogoutButton from "@/app/components/LogoutButton";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Read Circle",
  description: "Distribution Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      
      <body className={inter.className}>
        <LanguageProvider>
          <AuthProvider>
            <LogoutButton />

            {children}
            <LanguageSwitcher />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}