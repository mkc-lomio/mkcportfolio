"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { notFound } from "next/navigation";
import dynamic from "next/dynamic";

const ReviewerContent = dynamic(() => import("./ReviewerContent"), {
  ssr: false,
  loading: () => (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#999", fontSize: 14 }}>
      Loading notebook...
    </div>
  ),
});

function ReviewerGuard() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");

  if (code !== "mkc") {
    notFound();
  }

  return <ReviewerContent />;
}

export default function ReviewerPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#999", fontSize: 14 }}>
        Loading...
      </div>
    }>
      <ReviewerGuard />
    </Suspense>
  );
}