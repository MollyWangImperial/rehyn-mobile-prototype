import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

// Build an interactive, prerendered site for Render's static hosting.
execFileSync(process.execPath, ["node_modules/vite/bin/vite.js", "build"], {
  stdio: "inherit",
  env: { ...process.env, REHYN_STATIC_BUILD: "1" },
});

const index = readFileSync("dist/client/index.html", "utf8");
if (!index.includes("rehyn-device") || !index.includes("<script")) {
  throw new Error("The static build must contain the Rehyn page and its interactive scripts.");
}
