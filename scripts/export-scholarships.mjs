/**
 * Export scholarships from frontend/src/lib/scholarships.ts to backend/data/scholarships.json
 * Run from repo root: npm run export:scholarships
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

async function main() {
  const moduleUrl = pathToFileURL(join(root, "frontend/src/lib/scholarships.ts")).href;
  const { scholarships } = await import(moduleUrl);
  const outDir = join(root, "backend/data");
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "scholarships.json");
  writeFileSync(outPath, JSON.stringify(scholarships, null, 2), "utf8");
  console.log(`Wrote ${scholarships.length} scholarships to ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
