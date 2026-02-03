"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        },
      );

      if (!res.ok) throw new Error("Giriş başarısız");

      const data = await res.json();
      login(data.username, data.token);
      router.push("/");
    } catch (err) {
      alert(t("loginError"));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-96 border border-gray-200">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          {t("loginTitle")}
        </h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("usernameLabel")}
            </label>
            <input
              className="w-full border border-gray-300 bg-gray-50 p-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder={t("placeholderUser")}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("passwordLabel")}
            </label>
            <input
              className="w-full border border-gray-300 bg-gray-50 p-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              type="password"
              placeholder={t("placeholderPass")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-md">
            {t("loginButton")}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-gray-500">
            {t("noAccount")} <br />
            <Link
              href="/register"
              className="text-green-600 font-bold hover:underline mt-1 inline-block"
            >
              {t("registerLink")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
