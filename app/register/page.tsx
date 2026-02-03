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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm border border-gray-100">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {t("registerTitle")}
          </h2>
          <p className="text-gray-500 text-sm mt-1">{t("registerSubtitle")}</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("usernameLabel")}
            </label>
            <input
              className="w-full border border-gray-300 p-2.5 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder={t("placeholderUserExample")}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("passwordLabel")}
            </label>
            <input
              className="w-full border border-gray-300 p-2.5 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              type="password"
              placeholder={t("placeholderPass")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-bold shadow-md disabled:opacity-50"
          >
            {loading ? t("registering") : t("registerButton")}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-gray-500">
            {t("haveAccount")}{" "}
            <Link
              href="/login"
              className="text-blue-600 font-bold hover:underline"
            >
              {t("loginLink")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
