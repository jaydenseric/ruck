// @ts-check

// Inspiration:
// https://github.com/vercel/next.js/blob/81c3cd682b301d623df450c69ad2cf225b5aa570/packages/next/server/htmlescape.ts
// https://github.com/zertosh/htmlescape/blob/02dbcc367dd3069b73253ac08d87a40d37984239/htmlescape.js

/** @type {{ [key: string]: string }} */
const escapeMap = ({
  "&": "\\u0026",
  "<": "\\u003c",
  ">": "\\u003e",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029",
});

/**
 * HTML escapes a JSON string for use as a raw JavaScript value within a
 * templated HTML script.
 * @param {string} json JSON.
 */
export default function jsonToRawHtmlScriptValue(json) {
  if (typeof json !== "string") {
    throw new TypeError("Argument 1 `json` must be a string.");
  }

  return json.replace(/[&<>\u2028\u2029]/gu, (match) => escapeMap[match]);
}
