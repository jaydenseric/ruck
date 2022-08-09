// @ts-check

import { getFreePort } from "free_port/mod.ts";
import puppeteer from "puppeteer";
import { createElement as h } from "react";
import { act, create } from "react-test-renderer";
import { assert, assertStrictEquals } from "std/testing/asserts.ts";

import ReactHookTest from "./test/ReactHookTest.mjs";
import serveProjectFiles from "./test/serveProjectFiles.mjs";
import testPuppeteerPage from "./test/testPuppeteerPage.mjs";
import NavigateContext from "./NavigateContext.mjs";
import readImportMapFile from "./readImportMapFile.mjs";
import serve from "./serve.mjs";
import useOnClickRouteLink from "./useOnClickRouteLink.mjs";

Deno.test("`useOnClickRouteLink` memoization.", () => {
  /** @type {Array<unknown>} */
  const results = [];

  /** @type {any} */
  const navigate1 = () => {};

  /** @type {import("react-test-renderer").ReactTestRenderer | undefined} */
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

  const tr =
    /** @type {import("react-test-renderer").ReactTestRenderer} */
    (testRenderer);

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

Deno.test("`useOnClickRouteLink` in a DOM environment.", async () => {
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

    const ruckAppPort = await getFreePort(3000);
    const { close } = await serve({
      clientImportMap,
      publicDir: new URL(
        "test/fixtures/useOnClickRouteLink/ruck-project/public/",
        import.meta.url,
      ),
      port: ruckAppPort,
      signal: abortController.signal,
    });

    try {
      const browser = await puppeteer.launch();
      const browserUserAgent = await browser.userAgent();

      try {
        await testPuppeteerPage(
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
            await page.click('a[href="/b"]');
            await page.keyboard.up("Alt");

            assertStrictEquals(page.url(), urlPageA);

            // Test holding the control key when clicking the link prevents a
            // client side navigation…

            await page.keyboard.down("Control");
            await page.click('a[href="/b"]');
            await page.keyboard.up("Control");

            assertStrictEquals(page.url(), urlPageA);

            // Test holding a meta key when clicking the link prevents a client
            // side navigation…

            await page.keyboard.down("Meta");
            await page.click('a[href="/b"]');
            await page.keyboard.up("Meta");

            if (browserUserAgent.includes("Macintosh")) {
              // macOS Chrome opens a link clicked while the meta (command) key
              // is pressed in a new tab, so the current page URL should not
              // have changed.
              assertStrictEquals(page.url(), urlPageA);
            } else {
              // Linux Chrome opens a link clicked while a meta (command) key is
              // pressed in the current tab, so the current page URL should have
              // changed.
              assertStrictEquals(page.url(), urlPageB);

              // Manually go to page A to prepare the next test.
              await page.goto(urlPageA);
            }

            // Test holding the shift key when clicking the link prevents a
            // client side navigation…

            await page.keyboard.down("Shift");
            await page.click('a[href="/b"]');
            await page.keyboard.up("Shift");

            assertStrictEquals(page.url(), urlPageA);

            // Test a main mouse button click on the link causes a client side
            // navigation…

            const [response1] = await Promise.all([
              page.waitForNavigation(),
              page.click('a[href="/b"]'),
            ]);

            // Check it was a client side navigation and not a native page load.
            assert(response1 === null);

            assert(await page.$("#page-b"));

            // Manually go to page A to prepare the next test.
            await page.goto(urlPageA);

            // Test pressing enter key on the focused link causes a client side
            // navigation…

            await page.focus('a[href="/b"]');

            const [response2] = await Promise.all([
              page.waitForNavigation(),
              page.keyboard.press("Enter"),
            ]);

            // Check it was a client side navigation and not a native page load.
            assert(response2 === null);

            assert(await page.$("#page-b"));

            // Test `event.preventDefault()` before the event handler runs
            // prevents a navigation…

            await page.click('a[href="/a"]');

            assertStrictEquals(page.url(), urlPageB);
          },
        );
      } finally {
        await browser.close();
      }
    } finally {
      abortController.abort();
      await close;
    }
  } finally {
    abortController.abort();
    await projectFileServer.close;
  }
});
