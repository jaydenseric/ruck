// @ts-check

/**
 * @import { Browser } from "@astral/astral"
 * @import * as documentHasStyleSheetExports from "./documentHasStyleSheet.mjs"
 */

import { after, before, suite, test } from "node:test";
import { launch } from "@astral/astral";
import { assertStrictEquals } from "@std/assert/strict-equals";
import { assertThrows } from "@std/assert/throws";

import serveProjectFiles from "./test/serveProjectFiles.mjs";
import testBrowserPage from "./test/testBrowserPage.mjs";
import documentHasStyleSheet from "./documentHasStyleSheet.mjs";

suite("Function `documentHasStyleSheet`.", {
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

  before(async () => {
    browser = resources.use(await launch());

    const projectFileServer = resources.use(serveProjectFiles());

    projectFilesOriginUrl = new URL(
      `http://localhost:${projectFileServer.addr.port}`,
    );
  });

  after(() => resources.disposeAsync());

  test("Argument 1 `href` not a string.", () => {
    assertThrows(
      () => {
        documentHasStyleSheet(
          // @ts-expect-error Testing invalid.
          true,
        );
      },
      TypeError,
      "Argument 1 `href` must be a string.",
    );
  });

  for (
    const [testName, fixtureHtmlFilename, styleSheetHref, expectedResult]
      of /** @satisfies {Array<[testName: string, fixtureHtmlFilename: string, styleSheetHref: string, expectedResult: boolean]>} */
      ([
        [
          "Style sheet missing.",
          "without-base.html",
          "css/missing.css",
          false,
        ],
        [
          "Style sheet empty.",
          "without-base.html",
          "css/empty.css",
          true,
        ],
        [
          "Style sheet parsable.",
          "without-base.html",
          "css/parsable.css",
          true,
        ],
        [
          "Style sheet unparsable.",
          "without-base.html",
          "css/unparsable.css",
          true,
        ],
        [
          "With a base URI.",
          "with-base.html",
          "parsable.css",
          true,
        ],
      ])
  ) {
    test(
      testName,
      async () => {
        await using disposable = await testBrowserPage(
          browser,
          projectFilesOriginUrl,
        );

        await disposable.page.goto(
          new URL(
            `test/fixtures/documentHasStyleSheet/${fixtureHtmlFilename}`,
            projectFilesOriginUrl,
          ).href,
        );

        const result = await disposable.page.evaluate(
          /**
           * @param {string} projectFilesOriginHref Project files origin URL
           *   `href`.
           * @param {string} styleSheetHref Style sheet `href`.
           */
          async (projectFilesOriginHref, styleSheetHref) => {
            /** @type {documentHasStyleSheetExports} */
            const { default: documentHasStyleSheet } = await import(
              new URL(
                "documentHasStyleSheet.mjs",
                projectFilesOriginHref,
              ).href
            );

            return documentHasStyleSheet(styleSheetHref);
          },
          {
            args: [
              projectFilesOriginUrl.href,
              styleSheetHref,
            ],
          },
        );

        assertStrictEquals(result, expectedResult);
      },
    );
  }
});
