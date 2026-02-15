"use client";

import { useState, useRef, useEffect, ReactNode } from "react";

/* ============================================================
   TYPES
   ============================================================ */

export type Difficulty = "basic" | "intermediate" | "advanced";

export interface Topic {
  id: string;
  title: string;
  tags: string[];
  difficulty: Difficulty;
  summary: string;
  content: ReactNode;
}

export interface Category {
  id: string;
  title: string;
  icon: string;
  topics: Topic[];
}

/* ============================================================
   NOTE COMPONENTS
   ============================================================ */

export const H = ({ children }: { children: ReactNode }) => (
  <strong style={{ color: "#1a1a1a", fontWeight: 600 }}>{children}</strong>
);

export const C = ({ children }: { children: ReactNode }) => (
  <code style={{
    background: "#f0f0f5", color: "#4338ca", padding: "1px 6px",
    borderRadius: 3, fontSize: 13, fontFamily: "'Fira Code', 'Cascadia Code', monospace",
  }}>{children}</code>
);

export function Code({ children }: { children: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(children.trim()); setCopied(true); setTimeout(() => setCopied(false), 1500); };
  return (
    <div style={{ position: "relative", margin: "10px 0" }}>
      <button onClick={copy} className="no-print" style={{
        position: "absolute", top: 8, right: 8, padding: "2px 8px", borderRadius: 4,
        border: "none", background: copied ? "#4338ca" : "#e8e8f0", color: copied ? "#fff" : "#666",
        fontSize: 11, cursor: "pointer", transition: "all 0.2s ease",
      }}>{copied ? "Copied!" : "Copy"}</button>
      <pre style={{
        background: "#f8f8fc", borderWidth: 1, borderStyle: "solid", borderColor: "#e8e8f0",
        borderRadius: 8, padding: "14px 16px", paddingRight: 70, fontSize: 12, lineHeight: 1.6,
        overflowX: "auto", fontFamily: "'Fira Code', 'Cascadia Code', monospace", color: "#4338ca",
        whiteSpace: "pre", margin: 0,
      }}>{children.trim()}</pre>
    </div>
  );
}

export const Ul = ({ children }: { children: ReactNode }) => (
  <ul style={{ margin: "4px 0", paddingLeft: 20, listStyle: "none" }}>{children}</ul>
);
export const Li = ({ children }: { children: ReactNode }) => (
  <li style={{ margin: "3px 0", paddingLeft: 4, display: "flex", gap: 8 }}>
    <span style={{ color: "#4338ca", flexShrink: 0 }}>•</span>
    <div style={{ flex: 1 }}>{children}</div>
  </li>
);
export const Ol = ({ children }: { children: ReactNode }) => (
  <ol style={{ margin: "4px 0", paddingLeft: 20, listStyle: "none" }}>{children}</ol>
);
export const Ni = ({ children, n }: { children: ReactNode; n: number }) => (
  <li style={{ margin: "3px 0", paddingLeft: 4, display: "flex", gap: 8 }}>
    <span style={{ color: "#4338ca", flexShrink: 0, fontWeight: 600, minWidth: 20 }}>{n}.</span>
    <div style={{ flex: 1 }}>{children}</div>
  </li>
);
export const P = ({ children }: { children: ReactNode }) => (
  <div style={{ margin: "0 0 6px" }}>{children}</div>
);
export const Gap = () => <div style={{ height: 10 }} />;

export const Tip = ({ children }: { children: ReactNode }) => (
  <div style={{
    margin: "12px 0", padding: "10px 14px", borderLeft: "3px solid #4338ca",
    background: "#f8f7ff", borderRadius: "0 6px 6px 0", fontSize: 13,
  }}>
    <div style={{ fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4, color: "#6366f1" }}>💡 Interview Tip</div>
    <div style={{ color: "#444" }}>{children}</div>
  </div>
);

/* ============================================================
   COLLAPSIBLE
   ============================================================ */

export function Collapsible({ open, children }: { open: boolean; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | "auto">(open ? "auto" : 0);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; setHeight(open ? "auto" : 0); return; }
    if (open) { const h = ref.current?.scrollHeight || 0; setHeight(h); const t = setTimeout(() => setHeight("auto"), 300); return () => clearTimeout(t); }
    else { const h = ref.current?.scrollHeight || 0; setHeight(h); requestAnimationFrame(() => { requestAnimationFrame(() => { setHeight(0); }); }); }
  }, [open]);
  return <div style={{ height: height === "auto" ? "auto" : height, overflow: "hidden", transition: height === "auto" ? "none" : "height 0.3s ease" }} ref={ref}>{children}</div>;
}

/* ============================================================
   DIFFICULTY BADGE
   ============================================================ */

const diffColors: Record<Difficulty, { bg: string; color: string }> = {
  basic: { bg: "#ecfdf5", color: "#059669" },
  intermediate: { bg: "#fef3c7", color: "#d97706" },
  advanced: { bg: "#fef2f2", color: "#dc2626" },
};

export const DiffBadge = ({ level }: { level: Difficulty }) => (
  <span style={{ fontSize: 10, padding: "1px 8px", borderRadius: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.3, background: diffColors[level].bg, color: diffColors[level].color }}>{level}</span>
);
