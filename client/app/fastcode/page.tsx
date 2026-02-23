"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { notFound } from "next/navigation";

/* ============================================================
   DATA
   ============================================================ */

interface CriteriaItem {
  label: string;
  icon: string;
  description: string;
}

interface Step {
  number: number;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  colorDim: string;
  items: CriteriaItem[];
}

const steps: Step[] = [
  {
    number: 1,
    title: "Requirements Gathering",
    subtitle: "Understand what to build and why",
    icon: "🎯",
    color: "#818cf8",
    colorDim: "rgba(129,140,248,0.12)",
    items: [
      { label: "Edge Cases", icon: "⚠️", description: "Identify boundary conditions, unusual inputs, and failure scenarios before writing any code." },
      { label: "User Experiences", icon: "👤", description: "Understand user flows, pain points, and expected interactions. Build for the user, not the spec." },
      { label: "Business Case", icon: "💼", description: "Align with business goals, ROI, and stakeholder expectations. Know the 'why' behind every feature." },
    ],
  },
  {
    number: 2,
    title: "Coding",
    subtitle: "Write production-grade code",
    icon: "⚡",
    color: "#fbbf24",
    colorDim: "rgba(251,191,36,0.10)",
    items: [
      { label: "Data Structure", icon: "🏗️", description: "Choose the right data structures for the problem. Good structure makes algorithms simple." },
      { label: "Security", icon: "🔒", description: "Input validation, authentication, authorization, encryption. Security is not an afterthought." },
      { label: "Resiliency / Fault Tolerance", icon: "🛡️", description: "Retry logic, circuit breakers, graceful degradation. Plan for failure." },
      { label: "Monitoring / Observability", icon: "📊", description: "Logging, metrics, tracing, alerting. If you can't observe it, you can't fix it." },
      { label: "Scaling", icon: "📈", description: "Horizontal/vertical scaling strategies, caching, load balancing, async processing." },
      { label: "Comments / Ease to Understand", icon: "📝", description: "Self-documenting code with meaningful comments. Your future self will thank you." },
      { label: "Speed / Optimize Code", icon: "🚀", description: "Algorithm efficiency, lazy loading, query optimization. Measure before optimizing." },
      { label: "Memory Efficiency", icon: "💾", description: "Minimize allocations, avoid memory leaks, use appropriate data types and pooling." },
      { label: "Testing", icon: "🧪", description: "Unit, integration, e2e tests. High coverage on critical paths. TDD when it fits." },
      { label: "Error Handling", icon: "🚨", description: "Graceful failures, meaningful error messages, structured logging. Never swallow exceptions silently." },
      { label: "Maintainability", icon: "🔧", description: "Clean architecture, separation of concerns, SOLID principles. Code that's easy to change." },
      { label: "Reusability", icon: "♻️", description: "DRY, modular and composable code. Build components that can be shared across projects." },
      { label: "Configuration Management", icon: "⚙️", description: "Environment variables, feature flags, no hardcoded values. One build, multiple environments." },
      { label: "Dependency Management", icon: "📦", description: "Keep dependencies minimal, audited, and up to date. Know what you're importing." },
      { label: "Code Review Readiness", icon: "👀", description: "PR-friendly, small focused commits, clear descriptions. Make reviewers' lives easy." },
      { label: "Backward Compatibility", icon: "🔄", description: "Don't break existing consumers. Version APIs, deprecate gracefully, communicate changes." },
    ],
  },
  {
    number: 3,
    title: "Shipping",
    subtitle: "Deploy with confidence",
    icon: "🚢",
    color: "#4ade80",
    colorDim: "rgba(74,222,128,0.10)",
    items: [
      { label: "CI/CD Pipeline", icon: "🔁", description: "Automated build, test, and deploy. Every push is validated before it reaches production." },
      { label: "Release Strategy", icon: "🎯", description: "Blue/green, canary, or rolling deployments. Ship incrementally, rollback instantly." },
      { label: "Post-Deploy Validation", icon: "✅", description: "Smoke tests, health checks, monitoring dashboards. Verify it works in production." },
    ],
  },
];

/* ============================================================
   PROMPT TEMPLATE (Steps 1 & 2 only — AI doesn't ship)
   ============================================================ */

