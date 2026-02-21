"use client";

import { Suspense } from "react";
import { useSearchParams, useParams } from "next/navigation";
import { notFound } from "next/navigation";
import dynamic from "next/dynamic";

const ReviewerCategory = dynamic(() => import("../ReviewerCategory"), {
  ssr: false,
  loading: () => (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#999", fontSize: 14 }}>
      Loading notebook...
    </div>
  ),
});

function SlugGuard() {
  const searchParams = useSearchParams();
  const params = useParams();
  const code = searchParams.get("code");
  const slug = params.slug as string;

  if (code !== "mkc") {
    notFound();
  }

  return <ReviewerCategory slug={slug} />;
}

export default function SlugClient() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#999", fontSize: 14 }}>
        Loading...
      </div>
    }>
      <SlugGuard />
    </Suspense>
  );
}
