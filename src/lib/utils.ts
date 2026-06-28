import * as jalaali from "jalaali-js";

export function toJalali(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  const { jy, jm, jd } = jalaali.toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate());
  const months = ["فروردین","اردیبهشت","خرداد","تیر","مرداد","شهریور","مهر","آبان","آذر","دی","بهمن","اسفند"];
  return `${toPersian(jd)} ${months[jm - 1]} ${toPersian(jy)}`;
}

export function toPersian(n: number | string): string {
  return String(n).replace(/\d/g, d => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d)]);
}

export function getInitial(title: string): string {
  if (!title) return "؟";
  const words = title.trim().split(/\s+/);
  if (words.length > 1) return words[words.length - 1][0] || words[0][0];
  return title[0];
}

const GRADIENTS = [
  "linear-gradient(135deg,#16b8d1,#0a6f9e)",
  "linear-gradient(135deg,#8b5cf6,#16b8d1)",
  "linear-gradient(135deg,#f43f5e,#f59e0b)",
  "linear-gradient(135deg,#0ea5e9,#22c55e)",
  "linear-gradient(135deg,#6366f1,#0a6f9e)",
  "linear-gradient(135deg,#0a8f86,#0a3f54)",
  "linear-gradient(135deg,#f59e0b,#ec4899)",
];

export function gradientFromId(id: number): string {
  return GRADIENTS[id % GRADIENTS.length];
}

export function estimateReadTime(content: string): number {
  const words = content?.replace(/<[^>]+>/g, "").split(/\s+/).length || 0;
  return Math.max(1, Math.round(words / 200));
}
