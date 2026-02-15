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
