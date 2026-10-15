// @ts-check

import { suite, test } from "node:test";
import { assertStrictEquals } from "@std/assert/strict-equals";
import { createElement as h, useContext } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import HeadManager from "./HeadManager.mjs";
import HeadManagerContext from "./HeadManagerContext.mjs";

suite("React context `HeadManagerContext`.", {
  concurrency: true,
}, () => {
  test("Usage.", () => {
    let contextValue;

    function TestComponent() {
      contextValue = useContext(HeadManagerContext);
      return null;
    }

    const value = new HeadManager();

    renderToStaticMarkup(
      h(HeadManagerContext.Provider, { value }, h(TestComponent)),
    );

    assertStrictEquals(contextValue, value);
  });
});
