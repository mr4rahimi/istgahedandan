"use client";

import { useState } from "react";

interface SettingKey { key: string; label: string; type: string }

export default function SettingsForm({ keys, settings }: { keys: SettingKey[]; settings: Record<string, string> }) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(keys.map(k => [k.key, settings[k.key] || ""]))
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {keys.map(k => (
        <div key={k.key}>
          <label style={{ display: "block", fontWeight: 600, fontSize: 14, color: "#133b48", marginBottom: 8 }}>{k.label}</label>
          {k.type === "textarea" ? (
            <textarea value={values[k.key] || ""} onChange={e => setValues(v => ({ ...v, [k.key]: e.target.value }))} rows={3} style={{ width: "100%", padding: "11px 13px", border: "1px solid #dceaef", borderRadius: 11, fontFamily: "inherit", fontSize: 14, outline: "none", resize: "vertical", boxSizing: "border-box" }} />
          ) : (
            <input type={k.type} value={values[k.key] || ""} onChange={e => setValues(v => ({ ...v, [k.key]: e.target.value }))} style={{ width: "100%", padding: "11px 13px", border: "1px solid #dceaef", borderRadius: 11, fontFamily: "inherit", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
          )}
        </div>
      ))}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <button type="submit" disabled={saving} style={{ background: "linear-gradient(135deg,#15b8d1,#0a6f9e)", color: "#fff", border: "none", borderRadius: 12, padding: "13px 28px", fontFamily: "inherit", fontWeight: 700, fontSize: 15, cursor: "pointer", opacity: saving ? .7 : 1 }}>
          {saving ? "در حال ذخیره…" : "ذخیره تنظیمات"}
        </button>
        {saved && <span style={{ color: "#16a34a", fontWeight: 600, fontSize: 14 }}>ذخیره شد ✓</span>}
      </div>
    </form>
  );
}
