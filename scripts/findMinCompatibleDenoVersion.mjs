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
  const command = new Deno.Command("deno", {
    args: ["upgrade", "--version", version],
  });
  const { success } = await command.output();

  if (!success) throw new Error("Deno installation failed.");
}

const response = await fetch("https://crates.io/api/v1/crates/deno");
const json = await response.json();

/**
 * Deno versions, excluding yanked and pre-releases. SemVer without a leading
 * `v`.
 * @type {Array<string>}
 */
const denoVersions = json.versions.reduce(
  /**
   * @param {Array<string>} versions Accumulated versions.
   * @param {any} version Deno version data.
   */
  (versions, version) => {
    if (!version.yanked && !version.num.includes("-")) {
      versions.push(version.num);
    }

    return versions;
  },
  [],
);

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
      console.log(`Installing Deno v${version}…`);

      await installDenoVersion(version);

      console.log(`Testing Deno v${version}…`);

      const command = new Deno.Command("./scripts/test.sh");
      const { success } = await command.output();

      return !success;
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
