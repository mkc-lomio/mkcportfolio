"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  JobApplication,
  ApplicationStatus,
  getApplications,
  createApplication,
  updateApplication,
  deleteApplication,
} from "../../lib/supabase.service";

/* ============================================================
   THEME — matches portfolio globals.css
   ============================================================ */

const T = {
  bg:         "hsl(0, 0%, 7%)",
  surface:    "hsl(240, 2%, 13%)",
  surface2:   "hsl(240, 2%, 12%)",
  card:       "hsl(240, 1%, 17%)",
  jet:        "hsl(0, 0%, 22%)",
  border:     "hsl(0, 0%, 25%)",
  gold:       "hsl(45, 100%, 72%)",
  goldDim:    "hsl(45, 54%, 58%)",
  white1:     "hsl(0, 0%, 100%)",
  white2:     "hsl(0, 0%, 98%)",
  gray:       "hsl(0, 0%, 84%)",
  gray70:     "hsla(0, 0%, 84%, 0.7)",
  grayDim:    "hsl(0, 0%, 55%)",
  font:       "'Poppins', sans-serif",
  radius:     14,
  shadow:     "0 16px 30px hsla(0, 0%, 0%, 0.25)",
  transition: "0.25s ease",
};

/* ============================================================
   STATUS CONFIG
   ============================================================ */

const ALL_STATUSES: ApplicationStatus[] = [
  "Applied", "Screening", "Interview", "Technical", "Offer", "Accepted", "Rejected", "Withdrawn", "Ghosted",
];

const statusConfig: Record<ApplicationStatus, { bg: string; color: string; icon: string }> = {
  Applied:    { bg: "rgba(96,165,250,0.12)",  color: "#60a5fa", icon: "📤" },
  Screening:  { bg: "rgba(251,191,36,0.12)",  color: "#fbbf24", icon: "🔍" },
  Interview:  { bg: "rgba(129,140,248,0.12)", color: "#818cf8", icon: "🎤" },
  Technical:  { bg: "rgba(192,132,252,0.12)", color: "#c084fc", icon: "💻" },
  Offer:      { bg: "rgba(74,222,128,0.12)",  color: "#4ade80", icon: "🎉" },
  Accepted:   { bg: "rgba(52,211,153,0.15)",  color: "#34d399", icon: "✅" },
  Rejected:   { bg: "rgba(248,113,113,0.12)", color: "#f87171", icon: "❌" },
  Withdrawn:  { bg: "rgba(156,163,175,0.1)",  color: "#9ca3af", icon: "🚪" },
  Ghosted:    { bg: "rgba(107,114,128,0.1)",  color: "#6b7280", icon: "👻" },
};

const EMPTY_FORM: Omit<JobApplication, "id" | "created_at" | "updated_at"> = {
  company: "", position: "", date_applied: new Date().toISOString().slice(0, 10),
  status: "Applied", salary_range: "", location: "", job_url: "", notes: "", interview_dates: [],
};

/* ============================================================
   MAIN COMPONENT
   ============================================================ */

