// @ts-check

import { createElement as h, Fragment } from "react";

/** Document head tag manager {@linkcode Fragment}. */
export default class HeadManager extends EventTarget {
  constructor() {
    super();

    /**
     * @type {Map<
     *   import("react").ReactNode,
     *   { key: string, priority: number }
     * >}
     */
    this.managed = new Map();
  }

  /**
   * Gets the managed document head tag content.
   *
   * If multiple entries have the same head tag fragment key, higher priority or
   * later added ones override.
   *
   * The final head tag fragments are ordered by key, ensuring:
   *
   * - The project author can control the order.
   * - Adding or removing managed document head tags causes minimal React
   *   rendering DOM mutations that can cause FOUC.
   */
  getHeadContent() {
    /**
     * @type {Map<
     *   string,
     *   { priority: number, content: import("react").ReactNode }
     * >}
     */
    const deduped = new Map();

    for (const [content, { key, priority }] of [...this.managed].reverse()) {
      const existing = deduped.get(key);

      if (!existing || existing.priority < priority) {
        deduped.set(key, { priority, content });
      }
    }

    const sorted = new Map([...deduped].sort(([a], [b]) => a.localeCompare(b)));
    const content = [];

    for (const [key, value] of sorted) {
      content.push(h(Fragment, { key }, value.content));
    }

    return content;
  }

  /**
   * Adds document head tags.
   * @param {string} key Head tag fragment key.
   * @param {import("react").ReactNode} content Memoized React content
   *   containing head tags.
   * @param {number} [priority=0] Priority. Higher priority managed head tags
   *   override lower priority ones with the same head tag fragment key.
   */
  add(key, content, priority = 0) {
    if (typeof key !== "string") {
      throw new TypeError("Argument 1 `key` must be a string.");
    }

    if (arguments.length < 2) {
      throw new TypeError("Argument 2 `content` must be specified.");
    }

    if (typeof priority !== "number") {
      throw new TypeError("Argument 3 `priority` must be a number.");
    }

    const preexisting = this.managed.get(content);

    if (!preexisting) {
      this.managed.set(content, { key, priority });
      this.dispatchEvent(new CustomEvent("update"));
    } else {
      if (key !== preexisting.key) {
        throw new TypeError(
          `Argument 2 \`content\` already added with a different \`key\` of \`${preexisting.key}\`.`,
        );
      }

      if (priority !== preexisting.priority) {
        throw new TypeError(
          `Argument 2 \`content\` already added with a different \`priority\` of \`${preexisting.priority}\`.`,
        );
      }

      // Do nothing as this exact combination of arguments has already been
      // added.
    }
  }

  /**
   * Removes document head tags.
   * @param {import("react").ReactNode} content Memoized React content
   *   containing head tags to remove.
   */
  remove(content) {
    if (this.managed.has(content)) {
      this.managed.delete(content);
      this.dispatchEvent(new CustomEvent("update"));
    }
  }
}
