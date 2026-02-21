import { categorySlugs } from "../data";
import SlugClient from "./SlugClient";

export function generateStaticParams() {
  return categorySlugs.map((slug) => ({ slug }));
}

export default function ReviewerSlugPage() {
  return <SlugClient />;
}
