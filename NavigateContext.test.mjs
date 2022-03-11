// @ts-check

import { createElement as h, useContext } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { assertStrictEquals } from "std/testing/asserts.ts";

import NavigateContext from "./NavigateContext.mjs";

Deno.test("`NavigateContext` used as a React context.", () => {
  let contextValue;

  function TestComponent() {
    contextValue = useContext(NavigateContext);
    return null;
  }

  const value = async () => {};

  renderToStaticMarkup(
    h(NavigateContext.Provider, { value }, h(TestComponent)),
  );

  assertStrictEquals(contextValue, value);
});
