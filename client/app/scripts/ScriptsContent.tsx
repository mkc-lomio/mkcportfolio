"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  InterviewPrep,
  PrepCategory,
  PrepDifficulty,
  getInterviewPreps,
  createInterviewPrep,
  updateInterviewPrep,
  deleteInterviewPrep,
  togglePrepFavorite,
} from "../../lib/supabase.service";

/* ============================================================
   THEME
   ============================================================ */

const T = {
  bg: "hsl(0,0%,7%)", surface: "hsl(240,2%,13%)", surface2: "hsl(240,2%,12%)",
  card: "hsl(240,1%,17%)", jet: "hsl(0,0%,22%)", border: "hsl(0,0%,25%)",
  gold: "hsl(45,100%,72%)", goldDim: "hsl(45,54%,58%)",
  white1: "hsl(0,0%,100%)", white2: "hsl(0,0%,98%)",
  gray: "hsl(0,0%,84%)", gray70: "hsla(0,0%,84%,0.7)", grayDim: "hsl(0,0%,55%)",
  font: "'Poppins', sans-serif", radius: 14,
  shadow: "0 16px 30px hsla(0,0%,0%,0.25)", transition: "0.25s ease",
};

/* ============================================================
   CONSTANTS
   ============================================================ */

const ALL_CATEGORIES: PrepCategory[] = [
  "Behavioral", "System Design", "C# / .NET", "SQL / Database",
  "Angular / Frontend", "Azure / Cloud", "API / Integration", "General Technical", "Culture Fit",
  "Security", "Project Management",
];

const ALL_DIFFICULTIES: PrepDifficulty[] = ["Easy", "Medium", "Hard"];

const categoryConfig: Record<PrepCategory, { icon: string; color: string }> = {
  "Behavioral":         { icon: "🧠", color: "#818cf8" },
  "System Design":      { icon: "🏗️", color: "#c084fc" },
  "C# / .NET":          { icon: "⚙️", color: "#60a5fa" },
  "SQL / Database":     { icon: "🗄️", color: "#f472b6" },
  "Angular / Frontend": { icon: "🎨", color: "#fb923c" },
  "Azure / Cloud":      { icon: "☁️", color: "#38bdf8" },
  "API / Integration":  { icon: "🔗", color: "#4ade80" },
  "General Technical":  { icon: "💡", color: "#fbbf24" },
  "Culture Fit":        { icon: "🤝", color: "#34d399" },
  "Security":           { icon: "🔒", color: "#f43f5e" },
  "Project Management": { icon: "📋", color: "#a78bfa" },
};

const difficultyConfig: Record<PrepDifficulty, { color: string; bg: string }> = {
  Easy:   { color: "#4ade80", bg: "rgba(74,222,128,0.12)" },
  Medium: { color: "#fbbf24", bg: "rgba(251,191,36,0.12)" },
  Hard:   { color: "#f87171", bg: "rgba(248,113,113,0.12)" },
};

const EMPTY_FORM: Omit<InterviewPrep, "id" | "created_at" | "updated_at"> = {
  category: "Behavioral", question: "", answer: "", difficulty: "Medium",
  tags: [], is_favorite: false,
};

/* ============================================================
   MAIN COMPONENT
   ============================================================ */

