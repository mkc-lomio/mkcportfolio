"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { notFound } from "next/navigation";
import dynamic from "next/dynamic";

const CreditContent = dynamic(() => import("./CreditContent"), {
  ssr: false,
  loading: () => (
    <div style={{ minHeight: "100vh", background: "hsl(0,0%,7%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#999", fontSize: 14 }}>
      Loading credit monitoring...
    </div>
  ),
});

function CreditGuard() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");

  if (code !== "mkc") {
    notFound();
  }

  return <CreditContent />;
}

export default function CreditPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: "hsl(0,0%,7%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#999", fontSize: 14 }}>
        Loading...
      </div>
    }>
      <CreditGuard />
    </Suspense>
  );
}
