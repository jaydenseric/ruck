// @ts-check

import { ensureDir } from "std/fs/mod.ts";
import { fromFileUrl } from "std/path/mod.ts";
import { assertEquals } from "std/testing/asserts.ts";

const projectDirUrl = new URL("../", import.meta.url);
const coverageDirUrl = new URL(".coverage/", projectDirUrl);

/**
 * Creates a new Puppeteer page for testing served project files with script
 * coverage enabled.
 * @param {import("puppeteer").Browser} browser Puppeteer browser.
 * @param {URL} projectFilesOriginUrl Project files origin URL.
 * @param {(page: import("puppeteer").Page) => void | Promise<void>} callback
 *   Receives the Puppeteer page, ready for testing.
 */
export default async function testPuppeteerPage(
  browser,
  projectFilesOriginUrl,
  callback,
) {
  // Unable to do an `instanceof` check.
  if (typeof browser !== "object" || !browser) {
    throw new TypeError(
      "Argument 1 `browser` must be a Puppeteer `Browser` instance.",
    );
  }

  if (!(projectFilesOriginUrl instanceof URL)) {
    throw new TypeError(
      "Argument 3 `projectFilesOriginUrl` must be a `URL` instance.",
    );
  }

  if (typeof callback !== "function") {
    throw new TypeError("Argument 5 `callback` must be a function.");
  }

  const page = await browser.newPage();

  try {
    /** @type {Array<Error>} */
    const pageErrors = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error);
    });

    page.on("console", async (message) => {
      const type = message.type();
      const summary = `Puppeteer page console ${type}`;

      switch (type) {
        case "error":
        case "info":
        case "log":
        case "warning": {
          const args = await Promise.all(
            message.args().map((arg) =>
              arg.executionContext().evaluate(
                /** @param {unknown} value */
                (value) => value instanceof Error ? value.message : value,
                arg,
              )
            ),
          );

          // Workaround Puppeteer not providing the arguments when the console
          // method was called internally by Puppeteer instead of page code.
          if (!args.length) {
            const text = message.text();
            if (text) args.push(text);
          }

          console.group(`${summary}:`);
          console[type === "warning" ? "warn" : type](...args);
          console.groupEnd();

          break;
        }

        default:
          console.log(`${summary} occurred.`);
      }
    });

    await page.coverage.startJSCoverage();

    try {
      await callback(page);
    } finally {
      // @ts-ignore This private API is the only way to get the raw V8 script
      // coverage result, see:
      // https://github.com/puppeteer/puppeteer/issues/2136#issuecomment-657080751
      const pageClient = page._client;

      /** @type {{ result: Array<ScriptCoverage>}} */
      const { result } = await pageClient.send("Profiler.takePreciseCoverage");

      await page.coverage.stopJSCoverage();

      await ensureDir(fromFileUrl(coverageDirUrl));

      /** @type {Array<Promise<void>>} */
      const writes = [];

      for (const scriptCoverage of result) {
        if (scriptCoverage.url.startsWith(projectFilesOriginUrl.href)) {
          writes.push(
            Deno.writeTextFile(
              new URL(`${crypto.randomUUID()}.json`, coverageDirUrl),
              JSON.stringify({
                ...scriptCoverage,
                url: projectDirUrl.href +
                  scriptCoverage.url.slice(projectFilesOriginUrl.href.length),
              }),
            ),
          );
        }
      }

      await Promise.all(writes);
    }

    assertEquals(pageErrors, []);
  } finally {
    await page.close();
  }
}

/**
 * Coverage data for a source range.
 * @typedef {object} CoverageRange
 * @prop {number} startOffset Source offset for the range start.
 * @prop {number} endOffset Source offset for the range end.
 * @prop {number} count Collected execution count for the source range.
 */

/**
 * Coverage data for a JavaScript function.
 * @typedef {object} FunctionCoverage
 * @prop {string} functionName JavaScript function name.
 * @prop {Array<CoverageRange>} ranges Source ranges within the function with
 *   coverage data.
 * @prop {boolean} isBlockCoverage Does coverage data for this function have
 *   block granularity.
 */

/**
 * Coverage data for a JavaScript script.
 * @typedef {object} ScriptCoverage
 * @prop {string} scriptId JavaScript script ID.
 * @prop {string} url JavaScript script name or URL.
 * @prop {Array<FunctionCoverage>} functions Functions within the script that
 *   have coverage data.
 */