export default function ScriptsContent() {
  const [items, setItems] = useState<InterviewPrep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<PrepCategory | "All">("All");
  const [difficultyFilter, setDifficultyFilter] = useState<PrepDifficulty | "All">("All");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InterviewPrep | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState("");

  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);

  /* ---- DATA ---- */
  const fetchItems = useCallback(async () => {
    try { setLoading(true); setError(null); setItems(await getInterviewPreps()); }
    catch (err: unknown) { setError(err instanceof Error ? err.message : "Failed to load"); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { fetchItems(); }, [fetchItems]);

  const filtered = items
    .filter((i) => {
      if (categoryFilter !== "All" && i.category !== categoryFilter) return false;
      if (difficultyFilter !== "All" && i.difficulty !== difficultyFilter) return false;
      if (showFavoritesOnly && !i.is_favorite) return false;
      if (search) {
        const q = search.toLowerCase();
        return i.question.toLowerCase().includes(q) || i.answer.toLowerCase().includes(q) || (i.tags || []).some((t) => t.toLowerCase().includes(q));
      }
      return true;
    });

  const stats = {
    total: items.length,
    favorites: items.filter((i) => i.is_favorite).length,
    categories: new Set(items.map((i) => i.category)).size,
  };

  /* ---- HANDLERS ---- */
  const openCreate = () => { setEditingItem(null); setForm({ ...EMPTY_FORM }); setTagInput(""); setModalOpen(true); };
  const openEdit = (item: InterviewPrep) => {
    setEditingItem(item);
    setForm({ category: item.category, question: item.question, answer: item.answer, difficulty: item.difficulty, tags: item.tags || [], is_favorite: item.is_favorite });
    setTagInput(""); setModalOpen(true);
  };
  const closeModal = () => { setModalOpen(false); setEditingItem(null); setForm(EMPTY_FORM); };

  const handleSave = async () => {
    if (!form.question.trim() || !form.answer.trim()) return;
    try { setSaving(true); if (editingItem?.id) await updateInterviewPrep(editingItem.id, form); else await createInterviewPrep(form); closeModal(); await fetchItems(); }
    catch (err: unknown) { setError(err instanceof Error ? err.message : "Failed to save"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    try { setDeleting(true); await deleteInterviewPrep(id); setDeleteConfirm(null); await fetchItems(); }
    catch (err: unknown) { setError(err instanceof Error ? err.message : "Failed to delete"); }
    finally { setDeleting(false); }
  };

  const handleToggleFavorite = async (id: number, current: boolean) => {
    try { await togglePrepFavorite(id, !current); await fetchItems(); }
    catch (err: unknown) { setError(err instanceof Error ? err.message : "Failed to update"); }
  };

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  };

  const expandAll = () => setExpandedIds(new Set(filtered.map((i) => i.id!)));
  const collapseAll = () => setExpandedIds(new Set());

  const addTag = () => { if (tagInput.trim() && !(form.tags || []).includes(tagInput.trim())) { setForm((f) => ({ ...f, tags: [...(f.tags || []), tagInput.trim()] })); setTagInput(""); } };
  const removeTag = (idx: number) => { setForm((f) => ({ ...f, tags: (f.tags || []).filter((_, i) => i !== idx) })); };

  /* ---- format content with code blocks, inline code, bold ---- */
  const formatContent = (text: string) => {
    // Split by code blocks first: ```lang\ncode\n```
    const parts = text.split(/(```[\s\S]*?```)/g);

    return parts.map((part, i) => {
      // Code block
      const codeBlockMatch = part.match(/^```(\w*)\n?([\s\S]*?)```$/);
      if (codeBlockMatch) {
        const lang = codeBlockMatch[1];
        const code = codeBlockMatch[2].replace(/\n$/, "");
        return (
          <div key={i} style={{ margin: "16px 0", borderRadius: 10, overflow: "hidden", border: `1px solid ${T.jet}` }}>
            {lang && (
              <div style={{ padding: "6px 14px", background: "hsla(0,0%,0%,0.3)", fontSize: 11, color: T.grayDim, fontFamily: "monospace", borderBottom: `1px solid ${T.jet}` }}>
                {lang}
              </div>
            )}
            <pre style={{ margin: 0, padding: "14px 16px", background: "hsla(0,0%,0%,0.25)", overflowX: "auto", fontSize: 13, lineHeight: 1.6, fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace", color: "#e2e8f0", whiteSpace: "pre" as const, tabSize: 2 }}>
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      // For non-code-block text, split into paragraphs by blank lines
      const paragraphs = part.split(/\n\s*\n/);
      return paragraphs.map((para, pi) => {
        const lines = para.split("\n");
        const formattedLines = lines.map((line, li) => {
          // Process inline code and bold
          const tokens = line.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
          const formatted = tokens.map((token, ti) => {
            // Inline code
            if (token.startsWith("`") && token.endsWith("`")) {
              return (
                <code key={ti} style={{ padding: "2px 7px", borderRadius: 5, background: "hsla(0,0%,0%,0.3)", border: `1px solid ${T.jet}`, fontSize: 12.5, fontFamily: "'Fira Code', 'Consolas', monospace", color: T.gold }}>
                  {token.slice(1, -1)}
                </code>
              );
            }
            // Bold
            if (token.startsWith("**") && token.endsWith("**")) {
              return <strong key={ti} style={{ color: T.white2, fontWeight: 600 }}>{token.slice(2, -2)}</strong>;
            }
            return <span key={ti}>{token}</span>;
          });

          return (
            <span key={`${i}-${pi}-${li}`}>
              {li > 0 && <br />}
              {formatted}
            </span>
          );
        });

        return (
          <div key={`${i}-${pi}`} style={{ marginBottom: pi < paragraphs.length - 1 ? 16 : 0 }}>
            {formattedLines}
          </div>
        );
      });
    });
  };

  /* ============================================================
     MAIN VIEW
     ============================================================ */
  return (
    <div style={st.page}>
      <CSS />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 20px 100px" }}>

        {/* HEADER */}
        <div style={{ animation: "prepFadeUp 0.5s ease both", marginBottom: 32 }}>
          <a href="/" style={{ ...st.goldLink, marginBottom: 16, display: "inline-block", textDecoration: "none" }}>
            <span style={{ marginRight: 6, fontSize: 11 }}>◂</span> Portfolio
          </a>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap" as const, gap: 16 }}>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 600, color: T.white2, margin: 0, fontFamily: T.font }}>Interview Scripts</h1>
              <p style={{ fontSize: 14, color: T.grayDim, margin: "6px 0 0", fontFamily: T.font }}>Pre-written scripts & templates for interview scenarios</p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={openCreate} style={st.btnGold}>+ Add Script</button>
            </div>
          </div>
        </div>

        {/* STATS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 28, animation: "prepFadeUp 0.5s ease 0.06s both" }} className="prepStatsGrid">
          <div style={st.card}>
            <div style={{ fontSize: 28, fontWeight: 600, color: T.gold, fontFamily: T.font, lineHeight: 1 }}>{stats.total}</div>
            <div style={st.statLabel}>Scripts</div>
          </div>
          <div style={st.card}>
            <div style={{ fontSize: 28, fontWeight: 600, color: "#fbbf24", fontFamily: T.font, lineHeight: 1 }}>{stats.favorites}</div>
            <div style={st.statLabel}>Favorites</div>
          </div>
          <div style={st.card}>
            <div style={{ fontSize: 28, fontWeight: 600, color: "#818cf8", fontFamily: T.font, lineHeight: 1 }}>{stats.categories}</div>
            <div style={st.statLabel}>Categories</div>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div style={{ background: "rgba(248,113,113,0.1)", borderWidth: 1, borderStyle: "solid", borderColor: "rgba(248,113,113,0.2)", color: "#f87171", padding: "10px 16px", borderRadius: T.radius, fontSize: 13, marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: T.font }}>
            <span>{error}</span>
            <button onClick={() => setError(null)} style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: 16 }}>✕</button>
          </div>
        )}

        {/* FILTERS */}
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 14, marginBottom: 24, animation: "prepFadeUp 0.5s ease 0.12s both" }}>
          {/* Search */}
          <div style={{ position: "relative" as const }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: T.grayDim, pointerEvents: "none" }}>🔍</span>
            <input
              style={st.searchInput}
              placeholder="Search scripts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Category pills */}
          <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6 }}>
            <button onClick={() => setCategoryFilter("All")} style={{ ...st.pill, ...(categoryFilter === "All" ? st.pillActive : {}) }}>All</button>
            {ALL_CATEGORIES.map((c) => (
              <button key={c} onClick={() => setCategoryFilter(c)} style={{ ...st.pill, ...(categoryFilter === c ? st.pillActive : {}) }}>
                {categoryConfig[c].icon} {c}
              </button>
            ))}
          </div>

          {/* Difficulty + Favorites + Expand/Collapse */}
          <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8, alignItems: "center" }}>
            {ALL_DIFFICULTIES.map((d) => {
              const dc = difficultyConfig[d];
              return (
                <button key={d} onClick={() => setDifficultyFilter(difficultyFilter === d ? "All" : d)}
                  style={{ ...st.pill, ...(difficultyFilter === d ? { background: dc.bg, color: dc.color, borderColor: "transparent" } : {}) }}>
                  {d}
                </button>
              );
            })}
            <button onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              style={{ ...st.pill, ...(showFavoritesOnly ? st.pillActive : {}) }}>
              ⭐ Favorites
            </button>
            <div style={{ flex: 1 }} />
            <button onClick={expandAll} style={st.sortChip}>Expand All</button>
            <button onClick={collapseAll} style={st.sortChip}>Collapse All</button>
          </div>
        </div>

        {/* LOADING */}
        {loading && (
          <div style={{ textAlign: "center" as const, padding: 60 }}>
            <div style={{ width: 28, height: 28, border: `2px solid ${T.jet}`, borderTopColor: T.gold, borderRadius: "50%", animation: "prepSpin 0.7s linear infinite", margin: "0 auto 12px" }} />
            <p style={{ color: T.grayDim, fontSize: 13, fontFamily: T.font }}>Loading scripts...</p>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: "center" as const, padding: "60px 20px", animation: "prepFadeUp 0.5s ease both" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📝</div>
            <p style={{ color: T.grayDim, fontSize: 14, fontFamily: T.font, marginBottom: 16 }}>
              {items.length === 0 ? "No scripts yet. Add your first interview script!" : "No scripts match your filters."}
            </p>
          </div>
        )}

        {/* SCRIPT CARDS */}
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 12 }}>
          {filtered.map((item, idx) => {
            const cc = categoryConfig[item.category];
            const dc = difficultyConfig[item.difficulty];
            const expanded = expandedIds.has(item.id!);

            return (
              <div key={item.id} className="prepCard"
                style={{ ...st.card, padding: 0, overflow: "hidden", animation: `prepFadeUp 0.4s ease ${idx * 0.03}s both`, cursor: "pointer" }}
                onClick={() => toggleExpand(item.id!)}
              >
                <div style={{ height: 3, background: cc.color }} />
                <div style={{ padding: "18px 22px" }}>
                  {/* Top row */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      {/* Category + Difficulty */}
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" as const }}>
                        <span style={{ fontSize: 12, color: cc.color, fontFamily: T.font, fontWeight: 500 }}>{cc.icon} {item.category}</span>
                        <span style={{ ...st.diffBadge, background: dc.bg, color: dc.color }}>{item.difficulty}</span>
                        {item.is_favorite && <span style={{ fontSize: 13 }}>⭐</span>}
                      </div>

                      {/* Scenario title */}
                      <h3 style={{ fontSize: 15, fontWeight: 600, color: T.white2, margin: 0, lineHeight: 1.5, fontFamily: T.font }}>
                        {item.question}
                      </h3>
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", gap: 4, flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                      <button className="cardBtn" onClick={() => handleToggleFavorite(item.id!, !!item.is_favorite)} style={{ ...st.iconBtn, fontSize: 16 }} title="Toggle favorite">
                        {item.is_favorite ? "⭐" : "☆"}
                      </button>
                      <button className="cardBtn" onClick={() => openEdit(item)} style={st.iconBtn} title="Edit">✏️</button>
                      {deleteConfirm === item.id ? (
                        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                          <button onClick={() => handleDelete(item.id!)} disabled={deleting} style={{ ...st.iconBtn, color: "#f87171", fontSize: 12 }}>
                            {deleting ? "..." : "Yes"}
                          </button>
                          <button onClick={() => setDeleteConfirm(null)} style={{ ...st.iconBtn, fontSize: 12 }}>No</button>
                        </div>
                      ) : (
                        <button className="cardBtn" onClick={() => setDeleteConfirm(item.id!)} style={st.iconBtn} title="Delete">🗑️</button>
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  {item.tags && item.tags.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 5, marginTop: 10 }}>
                      {item.tags.map((t, i) => (
                        <span key={i} style={st.tag}>{t}</span>
                      ))}
                    </div>
                  )}

                  {/* Expanded script content */}
                  {expanded && (
                    <div style={{ marginTop: 16, animation: "prepFadeUp 0.25s ease both" }}>
                      <div style={{ width: "100%", height: 1, background: T.jet, marginBottom: 16 }} />
                      <div style={{ fontSize: 14, color: T.gray, lineHeight: 1.85, fontFamily: T.font }}>
                        {formatContent(item.answer)}
                      </div>
                    </div>
                  )}

                  {/* Expand indicator */}
                  <div style={{ textAlign: "center" as const, marginTop: 8, fontSize: 10, color: T.grayDim }}>
                    {expanded ? "▲ Collapse" : "▼ Tap to view script"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ==================== MODAL ==================== */}
      {modalOpen && (
        <div style={st.overlay} onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          <div ref={modalRef} style={st.modal as React.CSSProperties}>
            <div style={{ padding: "20px 24px", borderBottom: `1px solid ${T.jet}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: T.white2, fontFamily: T.font }}>
                {editingItem ? "Edit Script" : "New Script"}
              </h2>
              <button onClick={closeModal} style={{ background: "none", border: "none", color: T.grayDim, cursor: "pointer", fontSize: 18 }}>✕</button>
            </div>

            <div style={{ padding: "20px 24px", overflow: "auto", flex: 1, display: "flex", flexDirection: "column" as const, gap: 18 }}>
              {/* Category + Difficulty */}
              <div style={st.formRow as React.CSSProperties}>
                <div style={st.formGroup as React.CSSProperties}>
                  <label style={st.formLabel}>Category</label>
                  <select style={st.formInput} value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as PrepCategory }))}>
                    {ALL_CATEGORIES.map((c) => <option key={c} value={c}>{categoryConfig[c].icon} {c}</option>)}
                  </select>
                </div>
                <div style={st.formGroup as React.CSSProperties}>
                  <label style={st.formLabel}>Difficulty</label>
                  <select style={st.formInput} value={form.difficulty} onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value as PrepDifficulty }))}>
                    {ALL_DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              {/* Scenario */}
              <div style={st.formGroup as React.CSSProperties}>
                <label style={st.formLabel}>Scenario / Question *</label>
                <textarea style={{ ...st.formInput, minHeight: 70, resize: "vertical" as const, fontFamily: T.font }} value={form.question} onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))} placeholder="e.g. Tell me about yourself..." />
              </div>

              {/* Script */}
              <div style={st.formGroup as React.CSSProperties}>
                <label style={st.formLabel}>Script / Response *</label>
                <textarea style={{ ...st.formInput, minHeight: 150, resize: "vertical" as const, fontFamily: T.font, lineHeight: 1.7 }} value={form.answer} onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))} placeholder="Write your prepared script here..." />
              </div>

              {/* Tags */}
              <div style={st.formGroup as React.CSSProperties}>
                <label style={st.formLabel}>Tags</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input style={{ ...st.formInput, flex: 1 }} value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }} placeholder="e.g. STAR method, intro, closing" />
                  <button onClick={addTag} disabled={!tagInput.trim()} style={{ ...st.btnGold, padding: "8px 16px", opacity: tagInput.trim() ? 1 : 0.35 }}>Add</button>
                </div>
                {(form.tags || []).length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6, marginTop: 10 }}>
                    {(form.tags || []).map((t, i) => (
                      <span key={i} style={{ ...st.tag, display: "flex", alignItems: "center", gap: 6 }}>
                        {t}
                        <button onClick={() => removeTag(i)} style={{ background: "none", border: "none", color: T.grayDim, cursor: "pointer", fontSize: 11, padding: 0 }}>✕</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Favorite toggle */}
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontFamily: T.font, fontSize: 13, color: T.gray70 }}>
                <input type="checkbox" checked={form.is_favorite || false} onChange={(e) => setForm((f) => ({ ...f, is_favorite: e.target.checked }))} />
                ⭐ Mark as favorite
              </label>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, padding: "16px 24px", borderTop: `1px solid ${T.jet}` }}>
              <button onClick={closeModal} style={st.btnGhost}>Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.question.trim() || !form.answer.trim()} style={{ ...st.btnGold, opacity: saving || !form.question.trim() || !form.answer.trim() ? 0.35 : 1 }}>
                {saving ? "Saving..." : editingItem ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   CSS
   ============================================================ */

function CSS() {
  return (
    <style>{`
      @keyframes prepFadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes prepSlideUp { from { opacity: 0; transform: translateY(30px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
      @keyframes prepFadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes prepSpin { to { transform: rotate(360deg); } }
      .prepCard { transition: border-color 0.25s ease; }
      .prepCard:hover { border-color: hsl(0,0%,30%) !important; }
      .cardBtn { transition: opacity 0.2s ease, transform 0.15s ease; }
      .cardBtn:hover { transform: scale(1.15); }
      select option { background: hsl(240,2%,13%); color: hsl(0,0%,98%); }
      @media (max-width: 680px) { .prepStatsGrid { grid-template-columns: repeat(2, 1fr) !important; } }
    `}</style>
  );
}

/* ============================================================
   STYLES
   ============================================================ */

const st: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: T.bg, fontFamily: T.font, color: T.gray, fontSize: 14, lineHeight: 1.6 },

  card: {
    background: T.card, padding: 20, borderRadius: T.radius,
    boxShadow: T.shadow, borderWidth: 1, borderStyle: "solid", borderColor: T.jet,
  },

  goldLink: { color: T.gold, textDecoration: "none", fontSize: 13, fontWeight: 500, fontFamily: T.font, cursor: "pointer", background: "none", border: "none", padding: 0 },

  statLabel: { fontSize: 11, color: T.grayDim, textTransform: "uppercase" as const, letterSpacing: "0.06em", fontWeight: 500, marginTop: 6, fontFamily: T.font },

  diffBadge: { fontSize: 10, fontWeight: 600, padding: "2px 10px", borderRadius: 6, fontFamily: T.font },

  tag: { fontSize: 11, padding: "3px 10px", borderRadius: 6, background: "rgba(251,191,36,0.08)", color: T.goldDim, fontFamily: T.font },

  searchInput: {
    width: "100%", padding: "11px 36px", background: T.surface, borderWidth: 1, borderStyle: "solid", borderColor: T.jet,
    borderRadius: T.radius, color: T.white2, fontSize: 14, fontFamily: T.font, outline: "none", boxSizing: "border-box" as const,
  },

  pill: { padding: "5px 14px", borderRadius: 20, borderWidth: 1, borderStyle: "solid", borderColor: T.jet, background: "transparent", color: T.grayDim, fontSize: 12, fontFamily: T.font, cursor: "pointer", whiteSpace: "nowrap" as const, transition: T.transition },
  pillActive: { background: "rgba(251,191,36,0.12)", color: T.gold, borderColor: "transparent" },

  sortChip: { padding: "4px 10px", borderRadius: 6, border: "none", background: "transparent", color: T.grayDim, fontSize: 12, fontFamily: T.font, cursor: "pointer" },

  iconBtn: { background: "none", border: "none", fontSize: 16, cursor: "pointer", padding: "4px 6px", borderRadius: 6, color: T.grayDim },

  btnGold: {
    padding: "10px 22px", borderRadius: T.radius, border: "none",
    background: `linear-gradient(to bottom right, ${T.gold}, ${T.goldDim})`,
    color: "hsl(0,0%,7%)", fontSize: 14, fontWeight: 600, fontFamily: T.font, cursor: "pointer",
  },
  btnGhost: {
    padding: "10px 22px", borderRadius: T.radius, borderWidth: 1, borderStyle: "solid", borderColor: T.jet,
    background: "transparent", color: T.gray70, fontSize: 14, fontWeight: 500, fontFamily: T.font, cursor: "pointer",
  },

  overlay: {
    position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.6)",
    backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center",
    padding: 20, animation: "prepFadeIn 0.2s ease",
  },
  modal: {
    background: T.surface, borderRadius: T.radius, borderWidth: 1, borderStyle: "solid", borderColor: T.jet,
    width: "100%", maxWidth: 620, maxHeight: "90vh", overflow: "hidden",
    display: "flex", flexDirection: "column", boxShadow: "0 30px 80px hsla(0,0%,0%,0.5)",
    animation: "prepSlideUp 0.3s ease",
  },

  formRow: { display: "flex", gap: 14, flexWrap: "wrap" },
  formGroup: { flex: 1, minWidth: 200, display: "flex", flexDirection: "column", gap: 6 },
  formLabel: { fontSize: 12, fontWeight: 500, color: T.gray70, fontFamily: T.font },
  formInput: {
    padding: "10px 14px", borderRadius: 10, borderWidth: 1, borderStyle: "solid", borderColor: T.jet,
    fontSize: 14, color: T.white2, fontFamily: T.font, outline: "none",
    background: T.surface2, boxSizing: "border-box" as const, width: "100%",
  },
};