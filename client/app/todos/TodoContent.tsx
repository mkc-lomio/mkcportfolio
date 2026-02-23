"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Todo,
  TodoPriority,
  TodoStatus,
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
} from "../../lib/supabase.service";

/* ============================================================
   THEME  (matches portfolio globals)
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

const ALL_PRIORITIES: TodoPriority[] = ["Low", "Medium", "High", "Urgent"];
const ALL_STATUSES: TodoStatus[] = ["Pending", "In Progress", "Done"];

const priorityConfig: Record<TodoPriority, { icon: string; color: string; bg: string }> = {
  Low:    { icon: "🟢", color: "#4ade80", bg: "rgba(74,222,128,0.12)" },
  Medium: { icon: "🟡", color: "#fbbf24", bg: "rgba(251,191,36,0.12)" },
  High:   { icon: "🟠", color: "#fb923c", bg: "rgba(251,146,60,0.12)" },
  Urgent: { icon: "🔴", color: "#f87171", bg: "rgba(248,113,113,0.12)" },
};

const statusConfig: Record<TodoStatus, { icon: string; color: string; bg: string }> = {
  "Pending":     { icon: "⏳", color: "#94a3b8", bg: "rgba(148,163,184,0.12)" },
  "In Progress": { icon: "🔄", color: "#60a5fa", bg: "rgba(96,165,250,0.12)" },
  "Done":        { icon: "✅", color: "#4ade80", bg: "rgba(74,222,128,0.12)" },
};

const EMPTY_FORM: Omit<Todo, "id" | "created_at" | "updated_at"> = {
  title: "", description: "", priority: "Medium", status: "Pending",
  due_date: "", tags: [],
};

/* ============================================================
   MAIN COMPONENT
   ============================================================ */

