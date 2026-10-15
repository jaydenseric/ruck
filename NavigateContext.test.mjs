// @ts-check

import { suite, test } from "node:test";
import { assertStrictEquals } from "@std/assert/strict-equals";
import { createElement as h, useContext } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import NavigateContext from "./NavigateContext.mjs";

suite("React context `NavigateContext`.", {
  concurrency: true,
}, () => {
  test("Usage.", () => {
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
});
