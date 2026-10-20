// @ts-check

/** @import { Page } from "@astral/astral" */

import { Browser } from "@astral/astral";
import { assert } from "@std/assert/assert";

import readImportMapFile from "../readImportMapFile.mjs";
import serve from "../serve.mjs";
import testBrowserPage from "./testBrowserPage.mjs";

/**
 * Serves a test fixture Ruck project and creates a browser page to test it.
 * @param {Browser} browser Astral browser.
 * @param {URL} projectFilesOriginUrl Project files origin URL.
 * @param {string} fixturePath Path in the test fixtures directory.
 * @param {(page: Page, appOriginUrl: URL) => void | Promise<void>} callback
 *   Receives the Astral browser page and Ruck app origin URL, ready for
 *   testing.
 */
export default async function serveRuckFixtureForBrowser(
  browser,
  projectFilesOriginUrl,
  fixturePath,
  callback,
) {
  if (!(browser instanceof Browser)) {
    throw new TypeError(
      "Argument 1 `browser` must be an Astral `Browser` instance.",
    );
  }

  if (!(projectFilesOriginUrl instanceof URL)) {
    throw new TypeError(
      "Argument 2 `projectFilesOriginUrl` must be a `URL` instance.",
    );
  }

  if (typeof fixturePath !== "string") {
    throw new TypeError("Argument 3 `fixturePath` must be a string.");
  }

  if (typeof callback !== "function") {
    throw new TypeError("Argument 4 `callback` must be a function.");
  }

  const clientImportMap = await readImportMapFile(
    new URL("../importMap.json", import.meta.url),
  );

  assert(clientImportMap.imports);

  clientImportMap.imports["ruck/"] = projectFilesOriginUrl.href;

  await using ruckServer = await serve({
    clientImportMap,
    publicDir: new URL(`fixtures/${fixturePath}/`, import.meta.url),
  });

  await testBrowserPage(
    browser,
    projectFilesOriginUrl,
    (page) =>
      callback(page, new URL(`http://localhost:${ruckServer.addr.port}`)),
  );
}
