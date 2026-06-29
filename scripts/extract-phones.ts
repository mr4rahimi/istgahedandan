import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as fs from "fs";
import * as path from "path";

const adapter = new PrismaPg({ connectionString: "postgresql://istgah:istgah_pass_2024@localhost:5436/istgahedandan" });
const prisma = new PrismaClient({ adapter });

const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

function toLatinDigits(s: string): string {
  return s
    .split("").map(c => {
      const pi = PERSIAN_DIGITS.indexOf(c);
      if (pi >= 0) return String(pi);
      const ai = ARABIC_DIGITS.indexOf(c);
      if (ai >= 0) return String(ai);
      return c;
    }).join("");
}

function normalizePhone(raw: string): string | null {
  const s = toLatinDigits(raw).replace(/[\s‌‍]/g, "");
  // Format: 33603065-021  or  33603065-21  → 02133603065
  const revMatch = s.match(/^(\d{7,8})-0?(\d{2,3})$/);
  if (revMatch) return "0" + revMatch[2].padStart(2, "0") + revMatch[1];
  // Format: 021-33603065  or  021 33603065
  const fwdMatch = s.replace("-", "").match(/^(0\d{2,3})(\d{7,8})$/);
  if (fwdMatch) return fwdMatch[1] + fwdMatch[2];
  // Already normalized: 02133603065
  if (/^0\d{9,10}$/.test(s)) return s;
  return null;
}

function extractPhones(text: string): string[] {
  const latinText = toLatinDigits(text);
  const match = latinText.match(/تلفن\s*:\s*([^\n\r]{5,80})/);
  if (!match) return [];

  const raw = match[1];
  const parts = raw.split(/\s*[\/،,]\s*/);
  const phones: string[] = [];

  for (const part of parts) {
    const trimmed = part.trim();
    // Extract digit+dash sequences that look like phone numbers
    const candidates = trimmed.match(/[\d\-]{7,14}/g) ?? [];
    for (const c of candidates) {
      const normalized = normalizePhone(c);
      if (normalized) phones.push(normalized);
    }
    if (phones.length >= 4) break;
  }

  return [...new Set(phones)].slice(0, 4);
}

async function main() {
  // Read dentists.json to get wp_post_id → phones mapping
  const jsonPath = path.resolve(__dirname, "../../scripts/extracted/dentists.json");
  const raw = fs.readFileSync(jsonPath, "utf-8");
  const dentistsJson = JSON.parse(raw) as Array<{
    wp_post_id: number;
    long_desc?: string;
    center_code?: string;
  }>;

  // Fetch all dentists with empty phones from DB
  const dbDentists = await prisma.dentist.findMany({
    select: { id: true, wpPostId: true, phones: true, longDesc: true, centerCode: true },
  });

  let updated = 0;
  let skipped = 0;

  for (const db of dbDentists) {
    // Re-extract if phones array has only 1 entry and long_desc may have more
    const existingPhones = db.phones as string[];
    const desc = db.longDesc || "";
    const hasMultipleInDesc = desc.includes("تلفن") && desc.match(/تلفن[^:]*:\s*[^\n]*\//) !== null;
    if (existingPhones.length > 1) { skipped++; continue; }
    if (existingPhones.length === 1 && !hasMultipleInDesc) { skipped++; continue; }

    // Prefer long_desc from DB (already imported), fallback to JSON
    let phones = extractPhones(desc);

    // Also try to extract center_code if missing
    let centerCode = db.centerCode;
    if (!centerCode && desc) {
      const ccMatch = desc.match(/کد\s*مرکز\s*:\s*([^\s\n،,\/]+)/);
      if (ccMatch && ccMatch[1] && ccMatch[1] !== "---" && ccMatch[1].trim() !== "") {
        centerCode = ccMatch[1].trim();
      }
    }

    // Fallback: try json entry
    if (phones.length === 0 && db.wpPostId) {
      const jsonEntry = dentistsJson.find(d => d.wp_post_id === db.wpPostId);
      if (jsonEntry?.long_desc) {
        phones = extractPhones(jsonEntry.long_desc);
      }
    }

    if (phones.length === 0 && !centerCode) { skipped++; continue; }

    const data: Record<string, unknown> = {};
    if (phones.length > 0) data.phones = phones;
    if (centerCode && !db.centerCode) data.centerCode = centerCode;

    await prisma.dentist.update({ where: { id: db.id }, data });
    updated++;
    if (phones.length > 0) console.log(`  ✓ ${phones.join(" / ")} → id=${db.id}`);
  }

  console.log(`\nUpdated: ${updated} | Skipped: ${skipped}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
