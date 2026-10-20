// @ts-check

/**
 * @import { Browser, Page } from "@astral/astral"
 * @import { ReactTestRenderer } from "react-test-renderer"
 */

import { after, before, suite, test } from "node:test";
import { launch } from "@astral/astral";
import { assert } from "@std/assert/assert";
import { assertStrictEquals } from "@std/assert/strict-equals";
import { createElement as h } from "react";
import { act, create } from "react-test-renderer";

import ReactHookTest from "./test/ReactHookTest.mjs";
import serveRuckFixtureForBrowser from "./test/serveRuckFixtureForBrowser.mjs";
import serveProjectFiles from "./test/serveProjectFiles.mjs";
import NavigateContext from "./NavigateContext.mjs";
import useOnClickRouteLink from "./useOnClickRouteLink.mjs";

suite("React hook `useOnClickRouteLink`.", {
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

  test("Memoization.", () => {
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

  test("Default action already prevented.", async () => {
    await using disposable = await serveRuckFixtureForBrowser(
      browser,
      projectFilesOriginUrl,
      "useOnClickRouteLink/default-action-already-prevented",
    );

    await disposable.page.goto(disposable.appOriginUrl.href);

    await disposable.page.evaluate(() => {
      addEventListener(
        "ruckroutechangestart",
        () => {
          document.documentElement.dataset.testRouteChangeStarted = "true";
        },
        { once: true },
      );
    });

    await disposable.page.locator("a[href]").click();

    assertStrictEquals(
      await disposable.page.evaluate(() =>
        document.documentElement.dataset.testRouteChangeStarted
      ),
      undefined,
    );
  });

  suite("Clicks that shouldn’t navigate.", {
    concurrency: true,
  }, () => {
    for (
      const [testName, execute]
        of /** @satisfies {Array<[testName: string, execute: (page: Page) => Promise<void>]>} */
        ([
          [
            "Alt click.",
            async (page) => {
              await page.keyboard.down("Alt");
              await page.locator("a[href]").click();
            },
          ],
          [
            "Control click.",
            async (page) => {
              await page.keyboard.down("Control");
              await page.locator("a[href]").click();
            },
          ],
          [
            "Meta click.",
            async (page) => {
              await page.keyboard.down("Meta");
              await page.locator("a[href]").click();
            },
          ],
          [
            "Shift click.",
            async (page) => {
              await page.keyboard.down("Shift");
              await page.locator("a[href]").click();
            },
          ],
        ])
    ) {
      test(testName, async () => {
        await using disposable = await serveRuckFixtureForBrowser(
          browser,
          projectFilesOriginUrl,
          "useOnClickRouteLink/route-link",
        );

        await disposable.page.goto(disposable.appOriginUrl.href);

        await disposable.page.evaluate(() => {
          addEventListener(
            "ruckroutechangestart",
            () => {
              document.documentElement.dataset.testRouteChangeStarted = "true";
            },
            { once: true },
          );
        });

        await execute(disposable.page);

        assertStrictEquals(
          await disposable.page.evaluate(() =>
            document.documentElement.dataset.testRouteChangeStarted
          ),
          undefined,
        );
      });
    }
  });

  suite("Clicks that should navigate.", {
    concurrency: true,
  }, () => {
    for (
      const [testName, execute]
        of /** @satisfies {Array<[testName: string, execute: (page: Page) => Promise<void>]>} */
        ([
          [
            "Main mouse button click.",
            (page) => page.locator("a[href]").click(),
          ],
          [
            "Enter key.",
            async (page) => {
              await page.locator("a[href]").focus();
              await page.keyboard.press("Enter");
            },
          ],
        ])
    ) {
      test(testName, async () => {
        await using disposable = await serveRuckFixtureForBrowser(
          browser,
          projectFilesOriginUrl,
          "useOnClickRouteLink/route-link",
        );

        await disposable.page.goto(disposable.appOriginUrl.href);

        await disposable.page.evaluate(() => {
          addEventListener(
            "ruckroutechangestart",
            /** @type {EventListener} */ (
              (
                /**
                 * @type {CustomEvent<{
                 *   url: URL,
                 *   abortController: AbortController,
                 * }>}
                 */
                event,
              ) => {
                document.documentElement.dataset.testRouteChangeUrl =
                  event.detail.url.pathname;
              }
            ),
            { once: true },
          );
          addEventListener(
            "click",
            (event) => {
              document.documentElement.dataset.testClickDefaultPrevented =
                String(event.defaultPrevented);
            },
            { once: true },
          );
        });

        await execute(disposable.page);

        assertStrictEquals(
          await disposable.page.evaluate(() =>
            document.documentElement.dataset.testRouteChangeUrl
          ),
          "/b",
        );
        assertStrictEquals(
          await disposable.page.evaluate(() =>
            document.documentElement.dataset.testClickDefaultPrevented
          ),
          "true",
        );
      });
    }
  });
});
