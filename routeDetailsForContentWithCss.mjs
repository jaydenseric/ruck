// @ts-check
/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />
/// <reference lib="deno.unstable" />

import { createElement as h } from "react";

import documentHasStyleSheet from "./documentHasStyleSheet.mjs";
import HeadManager from "./HeadManager.mjs";
import LinkCss from "./LinkCss.mjs";

/**
 * Creates Ruck app route details for route content with CSS dependencies that
 * must be loaded in the document head before the route content mounts and be
 * removed again when navigation to this route aborts, or after navigation to
 * the next route for a different page.
 * @param {RouteContentWithCss
 *   | Promise<RouteContentWithCss>} routeContentWithCss Route content with CSS
 *   dependencies.
 * @param {import("./HeadManager.mjs").default} headManager Head tag manager.
 * @param {boolean} isInitialRoute Is it the initial route.
 * @returns {import("./serve.mjs").RouteDetails}
 */
export default function routeDetailsForContentWithCss(
  routeContentWithCss,
  headManager,
  isInitialRoute,
) {
  if (typeof routeContentWithCss !== "object" || !routeContentWithCss) {
    throw new TypeError(
      "Argument 1 `routeContentWithCss` must be an object or promise.",
    );
  }

  if (!(headManager instanceof HeadManager)) {
    throw new TypeError(
      "Argument 2 `headManager` must be a `HeadManager` instance.",
    );
  }

  if (typeof isInitialRoute !== "boolean") {
    throw new TypeError("Argument 3 `isInitialRoute` must be a boolean.");
  }

  /** @type {Set<import("react").ReactNode>} */
  const links = new Set();

  /** @type {(() => void) | null} */
  let endPoll = null;

  return {
    content: Promise.resolve(routeContentWithCss).then(
      async (resolvedRouteContent) => {
        if (typeof routeContentWithCss !== "object" || !routeContentWithCss) {
          throw new TypeError(
            "Function `routeDetailsForContentWithCss` argument 1 `routeContentWithCss` must resolve an object.",
          );
        }

        if (!(resolvedRouteContent.css instanceof Set)) {
          throw new TypeError("Export `css` must be a `Set` instance.");
        }

        for (const href of resolvedRouteContent.css) {
          if (typeof href !== "string") {
            throw new TypeError("CSS `href` must be a string.");
          }

          const link = h(LinkCss, { href });

          links.add(link);
          headManager.add(
            // Todo: Unopinionated way to name the key.
            `2-${href}`,
            link,
          );
        }

        // Skip waiting for CSS loading for the initial route. It doesn’t make
        // sense to wait for CSS to load in SSR, but SSR only involves the
        // initial route anyway.
        if (typeof document !== "undefined" && !isInitialRoute) {
          // Await the stylesheets adding to the DOM and loading. Any that are
          // already added to the DOM need to be awaited loading, if they
          // haven’t loaded yet, but not if it’s initial SSR page load hydration
          // time.

          // Poll until all the route CSS dependencies have loaded (regardless
          // of success or failure due to 404s, unparsable CSS, etc.) or route
          // cleanup (due to abort) happens.
          await /** @type {Promise<void>} */ (
            new Promise((resolve) => {
              endPoll = () => {
                endPoll = null;

                clearInterval(interval);

                // Wait for the CSS to apply to the document.
                setTimeout(resolve, 50);
              };

              const interval = setInterval(() => {
                // The wait for the style sheets to load is done when the
                // document has every one, ignoring ones who’s loading status
                // can’t be checked.
                let done = true;

                for (const href of resolvedRouteContent.css) {
                  try {
                    done = documentHasStyleSheet(href);
                  } catch (cause) {
                    // This style sheet’s loading status can’t be checked so
                    // it’s ignored.
                    console.error(
                      new Error(
                        `Check if the document has stylesheet ${href} failed.`,
                        { cause },
                      ),
                    );
                  }
                  if (!done) break;
                }

                if (done && endPoll) endPoll();
              }, 10);
            })
          );
        }

        return resolvedRouteContent.content;
      },
    ),

    // Shouldn’t run during SSR.
    cleanup() {
      if (endPoll) endPoll();
      for (const link of links) headManager.remove(link);
    },
  };
}

/**
 * Ruck app route content with CSS dependencies.
 * @typedef {object} RouteContentWithCss
 * @prop {import("react").ReactNode} content Content.
 * @prop {Set<string>} css CSS absolute or relative URLs.
 */
