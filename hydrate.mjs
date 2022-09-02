// @ts-check

import Cache from "graphql-react/Cache.mjs";
import Loading from "graphql-react/Loading.mjs";
import { createElement as h } from "react";
import { hydrateRoot } from "react-dom/client";

import ClientProvider from "./ClientProvider.mjs";
import createPseudoNode from "./createPseudoNode.mjs";
import HeadContent from "./HeadContent.mjs";
import HeadManager from "./HeadManager.mjs";

/**
 * Hydrates the Ruck document head and body React apps after SSR.
 * @param {object} options Options.
 * @param {import("./serve.mjs").Router} options.router Router.
 * @param {import("./serve.mjs").AppComponent} options.appComponent App React
 *   component.
 * @param {Record<string, any>} options.cacheData Cache data.
 */
export default async function hydrate({ router, appComponent, cacheData }) {
  if (typeof router !== "function") {
    throw new TypeError("Option `router` must be a function.");
  }

  const bodyReactRootContainer = document.getElementById("ruck-app");

  if (!bodyReactRootContainer) {
    throw new Error("Ruck body React app DOM node missing.");
  }

  const ruckHeadStart = document.head.querySelector('[name="ruck-head-start"]');

  if (!ruckHeadStart) {
    throw new Error("Ruck head React app start DOM node missing.");
  }

  const ruckHeadEnd = document.head.querySelector('[name="ruck-head-end"]');

  if (!ruckHeadEnd) {
    throw new Error("Ruck head React app end DOM node missing.");
  }

  const headReactRootContainer = /** @type {HTMLHeadElement} */ (
    createPseudoNode(ruckHeadStart, ruckHeadEnd)
  );
  const headManager = new HeadManager();
  const initialRouteUrl = new URL(location.href);
  // Todo: Validate what the router returns.
  const { content, cleanup } = router(initialRouteUrl, headManager, true);
  const initialRoute = {
    url: initialRouteUrl,
    content: await content,
    cleanup,
  };

  // Hydrate the body React app first, so the head manager knows what content to
  // render in the head app.
  hydrateRoot(
    bodyReactRootContainer,
    h(
      ClientProvider,
      {
        hydrationTimeStamp: performance.now(),
        headManager,
        cache: new Cache(cacheData),
        loading: new Loading(),
        router,
        initialRoute,
        onEffectsDone() {
          // Hydrate the head React app.
          hydrateRoot(headReactRootContainer, h(HeadContent, { headManager }));
        },
      },
      h(appComponent),
    ),
  );
}
