import { Category, H, C, Code, Ul, Li, P, Tip } from "./shared";

export const webSecurity: Category = {
  id: "web-security", title: "Web Security", icon: "🛡️", topics: [
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
]};
