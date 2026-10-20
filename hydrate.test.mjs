// @ts-check

/**
 * @import { Browser } from "@astral/astral"
 * @import * as hydrateExports from "./hydrate.mjs"
 */

import { after, before, suite, test } from "node:test";
import { launch } from "@astral/astral";
import { assertEquals } from "@std/assert/equals";
import { assertRejects } from "@std/assert/rejects";
import { createElement as h, Fragment } from "react";

import serveProjectFiles from "./test/serveProjectFiles.mjs";
import testBrowserPage from "./test/testBrowserPage.mjs";
import hydrate from "./hydrate.mjs";
import readImportMapFile from "./readImportMapFile.mjs";

suite("Function `hydrate`.", {
  concurrency: true,
}, () => {
  const resources = new AsyncDisposableStack();

  // Todo: Avoid the before hook once Deno supports `suite` from `node:test`
  // having an async callback:
  // https://github.com/denoland/deno/issues/36876

  /** @type {Browser} */
  let browser;

  /** @type {URL} */
  let projectFilesOriginUrl;

  /** @type {string} */
  let scriptImportMap;

  before(async () => {
    browser = resources.use(await launch());

    const projectFileServer = resources.use(serveProjectFiles());

    projectFilesOriginUrl = new URL(
      `http://localhost:${projectFileServer.addr.port}`,
    );

    const clientImportMap = await readImportMapFile(
      new URL("importMap.json", import.meta.url),
    );

    if (!clientImportMap.imports) {
      throw new TypeError("Import map field `imports` missing.");
    }

    clientImportMap.imports["ruck/"] = projectFilesOriginUrl.href;

    scriptImportMap = `<script type="importmap">${
      JSON.stringify(clientImportMap)
    }</script>`;
  });

  after(() => resources.disposeAsync());

  test("Option `router` not a function.", async () => {
    await assertRejects(
      () =>
        hydrate({
          appComponent: () => h(Fragment),
          // @ts-expect-error Testing invalid.
          router: true,
          cacheData: {},
        }),
      TypeError,
      "Option `router` must be a function.",
    );
  });

  suite("Ruck DOM node errors.", {
    concurrency: true,
  }, () => {
    const htmlRuckHeadStart = `<meta name="ruck-head-start" />`;
    const htmlRuckHeadEnd = `<meta name="ruck-head-end" />`;
    const htmlRuckBodyReactRoot = `<div id="ruck-app"></div>`;

    for (
      const [
        expectedErrorMessage,
        htmlHead,
        htmlBody,
      ]
        of /** @satisfies {Array<[expectedErrorMessage: string, htmlHead: string, htmlBody: string]>} */
        ([
          [
            "Ruck body React app DOM node missing.",
            htmlRuckHeadStart + htmlRuckHeadEnd,
            "",
          ],
          [
            "Ruck head React app start DOM node missing.",
            htmlRuckHeadEnd,
            htmlRuckBodyReactRoot,
          ],
          [
            "Ruck head React app end DOM node missing.",
            htmlRuckHeadStart,
            htmlRuckBodyReactRoot,
          ],
        ])
    ) {
      test(
        expectedErrorMessage,
        () =>
          testBrowserPage(browser, projectFilesOriginUrl, async (page) => {
            await page.setContent(/* HTML */ `<!DOCTYPE html>
<html>
  <head>
    ${scriptImportMap}
    ${htmlHead}
  </head>
  ${htmlBody}
</html>`);

            const result = await page.evaluate(
              async () => {
                /** @type {hydrateExports} */
                const { default: hydrate } = await import("ruck/hydrate.mjs");

                try {
                  await hydrate({
                    appComponent: /** @type {any} */ (() => {}),
                    router: /** @type {any} */ (() => {}),
                    cacheData: {},
                  });
                } catch (error) {
                  return error instanceof Error
                    ? {
                      name: error.name,
                      message: error.message,
                    }
                    : JSON.stringify(error, null, 2);
                }
              },
            );

            assertEquals(result, {
              name: "Error",
              message: expectedErrorMessage,
            });
          }),
      );
    }
  });
});
