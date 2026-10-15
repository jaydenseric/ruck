// @ts-check

import { suite, test } from "node:test";
import { assertThrows } from "@std/assert/throws";

import HeadManager from "./HeadManager.mjs";
import routePlanForContentWithCss from "./routePlanForContentWithCss.mjs";

suite("Function `routePlanForContentWithCss`.", {
  concurrency: true,
}, () => {
  test("Argument 1 `routeContentWithCss` not an object or promise.", () => {
    assertThrows(
      () => {
        routePlanForContentWithCss(
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

  test("Argument 2 `headManager` not a `HeadManager` instance.", () => {
    assertThrows(
      () => {
        routePlanForContentWithCss(
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

  test("Argument 3 `isInitialRoute` not a boolean.", () => {
    assertThrows(
      () => {
        routePlanForContentWithCss(
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
});
