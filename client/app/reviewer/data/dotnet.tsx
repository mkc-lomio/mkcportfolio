import { Category, H, C, Code, Ul, Li, P, Tip } from "./shared";

export const dotnet: Category = {
  id: "dotnet", title: ".NET", icon: "🔷", topics: [
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
]};
