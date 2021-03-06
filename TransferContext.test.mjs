// @ts-check

import { createElement as h, useContext } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { assertStrictEquals } from "std/testing/asserts.ts";

import TransferContext from "./TransferContext.mjs";

Deno.test("`TransferContext` used as a React context.", () => {
  let contextValue;

  function TestComponent() {
    contextValue = useContext(TransferContext);
    return null;
  }

  const value = /** @type {import("./serve.mjs").Transfer} */ ({});

  renderToStaticMarkup(
    h(TransferContext.Provider, { value }, h(TestComponent)),
  );

  assertStrictEquals(contextValue, value);
});
