// @ts-check

/**
 * Scrolls the browser window to a URL hash target element (if it exists), or to
 * the start if the hash is undefined.
 * @param {string} [hash] URL hash.
 */
export default function scrollToHash(hash) {
  if (hash !== undefined && typeof hash !== "string") {
    throw new TypeError("Argument 1 `hash` must be a string.");
  }

  if (hash) {
    const element = document.querySelector(hash);
    if (element) element.scrollIntoView();
  } else scrollTo(0, 0);
}
