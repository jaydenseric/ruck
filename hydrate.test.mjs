// @ts-check

/** @import * as hydrateExports from "./hydrate.mjs" */

import { launch } from "@astral/astral";
import { createElement as h, Fragment } from "react";

import serveProjectFiles from "./test/serveProjectFiles.mjs";
import testBrowserPage from "./test/testBrowserPage.mjs";
import readImportMapFile from "./readImportMapFile.mjs";

Deno.test("`hydrate` in a DOM environment.", async () => {
  const abortController = new AbortController();
  const projectFileServer = serveProjectFiles(abortController.signal);

  try {
    const projectFilesOriginUrl = new URL(
      `http://localhost:${projectFileServer.addr.port}`,
    );
    const clientImportMap = await readImportMapFile(
      new URL("importMap.json", import.meta.url),
    );

    if (!clientImportMap.imports) {
      throw new TypeError("Import map field `imports` missing.");
    }

    clientImportMap.imports["ruck/"] = projectFilesOriginUrl.href;

    const scriptImportMap = `<script type="importmap">${
      JSON.stringify(clientImportMap)
    }</script>`;
    const htmlRuckHeadStart = `<meta name="ruck-head-start" />`;
    const htmlRuckHeadEnd = `<meta name="ruck-head-end" />`;
    const htmlRuckBodyReactRoot = `<div id="ruck-app"></div>`;

    const browser = await launch();

    try {
      // Todo: Refactor to use Deno test steps once this Deno bug is fixed:
      // https://github.com/denoland/deno/issues/15425

      // Test `hydrate` with option `router` not a function.
      await testBrowserPage(
        browser,
        projectFilesOriginUrl,
        async (page) => {
          await page.setContent(/* HTML */ `<!DOCTYPE html>
<html>
  <head>
    ${scriptImportMap}
    ${htmlRuckHeadStart}
    ${htmlRuckHeadEnd}
  </head>
  ${htmlRuckBodyReactRoot}
</html>`);

          await page.evaluate(async () => {
            /** @type {hydrateExports} */
            const { default: hydrate } = await import("ruck/hydrate.mjs");

            try {
              await hydrate({
                appComponent: () => h(Fragment),
                // @ts-expect-error Testing invalid.
                router: true,
                cacheData: {},
              });

              throw new Error("Expected an error.");
            } catch (error) {
              if (
                !(error instanceof TypeError) ||
                error.message !== "Option `router` must be a function."
              ) {
                throw error;
              }
            }
          });
        },
      );

      // Test `hydrate` with Ruck body React app DOM node missing.
      await testBrowserPage(
        browser,
        projectFilesOriginUrl,
        async (page) => {
          await page.setContent(/* HTML */ `<!DOCTYPE html>
<html>
  <head>
    ${scriptImportMap}
    ${htmlRuckHeadStart}
    ${htmlRuckHeadEnd}
  </head>
</html>`);

          await page.evaluate(async () => {
            /** @type {hydrateExports} */
            const { default: hydrate } = await import("ruck/hydrate.mjs");

            try {
              await hydrate({
                appComponent: /** @type {any} */ (() => {}),
                router: /** @type {any} */ (() => {}),
                cacheData: {},
              });

              throw new Error("Expected an error.");
            } catch (error) {
              if (
                !(error instanceof Error) ||
                error.message !== "Ruck body React app DOM node missing."
              ) {
                throw error;
              }
            }
          });
        },
      );

      // Test `hydrate` with Ruck head React app start DOM node missing.
      await testBrowserPage(
        browser,
        projectFilesOriginUrl,
        async (page) => {
          await page.setContent(/* HTML */ `<!DOCTYPE html>
<html>
  <head>
    ${scriptImportMap}
    ${htmlRuckHeadEnd}
  </head>
  ${htmlRuckBodyReactRoot}
</html>`);

          await page.evaluate(async () => {
            /** @type {hydrateExports} */
            const { default: hydrate } = await import("ruck/hydrate.mjs");

            try {
              await hydrate({
                appComponent: /** @type {any} */ (() => {}),
                router: /** @type {any} */ (() => {}),
                cacheData: {},
              });

              throw new Error("Expected an error.");
            } catch (error) {
              if (
                !(error instanceof Error) ||
                error.message !== "Ruck head React app start DOM node missing."
              ) {
                throw error;
              }
            }
          });
        },
      );

      // Test `hydrate` with Ruck head React app end DOM node missing.
      await testBrowserPage(
        browser,
        projectFilesOriginUrl,
        async (page) => {
          await page.setContent(/* HTML */ `<!DOCTYPE html>
<html>
  <head>
    ${scriptImportMap}
    ${htmlRuckHeadStart}
  </head>
  ${htmlRuckBodyReactRoot}
</html>`);

          await page.evaluate(async () => {
            /** @type {hydrateExports} */
            const { default: hydrate } = await import("ruck/hydrate.mjs");

            try {
              await hydrate({
                appComponent: /** @type {any} */ (() => {}),
                router: /** @type {any} */ (() => {}),
                cacheData: {},
              });

              throw new Error("Expected an error.");
            } catch (error) {
              if (
                !(error instanceof Error) ||
                error.message !== "Ruck head React app end DOM node missing."
              ) {
                throw error;
              }
            }
          });
        },
      );
    } finally {
      await browser.close();
    }
  } finally {
    abortController.abort();
    await projectFileServer.finished;
  }
});
