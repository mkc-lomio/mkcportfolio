"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { notFound } from "next/navigation";
import dynamic from "next/dynamic";

const ApplicationsContent = dynamic(() => import("./ApplicationsContent"), {
  ssr: false,
  loading: () => (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#999", fontSize: 14 }}>
      Loading applications...
    </div>
  ),
});

function ApplicationsGuard() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");

  if (code !== "mkc") {
    notFound();
  }

  return <ApplicationsContent />;
}

export default function ApplicationsPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#999", fontSize: 14 }}>
        Loading...
      </div>
    }>
      <ApplicationsGuard />
    </Suspense>
  );
}
