"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeletePostBtn({ id, title }: { id: number; title: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const handle = async () => {
    if (!confirm(`حذف «${title.slice(0, 40)}»؟`)) return;
    setDeleting(true);
    await fetch(`/api/admin/blog/${id}`, { method: "DELETE" });
    router.refresh();
  };
  return (
    <button onClick={handle} disabled={deleting}
      style={{ fontSize: 13, color: "#dc2626", background: "none", border: "none", fontFamily: "inherit", fontWeight: 600, cursor: "pointer", padding: 0 }}>
      {deleting ? "…" : "حذف"}
    </button>
  );
}

export function FeaturedToggle({ id, isFeatured }: { id: number; isFeatured: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const toggle = async () => {
    setLoading(true);
    await fetch(`/api/admin/blog/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFeatured: !isFeatured }),
    });
    router.refresh();
    setLoading(false);
  };
  return (
    <button onClick={toggle} disabled={loading} title={isFeatured ? "ویژه — کلیک برای لغو" : "کلیک برای ویژه کردن"}
      style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, lineHeight: 1, opacity: loading ? .5 : 1, padding: 0 }}>
      {isFeatured ? "⭐" : "☆"}
    </button>
  );
}
