// @ts-check

import { suite, test } from "node:test";
import { assertEquals } from "@std/assert/equals";
import { assertInstanceOf } from "@std/assert/instance-of";
import { assertStrictEquals } from "@std/assert/strict-equals";
import { assertThrows } from "@std/assert/throws";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import HeadManager from "./HeadManager.mjs";

suite("Class `HeadManager`.", {
  concurrency: true,
}, () => {
  test("Constructor.", () => {
    const headManager = new HeadManager();

    assertInstanceOf(headManager, EventTarget);
    assertEquals(headManager.managed, new Map());
    assertStrictEquals(typeof headManager.add, "function");
    assertStrictEquals(typeof headManager.remove, "function");
    assertStrictEquals(typeof headManager.getHeadContent, "function");
  });

  suite("Method `add`.", {
    concurrency: true,
  }, () => {
    test(
      "Argument 1 `key` not a string.",
      () => {
        const headManager = new HeadManager();

        headManager.addEventListener("update", () => {
          throw new Error("Unexpected `update` event.");
        });

        assertThrows(
          () => {
            headManager.add(
              // @ts-expect-error Testing invalid.
              true,
              h("title", null, ""),
            );
          },
          TypeError,
          "Argument 1 `key` must be a string.",
        );
      },
    );

    test(
      "Argument 2 `content` not specified.",
      () => {
        const headManager = new HeadManager();

        headManager.addEventListener("update", () => {
          throw new Error("Unexpected `update` event.");
        });

        assertThrows(
          () => {
            headManager
              // @ts-expect-error Testing invalid.
              .add("a");
          },
          TypeError,
          "Argument 2 `content` must be specified.",
        );
      },
    );

    test(
      "Argument 3 `priority` not a number.",
      () => {
        const headManager = new HeadManager();

        headManager.addEventListener("update", () => {
          throw new Error("Unexpected `update` event.");
        });

        assertThrows(
          () => {
            headManager.add(
              "a",
              h("title", null, ""),
              // @ts-expect-error Testing invalid.
              true,
            );
          },
          TypeError,
          "Argument 3 `priority` must be a number.",
        );
      },
    );

    test("Unpopulated, priority default.", () => {
      const headManager = new HeadManager();
      const key = "a";
      const content = h("title", null, "");

      /** @type {Array<Event>} */
      const events = [];

      headManager.addEventListener("update", (/** @type {Event} */ event) => {
        events.push(event);
        assertEquals(Array.from(headManager.managed.entries()), [
          [content, { key, priority: 0 }],
        ]);
      });

      headManager.add(key, content);

      assertStrictEquals(events.length, 1);
      assertInstanceOf(events[0], CustomEvent);
      assertStrictEquals(events[0].type, "update");
      assertStrictEquals(events[0].cancelable, false);
    });

    test(
      "Unpopulated, priority specified.",
      () => {
        const headManager = new HeadManager();
        const key = "a";
        const content = h("title", null, "");
        const priority = 1;

        /** @type {Array<Event>} */
        const events = [];

        headManager.addEventListener("update", (/** @type {Event} */ event) => {
          events.push(event);
          assertEquals(Array.from(headManager.managed.entries()), [
            [content, { key, priority }],
          ]);
        });

        headManager.add(key, content, priority);

        assertStrictEquals(events.length, 1);
        assertInstanceOf(events[0], CustomEvent);
        assertStrictEquals(events[0].type, "update");
        assertStrictEquals(events[0].cancelable, false);
      },
    );

    test(
      "Populated, keys same, content same, priorities same.",
      () => {
        const headManager = new HeadManager();
        const key = "a";
        const content = h("title", null, "");
        const priority = 1;

        headManager.add(key, content, priority);
        headManager.addEventListener("update", () => {
          throw new Error("Unexpected `update` event.");
        });

        headManager.add(key, content, priority);

        assertEquals(Array.from(headManager.managed.entries()), [
          [content, { key, priority }],
        ]);
      },
    );

    test(
      "Populated, keys different, content same, priorities same.",
      () => {
        const headManager = new HeadManager();
        const firstKey = "a";
        const content = h("title", null, "");
        const priority = 1;

        headManager.add(firstKey, content, priority);
        headManager.addEventListener("update", () => {
          throw new Error("Unexpected `update` event.");
        });

        const secondKey = "b";

        assertThrows(
          () => {
            headManager.add(secondKey, content, priority);
          },
          TypeError,
          `Argument 2 \`content\` already added with a different \`key\` of \`${firstKey}\`.`,
        );

        assertEquals(Array.from(headManager.managed.entries()), [
          [content, { key: firstKey, priority }],
        ]);
      },
    );

    test(
      "Populated, keys same, content same, priorities different.",
      () => {
        const headManager = new HeadManager();
        const key = "a";
        const content = h("title", null, "");
        const firstPriority = 1;

        headManager.add(key, content, firstPriority);
        headManager.addEventListener("update", () => {
          throw new Error("Unexpected `update` event.");
        });

        const secondPriority = 2;

        assertThrows(
          () => {
            headManager.add(key, content, secondPriority);
          },
          TypeError,
          `Argument 2 \`content\` already added with a different \`priority\` of \`${firstPriority}\`.`,
        );

        assertEquals(Array.from(headManager.managed.entries()), [
          [content, { key, priority: firstPriority }],
        ]);
      },
    );

    test("Populated, content different.", () => {
      const headManager = new HeadManager();
      const firstKey = "a";
      const firstContent = h("title", null, "a");
      const secondKey = "b";
      const secondContent = h("meta", { name: "description", content: "b" });

      headManager.add(firstKey, firstContent);

      /** @type {Array<Event>} */
      const events = [];

      headManager.addEventListener("update", (/** @type {Event} */ event) => {
        events.push(event);
        assertEquals(Array.from(headManager.managed.entries()), [
          [
            firstContent,
            {
              key: firstKey,
              priority: 0,
            },
          ],
          [
            secondContent,
            {
              key: secondKey,
              priority: 0,
            },
          ],
        ]);
      });

      headManager.add(secondKey, secondContent);

      assertStrictEquals(events.length, 1);
      assertInstanceOf(events[0], CustomEvent);
      assertStrictEquals(events[0].type, "update");
      assertStrictEquals(events[0].cancelable, false);
    });
  });

  suite("Method `remove`.", {
    concurrency: true,
  }, () => {
    test("Existing.", () => {
      const headManager = new HeadManager();
      const firstKey = "a";
      const firstContent = h("title", null, "a");
      const secondKey = "b";
      const secondContent = h("meta", { name: "description", content: "b" });

      headManager.add(firstKey, firstContent);
      headManager.add(secondKey, secondContent);

      /** @type {Array<Event>} */
      const events = [];

      headManager.addEventListener("update", (/** @type {Event} */ event) => {
        events.push(event);
        assertEquals(Array.from(headManager.managed.entries()), [
          [
            secondContent,
            {
              key: secondKey,
              priority: 0,
            },
          ],
        ]);
      });

      headManager.remove(firstContent);

      assertStrictEquals(events.length, 1);
      assertInstanceOf(events[0], CustomEvent);
      assertStrictEquals(events[0].type, "update");
      assertStrictEquals(events[0].cancelable, false);
    });

    test("Missing.", () => {
      const headManager = new HeadManager();

      headManager.addEventListener("update", () => {
        throw new Error("Unexpected `update` event.");
      });

      headManager.remove(h("title", null, ""));
    });
  });

  suite("Method `getHeadContent`.", {
    concurrency: true,
  }, () => {
    test("1 added.", () => {
      const headManager = new HeadManager();
      const key = "a";

      headManager.add(key, h("title", null, "a"));

      assertEquals(
        renderToStaticMarkup(h("head", null, headManager.getHeadContent())),
        "<head><title>a</title></head>",
      );
    });

    test(
      "2 added, keys same, priority same.",
      () => {
        const headManager = new HeadManager();
        const key = "a";

        headManager.add(key, h("title", null, "a"));
        headManager.add(key, h("title", null, "b"));

        assertEquals(
          renderToStaticMarkup(h("head", null, headManager.getHeadContent())),
          "<head><title>b</title></head>",
        );
      },
    );

    test(
      "2 added, keys same, priority different.",
      () => {
        const headManager = new HeadManager();
        const key = "a";

        headManager.add(key, h("title", null, "a"), 2);
        headManager.add(key, h("title", null, "b"), 1);

        assertEquals(
          renderToStaticMarkup(h("head", null, headManager.getHeadContent())),
          "<head><title>a</title></head>",
        );
      },
    );

    test(
      "2 added, keys different.",
      () => {
        const headManager = new HeadManager();

        // To test sorting by key, add them out of order with their keys.
        headManager.add("b", h("meta", { name: "b", content: "b" }));
        headManager.add("a", h("meta", { name: "a", content: "a" }));

        assertEquals(
          renderToStaticMarkup(h("head", null, headManager.getHeadContent())),
          '<head><meta name="a" content="a"/><meta name="b" content="b"/></head>',
        );
      },
    );
  });
});
