// @ts-check
/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />
/// <reference lib="deno.unstable" />

import CacheContext from "graphql-react/CacheContext.mjs";
import HydrationTimeStampContext from "graphql-react/HydrationTimeStampContext.mjs";
import LoadingContext from "graphql-react/LoadingContext.mjs";
import {
  createElement as h,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import Effect from "./Effect.mjs";
import HeadManagerContext from "./HeadManagerContext.mjs";
import NavigateContext from "./NavigateContext.mjs";
import RouteContext from "./RouteContext.mjs";
import scrollToHash from "./scrollToHash.mjs";

/**
 * A React component for use on the client to provide all the React context
 * required to enable the entire Ruck API.
 * @param {object} props Props.
 * @param {number} props.hydrationTimeStamp Milliseconds since the
 *   [performance time origin](https://developer.mozilla.org/en-US/docs/Web/API/Performance/timeOrigin)
 *   (when the client JavaScript environment started running).
 * @param {import("./HeadManager.mjs").default} props.headManager Head tag
 *   manager.
 * @param {import("graphql-react/Cache.mjs").default} props.cache Data cache
 *   store.
 * @param {import("graphql-react/Loading.mjs").default} props.loading Loading
 *   store.
 * @param {import("./serve.mjs").Router} props.router Router.
 * @param {import("./serve.mjs").Route} props.initialRoute The initial route
 *   that was server side rendered.
 * @param {() => void} props.onEffectsDone Callback that runs after initial
 *   effects in children are done.
 * @param {import("react").ReactNode} [props.children] React children.
 */
export default function ClientProvider({
  hydrationTimeStamp,
  headManager,
  cache,
  loading,
  router,
  initialRoute,
  onEffectsDone,
  children,
}) {
  const [route, setRoute] = useState(initialRoute);

  const navigationAbortControllerRef = useRef(
    /** @type {AbortController | null} */ (null),
  );

  const navigate = useCallback(
    /** @type {Navigate} */
    async ({
      url,
      updateHistory = true,
      abortController = new AbortController(),
    }) => {
      if (typeof url !== "string" && !(url instanceof URL)) {
        throw new TypeError("Option `url` must be a string or `URL` instance.");
      }

      if (typeof updateHistory !== "boolean") {
        throw new TypeError("Option `updateHistory` must be a boolean.");
      }

      if (!(abortController instanceof AbortController)) {
        throw new TypeError(
          "Option `abortController` must be an `AbortController` instance.",
        );
      }

      if (!abortController.signal.aborted) {
        const oldUrl = route.url;
        // Normalize a possibly absolute or relative `url`.
        const newUrl = new URL(String(url), document.baseURI);
        const samePage =
          newUrl.pathname + newUrl.search === oldUrl.pathname + oldUrl.search;

        if (samePage) {
          if (updateHistory && newUrl.hash !== oldUrl.hash) {
            history.pushState(null, "", String(newUrl));
          }

          setRoute({
            url: newUrl,
            content: route.content,
            cleanup: route.cleanup,
          });

          scrollToHash(newUrl.hash);
        } else {
          try {
            if (navigationAbortControllerRef.current) {
              navigationAbortControllerRef.current.abort();
            }

            navigationAbortControllerRef.current = abortController;

            dispatchEvent(
              new CustomEvent("ruckroutechangestart", {
                detail: {
                  url: newUrl,
                  abortController,
                },
              }),
            );

            // Todo: Validate what the router returns.
            const { content, cleanup } = router(newUrl, headManager, false);

            let routeContent;

            /** @type {((value: unknown) => void) | undefined} */
            let onAbort;

            const abortPromise = new Promise((resolve) => {
              onAbort = resolve;
            });

            abortController.signal.addEventListener(
              "abort",
              /** @type {Exclude<typeof onAbort, undefined>} */ (onAbort),
              { once: true },
            );

            try {
              await Promise.race([
                // The content might not be a promise.
                Promise.resolve(content).then((resolvedContent) => {
                  routeContent = resolvedContent;
                }),
                abortPromise,
              ]);
            } finally {
              abortController.signal.removeEventListener(
                "abort",
                /** @type {Exclude<typeof onAbort, undefined>} */ (onAbort),
              );
            }

            if (abortController.signal.aborted) {
              try {
                if (cleanup) cleanup();
              } finally {
                dispatchEvent(
                  new CustomEvent("ruckroutechangeabort", {
                    detail: {
                      url: newUrl,
                    },
                  }),
                );
              }
            } else {
              if (updateHistory) history.pushState(null, "", String(newUrl));

              if (!newUrl.hash) scrollTo(0, 0);

              const callback = () => {
                if (newUrl.hash) {
                  const target = document.querySelector(newUrl.hash);
                  if (target) target.scrollIntoView();
                  else scrollTo(0, 0);
                }

                dispatchEvent(
                  new CustomEvent("ruckroutechangeend", {
                    detail: {
                      url: newUrl,
                    },
                  }),
                );
              };

              setRoute({
                url: newUrl,
                content: h(Effect, { callback, children: routeContent }),
                cleanup,
              });

              // Now that the new route is set, cleanup the previous route.
              if (route.cleanup) route.cleanup();
            }
          } catch (error) {
            dispatchEvent(
              new CustomEvent("ruckroutechangeerror", {
                detail: {
                  url: newUrl,
                  error,
                },
              }),
            );
          }
        }
      }
    },
    [router, headManager, route.cleanup, route.content, route.url],
  );

  const onPopState = useCallback(() => {
    navigate({
      url: new URL(location.href),
      updateHistory: false,
    });
  }, [navigate]);

  useEffect(() => {
    addEventListener("popstate", onPopState);

    return () => {
      removeEventListener("popstate", onPopState);
    };
  }, [onPopState]);

  useEffect(onEffectsDone, [onEffectsDone]);

  return h(
    NavigateContext.Provider,
    { value: navigate },
    h(
      RouteContext.Provider,
      { value: route },
      h(
        HydrationTimeStampContext.Provider,
        { value: hydrationTimeStamp },
        h(
          HeadManagerContext.Provider,
          { value: headManager },
          h(
            CacheContext.Provider,
            { value: cache },
            h(LoadingContext.Provider, { value: loading }, children),
          ),
        ),
      ),
    ),
  );
}

/**
 * Navigates the Ruck app to a route URL.
 *
 * Ruck generally attempts to match what the page content and scroll position
 * would be for a SSR page load of the URL, according to these URL scenarios:
 *
 * - _To the same page, without a hash._ The page scrolls to the start.
 * - _To the same page, with a hash._ If the hash target exists it will be
 *   scrolled to, even if the same hash is already in the URL. If it doesn’t, no
 *   scrolling happens.
 * - _To another page, without a hash._ The page scrolls to the start.
 * - _To another page, with a hash._ After route content mounts, if the hash
 *   target exists it will be scrolled to. If it doesn’t, the page scrolls to
 *   the start.
 * @callback Navigate
 * @param {NavigateOptions} options Options.
 * @returns {Promise<void>} Resolves once the navigation is done.
 */

/**
 * {@linkcode Navigate} options.
 * @typedef {object} NavigateOptions
 * @prop {string | URL} url Ruck app route URL to navigate to that’s absolute or
 *   relative to the `document.baseURI`.
 * @prop {boolean} [updateHistory] Update the browser `history` API? Defaults
 *   to `true`.
 * @prop {AbortController} [abortController] Abort controller to abort the
 *   navigation. Has no effect after navigation ends.
 */
