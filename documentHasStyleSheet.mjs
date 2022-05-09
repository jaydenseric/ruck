// @ts-check

/**
 * Checks if the document has a style sheet that finished loading (successfully
 * or not). This is not intended to detect pending or in progress reloading.
 * It’s possible for the document to have multiple style sheets with the same
 * `href`; if any are loaded the CSS is considered loaded.
 * @param {string} href CSS URL that’s absolute or relative to the
 *   `document.baseURI`.
 * @returns {boolean} Is the CSS loaded.
 */
export default function documentHasStyleSheet(href) {
  if (typeof href !== "string") {
    throw new TypeError("Argument 1 `href` must be a string.");
  }

  /** CSS absolute URL. */
  const url = new URL(href, document.baseURI).href;

  for (const cssStyleSheet of document.styleSheets) {
    if (cssStyleSheet.href === url) {
      // Note that reading the rules errors if the style sheet is cross-domain
      // and it’s `link` element doesn’t have `crossorigin="anonymous"`.
      // Apparently the rules can be read without error for unparsable CSS.
      if (cssStyleSheet.cssRules.length) return true;
      else {
        // Possible reasons for no style sheet rules:
        //
        // 1. Loading isn’t done.
        // 2. Network error.
        // 3. Unparsable CSS.
        // 4. Really it has none.
        //
        // Reason 1 can be identified if the CSS request started and the
        // response hasn’t ended yet. Note that the CSS could be falsely
        // considered not loaded if its performance resource timing data was
        // cleared, e.g. because the entry limit was exceeded or via
        // `performance.clearResourceTimings()`. It’s also assumed this data
        // isn’t affected by browser private mode, etc.

        const entries = /** @type {Array<PerformanceResourceTiming>} */ (
          performance.getEntriesByName(url, "resource")
        );

        if (
          entries.length &&
          // Apparently `responseEnd` doesn’t just relate to a server response;
          // it will be present if a network error ended the request.
          entries[entries.length - 1].responseEnd
        ) {
          return true;
        }
      }
    }
  }

  return false;
}
