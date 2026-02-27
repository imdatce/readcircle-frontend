/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import { useTheme } from "@/context/ThemeContext";
import { useEffect, useState, useRef, useCallback } from "react";
import { useLanguage } from "@/context/LanguageContext";

export default function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  // progress: 0 = tam gece (ay), 1 = tam gündüz (güneş)
  const [progress, setProgress] = useState<number>(theme === "dark" ? 0 : 1);
  // muted: gündüze geçince 2sn sonra true olur → renkler matlaşır
  const [muted, setMuted] = useState<boolean>(theme === "light");
  const mutedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDragging = useRef(false);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // Tema dışarıdan değişirse progress'i snap'le
  useEffect(() => {
    if (!isDragging.current) {
      setProgress(theme === "dark" ? 0 : 1);
    }
    if (theme === "light") {
      setMuted(false);
      if (mutedTimer.current) clearTimeout(mutedTimer.current);
      mutedTimer.current = setTimeout(() => setMuted(true), 2000);
    } else {
      if (mutedTimer.current) clearTimeout(mutedTimer.current);
      setMuted(false);
    }
  }, [theme]);

  const TRACK_W = 80;
  const THUMB_D = 28;
  const PADDING = (36 - THUMB_D) / 2; // vertical centering

  const getProgressFromClientX = useCallback((clientX: number) => {
    if (!trackRef.current) return 0;
    const rect = trackRef.current.getBoundingClientRect();
    const usable = rect.width - THUMB_D;
    const raw = (clientX - rect.left - THUMB_D / 2) / usable;
    return Math.min(1, Math.max(0, raw));
  }, []);

  const commitProgress = useCallback(
    (p: number) => {
      const newTheme = p >= 0.5 ? "light" : "dark";
      if (newTheme !== theme) toggleTheme();
      setProgress(newTheme === "dark" ? 0 : 1);
    },
    [theme, toggleTheme],
  );

  // Mouse
  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    setProgress(getProgressFromClientX(e.clientX));

    const onMove = (ev: MouseEvent) => {
      setProgress(getProgressFromClientX(ev.clientX));
    };
    const onUp = (ev: MouseEvent) => {
      isDragging.current = false;
      commitProgress(getProgressFromClientX(ev.clientX));
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  // Touch
  const onTouchStart = (e: React.TouchEvent) => {
    isDragging.current = true;
    setProgress(getProgressFromClientX(e.touches[0].clientX));

    const onMove = (ev: TouchEvent) => {
      setProgress(getProgressFromClientX(ev.touches[0].clientX));
    };
    const onEnd = (ev: TouchEvent) => {
      isDragging.current = false;
      commitProgress(getProgressFromClientX(ev.changedTouches[0].clientX));
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onEnd);
  };

  if (!mounted) return <div style={{ width: TRACK_W, height: 36 }} />;

  // Gündüz renkleri: canlı → mat geçişi (muted state ile)
  const dayTop = muted ? "#9bb8c9" : "#4fc3f7";
  const dayBottom = muted ? "#b8a88a" : "#f9a825";
  const dayThumbBg = muted ? "#e8e0d0" : "#fffde7";
  const dayThumbGlow = muted ? "rgba(180,160,120,0.5)" : "rgba(251,191,36,0.8)";

  const skyTop = lerpColor("#0a0e2e", dayTop, progress);
  const skyBottom = lerpColor("#1a1a6e", dayBottom, progress);
  const thumbLeft = PADDING + progress * (TRACK_W - THUMB_D - PADDING * 2);
  const thumbBg = lerpColor("#1e1b4b", dayThumbBg, progress);
  const thumbGlow = lerpColor("rgba(99,102,241,0.6)", dayThumbGlow, progress);
  const horizonColor = muted
    ? "rgba(180,155,110,0.2)"
    : "rgba(255,200,80,0.35)";

  return (
    <>
      <style>{`
        .ts-wrap {
          position: relative;
          width: ${TRACK_W}px;
          height: 36px;
          border-radius: 18px;
          overflow: hidden;
          cursor: grab;
          user-select: none;
          box-shadow: 0 2px 14px rgba(0,0,0,0.4), inset 0 1px 4px rgba(0,0,0,0.25);
          border: 1.5px solid rgba(255,255,255,0.12);
          flex-shrink: 0;
        }
        .ts-wrap:active { cursor: grabbing; }
        .ts-wrap:focus-visible {
          outline: 2px solid rgba(255,255,255,0.5);
          outline-offset: 2px;
        }
        @keyframes ts-twinkle {
          0%,100% { opacity:1; }
          50%      { opacity:0.2; }
        }
        @keyframes ts-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>

      <div
        ref={trackRef}
        className="ts-wrap"
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        role="slider"
        aria-valuemin={0}
        aria-valuemax={1}
        aria-valuenow={progress}
        aria-label={
          theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
        }
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight" || e.key === "ArrowUp") {
            const p = Math.min(1, progress + 0.15);
            setProgress(p);
            if (p >= 0.5 && theme === "dark") toggleTheme();
          }
          if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
            const p = Math.max(0, progress - 0.15);
            setProgress(p);
            if (p < 0.5 && theme === "light") toggleTheme();
          }
          if (e.key === "Enter" || e.key === " ") {
            toggleTheme();
          }
        }}
      >
        {/* Sky */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(to bottom, ${skyTop}, ${skyBottom})`,
            transition: muted ? "background 1.5s ease" : "none",
          }}
        />

        {/* Stars */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 1 - progress,
            pointerEvents: "none",
          }}
        >
          {STARS.map((s, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: s.x + "%",
                top: s.y + "%",
                width: s.r,
                height: s.r,
                borderRadius: "50%",
                background: "white",
                animation: `ts-twinkle ${s.d}s ease-in-out ${s.delay}s infinite`,
              }}
            />
          ))}
        </div>

        {/* Clouds */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: progress,
            pointerEvents: "none",
          }}
        >
          {CLOUDS.map((c, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: c.x + "%",
                top: c.y + "%",
                width: c.w,
                height: c.h,
                borderRadius: 9999,
                background: "rgba(255,255,255,0.82)",
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
              }}
            />
          ))}
        </div>

        {/* Horizon shimmer for sunrise/sunset */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 10,
            background: lerpColor("rgba(30,27,96,0)", horizonColor, progress),
            transition: muted ? "background 1.5s ease" : "none",
            pointerEvents: "none",
          }}
        />

        {/* Thumb */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: thumbLeft,
            width: THUMB_D,
            height: THUMB_D,
            transform: "translateY(-50%)",
            borderRadius: "50%",
            background: thumbBg,
            boxShadow: `0 0 ${6 + progress * 10}px 2px ${thumbGlow}, 0 2px 6px rgba(0,0,0,0.35)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            willChange: "left",
            transition: muted
              ? "background 1.5s ease, box-shadow 1.5s ease"
              : "none",
          }}
        >
          {/* Sun rays (visible as progress→1) */}
          <svg
            style={{
              position: "absolute",
              opacity: progress,
              width: 24,
              height: 24,
              animation: progress > 0.5 ? "ts-spin 8s linear infinite" : "none",
              transition: "stroke 1.5s ease",
            }}
            viewBox="0 0 24 24"
            fill="none"
            stroke={muted ? "#b8a070" : "#f59e0b"}
            strokeWidth={2}
            strokeLinecap="round"
          >
            <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>

          {/* Sun core */}
          <div
            style={{
              position: "absolute",
              width: 12 + progress * 4,
              height: 12 + progress * 4,
              borderRadius: "50%",
              background: muted
                ? `radial-gradient(circle, #f0e8d8, #d4a96a)`
                : `radial-gradient(circle, #fff7ed, #fbbf24)`,
              opacity: progress,
              boxShadow: muted
                ? `0 0 ${progress * 3}px #c8a060`
                : `0 0 ${progress * 6}px #fbbf24`,
              transition: "background 1.5s ease, box-shadow 1.5s ease",
            }}
          />

          {/* Moon */}
          <svg
            style={{
              position: "absolute",
              opacity: 1 - progress,
              width: 16,
              height: 16,
              transform: `rotate(${(1 - progress) * -15}deg)`,
            }}
            viewBox="0 0 24 24"
            fill="#c7d2fe"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 0 1-9.694 6.46c-5.799 0-10.5-4.7-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 0 1 .818.162Z"
            />
          </svg>
        </div>
      </div>
    </>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function lerpColor(a: string, b: string, t: number): string {
  const pa = parseCol(a);
  const pb = parseCol(b);
  if (!pa || !pb) return a;
  const r = Math.round(pa[0] + (pb[0] - pa[0]) * t);
  const g = Math.round(pa[1] + (pb[1] - pa[1]) * t);
  const bl = Math.round(pa[2] + (pb[2] - pa[2]) * t);
  const al = pa[3] + (pb[3] - pa[3]) * t;
  return `rgba(${r},${g},${bl},${al.toFixed(3)})`;
}

