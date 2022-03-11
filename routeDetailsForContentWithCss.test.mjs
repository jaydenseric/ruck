// @ts-check

import { assertThrows } from "std/testing/asserts.ts";

import HeadManager from "./HeadManager.mjs";
import routeDetailsForContentWithCss from "./routeDetailsForContentWithCss.mjs";

Deno.test("`routeDetailsForContentWithCss` with argument 1 `routeContentWithCss` not an object or promise.", () => {
  assertThrows(
    () => {
      routeDetailsForContentWithCss(
        // @ts-expect-error Testing invalid.
        true,
        new HeadManager(),
        true,
      );
    },
    TypeError,
    "Argument 1 `routeContentWithCss` must be an object or promise.",
  );
});

Deno.test("`routeDetailsForContentWithCss` with argument 2 `headManager` not a `HeadManager` instance.", () => {
  assertThrows(
    () => {
      routeDetailsForContentWithCss(
        {
          content: null,
          css: new Set(["/"]),
        },
        // @ts-expect-error Testing invalid.
        true,
        true,
      );
    },
    TypeError,
    "Argument 2 `headManager` must be a `HeadManager` instance.",
  );
});

Deno.test("`routeDetailsForContentWithCss` with argument 3 `isInitialRoute` not a boolean.", () => {
  assertThrows(
    () => {
      routeDetailsForContentWithCss(
        {
          content: null,
          css: new Set(["/"]),
        },
        new HeadManager(),
        // @ts-expect-error Testing invalid.
        null,
      );
    },
    TypeError,
    "Argument 3 `isInitialRoute` must be a boolean.",
  );
});
