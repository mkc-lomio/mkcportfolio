"use client";

import { useState, useEffect, useRef, ReactNode, useCallback } from "react";

/* ============================================================
   NOTE COMPONENTS
   ============================================================ */

const H = ({ children }: { children: ReactNode }) => (
  <strong style={{ color: "#1a1a1a", fontWeight: 600 }}>{children}</strong>
);

const C = ({ children }: { children: ReactNode }) => (
  <code style={{
    background: "#f0f0f5", color: "#4338ca", padding: "1px 6px",
    borderRadius: 3, fontSize: 13, fontFamily: "'Fira Code', 'Cascadia Code', monospace",
  }}>{children}</code>
);

function Code({ children }: { children: string }) {
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

const Ul = ({ children }: { children: ReactNode }) => (
  <ul style={{ margin: "4px 0", paddingLeft: 20, listStyle: "none" }}>{children}</ul>
);
const Li = ({ children }: { children: ReactNode }) => (
  <li style={{ margin: "3px 0", paddingLeft: 4, display: "flex", gap: 8 }}>
    <span style={{ color: "#4338ca", flexShrink: 0 }}>•</span>
    <div style={{ flex: 1 }}>{children}</div>
  </li>
);
const Ol = ({ children }: { children: ReactNode }) => (
  <ol style={{ margin: "4px 0", paddingLeft: 20, listStyle: "none" }}>{children}</ol>
);
const Ni = ({ children, n }: { children: ReactNode; n: number }) => (
  <li style={{ margin: "3px 0", paddingLeft: 4, display: "flex", gap: 8 }}>
    <span style={{ color: "#4338ca", flexShrink: 0, fontWeight: 600, minWidth: 20 }}>{n}.</span>
    <div style={{ flex: 1 }}>{children}</div>
  </li>
);
const P = ({ children }: { children: ReactNode }) => (
  <div style={{ margin: "0 0 6px" }}>{children}</div>
);
const Gap = () => <div style={{ height: 10 }} />;

const Tip = ({ children }: { children: ReactNode }) => (
  <div style={{
    margin: "12px 0", padding: "10px 14px", borderLeft: "3px solid #4338ca",
    background: "#f8f7ff", borderRadius: "0 6px 6px 0", fontSize: 13,
  }}>
    <div style={{ fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4, color: "#6366f1" }}>💡 Interview Tip</div>
    <div style={{ color: "#444" }}>{children}</div>
  </div>
);

/* Collapsible */
function Collapsible({ open, children }: { open: boolean; children: ReactNode }) {
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

/* Difficulty Badge */
type Difficulty = "basic" | "intermediate" | "advanced";
const diffColors: Record<Difficulty, { bg: string; color: string }> = {
  basic: { bg: "#ecfdf5", color: "#059669" },
  intermediate: { bg: "#fef3c7", color: "#d97706" },
  advanced: { bg: "#fef2f2", color: "#dc2626" },
};
const DiffBadge = ({ level }: { level: Difficulty }) => (
  <span style={{ fontSize: 10, padding: "1px 8px", borderRadius: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.3, background: diffColors[level].bg, color: diffColors[level].color }}>{level}</span>
);

/* ============================================================
   DATA TYPES
   ============================================================ */

interface Topic { id: string; title: string; tags: string[]; difficulty: Difficulty; summary: string; content: ReactNode; }
interface Category { id: string; title: string; icon: string; topics: Topic[]; }

/* ============================================================
   CATEGORIES DATA
   ============================================================ */

const categories: Category[] = [
// ---- WEB SECURITY ----
{ id: "web-security", title: "Web Security", icon: "🛡️", topics: [
  { id: "owasp-overview", title: "OWASP Web Security Overview", tags: ["OWASP", "top 10", "security by design"], difficulty: "basic",
    summary: "Security by design approach mitigating the OWASP Top 10 risks.",
    content: (<><P>OWASP focuses on the top 10 risks — injection, broken access control, cryptographic failures — using a <H>"security by design"</H> approach.</P><P><H>Key actions:</H></P><Ul><Li>Strict input validation</Li><Li>MFA enforcement</Li><Li>Parameterized queries</Li><Li>Keep components updated</Li><Li>Robust logging and monitoring</Li></Ul><Tip>Start with "OWASP provides a standard awareness document for web security." Then name 3-4 risks.</Tip></>) },
  { id: "injection-prevention", title: "Injection Prevention", tags: ["injection", "SQL", "parameterized queries"], difficulty: "intermediate",
    summary: "Use parameterized queries to prevent SQL/NoSQL/OS command injection.",
    content: (<><P>Use <H>parameterized queries</H> to prevent injection attacks.</P><Code>{`// ❌ Vulnerable
var query = "SELECT * FROM Users WHERE Name = '" + userInput + "'";

// ✅ Safe — Dapper
var user = await conn.QueryAsync<User>(
    "SELECT * FROM Users WHERE Name = @Name",
    new { Name = userInput });

// ✅ Safe — EF Core
var user = await ctx.Users.Where(u => u.Name == userInput).FirstOrDefaultAsync();`}</Code><Ul><Li>Use stored procedures with parameterized inputs</Li><Li>Apply least privilege to DB accounts</Li><Li>ORMs parameterize by default</Li></Ul><Tip>Mention you always use parameterized queries or ORM — never string concatenation.</Tip></>) },
  { id: "broken-access-control", title: "Broken Access Control", tags: ["access control", "RBAC", "authorization"], difficulty: "intermediate",
    summary: "Implement RBAC, least privilege, and server-side authorization checks.",
    content: (<><P>Implement <H>RBAC</H>, <H>least privilege</H>, validate auth on every request.</P><Ul><Li>IDOR — modifying IDs in URLs</Li><Li>Missing auth checks on API endpoints</Li><Li>Privilege escalation</Li></Ul><Code>{`[Authorize(Roles = "Admin")]
public IActionResult DeleteUser(int id) { ... }

if (report.OwnerId != currentUserId) return Forbid();`}</Code><Tip>"I always validate permissions server-side, deny by default, and use policy-based authorization."</Tip></>) },
  { id: "cryptographic-failures", title: "Cryptographic Failures", tags: ["encryption", "TLS", "hashing", "passwords"], difficulty: "intermediate",
    summary: "Encrypt data in transit (TLS) and at rest. Hash passwords with bcrypt/Argon2.",
    content: (<><Ul><Li>Enforce HTTPS/TLS, HSTS headers, TLS 1.2+</Li><Li>❌ Never MD5/SHA-1 for passwords</Li><Li>✅ Use <H>bcrypt</H>, <H>Argon2</H>, or <H>PBKDF2</H></Li></Ul><Code>{`var hash = BCrypt.Net.BCrypt.HashPassword(password);
var isValid = BCrypt.Net.BCrypt.Verify(password, hash);`}</Code></>) },
  { id: "input-validation", title: "Input Validation & Sanitization", tags: ["validation", "sanitization", "XSS"], difficulty: "basic",
    summary: "Never trust user input. Validate with allowlists. Server-side is mandatory.",
    content: (<><P><H>Never trust user input.</H> Validate against strict allowlists.</P><Code>{`public class CreateUserRequest
{
    [Required, StringLength(100, MinimumLength = 2)]
    public string Name { get; set; }
    [Required, EmailAddress]
    public string Email { get; set; }
    [Range(18, 120)]
    public int Age { get; set; }
}`}</Code><P><H>XSS:</H> Encode output, CSP headers, don't bypass auto-escaping.</P><P><H>Server-side validation is mandatory.</H></P></>) },
  { id: "secure-session", title: "Secure Session Management", tags: ["sessions", "cookies", "authentication"], difficulty: "intermediate",
    summary: "HttpOnly + Secure + SameSite cookies. Regenerate session ID after login.",
    content: (<><P><H>Flags:</H> <C>HttpOnly</C> (no JS), <C>Secure</C> (HTTPS), <C>SameSite=Strict</C> (CSRF).</P><Code>{`options.Cookie.HttpOnly = true;
options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
options.Cookie.SameSite = SameSiteMode.Strict;
options.ExpireTimeSpan = TimeSpan.FromMinutes(30);`}</Code><Ul><Li>Regenerate session ID after login</Li><Li>Tokens in httpOnly cookies — NOT localStorage</Li></Ul></>) },
  { id: "security-config", title: "Security Configuration", tags: ["configuration", "hardening", "headers"], difficulty: "basic",
    summary: "Disable defaults, remove server headers, add security headers.",
    content: (<><Code>{`X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Security-Policy: default-src 'self'
Strict-Transport-Security: max-age=31536000`}</Code><Code>{`builder.WebHost.ConfigureKestrel(o => o.AddServerHeader = false);`}</Code><P>Keep deps updated: <C>dotnet list package --vulnerable</C>, <C>npm audit</C></P></>) },
  { id: "logging-monitoring", title: "Logging and Monitoring", tags: ["logging", "monitoring", "audit"], difficulty: "basic",
    summary: "Log auth failures, validation errors. Never log secrets/PII.",
    content: (<><P><H>Log:</H> Auth failures, access denied, validation errors, high-value transactions.</P><P><H>Never log:</H> Passwords, tokens, PII, keys.</P><Code>{`Log.Warning("Failed login for {Email} from {IP}", email, ip);
builder.Services.AddApplicationInsightsTelemetry();`}</Code></>) },
]},

// ---- SQL ----
{ id: "sql", title: "SQL", icon: "🗄️", topics: [
  { id: "tsql", title: "Transact-SQL (T-SQL)", tags: ["T-SQL", "SQL Server", "fundamentals"], difficulty: "basic",
    summary: "SQL Server's extension with control flow, variables, error handling, transactions.",
    content: (<><Ul><Li><H>Control Flow</H> — <C>IF</C>, <C>WHILE</C>, <C>CASE</C></Li><Li><H>Variables</H> — <C>DECLARE @name NVARCHAR(50)</C></Li><Li><H>Error Handling</H> — <C>TRY...CATCH</C></Li><Li><H>Transactions</H> — <C>BEGIN TRAN</C>, <C>COMMIT</C>, <C>ROLLBACK</C></Li></Ul></>) },
  { id: "select-clauses", title: "6 Principal Clauses of SELECT", tags: ["SELECT", "syntax"], difficulty: "basic",
    summary: "SELECT → FROM → WHERE → GROUP BY → HAVING → ORDER BY",
    content: (<><Ol><Ni n={1}><C>SELECT</C> — columns</Ni><Ni n={2}><C>FROM</C> — tables</Ni><Ni n={3}><C>WHERE</C> — filter rows</Ni><Ni n={4}><C>GROUP BY</C> — group</Ni><Ni n={5}><C>HAVING</C> — filter groups</Ni><Ni n={6}><C>ORDER BY</C> — sort</Ni></Ol></>) },
  { id: "acid", title: "ACID Principle", tags: ["ACID", "transactions"], difficulty: "basic",
    summary: "Atomicity, Consistency, Isolation, Durability — reliable transactions.",
    content: (<><Ul><Li><H>Atomicity</H> — All or nothing</Li><Li><H>Consistency</H> — Data stays valid</Li><Li><H>Isolation</H> — No interference</Li><Li><H>Durability</H> — Committed = permanent</Li></Ul><Tip>Bank transfer: "Either both accounts update or neither does."</Tip></>) },
  { id: "nvarchar-varchar", title: "NVARCHAR vs VARCHAR", tags: ["data types", "unicode"], difficulty: "basic",
    summary: "VARCHAR = ASCII (1 byte). NVARCHAR = Unicode (2 bytes, multi-language).",
    content: (<><P><H>VARCHAR</H> — ASCII, 1 byte. <H>NVARCHAR</H> — Unicode, 2 bytes.</P><P>Use <C>NVARCHAR</C> for multi-language data.</P></>) },
  { id: "like-operator", title: "LIKE Operator & Wildcards", tags: ["LIKE", "wildcard", "filtering"], difficulty: "basic",
    summary: "'Marc%' starts with. '%Marc' ends with. '%Marc%' contains.",
    content: (<><Ul><Li><C>'Marc%'</C> — Starts with</Li><Li><C>'%Marc'</C> — Ends with</Li><Li><C>'%Marc%'</C> — Contains</Li></Ul><P>Only prefix patterns are SARGable.</P></>) },
  { id: "where-having", title: "WHERE vs HAVING", tags: ["WHERE", "HAVING", "filtering"], difficulty: "basic",
    summary: "WHERE filters rows before grouping. HAVING filters groups after aggregation.",
    content: (<><Ul><Li><H>WHERE</H> — before grouping</Li><Li><H>HAVING</H> — after aggregation</Li></Ul><Code>{`SELECT Dept, COUNT(*) AS Total FROM Employees
WHERE IsActive = 1 GROUP BY Dept HAVING COUNT(*) > 5;`}</Code></>) },
  { id: "aggregation", title: "Aggregate Functions", tags: ["aggregation", "functions"], difficulty: "basic",
    summary: "SUM, COUNT, AVG, MIN, MAX — calculate over groups.",
    content: (<><P><C>SUM()</C>, <C>COUNT()</C>, <C>AVG()</C>, <C>MIN()</C>, <C>MAX()</C></P><P>Used with <C>GROUP BY</C> for per-group results.</P></>) },
  { id: "group-by", title: "GROUP BY", tags: ["GROUP BY", "grouping"], difficulty: "basic",
    summary: "Groups rows by column. SELECT columns must be grouped or aggregated.",
    content: (<><Code>{`SELECT Dept, COUNT(*) FROM Employees GROUP BY Dept;`}</Code><P>Every <C>SELECT</C> column must be in <C>GROUP BY</C> or an aggregate.</P></>) },
  { id: "distinct", title: "DISTINCT", tags: ["DISTINCT", "duplicates"], difficulty: "basic",
    summary: "Eliminates duplicate rows from result set.",
    content: (<><Code>{`SELECT DISTINCT Department FROM Employees;`}</Code></>) },
  { id: "outer-apply", title: "OUTER APPLY", tags: ["APPLY", "joins", "subqueries"], difficulty: "advanced",
    summary: "Like LEFT JOIN but for correlated subqueries and TVFs.",
    content: (<><Ul><Li>Right side can reference left-side columns</Li><Li><C>CROSS APPLY</C> = INNER JOIN equivalent</Li></Ul><Tip>"I use APPLY when joining a TVF or correlated subquery that depends on each left-table row."</Tip></>) },
  { id: "clustered-idx", title: "Clustered Index", tags: ["indexing", "clustered", "performance"], difficulty: "intermediate",
    summary: "Physical order of rows. One per table. Usually the primary key.",
    content: (<><Ul><Li>Only <H>one</H> per table (usually PK)</Li><Li>Leaf nodes = actual data rows</Li><Li>Ideal for range queries, <C>ORDER BY</C></Li></Ul></>) },
  { id: "nonclustered-idx", title: "Non-Clustered Index", tags: ["indexing", "non-clustered", "performance"], difficulty: "intermediate",
    summary: "Separate structure with pointers. Multiple per table. Use INCLUDE.",
    content: (<><Ul><Li>Multiple per table (up to 999)</Li><Li>Adds write overhead</Li><Li>Use <C>INCLUDE</C> for covering indexes</Li></Ul></>) },
  { id: "sargable", title: "SARGable Queries", tags: ["SARGable", "performance", "indexing"], difficulty: "intermediate",
    summary: "Conditions that allow index seeks. Avoid functions on columns in WHERE.",
    content: (<><P><H>✅ Good:</H> <C>=</C>, <C>IN</C>, <C>BETWEEN</C>, <C>LIKE 'prefix%'</C></P><P><H>❌ Bad:</H> Functions on columns, calculations, leading wildcards</P><Ul><Li>❌ <C>WHERE YEAR(HireDate) = 2023</C></Li><Li>✅ <C>{"WHERE HireDate >= '2023-01-01' AND HireDate < '2024-01-01'"}</C></Li></Ul></>) },
  { id: "execution-plan", title: "Execution Plans", tags: ["execution plan", "optimization"], difficulty: "intermediate",
    summary: "Shows DB engine steps. Red flags: scans, key lookups, thick arrows.",
    content: (<><Ol><Ni n={1}><H>Estimated</H> — without running</Ni><Ni n={2}><H>Actual</H> — after running</Ni><Ni n={3}><H>Live Statistics</H> — real-time in SSMS</Ni></Ol><P><H>Red flags:</H> Table Scans, Key Lookups, thick arrows, high-cost Sort/Hash Match.</P></>) },
  { id: "query-opt", title: "Query Optimization Checklist", tags: ["optimization", "performance"], difficulty: "intermediate",
    summary: "Index properly, no SELECT *, EXISTS over IN, analyze execution plans.",
    content: (<><Ol><Ni n={1}>Index on WHERE/JOIN/ORDER BY columns</Ni><Ni n={2}>No <C>SELECT *</C></Ni><Ni n={3}>SARGable WHERE</Ni><Ni n={4}>Prefer <C>INNER JOIN</C></Ni><Ni n={5}><C>EXISTS</C> over <C>IN</C></Ni><Ni n={6}>Analyze Execution Plans</Ni><Ni n={7}>Update Statistics</Ni><Ni n={8}>Avoid Cursors</Ni></Ol></>) },
  { id: "cursor", title: "CURSORs", tags: ["cursor", "anti-pattern"], difficulty: "intermediate",
    summary: "Row-by-row. Slow. Use set-based operations instead.",
    content: (<><P>Row-by-row processing. <H>Slow</H>, holds locks longer.</P><P>✅ Use <C>UPDATE</C>, <C>JOIN</C>, <C>MERGE</C> instead.</P></>) },
  { id: "normalization", title: "Normalization & Denormalization", tags: ["normalization", "database design"], difficulty: "basic",
    summary: "Normalize for writes (less redundancy). Denormalize for reads (faster queries).",
    content: (<><P><H>Normalization</H> — split tables, FK, less redundancy.</P><P><H>Denormalization</H> — merge tables, faster reads.</P><Tip>"Normalize for writes, denormalize for reads."</Tip></>) },
  { id: "triggers", title: "Database Triggers", tags: ["triggers", "automation"], difficulty: "intermediate",
    summary: "Auto-run on INSERT/UPDATE/DELETE. Use sparingly.",
    content: (<><P>Runs on <C>INSERT</C>, <C>UPDATE</C>, <C>DELETE</C>.</P><P><H>Use:</H> Audit logs, business rules. <H>Caution:</H> Silent side effects.</P></>) },
  { id: "conn-pool", title: "Connection Pooling", tags: ["connection pooling", "ADO.NET"], difficulty: "basic",
    summary: "Reuses DB connections. Close() returns to pool. Default in .NET.",
    content: (<><Ol><Ni n={1}>Pool created on first request</Ni><Ni n={2}>Subsequent requests reuse</Ni><Ni n={3}>Close()/Dispose() returns to pool</Ni></Ol><P>Default in ADO.NET and EF Core.</P></>) },
  { id: "views", title: "Regular vs Materialized Views", tags: ["views", "materialized views"], difficulty: "intermediate",
    summary: "Regular = virtual, real-time. Materialized = stored, precomputed.",
    content: (<><P><H>Regular</H> — virtual, always fresh, can be slow.</P><P><H>Materialized</H> — stored on disk, fast, can be stale.</P><Tip>"Regular for real-time, materialized for dashboards and reporting."</Tip></>) },
]},

// ---- C# ----
{ id: "csharp", title: "C#", icon: "⚙️", topics: [
  { id: "class", title: "Classes & Objects", tags: ["class", "OOP"], difficulty: "basic",
    summary: "Class = blueprint. Object = instance.",
    content: (<><P>A <H>class</H> defines properties and methods. An <H>object</H> is an instance.</P></>) },
  { id: "abstract-class", title: "Abstract Class", tags: ["abstract", "OOP", "inheritance"], difficulty: "intermediate",
    summary: "Cannot be instantiated. Has both abstract and concrete methods.",
    content: (<><P>Cannot be instantiated, meant to be inherited. Can have abstract (no body) and implemented methods.</P><Tip>"Abstract class = shared base logic + forced subclass implementation."</Tip></>) },
  { id: "interface-vs-abstract", title: "Interface vs Abstract Class", tags: ["interface", "abstract"], difficulty: "intermediate",
    summary: "Abstract = functionality + contract. Interface = contract only. Multiple interfaces OK.",
    content: (<><P><H>Abstract</H> — functionality that subclasses implement or override.</P><P><H>Interface</H> — only define functionality (contract).</P><P>A class can implement <H>multiple interfaces</H> but inherit only <H>one</H> class.</P></>) },
  { id: "virtual-override", title: "virtual vs override", tags: ["virtual", "override", "polymorphism"], difficulty: "basic",
    summary: "virtual allows overriding. override provides new implementation.",
    content: (<><P><C>virtual</C> allows overriding. <C>override</C> provides new implementation in derived class.</P></>) },
  { id: "ref-out", title: "ref vs out", tags: ["ref", "out", "parameters"], difficulty: "basic",
    summary: "ref = must init before. out = must assign inside method.",
    content: (<><Ul><Li><C>ref</C> — must be initialized before passing</Li><Li><C>out</C> — must be assigned inside the method</Li></Ul></>) },
  { id: "value-ref-types", title: "Value Types vs Reference Types", tags: ["value types", "reference types", "memory"], difficulty: "basic",
    summary: "Value = data on stack. Reference = pointer on heap.",
    content: (<><Ul><Li><H>Value</H> — <C>int</C>, <C>float</C>, <C>bool</C>, <C>struct</C>, <C>enum</C> → stack</Li><Li><H>Reference</H> — <C>class</C>, <C>interface</C>, <C>array</C>, <C>string</C> → heap</Li></Ul></>) },
  { id: "boxing", title: "Boxing & Unboxing", tags: ["boxing", "memory"], difficulty: "basic",
    summary: "Boxing = value→object (heap). Unboxing = object→value (stack).",
    content: (<><P><H>Boxing</H> = value → object. <H>Unboxing</H> = object → value. Avoid excessive boxing (perf hit).</P></>) },
  { id: "const-readonly", title: "const vs readonly vs enum", tags: ["constants", "readonly", "enum"], difficulty: "basic",
    summary: "const = compile-time. readonly = runtime (constructor). enum = named constants.",
    content: (<><Ul><Li><C>const</C> — compile-time, assigned at declaration</Li><Li><C>readonly</C> — runtime, assigned in constructor</Li><Li><C>enum</C> — named integer constants</Li></Ul></>) },
  { id: "async-await", title: "Async/Await", tags: ["async", "await", "threading"], difficulty: "intermediate",
    summary: "Async = concurrent (non-blocking). Sync = sequential (blocking).",
    content: (<><P><H>Async</H> — non-blocking. <H>Sync</H> — one after another.</P><Tip>"I use async/await for I/O operations like DB calls and HTTP requests to avoid blocking threads."</Tip></>) },
  { id: "lock-keyword", title: "lock Keyword", tags: ["lock", "threading"], difficulty: "intermediate",
    summary: "Only one thread accesses a code block at a time.",
    content: (<><P><C>lock</C> ensures only <H>one thread</H> at a time. Prevents race conditions.</P></>) },
  { id: "deadlock", title: "Deadlock", tags: ["deadlock", "threading"], difficulty: "advanced",
    summary: "Two+ threads waiting for each other forever.",
    content: (<><P>Threads <H>waiting for each other</H> — neither proceeds.</P><P><H>Prevent:</H> Lock ordering, timeouts, avoid nested locks.</P></>) },
  { id: "thread-task", title: "Thread vs Task", tags: ["thread", "task", "parallelism"], difficulty: "intermediate",
    summary: "Thread = low-level. Task = high-level using ThreadPool.",
    content: (<><Ul><Li><H>Thread</H> — low-level, manual</Li><Li><H>Task</H> — high-level, uses ThreadPool</Li><Li><H>ThreadPool</H> — managed reusable threads</Li></Ul></>) },
  { id: "delegates-events", title: "Delegates & Events", tags: ["delegates", "events"], difficulty: "intermediate",
    summary: "Delegate = function pointer. Event = notification. Handler = method that runs.",
    content: (<><Ul><Li><H>Delegate</H> — type-safe function pointer</Li><Li><H>Event</H> — notifies subscribers</Li><Li><H>Handler</H> — method that runs on event</Li></Ul></>) },
  { id: "generics", title: "Generics", tags: ["generics", "type safety"], difficulty: "intermediate",
    summary: "Code that works with any type without specifying it upfront.",
    content: (<><Code>{`public class Repository<T> where T : class
{
    public T GetById(int id) { ... }
    public void Add(T entity) { ... }
}`}</Code></>) },
  { id: "access-modifiers", title: "Access Modifiers", tags: ["access modifiers", "encapsulation"], difficulty: "basic",
    summary: "public, private, protected, internal, protected internal, private protected.",
    content: (<><Ul><Li><C>public</C> — anywhere</Li><Li><C>private</C> — class only</Li><Li><C>protected</C> — class + subclasses</Li><Li><C>internal</C> — same assembly</Li><Li><C>protected internal</C> — assembly OR subclasses</Li><Li><C>private protected</C> — subclasses in same assembly</Li></Ul></>) },
  { id: "exception-handling", title: "Exception Handling", tags: ["exceptions", "try-catch"], difficulty: "basic",
    summary: "try/catch/finally/throw for controlled runtime error handling.",
    content: (<><P>Uses <C>try</C>, <C>catch</C>, <C>finally</C>, <C>throw</C> for runtime error handling.</P></>) },
  { id: "string-builder", title: "String vs StringBuilder", tags: ["string", "performance"], difficulty: "basic",
    summary: "String = immutable (new object each change). StringBuilder = mutable (same object).",
    content: (<><Ul><Li><H>String</H> — immutable, new object each change</Li><Li><H>StringBuilder</H> — mutable, same object</Li></Ul><P>Use <C>StringBuilder</C> for loops/heavy string manipulation.</P></>) },
  { id: "casting", title: "Implicit vs Explicit Casting", tags: ["casting", "types"], difficulty: "basic",
    summary: "Implicit = auto (small→large). Explicit = manual (large→small).",
    content: (<><P><H>Implicit:</H> <C>char → int → long → float → double</C></P><P><H>Explicit:</H> <C>double → float → long → int → char</C></P></>) },
  { id: "tuple", title: "Tuple", tags: ["tuple", "data structure"], difficulty: "basic",
    summary: "Fixed elements of different types. Quick multi-value returns.",
    content: (<><Code>{`var person = ("Alice", 30);
Console.WriteLine(person.Item1); // Alice`}</Code><P>For complex objects, prefer a class.</P></>) },
  { id: "namespace", title: "Namespace", tags: ["namespace", "organization"], difficulty: "basic",
    summary: "Organizes code and avoids name conflicts.",
    content: (<><P>Helps <H>organize code</H> and avoid name conflicts.</P></>) },
]},

// ---- .NET ----
{ id: "dotnet", title: ".NET", icon: "🔷", topics: [
  { id: "dotnet-aspnet", title: ".NET vs ASP.NET", tags: [".NET", "ASP.NET"], difficulty: "basic",
    summary: ".NET = platform for all apps. ASP.NET = web framework within .NET.",
    content: (<><Ul><Li><H>.NET</H> — all app types (desktop, web, cloud, IoT)</Li><Li><H>ASP.NET</H> — web apps and web APIs specifically</Li></Ul><Tip>".NET is the universe; ASP.NET is a galaxy inside it focused on web."</Tip></>) },
  { id: "framework-core", title: ".NET Framework vs .NET Core", tags: [".NET Framework", ".NET Core"], difficulty: "basic",
    summary: "Framework = Windows-only, legacy. Core = cross-platform, modern.",
    content: (<><P><H>Framework</H> — Windows-only, legacy. <H>Core</H> — cross-platform, cloud/microservices.</P><Tip>"For new projects, always .NET Core. Framework only for legacy Windows apps."</Tip></>) },
  { id: "ef-core", title: "Entity Framework Core", tags: ["EF Core", "ORM", "database"], difficulty: "intermediate",
    summary: "ORM — work with DB using C# objects instead of raw SQL.",
    content: (<><Ul><Li>DbContext manages connections, change tracking, queries</Li><Li>LINQ → parameterized SQL</Li><Li>Migrations for schema changes</Li><Li>Scaffolding generates schema from DbContext</Li></Ul></>) },
  { id: "di", title: "Dependency Injection", tags: ["DI", "IoC"], difficulty: "intermediate",
    summary: "Inject dependencies from outside. Transient, Scoped, Singleton lifetimes.",
    content: (<><Code>{`builder.Services.AddScoped<IUserService, UserService>();

public class UserController {
    private readonly IUserService _svc;
    public UserController(IUserService svc) => _svc = svc;
}`}</Code><Tip>Mention 3 lifetimes: Transient (new each time), Scoped (per request), Singleton (app lifetime).</Tip></>) },
  { id: "middleware", title: "Middleware", tags: ["middleware", "pipeline"], difficulty: "intermediate",
    summary: "Handles every request/response in the pipeline. Order matters.",
    content: (<><P>Each middleware can process, short-circuit, or pass to next.</P><Tip>"Chain of responsibility: logging → auth → error handling → CORS."</Tip></>) },
  { id: "caching", title: "Caching", tags: ["caching", "Redis", "performance"], difficulty: "intermediate",
    summary: "In-Memory (single server), Distributed (Redis), Client-side (browser).",
    content: (<><Ul><Li><H>In-Memory</H> — app RAM, single server</Li><Li><H>Distributed</H> — Redis/Memcached, multi-server</Li><Li><H>Client-Side</H> — browser, static content</Li></Ul></>) },
  { id: "memory-types", title: "3 Types of Memory", tags: ["memory", "stack", "heap", "GC"], difficulty: "intermediate",
    summary: "Stack (value types), Heap (objects, GC), Static (app lifetime).",
    content: (<><Ul><Li><H>Stack</H> — value types, short lifetime, runtime managed</Li><Li><H>Heap</H> — objects/arrays, GC managed</Li><Li><H>Static</H> — static fields, entire app duration</Li></Ul></>) },
  { id: "gc", title: "Garbage Collection", tags: ["GC", "memory"], difficulty: "intermediate",
    summary: "Auto frees unreferenced objects. Use Dispose() for resources.",
    content: (<><P>GC <H>auto-frees</H> unreferenced objects. Memory leaks = holding unnecessary references.</P><P>Use <C>Dispose()</C> and <C>using</C> for resources.</P></>) },
  { id: "using-stmt", title: "using Statement", tags: ["using", "IDisposable"], difficulty: "basic",
    summary: "Auto-disposes resources: files, DB connections, streams.",
    content: (<><Code>{`using var conn = new SqlConnection(connStr);
// auto-disposed at end of scope`}</Code></>) },
  { id: "linq", title: "LINQ Syntax", tags: ["LINQ", "queries"], difficulty: "basic",
    summary: "Query syntax = SQL-like. Method syntax = extension methods + lambdas.",
    content: (<><Code>{`// Query syntax
var r = from u in users where u.Age > 18 select u;
// Method syntax
var r = users.Where(u => u.Age > 18);`}</Code></>) },
  { id: "lambda", title: "Lambda Expressions", tags: ["lambda", "LINQ"], difficulty: "basic",
    summary: "Inline anonymous function. n => n % 2 == 0",
    content: (<><Code>{`var evens = numbers.Where(n => n % 2 == 0);`}</Code></>) },
  { id: "dbcontext", title: "DbContext", tags: ["EF Core", "DbContext"], difficulty: "intermediate",
    summary: "Manages DB connections, change tracking, queries, CRUD.",
    content: (<><Ul><Li>Manage connections</Li><Li>Track entity changes</Li><Li>Handle queries and saves</Li><Li>Coordinate CRUD</Li></Ul></>) },
]},

// ---- PRINCIPLES ----
{ id: "principles", title: "Principles & Architecture", icon: "📐", topics: [
  { id: "oop", title: "OOP", tags: ["OOP", "fundamentals"], difficulty: "basic",
    summary: "Organize code using objects. Four pillars.",
    content: (<><P>OOP organizes code using <H>objects</H> — instances of classes.</P></>) },
  { id: "encapsulation", title: "Encapsulation", tags: ["OOP", "encapsulation"], difficulty: "basic",
    summary: "Hide internals, expose only what's necessary. Access modifiers.",
    content: (<><P><H>Hide + Protect + Organize.</H></P><Ul><Li>✅ Data protection</Li><Li>✅ Controlled access via getters/setters</Li><Li>✅ Reusability and modularity</Li></Ul></>) },
  { id: "abstraction", title: "Abstraction", tags: ["OOP", "abstraction"], difficulty: "basic",
    summary: "What an object does, not how. Abstract classes + interfaces.",
    content: (<><Ul><Li>Abstract Classes — partial abstraction</Li><Li>Interfaces — full abstraction</Li></Ul><Tip>"Like a remote control — press Power, don't need to know how the signal works."</Tip></>) },
  { id: "inheritance-oop", title: "Inheritance", tags: ["OOP", "inheritance"], difficulty: "basic",
    summary: "Child inherits from parent. Reuse, hierarchy, maintainability.",
    content: (<><Ul><Li>✅ Code reuse</Li><Li>✅ Logical hierarchy</Li><Li>✅ Change parent → affects children</Li></Ul></>) },
  { id: "polymorphism", title: "Polymorphism", tags: ["OOP", "polymorphism"], difficulty: "intermediate",
    summary: "Many forms. Overloading (compile-time) + Overriding (runtime).",
    content: (<><Ul><Li><H>Compile-time</H> — Method Overloading (same name, different params)</Li><Li><H>Runtime</H> — Method Overriding (<C>override</C> in child class)</Li></Ul></>) },
  { id: "solid", title: "SOLID Principles", tags: ["SOLID", "architecture"], difficulty: "intermediate",
    summary: "SRP, OCP, LSP, ISP, DIP — maintainable OOP design.",
    content: (<><Ol><Ni n={1}><H>S</H> — Single Responsibility. One reason to change.</Ni><Ni n={2}><H>O</H> — Open/Closed. Extend, don't modify.</Ni><Ni n={3}><H>L</H> — Liskov Substitution. Subclass = swappable.</Ni><Ni n={4}><H>I</H> — Interface Segregation. Small, specific interfaces.</Ni><Ni n={5}><H>D</H> — Dependency Inversion. Depend on abstractions.</Ni></Ol><Tip>Example for D: "PaymentService depends on IPaymentGateway, not Stripe or PayPal."</Tip></>) },
  { id: "patterns-overview", title: "Design Patterns Overview", tags: ["design patterns", "GoF"], difficulty: "basic",
    summary: "Creational (how created), Behavioral (how communicate), Structural (how structured).",
    content: (<><Ul><Li><H>Creational</H> — Singleton, Factory, Builder, Prototype</Li><Li><H>Behavioral</H> — Observer, Strategy, Command, Chain of Responsibility</Li><Li><H>Structural</H> — Adapter, Decorator, Facade, Proxy</Li></Ul></>) },
  { id: "singleton", title: "Singleton Pattern", tags: ["singleton", "creational"], difficulty: "basic",
    summary: "One instance, global access. Config, logging, cache.",
    content: (<><P>Ensures <H>only one instance</H> with global access.</P><P><H>Uses:</H> Config, Logging, Cache, DB Connection.</P></>) },
  { id: "factory", title: "Factory Method", tags: ["factory", "creational"], difficulty: "intermediate",
    summary: "Subclasses decide which object to create.",
    content: (<><Tip>"Like Uber — you request a ride, the factory decides car/bike/scooter."</Tip></>) },
  { id: "observer", title: "Observer Pattern", tags: ["observer", "behavioral"], difficulty: "intermediate",
    summary: "Notifies multiple objects when one changes.",
    content: (<><Tip>"YouTube subscriptions — channel uploads, all subscribers notified."</Tip></>) },
  { id: "strategy", title: "Strategy Pattern", tags: ["strategy", "behavioral"], difficulty: "intermediate",
    summary: "Switch behaviors by injecting different strategy objects.",
    content: (<><Tip>"Navigation app — same interface, different route strategy (car/bike/walk)."</Tip></>) },
  { id: "adapter", title: "Adapter Pattern", tags: ["adapter", "structural"], difficulty: "intermediate",
    summary: "Makes incompatible interfaces work together.",
    content: (<><P>Converts one interface to another.</P><P><H>Uses:</H> Third-party libs, legacy system integration.</P><Tip>"US power plug in Europe — adapter converts interfaces."</Tip></>) },
  { id: "facade", title: "Facade Pattern", tags: ["facade", "structural"], difficulty: "basic",
    summary: "Simplified interface to complex subsystem.",
    content: (<><Tip>"Hotel front desk — one point of contact instead of calling each department."</Tip></>) },
  { id: "big-o", title: "Big O Notation", tags: ["Big O", "complexity", "algorithms"], difficulty: "intermediate",
    summary: "O(1) constant < O(log n) binary < O(n) linear < O(n²) nested loops.",
    content: (<><Ul><Li><C>O(1)</C> — constant (arr[0])</Li><Li><C>O(log n)</C> — binary search</Li><Li><C>O(n)</C> — single loop</Li><Li><C>O(n²)</C> — nested loops</Li></Ul><Tip>When asked "what's the complexity?" — they usually mean worst-case (Big O).</Tip></>) },
  { id: "clean-code", title: "Clean Code", tags: ["clean code", "YAGNI", "KISS", "DRY"], difficulty: "basic",
    summary: "SoC, YAGNI, KISS, DRY — write maintainable code.",
    content: (<><Ul><Li><H>Separation of Concerns</H> — UI / business / data access</Li><Li><H>YAGNI</H> — Don't build what you don't need yet</Li><Li><H>KISS</H> — Simple = fewer bugs</Li><Li><H>DRY</H> — Reuse via functions</Li></Ul></>) },
  { id: "data-structures", title: "Data Structures Overview", tags: ["data structures", "algorithms"], difficulty: "intermediate",
    summary: "Array, LinkedList, Stack, Queue, Tree, Graph, HashTable, Set.",
    content: (<><P><H>Linear:</H></P><Ul><Li><H>Array</H> — fixed size, contiguous memory</Li><Li><H>Linked List</H> — nodes with pointers (Singly, Doubly, Circular)</Li><Li><H>Stack</H> — LIFO (push/pop)</Li><Li><H>Queue</H> — FIFO (enqueue/dequeue)</Li></Ul><P><H>Non-Linear:</H></P><Ul><Li><H>Tree</H> — hierarchical (Binary Tree)</Li><Li><H>Graph</H> — vertices + edges (Google Maps)</Li></Ul><P><H>Hash-Based:</H> Hash Table (key-value). <H>Set:</H> Unique elements only.</P></>) },
]},

// ---- ANGULAR ----
{ id: "angular", title: "Angular", icon: "🅰️", topics: [
  { id: "angular-what", title: "What is Angular?", tags: ["Angular", "TypeScript", "SPA"], difficulty: "basic",
    summary: "TypeScript-based SPA framework by Google. Component-based.",
    content: (<><P><H>TypeScript-based</H> framework by Google for SPAs with <H>component-based architecture</H>.</P><P>Features: two-way binding, DI, directives, routing, RxJS, AOT.</P></>) },
  { id: "angular-component", title: "Components", tags: ["component", "template"], difficulty: "basic",
    summary: "TS class (logic) + HTML template (view) + CSS (styles).",
    content: (<><P>Component = <H>TypeScript</H> (logic) + <H>HTML</H> (view) + <H>CSS</H> (styles).</P></>) },
  { id: "angular-module", title: "Modules", tags: ["module", "NgModule"], difficulty: "basic",
    summary: "Container for related components, services, directives, pipes.",
    content: (<><P>Container for related components, services, directives, pipes.</P></>) },
  { id: "angular-binding", title: "Data Binding", tags: ["data binding", "interpolation"], difficulty: "basic",
    summary: "Interpolation, property binding, event binding, two-way [(ngModel)].",
    content: (<><Ul><Li><C>{"{{value}}"}</C> — interpolation</Li><Li><C>[prop]="val"</C> — property binding</Li><Li><C>(event)="fn()"</C> — event binding</Li><Li><C>[(ngModel)]="val"</C> — two-way</Li></Ul></>) },
  { id: "angular-directives", title: "Directives", tags: ["directives", "ngIf", "ngFor"], difficulty: "basic",
    summary: "Component (template), Structural (*ngIf, *ngFor), Attribute ([ngClass]).",
    content: (<><Ul><Li><H>Component</H> — with template</Li><Li><H>Structural</H> — <C>*ngIf</C>, <C>*ngFor</C></Li><Li><H>Attribute</H> — <C>[ngClass]</C>, <C>[ngStyle]</C></Li></Ul></>) },
  { id: "angular-di", title: "DI in Angular", tags: ["DI", "services"], difficulty: "intermediate",
    summary: "Services injected via @Injectable(). Loosely coupled components.",
    content: (<><P>Class receives deps from external source. Services use <C>@Injectable()</C>.</P></>) },
  { id: "angular-lifecycle", title: "Lifecycle Hooks", tags: ["lifecycle", "ngOnInit", "ngOnDestroy"], difficulty: "intermediate",
    summary: "ngOnInit (init), ngOnChanges (input change), ngOnDestroy (cleanup).",
    content: (<><Ul><Li><C>ngOnInit()</C> — after init (use for setup logic)</Li><Li><C>ngOnChanges()</C> — input changes</Li><Li><C>ngOnDestroy()</C> — cleanup</Li></Ul><P><C>constructor()</C> = DI. <C>ngOnInit()</C> = initialization.</P></>) },
  { id: "angular-routing", title: "Routing", tags: ["routing", "Router"], difficulty: "basic",
    summary: "URL-to-component navigation via @angular/router.",
    content: (<><P>Navigation between views using URL-to-component mapping.</P></>) },
  { id: "angular-rxjs", title: "RxJS & Observables", tags: ["RxJS", "Observable", "reactive"], difficulty: "intermediate",
    summary: "Reactive streams. Used in HTTP, forms, events. Subscribe to get values.",
    content: (<><P>Reactive programming with Observables — streams of data over time.</P><Tip>"Observables are streams. I subscribe, use map/filter/switchMap to transform."</Tip></>) },
  { id: "angular-forms", title: "Template-driven vs Reactive Forms", tags: ["forms", "reactive"], difficulty: "intermediate",
    summary: "Template = HTML declarative. Reactive = TypeScript FormGroup.",
    content: (<><Ul><Li><H>Template-driven</H> — HTML-based, simple forms</Li><Li><H>Reactive</H> — TypeScript FormGroup, complex/dynamic forms</Li></Ul></>) },
  { id: "angular-http", title: "HTTP Requests", tags: ["HttpClient", "API"], difficulty: "basic",
    summary: "HttpClient returns Observables for async data fetching.",
    content: (<><P><C>HttpClient</C> from <C>@angular/common/http</C>. Returns Observables.</P></>) },
]},
];

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
      <style>{`@media print { .no-print{display:none!important} .grecaptcha-badge,iframe[src*="recaptcha"],[class*="captcha"]{display:none!important} @page{margin:18mm 14mm} }`}</style>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Technical Interview Notebook</h1>
        <button onClick={() => setPrintView(false)} className="no-print" style={{ padding: "5px 14px", borderRadius: 6, border: "1px solid #e0e0e0", background: "#fff", color: "#4338ca", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>← Back</button>
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

      {/* Progress bar */}
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
  searchInput: { width: "100%", padding: "10px 32px 10px 14px", background: "#f5f5f5", border: "1px solid #e0e0e0", borderRadius: 8, color: "#1a1a1a", fontSize: 14, outline: "none", boxSizing: "border-box" as const, transition: "border-color 0.2s ease" },
  clearBtn: { position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#999", cursor: "pointer", fontSize: 14 },
  filterRow: { display: "flex", flexWrap: "wrap", gap: 6 },
  filterPill: { padding: "4px 12px", borderRadius: 20, borderWidth: 1, borderStyle: "solid", borderColor: "#e0e0e0", background: "#fff", color: "#666", fontSize: 12, cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s ease" },
  filterPillActive: { background: "#4338ca", color: "#fff", borderColor: "transparent" },
  actionBar: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" },
  actionBtn: { padding: "4px 10px", borderRadius: 6, border: "1px solid #e0e0e0", background: "#fff", color: "#666", fontSize: 11, cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.15s ease" },
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