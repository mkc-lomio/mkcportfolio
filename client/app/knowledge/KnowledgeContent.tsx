"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  KnowledgeEntry,
  KnowledgeCategory,
  getKnowledgeEntries,
  createKnowledgeEntry,
  updateKnowledgeEntry,
  deleteKnowledgeEntry,
  toggleKnowledgeFavorite,
} from "../../lib/supabase.service";

/* ============================================================
   THEME  (matches existing portfolio pages)
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

const ALL_CATEGORIES: KnowledgeCategory[] = [
  "English", "Vocabulary", "Grammar", "History",
  "Science", "Health", "Finance", "Philosophy",
  "Psychology", "Books", "Life Lessons", "Fun Facts", "General",
];

const categoryConfig: Record<KnowledgeCategory, { icon: string; color: string }> = {
  "English":         { icon: "🇬🇧", color: "#60a5fa" },
  "Vocabulary":      { icon: "📝", color: "#c084fc" },
  "Grammar":         { icon: "✍️", color: "#f472b6" },
  "History":         { icon: "🏛️", color: "#fb923c" },
  "Science":         { icon: "🔬", color: "#38bdf8" },
  "Health":          { icon: "💪", color: "#4ade80" },
  "Finance":         { icon: "💰", color: "#fbbf24" },
  "Philosophy":      { icon: "🤔", color: "#a78bfa" },
  "Psychology":      { icon: "🧠", color: "#818cf8" },
  "Books":           { icon: "📚", color: "#f97316" },
  "Life Lessons":    { icon: "🌱", color: "#34d399" },
  "Fun Facts":       { icon: "⚡", color: "#22d3ee" },
  "General":         { icon: "💡", color: "#e2e8f0" },
};

const EMPTY_FORM: Omit<KnowledgeEntry, "id" | "created_at" | "updated_at"> = {
  title: "", content: "", category: "General",
  source: "", source_url: "", tags: [], is_favorite: false,
};

/* ============================================================
   MAIN COMPONENT
   ============================================================ */