const FASTCODE_PROMPT = `You are a senior software engineer. When writing or reviewing code, always follow the FastCode Framework — a 2-step quality checklist. Apply every relevant criterion below before considering the task complete.

---

## STEP 1: REQUIREMENTS GATHERING
Before writing any code, confirm you understand:
- **Edge Cases** — Identify boundary conditions, unusual inputs, and failure scenarios.
- **User Experiences** — Understand user flows, pain points, and expected interactions.
- **Business Case** — Align with business goals and stakeholder expectations.

If requirements are ambiguous, ask clarifying questions before proceeding.

---

## STEP 2: CODING
Write production-grade code that satisfies ALL of the following criteria:

### Core Quality
- **Data Structure** — Choose the right data structures for the problem.
- **Security** — Input validation, authentication, authorization, encryption. Never an afterthought.
- **Error Handling** — Graceful failures, meaningful error messages, structured logging. Never swallow exceptions.
- **Testing** — Unit, integration, and e2e tests where appropriate. High coverage on critical paths.

### Reliability & Performance
- **Resiliency / Fault Tolerance** — Retry logic, circuit breakers, graceful degradation. Plan for failure.
- **Scaling** — Caching, async processing, load balancing strategies where relevant.
- **Speed / Optimize Code** — Algorithm efficiency, lazy loading, query optimization. Measure before optimizing.
- **Memory Efficiency** — Minimize allocations, avoid leaks, use appropriate data types and pooling.

### Maintainability & Collaboration
- **Maintainability** — Clean architecture, separation of concerns, SOLID principles.
- **Reusability** — DRY, modular/composable code. Build components that can be shared.
- **Comments / Ease to Understand** — Self-documenting code with meaningful comments where needed.
- **Code Review Readiness** — Small focused changes, clear intent, PR-friendly structure.

### Operations & Infrastructure
- **Monitoring / Observability** — Logging, metrics, tracing, alerting. If you can't observe it, you can't fix it.
- **Configuration Management** — Environment variables, feature flags, no hardcoded values.
- **Dependency Management** — Keep dependencies minimal, audited, and up to date.
- **Backward Compatibility** — Don't break existing consumers. Version APIs, deprecate gracefully.

---

## HOW TO APPLY
1. For every coding task, mentally (or explicitly) walk through Steps 1 → 2.
2. Not every criterion applies to every task — use judgment. A small utility function doesn't need scaling strategies, but it still needs error handling and tests.
3. When I ask you to write code, reference specific criteria you've addressed in brief code comments or a summary.
4. If I say "FastCode review", audit the code against all Step 2 criteria and flag gaps.`;

const EXAMPLE_USAGE = [
  {
    title: "Starting a new feature",
    prompt: `I need to build a REST API endpoint for user registration. Use the FastCode Framework.\n\nRequirements:\n- Accept email, password, first name, last name\n- Send verification email\n- Store in PostgreSQL via Supabase\n- .NET 8 Web API`,
  },
  {
    title: "Reviewing existing code",
    prompt: `FastCode review this stored procedure:\n\n\`\`\`sql\nCREATE PROCEDURE sp_GetOrdersByCustomer\n  @CustomerId INT\nAS\nBEGIN\n  SELECT * FROM Orders WHERE CustomerId = @CustomerId\nEND\n\`\`\``,
  },
  {
    title: "Quick utility function",
    prompt: `Write a C# helper method to retry an HTTP call with exponential backoff. FastCode Framework — focus on resiliency, error handling, and configurability.`,
  },
];

/* ============================================================
   GUARD
   ============================================================ */

function FastCodeGuard() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");

  if (code !== "mkc") {
    notFound();
  }

  return <FastCodePage />;
}

export default function FastCodeEntry() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: "hsl(0,0%,7%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#999", fontSize: 14 }}>
        Loading...
      </div>
    }>
      <FastCodeGuard />
    </Suspense>
  );
}

/* ============================================================
   MAIN PAGE
   ============================================================ */

