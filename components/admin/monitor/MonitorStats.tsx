/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

interface MonitorStatsProps {
  stats: {
    total: number;
    distributed: number;
    completed: number;
    distPercent: number;
    compPercent: number;
  };
  t: any;
}

export default function MonitorStats({ stats, t }: MonitorStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {/* Toplam Kartı */}
      <div className="relative bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
          {t("total") || "Toplam"}
        </p>
        <p className="text-4xl font-black text-gray-800 dark:text-white tracking-tight">
          {stats.total}
        </p>
      </div>

      {/* Dağıtılan Kartı */}
      <div className="relative bg-white dark:bg-gray-900 p-6 rounded-3xl border border-blue-100 dark:border-blue-900/30 shadow-sm overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 text-blue-500 opacity-5 group-hover:opacity-10 transition-opacity">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        </div>
        <div className="flex justify-between items-end">
          <div>
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2">
              {t("distributed") || "Dağıtılan"}
            </p>
            <p className="text-4xl font-black text-blue-600 dark:text-blue-400 tracking-tight">
              {stats.distributed}
            </p>
          </div>
          <span className="text-lg font-bold text-blue-300 dark:text-blue-500/50 mb-1">
            %{stats.distPercent}
          </span>
        </div>
        <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full mt-4 overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full"
            style={{ width: `${stats.distPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Tamamlanan Kartı */}
      <div className="relative bg-white dark:bg-gray-900 p-6 rounded-3xl border border-emerald-100 dark:border-emerald-900/30 shadow-sm overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 text-emerald-500 opacity-5 group-hover:opacity-10 transition-opacity">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div className="flex justify-between items-end">
          <div>
            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-2">
              {t("completed") || "Tamamlanan"}
            </p>
            <p className="text-4xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              {stats.completed}
            </p>
          </div>
          <span className="text-lg font-bold text-emerald-300 dark:text-emerald-500/50 mb-1">
            %{stats.compPercent}
          </span>
        </div>
        <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full mt-4 overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"
            style={{ width: `${stats.compPercent}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