export default function KnowledgeContent() {
  const [items, setItems] = useState<KnowledgeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<KnowledgeCategory | "All">("All");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<KnowledgeEntry | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState("");

  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);

  /* ---- DATA ---- */
  const fetchItems = useCallback(async () => {
    try { setLoading(true); setError(null); setItems(await getKnowledgeEntries()); }
    catch (err: unknown) { setError(err instanceof Error ? err.message : "Failed to load"); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { fetchItems(); }, [fetchItems]);

  const filtered = items
    .filter((i) => {
      if (categoryFilter !== "All" && i.category !== categoryFilter) return false;
      if (showFavoritesOnly && !i.is_favorite) return false;
      if (search) {
        const q = search.toLowerCase();
        return i.title.toLowerCase().includes(q)
          || i.content.toLowerCase().includes(q)
          || (i.source || "").toLowerCase().includes(q)
          || (i.tags || []).some((t) => t.toLowerCase().includes(q));
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
  const openEdit = (item: KnowledgeEntry) => {
    setEditingItem(item);
    setForm({
      title: item.title, content: item.content, category: item.category,
      source: item.source || "", source_url: item.source_url || "",
      tags: item.tags || [], is_favorite: item.is_favorite,
    });
    setTagInput(""); setModalOpen(true);
  };
  const closeModal = () => { setModalOpen(false); setEditingItem(null); setForm(EMPTY_FORM); };

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) return;
    try {
      setSaving(true);
      if (editingItem?.id) await updateKnowledgeEntry(editingItem.id, form);
      else await createKnowledgeEntry(form);
      closeModal(); await fetchItems();
    }
    catch (err: unknown) { setError(err instanceof Error ? err.message : "Failed to save"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    try { setDeleting(true); await deleteKnowledgeEntry(id); setDeleteConfirm(null); await fetchItems(); }
    catch (err: unknown) { setError(err instanceof Error ? err.message : "Failed to delete"); }
    finally { setDeleting(false); }
  };

  const handleToggleFavorite = async (id: number, current: boolean) => {
    try { await toggleKnowledgeFavorite(id, !current); await fetchItems(); }
    catch (err: unknown) { setError(err instanceof Error ? err.message : "Failed to update"); }
  };

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  };

  const expandAll = () => setExpandedIds(new Set(filtered.map((i) => i.id!)));
  const collapseAll = () => setExpandedIds(new Set());

  const addTag = () => { if (tagInput.trim() && !(form.tags || []).includes(tagInput.trim())) { setForm((f) => ({ ...f, tags: [...(f.tags || []), tagInput.trim()] })); setTagInput(""); } };
  const removeTag = (idx: number) => { setForm((f) => ({ ...f, tags: (f.tags || []).filter((_, i) => i !== idx) })); };

  /* ---- time ago helper ---- */
  const timeAgo = (date: string) => {
    const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (s < 60) return "just now";
    const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24); if (d < 30) return `${d}d ago`;
    const mo = Math.floor(d / 30); return `${mo}mo ago`;
  };

  /* ============================================================
     MAIN VIEW
     ============================================================ */
  return (
    <div style={st.page}>
      <CSS />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 20px 100px" }}>

        {/* HEADER */}
        <div style={{ animation: "kbFadeUp 0.5s ease both", marginBottom: 32 }}>
          <a href="/" style={{ ...st.goldLink, marginBottom: 16, display: "inline-block", textDecoration: "none" }}>
            <span style={{ marginRight: 6, fontSize: 11 }}>◂</span> Portfolio
          </a>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap" as const, gap: 16 }}>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 600, color: T.white2, margin: 0, fontFamily: T.font }}>
                Knowledge Vault
              </h1>
              <p style={{ fontSize: 14, color: T.grayDim, margin: "6px 0 0", fontFamily: T.font }}>
                Everything worth remembering — English, books, life, and more
              </p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={openCreate} style={st.btnGold}>+ Add Entry</button>
            </div>
          </div>
        </div>

        {/* STATS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 28, animation: "kbFadeUp 0.5s ease 0.06s both" }} className="kbStatsGrid">
          <div style={st.card}>
            <div style={{ fontSize: 28, fontWeight: 600, color: T.gold, fontFamily: T.font, lineHeight: 1 }}>{stats.total}</div>
            <div style={st.statLabel}>Entries</div>
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
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 14, marginBottom: 24, animation: "kbFadeUp 0.5s ease 0.12s both" }}>
          {/* Search */}
          <div style={{ position: "relative" as const }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: T.grayDim, pointerEvents: "none" }}>🔍</span>
            <input
              style={st.searchInput}
              placeholder="Search your knowledge..."
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

          {/* Favorites + Expand/Collapse */}
          <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8, alignItems: "center" }}>
            <button onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              style={{ ...st.pill, ...(showFavoritesOnly ? st.pillActive : {}) }}>
              ⭐ Favorites
            </button>
            <div style={{ flex: 1 }} />
            <span style={{ fontSize: 12, color: T.grayDim, fontFamily: T.font }}>{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
            <button onClick={expandAll} style={st.sortChip}>Expand All</button>
            <button onClick={collapseAll} style={st.sortChip}>Collapse All</button>
          </div>
        </div>

        {/* LOADING */}
        {loading && (
          <div style={{ textAlign: "center" as const, padding: 60 }}>
            <div style={{ width: 28, height: 28, border: `2px solid ${T.jet}`, borderTopColor: T.gold, borderRadius: "50%", animation: "kbSpin 0.7s linear infinite", margin: "0 auto 12px" }} />
            <p style={{ color: T.grayDim, fontSize: 13, fontFamily: T.font }}>Loading knowledge base...</p>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: "center" as const, padding: "60px 20px", animation: "kbFadeUp 0.5s ease both" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📚</div>
            <p style={{ color: T.grayDim, fontSize: 14, fontFamily: T.font, marginBottom: 16 }}>
              {items.length === 0 ? "No entries yet. Start building your knowledge vault!" : "No entries match your filters."}
            </p>
          </div>
        )}

        {/* KNOWLEDGE CARDS */}
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 12 }}>
          {filtered.map((item, idx) => {
            const cc = categoryConfig[item.category];
            const expanded = expandedIds.has(item.id!);

            return (
              <div key={item.id} className="kbCard"
                style={{ ...st.card, padding: 0, overflow: "hidden", animation: `kbFadeUp 0.4s ease ${idx * 0.03}s both`, cursor: "pointer" }}
                onClick={() => toggleExpand(item.id!)}
              >
                <div style={{ height: 3, background: cc.color }} />
                <div style={{ padding: "18px 22px" }}>
                  {/* Top row */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      {/* Category badge */}
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" as const }}>
                        <span style={{ fontSize: 12, color: cc.color, fontFamily: T.font, fontWeight: 500 }}>{cc.icon} {item.category}</span>
                        {item.is_favorite && <span style={{ fontSize: 13 }}>⭐</span>}
                        {item.source && (
                          <span style={{ fontSize: 11, color: T.grayDim, fontFamily: T.font }}>
                            from {item.source}
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 style={{ fontSize: 15, fontWeight: 600, color: T.white2, margin: 0, lineHeight: 1.5, fontFamily: T.font }}>
                        {item.title}
                      </h3>
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", gap: 4, flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                      <button className="kbCardBtn" onClick={() => handleToggleFavorite(item.id!, !!item.is_favorite)} style={{ ...st.iconBtn, fontSize: 16 }} title="Toggle favorite">
                        {item.is_favorite ? "⭐" : "☆"}
                      </button>
                      <button className="kbCardBtn" onClick={() => openEdit(item)} style={st.iconBtn} title="Edit">✏️</button>
                      {deleteConfirm === item.id ? (
                        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                          <button onClick={() => handleDelete(item.id!)} disabled={deleting} style={{ ...st.iconBtn, color: "#f87171", fontSize: 12 }}>
                            {deleting ? "..." : "Yes"}
                          </button>
                          <button onClick={() => setDeleteConfirm(null)} style={{ ...st.iconBtn, fontSize: 12 }}>No</button>
                        </div>
                      ) : (
                        <button className="kbCardBtn" onClick={() => setDeleteConfirm(item.id!)} style={st.iconBtn} title="Delete">🗑️</button>
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

                  {/* Expanded content */}
                  {expanded && (
                    <div style={{ marginTop: 16, animation: "kbFadeUp 0.25s ease both" }}>
                      <div style={{ width: "100%", height: 1, background: T.jet, marginBottom: 16 }} />
                      <div style={{ fontSize: 14, color: T.gray, lineHeight: 1.85, fontFamily: T.font, whiteSpace: "pre-wrap" as const }}>
                        {item.content}
                      </div>

                      {/* Source link + timestamp */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, flexWrap: "wrap" as const, gap: 8 }}>
                        {item.source_url && (
                          <a href={item.source_url} target="_blank" rel="noopener noreferrer"
                            style={{ ...st.goldLink, fontSize: 12, display: "inline-flex", alignItems: "center", gap: 4 }}
                            onClick={(e) => e.stopPropagation()}>
                            🔗 View Source
                          </a>
                        )}
                        <span style={{ fontSize: 11, color: T.grayDim, fontFamily: T.font, marginLeft: "auto" }}>
                          {item.updated_at ? timeAgo(item.updated_at) : ""}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Expand indicator */}
                  <div style={{ textAlign: "center" as const, marginTop: 8, fontSize: 10, color: T.grayDim }}>
                    {expanded ? "▲ Collapse" : "▼ Tap to read"}
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
                {editingItem ? "Edit Entry" : "New Knowledge Entry"}
              </h2>
              <button onClick={closeModal} style={{ background: "none", border: "none", color: T.grayDim, cursor: "pointer", fontSize: 18 }}>✕</button>
            </div>

            <div style={{ padding: "20px 24px", overflow: "auto", flex: 1, display: "flex", flexDirection: "column" as const, gap: 18 }}>
              {/* Category */}
              <div style={st.formGroup as React.CSSProperties}>
                <label style={st.formLabel}>Category</label>
                <select style={st.formInput} value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as KnowledgeCategory }))}>
                  {ALL_CATEGORIES.map((c) => <option key={c} value={c}>{categoryConfig[c].icon} {c}</option>)}
                </select>
              </div>

              {/* Title */}
              <div style={st.formGroup as React.CSSProperties}>
                <label style={st.formLabel}>Title *</label>
                <input style={st.formInput} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Difference between Affect vs Effect" />
              </div>

              {/* Content */}
              <div style={st.formGroup as React.CSSProperties}>
                <label style={st.formLabel}>What I Learned *</label>
                <textarea
                  style={{ ...st.formInput, minHeight: 180, resize: "vertical" as const, fontFamily: T.font, lineHeight: 1.7 }}
                  value={form.content}
                  onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  placeholder="Write down what you learned in your own words. Key takeaways, examples, how to remember it..."
                />
              </div>

              {/* Source fields */}
              <div style={st.formRow as React.CSSProperties}>
                <div style={st.formGroup as React.CSSProperties}>
                  <label style={st.formLabel}>Source</label>
                  <input style={st.formInput} value={form.source || ""} onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))} placeholder='e.g. Atomic Habits by James Clear' />
                </div>
                <div style={st.formGroup as React.CSSProperties}>
                  <label style={st.formLabel}>Source URL</label>
                  <input style={st.formInput} value={form.source_url || ""} onChange={(e) => setForm((f) => ({ ...f, source_url: e.target.value }))} placeholder="https://..." />
                </div>
              </div>

              {/* Tags */}
              <div style={st.formGroup as React.CSSProperties}>
                <label style={st.formLabel}>Tags</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input style={{ ...st.formInput, flex: 1 }} value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }} placeholder="e.g. commonly confused, idiom, must remember" />
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
              <button onClick={handleSave} disabled={saving || !form.title.trim() || !form.content.trim()} style={{ ...st.btnGold, opacity: saving || !form.title.trim() || !form.content.trim() ? 0.35 : 1 }}>
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
      @keyframes kbFadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes kbSlideUp { from { opacity: 0; transform: translateY(30px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
      @keyframes kbFadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes kbSpin { to { transform: rotate(360deg); } }
      .kbCard { transition: border-color 0.25s ease; }
      .kbCard:hover { border-color: hsl(0,0%,30%) !important; }
      .kbCardBtn { transition: opacity 0.2s ease, transform 0.15s ease; }
      .kbCardBtn:hover { transform: scale(1.15); }
      select option { background: hsl(240,2%,13%); color: hsl(0,0%,98%); }
      @media (max-width: 680px) { .kbStatsGrid { grid-template-columns: repeat(2, 1fr) !important; } }
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
    padding: 20, animation: "kbFadeIn 0.2s ease",
  },
  modal: {
    background: T.surface, borderRadius: T.radius, borderWidth: 1, borderStyle: "solid", borderColor: T.jet,
    width: "100%", maxWidth: 620, maxHeight: "90vh", overflow: "hidden",
    display: "flex", flexDirection: "column", boxShadow: "0 30px 80px hsla(0,0%,0%,0.5)",
    animation: "kbSlideUp 0.3s ease",
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