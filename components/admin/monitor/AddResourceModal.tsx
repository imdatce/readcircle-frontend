/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

interface AddResourceModalProps {
  t: any;
  isOpen: boolean;
  onClose: () => void;
  allResources: any[];
  selectedResourceId: string;
  setSelectedResourceId: (id: string) => void;
  targetCount: string;
  setTargetCount: (count: string) => void;
  handleAddResource: () => void;
  addingResource: boolean;
  getResourceName: (res: any) => string;
}

export default function AddResourceModal({
  t, isOpen, onClose, allResources, selectedResourceId, setSelectedResourceId,
  targetCount, setTargetCount, handleAddResource, addingResource, getResourceName
}: AddResourceModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-6 md:p-8 w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-800 animate-in zoom-in-95 duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h3 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tight">
            {t("addResourceToSession")}
          </h3>
        </div>

        <div className="space-y-6">
          <div>
            <label htmlFor="resource-selector" className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
              {t("selectResourcePrompt")}
            </label>
            <div className="relative">
              <select
                id="resource-selector"
                className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl font-bold text-gray-700 dark:text-gray-200 outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
                value={selectedResourceId}
                onChange={(e) => setSelectedResourceId(e.target.value)}
              >
                <option value="">{t("selectPlaceholder")}</option>
                {allResources.map((res) => (
                  <option key={res.id} value={res.id}>{getResourceName(res)}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">{t("target")}</label>
            <div className="relative group">
              <input type="number" min="1" value={targetCount} onChange={(e) => setTargetCount(e.target.value)} className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl font-black text-xl text-blue-600 dark:text-blue-400 outline-none focus:border-blue-500 transition-all" placeholder="100" />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400 uppercase tracking-tighter pointer-events-none bg-white dark:bg-gray-900 px-2 py-1 rounded-lg border border-gray-100 dark:border-gray-800">
                {t("pieces")}
              </div>
            </div>
            <p className="mt-2 text-[10px] text-gray-400 font-medium ml-1">{t("addResourceNote")}</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 py-4 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all active:scale-95">
              {t("cancel")}
            </button>
            <button onClick={handleAddResource} disabled={!selectedResourceId || addingResource || !targetCount} className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
              {addingResource ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <span>{t("add")}</span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}