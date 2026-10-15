// @ts-check

/** @import { Transfer } from "./serve.mjs" */

import { suite, test } from "node:test";
import { assertStrictEquals } from "@std/assert/strict-equals";
import { createElement as h, useContext } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import TransferContext from "./TransferContext.mjs";

suite("React context `TransferContext`.", {
  concurrency: true,
}, () => {
  test("Usage.", () => {
    let contextValue;

    function TestComponent() {
      contextValue = useContext(TransferContext);
      return null;
    }

    const value = /** @type {Transfer} */ ({});

    renderToStaticMarkup(
      h(TransferContext.Provider, { value }, h(TestComponent)),
    );

    assertStrictEquals(contextValue, value);
  });
});
