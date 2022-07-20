// @ts-check

import { assertThrows } from "std/testing/asserts.ts";

import jsonToRawHtmlScriptValue from "./jsonToRawHtmlScriptValue.mjs";

Deno.test("`jsonToRawHtmlScriptValue` with argument 1 `json` not a string.", () => {
  assertThrows(
    () => {
      jsonToRawHtmlScriptValue(
        // @ts-expect-error Testing invalid.
        true,
      );
    },
    TypeError,
    "Argument 1 `json` must be a string.",
  );
});
