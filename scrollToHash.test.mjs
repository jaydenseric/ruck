// @ts-check

/**
 * @import { Browser } from "@astral/astral"
 * @import * as scrollToHashExports from "./scrollToHash.mjs"
 */

import { after, before, suite, test } from "node:test";
import { launch } from "@astral/astral";
import { assertEquals } from "@std/assert/equals";
import { assertThrows } from "@std/assert/throws";

import serveProjectFiles from "./test/serveProjectFiles.mjs";
import testBrowserPage from "./test/testBrowserPage.mjs";
import scrollToHash from "./scrollToHash.mjs";

suite("Function `scrollToHash`.", {
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

  test("Argument 1 `hash` not a string.", () => {
    assertThrows(
      () => {
        scrollToHash(
          // @ts-expect-error Testing invalid.
          true,
        );
      },
      TypeError,
      "Argument 1 `hash` must be a string.",
    );
  });

  test("Hash undefined.", async () => {
    // Scrolling to an undefined hash should scroll the window to the start.
    await using disposable = await testBrowserPage(
      browser,
      projectFilesOriginUrl,
    );

    await disposable.page.setContent(/* HTML */ `<!DOCTYPE html>
<html>
  <head>
    <style>
      body {
        margin: 0;
        width: 200dvw;
        height: 200dvh;
      }
    </style>
  </head>
  <body></body>
</html>`);

    const result = await disposable.page.evaluate(
      /**
       * @param {string} projectFilesOriginHref Project files origin URL `href`.
       */
      async (projectFilesOriginHref) => {
        /** @type {scrollToHashExports} */
        const { default: scrollToHash } = await import(
          new URL("scrollToHash.mjs", projectFilesOriginHref).href
        );

        const scrollingElement = /** @type {Element} */ (
          document.scrollingElement
        );

        // Scroll the window as much as possible.
        scrollTo(scrollingElement.scrollWidth, scrollingElement.scrollHeight);

        scrollToHash();

        const { scrollLeft, scrollTop } = scrollingElement;

        return {
          scrollLeft,
          scrollTop,
        };
      },
      {
        args: [projectFilesOriginUrl.href],
      },
    );

    assertEquals(result, {
      scrollLeft: 0,
      scrollTop: 0,
    });
  });

  test("Hash target element missing.", async () => {
    // For a page that’s scrolled a certain amount, scrolling to a missing hash
    // target element shouldn’t change the scroll position.
    await using disposable = await testBrowserPage(
      browser,
      projectFilesOriginUrl,
    );

    await disposable.page.setContent(/* HTML */ `<!DOCTYPE html>
<html>
  <head>
    <style>
      body {
        margin: 0;
        width: 200dvw;
        height: 200dvh;
      }
    </style>
  </head>
  <body></body>
</html>`);

    const result = await disposable.page.evaluate(
      /**
       * @param {string} projectFilesOriginHref Project files origin URL `href`.
       */
      async (projectFilesOriginHref) => {
        /** @type {scrollToHashExports} */
        const { default: scrollToHash } = await import(
          new URL("scrollToHash.mjs", projectFilesOriginHref).href
        );

        const scrollingElement = /** @type {Element} */ (
          document.scrollingElement
        );

        scrollTo(scrollingElement.scrollWidth, scrollingElement.scrollHeight);

        const { scrollLeft, scrollTop } = scrollingElement;

        scrollToHash("#missing");

        return {
          scrollUnchanged: scrollingElement.scrollLeft === scrollLeft &&
            scrollingElement.scrollTop === scrollTop,
        };
      },
      {
        args: [projectFilesOriginUrl.href],
      },
    );

    assertEquals(result, { scrollUnchanged: true });
  });

  test("Hash target element existing.", async () => {
    // The hash target element starts clipped within nested scrollable
    // containers (including the viewport), out of view. Scrolling to the hash
    // should scroll the target element’s ancestor containers until it’s fully
    // in view.

    /** Hash target element ID. */
    const targetId = "target";

    await using disposable = await testBrowserPage(
      browser,
      projectFilesOriginUrl,
    );

    await disposable.page.setContent(/* HTML */ `<!DOCTYPE html>
<html>
  <head>
    <style>
      body {
        margin: 0;
      }

      .container {
        /*
         * Enable sizing the nested hash target element to this scroll container
         * without assuming viewport or scrollbar dimensions.
         */
        container-type: size;
        width: 100dvw;
        height: 100dvh;
        overflow: auto;
      }

      .padding {
        /* Preserve padding after scrolled content. */
        width: max-content;
        /*
         * A viewport amount of padding all the way around the scroll target to
         * allow detection of too little/much scrolling.
         */
        padding: 100dvh 100dvw;
      }

      #${targetId} {
        width: 100cqw;
        height: 100cqh;
      }
    </style>
  </head>
  <body class="padding">
    <div class="container">
      <div class="padding">
        <div id="${targetId}"></div>
      </div>
    </div>
  </body>
</html>`);

    await disposable.page.evaluate(
      /**
       * @param {string} projectFilesOriginHref Project files origin URL `href`.
       * @param {string} targetId Target element ID.
       */
      async (projectFilesOriginHref, targetId) => {
        /** @type {scrollToHashExports} */
        const { default: scrollToHash } = await import(
          new URL("scrollToHash.mjs", projectFilesOriginHref).href
        );

        const targetElement = /** @type {HTMLDivElement} */ (
          document.getElementById(targetId)
        );

        const {
          promise: targetInView,
          resolve: targetInViewResolve,
          reject: targetInViewReject,
        } = /** @type {PromiseWithResolvers<void>} */ (
          Promise.withResolvers()
        );

        const intersectionObserver = new IntersectionObserver(
          (entries) => {
            if (entries[0]?.intersectionRatio === 1) targetInViewResolve();
          },
          { threshold: 1 },
        );
        const targetInViewTimeout = setTimeout(
          () =>
            targetInViewReject(
              new Error("Target element wasn’t within the viewport in time."),
            ),
          4000,
        );

        try {
          intersectionObserver.observe(targetElement);
          scrollToHash(`#${targetId}`);

          await targetInView;
        } finally {
          clearTimeout(targetInViewTimeout);
          intersectionObserver.disconnect();
        }
      },
      {
        args: [projectFilesOriginUrl.href, targetId],
      },
    );
  });
});
