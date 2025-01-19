// @ts-check

import { assertThrows } from "@std/assert/throws";
import puppeteer from "puppeteer";

import serveProjectFiles from "./test/serveProjectFiles.mjs";
import testPuppeteerPage from "./test/testPuppeteerPage.mjs";
import scrollToHash from "./scrollToHash.mjs";

Deno.test("`scrollToHash` with argument 1 `hash` not a string.", () => {
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

Deno.test("`scrollToHash` with target existing.", async () => {
  const abortController = new AbortController();
  const projectFileServer = await serveProjectFiles(abortController.signal);

  try {
    const projectFilesOriginUrl = new URL(
      `http://localhost:${projectFileServer.port}`,
    );
    const browser = await puppeteer.launch();

    try {
      await testPuppeteerPage(browser, projectFilesOriginUrl, async (page) => {
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

        await page.evaluate(async (projectFileServerPort) => {
          const [{ default: Defer }, { default: scrollToHash }] = await Promise
            .all([
              /** @type {Promise<import("./test/Defer.mjs")>} */ (
                import(
                  `http://localhost:${projectFileServerPort}/test/Defer.mjs`
                )
              ),
              /** @type {Promise<import("./scrollToHash.mjs")>} */ (
                import(
                  `http://localhost:${projectFileServerPort}/scrollToHash.mjs`
                )
              ),
            ]);

          const targetElement = /** @type {HTMLDivElement} */ (
            document.getElementById("target")
          );

          const {
            promise: targetInView,
            resolve: targetInViewResolve,
            reject: targetInViewReject,
          } = new Defer();

          const targetInViewTimeout = setTimeout(() => {
            targetInViewReject(
              new Error("Target element wasn’t within the viewport in time."),
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
            throw new Error("Page scroll should be at the start horizontally.");
          }

          if (scrollingElement.scrollTop !== 0) {
            throw new Error("Page scroll should be at the start vertically.");
          }
        }, projectFileServer.port);
      });
    } finally {
      await browser.close();
    }
  } finally {
    abortController.abort();
    await projectFileServer.close;
  }
});
