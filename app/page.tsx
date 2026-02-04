"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { SessionSummary } from "@/types";

export default function Home() {
  const { t } = useLanguage();
  const { user, token } = useAuth();
  const router = useRouter();
  const [code, setCode] = useState("");
  const { logout } = useAuth();
  const [mySessions, setMySessions] = useState<SessionSummary[]>([]);
  const [createdSessions, setCreatedSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  useEffect(() => {
    if (user && token) {
      fetchAllData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, token]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      const resJoined = await fetch(
        `${apiUrl}/api/distribution/my-sessions?name=${user}`,
        {
          headers: headers,
        },
      );
      if (resJoined.ok) setMySessions(await resJoined.json());

      const resCreated = await fetch(
        `${apiUrl}/api/distribution/my-created-sessions?name=${user}`,
        {
          headers: headers,
        },
      );
      if (resCreated.ok) setCreatedSessions(await resCreated.json());
    } catch (error) {
      console.error("Veri hatası", error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      router.push(`/join/${code.trim()}`);
    }
  };

  const handleCopyLink = (e: React.MouseEvent, code: string, id: number) => {
    e.stopPropagation();
    const link = `${window.location.origin}/join/${code}`;
    navigator.clipboard.writeText(link);

    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <main className="min-h-screen flex flex-col items-center p-4 bg-gray-50 text-gray-800 relative overflow-x-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-10 pointer-events-none">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-400 rounded-full blur-3xl"></div>
      </div>

      <div className="z-10 w-full max-w-6xl mt-10 md:mt-16">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600 mb-4">
            {t("appTitle")}
          </h1>
          <p className="text-xl text-gray-600 font-light">
            {t("guestSubtitle")}
          </p>
        </div>

        {user ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 w-full">
            <h2 className="text-center text-2xl font-bold text-gray-700 mb-8">
              {t("welcome")} <span className="text-blue-600">{user}</span>{" "}
              <br />
            </h2>

            <div className="grid md:grid-cols-2 gap-6 mb-12 max-w-4xl mx-auto">
              <div
                onClick={() => router.push("/admin")}
                className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl hover:border-blue-200 transition-all cursor-pointer group transform hover:-translate-y-1"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4.5v15m7.5-7.5h-15"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {t("createDistTitle")}
                  </h3>
                </div>
                <p className="text-gray-500 mb-4 text-sm">
                  {t("createDistDesc")}
                </p>
                <button className="w-full py-2 text-white rounded-lg font-bold shadow bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 transition">
                  {" "}
                  {t("createButton")}
                </button>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl hover:border-green-200 transition-all group transform hover:-translate-y-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {t("joinDistTitle")}
                  </h3>
                </div>
                <form onSubmit={handleJoin} className="flex gap-2">
                  <input
                    type="text"
                    placeholder={t("joinInputPlaceholder")}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none transition bg-gray-50"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                  <button className="px-4 py-2 text-white rounded-lg font-bold shadow bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 transition">
                    {" "}
                    {t("joinButton")}{" "}
                  </button>
                </form>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-20">
              <div>
                <h3 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2 border-b pb-2">
                  <span className="w-2 h-6 bg-blue-600 rounded-full inline-block"></span>
                  {t("myCreatedTitle")}
                </h3>

                {loading ? (
                  <p className="text-gray-400">{t("loading")}</p>
                ) : createdSessions.length > 0 ? (
                  <div className="space-y-3">
                    {createdSessions.map((session) => (
                      <div
                        key={session.id}
                        onClick={() =>
                          router.push(`/admin/monitor?code=${session.code}`)
                        }
                        className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center hover:shadow-md hover:border-blue-300 transition cursor-pointer group"
                      >
                        <div>
                          <h4 className="font-bold text-gray-800">
                            {session.description}
                          </h4>
                          <div className="flex items-center gap-2 mt-2">
                            {/* Link Görünümü */}
                            <div className="flex items-center bg-gray-100 rounded-md border border-gray-200 px-2 py-1 max-w-[200px] sm:max-w-[260px]">
                              <span className="text-xs text-gray-500 font-mono truncate select-all">
                                {typeof window !== "undefined"
                                  ? `${window.location.origin}/join/${session.code}`
                                  : `.../join/${session.code}`}
                              </span>
                            </div>

                            <button
                              onClick={(e) =>
                                handleCopyLink(e, session.code, session.id)
                              }
                              className={`p-1.5 rounded-md transition-all border ${
                                copiedId === session.id
                                  ? "bg-green-100 text-green-600 border-green-200"
                                  : "bg-white text-gray-500 border-gray-200 hover:border-blue-400 hover:text-blue-500"
                              }`}
                              title={
                                copiedId === session.id
                                  ? "Kopyalandı!"
                                  : "Linki Kopyala"
                              }
                            >
                              {copiedId === session.id ? (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              ) : (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                  />
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>

                        <Link
                          href={`/admin/monitor?code=${session.code}`}
                          className="px-3 py-1.5 bg-green-50 text-blue-700 text-sm font-bold rounded-lg border border-green-200 hover:bg-green-600 hover:text-white transition flex items-center gap-1"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
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
                          {t("trackButton")}
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 bg-white rounded-xl border border-dashed border-gray-300 text-center text-gray-500 text-sm">
                    {t("noCreatedYet")}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2 border-b pb-2">
                  <span className="w-2 h-6 bg-green-600 rounded-full inline-block"></span>
                  {t("myCirclesTitle")}
                </h3>

                {loading ? (
                  <p className="text-gray-400">{t("loading")}</p>
                ) : mySessions.length > 0 ? (
                  <div className="space-y-3">
                    {mySessions.map((session) => (
                      <div
                        key={session.id}
                        onClick={() => router.push(`/join/${session.code}`)}
                        className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center hover:shadow-md hover:border-blue-300 transition cursor-pointer group"
                      >
                        <div>
                          <h4 className="font-bold text-gray-800 group-hover:text-blue-700 transition">
                            {session.description}
                          </h4>
                          <div className="flex gap-2 text-xs mt-1">
                            <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                              Code: {session.code}
                            </span>
                            <span className="text-green-500">
                              {t("creatorLabel")}:{" "}
                            </span>
                            {session.creatorName && (
                              <span className="text-green-500">
                                {session.creatorName}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="bg-blue-50 text-green-600 p-2 rounded-full group-hover:bg-green-600 group-hover:text-white transition">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M14 5l7 7m0 0l-7 7m7-7H3"
                            />
                          </svg>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 bg-white rounded-xl border border-dashed border-gray-300 text-center text-gray-500 text-sm">
                    {t("noCirclesYet")}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
            <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full text-center">
              <p className="text-gray-600 mb-8">{t("guestMessage")}</p>
              <div className="flex flex-col gap-3">
                <Link
                  href="/login"
                  className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold shadow hover:bg-blue-700 transition"
                >
                  {t("guestLogin")}
                </Link>
                <Link
                  href="/register"
                  className="w-full py-3 bg-white text-blue-600 border border-blue-600 rounded-lg font-bold shadow hover:bg-blue-50 transition"
                >
                  {t("guestRegister")}
                </Link>
              </div>
              <div className="mt-8 border-t pt-6">
                <p className="text-sm text-gray-500 mb-2">
                  {t("guestCheckCode")}
                </p>
                <form onSubmit={handleJoin} className="flex gap-2">
                  <input
                    type="text"
                    placeholder={t("guestCodePlaceholder")}
                    className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                  <button className="px-4 py-2 bg-gray-800 text-white rounded text-sm font-bold">
                    {t("joinButton")}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
