// Bundles the storefront element (`element/payment-element.ts`) into the `.js` beside
// it, which the spore serves (`include_str!`). With --check, fails instead of writing
// when the committed bundle is out of date (CI runs it).

import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { build } from "vite-plus";

const root = join(import.meta.dirname, "..");
const entry = join(root, "element", "payment-element.ts");
const target = join(root, "element", "payment-element.js");
const check = process.argv.includes("--check");

const result = await build({
  // The repository's root, whatever the working directory: the output names paths
  // relative to it, so a build from anywhere gives the same bytes.
  root,
  configFile: false,
  logLevel: "silent",
  build: {
    write: false,
    minify: true,
    target: "es2022",
    lib: { entry, formats: ["es"], fileName: "element" },
    // A library's ES output keeps its whitespace unless told: this one is served.
    rolldownOptions: { output: { minify: true, comments: false } },
  },
});
const outputs = (Array.isArray(result) ? result : [result]).flatMap((r) => r.output);
const chunk = outputs.find((o) => o.type === "chunk" && o.isEntry);
if (!chunk) throw new Error(`nothing was bundled for ${entry}`);

const current = await readFile(target, "utf8").catch(() => undefined);
if (current !== chunk.code) {
  if (check) {
    console.error(`out of date (run \`pnpm build\`): ${target}`);
    process.exit(1);
  }
  await writeFile(target, chunk.code);
  console.log(`wrote ${target}`);
}
