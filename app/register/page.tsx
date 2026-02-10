"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { t } = useLanguage();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    try {
      const res = await fetch(`${apiUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const text = await res.text();

      if (!res.ok) {
        alert((t("errorPrefix") || "Hata: ") + text);
        setLoading(false);
        return;
      }

      alert(t("registerSuccess"));
      router.push("/login");
    } catch (err) {
      console.error(err);
      alert(t("errorOccurred"));
      setLoading(false);
    }
  };

  return (
    // Ana kapsayıcı: Dark mode arka planı eklendi
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 transition-colors duration-300">
      {/* Kart: Dark mode arka planı ve kenarlığı eklendi */}
      <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg w-full max-w-sm border border-gray-100 dark:border-gray-800 transition-colors duration-300">
        <div className="text-center mb-6">
          {/* Başlık ve Alt Başlık renkleri */}
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            {t("registerTitle")}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {t("registerSubtitle")}
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t("usernameLabel")}
            </label>
            {/* Input: Dark mode arka planı, border'ı ve yazı rengi */}
            <input
              className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-2.5 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              placeholder={t("placeholderUserExample")}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t("passwordLabel")}
            </label>
            <input
              className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-2.5 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              type="password"
              placeholder={t("placeholderPass")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 dark:hover:bg-green-500 transition font-bold shadow-md disabled:opacity-50"
          >
            {loading ? t("registering") : t("registerButton")}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-gray-500 dark:text-gray-400">
            {t("haveAccount")}{" "}
            <Link
              href="/login"
              className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
            >
              {t("loginLink")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
