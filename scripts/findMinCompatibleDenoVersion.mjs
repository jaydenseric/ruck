#! /usr/bin/env -S deno run --allow-net --allow-run

// @ts-check
// Finds and outputs Ruck’s minimum compatible Deno version, by binary searching
// Deno versions for the oldest that the tests (and types) pass with.

/**
 * Async binary search.
 * @see https://stackoverflow.com/a/41956372
 * @template T
 * @param {Array<T>} array
 * @param {(item: T) => boolean | Promise<boolean>} predicate Sync or async
 *   function that returns if the item is a match.
 * @returns {Promise<number>} Array index of the found item.
 */
async function binarySearch(array, predicate) {
  let min = -1;
  let max = array.length;

  while (1 + min < max) {
    const mid = min + ((max - min) >> 1);

    if (await predicate(array[mid])) max = mid;
    else min = mid;
  }

  return max;
}

/**
 * Installs a particular version of Deno.
 * @param {string} version Deno version. SemVer without a leading `v`.
 */
async function installDenoVersion(version) {
  const process = Deno.run({ cmd: ["deno", "upgrade", "--version", version] });
  const status = await process.status();
  if (!status.success) throw new Error("Deno installation failed.");
}

const response = await fetch(
  "https://raw.githubusercontent.com/denoland/dotland/main/versions.json",
);
const json = await response.json();

/**
 * Deno versions. SemVer with a leading `v`.
 * @type {Array<string>}
 */
const denoVersions = json.cli;

/** Original Deno version. SemVer without a leading `v`. */
const originalDenoVersion = Deno.version.deno;

/**
 * Minimum compatible Deno version. SemVer with a leading `v`.
 * @type {string | null}
 */
let minCompatibleDenoVersion = null;

try {
  const latestFailingDenoVersionIndex = await binarySearch(
    denoVersions,
    async (version) => {
      console.log(`Installing Deno ${version}…`);
      await installDenoVersion(version.replace(/^v/u, ""));

      console.log(`Testing Deno ${version}…`);
      const process = Deno.run({ cmd: ["./scripts/test.sh"] });
      const status = await process.status();
      return !status.success;
    },
  );

  if (latestFailingDenoVersionIndex) {
    minCompatibleDenoVersion = denoVersions[latestFailingDenoVersionIndex - 1];
  }
} finally {
  console.log(`Restoring Deno v${originalDenoVersion}…`);
  await installDenoVersion(originalDenoVersion);
}

console.log(
  minCompatibleDenoVersion
    ? `Minimum compatible Deno version is ${minCompatibleDenoVersion}.`
    : "No Deno version is compatible.",
);
