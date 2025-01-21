// @ts-check

/** @import { Transfer } from "./serve.mjs" */

import { assertStrictEquals } from "@std/assert/strict-equals";
import { createElement as h, useContext } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import TransferContext from "./TransferContext.mjs";

Deno.test("`TransferContext` used as a React context.", () => {
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
