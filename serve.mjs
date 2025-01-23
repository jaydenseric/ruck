// @ts-check

/**
 * @import { ReactElement, ReactNode } from "react"
 * @import { ImportMap } from "./assertImportMap.mjs"
 */

import { STATUS_CODE, STATUS_TEXT } from "@std/http/status";
import { toFileUrl } from "@std/path/to-file-url";
import Cache from "graphql-react/Cache.mjs";
import CacheContext from "graphql-react/CacheContext.mjs";
import Loading from "graphql-react/Loading.mjs";
import LoadingContext from "graphql-react/LoadingContext.mjs";
import { createElement as h, Fragment } from "react";
import { renderToString } from "react-dom/server";
import waterfallRender from "react-waterfall-render/waterfallRender.mjs";

import assertImportMap from "./assertImportMap.mjs";
import HeadManager from "./HeadManager.mjs";
import HeadManagerContext from "./HeadManagerContext.mjs";
import Html from "./Html.mjs";
import jsonToRawHtmlScriptValue from "./jsonToRawHtmlScriptValue.mjs";
import publicFileResponse from "./publicFileResponse.mjs";
import readImportMapFile from "./readImportMapFile.mjs";
import RouteContext from "./RouteContext.mjs";
import TransferContext from "./TransferContext.mjs";

/**
 * Serves a Ruck app.
 * @param {object} options Options.
 * @param {ImportMap | URL} options.clientImportMap Client import map object or
 *   JSON file URL.
 * @param {URL} [options.publicDir] Public directory file URL. Defaults to a
 *   `public` directory in the CWD.
 * @param {HtmlComponent} [options.htmlComponent] React component that renders
 *   the HTML for Ruck app page responses. Defaults to {@linkcode Html}.
 * @param {number} [options.port] Port to serve on. Set `0` to listen on any
 *   available port (later get the listening port via the resolved HTTP server
 *   property `addr.port`). Defaults to `0`.
 * @param {AbortSignal} [options.signal] Abort controller signal to close the
 *   server.
 * @returns {Promise<Deno.HttpServer<Deno.NetAddr>>} Resolves the listening HTTP
 *   server.
 */
export default async function serve({
  clientImportMap,
  publicDir = new URL("public/", toFileUrl(Deno.cwd() + "/")),
  htmlComponent = Html,
  port = 0,
  signal,
}) {
  if (
    !(clientImportMap instanceof URL) &&
    (typeof clientImportMap !== "object" || !clientImportMap)
  ) {
    throw new TypeError(
      "Option `clientImportMap` must be an import map object or `URL` instance.",
    );
  }

  if (!(publicDir instanceof URL)) {
    throw new TypeError("Option `publicDir` must be a `URL` instance.");
  }

  if (!publicDir.href.endsWith("/")) {
    throw new TypeError("Option `publicDir` must be a URL ending with `/`.");
  }

  if (typeof htmlComponent !== "function") {
    throw new TypeError("Option `htmlComponent` must be a function.");
  }

  if (typeof port !== "number") {
    throw new TypeError("Option `port` must be a number.");
  }

  if (signal !== undefined && !(signal instanceof AbortSignal)) {
    throw new TypeError("Option `signal` must be an `AbortSignal` instance.");
  }

  /** @type {ImportMap} */
  let clientImportMapContent;

  if (clientImportMap instanceof URL) {
    clientImportMapContent = await readImportMapFile(clientImportMap);
  } else {
    try {
      assertImportMap(clientImportMap);
    } catch (cause) {
      throw new TypeError(
        "Option `clientImportMap` must be an import map object.",
        { cause },
      );
    }

    clientImportMapContent = clientImportMap;
  }

  // Todo: Validate and handle predictable client import map issues, such as
  // missing Ruck dependencies.

  const routerFileUrl = new URL("router.mjs", publicDir);

  /** @type {Router} */
  let router;

  try {
    ({ default: router } = await import(routerFileUrl.href));
  } catch (cause) {
    throw new Error(`Error importing \`${routerFileUrl.href}\`.`, { cause });
  }

  const appFileUrl = new URL("components/App.mjs", publicDir);

  /** @type {AppComponent} */
  let App;

  try {
    ({ default: App } = await import(appFileUrl.href));
  } catch (cause) {
    throw new Error(`Error importing \`${appFileUrl.href}\`.`, { cause });
  }

  return Deno.serve(
    {
      port,
      signal,
    },
    async (request) => {
      // The route URL should be what the client originally used to start the
      // request.
      const routeUrl = new URL(request.url);

      // Reverse proxy servers (load balancers, CDNs, etc.) may have forwarded
      // the original client request using a different protocol or host. E.g.
      // Fly.io forwards `https:` requests to the deployed server using `http:`.

      const headerXForwardedProto = request.headers.get("x-forwarded-proto");
      if (headerXForwardedProto) {
        routeUrl.protocol = headerXForwardedProto + ":";
      }

      const headerXForwardedHost = request.headers.get("x-forwarded-host");
      if (headerXForwardedHost) {
        routeUrl.hostname = headerXForwardedHost;
      }

      // Todo: Investigate supporting the `x-forwarded-port` header.
      // Todo: Investigate supporting the standard `Forwarded` header.

      // First, try serving the request as a file from the public directory.
      // If no such file exists the request is for an app route.

      if (
        // Public files have a URL pathname; the homepage is an app route.
        routeUrl.pathname !== "/"
      ) {
        try {
          return await publicFileResponse(request, publicDir);
        } catch (cause) {
          if (!(cause instanceof Deno.errors.NotFound)) {
            throw new Error("Ruck couldn’t serve a public file.", { cause });
          }
        }
      }

      const headManager = new HeadManager();

      /** @type {RoutePlan} */
      let routePlan;

      try {
        routePlan = router(routeUrl, headManager, true);
      } catch (cause) {
        throw new Error(
          `Ruck couldn’t plan the route for URL ${routeUrl.href}.`,
          { cause },
        );
      }

      if (typeof routePlan !== "object" || !routePlan) {
        throw new TypeError(
          `Ruck route plan is invalid for URL ${routeUrl.href}.`,
        );
      }

      /** @type {ReactNode} */
      let routeContent;

      try {
        routeContent = await routePlan.content;
      } catch (cause) {
        throw new Error(
          `Ruck couldn’t resolve the route content for URL ${routeUrl.href}.`,
          { cause },
        );
      }

      // Todo: Validate the route content.

      try {
        const cache = new Cache();
        const loading = new Loading();

        /** @type {ResponseInit} */
        const responseInit = {
          status: STATUS_CODE.OK,
          statusText: STATUS_TEXT[STATUS_CODE.OK],
          headers: new Headers({
            "content-type": "text/html; charset=utf-8",
          }),
        };

        /** @type {Transfer} */
        const transfer = { request, responseInit };

        const bodyReactRootInnerHtml = await waterfallRender(
          h(
            TransferContext.Provider,
            { value: transfer },
            h(
              RouteContext.Provider,
              {
                value: {
                  url: routeUrl,
                  content: routeContent,
                },
              },
              h(
                HeadManagerContext.Provider,
                { value: headManager },
                h(
                  CacheContext.Provider,
                  { value: cache },
                  h(LoadingContext.Provider, { value: loading }, h(App)),
                ),
              ),
            ),
          ),
          renderToString,
        );

        const responseBody = `<!DOCTYPE html>
${
          renderToString(
            h(
              TransferContext.Provider,
              { value: transfer },
              h(htmlComponent, {
                importMapScript: h("script", {
                  type: "importmap",
                  dangerouslySetInnerHTML: {
                    __html: JSON.stringify(clientImportMapContent),
                  },
                }),
                headReactRoot: h(
                  Fragment,
                  null,
                  h("meta", { name: "ruck-head-start" }),
                  headManager.getHeadContent(),
                  h("meta", { name: "ruck-head-end" }),
                ),
                bodyReactRoot: h("div", {
                  id: "ruck-app",
                  dangerouslySetInnerHTML: { __html: bodyReactRootInnerHtml },
                }),
                hydrationScript: h("script", {
                  type: "module",
                  dangerouslySetInnerHTML: {
                    __html: /* JS */ `import hydrate from "ruck/hydrate.mjs";
import App from "/components/App.mjs";
import router from "/router.mjs";

hydrate({
  router,
  appComponent: App,
  cacheData: ${jsonToRawHtmlScriptValue(JSON.stringify(cache.store))},
});
`,
                  },
                }),
              }),
            ),
          )
        }`;

        return new Response(responseBody, responseInit);
      } catch (cause) {
        throw new Error("Ruck couldn’t serve the rendered route.", { cause });
      }
    },
  );
}

