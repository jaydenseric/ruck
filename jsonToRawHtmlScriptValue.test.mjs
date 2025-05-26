// @ts-check

import { assertStrictEquals } from "@std/assert/strict-equals";
import { assertThrows } from "@std/assert/throws";

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

for (
  const [target, replacement, description] of [
    ["&", "\\u0026", "ampersand"],
    ["<", "\\u003c", "less than"],
    [">", "\\u003e", "greater than"],
    ["\u2028", "\\u2028", "line separator"],
    ["\u2029", "\\u2029", "paragraph separator"],
  ]
) {
  Deno.test(`\`jsonToRawHtmlScriptValue\` with JSON containing ${description}.`, () => {
    const json = `{"a":"${target}","b":"${target}"}`;
    const escaped = jsonToRawHtmlScriptValue(json);

    assertStrictEquals(escaped, `{"a":"${replacement}","b":"${replacement}"}`);
    assertStrictEquals(JSON.stringify(JSON.parse(escaped)), json);
  });
}
