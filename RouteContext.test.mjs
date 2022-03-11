// @ts-check

import { createElement as h, useContext } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { assertStrictEquals } from "std/testing/asserts.ts";

import RouteContext from "./RouteContext.mjs";

Deno.test("`RouteContext` used as a React context.", () => {
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