/**
 * Isomorphic React component that renders the Ruck React app.
 * @callback AppComponent
 * @returns {ReactElement}
 */

/**
 * Server only React component that renders a HTML page for a server side
 * rendered Ruck app page.
 * @callback HtmlComponent
 * @param {HtmlComponentProps} props Props.
 * @returns {ReactElement}
 */

/**
 * {@linkcode HtmlComponent} React component props.
 * @typedef {object} HtmlComponentProps
 * @prop {ReactElement} importMapScript Import map script. Should be the first
 *   script in the HTML.
 * @prop {ReactNode} headReactRoot HTML head React root for Ruck managed head
 *   tags. Should be early in the HTML head, typically after the import map
 *   script as it may contain scripts.
 * @prop {ReactNode} bodyReactRoot HTML body React root for the main Ruck app
 *   content.
 * @prop {ReactElement} hydrationScript Ruck app hydration script. Should be
 *   towards the end of the HTML body.
 */

/**
 * Ruck response init.
 * @typedef {object} ResponseInit
 * @prop {Headers} headers Headers.
 * @prop {number} status HTTP status code.
 * @prop {string} [statusText] HTTP status text.
 */

/**
 * Ruck app route that has loaded and is ready to render.
 * @typedef {object} Route
 * @prop {URL} url Route URL.
 * @prop {ReactNode} content Route content.
 * @prop {() => void} [cleanup] Callback that runs when navigation to this route
 *   aborts, or after navigation to the next route for a different page. Doesn’t
 *   run during SSR.
 */

/**
 * Ruck app route plan.
 * @typedef {object} RoutePlan
 * @prop {ReactNode | Promise<ReactNode>} content Route content.
 * @prop {() => void} [cleanup] Callback that runs when navigation to this route
 *   aborts, or after navigation to the next route for a different page. Doesn’t
 *   run during SSR.
 */

/**
 * Isomorphic function that gets the Ruck app route for a URL.
 * @callback Router
 * @param {URL} url Ruck app route URL.
 * @param {HeadManager} headManager Head tag manager.
 * @param {boolean} isInitialRoute Is it the initial route.
 * @returns {RoutePlan}
 */

/**
 * Ruck app request and response context.
 * @typedef {object} Transfer
 * @prop {Readonly<Request>} request Request.
 * @prop {ResponseInit} responseInit Response initialization options.
 */
