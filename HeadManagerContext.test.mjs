// @ts-check

import { assertStrictEquals } from "@std/assert/strict-equals";
import { createElement as h, useContext } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import HeadManager from "./HeadManager.mjs";
import HeadManagerContext from "./HeadManagerContext.mjs";

Deno.test("`HeadManagerContext` used as a React context.", () => {
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
