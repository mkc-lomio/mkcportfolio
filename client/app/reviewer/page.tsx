"use client";

import dynamic from "next/dynamic";

const ReviewerContent = dynamic(() => import("./ReviewerContent"), {
  ssr: false,
  loading: () => (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#999", fontSize: 14 }}>
      Loading notebook...
    </div>
  ),
});

export default function ReviewerPage() {
  return <ReviewerContent />;
}