"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ReviewActions({ reviewId, approved }: { reviewId: number; approved: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const act = async (action: "approve" | "reject" | "delete") => {
    setLoading(true);
    await fetch(`/api/admin/reviews/${reviewId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) });
    router.refresh();
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", gap: 8 }}>
      {!approved && (
        <button onClick={() => act("approve")} disabled={loading} style={{ padding: "7px 16px", borderRadius: 9, border: "none", background: "#dcfce7", color: "#16a34a", fontFamily: "inherit", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
          تأیید
        </button>
      )}
      {approved && (
        <button onClick={() => act("reject")} disabled={loading} style={{ padding: "7px 16px", borderRadius: 9, border: "none", background: "#fef2f2", color: "#dc2626", fontFamily: "inherit", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
          لغو تأیید
        </button>
      )}
      <button onClick={() => { if (confirm("حذف شود؟")) act("delete"); }} disabled={loading} style={{ padding: "7px 16px", borderRadius: 9, border: "1px solid #f1f8fa", background: "transparent", color: "#9bb6bf", fontFamily: "inherit", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
        حذف
      </button>
    </div>
  );
}
