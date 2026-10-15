// @ts-check

import { suite, test } from "node:test";
import { assertStrictEquals } from "@std/assert/strict-equals";
import { createElement as h, useContext } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import RouteContext from "./RouteContext.mjs";

suite("React context `RouteContext`.", {
  concurrency: true,
}, () => {
  test("Usage.", () => {
    const value = {
      url: new URL("http://localhost"),
      content: null,
    };

    let contextValue;

    function TestComponent() {
      contextValue = useContext(RouteContext);
      return null;
    }

    renderToStaticMarkup(h(RouteContext.Provider, { value }, h(TestComponent)));

    assertStrictEquals(contextValue, value);
  });
});
