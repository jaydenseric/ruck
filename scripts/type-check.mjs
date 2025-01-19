#!/usr/bin/env -S deno run --allow-read --allow-write --allow-run

// @ts-check
// Type checks every JavaScript module in the project.

import { expandGlob } from "@std/fs/expand-glob";

const typeCheckIndexModuleName = "type-check-index.mjs";

console.log("Creating a temporary index module to check…");

let rawModule = "";

for await (const { path } of expandGlob("**\/*.mjs")) {
  rawModule += `import "${path}";\n`;
}

await Deno.writeTextFile(typeCheckIndexModuleName, rawModule);

console.log("Checking the temporary index module…");

const process = Deno.run({
  cmd: ["deno", "check", "--remote", typeCheckIndexModuleName],
  stdout: "piped",
  stderr: "piped",
});

const { code } = await process.status();
const rawOutput = await process.output();
const rawError = await process.stderrOutput();

if (code === 0) await Deno.stdout.write(rawOutput);
else await Deno.stderr.write(rawError);

console.log("Deleting the temporary index module…");

await Deno.remove(typeCheckIndexModuleName);

Deno.exit(code);
