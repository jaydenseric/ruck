// @ts-check

/** @import { ReactTestRenderer } from "react-test-renderer" */

import { launch } from "@astral/astral";
import { assert } from "@std/assert/assert";
import { assertStrictEquals } from "@std/assert/strict-equals";
import { getFreePort } from "free_port/mod.ts";
import { createElement as h } from "react";
import { act, create } from "react-test-renderer";

import ReactHookTest from "./test/ReactHookTest.mjs";
import browserPageUrl from "./test/browserPageUrl.mjs";
import serveProjectFiles from "./test/serveProjectFiles.mjs";
import testBrowserPage from "./test/testBrowserPage.mjs";
import NavigateContext from "./NavigateContext.mjs";
import readImportMapFile from "./readImportMapFile.mjs";
import serve from "./serve.mjs";
import useOnClickRouteLink from "./useOnClickRouteLink.mjs";

Deno.test("`useOnClickRouteLink` memoization.", () => {
  /** @type {Array<unknown>} */
  const results = [];

  /** @type {any} */
  const navigate1 = () => {};

  /** @type {ReactTestRenderer | undefined} */
  let testRenderer;

  act(() => {
    testRenderer = create(
      h(
        NavigateContext.Provider,
        { value: navigate1 },
        h(ReactHookTest, { hook: useOnClickRouteLink, results }),
      ),
    );
  });

  const tr = /** @type {ReactTestRenderer} */ (testRenderer);

  assertStrictEquals(results.length, 1);
  assertStrictEquals(typeof results[0], "function");

  act(() => {
    tr.update(
      h(
        NavigateContext.Provider,
        { value: navigate1 },
        h(ReactHookTest, { hook: useOnClickRouteLink, results }),
      ),
    );
  });

  assertStrictEquals(results.length, 2);
  assertStrictEquals(results[0], results[1]);

  /** @type {any} */
  const navigate2 = () => {};

  act(() => {
    tr.update(
      h(
        NavigateContext.Provider,
        { value: navigate2 },
        h(ReactHookTest, { hook: useOnClickRouteLink, results }),
      ),
    );
  });

  assertStrictEquals(results.length, 3);
  assertStrictEquals(typeof results[2], "function");
  assert(results[2] !== results[1]);
});

// Todo: Un-ignore these tests after this Astral issue is resolved:
// https://github.com/lino-levan/astral/issues/124#issuecomment-2603389874
Deno.test.ignore("`useOnClickRouteLink` in a DOM environment.", async () => {
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

    const ruckAppPort = await getFreePort(3000);
    const ruckServer = await serve({
      clientImportMap,
      publicDir: new URL(
        "test/fixtures/useOnClickRouteLink/ruck-project/public/",
        import.meta.url,
      ),
      port: ruckAppPort,
      signal: abortController.signal,
    });

    try {
      const browser = await launch();
      const browserUserAgent = await browser.userAgent();

      try {
        await testBrowserPage(
          browser,
          projectFilesOriginUrl,
          async (page) => {
            const urlPageA = `http://localhost:${ruckAppPort}/`;
            const urlPageB = `http://localhost:${ruckAppPort}/b`;

            await page.goto(urlPageA);

            // Check the Ruck app is ready at page A.
            assert(await page.$("#page-a"));

            // Test holding the alt key when clicking the link prevents a
            // client side navigation…

            await page.keyboard.down("Alt");
            await page.locator('a[href="/b"]').click();
            await page.keyboard.up("Alt");

            assertStrictEquals(await browserPageUrl(page), urlPageA);

            // Test holding the control key when clicking the link prevents a
            // client side navigation…

            await page.keyboard.down("Control");
            await page.locator('a[href="/b"]').click();
            await page.keyboard.up("Control");

            assertStrictEquals(await browserPageUrl(page), urlPageA);

            // Test holding a meta key when clicking the link prevents a client
            // side navigation…

            await page.keyboard.down("Meta");
            await page.locator('a[href="/b"]').click();
            await page.keyboard.up("Meta");

            if (browserUserAgent.includes("Macintosh")) {
              // macOS Chrome opens a link clicked while the meta (command) key
              // is pressed in a new tab, so the current page URL should not
              // have changed.
              assertStrictEquals(await browserPageUrl(page), urlPageA);
            } else {
              // Linux Chrome opens a link clicked while a meta (command) key is
              // pressed in the current tab, so the current page URL should have
              // changed.
              assertStrictEquals(await browserPageUrl(page), urlPageB);

              // Manually go to page A to prepare the next test.
              await page.goto(urlPageA);
            }

            // Test holding the shift key when clicking the link prevents a
            // client side navigation…

            await page.keyboard.down("Shift");
            await page.locator('a[href="/b"]').click();
            await page.keyboard.up("Shift");

            assertStrictEquals(await browserPageUrl(page), urlPageA);

            // Test a main mouse button click on the link causes a client side
            // navigation…

            const [response1] = await Promise.all([
              page.waitForNavigation(),
              page.locator('a[href="/b"]').click(),
            ]);

            // Check it was a client side navigation and not a native page load.
            assert(response1 === null);

            assert(await page.$("#page-b"));

            // Manually go to page A to prepare the next test.
            await page.goto(urlPageA);

            // Test pressing enter key on the focused link causes a client side
            // navigation…

            await /** @type {typeof page.locator<HTMLAnchorElement>} */ (
              page.locator
            )('a[href="/b"]').evaluate((element) => {
              element.focus();
            });

            const [response2] = await Promise.all([
              page.waitForNavigation(),
              page.keyboard.press("Enter"),
            ]);

            // Check it was a client side navigation and not a native page load.
            assert(response2 === null);

            assert(await page.$("#page-b"));

            // Test `event.preventDefault()` before the event handler runs
            // prevents a navigation…

            await page.locator('a[href="/a"]').click();

            assertStrictEquals(await browserPageUrl(page), urlPageB);
          },
        );
      } finally {
        await browser.close();
      }
    } finally {
      abortController.abort();
      await ruckServer.finished;
    }
  } finally {
    abortController.abort();
    await projectFileServer.finished;
  }
});
