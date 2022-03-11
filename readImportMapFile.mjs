// @ts-check

import assertImportMap from "./assertImportMap.mjs";

/**
 * Reads an import map JSON file.
 * @see https://github.com/WICG/import-maps
 * @param {URL} importMapFileUrl Import map file URL.
 * @returns {Promise<import("./assertImportMap.mjs").ImportMap>} Resolves the
 *   import map.
 */
export default async function readImportMapFile(importMapFileUrl) {
  if (!(importMapFileUrl instanceof URL)) {
    throw new TypeError(
      "Argument 1 `importMapFileUrl` must be a `URL` instance.",
    );
  }

  /** @type {string} */
  let importMapJson;

  try {
    importMapJson = await Deno.readTextFile(importMapFileUrl);
  } catch (cause) {
    throw new Error(
      `Error reading import map file \`${importMapFileUrl.href}\`.`,
      { cause },
    );
  }

  /** @type {import("./assertImportMap.mjs").ImportMap} */
  let importMapData;

  try {
    importMapData = JSON.parse(importMapJson);
  } catch (cause) {
    throw new Error(
      `Invalid JSON in import map file \`${importMapFileUrl.href}\`.`,
      { cause },
    );
  }

  try {
    assertImportMap(importMapData);
  } catch (cause) {
    throw new TypeError(
      `Invalid content in import map file \`${importMapFileUrl.href}\`.`,
      { cause },
    );
  }

  return importMapData;
}
