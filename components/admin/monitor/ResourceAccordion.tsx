/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

interface ResourceAccordionProps {
  categorizedGroups: any[];
  expandedResources: Record<string, boolean>;
  toggleResource: (name: string) => void;
  t: any;
}

export default function ResourceAccordion({ categorizedGroups, expandedResources, toggleResource, t }: ResourceAccordionProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {categorizedGroups.map((category: any) => (
        <div key={category.key}>
          <div className="flex items-center gap-4 mb-4 px-1">
            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent flex-1 opacity-50"></div>
            <h2 className="text-sm font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] text-center whitespace-nowrap">
              {category.title}
            </h2>
            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent flex-1 opacity-50"></div>
          </div>

          <div className="space-y-6">
            {category.items.map((group: any) => {
              const resourceName = group.resourceName;
              const assignments = group.assignments;
              const isOpen = expandedResources[resourceName];
              const totalCount = assignments.length;
              const takenCount = assignments.filter((a: any) => a.isTaken).length;
              const completedCount = assignments.filter((a: any) => a.isCompleted).length;

              const percentage = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 0;
              const completedPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

              return (
                <div key={resourceName} className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg">
                  <button onClick={() => toggleResource(resourceName)} className="w-full bg-white dark:bg-gray-900 px-6 py-6 flex flex-col md:flex-row justify-between items-center hover:bg-gray-50/80 dark:hover:bg-gray-800/30 transition duration-200 cursor-pointer gap-6 group">
                    <div className="flex items-center gap-5 w-full md:w-auto">
                      <div className={`transition-all duration-500 w-12 h-12 rounded-2xl shadow-inner flex items-center justify-center shrink-0 ${isOpen ? "bg-emerald-500 text-white shadow-emerald-500/30 rotate-90" : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                      </div>
                      <div className="text-left">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{resourceName}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="flex items-center gap-1 text-[10px] font-bold bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                            {completedCount}
                          </span>
                          <span className="text-xs text-gray-400 font-medium">/ {totalCount} {t("part")}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-800/50 md:bg-transparent md:border-0 md:p-0">
                      <div className="flex flex-col items-end min-w-[200px] flex-1 md:flex-none relative">
                        <div className="flex justify-between w-full mb-2 text-xs font-bold">
                          <span className="text-blue-500">{t("distributed")}: %{percentage}</span>
                          <span className="text-emerald-600 dark:text-emerald-400">{t("completed")}: %{completedPercentage}</span>
                        </div>
                        <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner relative">
                          <div className="absolute top-0 left-0 h-full bg-blue-300 dark:bg-blue-800 rounded-full transition-all duration-500 ease-out" style={{ width: `${percentage}%` }} />
                          <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all duration-700 ease-out shadow-[0_0_12px_rgba(16,185,129,0.6)]" style={{ width: `${completedPercentage}%` }}>
                            <div className="absolute top-0 right-0 bottom-0 w-0.5 bg-white/30"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="animate-in slide-in-from-top-2 fade-in duration-300 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-black/20">
                      <div className="overflow-x-auto p-2 md:p-6">
                        <table className="w-full text-left border-collapse min-w-full md:min-w-0 table-auto">
                          <thead>
                            <tr className="text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-widest border-b border-gray-100 dark:border-gray-800">
                              <th className="px-2 md:px-4 py-3 text-center w-12">#</th>
                              <th className="px-2 md:px-4 py-3">{t("resource")}</th>
                              <th className="px-2 md:px-4 py-3">{t("assignedTo")}</th>
                              <th className="px-2 md:px-4 py-3 text-right">{t("status")}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                            {assignments.map((item: any) => {
                              const totalTarget = item.endUnit - item.startUnit + 1;
                              const currentCount = item.currentCount ?? totalTarget;
                              const isCountable = item.resource.type === "COUNTABLE" || item.resource.type === "JOINT";

                              return (
                                <tr key={item.id} className={`group transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-900/40 rounded-lg ${item.isCompleted ? "bg-emerald-50/30 dark:bg-emerald-900/10" : ""}`}>
                                  <td className="px-2 md:px-4 py-4 text-center">
                                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-mono text-xs font-bold shadow-sm">{item.participantNumber}</span>
                                  </td>
                                  <td className="px-2 md:px-4 py-4">
                                    <div className="flex flex-col">
                                      <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{t("part")} {item.participantNumber}</span>
                                      {isCountable && (
                                        <span className="text-[10px] font-medium text-blue-500 dark:text-blue-400 mt-0.5">
                                          {item.isCompleted ? <span className="text-emerald-500">{t("completed")}</span> : <>{t("remaining")}: {currentCount} / {totalTarget}</>}
                                        </span>
                                      )}
                                      {!isCountable && item.resource.type === "PAGED" && <span className="text-[10px] text-gray-400 mt-0.5">{t("page")}: {item.startUnit}-{item.endUnit}</span>}
                                    </div>
                                  </td>
                                  <td className="px-2 md:px-4 py-4">
                                    {item.isTaken ? (
                                      <div className="flex items-center gap-2">
                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] text-white shadow-sm shrink-0 ${item.isCompleted ? "bg-emerald-500" : "bg-blue-500"}`}>
                                          {item.assignedToName?.substring(0, 2).toUpperCase()}
                                        </div>
                                        <span className={`text-xs font-bold truncate max-w-[80px] md:max-w-[150px] ${item.isCompleted ? "text-emerald-700 dark:text-emerald-400" : "text-gray-700 dark:text-gray-300"}`}>{item.assignedToName}</span>
                                      </div>
                                    ) : <span className="text-xs text-gray-400 italic opacity-60">--</span>}
                                  </td>
                                  <td className="px-2 md:px-4 py-4 text-right">
                                    {item.isCompleted ? (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30">
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                        <span className="hidden xs:inline">{t("completed")}</span>
                                      </span>
                                    ) : item.isTaken ? (
                                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>{t("reading")}
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold text-gray-400 bg-gray-50 border border-gray-200 dark:bg-gray-800/50 dark:border-gray-700">{t("statusEmpty")}</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}