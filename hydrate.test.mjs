// @ts-check

import puppeteer from "puppeteer";
import { createElement as h, Fragment } from "react";

import serveProjectFiles from "./test/serveProjectFiles.mjs";
import testPuppeteerPage from "./test/testPuppeteerPage.mjs";
import readImportMapFile from "./readImportMapFile.mjs";

Deno.test("`hydrate` in a DOM environment.", async () => {
  const abortController = new AbortController();
  const projectFileServer = await serveProjectFiles(abortController.signal);

  try {
    const projectFilesOriginUrl = new URL(
      `http://localhost:${projectFileServer.port}`,
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

    const browser = await puppeteer.launch();

    try {
      // Todo: Refactor to use Deno test steps once this Deno bug is fixed:
      // https://github.com/denoland/deno/issues/15425

      // Test `hydrate` with option `router` not a function.
      await testPuppeteerPage(
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
            const { default: hydrate } =
              await /** @type {Promise<import("./hydrate.mjs")>} */ (import(
                "ruck/hydrate.mjs"
              ));

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
      await testPuppeteerPage(
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
            const { default: hydrate } =
              await /** @type {Promise<import("./hydrate.mjs")>} */ (import(
                "ruck/hydrate.mjs"
              ));

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
      await testPuppeteerPage(
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
            const { default: hydrate } =
              await /** @type {Promise<import("./hydrate.mjs")>} */ (import(
                "ruck/hydrate.mjs"
              ));

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
      await testPuppeteerPage(
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
            const { default: hydrate } =
              await /** @type {Promise<import("./hydrate.mjs")>} */ (import(
                "ruck/hydrate.mjs"
              ));

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
    await projectFileServer.close;
  }
});