export default function TodoContent() {
  const [items, setItems] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<TodoPriority | "All">("All");
  const [statusFilter, setStatusFilter] = useState<TodoStatus | "All">("All");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const formRef = useRef<HTMLDivElement>(null);

  /* ---- fetch ---- */
  const load = useCallback(async () => {
    try { setLoading(true); setError(null); setItems(await getTodos()); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : "Failed to load todos"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  /* ---- filters ---- */
  const filtered = items.filter((t) => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) &&
        !(t.description || "").toLowerCase().includes(search.toLowerCase()) &&
        !(t.tags || []).some(tag => tag.toLowerCase().includes(search.toLowerCase()))) return false;
    if (priorityFilter !== "All" && t.priority !== priorityFilter) return false;
    if (statusFilter !== "All" && t.status !== statusFilter) return false;
    return true;
  });

  /* ---- form helpers ---- */
  const openCreate = () => { setForm(EMPTY_FORM); setEditingId(null); setTagInput(""); setShowForm(true); setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth" }), 100); };
  const openEdit = (t: Todo) => {
    setForm({ title: t.title, description: t.description || "", priority: t.priority, status: t.status, due_date: t.due_date || "", tags: t.tags || [] });
    setEditingId(t.id!); setTagInput(""); setShowForm(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };
  const cancelForm = () => { setShowForm(false); setEditingId(null); setForm(EMPTY_FORM); };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !(form.tags || []).includes(tag)) { setForm({ ...form, tags: [...(form.tags || []), tag] }); }
    setTagInput("");
  };
  const removeTag = (tag: string) => { setForm({ ...form, tags: (form.tags || []).filter(t => t !== tag) }); };

  /* ---- CRUD ---- */
  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const payload = { ...form, due_date: form.due_date || undefined, description: form.description || undefined };
      if (editingId) { await updateTodo(editingId, payload); } else { await createTodo(payload); }
      cancelForm(); await load();
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Failed to save"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    try { await deleteTodo(id); setDeleteConfirm(null); await load(); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : "Failed to delete"); }
  };

  const quickStatus = async (t: Todo, newStatus: TodoStatus) => {
    try { await updateTodo(t.id!, { status: newStatus }); await load(); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : "Failed to update"); }
  };

  /* ---- stats ---- */
  const stats = {
    total: items.length,
    pending: items.filter(t => t.status === "Pending").length,
    inProgress: items.filter(t => t.status === "In Progress").length,
    done: items.filter(t => t.status === "Done").length,
    urgent: items.filter(t => t.priority === "Urgent" && t.status !== "Done").length,
  };

  const overdue = (d?: string) => {
    if (!d) return false;
    return new Date(d) < new Date(new Date().toDateString());
  };

  /* ============================================================
     RENDER
     ============================================================ */

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: T.font, color: T.white2, padding: "24px 16px", boxSizing: "border-box" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>

        {/* ---- HEADER ---- */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <a href="/?code=mkc" style={{ color: T.grayDim, fontSize: 13, textDecoration: "none", display: "flex", alignItems: "center", gap: 4, transition: T.transition }}
                onMouseEnter={e => (e.currentTarget.style.color = T.gold)} onMouseLeave={e => (e.currentTarget.style.color = T.grayDim)}>
                ← Portfolio
              </a>
              <span style={{ color: T.jet }}>|</span>
              <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0, background: `linear-gradient(to right, ${T.gold}, ${T.goldDim})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                📋 Todo List
              </h1>
            </div>
            <p style={{ color: T.grayDim, fontSize: 13, margin: "4px 0 0 0" }}>Personal task manager</p>
          </div>
          <button onClick={openCreate} style={btnStyle(T.gold, "transparent", T.gold)}>
            + New Task
          </button>
        </div>

        {/* ---- STATS ---- */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10, marginBottom: 20 }}>
          {[
            { label: "Total", value: stats.total, color: T.gray },
            { label: "Pending", value: stats.pending, color: "#94a3b8" },
            { label: "In Progress", value: stats.inProgress, color: "#60a5fa" },
            { label: "Done", value: stats.done, color: "#4ade80" },
            { label: "Urgent", value: stats.urgent, color: "#f87171" },
          ].map(s => (
            <div key={s.label} style={{ background: T.surface, borderRadius: T.radius, padding: "14px 16px", border: `1px solid ${T.jet}` }}>
              <div style={{ fontSize: 22, fontWeight: 600, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: T.grayDim, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ---- ERROR ---- */}
        {error && (
          <div style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: T.radius, padding: "12px 16px", marginBottom: 16, color: "#f87171", fontSize: 13, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>{error}</span>
            <button onClick={() => setError(null)} style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: 16 }}>✕</button>
          </div>
        )}

        {/* ---- FILTERS ---- */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
          <input
            placeholder="Search tasks..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={inputStyle()}
          />
          <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value as TodoPriority | "All")} style={selectStyle()}>
            <option value="All">All Priorities</option>
            {ALL_PRIORITIES.map(p => <option key={p} value={p}>{priorityConfig[p].icon} {p}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as TodoStatus | "All")} style={selectStyle()}>
            <option value="All">All Statuses</option>
            {ALL_STATUSES.map(s => <option key={s} value={s}>{statusConfig[s].icon} {s}</option>)}
          </select>
        </div>

        {/* ---- FORM ---- */}
        {showForm && (
          <div ref={formRef} style={{ background: T.surface, borderRadius: T.radius, border: `1px solid ${T.jet}`, padding: 24, marginBottom: 24, boxShadow: T.shadow }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: 16, fontWeight: 600, color: T.gold }}>
              {editingId ? "Edit Task" : "New Task"}
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Title */}
              <div>
                <label style={labelStyle}>Title *</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="What needs to be done?" style={inputStyle("100%")} />
              </div>

              {/* Description */}
              <div>
                <label style={labelStyle}>Description</label>
                <textarea value={form.description || ""} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Add details..." rows={3}
                  style={{ ...inputStyle("100%"), resize: "vertical", minHeight: 70 } as React.CSSProperties} />
              </div>

              {/* Priority + Status + Due Date row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Priority</label>
                  <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as TodoPriority })} style={selectStyle("100%")}>
                    {ALL_PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as TodoStatus })} style={selectStyle("100%")}>
                    {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Due Date</label>
                  <input type="date" value={form.due_date || ""} onChange={e => setForm({ ...form, due_date: e.target.value })} style={inputStyle("100%")} />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label style={labelStyle}>Tags</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                    placeholder="Add a tag..." style={inputStyle("1")} />
                  <button onClick={addTag} style={btnStyle(T.gold, "transparent", T.gold, 10)}>Add</button>
                </div>
                {(form.tags || []).length > 0 && (
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                    {(form.tags || []).map(tag => (
                      <span key={tag} style={{ background: "rgba(251,191,36,0.12)", color: T.gold, padding: "3px 10px", borderRadius: 20, fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
                        {tag}
                        <button onClick={() => removeTag(tag)} style={{ background: "none", border: "none", color: T.gold, cursor: "pointer", fontSize: 14, lineHeight: 1, padding: 0 }}>×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
                <button onClick={cancelForm} style={btnStyle(T.gray, "transparent", T.jet)}>Cancel</button>
                <button onClick={handleSave} disabled={saving || !form.title.trim()}
                  style={{ ...btnStyle(T.bg, T.gold, T.gold), opacity: saving || !form.title.trim() ? 0.5 : 1 }}>
                  {saving ? "Saving..." : editingId ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ---- LOADING ---- */}
        {loading && (
          <div style={{ textAlign: "center", padding: 60, color: T.grayDim, fontSize: 14 }}>
            Loading tasks...
          </div>
        )}

        {/* ---- EMPTY ---- */}
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: 60, color: T.grayDim }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📝</div>
            <div style={{ fontSize: 15, fontWeight: 500 }}>
              {items.length === 0 ? "No tasks yet" : "No matching tasks"}
            </div>
            <div style={{ fontSize: 13, marginTop: 6 }}>
              {items.length === 0 ? "Click \"+ New Task\" to get started" : "Try adjusting your filters"}
            </div>
          </div>
        )}

        {/* ---- TODO LIST ---- */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map(t => {
            const pc = priorityConfig[t.priority];
            const sc = statusConfig[t.status];
            const isOverdue = t.status !== "Done" && overdue(t.due_date);
            const isDone = t.status === "Done";

            return (
              <div key={t.id} style={{
                background: T.surface, borderRadius: T.radius, border: `1px solid ${isOverdue ? "rgba(248,113,113,0.4)" : T.jet}`,
                padding: "16px 20px", transition: T.transition, opacity: isDone ? 0.65 : 1,
                boxShadow: isOverdue ? "0 0 12px rgba(248,113,113,0.08)" : "none",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                  {/* Left */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 16, fontWeight: 600, color: isDone ? T.grayDim : T.white1, textDecoration: isDone ? "line-through" : "none" }}>
                        {t.title}
                      </span>
                      <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 500, color: pc.color, background: pc.bg }}>
                        {pc.icon} {t.priority}
                      </span>
                      <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 500, color: sc.color, background: sc.bg }}>
                        {sc.icon} {t.status}
                      </span>
                      {isOverdue && (
                        <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 500, color: "#f87171", background: "rgba(248,113,113,0.12)" }}>
                          ⚠️ Overdue
                        </span>
                      )}
                    </div>

                    {t.description && (
                      <p style={{ margin: "6px 0 0", fontSize: 13, color: T.gray70, lineHeight: 1.5 }}>{t.description}</p>
                    )}

                    <div style={{ display: "flex", gap: 10, marginTop: 8, alignItems: "center", flexWrap: "wrap" }}>
                      {t.due_date && (
                        <span style={{ fontSize: 12, color: isOverdue ? "#f87171" : T.grayDim }}>
                          📅 {new Date(t.due_date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      )}
                      {(t.tags || []).map(tag => (
                        <span key={tag} style={{ background: "rgba(251,191,36,0.08)", color: T.goldDim, padding: "2px 8px", borderRadius: 20, fontSize: 11 }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Right actions */}
                  <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
                    {/* Quick status buttons */}
                    {t.status !== "Done" && (
                      <button onClick={() => quickStatus(t, t.status === "Pending" ? "In Progress" : "Done")}
                        title={t.status === "Pending" ? "Start" : "Complete"}
                        style={iconBtnStyle(sc.color)}>
                        {t.status === "Pending" ? "▶" : "✓"}
                      </button>
                    )}
                    {t.status === "Done" && (
                      <button onClick={() => quickStatus(t, "Pending")} title="Reopen" style={iconBtnStyle("#94a3b8")}>↩</button>
                    )}
                    <button onClick={() => openEdit(t)} title="Edit" style={iconBtnStyle(T.gold)}>✎</button>

                    {deleteConfirm === t.id ? (
                      <div style={{ display: "flex", gap: 4 }}>
                        <button onClick={() => handleDelete(t.id!)} style={iconBtnStyle("#f87171")}>✓</button>
                        <button onClick={() => setDeleteConfirm(null)} style={iconBtnStyle(T.grayDim)}>✕</button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteConfirm(t.id!)} title="Delete" style={iconBtnStyle("#f87171")}>🗑</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ---- FOOTER ---- */}
        <div style={{ textAlign: "center", padding: "32px 0 16px", color: T.jet, fontSize: 12 }}>
          MKC Todo · {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   STYLE HELPERS
   ============================================================ */

function btnStyle(color: string, bg: string, border: string, pad = 12): React.CSSProperties {
  return {
    padding: `8px ${pad}px`, background: bg, color, border: `1px solid ${border}`,
    borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 500,
    fontFamily: T.font, transition: T.transition, whiteSpace: "nowrap",
  };
}

function iconBtnStyle(color: string): React.CSSProperties {
  return {
    width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
    background: "transparent", border: `1px solid ${T.jet}`, borderRadius: 8,
    color, cursor: "pointer", fontSize: 14, transition: T.transition, padding: 0,
  };
}

function inputStyle(width?: string): React.CSSProperties {
  return {
    flex: width === "1" ? 1 : undefined, width: width && width !== "1" ? width : undefined,
    padding: "10px 14px", background: T.surface2, border: `1px solid ${T.jet}`,
    borderRadius: 10, color: T.white2, fontSize: 13, fontFamily: T.font,
    outline: "none", boxSizing: "border-box",
  };
}

function selectStyle(width?: string): React.CSSProperties {
  return {
    ...inputStyle(width), cursor: "pointer", minWidth: width ? undefined : 140,
  };
}

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 12, fontWeight: 500, color: T.gray70,
  marginBottom: 6, fontFamily: T.font,
};
