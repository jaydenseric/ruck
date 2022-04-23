// @ts-check

import { getFreePort } from "free_port/mod.ts";
import puppeteer from "puppeteer";
import {
  assert,
  assertEquals,
  assertStrictEquals,
} from "std/testing/asserts.ts";

import serveProjectFiles from "./test/serveProjectFiles.mjs";
import testPuppeteerPage from "./test/testPuppeteerPage.mjs";
import readImportMapFile from "./readImportMapFile.mjs";
import serve from "./serve.mjs";

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

      try {
        await testPuppeteerPage(
          browser,
          projectFilesOriginUrl,
          async (page) => {
            const urlPageA = `http://localhost:${ruckAppPort}/`;

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

            // Test holding the meta key when clicking the link prevents a
            // client side navigation…

            await page.keyboard.down("Meta");
            await page.click('a[href="/b"]');
            await page.keyboard.up("Meta");

            assertStrictEquals(page.url(), urlPageA);

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
            assertEquals(response1, null);

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
            assertEquals(response2, null);

            assert(await page.$("#page-b"));

            // Test `event.preventDefault()` before the event handler runs
            // prevents a navigation…

            await page.click('a[href="/a"]');

            assertStrictEquals(page.url(), `http://localhost:${ruckAppPort}/b`);
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
