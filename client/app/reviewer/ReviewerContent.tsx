"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  categories, Category, Topic,
  Collapsible, DiffBadge,
} from "./data";

/* ============================================================
   HELPERS
   ============================================================ */

function buildGlobalIndex(cats: Category[]): Map<string, number> {
  const m = new Map<string, number>(); let n = 1;
  for (const c of cats) for (const t of c.topics) m.set(t.id, n++);
  return m;
}
const globalIndex = buildGlobalIndex(categories);
const totalTopics = categories.reduce((s, c) => s + c.topics.length, 0);

/* ============================================================
   PAGE COMPONENT
   ============================================================ */

export default function ReviewerPage() {
  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [tocOpen, setTocOpen] = useState(false);
  const [collapsedTopics, setCollapsedTopics] = useState<Set<string>>(new Set());
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [focusTopic, setFocusTopic] = useState<{ cat: Category; topic: Topic } | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [printView, setPrintView] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);
  const topicRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const ids = categories.flatMap((c) => c.topics.map((t) => t.id));
    const obs = new IntersectionObserver((entries) => { for (const e of entries) if (e.isIntersecting) { setActiveId(e.target.id); break; } }, { rootMargin: "-100px 0px -60% 0px", threshold: 0 });
    ids.forEach((id) => { const el = topicRefs.current[id]; if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, [activeFilter, tagFilter]);

  useEffect(() => {
    const fn = () => {
      setShowBackToTop(window.scrollY > 400);
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setScrollPct(h > 0 ? (window.scrollY / h) * 100 : 0);
    };
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const scrollTo = useCallback((id: string) => {
    setCollapsedTopics((p) => { const n = new Set(p); n.delete(id); return n; });
    setTimeout(() => topicRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    setTocOpen(false);
  }, []);
  const toggleCollapse = useCallback((id: string) => { setCollapsedTopics((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; }); }, []);
  const expandAll = () => setCollapsedTopics(new Set());
  const collapseAll = () => setCollapsedTopics(new Set(categories.flatMap((c) => c.topics.map((t) => t.id))));
  const handlePrint = () => { expandAll(); setActiveFilter(null); setSearch(""); setTagFilter(null); setPrintView(true); };
  const handleTagClick = (tag: string) => { if (tagFilter === tag) setTagFilter(null); else { setTagFilter(tag); setActiveFilter(null); setSearch(""); } };
  const clearFilters = () => { setSearch(""); setActiveFilter(null); setTagFilter(null); };

  const sq = search.toLowerCase();
  const filtered = categories.filter((c) => !activeFilter || c.id === activeFilter).map((c) => ({
    ...c, topics: c.topics.filter((t) => {
      if (tagFilter && !t.tags.some((g) => g.toLowerCase() === tagFilter.toLowerCase())) return false;
      if (sq && !t.title.toLowerCase().includes(sq) && !t.tags.some((g) => g.toLowerCase().includes(sq)) && !t.summary.toLowerCase().includes(sq)) return false;
      return true;
    }),
  })).filter((c) => c.topics.length > 0);
  const shownTopics = filtered.reduce((s, c) => s + c.topics.length, 0);
  const isFiltered = !!search || !!activeFilter || !!tagFilter;

  /* ---- PRINT VIEW ---- */
  if (printView) return (
    <div style={{ background: "#fff", color: "#1a1a1a", fontFamily: "'Inter', -apple-system, sans-serif", fontSize: 13, lineHeight: 1.7, maxWidth: 800, margin: "0 auto", padding: "32px 40px 80px" }}>
      <style>{`@media print{.no-print{display:none!important}.grecaptcha-badge,iframe[src*="recaptcha"],[class*="captcha"]{display:none!important}@page{margin:18mm 14mm}}`}</style>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Technical Interview Notebook</h1>
        <button onClick={() => setPrintView(false)} className="no-print" style={{ padding: "5px 14px", borderRadius: 6, borderWidth: 1, borderStyle: "solid", borderColor: "#e0e0e0", background: "#fff", color: "#4338ca", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>← Back</button>
      </div>
      {categories.map((cat) => (<div key={cat.id}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 16, fontWeight: 800, marginBottom: 16, marginTop: 28, paddingBottom: 8, borderBottom: "2px solid #e5e5e5" }}><span>{cat.icon}</span><span>{cat.title}</span></div>
        {cat.topics.map((t, i) => (<div key={t.id} style={{ marginBottom: 6 }}>
          <div style={{ fontSize: 14, fontWeight: 700, margin: "0 0 2px" }}><span style={{ color: "#4338ca", marginRight: 4 }}>{globalIndex.get(t.id)}.</span>{t.title}</div>
          <div style={{ fontSize: 11, color: "#888", marginBottom: 4, fontStyle: "italic" }}>{t.summary}</div>
          <div style={{ paddingLeft: 8, color: "#444", fontSize: 12 }}>{t.content}</div>
          {i < cat.topics.length - 1 && <hr style={{ border: "none", borderTop: "1px solid #eee", margin: "14px 0" }} />}
        </div>))}
      </div>))}
      <div style={{ marginTop: 32, fontSize: 11, color: "#bbb", textAlign: "center" }}>Last updated: February 2026</div>
    </div>
  );

  /* ---- FOCUS MODE ---- */
  if (focusTopic) {
    const { cat, topic } = focusTopic; const idx = cat.topics.indexOf(topic);
    const prev = idx > 0 ? cat.topics[idx - 1] : null;
    const next = idx < cat.topics.length - 1 ? cat.topics[idx + 1] : null;
    const gIdx = globalIndex.get(topic.id) || 0;
    return (<div style={st.page}><div style={{ ...st.main, maxWidth: 760, paddingTop: 24 }}>
      <button onClick={() => setFocusTopic(null)} style={st.focusBack}>← Back to all notes</button>
      <div style={{ marginTop: 16, marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 12, color: "#888" }}>{cat.icon} {cat.title}</span>
        <span style={{ fontSize: 12, color: "#ccc" }}>·</span>
        <span style={{ fontSize: 12, color: "#888" }}>{gIdx} of {totalTopics}</span>
        <DiffBadge level={topic.difficulty} />
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111", margin: "0 0 4px" }}>{topic.title}</h2>
      <div style={{ fontSize: 13, color: "#888", marginBottom: 12, fontStyle: "italic" }}>{topic.summary}</div>
      <div style={st.tagRow}>{topic.tags.map((t) => <span key={t} style={st.tag}>{t}</span>)}</div>
      <div style={{ ...st.topicNotes, marginTop: 16, fontSize: 15, lineHeight: 1.9 }}>{topic.content}</div>
      <div style={st.focusNav}>
        {prev ? <button onClick={() => setFocusTopic({ cat, topic: prev })} style={st.focusNavBtn}>← {prev.title}</button> : <div />}
        {next ? <button onClick={() => setFocusTopic({ cat, topic: next })} style={{ ...st.focusNavBtn, textAlign: "right" as const }}>{next.title} →</button> : <div />}
      </div>
    </div></div>);
  }

  /* ---- TOC ---- */
  const tocContent = (<>
    <div style={st.tocHeader}>Contents</div>
    {categories.filter((c) => !activeFilter || c.id === activeFilter).map((cat) => (
      <div key={cat.id} style={st.tocCatGroup}>
        <div style={st.tocCatLabel}>{cat.icon} {cat.title} <span style={{ color: "#bbb", fontWeight: 400, marginLeft: 4 }}>({cat.topics.length})</span></div>
        {cat.topics.map((t) => (
          <button key={t.id} onClick={() => scrollTo(t.id)} style={{ ...st.tocItem, ...(activeId === t.id ? st.tocItemActive : {}) }}>
            <span style={st.tocNum}>{globalIndex.get(t.id)}</span>{t.title}
          </button>
        ))}
      </div>
    ))}
  </>);

  /* ---- MAIN ---- */
  return (
    <div style={st.page}>
      <style>{`@media print{.no-print{display:none!important}body{background:white!important}.grecaptcha-badge,iframe[src*="recaptcha"],[class*="captcha"]{display:none!important}@page{margin:20mm 15mm}}@media(max-width:900px){.toc-desktop{display:none!important}}@media(min-width:901px){.toc-mobile-btn{display:none!important}}`}</style>

      <div className="no-print" style={{ position: "fixed", top: 0, left: 0, height: 3, width: `${scrollPct}%`, background: "#4338ca", zIndex: 999, transition: "width 0.1s linear" }} />

      <nav style={st.tocSidebar} className="no-print toc-desktop">{tocContent}</nav>
      <button onClick={() => setTocOpen(!tocOpen)} style={st.tocMobileBtn} className="no-print toc-mobile-btn">☰</button>
      {tocOpen && <div style={st.tocOverlay} onClick={() => setTocOpen(false)} className="no-print"><div style={st.tocMobile} onClick={(e) => e.stopPropagation()}>{tocContent}</div></div>}

      <div style={st.main}>
        <div style={st.headerBar}>
          <div>
            <h1 style={st.title}>Technical Interview Notebook</h1>
            <div style={st.subtitle}>{totalTopics} topics · {categories.length} categories · <span style={{ color: "#bbb" }}>Feb 2026</span></div>
          </div>
          <a href="/" style={st.homeLink} className="no-print">← Portfolio</a>
        </div>

        <div style={st.toolbar} className="no-print">
          <div style={st.searchWrap}>
            <input type="text" placeholder="Search topics, tags, or summaries..." value={search} onChange={(e) => { setSearch(e.target.value); setTagFilter(null); }} style={st.searchInput} />
            {search && <button onClick={() => setSearch("")} style={st.clearBtn}>✕</button>}
          </div>
          <div style={st.filterRow}>
            <button onClick={() => { setActiveFilter(null); setTagFilter(null); }} style={{ ...st.filterPill, ...(activeFilter === null && !tagFilter ? st.filterPillActive : {}) }}>All ({totalTopics})</button>
            {categories.map((c) => <button key={c.id} onClick={() => { setActiveFilter(activeFilter === c.id ? null : c.id); setTagFilter(null); }} style={{ ...st.filterPill, ...(activeFilter === c.id ? st.filterPillActive : {}) }}>{c.icon} {c.title} ({c.topics.length})</button>)}
          </div>
          {tagFilter && <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0" }}>
            <span style={{ fontSize: 12, color: "#888" }}>Tag:</span>
            <span style={st.tagActive}>{tagFilter}</span>
            <button onClick={() => setTagFilter(null)} style={{ background: "none", border: "none", color: "#999", cursor: "pointer", fontSize: 14 }}>✕</button>
          </div>}
          <div style={st.actionBar}>
            <button onClick={expandAll} style={st.actionBtn}>▼ Expand All</button>
            <button onClick={collapseAll} style={st.actionBtn}>▲ Collapse All</button>
            <button onClick={handlePrint} style={st.actionBtn}>🖨 Print</button>
            {isFiltered && <span style={{ fontSize: 12, color: "#888" }}>{shownTopics} of {totalTopics}</span>}
            {isFiltered && <button onClick={clearFilters} style={{ ...st.actionBtn, color: "#4338ca" }}>Clear filters</button>}
          </div>
        </div>

        {filtered.map((cat) => (<div key={cat.id}>
          <div style={st.catHeading}><span>{cat.icon}</span><span>{cat.title}</span><span style={st.catCount}>{cat.topics.length} topics</span></div>
          {cat.topics.map((topic, idx) => {
            const isCollapsed = collapsedTopics.has(topic.id); const gIdx = globalIndex.get(topic.id) || 0;
            return (<div key={topic.id} id={topic.id} ref={(el) => { topicRefs.current[topic.id] = el; }} style={st.topicBlock}>
              <div style={st.topicHeader} onClick={() => toggleCollapse(topic.id)}>
                <div>
                  <div style={st.topicTitle}><span style={st.topicNum}>{gIdx}.</span> {topic.title} <DiffBadge level={topic.difficulty} /> <span style={st.topicCounter}>{gIdx}/{totalTopics}</span></div>
                  {isCollapsed && <div style={{ fontSize: 12, color: "#999", marginTop: 2, fontStyle: "italic", paddingLeft: 28 }}>{topic.summary}</div>}
                </div>
                <div style={st.topicActions} className="no-print">
                  <button onClick={(e) => { e.stopPropagation(); setFocusTopic({ cat, topic }); }} style={st.focusBtn} title="Focus mode">⛶</button>
                  <span style={{ ...st.collapseIcon, transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }}>▼</span>
                </div>
              </div>
              <Collapsible open={!isCollapsed}>
                <div style={st.tagRow} className="no-print">
                  {topic.tags.map((t) => <span key={t} style={{ ...st.tag, cursor: "pointer", ...(tagFilter === t ? st.tagActive : {}) }} onClick={() => handleTagClick(t)}>{t}</span>)}
                </div>
                <div style={st.topicNotes}>{topic.content}</div>
              </Collapsible>
              {idx < cat.topics.length - 1 && <hr style={st.divider} />}
            </div>);
          })}
        </div>))}

        {filtered.length === 0 && <div style={{ textAlign: "center", padding: 40 }}><div style={{ color: "#999", marginBottom: 12 }}>No results found.</div><button onClick={clearFilters} style={{ ...st.actionBtn, color: "#4338ca" }}>Clear filters</button></div>}
      </div>

      {showBackToTop && <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} style={st.backToTop} className="no-print">↑</button>}
    </div>
  );
}

/* ============================================================
   STYLES
   ============================================================ */
const st: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#fff", color: "#1a1a1a", fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", fontSize: 14, lineHeight: 1.8, display: "flex" },
  tocSidebar: { position: "sticky", top: 0, alignSelf: "flex-start", width: 240, height: "100vh", overflowY: "auto", padding: "24px 16px", borderRight: "1px solid #e5e5e5", background: "#fafafa", flexShrink: 0 },
  tocHeader: { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#999", marginBottom: 16 },
  tocCatGroup: { marginBottom: 16 },
  tocCatLabel: { fontSize: 12, fontWeight: 700, color: "#555", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 },
  tocItem: { display: "flex", alignItems: "center", gap: 6, width: "100%", textAlign: "left", background: "none", border: "none", padding: "4px 8px", borderRadius: 4, fontSize: 12, color: "#666", cursor: "pointer", lineHeight: 1.4, transition: "all 0.15s ease" },
  tocItemActive: { background: "#eef2ff", color: "#4338ca", fontWeight: 600 },
  tocNum: { color: "#aaa", fontSize: 11, minWidth: 20, flexShrink: 0 },
  tocMobileBtn: { position: "fixed", bottom: 20, left: 20, zIndex: 200, background: "#4338ca", color: "#fff", border: "none", borderRadius: "50%", width: 44, height: 44, fontSize: 18, cursor: "pointer", boxShadow: "0 2px 12px rgba(0,0,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center" },
  tocOverlay: { position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.3)" },
  tocMobile: { position: "absolute", bottom: 0, left: 0, width: 280, height: "100vh", background: "#fff", padding: "24px 16px", overflowY: "auto", boxShadow: "4px 0 20px rgba(0,0,0,0.1)" },
  main: { flex: 1, maxWidth: 720, margin: "0 auto", padding: "32px 32px 100px" },
  headerBar: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, gap: 12 },
  title: { fontSize: 22, fontWeight: 800, color: "#111", margin: 0 },
  subtitle: { margin: "4px 0 0", color: "#888", fontSize: 13 },
  homeLink: { color: "#4338ca", textDecoration: "none", fontSize: 13, fontWeight: 500, whiteSpace: "nowrap" },
  toolbar: { marginBottom: 28, display: "flex", flexDirection: "column", gap: 10 },
  searchWrap: { position: "relative" },
  searchInput: { width: "100%", padding: "10px 32px 10px 14px", background: "#f5f5f5", borderWidth: 1, borderStyle: "solid", borderColor: "#e0e0e0", borderRadius: 8, color: "#1a1a1a", fontSize: 14, outline: "none", boxSizing: "border-box" as const, transition: "border-color 0.2s ease" },
  clearBtn: { position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#999", cursor: "pointer", fontSize: 14 },
  filterRow: { display: "flex", flexWrap: "wrap", gap: 6 },
  filterPill: { padding: "4px 12px", borderRadius: 20, borderWidth: 1, borderStyle: "solid", borderColor: "#e0e0e0", background: "#fff", color: "#666", fontSize: 12, cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s ease" },
  filterPillActive: { background: "#4338ca", color: "#fff", borderColor: "transparent" },
  actionBar: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" },
  actionBtn: { padding: "4px 10px", borderRadius: 6, borderWidth: 1, borderStyle: "solid", borderColor: "#e0e0e0", background: "#fff", color: "#666", fontSize: 11, cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.15s ease" },
  catHeading: { display: "flex", alignItems: "center", gap: 8, fontSize: 18, fontWeight: 800, color: "#111", marginBottom: 20, paddingBottom: 10, borderBottom: "2px solid #e5e5e5" },
  catCount: { fontSize: 12, fontWeight: 400, color: "#999", marginLeft: "auto" },
  topicBlock: { marginBottom: 4, scrollMarginTop: 20 },
  topicHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", cursor: "pointer", padding: "4px 0" },
  topicTitle: { fontSize: 15, fontWeight: 700, color: "#1a1a1a", margin: 0, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
  topicNum: { color: "#4338ca", marginRight: 2 },
  topicCounter: { fontSize: 11, color: "#ccc", fontWeight: 400 },
  topicActions: { display: "flex", alignItems: "center", gap: 8, flexShrink: 0, marginLeft: 12 },
  focusBtn: { background: "none", border: "none", fontSize: 16, cursor: "pointer", color: "#ccc", padding: "2px 4px", borderRadius: 4, transition: "color 0.15s ease" },
  collapseIcon: { fontSize: 11, color: "#bbb", minWidth: 16, display: "inline-block" },
  tagRow: { display: "flex", flexWrap: "wrap", gap: 4, margin: "6px 0 10px 8px" },
  tag: { fontSize: 10, padding: "2px 10px", borderRadius: 10, background: "#f0f0f5", color: "#666", transition: "all 0.15s ease", borderWidth: 1, borderStyle: "solid", borderColor: "transparent", fontWeight: 400 },
  tagActive: { fontSize: 10, padding: "2px 10px", borderRadius: 10, background: "#eef2ff", color: "#4338ca", fontWeight: 600, borderWidth: 1, borderStyle: "solid", borderColor: "#c7d2fe" },
  topicNotes: { paddingLeft: 8, color: "#444" },
  divider: { border: "none", borderTop: "1px solid #eee", margin: "24px 0" },
  focusBack: { background: "none", border: "none", color: "#4338ca", fontSize: 14, cursor: "pointer", padding: 0, fontWeight: 500 },
  focusNav: { display: "flex", justifyContent: "space-between", marginTop: 40, paddingTop: 20, borderTop: "1px solid #eee", gap: 12 },
  focusNavBtn: { background: "none", border: "none", color: "#4338ca", fontSize: 13, cursor: "pointer", padding: 0, fontWeight: 500, maxWidth: "45%" },
  backToTop: { position: "fixed", bottom: 20, right: 20, zIndex: 200, background: "#4338ca", color: "#fff", border: "none", borderRadius: "50%", width: 40, height: 40, fontSize: 18, cursor: "pointer", boxShadow: "0 2px 12px rgba(0,0,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center" },
};
