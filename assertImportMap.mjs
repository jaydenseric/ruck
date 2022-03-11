// @ts-check

/**
 * Asserts a value is a standard import map.
 * @see https://wicg.github.io/import-maps/#parsing
 * @param {any} value Supposed import map.
 * @returns {asserts value is ImportMap} `void` for JavaScript and the assertion
 *   for TypeScript.
 */
export default function assertImportMap(value) {
  try {
    // Todo: Deeper validation of URL strings, etc.

    if (typeof value !== "object" || !value) {
      throw new TypeError("Import map must be an object.");
    }

    if ("imports" in value) {
      if (typeof value.imports !== "object" || !value.imports) {
        throw new TypeError("Import map property `imports` must be an object.");
      }

      for (const [importsKey, importsValue] of Object.entries(value.imports)) {
        if (!importsKey.length) {
          throw new TypeError(
            `Import map property \`imports\` mustn’t contain an empty key.`,
          );
        }

        if (typeof importsValue !== "string") {
          throw new TypeError(
            `Import map property \`imports\` property \`${importsKey}\` must be a string.`,
          );
        }

        if (!importsValue.length) {
          throw new TypeError(
            `Import map property \`imports\` property \`${importsKey}\` must be a non empty string.`,
          );
        }
      }
    }

    if ("scopes" in value) {
      if (typeof value.scopes !== "object" || !value.scopes) {
        throw new TypeError("Import map property `scopes` must be an object.");
      }

      for (const [scopesKey, scopesValue] of Object.entries(value.scopes)) {
        if (!scopesKey.length) {
          throw new TypeError(
            `Import map property \`scopes\` mustn’t contain an empty key.`,
          );
        }

        if (typeof scopesValue !== "object" || !scopesValue) {
          throw new TypeError(
            `Import map property \`scopes\` property \`${scopesKey}\` must be an object.`,
          );
        }

        for (const [scopeKey, scopeValue] of Object.entries(scopesValue)) {
          if (!scopeKey.length) {
            throw new TypeError(
              `Import map property \`scopes\` property \`${scopesKey}\` mustn’t contain an empty key.`,
            );
          }

          if (typeof scopeValue !== "string") {
            throw new TypeError(
              `Import map property \`scopes\` property \`${scopesKey}\` property \`${scopeKey}\` must be a string.`,
            );
          }

          if (!scopeValue.length) {
            throw new TypeError(
              `Import map property \`scopes\` property \`${scopesKey}\` property \`${scopeKey}\` must be a non empty string.`,
            );
          }
        }
      }
    }
  } catch (cause) {
    throw new TypeError("Invalid import map.", { cause });
  }
}

/**
 * A standard import map.
 * @see https://github.com/WICG/import-maps
 * @typedef {object} ImportMap
 * @prop {ImportMapSpecifierMap} [imports] Import specifier map.
 * @prop {Record<string, ImportMapSpecifierMap>} [scopes] Ordered map of URLs
 *   to import specifier maps.
 */

/**
 * Ordered map of import specifiers to absolute or relative URL addresses.
 * @typedef {Record<string, string>} ImportMapSpecifierMap
 */
