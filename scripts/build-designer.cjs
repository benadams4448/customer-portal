const { spawnSync } = require("node:child_process");
const { copyFileSync } = require("node:fs");

const result = spawnSync(process.execPath, [require.resolve("next/dist/bin/next"), "build", "designer-preview"], {
  stdio: "inherit",
});
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);

copyFileSync("designer-preview/static-vercel.json", "designer-preview/out/vercel.json");