export default function ApplicationsContent() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "All">("All");
  const [sortBy, setSortBy] = useState<"date_applied" | "company" | "status">("date_applied");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<JobApplication | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [interviewInput, setInterviewInput] = useState("");

  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [detailApp, setDetailApp] = useState<JobApplication | null>(null);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [quickStatusId, setQuickStatusId] = useState<number | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const quickStatusRef = useRef<HTMLDivElement>(null);

  /* ---- Close quick status dropdown on outside click ---- */
  useEffect(() => {
    if (!quickStatusId) return;
    const handleClick = (e: MouseEvent) => {
      if (quickStatusRef.current && !quickStatusRef.current.contains(e.target as Node)) setQuickStatusId(null);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [quickStatusId]);

  /* ---- DATA ---- */
  const fetchApps = useCallback(async () => {
    try { setLoading(true); setError(null); setApplications(await getApplications()); }
    catch (err: unknown) { setError(err instanceof Error ? err.message : "Failed to load"); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { fetchApps(); }, [fetchApps]);

  const filtered = applications
    .filter((a) => {
      if (statusFilter !== "All" && a.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return a.company.toLowerCase().includes(q) || a.position.toLowerCase().includes(q) || (a.location || "").toLowerCase().includes(q) || (a.notes || "").toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortBy === "date_applied") cmp = (a.date_applied || "").localeCompare(b.date_applied || "");
      else if (sortBy === "company") cmp = a.company.localeCompare(b.company);
      else if (sortBy === "status") cmp = ALL_STATUSES.indexOf(a.status) - ALL_STATUSES.indexOf(b.status);
      return sortDir === "desc" ? -cmp : cmp;
    });

  const stats = {
    total: applications.length,
    active: applications.filter((a) => !["Rejected", "Withdrawn", "Ghosted", "Accepted"].includes(a.status)).length,
    interviews: applications.filter((a) => ["Interview", "Technical"].includes(a.status)).length,
    offers: applications.filter((a) => ["Offer", "Accepted"].includes(a.status)).length,
  };

  /* ---- HANDLERS ---- */
  const openCreate = () => { setEditingApp(null); setForm({ ...EMPTY_FORM, date_applied: new Date().toISOString().slice(0, 10) }); setInterviewInput(""); setModalOpen(true); };
  const openEdit = (app: JobApplication) => {
    setEditingApp(app);
    setForm({ company: app.company, position: app.position, date_applied: app.date_applied, status: app.status, salary_range: app.salary_range || "", location: app.location || "", job_url: app.job_url || "", notes: app.notes || "", interview_dates: app.interview_dates || [] });
    setInterviewInput(""); setModalOpen(true);
  };
  const closeModal = () => { setModalOpen(false); setEditingApp(null); setForm(EMPTY_FORM); };

  const handleSave = async () => {
    if (!form.company.trim() || !form.position.trim()) return;
    try { setSaving(true); if (editingApp?.id) await updateApplication(editingApp.id, form); else await createApplication(form); closeModal(); await fetchApps(); }
    catch (err: unknown) { setError(err instanceof Error ? err.message : "Failed to save"); }
    finally { setSaving(false); }
  };
  const handleDelete = async (id: number) => {
    try { setDeleting(true); await deleteApplication(id); setDeleteConfirm(null); setDetailApp(null); await fetchApps(); }
    catch (err: unknown) { setError(err instanceof Error ? err.message : "Failed to delete"); }
    finally { setDeleting(false); }
  };
  const addInterviewDate = () => { if (interviewInput) { setForm((f) => ({ ...f, interview_dates: [...(f.interview_dates || []), interviewInput] })); setInterviewInput(""); } };
  const removeInterviewDate = (idx: number) => { setForm((f) => ({ ...f, interview_dates: (f.interview_dates || []).filter((_, i) => i !== idx) })); };
  const toggleSort = (field: typeof sortBy) => { if (sortBy === field) setSortDir((d) => d === "asc" ? "desc" : "asc"); else { setSortBy(field); setSortDir("desc"); } };

  const exportCSV = () => {
    if (filtered.length === 0) return;
    const headers = ["Company", "Position", "Status", "Date Applied", "Location", "Salary Range", "Job URL", "Interview Dates", "Notes"];
    const escapeCSV = (val: string) => { if (val.includes(",") || val.includes('"') || val.includes("\n")) return `"${val.replace(/"/g, '""')}"`; return val; };
    const rows = filtered.map((a) => [
      escapeCSV(a.company), escapeCSV(a.position), a.status, a.date_applied,
      escapeCSV(a.location || ""), escapeCSV(a.salary_range || ""), escapeCSV(a.job_url || ""),
      escapeCSV((a.interview_dates || []).join("; ")), escapeCSV(a.notes || ""),
    ].join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `job-applications-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const handleQuickStatus = async (appId: number, newStatus: ApplicationStatus) => {
    try {
      await updateApplication(appId, { status: newStatus });
      setQuickStatusId(null);
      await fetchApps();
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Failed to update status"); }
  };

  const formatDate = (d: string) => { try { return new Date(d + "T00:00:00").toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }); } catch { return d; } };
  const daysSince = (d: string) => { const diff = Math.floor((Date.now() - new Date(d + "T00:00:00").getTime()) / 86400000); if (diff === 0) return "Today"; if (diff === 1) return "Yesterday"; return `${diff}d ago`; };

  /* ============================================================
     DETAIL VIEW
     ============================================================ */
  if (detailApp) {
    const sc = statusConfig[detailApp.status];
    return (
      <div style={st.page}>
        <CSS />
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "40px 20px 100px" }}>
          <button onClick={() => setDetailApp(null)} style={st.goldLink}>
            <span style={{ marginRight: 6, fontSize: 11 }}>◂</span> Back to Applications
          </button>

          <div style={{ ...st.card, marginTop: 20, padding: 0, overflow: "hidden" }}>
            <div style={{ height: 3, background: `linear-gradient(to right, ${T.gold}, ${T.goldDim})` }} />
            <div style={{ padding: "28px 28px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" as const, marginBottom: 20 }}>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 600, color: T.white2, margin: "0 0 4px", fontFamily: T.font }}>{detailApp.position}</h2>
                  <div style={{ fontSize: 15, color: T.gold, fontWeight: 500 }}>{detailApp.company}</div>
                </div>
                <span style={{ ...st.badge, background: sc.bg, color: sc.color, fontSize: 13, padding: "5px 14px" }}>{sc.icon} {detailApp.status}</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 20, margin: "24px 0", padding: "20px 0", borderTop: `1px solid ${T.jet}`, borderBottom: `1px solid ${T.jet}` }}>
                <DetailField label="Date Applied" value={formatDate(detailApp.date_applied)} sub={daysSince(detailApp.date_applied)} />
                {detailApp.location && <DetailField label="Location" value={detailApp.location} />}
                {detailApp.salary_range && <DetailField label="Salary Range" value={detailApp.salary_range} />}
              </div>

              {detailApp.job_url && (
                <div style={{ margin: "16px 0" }}>
                  <div style={st.fieldLabel}>Job URL</div>
                  <a href={detailApp.job_url} target="_blank" rel="noopener noreferrer" style={{ color: T.gold, fontSize: 13, wordBreak: "break-all" as const, textDecoration: "none" }}>{detailApp.job_url}</a>
                </div>
              )}

              {detailApp.interview_dates && detailApp.interview_dates.length > 0 && (
                <div style={{ margin: "16px 0" }}>
                  <div style={st.fieldLabel}>Interview Dates</div>
                  <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8 }}>
                    {detailApp.interview_dates.map((d, i) => (
                      <span key={i} style={{ fontSize: 12, padding: "4px 12px", borderRadius: 8, background: "rgba(251,191,36,0.1)", color: T.gold, fontWeight: 500, fontFamily: T.font }}>{formatDate(d)}</span>
                    ))}
                  </div>
                </div>
              )}

              {detailApp.notes && (
                <div style={{ margin: "16px 0" }}>
                  <div style={st.fieldLabel}>Notes</div>
                  <div style={{ fontSize: 14, color: T.gray70, lineHeight: 1.7, whiteSpace: "pre-wrap" as const }}>{detailApp.notes}</div>
                </div>
              )}

              <div style={{ display: "flex", gap: 10, marginTop: 28, paddingTop: 20, borderTop: `1px solid ${T.jet}` }}>
                <button onClick={() => openEdit(detailApp)} style={st.btnGold}>Edit</button>
                {deleteConfirm === detailApp.id ? (
                  <>
                    <span style={{ fontSize: 13, color: "#f87171", alignSelf: "center", fontFamily: T.font }}>Confirm delete?</span>
                    <button onClick={() => handleDelete(detailApp.id!)} disabled={deleting} style={{ ...st.btnDanger, opacity: deleting ? 0.5 : 1 }}>{deleting ? "..." : "Yes"}</button>
                    <button onClick={() => setDeleteConfirm(null)} style={st.btnGhost}>No</button>
                  </>
                ) : (
                  <button onClick={() => setDeleteConfirm(detailApp.id!)} style={st.btnDanger}>Delete</button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ============================================================
     MAIN VIEW
     ============================================================ */
  return (
    <div style={st.page}>
      <CSS />

      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "40px 20px 100px" }}>

        {/* HEADER */}
        <div style={{ animation: "appFadeUp 0.5s ease both", marginBottom: 32 }}>
          <a href="/" style={{ ...st.goldLink, marginBottom: 16, display: "inline-block", textDecoration: "none" }}>
            <span style={{ marginRight: 6, fontSize: 11 }}>◂</span> Portfolio
          </a>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap" as const, gap: 16 }}>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 600, color: T.white2, margin: 0, fontFamily: T.font }}>Job Applications</h1>
              <p style={{ fontSize: 14, color: T.grayDim, margin: "6px 0 0", fontFamily: T.font }}>Track and manage your job search progress</p>
            </div>
            <button onClick={openCreate} style={st.btnGold}>+ New Application</button>
          </div>
          {/* Export */}
          {applications.length > 0 && (
            <button onClick={exportCSV} style={{ ...st.btnGhost, padding: "6px 14px", fontSize: 12, marginTop: 12 }}>
              📥 Export CSV {statusFilter !== "All" ? `(${filtered.length} filtered)` : `(${applications.length})`}
            </button>
          )}
        </div>

        {/* STATS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 28, animation: "appFadeUp 0.5s ease 0.06s both" }} className="statsGrid">
          <StatCard label="Total" value={stats.total} accent={T.gold} />
          <StatCard label="Active" value={stats.active} accent="#60a5fa" />
          <StatCard label="Interviews" value={stats.interviews} accent="#818cf8" />
          <StatCard label="Offers" value={stats.offers} accent="#34d399" />
        </div>

        {/* ERROR */}
        {error && (
          <div style={{ background: "rgba(248,113,113,0.1)", borderWidth: 1, borderStyle: "solid", borderColor: "rgba(248,113,113,0.2)", color: "#f87171", padding: "10px 16px", borderRadius: T.radius, fontSize: 13, marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: T.font }}>
            <span>{error}</span>
            <button onClick={() => setError(null)} style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: 16 }}>✕</button>
          </div>
        )}

        {/* TOOLBAR */}
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 12, marginBottom: 28, animation: "appFadeUp 0.5s ease 0.12s both" }}>
          <div style={{ position: "relative" as const }}>
            <span style={{ position: "absolute" as const, left: 14, top: "50%", transform: "translateY(-50%)", color: T.grayDim, fontSize: 14, pointerEvents: "none" as const }}>⌕</span>
            <input type="text" placeholder="Search company, position, location..." value={search} onChange={(e) => setSearch(e.target.value)} style={st.searchInput} />
            {search && <button onClick={() => setSearch("")} style={{ position: "absolute" as const, right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: T.grayDim, cursor: "pointer", fontSize: 14 }}>✕</button>}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" as const, gap: 10 }}>
            <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6 }}>
              <button onClick={() => setStatusFilter("All")} style={{ ...st.pill, ...(statusFilter === "All" ? st.pillActive : {}) }}>All ({applications.length})</button>
              {ALL_STATUSES.map((s) => {
                const count = applications.filter((a) => a.status === s).length;
                if (count === 0) return null;
                const sc = statusConfig[s];
                return <button key={s} onClick={() => setStatusFilter(statusFilter === s ? "All" : s)} style={{ ...st.pill, ...(statusFilter === s ? { background: sc.bg, color: sc.color, borderColor: "transparent" } : {}) }}>{sc.icon} {s} ({count})</button>;
              })}
            </div>
            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
              <span style={{ fontSize: 11, color: T.grayDim, marginRight: 4, fontFamily: T.font }}>Sort</span>
              {(["date_applied", "company", "status"] as const).map((f) => (
                <button key={f} onClick={() => toggleSort(f)} style={{ ...st.sortChip, ...(sortBy === f ? { color: T.gold } : {}) }}>
                  {f === "date_applied" ? "Date" : f === "company" ? "Company" : "Status"}
                  {sortBy === f && <span style={{ marginLeft: 3 }}>{sortDir === "desc" ? "↓" : "↑"}</span>}
                </button>
              ))}
              <div style={{ width: 1, height: 16, background: T.jet, margin: "0 6px" }} />
              <button onClick={() => setViewMode("cards")} style={{ ...st.viewToggle, ...(viewMode === "cards" ? st.viewToggleActive : {}) }} title="Card view">▦</button>
              <button onClick={() => setViewMode("table")} style={{ ...st.viewToggle, ...(viewMode === "table" ? st.viewToggleActive : {}) }} title="Table view">☰</button>
            </div>
          </div>
        </div>

        {/* CARDS */}
        {loading ? (
          <div style={{ textAlign: "center" as const, padding: 80, color: T.grayDim, fontFamily: T.font }}>
            <div style={{ width: 28, height: 28, borderWidth: 2, borderStyle: "solid", borderColor: T.jet, borderTopColor: T.gold, borderRadius: "50%", margin: "0 auto 16px", animation: "appSpin 0.8s linear infinite" }} />
            Loading applications...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center" as const, padding: 80 }}>
            <div style={{ fontSize: 48, marginBottom: 16, filter: "grayscale(0.3)" }}>📋</div>
            <div style={{ color: T.grayDim, marginBottom: 16, fontFamily: T.font, fontSize: 15 }}>
              {applications.length === 0 ? "No applications yet" : "No matching applications"}
            </div>
            {applications.length > 0 && (
              <button onClick={() => { setSearch(""); setStatusFilter("All"); }} style={st.btnGhost}>Clear filters</button>
            )}
          </div>
        ) : (
          viewMode === "cards" ? (
          /* ---- CARD VIEW ---- */
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))", gap: 16 }}>
            {filtered.map((app, idx) => {
              const sc = statusConfig[app.status];
              return (
                <div key={app.id} className="appCard" onClick={() => setDetailApp(app)}
                  style={{ ...st.card, padding: 0, overflow: "hidden", cursor: "pointer", animation: `appFadeUp 0.35s ease ${0.03 * idx}s both` }}>
                  <div style={{ height: 2, background: sc.color, opacity: 0.6 }} />
                  <div style={{ padding: "18px 20px 16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 12 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 15, fontWeight: 600, color: T.white2, lineHeight: 1.3, fontFamily: T.font }}>{app.company}</div>
                        <div style={{ fontSize: 13, color: T.gray70, marginTop: 3, fontFamily: T.font }}>{app.position}</div>
                      </div>
                      {/* Quick status change */}
                      <div style={{ position: "relative" as const }} onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setQuickStatusId(quickStatusId === app.id ? null : app.id!)}
                          style={{ ...st.badge, background: sc.bg, color: sc.color, cursor: "pointer", border: "none", transition: T.transition }}
                          title="Click to change status"
                        >{sc.icon} {app.status} ▾</button>
                        {quickStatusId === app.id && (
                          <div ref={quickStatusRef} style={st.quickDropdown}>
                            {ALL_STATUSES.map((s) => {
                              const ssc = statusConfig[s];
                              return (
                                <button
                                  key={s}
                                  onClick={() => handleQuickStatus(app.id!, s)}
                                  className="quickStatusItem"
                                  style={{ ...st.quickDropdownItem, ...(s === app.status ? { background: ssc.bg, color: ssc.color } : {}) }}
                                >{ssc.icon} {s}</button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8, fontSize: 12, color: T.grayDim, marginBottom: 10, fontFamily: T.font }}>
                      <span>📅 {formatDate(app.date_applied)}</span>
                      {app.location && <span>📍 {app.location}</span>}
                      {app.salary_range && <span>💰 {app.salary_range}</span>}
                    </div>

                    {app.notes && (
                      <div style={{ fontSize: 12, color: T.grayDim, lineHeight: 1.5, marginBottom: 10, fontStyle: "italic", fontFamily: T.font }}>
                        {app.notes.length > 90 ? app.notes.slice(0, 90) + "..." : app.notes}
                      </div>
                    )}

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: `1px solid ${T.jet}` }}>
                      <span style={{ fontSize: 11, color: T.grayDim, fontFamily: T.font }}>{daysSince(app.date_applied)}</span>
                      <div style={{ display: "flex", gap: 2 }} onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => openEdit(app)} className="cardBtn" style={st.iconBtn} title="Edit">✏️</button>
                        {deleteConfirm === app.id ? (
                          <>
                            <button onClick={() => handleDelete(app.id!)} disabled={deleting} className="cardBtn" style={{ ...st.iconBtn, color: "#f87171" }}>✓</button>
                            <button onClick={() => setDeleteConfirm(null)} className="cardBtn" style={st.iconBtn}>✕</button>
                          </>
                        ) : (
                          <button onClick={() => setDeleteConfirm(app.id!)} className="cardBtn" style={st.iconBtn} title="Delete">🗑️</button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          ) : (
          /* ---- TABLE VIEW ---- */
          <div style={{ ...st.card, padding: 0, overflow: "hidden", animation: "appFadeUp 0.35s ease both" }}>
            <div style={{ overflowX: "auto" as const }}>
              <table style={st.table}>
                <thead>
                  <tr>
                    <th style={st.th}>Company</th>
                    <th style={st.th}>Position</th>
                    <th style={st.th}>Status</th>
                    <th style={st.th}>Date Applied</th>
                    <th style={st.th}>Location</th>
                    <th style={st.th}>Salary</th>
                    <th style={{ ...st.th, textAlign: "center" as const, width: 80 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((app, idx) => {
                    const sc = statusConfig[app.status];
                    return (
                      <tr key={app.id} className="tableRow" onClick={() => setDetailApp(app)}
                        style={{ cursor: "pointer", animation: `appFadeUp 0.25s ease ${0.02 * idx}s both` }}>
                        <td style={st.td}>
                          <div style={{ fontWeight: 600, color: T.white2, fontSize: 13 }}>{app.company}</div>
                        </td>
                        <td style={st.td}>
                          <div style={{ color: T.gray70, fontSize: 13 }}>{app.position}</div>
                        </td>
                        <td style={st.td} onClick={(e) => e.stopPropagation()}>
                          <div style={{ position: "relative" as const }}>
                            <button
                              onClick={() => setQuickStatusId(quickStatusId === app.id ? null : app.id!)}
                              style={{ ...st.badge, background: sc.bg, color: sc.color, fontSize: 10, padding: "2px 9px", cursor: "pointer", border: "none" }}
                              title="Click to change status"
                            >{sc.icon} {app.status} ▾</button>
                            {quickStatusId === app.id && (
                              <div ref={quickStatusRef} style={st.quickDropdown}>
                                {ALL_STATUSES.map((s) => {
                                  const ssc = statusConfig[s];
                                  return (
                                    <button key={s} onClick={() => handleQuickStatus(app.id!, s)} className="quickStatusItem"
                                      style={{ ...st.quickDropdownItem, ...(s === app.status ? { background: ssc.bg, color: ssc.color } : {}) }}
                                    >{ssc.icon} {s}</button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </td>
                        <td style={st.td}>
                          <div style={{ color: T.gray70, fontSize: 12 }}>{formatDate(app.date_applied)}</div>
                          <div style={{ color: T.grayDim, fontSize: 10 }}>{daysSince(app.date_applied)}</div>
                        </td>
                        <td style={st.td}>
                          <span style={{ color: T.grayDim, fontSize: 12 }}>{app.location || "—"}</span>
                        </td>
                        <td style={st.td}>
                          <span style={{ color: T.grayDim, fontSize: 12 }}>{app.salary_range || "—"}</span>
                        </td>
                        <td style={{ ...st.td, textAlign: "center" as const }} onClick={(e) => e.stopPropagation()}>
                          <div style={{ display: "flex", gap: 2, justifyContent: "center" }}>
                            <button onClick={() => openEdit(app)} className="cardBtn" style={st.iconBtn} title="Edit">✏️</button>
                            {deleteConfirm === app.id ? (
                              <>
                                <button onClick={() => handleDelete(app.id!)} disabled={deleting} className="cardBtn" style={{ ...st.iconBtn, color: "#f87171" }}>✓</button>
                                <button onClick={() => setDeleteConfirm(null)} className="cardBtn" style={st.iconBtn}>✕</button>
                              </>
                            ) : (
                              <button onClick={() => setDeleteConfirm(app.id!)} className="cardBtn" style={st.iconBtn} title="Delete">🗑️</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          )
        )}

        {/* ============================================================
           JOB SITES — Remote-Friendly for Filipino Developers
           ============================================================ */}
        <div style={{ marginTop: 48, animation: "appFadeUp 0.5s ease 0.2s both" }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: T.white2, margin: "0 0 6px", fontFamily: T.font }}>🌐 Remote Job Sites</h2>
          <p style={{ fontSize: 13, color: T.grayDim, margin: "0 0 18px", fontFamily: T.font }}>Curated list of platforms that hire Filipino developers remotely.</p>

          <div style={{ fontSize: 13, color: T.grayDim, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 10, fontFamily: T.font }}>Developer-Focused</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10, marginBottom: 24 }}>
            {([
              { name: "Arc.dev", url: "https://arc.dev", desc: "Built for developers. Connects you with US/EU startups & tech companies. High-paying remote roles." },
              { name: "Toptal", url: "https://toptal.com", desc: "Exclusive network for top-tier developers. Rigorous screening but pays well ($40-80+/hr)." },
              { name: "Turing", url: "https://turing.com", desc: "AI-matched remote dev jobs with US companies. Good for .NET/Angular profiles." },
              { name: "We Work Remotely", url: "https://weworkremotely.com", desc: "One of the largest remote job boards, strong in software engineering." },
              { name: "RemoteOK", url: "https://remoteok.com", desc: "Huge listing of remote dev roles, filterable by stack. Updated daily." },
              { name: "Wellfound", url: "https://wellfound.com", desc: "Formerly AngelList. Startups hire directly here — founders post roles, many don't care about location." },
              { name: "Stack Overflow Jobs", url: "https://stackoverflow.co/company/work-here", desc: "Connects devs with employers. Reputation scores and technical expertise on display." },
            ] as const).map((site) => (
              <a key={site.name} href={site.url} target="_blank" rel="noopener noreferrer" className="appCard"
                style={{ ...st.card, padding: "14px 18px", textDecoration: "none", display: "block" }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: T.gold, fontFamily: T.font, marginBottom: 4 }}>{site.name}</div>
                <div style={{ fontSize: 12, color: T.gray70, lineHeight: 1.5, fontFamily: T.font }}>{site.desc}</div>
              </a>
            ))}
          </div>

          <div style={{ fontSize: 13, color: T.grayDim, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 10, fontFamily: T.font }}>General Remote</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10, marginBottom: 24 }}>
            {([
              { name: "LinkedIn", url: "https://linkedin.com/jobs", desc: "Filter by \"Remote\" + Philippines. Many companies actively recruit Filipino devs." },
              { name: "FlexJobs", url: "https://flexjobs.com", desc: "Paid subscription but all listings are verified and scam-free." },
              { name: "Dynamite Jobs", url: "https://dynamitejobs.com", desc: "Curated remote roles, average $2.3k-$6.5k/month for PH-based workers." },
              { name: "Built In", url: "https://builtin.com/jobs/remote/as/philippines", desc: "Tech-focused, lists remote roles open to PH." },
              { name: "JustRemote", url: "https://justremote.co", desc: "Remote-first companies, easy to browse by category." },
              { name: "Glassdoor", url: "https://glassdoor.com", desc: "Job listings with salary insights, company reviews, and interview experiences." },
              { name: "Remote.co", url: "https://remote.co", desc: "Fully remote positions only. US/EU companies hiring worldwide — no location restriction." },
              { name: "Remote In Tech", url: "https://remoteintech.company", desc: "Directory of 850+ remote-friendly tech companies. Browse by region (380 worldwide) or tech stack." },
              { name: "Remotive", url: "https://remotive.com", desc: "Strictly remote jobs. No hybrid bait. Many companies hire outside US/EU without drama." },
              { name: "NoDesk", url: "https://nodesk.co", desc: "750+ remote companies. Hand-picked listings not found on larger boards. Quality over quantity." },
              { name: "Jobspresso", url: "https://jobspresso.co", desc: "Curated high-quality remote roles. Full-time focus from startups and SaaS companies." },
              { name: "DailyRemote", url: "https://dailyremote.com", desc: "Aggregates remote jobs from 2,000+ companies. Updated daily with email alerts." },
              { name: "Working Nomads", url: "https://workingnomads.com", desc: "Remote job aggregator for digital nomads. Organized by skill — dev, design, marketing, and more." },
              { name: "Remote100K", url: "https://remote100k.com", desc: "Premium board for remote jobs paying $100K+/year. Manually vetted listings." },
            ] as const).map((site) => (
              <a key={site.name} href={site.url} target="_blank" rel="noopener noreferrer" className="appCard"
                style={{ ...st.card, padding: "14px 18px", textDecoration: "none", display: "block" }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: T.gold, fontFamily: T.font, marginBottom: 4 }}>{site.name}</div>
                <div style={{ fontSize: 12, color: T.gray70, lineHeight: 1.5, fontFamily: T.font }}>{site.desc}</div>
              </a>
            ))}
          </div>

          <div style={{ fontSize: 13, color: T.grayDim, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 10, fontFamily: T.font }}>PH-Specific</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
            {([
              { name: "OnlineJobs.ph", url: "https://onlinejobs.ph", desc: "Largest PH remote marketplace. Lots of foreign employers (US/AU/UK). Good for long-term contracts." },
              { name: "JobStreet PH", url: "https://jobstreet.com.ph", desc: "Most widely used PH job board. Filter for remote/work-from-home across all industries." },
              { name: "Kalibrr", url: "https://kalibrr.com", desc: "Strong in tech, digital, and startup roles. Growing remote listings." },
              { name: "Indeed PH", url: "https://ph.indeed.com", desc: "Aggregates jobs from multiple PH boards. Widest search coverage, filter by remote." },
              { name: "Bossjob", url: "https://bossjob.ph", desc: "AI-powered matching. Strong in IT & engineering. Direct chat with recruiters." },
              { name: "BruntWork", url: "https://bruntwork.co", desc: "Remote & offshore staffing. Connects Filipino pros with US/AU/NZ clients. Competitive pay." },
              { name: "Remote Staff", url: "https://remotestaff.ph", desc: "18+ years in remote work. 100% WFH roles with international clients. HMO from Day 1." },
              { name: "RemoteWork.ph", url: "https://remotework.ph", desc: "Direct hiring — no agency fees or markups. Hire and pay talent directly." },
              { name: "Jora PH", url: "https://ph.jora.com", desc: "Part of SEEK group. Aggregates 150K+ job ads from multiple PH boards." },
              { name: "Foundit", url: "https://www.foundit.com.ph", desc: "Formerly Monster. Global job platform with PH listings across IT, BPO, and engineering." },
            ] as const).map((site) => (
              <a key={site.name} href={site.url} target="_blank" rel="noopener noreferrer" className="appCard"
                style={{ ...st.card, padding: "14px 18px", textDecoration: "none", display: "block" }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: T.gold, fontFamily: T.font, marginBottom: 4 }}>{site.name}</div>
                <div style={{ fontSize: 12, color: T.gray70, lineHeight: 1.5, fontFamily: T.font }}>{site.desc}</div>
              </a>
            ))}
          </div>
        </div>
      </div>
      {modalOpen && (
        <div style={st.overlay} onClick={closeModal}>
          <div ref={modalRef} style={st.modal} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: `1px solid ${T.jet}` }}>
              <h2 style={{ fontSize: 17, fontWeight: 600, color: T.white2, margin: 0, fontFamily: T.font }}>{editingApp ? "Edit Application" : "New Application"}</h2>
              <button onClick={closeModal} style={{ background: "none", border: "none", fontSize: 18, color: T.grayDim, cursor: "pointer", padding: "4px" }}>✕</button>
            </div>

            <div style={{ padding: "20px 24px", overflowY: "auto" as const, flex: 1, display: "flex", flexDirection: "column" as const, gap: 16 }}>
              <div style={st.formRow}>
                <FormField label="Company *" value={form.company} onChange={(v) => setForm((f) => ({ ...f, company: v }))} placeholder="e.g. Atlassian" />
                <FormField label="Position *" value={form.position} onChange={(v) => setForm((f) => ({ ...f, position: v }))} placeholder="e.g. Senior Software Engineer" />
              </div>

              <div style={st.formRow}>
                <div style={st.formGroup}>
                  <label style={st.formLabel}>Date Applied</label>
                  <input type="date" style={st.formInput} value={form.date_applied} onChange={(e) => setForm((f) => ({ ...f, date_applied: e.target.value }))} />
                </div>
                <div style={st.formGroup}>
                  <label style={st.formLabel}>Status</label>
                  <select style={st.formInput} value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as ApplicationStatus }))}>
                    {ALL_STATUSES.map((s) => <option key={s} value={s}>{statusConfig[s].icon} {s}</option>)}
                  </select>
                </div>
              </div>

              <div style={st.formRow}>
                <FormField label="Location" value={form.location || ""} onChange={(v) => setForm((f) => ({ ...f, location: v }))} placeholder="e.g. Brisbane, AU" />
                <FormField label="Salary Range" value={form.salary_range || ""} onChange={(v) => setForm((f) => ({ ...f, salary_range: v }))} placeholder="e.g. AUD 120k–150k" />
              </div>

              <FormField label="Job URL" value={form.job_url || ""} onChange={(v) => setForm((f) => ({ ...f, job_url: v }))} placeholder="https://..." />

              <div style={st.formGroup}>
                <label style={st.formLabel}>Interview Dates</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input type="date" style={{ ...st.formInput, flex: 1 }} value={interviewInput} onChange={(e) => setInterviewInput(e.target.value)} />
                  <button onClick={addInterviewDate} disabled={!interviewInput} style={{ ...st.btnGold, padding: "8px 16px", opacity: interviewInput ? 1 : 0.35 }}>Add</button>
                </div>
                {(form.interview_dates || []).length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6, marginTop: 10 }}>
                    {(form.interview_dates || []).map((d, i) => (
                      <span key={i} style={{ fontSize: 12, padding: "4px 12px", borderRadius: 8, background: "rgba(251,191,36,0.1)", color: T.gold, display: "flex", alignItems: "center", gap: 6, fontFamily: T.font }}>
                        {formatDate(d)}
                        <button onClick={() => removeInterviewDate(i)} style={{ background: "none", border: "none", color: T.grayDim, cursor: "pointer", fontSize: 11, padding: 0 }}>✕</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div style={st.formGroup}>
                <label style={st.formLabel}>Notes</label>
                <textarea style={{ ...st.formInput, minHeight: 80, resize: "vertical" as const, fontFamily: T.font }} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Recruiter contact, tech stack, interview prep..." />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, padding: "16px 24px", borderTop: `1px solid ${T.jet}` }}>
              <button onClick={closeModal} style={st.btnGhost}>Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.company.trim() || !form.position.trim()} style={{ ...st.btnGold, opacity: saving || !form.company.trim() || !form.position.trim() ? 0.35 : 1 }}>
                {saving ? "Saving..." : editingApp ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   SUB-COMPONENTS
   ============================================================ */

function StatCard({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div style={st.card}>
      <div style={{ fontSize: 28, fontWeight: 600, color: accent, fontFamily: T.font, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: T.grayDim, textTransform: "uppercase" as const, letterSpacing: "0.06em", fontWeight: 500, marginTop: 6, fontFamily: T.font }}>{label}</div>
    </div>
  );
}

function DetailField({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <div style={st.fieldLabel}>{label}</div>
      <div style={{ fontSize: 14, color: T.white2, fontWeight: 500, fontFamily: T.font }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: T.grayDim, fontFamily: T.font }}>{sub}</div>}
    </div>
  );
}

function FormField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div style={st.formGroup}>
      <label style={st.formLabel}>{label}</label>
      <input style={st.formInput} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

function CSS() {
  return (
    <style>{`
      @keyframes appFadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes appSlideUp { from { opacity: 0; transform: translateY(30px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
      @keyframes appFadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes appSpin { to { transform: rotate(360deg); } }
      .appCard { transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease; }
      .appCard:hover { transform: translateY(-4px); box-shadow: 0 20px 40px hsla(0,0%,0%,0.4) !important; border-color: hsl(0,0%,30%) !important; }
      .cardBtn { transition: opacity 0.2s ease, transform 0.15s ease; }
      .cardBtn:hover { transform: scale(1.15); }
      .tableRow { transition: background 0.15s ease; }
      .tableRow:hover { background: hsla(0,0%,100%,0.03) !important; }
      .quickStatusItem { transition: background 0.15s ease; }
      .quickStatusItem:hover { background: hsla(0,0%,100%,0.08) !important; }
      input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.7); }
      select option { background: hsl(240,2%,13%); color: hsl(0,0%,98%); }
      @media (max-width: 680px) { .statsGrid { grid-template-columns: repeat(2, 1fr) !important; } }
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

  badge: { fontSize: 11, fontWeight: 600, padding: "3px 11px", borderRadius: 8, whiteSpace: "nowrap", fontFamily: T.font },

  searchInput: {
    width: "100%", padding: "11px 36px", background: T.surface, borderWidth: 1, borderStyle: "solid", borderColor: T.jet,
    borderRadius: T.radius, color: T.white2, fontSize: 14, fontFamily: T.font, outline: "none", boxSizing: "border-box" as const,
  },

  pill: { padding: "5px 14px", borderRadius: 20, borderWidth: 1, borderStyle: "solid", borderColor: T.jet, background: "transparent", color: T.grayDim, fontSize: 12, fontFamily: T.font, cursor: "pointer", whiteSpace: "nowrap", transition: T.transition },
  pillActive: { background: "rgba(251,191,36,0.12)", color: T.gold, borderColor: "transparent" },

  sortChip: { padding: "4px 10px", borderRadius: 6, border: "none", background: "transparent", color: T.grayDim, fontSize: 12, fontFamily: T.font, cursor: "pointer" },

  iconBtn: { background: "none", border: "none", fontSize: 14, cursor: "pointer", padding: "4px 6px", borderRadius: 6, color: T.grayDim },

  btnGold: {
    padding: "10px 22px", borderRadius: T.radius, border: "none",
    background: `linear-gradient(to bottom right, ${T.gold}, ${T.goldDim})`,
    color: "hsl(0,0%,7%)", fontSize: 14, fontWeight: 600, fontFamily: T.font, cursor: "pointer",
  },
  btnDanger: {
    padding: "10px 22px", borderRadius: T.radius, borderWidth: 1, borderStyle: "solid", borderColor: "rgba(248,113,113,0.25)",
    background: "rgba(248,113,113,0.08)", color: "#f87171", fontSize: 14, fontWeight: 600, fontFamily: T.font, cursor: "pointer",
  },
  btnGhost: {
    padding: "10px 22px", borderRadius: T.radius, borderWidth: 1, borderStyle: "solid", borderColor: T.jet,
    background: "transparent", color: T.gray70, fontSize: 14, fontWeight: 500, fontFamily: T.font, cursor: "pointer",
  },

  fieldLabel: { fontSize: 11, fontWeight: 500, color: T.grayDim, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5, fontFamily: T.font },

  overlay: {
    position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.6)",
    backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center",
    padding: 20, animation: "appFadeIn 0.2s ease",
  },
  modal: {
    background: T.surface, borderRadius: T.radius, borderWidth: 1, borderStyle: "solid", borderColor: T.jet,
    width: "100%", maxWidth: 580, maxHeight: "90vh", overflow: "hidden",
    display: "flex", flexDirection: "column", boxShadow: "0 30px 80px hsla(0,0%,0%,0.5)",
    animation: "appSlideUp 0.3s ease",
  },

  formRow: { display: "flex", gap: 14, flexWrap: "wrap" },
  formGroup: { flex: 1, minWidth: 200, display: "flex", flexDirection: "column", gap: 6 },
  formLabel: { fontSize: 12, fontWeight: 500, color: T.gray70, fontFamily: T.font },
  formInput: {
    padding: "10px 14px", borderRadius: 10, borderWidth: 1, borderStyle: "solid", borderColor: T.jet,
    fontSize: 14, color: T.white2, fontFamily: T.font, outline: "none",
    background: T.surface2, boxSizing: "border-box" as const, width: "100%",
  },

  /* View toggle */
  viewToggle: {
    background: "none", borderWidth: 1, borderStyle: "solid", borderColor: "transparent", borderRadius: 6,
    color: T.grayDim, fontSize: 16, cursor: "pointer", padding: "3px 7px",
    fontFamily: T.font, transition: T.transition, lineHeight: 1,
  },
  viewToggleActive: {
    color: T.gold, borderColor: T.jet, background: "rgba(251,191,36,0.08)",
  },

  /* Quick status dropdown */
  quickDropdown: {
    position: "absolute" as const, top: "calc(100% + 4px)", right: 0, zIndex: 50,
    background: T.surface, borderWidth: 1, borderStyle: "solid", borderColor: T.jet,
    borderRadius: 10, padding: 4, minWidth: 160,
    boxShadow: "0 16px 40px hsla(0,0%,0%,0.4)", animation: "appFadeUp 0.15s ease",
  },
  quickDropdownItem: {
    display: "block", width: "100%", padding: "7px 12px", border: "none",
    background: "none", color: T.gray70, fontSize: 12, fontFamily: T.font,
    textAlign: "left" as const, cursor: "pointer", borderRadius: 6, whiteSpace: "nowrap" as const,
  },

  /* Table */
  table: {
    width: "100%", borderCollapse: "collapse" as const, fontFamily: T.font, fontSize: 13,
  },
  th: {
    textAlign: "left" as const, padding: "12px 16px", fontSize: 11, fontWeight: 600,
    color: T.grayDim, textTransform: "uppercase" as const, letterSpacing: "0.05em",
    borderBottom: `1px solid ${T.jet}`, whiteSpace: "nowrap" as const, fontFamily: T.font,
  },
  td: {
    padding: "12px 16px", borderBottom: `1px solid ${T.jet}`,
    verticalAlign: "middle" as const, fontFamily: T.font,
  },
};