function parseCol(c: string): [number, number, number, number] | null {
  const hex = c.match(/^#([0-9a-f]{6})$/i);
  if (hex) {
    const v = parseInt(hex[1], 16);
    return [(v >> 16) & 255, (v >> 8) & 255, v & 255, 1];
  }
  const rgba = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (rgba)
    return [+rgba[1], +rgba[2], +rgba[3], rgba[4] !== undefined ? +rgba[4] : 1];
  return null;
}

// ── Static scene data ────────────────────────────────────────────────────────

const STARS = [
  { x: 8, y: 18, r: 1.5, d: 2.1, delay: 0 },
  { x: 22, y: 42, r: 1, d: 1.7, delay: 0.3 },
  { x: 38, y: 12, r: 2, d: 2.5, delay: 0.1 },
  { x: 52, y: 58, r: 1.2, d: 1.9, delay: 0.5 },
  { x: 65, y: 28, r: 1, d: 2.3, delay: 0.2 },
  { x: 78, y: 48, r: 1.5, d: 1.6, delay: 0.4 },
  { x: 14, y: 72, r: 1, d: 2.0, delay: 0.6 },
  { x: 70, y: 72, r: 1.2, d: 1.8, delay: 0.1 },
];

const CLOUDS = [
  { x: 4, y: 28, w: 20, h: 7 },
  { x: 10, y: 34, w: 14, h: 6 },
  { x: 52, y: 18, w: 17, h: 6 },
  { x: 58, y: 23, w: 13, h: 5 },
];
