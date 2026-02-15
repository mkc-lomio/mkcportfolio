"use client";

import { useState, useEffect, useMemo, useRef } from "react";

// ============ TYPES ============

interface Topic {
  id: string;
  title: string;
  tags: string[];
  notes: string;
}

interface Category {
  id: string;
  title: string;
  icon: string;
  topics: Topic[];
}

// ============ MARKDOWN RENDERER ============

function NotesRenderer({ text }: { text: string }) {
  const blocks: React.ReactNode[] = [];
  const lines = text.split("\n");
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("```")) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++;
      blocks.push(
        <pre key={key++} style={ns.codeBlock}>
          <code>{codeLines.join("\n")}</code>
        </pre>
      );
      continue;
    }

    if (!line.trim()) {
      blocks.push(<div key={key++} style={{ height: 10 }} />);
      i++;
      continue;
    }

    if (line.startsWith("- ")) {
      blocks.push(
        <div key={key++} style={ns.bullet}>
          <span style={ns.bulletDot}>•</span>
          <span><InlineText text={line.slice(2)} /></span>
        </div>
      );
      i++;
      continue;
    }

    const numMatch = line.match(/^(\d+)\.\s(.*)/);
    if (numMatch) {
      blocks.push(
        <div key={key++} style={ns.bullet}>
          <span style={ns.numDot}>{numMatch[1]}.</span>
          <span><InlineText text={numMatch[2]} /></span>
        </div>
      );
      i++;
      continue;
    }

    blocks.push(
      <p key={key++} style={ns.para}><InlineText text={line} /></p>
    );
    i++;
  }

  return <>{blocks}</>;
}

