// @ts-check

// Todo: Delete this module once this Astral bug is fixed:
// https://github.com/lino-levan/astral/issues/123

/**
 * Gets an Astral browser page URL.
 * @see https://github.com/lino-levan/astral/issues/123#issuecomment-2566822577
 * @param {import("@astral/astral").Page} page Astral browser page.
 * @returns The page URL.
 */
export default async function browserPageUrl(page) {
  return await page.evaluate(() =>
    // deno-lint-ignore no-window
    window.location.href
  );
}
