"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { notFound } from "next/navigation";
import dynamic from "next/dynamic";

const InterviewPrepContent = dynamic(() => import("./InterviewPrepContent"), {
  ssr: false,
  loading: () => (
    <div style={{ minHeight: "100vh", background: "hsl(0,0%,7%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#999", fontSize: 14 }}>
      Loading interview prep...
    </div>
  ),
});

function PrepGuard() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");

  if (code !== "mkc") {
    notFound();
  }

  return <InterviewPrepContent />;
}

export default function InterviewPrepPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: "hsl(0,0%,7%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#999", fontSize: 14 }}>
        Loading...
      </div>
    }>
      <PrepGuard />
    </Suspense>
  );
}