function InlineText({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*)|(`([^`]+)`)/g;
  let lastIndex = 0;
  let match;
  let k = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={k++}>{text.slice(lastIndex, match.index)}</span>);
    }
    if (match[1]) {
      parts.push(<strong key={k++} style={ns.bold}>{match[2]}</strong>);
    } else if (match[3]) {
      parts.push(<code key={k++} style={ns.inlineCode}>{match[4]}</code>);
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(<span key={k++}>{text.slice(lastIndex)}</span>);
  }
  return <>{parts}</>;
}

// ============ COMPONENT ============

export default function ReviewerPage() {
  const [data, setData] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [tocOpen, setTocOpen] = useState(false);
  const topicRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    fetch("/data/reviewer-notes.json")
      .then((r) => r.json())
      .then(setData);
  }, []);

  // Track which topic is in view
  useEffect(() => {
    const ids = data.flatMap((c) => c.topics.map((t) => t.id));
    if (ids.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    );

    ids.forEach((id) => {
      const el = topicRefs.current[id];
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [data]);

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    if (!s) return data;
    return data
      .map((cat) => {
        const topics = cat.topics.filter(
          (t) =>
            t.title.toLowerCase().includes(s) ||
            t.notes.toLowerCase().includes(s) ||
            t.tags.some((tag) => tag.toLowerCase().includes(s))
        );
        if (topics.length === 0) return null;
        return { ...cat, topics };
      })
      .filter(Boolean) as Category[];
  }, [data, search]);

  const scrollTo = (id: string) => {
    const el = topicRefs.current[id];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setTocOpen(false);
    }
  };

  const allTopics = data.flatMap((c) =>
    c.topics.map((t) => ({ ...t, catIcon: c.icon, catTitle: c.title }))
  );

  return (
    <div style={s.page}>
      {/* TOC sidebar — desktop */}
      <nav style={s.tocSidebar}>
        <div style={s.tocHeader}>Contents</div>
        {data.map((cat) => (
          <div key={cat.id} style={s.tocCatGroup}>
            <div style={s.tocCatLabel}>{cat.icon} {cat.title}</div>
            {cat.topics.map((t, i) => (
              <button
                key={t.id}
                onClick={() => scrollTo(t.id)}
                style={{
                  ...s.tocItem,
                  ...(activeId === t.id ? s.tocItemActive : {}),
                }}
              >
                <span style={s.tocNum}>{i + 1}</span>
                {t.title}
              </button>
            ))}
          </div>
        ))}
      </nav>

      {/* TOC mobile toggle */}
      <button
        onClick={() => setTocOpen(!tocOpen)}
        style={s.tocMobileBtn}
      >
        ☰ Contents
      </button>

      {/* TOC mobile overlay */}
      {tocOpen && (
        <div style={s.tocOverlay} onClick={() => setTocOpen(false)}>
          <div style={s.tocMobile} onClick={(e) => e.stopPropagation()}>
            <div style={s.tocHeader}>Contents</div>
            {data.map((cat) => (
              <div key={cat.id} style={s.tocCatGroup}>
                <div style={s.tocCatLabel}>{cat.icon} {cat.title}</div>
                {cat.topics.map((t, i) => (
                  <button
                    key={t.id}
                    onClick={() => scrollTo(t.id)}
                    style={{
                      ...s.tocItem,
                      ...(activeId === t.id ? s.tocItemActive : {}),
                    }}
                  >
                    <span style={s.tocNum}>{i + 1}</span>
                    {t.title}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main content */}
      <div style={s.main}>
        {/* Header */}
        <div style={s.headerBar}>
          <div>
            <h1 style={s.title}>Technical Interview Notebook</h1>
            <p style={s.subtitle}>
              {allTopics.length} topics · Quick reference for technical interviews
            </p>
          </div>
          <a href="/" style={s.homeLink}>← Portfolio</a>
        </div>

        {/* Search */}
        <div style={s.searchWrap}>
          <input
            type="text"
            placeholder="Search topics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={s.searchInput}
          />
          {search && (
            <button onClick={() => setSearch("")} style={s.clearBtn}>✕</button>
          )}
        </div>

        {/* Notes */}
        {filtered.map((cat) => (
          <div key={cat.id}>
            <div style={s.catHeading}>
              <span>{cat.icon}</span>
              <span>{cat.title}</span>
            </div>

            {cat.topics.map((topic, idx) => (
              <div
                key={topic.id}
                id={topic.id}
                ref={(el) => { topicRefs.current[topic.id] = el; }}
                style={s.topicBlock}
              >
                <h3 style={s.topicTitle}>
                  <span style={s.topicNum}>{idx + 1}.</span> {topic.title}
                </h3>
                <div style={s.topicNotes}>
                  <NotesRenderer text={topic.notes} />
                </div>
                {idx < cat.topics.length - 1 && <hr style={s.divider} />}
              </div>
            ))}
          </div>
        ))}

        {filtered.length === 0 && (
          <p style={{ color: "#999", textAlign: "center", padding: 40 }}>
            No results found.
          </p>
        )}
      </div>
    </div>
  );
}

// ============ PAGE STYLES ============

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#ffffff",
    color: "#1a1a1a",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSize: 14,
    lineHeight: 1.8,
    display: "flex",
  },

  // TOC sidebar (desktop)
  tocSidebar: {
    position: "sticky",
    top: 0,
    alignSelf: "flex-start",
    width: 240,
    height: "100vh",
    overflowY: "auto",
    padding: "24px 16px",
    borderRight: "1px solid #e5e5e5",
    background: "#fafafa",
    flexShrink: 0,
  },
  tocHeader: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#999",
    marginBottom: 16,
  },
  tocCatGroup: {
    marginBottom: 16,
  },
  tocCatLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: "#555",
    marginBottom: 6,
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  tocItem: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    width: "100%",
    textAlign: "left",
    background: "none",
    border: "none",
    padding: "4px 8px",
    borderRadius: 4,
    fontSize: 12,
    color: "#666",
    cursor: "pointer",
    lineHeight: 1.4,
  },
  tocItemActive: {
    background: "#eef2ff",
    color: "#4338ca",
    fontWeight: 600,
  },
  tocNum: {
    color: "#aaa",
    fontSize: 11,
    minWidth: 16,
    flexShrink: 0,
  },

  // TOC mobile
  tocMobileBtn: {
    position: "fixed",
    bottom: 20,
    right: 20,
    zIndex: 200,
    background: "#4338ca",
    color: "#fff",
    border: "none",
    borderRadius: 20,
    padding: "10px 18px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
  },
  tocOverlay: {
    position: "fixed",
    inset: 0,
    zIndex: 300,
    background: "rgba(0,0,0,0.3)",
  },
  tocMobile: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 280,
    height: "100vh",
    background: "#fff",
    padding: "24px 16px",
    overflowY: "auto",
    boxShadow: "-4px 0 20px rgba(0,0,0,0.1)",
  },

  // Main content
  main: {
    flex: 1,
    maxWidth: 720,
    margin: "0 auto",
    padding: "32px 32px 100px",
  },
  headerBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 800,
    color: "#111",
    margin: 0,
  },
  subtitle: {
    margin: "4px 0 0",
    color: "#888",
    fontSize: 13,
  },
  homeLink: {
    color: "#4338ca",
    textDecoration: "none",
    fontSize: 13,
    fontWeight: 500,
    whiteSpace: "nowrap",
  },
  searchWrap: {
    position: "relative",
    marginBottom: 36,
  },
  searchInput: {
    width: "100%",
    padding: "10px 32px 10px 14px",
    background: "#f5f5f5",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#e0e0e0",
    borderRadius: 8,
    color: "#1a1a1a",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
  },
  clearBtn: {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    color: "#999",
    cursor: "pointer",
    fontSize: 14,
  },
  catHeading: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 18,
    fontWeight: 800,
    color: "#111",
    marginBottom: 24,
    paddingBottom: 10,
    borderBottom: "2px solid #e5e5e5",
  },
  topicBlock: {
    marginBottom: 8,
    scrollMarginTop: 20,
  },
  topicTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: "#1a1a1a",
    margin: "0 0 10px",
  },
  topicNum: {
    color: "#4338ca",
    marginRight: 4,
  },
  topicNotes: {
    paddingLeft: 8,
    color: "#444",
  },
  divider: {
    border: "none",
    borderTop: "1px solid #eee",
    margin: "28px 0",
  },
};

// ============ NOTE CONTENT STYLES ============

const ns: Record<string, React.CSSProperties> = {
  para: { margin: "0 0 4px" },
  bold: { color: "#1a1a1a", fontWeight: 600 },
  inlineCode: {
    background: "#f0f0f5",
    color: "#4338ca",
    padding: "1px 6px",
    borderRadius: 3,
    fontSize: 13,
    fontFamily: "'Fira Code', 'Cascadia Code', monospace",
  },
  bullet: {
    display: "flex",
    gap: 8,
    margin: "3px 0",
    paddingLeft: 4,
  },
  bulletDot: { color: "#4338ca", flexShrink: 0 },
  numDot: { color: "#4338ca", flexShrink: 0, width: 20, fontWeight: 600 },
  codeBlock: {
    background: "#f8f8fc",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#e8e8f0",
    borderRadius: 8,
    padding: "14px 16px",
    margin: "10px 0",
    fontSize: 12,
    lineHeight: 1.6,
    overflowX: "auto",
    fontFamily: "'Fira Code', 'Cascadia Code', monospace",
    color: "#4338ca",
    whiteSpace: "pre",
  },
};