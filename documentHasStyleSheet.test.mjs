// @ts-check

/**
 * @import * as documentHasStyleSheetExports from "./documentHasStyleSheet.mjs"
 */

import { launch } from "@astral/astral";

import serveProjectFiles from "./test/serveProjectFiles.mjs";
import testBrowserPage from "./test/testBrowserPage.mjs";

Deno.test("`documentHasStyleSheet` in a DOM environment.", async () => {
  const abortController = new AbortController();
  const projectFileServer = serveProjectFiles(abortController.signal);

  try {
    const projectFilesOriginUrl = new URL(
      `http://localhost:${projectFileServer.addr.port}`,
    );
    const browser = await launch();

    try {
      await testBrowserPage(browser, projectFilesOriginUrl, async (page) => {
        // Test with a document without a base URI…

        await page.goto(
          `http://localhost:${projectFileServer.addr.port}/test/fixtures/documentHasStyleSheet/without-base.html`,
        );

        await page.evaluate(
          /** @param {number} projectFileServerPort Project file server port. */
          async (projectFileServerPort) => {
            /** @type {documentHasStyleSheetExports} */
            const { default: documentHasStyleSheet } = await import(
              `http://localhost:${projectFileServerPort}/documentHasStyleSheet.mjs`
            );

            try {
              documentHasStyleSheet(
                // @ts-expect-error Testing invalid.
                true,
              );

              throw new Error("Expected an error.");
            } catch (error) {
              if (
                !(error instanceof TypeError) ||
                error.message !== "Argument 1 `href` must be a string."
              ) {
                throw error;
              }
            }

            // Test with a not loaded style sheet.
            for (
              const href of [
                // Absolute.
                `http://localhost:${projectFileServerPort}/test/fixtures/documentHasStyleSheet/css/missing.css`,
                // Origin relative.
                "/test/fixtures/documentHasStyleSheet/css/missing.css",
                // Base relative.
                "css/missing.css",
              ]
            ) {
              if (documentHasStyleSheet(href) !== false) {
                throw new Error("Incorrect return value.");
              }
            }

            // Test with loaded style sheets.
            for (const name of ["empty", "parsable", "unparsable"]) {
              for (
                const href of [
                  // Absolute.
                  `http://localhost:${projectFileServerPort}/test/fixtures/documentHasStyleSheet/css/${name}.css`,
                  // Origin relative.
                  `/test/fixtures/documentHasStyleSheet/css/${name}.css`,
                  // Base relative.
                  `css/${name}.css`,
                ]
              ) {
                if (documentHasStyleSheet(href) !== true) {
                  throw new Error("Incorrect return value.");
                }
              }
            }
          },
          {
            args: [projectFileServer.addr.port],
          },
        );

        // Test with a document with a base URI…

        await page.goto(
          `http://localhost:${projectFileServer.addr.port}/test/fixtures/documentHasStyleSheet/with-base.html`,
        );

        await page.evaluate(
          /** @param {number} projectFileServerPort Project file server port. */
          async (projectFileServerPort) => {
            /** @type {documentHasStyleSheetExports} */
            const { default: documentHasStyleSheet } = await import(
              `http://localhost:${projectFileServerPort}/documentHasStyleSheet.mjs`
            );

            // Test with a not loaded style sheet.
            for (
              const href of [
                // Absolute.
                `http://localhost:${projectFileServerPort}/test/fixtures/documentHasStyleSheet/css/missing.css`,
                // Origin relative.
                "/test/fixtures/documentHasStyleSheet/css/missing.css",
                // Base relative.
                "missing.css",
              ]
            ) {
              if (documentHasStyleSheet(href) !== false) {
                throw new Error("Incorrect return value.");
              }
            }

            // Test with loaded style sheets.
            for (const name of ["empty", "parsable", "unparsable"]) {
              for (
                const href of [
                  // Absolute.
                  `http://localhost:${projectFileServerPort}/test/fixtures/documentHasStyleSheet/css/${name}.css`,
                  // Origin relative.
                  `/test/fixtures/documentHasStyleSheet/css/${name}.css`,
                  // Base relative.
                  `${name}.css`,
                ]
              ) {
                if (documentHasStyleSheet(href) !== true) {
                  throw new Error("Incorrect return value.");
                }
              }
            }
          },
          {
            args: [projectFileServer.addr.port],
          },
        );
      });
    } finally {
      await browser.close();
    }
  } finally {
    abortController.abort();
    await projectFileServer.finished;
  }
});
