"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { notFound } from "next/navigation";
import dynamic from "next/dynamic";

const TodoContent = dynamic(() => import("./TodoContent"), {
  ssr: false,
  loading: () => (
    <div style={{ minHeight: "100vh", background: "hsl(0,0%,7%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#999", fontSize: 14 }}>
      Loading todos...
    </div>
  ),
});

function TodoGuard() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");

  if (code !== "mkc") {
    notFound();
  }

  return <TodoContent />;
}

export default function TodoPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: "hsl(0,0%,7%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#999", fontSize: 14 }}>
        Loading...
      </div>
    }>
      <TodoGuard />
    </Suspense>
  );
}
