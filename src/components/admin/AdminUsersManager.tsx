"use client";

import { useState } from "react";

type Status = "PENDING" | "ACTIVE" | "SUSPENDED";
interface DentistUser {
  id: number; email: string; name: string; phone: string | null;
  status: Status; dentistId: number | null; createdAt: Date | string;
  dentist: { id: number; title: string; slug: string } | null;
}
interface Dentist { id: number; title: string }

const STATUS_LABELS: Record<Status, string> = { PENDING: "در انتظار", ACTIVE: "فعال", SUSPENDED: "تعلیق" };
const STATUS_COLORS: Record<Status, { bg: string; color: string }> = {
  PENDING: { bg: "#fef9c3", color: "#a16207" },
  ACTIVE: { bg: "#dcfce7", color: "#16a34a" },
  SUSPENDED: { bg: "#fee2e2", color: "#b91c1c" },
};

export default function AdminUsersManager({ initialUsers, unassignedDentists }: { initialUsers: DentistUser[]; unassignedDentists: Dentist[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [saving, setSaving] = useState<number | null>(null);
  const [assignMap, setAssignMap] = useState<Record<number, string>>({});
  const [filter, setFilter] = useState<"ALL" | Status>("ALL");

  const updateUser = async (id: number, body: object) => {
    setSaving(id);
    const res = await fetch(`/api/admin/dentist-users/${id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setSaving(null);
    if (res.ok) {
      setUsers(u => u.map(x => x.id === id ? { ...x, ...data } : x));
    }
  };

  const deleteUser = async (id: number) => {
    if (!confirm("این کاربر حذف شود؟")) return;
    await fetch(`/api/admin/dentist-users/${id}`, { method: "DELETE" });
    setUsers(u => u.filter(x => x.id !== id));
  };

  const filteredUsers = filter === "ALL" ? users : users.filter(u => u.status === filter);

  const counts = { ALL: users.length, PENDING: 0, ACTIVE: 0, SUSPENDED: 0 };
  users.forEach(u => counts[u.status]++);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#133b48" }}>کاربران دندانپزشک</h1>
        <div style={{ fontSize: 14, color: "#6c8b95" }}>{users.length} کاربر ثبت‌نام کرده</div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {(["ALL", "PENDING", "ACTIVE", "SUSPENDED"] as const).map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{ border: "1px solid " + (filter === s ? "#0c8aa6" : "#dceaef"), borderRadius: 30, padding: "7px 16px", fontSize: 13.5, fontFamily: "inherit", cursor: "pointer", background: filter === s ? "#e0f2f8" : "#fff", color: filter === s ? "#0c8aa6" : "#5a7a85", fontWeight: filter === s ? 700 : 500 }}>
            {s === "ALL" ? "همه" : STATUS_LABELS[s]}
            <span style={{ marginRight: 6, background: filter === s ? "#0c8aa6" : "#dceaef", color: filter === s ? "#fff" : "#5a7a85", borderRadius: 30, padding: "1px 7px", fontSize: 12 }}>{counts[s]}</span>
          </button>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div style={{ background: "#fff", border: "1px solid #e7f0f3", borderRadius: 18, padding: "60px 24px", textAlign: "center", color: "#9bb6bf" }}>
          کاربری یافت نشد
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {filteredUsers.map(user => {
          const sc = STATUS_COLORS[user.status];
          return (
            <div key={user.id} style={{ background: "#fff", border: "1px solid #e7f0f3", borderRadius: 18, padding: "20px 22px", boxShadow: "0 2px 12px -4px rgba(13,75,107,.1)" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
                <div style={{ width: 46, height: 46, borderRadius: 14, background: "linear-gradient(135deg,#0c8aa6,#0a4f63)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                  <span style={{ color: "#fff", fontSize: 18, fontWeight: 800 }}>{user.name[0]}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: 16, color: "#133b48" }}>{user.name}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 11px", borderRadius: 20, background: sc.bg, color: sc.color }}>{STATUS_LABELS[user.status]}</span>
                  </div>
                  <div style={{ fontSize: 13.5, color: "#6c8b95", direction: "ltr", marginBottom: 2 }}>{user.email}</div>
                  {user.phone && <div style={{ fontSize: 13, color: "#9bb6bf", direction: "ltr" }}>{user.phone}</div>}
                  {user.dentist && (
                    <div style={{ marginTop: 6, fontSize: 13, color: "#0c8aa6", fontWeight: 600 }}>
                      پروفایل: {user.dentist.title}
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                  {/* Status change */}
                  {user.status === "PENDING" && (
                    <button onClick={() => updateUser(user.id, { status: "ACTIVE" })} disabled={saving === user.id} style={{ background: "#dcfce7", color: "#16a34a", border: "1px solid #bbf7d0", borderRadius: 10, padding: "8px 14px", fontSize: 13, fontFamily: "inherit", cursor: "pointer", fontWeight: 700 }}>
                      {saving === user.id ? "…" : "تأیید"}
                    </button>
                  )}
                  {user.status === "ACTIVE" && (
                    <button onClick={() => updateUser(user.id, { status: "SUSPENDED" })} disabled={saving === user.id} style={{ background: "#fee2e2", color: "#b91c1c", border: "1px solid #fca5a5", borderRadius: 10, padding: "8px 14px", fontSize: 13, fontFamily: "inherit", cursor: "pointer", fontWeight: 700 }}>
                      {saving === user.id ? "…" : "تعلیق"}
                    </button>
                  )}
                  {user.status === "SUSPENDED" && (
                    <button onClick={() => updateUser(user.id, { status: "ACTIVE" })} disabled={saving === user.id} style={{ background: "#dcfce7", color: "#16a34a", border: "1px solid #bbf7d0", borderRadius: 10, padding: "8px 14px", fontSize: 13, fontFamily: "inherit", cursor: "pointer", fontWeight: 700 }}>
                      {saving === user.id ? "…" : "فعال‌سازی مجدد"}
                    </button>
                  )}
                  <button onClick={() => deleteUser(user.id)} style={{ background: "#fff1f1", color: "#c0392b", border: "1px solid #fcc", borderRadius: 10, padding: "8px 12px", fontSize: 13, fontFamily: "inherit", cursor: "pointer" }}>
                    حذف
                  </button>
                </div>
              </div>

              {/* Assign dentist */}
              <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid #f0f6f8", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#2a4f5b" }}>اختصاص پروفایل:</label>
                <select
                  value={assignMap[user.id] ?? (user.dentistId?.toString() || "")}
                  onChange={e => setAssignMap(m => ({ ...m, [user.id]: e.target.value }))}
                  style={{ border: "1.5px solid #dceaef", borderRadius: 10, padding: "7px 12px", fontSize: 13.5, fontFamily: "inherit", outline: "none", background: "#f8fbfc" }}
                >
                  <option value="">بدون پروفایل</option>
                  {user.dentist && <option value={user.dentist.id}>{user.dentist.title} (فعلی)</option>}
                  {unassignedDentists.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
                </select>
                <button
                  onClick={() => {
                    const val = assignMap[user.id];
                    if (val === undefined) return;
                    updateUser(user.id, { dentistId: val ? parseInt(val) : null });
                  }}
                  disabled={saving === user.id || assignMap[user.id] === undefined}
                  style={{ background: "linear-gradient(135deg,#0c8aa6,#0a4f63)", color: "#fff", border: "none", borderRadius: 10, padding: "8px 16px", fontSize: 13.5, fontFamily: "inherit", cursor: "pointer", fontWeight: 600, opacity: assignMap[user.id] === undefined ? 0.4 : 1 }}
                >
                  ذخیره
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
