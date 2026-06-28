import { prisma } from "@/lib/prisma";
import SettingsForm from "./SettingsForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "تنظیمات | ادمین" };

const SETTING_KEYS = [
  { key: "site_title", label: "عنوان سایت", type: "text" },
  { key: "site_description", label: "توضیحات سایت", type: "textarea" },
  { key: "contact_phone", label: "شماره تماس", type: "text" },
  { key: "contact_email", label: "ایمیل تماس", type: "email" },
  { key: "contact_address", label: "آدرس", type: "textarea" },
  { key: "instagram", label: "اینستاگرام (آدرس)", type: "text" },
  { key: "telegram", label: "تلگرام (آدرس)", type: "text" },
];

export default async function AdminSettingsPage() {
  const rows = await prisma.setting.findMany();
  const settings: Record<string, string> = {};
  rows.forEach(r => { settings[r.key] = r.value; });

  return (
    <div style={{ maxWidth: 680 }}>
      <h1 style={{ margin: "0 0 28px", fontSize: 24, fontWeight: 800, color: "#133b48" }}>تنظیمات سایت</h1>
      <SettingsForm keys={SETTING_KEYS} settings={settings} />
    </div>
  );
}
