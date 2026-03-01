 "use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import SessionCard from "@/components/home/SessionCard";
import { DistributionSession } from "@/types";
import { useAuth } from "@/context/AuthContext";
import LoginRequiredModal from "@/components/LoginRequiredModal";

export default function SessionsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [createdSessions, setCreatedSessions] = useState<DistributionSession[]>(
    [],
  );
  const [joinedSessions, setJoinedSessions] = useState<DistributionSession[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"created" | "joined">("created");

  const { user } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [joinCode, setJoinCode] = useState("");

  const handleCreateSession = () => {
    if (!user) {
      setIsModalOpen(true);
    } else {
      router.push("/admin");
    }
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;

    if (!user) {
      setIsModalOpen(true);
      return;
    }

    const code = joinCode.split("/").pop()?.trim();
    if (code) {
      router.push(`/join/${code}`);
    }
  };

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }

        const baseUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

        const [createdRes, joinedRes] = await Promise.all([
          fetch(
            new URL(
              "/api/distribution/my-created-sessions",
              baseUrl,
            ).toString(),
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          ),
          fetch(new URL("/api/distribution/my-sessions", baseUrl).toString(), {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (createdRes.ok) setCreatedSessions(await createdRes.json());
        if (joinedRes.ok) setJoinedSessions(await joinedRes.json());
      } catch (error) {
        console.error("Halkalar çekilemedi:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  const handleReset = async (code: string) => {
    if (
      !window.confirm(
        t("confirmReset") || "Bu halkayı sıfırlamak istediğinize emin misiniz?",
      )
    )
      return;

    try {
      const token = localStorage.getItem("token");
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

      const response = await fetch(
        `${baseUrl}/api/distribution/reset-session/${code}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.ok) {
        alert(t("successReset") || "Halka başarıyla sıfırlandı.");
        window.location.reload();
      } else {
        alert((t("errorOccurred") || "Hata: ") + " " + (await response.text()));
      }
    } catch (error) {
      console.error("Sıfırlama hatası:", error);
    }
  };

  const handleDelete = async (code: string) => {
    if (
      !window.confirm(
        t("confirmDelete") || "Bu halkayı silmek istediğinize emin misiniz?",
      )
    )
      return;

    try {
      const token = localStorage.getItem("token");
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

      const response = await fetch(
        `${baseUrl}/api/distribution/delete-session/${code}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.ok) {
        setCreatedSessions((prev) => prev.filter((s) => s.code !== code));
        alert(t("successDelete") || "Halka başarıyla silindi.");
      } else {
        alert((t("errorOccurred") || "Hata: ") + " " + (await response.text()));
      }
    } catch (error) {
      console.error("Silme hatası:", error);
    }
  };

  const handleLeave = async (code: string) => {
    if (
      !window.confirm(
        t("confirmLeaveSession") ||
          "Bu halkadan ayrılmak istediğinize emin misiniz?",
      )
    )
      return;

    try {
      const token = localStorage.getItem("token");
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

      const response = await fetch(
        `${baseUrl}/api/distribution/leave-session/${code}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.ok) {
        setJoinedSessions((prev) => prev.filter((s) => s.code !== code));
        alert(t("successLeave") || "Halkadan başarıyla ayrıldınız.");
      } else {
        alert((t("errorOccurred") || "Hata: ") + " " + (await response.text()));
      }
    } catch (error) {
      console.error("Ayrılma hatası:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF7] dark:bg-[#061612] py-8 px-4 sm:px-6 transition-colors duration-500 relative overflow-hidden">
      {/* Arka Plan Dekoratif Işıklar */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-emerald-400/5 dark:bg-emerald-600/10 rounded-full blur-3xl opacity-50 pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-400/5 dark:bg-blue-600/10 rounded-full blur-3xl opacity-50 pointer-events-none translate-x-1/3 translate-y-1/3"></div>

      <div className="max-w-5xl mx-auto space-y-8 relative z-10">
        {/* Üst Başlık */}
        <div className="flex items-center justify-between bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl p-4 md:p-5 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800">
          <button
            onClick={() => router.push("/")}
            className="p-3 bg-white dark:bg-gray-800 text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-2xl shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-700 transition-all active:scale-95 shrink-0"
            title={t("backHome") || "Ana Sayfa"}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              {t("circlesTitle") || "Halkalar"}
            </h1>
          </div>

          <button
            onClick={handleCreateSession}
            className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95 shrink-0"
            title={t("createNewCircle") || "Yeni Halka Oluştur"}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        </div>

        {/* Sekmeler */}
        <div className="flex justify-center">
          <div className="inline-flex bg-gray-100/80 dark:bg-gray-800/80 p-1.5 rounded-2xl shadow-inner border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
            <button
              onClick={() => setActiveTab("created")}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${activeTab === "created" ? "bg-white dark:bg-gray-900 text-emerald-600 dark:text-emerald-400 shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"}`}
            >
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
                  d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z"
                />
              </svg>
              {t("managedTab") || "Yönettiğim"}
            </button>
            <button
              onClick={() => setActiveTab("joined")}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${activeTab === "joined" ? "bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"}`}
            >
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
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              {t("joinedTab") || "Katıldığım"}
            </button>
          </div>
        </div>

        {/* İçerik Alanı */}
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-800 border-t-emerald-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeTab === "created" &&
              (createdSessions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {createdSessions.map((session) => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      router={router}
                      t={t}
                      type="managed"
                      onReset={handleReset}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              ) : (
                <button
                  onClick={handleCreateSession}
                  className="w-full group flex flex-col items-center justify-center py-20 px-4 text-center bg-white/40 dark:bg-gray-900/40 rounded-[2.5rem] border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-emerald-400 dark:hover:border-emerald-600 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-all duration-300"
                >
                  <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 group-hover:bg-emerald-500 text-gray-400 dark:text-gray-500 group-hover:text-white rounded-full flex items-center justify-center mb-4 transition-colors duration-300 shadow-sm group-hover:shadow-lg group-hover:shadow-emerald-500/30">
                    <svg
                      className="w-10 h-10 group-hover:scale-110 transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-black text-gray-800 dark:text-gray-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 mb-2 transition-colors">
                    {t("createNewCircle") || "Yeni Halka Oluştur"}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm group-hover:text-gray-600 dark:group-hover:text-gray-300">
                    {t("noManagedCircleDesc") ||
                      "Şu an yönettiğiniz bir halka bulunmuyor. Buraya tıklayarak yeni bir Kur'an veya Cevşen halkası başlatabilirsiniz."}
                  </p>
                </button>
              ))}

            {activeTab === "joined" &&
              (joinedSessions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {joinedSessions.map((session) => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      router={router}
                      t={t}
                      type="joined"
                      onLeave={handleLeave}
                    />
                  ))}
                </div>
              ) : (
                <div className="w-full max-w-md mx-auto flex flex-col items-center justify-center py-12 px-6 text-center bg-white/40 dark:bg-gray-900/40 rounded-[2.5rem] border-2 border-dashed border-gray-300 dark:border-gray-700">
                  <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-full flex items-center justify-center mb-6 shadow-sm">
                    <svg
                      className="w-10 h-10"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"
                      />
                    </svg>
                  </div>

                  <h3 className="text-xl font-black text-gray-800 dark:text-gray-200 mb-2">
                    {t("noJoinedCircle") || "Henüz Katılım Yok"}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
                    {t("noJoinedCircleDesc") ||
                      "Size gönderilen bir davet kodunu veya bağlantısını aşağıya yapıştırarak hemen bir halkaya katılabilirsiniz."}
                  </p>

                  <form
                    onSubmit={handleJoinSubmit}
                    className="w-full flex flex-col gap-3"
                  >
                    <input
                      type="text"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value)}
                      placeholder={
                        t("joinCodePlaceholder") ||
                        "Davet kodu veya bağlantısı..."
                      }
                      className="w-full px-5 py-3.5 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-500 rounded-xl text-sm font-bold outline-none transition-colors text-gray-800 dark:text-white placeholder:font-medium"
                    />
                    <button
                      type="submit"
                      disabled={!joinCode.trim()}
                      className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-xl font-bold shadow-md shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      {t("joinCircleBtn") || "Halkaya Katıl"}
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                        />
                      </svg>
                    </button>
                  </form>
                </div>
              ))}
          </div>
        )}
      </div>

      <LoginRequiredModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t("loginRequiredTitle") || "Giriş Yapmanız Gerekiyor"}
        message={
          t("loginRequiredMsg") ||
          "Yeni bir halka oluşturmak veya yönetmek için lütfen hesabınıza giriş yapın."
        }
      />
    </div>
  );
}
