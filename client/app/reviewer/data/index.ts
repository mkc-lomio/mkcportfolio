export { type Topic, type Category, type Difficulty } from "./shared";
export { Collapsible, DiffBadge, H, C, Code, Ul, Li, Ol, Ni, P, Gap, Tip } from "./shared";

import { webSecurity } from "./web-security";
import { sql } from "./sql";
import { csharp } from "./csharp";
import { dotnet } from "./dotnet";
import { principles } from "./principles";
import { angular } from "./angular";
import { Category } from "./shared";

export const categories: Category[] = [
  webSecurity,
  sql,
  csharp,
  dotnet,
  principles,
  angular,
];

/* Slug → category mapping for routing */
export const categoryBySlug: Record<string, Category> = {
  "websecurity": webSecurity,
  "sql": sql,
  "csharp": csharp,
  "dotnet": dotnet,
  "principles": principles,
  "angular": angular,
};

export const categorySlugs = Object.keys(categoryBySlug);

/* Metadata for category cards */
export const categoryMeta: Record<string, { description: string; color: string }> = {
  "websecurity": { description: "OWASP Top 10, XSS, CSRF, CORS, JWT, authentication & authorization patterns", color: "#dc2626" },
  "sql": { description: "T-SQL, joins, indexes, stored procedures, query optimization & window functions", color: "#2563eb" },
  "csharp": { description: "Classes, generics, LINQ, async/await, delegates, dependency injection & more", color: "#7c3aed" },
  "dotnet": { description: ".NET vs ASP.NET, middleware, Entity Framework, SignalR & deployment patterns", color: "#0891b2" },
  "principles": { description: "OOP, SOLID, design patterns, clean architecture, DDD & microservices", color: "#d97706" },
  "angular": { description: "Components, directives, services, RxJS, routing, forms & change detection", color: "#dc2626" },
};