function FastCodePage() {
  const [activeTab, setActiveTab] = useState<"framework" | "prompt">("framework");

  return (
    <div style={st.page}>
      <style>{cssAnimations}</style>

      <div style={st.container}>
        {/* HEADER */}
        <div style={{ animation: "fcfFadeUp 0.5s ease both", marginBottom: 32 }}>
          <a href="/" style={st.backLink}>
            <span style={{ marginRight: 6, fontSize: 11 }}>◂</span> Portfolio
          </a>

          <div style={{ marginTop: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <span style={st.frameworkBadge}>FRAMEWORK</span>
            </div>
            <h1 style={st.titleH1}>
              <span style={{ color: T.gold }}>Fast</span>Code
            </h1>
            <p style={st.headerSubtitle}>
              A 3-step mental model for shipping quality code — from requirements to production.
            </p>
          </div>

          {/* TAB SWITCHER */}
          <div style={{ display: "flex", gap: 4, marginTop: 24, background: T.surface, borderRadius: 12, padding: 4, width: "fit-content", border: `1px solid ${T.jet}` }}>
            <button onClick={() => setActiveTab("framework")} style={{ ...st.tab, ...(activeTab === "framework" ? st.tabActive : {}) }}>
              📐 Framework
            </button>
            <button onClick={() => setActiveTab("prompt")} style={{ ...st.tab, ...(activeTab === "prompt" ? st.tabActive : {}) }}>
              🤖 AI Prompt
            </button>
          </div>
        </div>

        {activeTab === "framework" ? <FrameworkView /> : <PromptView />}

        {/* FOOTER */}
        <div style={{ marginTop: 48, padding: "24px 0", borderTop: "1px solid hsl(0,0%,18%)", animation: "fcfFadeUp 0.5s ease 0.5s both" }}>
          <p style={{ fontSize: 13, color: "hsl(0,0%,45%)", fontFamily: T.font, textAlign: "center", fontStyle: "italic", margin: 0 }}>
            &ldquo;Any fool can write code that a computer can understand. Good programmers write code that humans can understand.&rdquo;
            <span style={{ display: "block", marginTop: 6, fontStyle: "normal", color: "hsl(0,0%,35%)", fontSize: 11 }}>— Martin Fowler</span>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   FRAMEWORK TAB (All 3 Steps)
   ============================================================ */

function FrameworkView() {
  const [expandedStep, setExpandedStep] = useState<number | null>(2);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const totalCriteria = steps.reduce((acc, s) => acc + s.items.length, 0);

  return (
    <div style={{ animation: "fcfFadeUp 0.3s ease both" }}>
      {/* Quick stats */}
      <div style={{ display: "flex", gap: 20, marginBottom: 28 }}>
        <div style={st.statPill}>
          <span style={{ color: T.gold, fontWeight: 700 }}>{steps.length}</span>
          <span>Steps</span>
        </div>
        <div style={st.statPill}>
          <span style={{ color: T.gold, fontWeight: 700 }}>{totalCriteria}</span>
          <span>Criteria</span>
        </div>
      </div>

      {/* TIMELINE */}
      <div style={{ position: "relative" }}>
        <div style={st.timelineLine} />

        {steps.map((step, stepIdx) => {
          const isExpanded = expandedStep === step.number;

          return (
            <div key={step.number} style={{ position: "relative", marginBottom: stepIdx < steps.length - 1 ? 32 : 0, animation: `fcfFadeUp 0.5s ease ${0.1 + stepIdx * 0.08}s both` }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
                <div
                  style={{
                    ...st.stepCircle,
                    background: isExpanded ? step.color : T.card,
                    borderColor: step.color,
                    color: isExpanded ? "hsl(0,0%,7%)" : step.color,
                    zIndex: 2,
                  }}
                >
                  {step.number}
                </div>

                <div style={{ flex: 1 }}>
                  <button onClick={() => setExpandedStep(isExpanded ? null : step.number)} style={st.stepHeader}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                        <span style={{ fontSize: 20 }}>{step.icon}</span>
                        <h2 style={{ ...st.stepTitle, color: step.color }}>{step.title}</h2>
                      </div>
                      <p style={st.stepSubtitle}>{step.subtitle}</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ ...st.countBadge, background: step.colorDim, color: step.color }}>{step.items.length}</span>
                      <span style={{ fontSize: 14, color: T.grayDim, transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.25s ease" }}>▼</span>
                    </div>
                  </button>

                  {isExpanded && (
                    <div style={st.criteriaGrid}>
                      {step.items.map((item, idx) => {
                        const isHovered = hoveredItem === `${step.number}-${idx}`;
                        return (
                          <div
                            key={idx}
                            style={{ ...st.criteriaCard, borderColor: isHovered ? step.color : T.jet, animation: `fcfFadeUp 0.35s ease ${idx * 0.03}s both` }}
                            onMouseEnter={() => setHoveredItem(`${step.number}-${idx}`)}
                            onMouseLeave={() => setHoveredItem(null)}
                          >
                            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                              <span style={{ ...st.criteriaIcon, background: step.colorDim }}>{item.icon}</span>
                              <div style={{ flex: 1 }}>
                                <h3 style={st.criteriaLabel}>{item.label}</h3>
                                <p style={st.criteriaDesc}>{item.description}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   PROMPT TAB (Steps 1 & 2 only)
   ============================================================ */

function PromptView() {
  const [copied, setCopied] = useState(false);
  const [copiedExample, setCopiedExample] = useState<number | null>(null);
  const [expandedExample, setExpandedExample] = useState<number | null>(null);

  const handleCopy = async (text: string, type: "main" | number) => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "main") {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        setCopiedExample(type);
        setTimeout(() => setCopiedExample(null), 2000);
      }
    } catch {
      /* fallback */
    }
  };

  return (
    <div style={{ animation: "fcfFadeUp 0.3s ease both" }}>
      {/* INFO BANNER */}
      <div style={{ background: "rgba(129,140,248,0.08)", border: "1px solid rgba(129,140,248,0.15)", borderRadius: 12, padding: "14px 18px", marginBottom: 28, display: "flex", alignItems: "flex-start", gap: 12 }}>
        <span style={{ fontSize: 16, flexShrink: 0 }}>💡</span>
        <p style={{ fontSize: 13, color: "hsl(0,0%,65%)", margin: 0, lineHeight: 1.6, fontFamily: T.font }}>
          This prompt covers <strong style={{ color: "#818cf8" }}>Steps 1 &amp; 2</strong> only. Step 3 (Shipping) is your responsibility — the AI writes code, you deploy it.
        </p>
      </div>

      {/* SYSTEM PROMPT */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h2 style={st.sectionTitle}>📋 System Prompt</h2>
          <button
            onClick={() => handleCopy(FASTCODE_PROMPT, "main")}
            style={{
              ...st.copyBtn,
              background: copied ? "rgba(74,222,128,0.15)" : "rgba(251,191,36,0.10)",
              color: copied ? "#4ade80" : T.gold,
              borderColor: copied ? "rgba(74,222,128,0.25)" : "rgba(251,191,36,0.2)",
            }}
          >
            {copied ? "✓ Copied!" : "Copy Prompt"}
          </button>
        </div>
        <div style={st.promptBlock}>
          <pre style={st.promptText}>{FASTCODE_PROMPT}</pre>
        </div>
      </div>

      {/* HOW TO USE */}
      <div style={{ marginBottom: 36 }}>
        <h2 style={st.sectionTitle}>🚀 How to Use</h2>
        <div style={st.howToCard}>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 20 }}>
            {[
              { label: "Copy the system prompt above", desc: 'Click "Copy Prompt" to grab the full FastCode Framework prompt.' },
              { label: "Paste as system/custom instructions", desc: "Claude: Paste in Project Instructions or at the start of a conversation. ChatGPT: Go to Settings → Personalization → Custom Instructions." },
              { label: "Code as usual", desc: 'The AI will automatically apply FastCode criteria. Say "FastCode review" to audit any code against all criteria.' },
            ].map((item, idx) => (
              <div key={idx} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <span style={st.howToNumber}>{idx + 1}</span>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "hsl(0,0%,92%)", margin: "0 0 4px", fontFamily: T.font }}>{item.label}</p>
                  <p style={{ fontSize: 13, color: "hsl(0,0%,50%)", margin: 0, lineHeight: 1.6, fontFamily: T.font }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* EXAMPLES */}
      <div style={{ marginBottom: 36 }}>
        <h2 style={st.sectionTitle}>💬 Example Prompts</h2>
        <p style={{ fontSize: 13, color: "hsl(0,0%,50%)", margin: "0 0 16px", fontFamily: T.font }}>
          After setting the system prompt, use these as conversation starters:
        </p>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
          {EXAMPLE_USAGE.map((ex, idx) => {
            const isExpanded = expandedExample === idx;
            const isCopied = copiedExample === idx;
            return (
              <div key={idx} className="exCard" style={{ ...st.exampleCard, animation: `fcfFadeUp 0.35s ease ${idx * 0.05}s both` }}>
                <button onClick={() => setExpandedExample(isExpanded ? null : idx)} style={st.exampleHeader}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={st.exampleNumber}>{idx + 1}</span>
                    <span style={{ fontSize: 14, fontWeight: 500, color: "hsl(0,0%,90%)", fontFamily: T.font }}>{ex.title}</span>
                  </div>
                  <span style={{ fontSize: 12, color: T.grayDim, transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }}>▼</span>
                </button>
                {isExpanded && (
                  <div style={{ padding: "0 18px 16px", animation: "fcfFadeUp 0.25s ease both" }}>
                    <div style={st.examplePromptBlock}>
                      <pre style={st.examplePromptText}>{ex.prompt}</pre>
                    </div>
                    <button
                      onClick={() => handleCopy(ex.prompt, idx)}
                      style={{
                        ...st.copyBtnSmall,
                        background: isCopied ? "rgba(74,222,128,0.12)" : "transparent",
                        color: isCopied ? "#4ade80" : T.grayDim,
                        borderColor: isCopied ? "rgba(74,222,128,0.2)" : T.jet,
                      }}
                    >
                      {isCopied ? "✓ Copied!" : "Copy Example"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* QUICK COMMANDS */}
      <div>
        <h2 style={st.sectionTitle}>⚡ Quick Commands</h2>
        <p style={{ fontSize: 13, color: "hsl(0,0%,50%)", margin: "0 0 16px", fontFamily: T.font }}>
          Shorthand triggers you can use once the system prompt is active:
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 10 }}>
          {[
            { cmd: "FastCode review", desc: "Audit code against all Step 2 criteria" },
            { cmd: "FastCode this", desc: "Write code following the full framework" },
            { cmd: "FastCode gaps", desc: "List which criteria are missing from the code" },
          ].map((item, idx) => (
            <div key={idx} style={st.cmdCard}>
              <code style={st.cmdCode}>{item.cmd}</code>
              <p style={st.cmdDesc}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   THEME + CSS
   ============================================================ */

const T = {
  bg: "hsl(0,0%,7%)", surface: "hsl(240,2%,13%)",
  card: "hsl(240,1%,17%)", jet: "hsl(0,0%,22%)",
  gold: "hsl(45,100%,72%)", goldDim: "hsl(45,54%,58%)",
  white2: "hsl(0,0%,98%)",
  gray: "hsl(0,0%,84%)", grayDim: "hsl(0,0%,55%)",
  font: "'Poppins', sans-serif", radius: 14,
  shadow: "0 16px 30px hsla(0,0%,0%,0.25)",
};

const cssAnimations = `
  @keyframes fcfFadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
  .exCard { transition: border-color 0.25s ease; }
  .exCard:hover { border-color: hsl(0,0%,30%) !important; }
`;

/* ============================================================
   STYLES
   ============================================================ */

const st: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: T.bg, fontFamily: T.font, color: T.gray, fontSize: 14, lineHeight: 1.6 },
  container: { maxWidth: 820, margin: "0 auto", padding: "40px 20px 80px" },

  backLink: { color: T.gold, textDecoration: "none", fontSize: 13, fontWeight: 500, fontFamily: T.font, display: "inline-block" },
  frameworkBadge: { fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", color: T.goldDim, padding: "4px 12px", borderRadius: 6, background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.15)", fontFamily: T.font },
  titleH1: { fontSize: 36, fontWeight: 700, color: T.white2, margin: "8px 0 0", fontFamily: T.font, letterSpacing: "-0.02em" },
  headerSubtitle: { fontSize: 15, color: T.grayDim, margin: "8px 0 0", fontFamily: T.font, maxWidth: 520, lineHeight: 1.6 },

  /* Tabs */
  tab: { padding: "8px 20px", borderRadius: 10, border: "none", background: "transparent", color: T.grayDim, fontSize: 13, fontWeight: 500, fontFamily: T.font, cursor: "pointer", transition: "all 0.2s ease" },
  tabActive: { background: "rgba(251,191,36,0.12)", color: T.gold },

  /* Framework */
  statPill: { display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: T.grayDim, fontFamily: T.font },
  timelineLine: { position: "absolute", left: 19, top: 0, bottom: 0, width: 2, background: `linear-gradient(to bottom, hsl(0,0%,22%), hsl(0,0%,15%))`, zIndex: 1 },
  stepCircle: { width: 40, height: 40, borderRadius: "50%", border: "2px solid", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, fontFamily: T.font, flexShrink: 0, transition: "all 0.25s ease" },
  stepHeader: { width: "100%", background: T.card, border: `1px solid ${T.jet}`, borderRadius: T.radius, padding: "18px 22px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", textAlign: "left" as const, transition: "border-color 0.25s ease", fontFamily: T.font },
  stepTitle: { fontSize: 18, fontWeight: 600, margin: 0, fontFamily: T.font },
  stepSubtitle: { fontSize: 13, color: T.grayDim, margin: "2px 0 0", fontFamily: T.font },
  countBadge: { fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 8, fontFamily: T.font },
  criteriaGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10, marginTop: 12 },
  criteriaCard: { background: T.surface, border: `1px solid ${T.jet}`, borderRadius: 12, padding: "16px 18px", transition: "border-color 0.25s ease", cursor: "default" },
  criteriaIcon: { width: 34, height: 34, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 },
  criteriaLabel: { fontSize: 13, fontWeight: 600, color: T.white2, margin: "0 0 4px", fontFamily: T.font },
  criteriaDesc: { fontSize: 12, color: T.grayDim, margin: 0, lineHeight: 1.55, fontFamily: T.font },

  /* Prompt */
  sectionTitle: { fontSize: 18, fontWeight: 600, color: "hsl(0,0%,95%)", margin: "0 0 4px", fontFamily: T.font },
  promptBlock: { background: "hsl(240,2%,11%)", border: "1px solid hsl(0,0%,20%)", borderRadius: T.radius, padding: 24, maxHeight: 480, overflow: "auto" },
  promptText: { fontSize: 13, color: "hsl(0,0%,75%)", fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace", lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap" as const, wordBreak: "break-word" as const },
  copyBtn: { padding: "8px 18px", borderRadius: 10, border: "1px solid", fontSize: 13, fontWeight: 600, fontFamily: T.font, cursor: "pointer", transition: "all 0.2s ease" },
  howToCard: { background: "hsl(240,1%,15%)", border: "1px solid hsl(0,0%,20%)", borderRadius: T.radius, padding: 24, marginTop: 12 },
  howToNumber: { width: 30, height: 30, borderRadius: "50%", background: "rgba(251,191,36,0.12)", color: T.gold, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, fontFamily: T.font, flexShrink: 0 },
  exampleCard: { background: "hsl(240,1%,15%)", border: "1px solid hsl(0,0%,20%)", borderRadius: 12, overflow: "hidden" },
  exampleHeader: { width: "100%", padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "transparent", border: "none", cursor: "pointer", fontFamily: T.font, textAlign: "left" as const },
  exampleNumber: { width: 24, height: 24, borderRadius: "50%", background: "rgba(129,140,248,0.12)", color: "#818cf8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, fontFamily: T.font, flexShrink: 0 },
  examplePromptBlock: { background: "hsl(240,2%,11%)", border: "1px solid hsl(0,0%,18%)", borderRadius: 10, padding: 16, marginBottom: 10 },
  examplePromptText: { fontSize: 12, color: "hsl(0,0%,70%)", fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace", lineHeight: 1.65, margin: 0, whiteSpace: "pre-wrap" as const, wordBreak: "break-word" as const },
  copyBtnSmall: { padding: "6px 14px", borderRadius: 8, border: "1px solid", fontSize: 12, fontWeight: 500, fontFamily: T.font, cursor: "pointer", transition: "all 0.2s ease" },
  cmdCard: { background: "hsl(240,1%,15%)", border: "1px solid hsl(0,0%,20%)", borderRadius: 12, padding: 16 },
  cmdCode: { fontSize: 13, fontWeight: 600, color: T.gold, fontFamily: "'JetBrains Mono', 'Fira Code', monospace", background: "rgba(251,191,36,0.08)", padding: "3px 8px", borderRadius: 6 },
  cmdDesc: { fontSize: 12, color: "hsl(0,0%,50%)", margin: "8px 0 0", lineHeight: 1.5, fontFamily: T.font },
};