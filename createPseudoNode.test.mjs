// @ts-check

import puppeteer from "puppeteer";

import serveProjectFiles from "./test/serveProjectFiles.mjs";
import testPuppeteerPage from "./test/testPuppeteerPage.mjs";

Deno.test("`createPseudoNode` in a DOM environment.", async () => {
  const abortController = new AbortController();
  const projectFileServer = await serveProjectFiles(abortController.signal);
  const projectFilesOriginUrl = new URL(
    `http://localhost:${projectFileServer.port}`,
  );

  try {
    const browser = await puppeteer.launch();

    try {
      await testPuppeteerPage(browser, projectFilesOriginUrl, async (page) => {
        await page.setContent(
          // React rendering doesn’t add whitespace between nodes that would
          // result in extra text nodes.
          '<!DOCTYPE html><html><head><meta name="before"><meta name="start"><meta name="end"><meta name="after"></head></html>',
        );

        await page.evaluate(async (projectFileServerPort) => {
          /** @type {import("./createPseudoNode.mjs")} */
          const { default: createPseudoNode } = await import(
            `http://localhost:${projectFileServerPort}/createPseudoNode.mjs`
          );

          const headElement = /** @type {Element} */ (
            document.querySelector("head")
          );
          const startElement =
            /** @type {Element} */ (document.querySelector('[name="start"]'));
          const endElement =
            /** @type {Element} */ (document.querySelector('[name="end"]'));

          try {
            createPseudoNode(
              // @ts-expect-error Testing invalid.
              true,
              endElement,
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

          try {
            createPseudoNode(
              startElement,
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

          try {
            createPseudoNode(
              // @ts-expect-error Testing invalid.
              document.createDocumentFragment(),
              endElement,
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

          try {
            createPseudoNode(headElement, endElement);

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

          const pseudoNode = createPseudoNode(startElement, endElement);

          if (pseudoNode.nodeType !== headElement.nodeType) {
            throw new Error(
              "Expected property `nodeType` to match that of the actual parent node.",
            );
          }

          if (typeof pseudoNode.addEventListener !== "function") {
            throw new Error(
              "Expected method `addEventListener` to be a function.",
            );
          }

          if (pseudoNode.firstChild !== null) {
            throw new Error("Expected property `firstChild` to be `null`.");
          }

          const metaA = document.createElement("meta");
          const metaB = document.createElement("meta");

          pseudoNode.appendChild(metaA);

          const firstChild1 = /** @type {HTMLMetaElement} */ (
            /** @type {unknown} */ (pseudoNode.firstChild)
          );

          if (firstChild1.valueOf() !== metaA) {
            throw new Error("Expected property `firstChild` to be meta A.");
          }

          if (firstChild1.nodeType !== metaA.nodeType) {
            throw new Error(
              "Expected property `nodeType` to match that of the node.",
            );
          }

          if (typeof firstChild1.addEventListener !== "function") {
            throw new Error(
              "Expected method `addEventListener` to be a function.",
            );
          }

          if (firstChild1.nextSibling !== null) {
            throw new Error("Expected property `nextSibling` to be `null`.");
          }

          pseudoNode.insertBefore(metaB, metaA);

          const firstChild2 = /** @type {HTMLMetaElement} */ (
            /** @type {unknown} */ (pseudoNode.firstChild)
          );

          if (firstChild2.valueOf() !== metaB) {
            throw new Error("Expected property `firstChild` to be meta B.");
          }

          if (
            /** @type {HTMLMetaElement} */ (
              /** @type {unknown} */ (
                firstChild2.nextSibling
              )
            ).valueOf() !== metaA
          ) {
            throw new Error("Expected property `nextSibling` to be meta A.");
          }

          pseudoNode.removeChild(firstChild2);

          const firstChild3 = /** @type {HTMLMetaElement} */ (
            /** @type {unknown} */ (pseudoNode.firstChild)
          );

          if (firstChild3.valueOf() !== metaA) {
            throw new Error("Expected property `firstChild` to be meta A.");
          }

          if (firstChild3.nextSibling !== null) {
            throw new Error("Expected property `nextSibling` to be `null`.");
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
