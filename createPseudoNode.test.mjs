// @ts-check

import puppeteer from "puppeteer";

import serveProjectFiles from "./test/serveProjectFiles.mjs";
import testPuppeteerPage from "./test/testPuppeteerPage.mjs";

Deno.test("`createPseudoNode` in a DOM environment.", async () => {
  const abortController = new AbortController();
  const projectFileServer = await serveProjectFiles(abortController.signal);

  try {
    const projectFilesOriginUrl = new URL(
      `http://localhost:${projectFileServer.port}`,
    );
    const browser = await puppeteer.launch();

    try {
      // Note that page HTML is on a single line because React rendering doesn’t
      // add whitespace between nodes that would result in extra text nodes.

      // Todo: Refactor to use Deno test steps once this Deno bug is fixed:
      // https://github.com/denoland/deno/issues/15425

      // Test `createPseudoNode` with argument 1 `startNode` not a DOM node.
      await testPuppeteerPage(
        browser,
        projectFilesOriginUrl,
        async (page) => {
          await page.setContent(
            '<!DOCTYPE html><html><head><meta name="end"></head></html>',
          );

          await page.evaluate(async (projectFileServerPort) => {
            /** @type {import("./createPseudoNode.mjs")} */
            const { default: createPseudoNode } = await import(
              `http://localhost:${projectFileServerPort}/createPseudoNode.mjs`
            );

            try {
              createPseudoNode(
                // @ts-expect-error Testing invalid.
                true,
                /** @type {Element} */ (document.querySelector('[name="end"]')),
              );

              throw new Error("Expected an error.");
            } catch (error) {
              if (
                !(error instanceof TypeError) ||
                error.message !== "Argument 1 `startNode` must be a DOM node."
              ) {
                throw error;
              }
            }
          }, projectFileServer.port);
        },
      );

      // Test `createPseudoNode` with argument 2 `endNode` not a DOM node.
      await testPuppeteerPage(
        browser,
        projectFilesOriginUrl,
        async (page) => {
          await page.setContent(
            '<!DOCTYPE html><html><head><meta name="start"></head></html>',
          );

          await page.evaluate(async (projectFileServerPort) => {
            /** @type {import("./createPseudoNode.mjs")} */
            const { default: createPseudoNode } = await import(
              `http://localhost:${projectFileServerPort}/createPseudoNode.mjs`
            );

            try {
              createPseudoNode(
                /** @type {Element} */ (document.querySelector(
                  '[name="start"]',
                )),
                // @ts-expect-error Testing invalid.
                true,
              );

              throw new Error("Expected an error.");
            } catch (error) {
              if (
                !(error instanceof TypeError) ||
                error.message !== "Argument 2 `endNode` must be a DOM node."
              ) {
                throw error;
              }
            }
          }, projectFileServer.port);
        },
      );

      // Test `createPseudoNode` with parent DOM node missing.
      await testPuppeteerPage(
        browser,
        projectFilesOriginUrl,
        async (page) => {
          await page.setContent(
            '<!DOCTYPE html><html><head><meta name="end"></head></html>',
          );

          await page.evaluate(async (projectFileServerPort) => {
            /** @type {import("./createPseudoNode.mjs")} */
            const { default: createPseudoNode } = await import(
              `http://localhost:${projectFileServerPort}/createPseudoNode.mjs`
            );

            try {
              createPseudoNode(
                // @ts-expect-error Testing invalid.
                document.createDocumentFragment(),
                /** @type {Element} */ (document.querySelector('[name="end"]')),
              );

              throw new Error("Expected an error.");
            } catch (error) {
              if (
                !(error instanceof TypeError) ||
                error.message !== "Parent DOM node missing."
              ) {
                throw error;
              }
            }
          }, projectFileServer.port);
        },
      );

      // Test `createPseudoNode` with start and end DOM nodes not having the
      // same parent.
      await testPuppeteerPage(
        browser,
        projectFilesOriginUrl,
        async (page) => {
          await page.setContent(
            '<!DOCTYPE html><html><head><meta name="end"></head></html>',
          );

          await page.evaluate(async (projectFileServerPort) => {
            /** @type {import("./createPseudoNode.mjs")} */
            const { default: createPseudoNode } = await import(
              `http://localhost:${projectFileServerPort}/createPseudoNode.mjs`
            );

            try {
              createPseudoNode(
                /** @type {Element} */ (document.querySelector("head")),
                /** @type {Element} */ (document.querySelector('[name="end"]')),
              );

              throw new Error("Expected an error.");
            } catch (error) {
              if (
                !(error instanceof TypeError) ||
                error.message !==
                  "Start and end DOM nodes must have the same parent."
              ) {
                throw error;
              }
            }
          }, projectFileServer.port);
        },
      );

      // Test `createPseudoNode` reflects non overridden parent DOM node properties and methods.
      await testPuppeteerPage(
        browser,
        projectFilesOriginUrl,
        async (page) => {
          await page.setContent(
            '<!DOCTYPE html><html><head><meta name="before"><meta name="start"><meta name="end"></head></html>',
          );

          await page.evaluate(async (projectFileServerPort) => {
            /** @type {import("./createPseudoNode.mjs")} */
            const { default: createPseudoNode } = await import(
              `http://localhost:${projectFileServerPort}/createPseudoNode.mjs`
            );

            const headElement = /** @type {Element} */ (
              document.querySelector("head")
            );

            const pseudoNode = createPseudoNode(
              /** @type {Element} */ (document.querySelector('[name="start"]')),
              /** @type {Element} */ (document.querySelector('[name="end"]')),
            );

            if (pseudoNode.nodeType !== headElement.nodeType) {
              throw new Error(
                "Expected property `nodeType` to match that of the parent node.",
              );
            }

            if (typeof pseudoNode.addEventListener !== "function") {
              throw new Error(
                "Expected method `addEventListener` to be a function.",
              );
            }
          }, projectFileServer.port);
        },
      );

      // Test `createPseudoNode` property `firstChild`, without children.
      await testPuppeteerPage(
        browser,
        projectFilesOriginUrl,
        async (page) => {
          await page.setContent(
            '<!DOCTYPE html><html><head><meta name="before"><meta name="start"><meta name="end"></head></html>',
          );

          await page.evaluate(async (projectFileServerPort) => {
            /** @type {import("./createPseudoNode.mjs")} */
            const { default: createPseudoNode } = await import(
              `http://localhost:${projectFileServerPort}/createPseudoNode.mjs`
            );

            const pseudoNode = createPseudoNode(
              /** @type {Element} */ (document.querySelector('[name="start"]')),
              /** @type {Element} */ (document.querySelector('[name="end"]')),
            );

            if (pseudoNode.firstChild !== null) {
              throw new Error("Expected property `firstChild` to be `null`.");
            }
          }, projectFileServer.port);
        },
      );

      // Test `createPseudoNode` property `firstChild`, with children.
      await testPuppeteerPage(
        browser,
        projectFilesOriginUrl,
        async (page) => {
          await page.setContent(
            '<!DOCTYPE html><html><head><meta name="before"><meta name="start"><meta name="child1"><meta name="child2"><meta name="end"></head></html>',
          );

          await page.evaluate(async (projectFileServerPort) => {
            /** @type {import("./createPseudoNode.mjs")} */
            const { default: createPseudoNode } = await import(
              `http://localhost:${projectFileServerPort}/createPseudoNode.mjs`
            );

            const pseudoNode = createPseudoNode(
              /** @type {Element} */ (document.querySelector('[name="start"]')),
              /** @type {Element} */ (document.querySelector('[name="end"]')),
            );

            const child1 = /** @type {Element} */ (document.querySelector(
              '[name="child1"]',
            ));

            const firstChild = /** @type {Element} */ (pseudoNode.firstChild);

            if (firstChild.valueOf() !== child1) {
              throw new Error(
                "Expected property `firstChild` to be a proxy of the first child DOM node.",
              );
            }

            // Test the proxy child DOM node reflects non overridden properties
            // and methods.

            if (firstChild.nodeType !== child1.nodeType) {
              throw new Error(
                "Expected property `nodeType` to match that of the proxied node.",
              );
            }

            if (typeof firstChild.addEventListener !== "function") {
              throw new Error(
                "Expected method `addEventListener` to be a function.",
              );
            }
          }, projectFileServer.port);
        },
      );

      // Test `createPseudoNode` child node property `nextSibling`.
      await testPuppeteerPage(
        browser,
        projectFilesOriginUrl,
        async (page) => {
          await page.setContent(
            '<!DOCTYPE html><html><head><meta name="before"><meta name="start"><meta name="child1"><meta name="child2"><meta name="end"><meta name="after"></head></html>',
          );

          await page.evaluate(async (projectFileServerPort) => {
            /** @type {import("./createPseudoNode.mjs")} */
            const { default: createPseudoNode } = await import(
              `http://localhost:${projectFileServerPort}/createPseudoNode.mjs`
            );

            const pseudoNode = createPseudoNode(
              /** @type {Element} */ (document.querySelector('[name="start"]')),
              /** @type {Element} */ (document.querySelector('[name="end"]')),
            );

            const child1Proxy = /** @type {Element} */ (pseudoNode.firstChild);

            const child2Proxy =
              /** @type {Element} */ (child1Proxy.nextSibling);

            const child2 = /** @type {Element} */ (document.querySelector(
              '[name="child2"]',
            ));

            if (child2Proxy.valueOf() !== child2) {
              throw new Error(
                "Expected property `nextSibling` to be a proxy of the second child DOM node.",
              );
            }

            // Test the proxy child DOM node reflects non overridden properties
            // and methods.

            if (child2Proxy.nodeType !== child2.nodeType) {
              throw new Error(
                "Expected property `nodeType` to match that of the proxied node.",
              );
            }

            if (typeof child2Proxy.addEventListener !== "function") {
              throw new Error(
                "Expected method `addEventListener` to be a function.",
              );
            }

            if (child2Proxy.nextSibling !== null) {
              throw new Error(
                "Expected child 2 property `nextSibling` to be `null`.",
              );
            }
          }, projectFileServer.port);
        },
      );

      // Test `createPseudoNode` method `insertBefore`.
      await testPuppeteerPage(
        browser,
        projectFilesOriginUrl,
        async (page) => {
          await page.setContent(
            '<!DOCTYPE html><html><head><meta name="before"><meta name="start"><meta name="child1"><meta name="end"><meta name="after"></head></html>',
          );

          await page.evaluate(async (projectFileServerPort) => {
            /** @type {import("./createPseudoNode.mjs")} */
            const { default: createPseudoNode } = await import(
              `http://localhost:${projectFileServerPort}/createPseudoNode.mjs`
            );

            const pseudoNode = createPseudoNode(
              /** @type {Element} */ (document.querySelector('[name="start"]')),
              /** @type {Element} */ (document.querySelector('[name="end"]')),
            );

            const child2 = document.createElement("meta");
            child2.setAttribute("name", "child2");

            pseudoNode.insertBefore(child2, pseudoNode.firstChild);

            const htmlActual = document.documentElement.outerHTML;
            const htmlExpected =
              '<html><head><meta name="before"><meta name="start"><meta name="child2"><meta name="child1"><meta name="end"><meta name="after"></head><body></body></html>';
            if (htmlActual !== htmlExpected) {
              throw new Error(
                `Expected HTML:\n\n${htmlExpected}\n\nActual HTML:\n\n${htmlActual}\n\n`,
              );
            }
          }, projectFileServer.port);
        },
      );

      // Test `createPseudoNode` method `appendChild`.
      await testPuppeteerPage(
        browser,
        projectFilesOriginUrl,
        async (page) => {
          await page.setContent(
            '<!DOCTYPE html><html><head><meta name="before"><meta name="start"><meta name="child1"><meta name="end"><meta name="after"></head></html>',
          );

          await page.evaluate(async (projectFileServerPort) => {
            /** @type {import("./createPseudoNode.mjs")} */
            const { default: createPseudoNode } = await import(
              `http://localhost:${projectFileServerPort}/createPseudoNode.mjs`
            );

            const pseudoNode = createPseudoNode(
              /** @type {Element} */ (document.querySelector('[name="start"]')),
              /** @type {Element} */ (document.querySelector('[name="end"]')),
            );

            const child2 = document.createElement("meta");
            child2.setAttribute("name", "child2");

            pseudoNode.appendChild(child2);

            const htmlActual = document.documentElement.outerHTML;
            const htmlExpected =
              '<html><head><meta name="before"><meta name="start"><meta name="child1"><meta name="child2"><meta name="end"><meta name="after"></head><body></body></html>';
            if (htmlActual !== htmlExpected) {
              throw new Error(
                `Expected HTML:\n\n${htmlExpected}\n\nActual HTML:\n\n${htmlActual}\n\n`,
              );
            }
          }, projectFileServer.port);
        },
      );

      // Test `createPseudoNode` method `removeChild`.
      await testPuppeteerPage(
        browser,
        projectFilesOriginUrl,
        async (page) => {
          await page.setContent(
            '<!DOCTYPE html><html><head><meta name="before"><meta name="start"><meta name="child1"><meta name="child2"><meta name="end"><meta name="after"></head></html>',
          );

          await page.evaluate(async (projectFileServerPort) => {
            /** @type {import("./createPseudoNode.mjs")} */
            const { default: createPseudoNode } = await import(
              `http://localhost:${projectFileServerPort}/createPseudoNode.mjs`
            );

            const pseudoNode = createPseudoNode(
              /** @type {Element} */ (document.querySelector('[name="start"]')),
              /** @type {Element} */ (document.querySelector('[name="end"]')),
            );

            pseudoNode.removeChild(
              /** @type {Element} */ (document.querySelector(
                '[name="child2"]',
              )),
            );

            const htmlActual = document.documentElement.outerHTML;
            const htmlExpected =
              '<html><head><meta name="before"><meta name="start"><meta name="child1"><meta name="end"><meta name="after"></head><body></body></html>';
            if (htmlActual !== htmlExpected) {
              throw new Error(
                `Expected HTML:\n\n${htmlExpected}\n\nActual HTML:\n\n${htmlActual}\n\n`,
              );
            }
          }, projectFileServer.port);
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
