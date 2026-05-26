/**
 * Export scholarships from frontend/src/lib/scholarships.ts to backend/data/scholarships.json
 * Run from repo root: npm run export:scholarships
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { scholarships } from "../frontend/src/lib/scholarships.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "backend/data");
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "scholarships.json");
writeFileSync(outPath, JSON.stringify(scholarships, null, 2), "utf8");
console.log(`Wrote ${scholarships.length} scholarships to ${outPath}`);
