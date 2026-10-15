// @ts-check

import { suite, test } from "node:test";
import { launch } from "@astral/astral";
import { assertThrows } from "@std/assert/throws";

import serveProjectFiles from "./test/serveProjectFiles.mjs";
import testBrowserPage from "./test/testBrowserPage.mjs";
import scrollToHash from "./scrollToHash.mjs";

suite("Function `scrollToHash`.", {
  concurrency: true,
}, () => {
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

  test("Target existing.", async () => {
    const abortController = new AbortController();
    const projectFileServer = serveProjectFiles(abortController.signal);

    try {
      const projectFilesOriginUrl = new URL(
        `http://localhost:${projectFileServer.addr.port}`,
      );
      const browser = await launch();

      try {
        await testBrowserPage(browser, projectFilesOriginUrl, async (page) => {
          await page.setContent(/* HTML */ `<!DOCTYPE html>
<html>
  <head>
    <style>
      body {
        margin: 0;
      }

      #padding {
        padding: 200vh 200vw;
      }

      #target {
        width: 1px;
        height: 1px;
      }
    </style>
  </head>
  <body>
    <div id="padding">
      <div id="target"></div>
    </div>
  </body>
</html>`);

          await page.evaluate(
            /**
             * @param {number} projectFileServerPort Project file server port.
             */
            async (projectFileServerPort) => {
              const { default: scrollToHash } =
                /** @type {typeof import("./scrollToHash.mjs")} */ (
                  await import(
                    `http://localhost:${projectFileServerPort}/scrollToHash.mjs`
                  )
                );

              const targetElement = /** @type {HTMLDivElement} */ (
                document.getElementById("target")
              );

              const {
                promise: targetInView,
                resolve: targetInViewResolve,
                reject: targetInViewReject,
              } = /** @type {PromiseWithResolvers<void>} */ (
                Promise.withResolvers()
              );

              const targetInViewTimeout = setTimeout(() => {
                targetInViewReject(
                  new Error(
                    "Target element wasn’t within the viewport in time.",
                  ),
                );
              }, 4000);

              const intersectionObserver = new IntersectionObserver(
                (entries) => {
                  for (const { isIntersecting } of entries) {
                    if (isIntersecting) {
                      clearTimeout(targetInViewTimeout);
                      targetInViewResolve();
                    }
                  }
                },
                { threshold: 1 },
              );

              intersectionObserver.observe(targetElement);

              scrollToHash("#target");

              await targetInView;

              intersectionObserver.unobserve(targetElement);

              scrollToHash();

              const scrollingElement = /** @type {Element} */ (
                document.scrollingElement
              );

              if (scrollingElement.scrollLeft !== 0) {
                throw new Error(
                  "Page scroll should be at the start horizontally.",
                );
              }

              if (scrollingElement.scrollTop !== 0) {
                throw new Error(
                  "Page scroll should be at the start vertically.",
                );
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
});
