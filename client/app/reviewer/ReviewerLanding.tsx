"use client";

import { useState } from "react";
import { categories, categoryMeta, categoryBySlug } from "./data";

const slugForCategory: Record<string, string> = {};
for (const [slug, cat] of Object.entries(categoryBySlug)) {
  slugForCategory[cat.id] = slug;
}

const totalTopics = categories.reduce((s, c) => s + c.topics.length, 0);

const diffCount = (cat: typeof categories[0]) => {
  const b = cat.topics.filter((t) => t.difficulty === "basic").length;
  const i = cat.topics.filter((t) => t.difficulty === "intermediate").length;
  const a = cat.topics.filter((t) => t.difficulty === "advanced").length;
  return { b, i, a };
};

export default function ReviewerLanding() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <div style={st.page}>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .cat-card { transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1); }
        .cat-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.08) !important; }
        .cat-card:active { transform: translateY(-1px); }
      `}</style>

      {/* Header */}
      <div style={st.header}>
        <div style={st.headerInner}>
          <div style={{ animation: "fadeUp 0.5s ease both" }}>
            <a href="/" style={st.backLink}>← Portfolio</a>
            <h1 style={st.title}>Technical Interview Notebook</h1>
            <p style={st.subtitle}>
              {totalTopics} topics across {categories.length} categories — curated notes for technical interviews.
            </p>
          </div>
          <div style={{ ...st.statRow, animation: "fadeUp 0.5s ease 0.1s both" }}>
            <div style={st.statBox}>
              <div style={st.statNum}>{totalTopics}</div>
              <div style={st.statLabel}>Topics</div>
            </div>
            <div style={st.statDivider} />
            <div style={st.statBox}>
              <div style={st.statNum}>{categories.length}</div>
              <div style={st.statLabel}>Categories</div>
            </div>
            <div style={st.statDivider} />
            <div style={st.statBox}>
              <div style={st.statNum}>Feb 2026</div>
              <div style={st.statLabel}>Last Updated</div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Grid */}
      <div style={st.gridSection}>
        <div style={st.grid}>
          {categories.map((cat, idx) => {
            const slug = slugForCategory[cat.id];
            const meta = categoryMeta[slug] || { description: "", color: "#4338ca" };
            const diff = diffCount(cat);
            const isHovered = hoveredIdx === idx;

            return (
              <a
                key={cat.id}
                href={`/reviewer/${slug}?code=mkc`}
                className="cat-card"
                style={{
                  ...st.card,
                  animation: `fadeUp 0.4s ease ${0.08 * idx}s both`,
                  borderColor: isHovered ? meta.color + "40" : "#e5e7eb",
                }}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Accent bar */}
                <div style={{ ...st.cardAccent, background: meta.color }} />

                <div style={st.cardBody}>
                  {/* Icon + Title */}
                  <div style={st.cardHeader}>
                    <span style={{ ...st.cardIcon, background: meta.color + "12" }}>{cat.icon}</span>
                    <div>
                      <div style={st.cardTitle}>{cat.title}</div>
                      <div style={st.cardTopicCount}>{cat.topics.length} topics</div>
                    </div>
                    <span style={{ ...st.cardArrow, color: isHovered ? meta.color : "#ccc" }}>→</span>
                  </div>

                  {/* Description */}
                  <p style={st.cardDesc}>{meta.description}</p>

                  {/* Difficulty breakdown */}
                  <div style={st.diffRow}>
                    {diff.b > 0 && <span style={{ ...st.diffPill, background: "#ecfdf5", color: "#059669" }}>Basic · {diff.b}</span>}
                    {diff.i > 0 && <span style={{ ...st.diffPill, background: "#fef3c7", color: "#d97706" }}>Intermediate · {diff.i}</span>}
                    {diff.a > 0 && <span style={{ ...st.diffPill, background: "#fef2f2", color: "#dc2626" }}>Advanced · {diff.a}</span>}
                  </div>

                  {/* Progress bar (visual flair) */}
                  <div style={st.progressTrack}>
                    {diff.b > 0 && <div style={{ ...st.progressBar, width: `${(diff.b / cat.topics.length) * 100}%`, background: "#059669" }} />}
                    {diff.i > 0 && <div style={{ ...st.progressBar, width: `${(diff.i / cat.topics.length) * 100}%`, background: "#d97706" }} />}
                    {diff.a > 0 && <div style={{ ...st.progressBar, width: `${(diff.a / cat.topics.length) * 100}%`, background: "#dc2626" }} />}
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div style={st.footer}>
        <span style={{ color: "#bbb" }}>Technical Interview Notebook · Marc Kenneth Lomio · 2026</span>
      </div>
    </div>
  );
}

/* ============================================================
   STYLES
   ============================================================ */
const st: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#fafafa",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    color: "#1a1a1a",
  },
  header: {
    background: "#fff",
    borderBottom: "1px solid #e5e7eb",
    padding: "40px 24px 36px",
  },
  headerInner: {
    maxWidth: 900,
    margin: "0 auto",
  },
  backLink: {
    color: "#4338ca",
    textDecoration: "none",
    fontSize: 13,
    fontWeight: 500,
    display: "inline-block",
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 800,
    color: "#111",
    margin: "0 0 8px",
    letterSpacing: "-0.02em",
    lineHeight: 1.2,
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    margin: "0 0 24px",
    lineHeight: 1.5,
  },
  statRow: {
    display: "flex",
    alignItems: "center",
    gap: 24,
    flexWrap: "wrap" as const,
  },
  statBox: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 2,
  },
  statNum: {
    fontSize: 18,
    fontWeight: 700,
    color: "#111",
  },
  statLabel: {
    fontSize: 12,
    color: "#999",
    textTransform: "uppercase" as const,
    letterSpacing: "0.04em",
    fontWeight: 500,
  },
  statDivider: {
    width: 1,
    height: 32,
    background: "#e5e7eb",
  },

  /* Grid */
  gridSection: {
    maxWidth: 900,
    margin: "0 auto",
    padding: "32px 24px 48px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: 20,
  },

  /* Card */
  card: {
    position: "relative" as const,
    background: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#e5e7eb",
    overflow: "hidden",
    textDecoration: "none",
    color: "inherit",
    cursor: "pointer",
    display: "block",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  cardAccent: {
    height: 3,
    width: "100%",
  },
  cardBody: {
    padding: "20px 22px 18px",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    marginBottom: 14,
  },
  cardIcon: {
    fontSize: 22,
    width: 44,
    height: 44,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    flexShrink: 0,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: 700,
    color: "#111",
    lineHeight: 1.2,
  },
  cardTopicCount: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  cardArrow: {
    fontSize: 18,
    marginLeft: "auto",
    transition: "color 0.2s ease, transform 0.2s ease",
    flexShrink: 0,
  },
  cardDesc: {
    fontSize: 13,
    color: "#666",
    lineHeight: 1.6,
    margin: "0 0 16px",
  },

  /* Difficulty */
  diffRow: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: 6,
    marginBottom: 14,
  },
  diffPill: {
    fontSize: 10,
    fontWeight: 600,
    padding: "2px 10px",
    borderRadius: 10,
    letterSpacing: "0.02em",
  },

  /* Progress bar */
  progressTrack: {
    display: "flex",
    height: 3,
    borderRadius: 2,
    overflow: "hidden",
    background: "#f0f0f5",
    gap: 1,
  },
  progressBar: {
    height: "100%",
    borderRadius: 2,
    transition: "width 0.5s ease",
  },

  /* Footer */
  footer: {
    textAlign: "center" as const,
    padding: "24px 24px 40px",
    fontSize: 12,
  },
};
