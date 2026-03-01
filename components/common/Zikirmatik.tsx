import React, { useState, useRef, useCallback } from "react";
import { ZikirmatikProps } from "@/types";

interface ExtendedZikirmatikProps extends ZikirmatikProps {
  totalCount?: number;
}

interface FallingBead {
  id: number;
  x: number;
  rotation: number;
}

const DRAG_THRESHOLD = 40; // px — bu kadar aşağı sürüklenince sayılır

const Zikirmatik = ({
  currentCount,
  onDecrement,
  isModal = false,
  t,
  readOnly = false,
  totalCount,
}: ExtendedZikirmatikProps) => {
  const isCompleted = currentCount <= 0;

  const [localMax, setLocalMax] = useState<number>(
    currentCount > 0 ? currentCount : 1,
  );
  const [prevCount, setPrevCount] = useState<number>(currentCount);
  const [fallingBeads, setFallingBeads] = useState<FallingBead[]>([]);
  const [dragY, setDragY] = useState(0);          // boncuğun anlık sürükleme offseti
  const [isDragging, setIsDragging] = useState(false);
  const [triggered, setTriggered] = useState(false); // bu sürükleme zaten saydı mı
  const beadIdRef = useRef(0);

  // Sürükleme başlangıç Y koordinatı
  const startYRef = useRef<number | null>(null);

  if (currentCount !== prevCount) {
    setPrevCount(currentCount);
    if (!totalCount && currentCount > localMax) {
      setLocalMax(currentCount);
    }
  }

  const finalMax = totalCount && totalCount > 0 ? totalCount : localMax;
  const safeMax = finalMax > 0 ? finalMax : 1;
  const progressCompleted = Math.min(
    100,
    Math.max(0, ((safeMax - currentCount) / safeMax) * 100),
  );

  const ropeBeadTotal = Math.min(safeMax, 33);
  const passedCount = Math.round((progressCompleted / 100) * ropeBeadTotal);

  const triggerCount = useCallback(() => {
    if (readOnly || currentCount <= 0 || triggered) return;
    setTriggered(true);
    onDecrement();

    const newBead: FallingBead = {
      id: beadIdRef.current++,
      x: 38 + Math.random() * 24,
      rotation: (Math.random() - 0.5) * 55,
    };
    setFallingBeads((prev) => [...prev, newBead]);
    setTimeout(() => {
      setFallingBeads((prev) => prev.filter((b) => b.id !== newBead.id));
    }, 900);

    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(30);
    }
  }, [readOnly, currentCount, triggered, onDecrement]);

  // ── MOUSE handlers ──
  const onMouseDown = (e: React.MouseEvent) => {
    if (readOnly || isCompleted) return;
    e.preventDefault();
    startYRef.current = e.clientY;
    setIsDragging(true);
    setTriggered(false);
    setDragY(0);
  };

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || startYRef.current === null) return;
      const delta = Math.max(0, e.clientY - startYRef.current);
      setDragY(Math.min(delta, DRAG_THRESHOLD * 1.5));
      if (delta >= DRAG_THRESHOLD) triggerCount();
    },
    [isDragging, triggerCount],
  );

  const onMouseUp = () => {
    setIsDragging(false);
    setDragY(0);
    startYRef.current = null;
  };

  // ── TOUCH handlers ──
  const onTouchStart = (e: React.TouchEvent) => {
    if (readOnly || isCompleted) return;
    startYRef.current = e.touches[0].clientY;
    setIsDragging(true);
    setTriggered(false);
    setDragY(0);
  };

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging || startYRef.current === null) return;
      const delta = Math.max(0, e.touches[0].clientY - startYRef.current);
      setDragY(Math.min(delta, DRAG_THRESHOLD * 1.5));
      if (delta >= DRAG_THRESHOLD) triggerCount();
    },
    [isDragging, triggerCount],
  );

  const onTouchEnd = () => {
    setIsDragging(false);
    setDragY(0);
    startYRef.current = null;
  };

  // Boncuğun ne kadar ilerlediği (0→1)
  const dragProgress = Math.min(dragY / DRAG_THRESHOLD, 1);
  // Sürüklenince ip gerilmesi: boncuk aşağı kaydıkça üst ip uzar
  const ropeStretch = dragY * 0.55;

  const mainBeadPx = isModal ? 176 : 144; // w-44 / w-36
  const textSize = isModal ? "text-6xl" : "text-5xl";
  const containerH = isModal ? "h-96" : "h-72";

  return (
    <div
      className={`flex flex-col items-center select-none ${isModal ? "mt-6" : "mt-4"}`}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      {/* ── İP + BONCUK SAYACI ── */}
      <div className="relative w-full max-w-[18rem] h-12 mb-1 flex items-center justify-center">
        <div
          className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-[4px] rounded-full"
          style={{
            background:
              "linear-gradient(90deg, transparent, #92400e 15%, #b45309 50%, #92400e 85%, transparent)",
            boxShadow: "0 2px 6px rgba(0,0,0,0.6)",
          }}
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-[4px]">
          {Array.from({ length: passedCount }).map((_, i) => (
            <div
              key={`p-${i}`}
              className="rounded-full flex-shrink-0"
              style={{
                width: 11, height: 11,
                background: "radial-gradient(circle at 35% 28%, #fde68a, #d97706 55%, #78350f 90%)",
                boxShadow: "0 2px 5px rgba(0,0,0,0.6), inset 0 1px 2px rgba(255,230,100,0.5)",
              }}
            />
          ))}
        </div>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-[4px] flex-row-reverse">
          {Array.from({ length: ropeBeadTotal - passedCount }).map((_, i) => (
            <div
              key={`r-${i}`}
              className="rounded-full flex-shrink-0"
              style={{
                width: 11, height: 11,
                background: "radial-gradient(circle at 35% 28%, #d6d3d1, #78716c 55%, #292524 90%)",
                boxShadow: "0 1px 4px rgba(0,0,0,0.7), inset 0 1px 1px rgba(255,255,255,0.1)",
                opacity: 0.4,
              }}
            />
          ))}
        </div>
      </div>

      {/* ── ANA BONCUK ALANI ── */}
      <div
        className={`relative flex flex-col items-center justify-center w-full max-w-[12rem] ${containerH} overflow-visible`}
      >
        {/* Üst ip — sürüklenince uzar */}
        <div
          className="absolute left-1/2 -translate-x-1/2 w-[4px] rounded-full z-0"
          style={{
            top: 0,
            height: `calc(50% - ${mainBeadPx / 2}px + ${ropeStretch}px)`,
            background:
              "linear-gradient(180deg, transparent 0%, #92400e 30%, #78350f 100%)",
            boxShadow: "1px 0 4px rgba(0,0,0,0.5)",
            transition: isDragging ? "none" : "height 0.3s ease",
          }}
        />

        {/* Alt ip */}
        <div
          className="absolute left-1/2 -translate-x-1/2 w-[4px] rounded-full z-0"
          style={{
            bottom: 0,
            height: `calc(50% - ${mainBeadPx / 2}px)`,
            background:
              "linear-gradient(180deg, #78350f 0%, #92400e 70%, transparent 100%)",
            boxShadow: "1px 0 4px rgba(0,0,0,0.5)",
          }}
        />

        {/* Üst dekoratif boncuklar */}
        {[{ top: 4, size: 13, op: 0.35 }, { top: 22, size: 20, op: 0.62 }].map((b, i) => (
          <div
            key={`top-${i}`}
            className="absolute left-1/2 -translate-x-1/2 rounded-full z-0"
            style={{
              top: b.top, width: b.size, height: b.size, opacity: b.op,
              background: "radial-gradient(circle at 35% 28%, #fde68a, #b45309 55%, #451a03 90%)",
              boxShadow: "0 3px 8px rgba(0,0,0,0.6), inset 0 1px 2px rgba(255,220,80,0.4)",
            }}
          />
        ))}

        {/* ANA BONCUK */}
        <div
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          className={`relative z-10 flex flex-col items-center justify-center rounded-full ${
            readOnly || isCompleted ? "cursor-default" : isDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
          style={{
            width: mainBeadPx,
            height: mainBeadPx,
            transform: `translateY(${dragY}px) scale(${1 - dragProgress * 0.04})`,
            transition: isDragging ? "none" : "transform 0.35s cubic-bezier(0.34,1.56,0.64,1)",
            background: isCompleted
              ? "radial-gradient(circle at 38% 28%, #fef9c3, #ca8a04 40%, #78350f 75%, #1c0a00 100%)"
              : readOnly
                ? "radial-gradient(circle at 38% 28%, #d6d3d1, #57534e 55%, #1c1917 90%)"
                : triggered
                  ? "radial-gradient(circle at 38% 28%, #fef3c7, #f59e0b 28%, #b45309 58%, #451a03 90%)"
                  : "radial-gradient(circle at 38% 28%, #fef3c7, #f59e0b 28%, #b45309 58%, #451a03 90%)",
            boxShadow: isCompleted
              ? "0 0 30px rgba(251,191,36,0.35), 0 8px 24px rgba(0,0,0,0.7), inset 0 2px 6px rgba(255,230,100,0.3), inset 0 -4px 10px rgba(0,0,0,0.4)"
              : readOnly
                ? "0 6px 20px rgba(0,0,0,0.5)"
                : isDragging
                  ? `0 ${4 + dragProgress * 20}px ${20 + dragProgress * 30}px rgba(245,158,11,${0.15 + dragProgress * 0.25}), 0 2px 8px rgba(0,0,0,0.7), inset 0 4px 10px rgba(0,0,0,0.35), inset 0 -1px 4px rgba(255,220,80,0.2)`
                  : "0 0 55px rgba(245,158,11,0.18), 0 22px 55px rgba(0,0,0,0.85), 0 8px 20px rgba(0,0,0,0.6), inset 0 3px 8px rgba(255,230,100,0.35), inset 0 -6px 14px rgba(0,0,0,0.5)",
          }}
        >
          {/* Parlama */}
          {!readOnly && !isCompleted && (
            <>
              <div
                className="absolute rounded-[50%] pointer-events-none"
                style={{ top: "12%", left: "16%", width: "34%", height: "15%", background: "rgba(255,252,200,0.55)", filter: "blur(5px)", transform: "rotate(-18deg)" }}
              />
              <div
                className="absolute rounded-full pointer-events-none"
                style={{ top: "20%", left: "25%", width: "11%", height: "11%", background: "rgba(255,255,255,0.7)", filter: "blur(2px)" }}
              />
            </>
          )}

          {/* Sürükleme göstergesi — hafif ok */}
          {!readOnly && !isCompleted && !triggered && (
            <div
              className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-0.5 pointer-events-none"
              style={{ opacity: isDragging ? 0 : 0.35, transition: "opacity 0.2s" }}
            >
              <div className="w-px h-3 rounded-full" style={{ background: "rgba(255,243,199,0.8)" }} />
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                <path d="M1 1L5 5L9 1" stroke="rgba(255,243,199,0.8)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}

          <div className="flex flex-col items-center z-10 pointer-events-none">
            <span
              className={`font-mono font-bold tracking-wider ${textSize}`}
              style={{
                color: isCompleted ? "#fef3c7" : readOnly ? "#a8a29e" : "#fff8e1",
                textShadow: !isCompleted && !readOnly ? "0 2px 10px rgba(0,0,0,0.6), 0 0 25px rgba(255,200,50,0.15)" : "none",
              }}
            >
              {currentCount}
            </span>
            <span
              className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] mt-1"
              style={{ color: isCompleted ? "#fde68a" : readOnly ? "#78716c" : "rgba(255,243,199,0.65)" }}
            >
              {isCompleted
                ? t("completed") || "Tamamlandı"
                : t("remaining") || "Kalan"}
            </span>
          </div>
        </div>

        {/* Düşen boncuklar */}
        {fallingBeads.map((bead) => (
          <div
            key={bead.id}
            className="absolute z-20 pointer-events-none"
            style={{
              left: `${bead.x}%`,
              top: "50%",
              animation: "luxBeadFall 0.85s cubic-bezier(0.4, 0, 0.8, 1) forwards",
            }}
          >
            <div
              className="w-6 h-6 rounded-full"
              style={{
                background: "radial-gradient(circle at 35% 28%, #fef3c7, #f59e0b 35%, #b45309 65%, #451a03 95%)",
                boxShadow: "0 4px 12px rgba(245,158,11,0.45), inset 0 1px 3px rgba(255,230,100,0.5)",
                transform: `rotate(${bead.rotation}deg)`,
              }}
            />
          </div>
        ))}

        {/* Alt dekoratif boncuklar */}
        {[{ bottom: 22, size: 20, op: 0.62 }, { bottom: 4, size: 13, op: 0.35 }].map((b, i) => (
          <div
            key={`bot-${i}`}
            className="absolute left-1/2 -translate-x-1/2 rounded-full z-0"
            style={{
              bottom: b.bottom, width: b.size, height: b.size, opacity: b.op,
              background: "radial-gradient(circle at 35% 28%, #fde68a, #b45309 55%, #451a03 90%)",
              boxShadow: "0 3px 8px rgba(0,0,0,0.6), inset 0 1px 2px rgba(255,220,80,0.4)",
            }}
          />
        ))}
      </div>

      {/* ── İLERLEME ÇUBUĞU ── */}
      <div className="w-full max-w-[14rem] mt-5">
        <div
          className="h-1.5 w-full rounded-full overflow-hidden"
          style={{ background: "rgba(255,255,255,0.06)", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.5)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${progressCompleted}%`,
              background: isCompleted
                ? "linear-gradient(90deg, #f59e0b, #fde68a)"
                : "linear-gradient(90deg, #b45309, #f59e0b)",
              boxShadow: "0 0 8px rgba(245,158,11,0.5)",
            }}
          />
        </div>
      </div>

      {/* ── DURUM MESAJI ── */}
      <div className="h-8 mt-4 flex items-center justify-center">
        {isCompleted ? (
          <div
            className="flex items-center gap-2 px-4 py-1.5 rounded-full border animate-in fade-in slide-in-from-bottom-2"
            style={{ background: "rgba(245,158,11,0.1)", borderColor: "rgba(245,158,11,0.25)" }}
          >
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-white shadow-sm"
              style={{ background: "linear-gradient(135deg, #f59e0b, #b45309)" }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-xs font-bold" style={{ color: "#fde68a" }}>
              {t("allahAccept") || "Allah Kabul Etsin"}
            </span>
          </div>
        ) : (
          <span
            className="text-xs font-medium tracking-wide animate-pulse"
            style={{ color: "rgba(180,140,60,0.45)" }}
          >
            {readOnly
              ? t("waitingForUser") || "Bekleniyor..."
              : t("tapToCount") || "Aşağı Kaydır"}
          </span>
        )}
      </div>

      <style>{`
        @keyframes luxBeadFall {
          0%   { transform: translateY(-14px) scale(1.15) rotate(0deg);  opacity: 1; }
          35%  { transform: translateY(40px)  scale(1.05) rotate(12deg); opacity: 0.95; }
          70%  { transform: translateY(78px)  scale(0.88) rotate(24deg); opacity: 0.55; }
          100% { transform: translateY(112px) scale(0.6)  rotate(32deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default Zikirmatik;