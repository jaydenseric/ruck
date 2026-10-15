// @ts-check

import { suite, test } from "node:test";
import { assertEquals } from "@std/assert/equals";
import { assertInstanceOf } from "@std/assert/instance-of";
import { assertRejects } from "@std/assert/rejects";
import { assertStrictEquals } from "@std/assert/strict-equals";

import publicFileResponse from "./publicFileResponse.mjs";

suite("Function `publicFileResponse`.", {
  concurrency: true,
}, () => {
  test(
    "Argument 1 `request` not a `Request` instance.",
    async () => {
      await assertRejects(
        () =>
          publicFileResponse(
            // @ts-expect-error Testing invalid.
            true,
            new URL("./", import.meta.url),
          ),
        TypeError,
        "Argument 1 `request` must be a `Request` instance.",
      );
    },
  );

  test(
    "Argument 2 `publicDir` not a `URL` instance.",
    async () => {
      await assertRejects(
        () =>
          publicFileResponse(
            new Request(import.meta.url),
            // @ts-expect-error Testing invalid.
            true,
          ),
        TypeError,
        "Argument 2 `publicDir` must be a `URL` instance.",
      );
    },
  );

  test(
    "Argument 2 `publicDir` not a URL ending with `/`.",
    async () => {
      await assertRejects(
        () =>
          publicFileResponse(
            new Request(import.meta.url),
            new URL(import.meta.url),
          ),
        TypeError,
        "Argument 2 `publicDir` must be a URL ending with `/`.",
      );
    },
  );

  test(
    "Argument 3 `customizeResponseInit` not a function.",
    async () => {
      await assertRejects(
        () =>
          publicFileResponse(
            new Request(import.meta.url),
            new URL("./", import.meta.url),
            // @ts-expect-error Testing invalid.
            true,
          ),
        TypeError,
        "Argument 3 `customizeResponseInit` must be a function.",
      );
    },
  );

  test("Directory.", async () => {
    await assertRejects(
      () =>
        publicFileResponse(
          new Request("http://localhost/directory"),
          new URL(
            "./test/fixtures/publicFileResponse/public/",
            import.meta.url,
          ),
        ),
      Deno.errors.NotFound,
      "",
    );
  });

  test("Missing file.", async () => {
    await assertRejects(
      () =>
        publicFileResponse(
          new Request("http://localhost/B.css"),
          new URL(
            "./test/fixtures/publicFileResponse/public/",
            import.meta.url,
          ),
        ),
      Deno.errors.NotFound,
      "",
    );
  });

  test("Extensionless file.", async () => {
    const publicDir = new URL(
      "./test/fixtures/publicFileResponse/public/",
      import.meta.url,
    );
    const response = await publicFileResponse(
      new Request("http://localhost/A"),
      publicDir,
    );

    assertInstanceOf(response.headers, Headers);
    assertEquals(Array.from(response.headers.entries()), []);
    assertStrictEquals(
      await response.text(),
      await Deno.readTextFile(new URL("./A", publicDir)),
    );
  });

  test("Unknown file extension.", async () => {
    const publicDir = new URL(
      "./test/fixtures/publicFileResponse/public/",
      import.meta.url,
    );
    const response = await publicFileResponse(
      new Request("http://localhost/A.abcdefg"),
      publicDir,
    );

    assertInstanceOf(response.headers, Headers);
    assertEquals(Array.from(response.headers.entries()), []);
    assertStrictEquals(
      await response.text(),
      await Deno.readTextFile(new URL("./A.abcdefg", publicDir)),
    );
  });

  test("CSS file.", async () => {
    const publicDir = new URL(
      "./test/fixtures/publicFileResponse/public/",
      import.meta.url,
    );
    const response = await publicFileResponse(
      new Request("http://localhost/A.css"),
      publicDir,
    );

    assertInstanceOf(response.headers, Headers);
    assertEquals(Array.from(response.headers.entries()), [
      ["content-type", "text/css; charset=UTF-8"],
    ]);
    assertStrictEquals(
      await response.text(),
      await Deno.readTextFile(new URL("./A.css", publicDir)),
    );
  });

  test("JavaScript module.", async () => {
    const publicDir = new URL(
      "./test/fixtures/publicFileResponse/public/",
      import.meta.url,
    );
    const response = await publicFileResponse(
      new Request("http://localhost/A.mjs"),
      publicDir,
    );

    assertInstanceOf(response.headers, Headers);
    assertEquals(Array.from(response.headers.entries()), [
      ["content-type", "text/javascript; charset=UTF-8"],
    ]);
    assertStrictEquals(
      await response.text(),
      await Deno.readTextFile(new URL("./A.mjs", publicDir)),
    );
  });

  suite("Customized response.", {
    concurrency: true,
  }, () => {
    test(
      "Error.",
      async () => {
        const errorA = new Error("A.");

        try {
          await publicFileResponse(
            new Request("http://localhost/A.mjs"),
            new URL(
              "./test/fixtures/publicFileResponse/public/",
              import.meta.url,
            ),
            () => {
              throw errorA;
            },
          );

          throw new Error("Expected an error.");
        } catch (error) {
          assertStrictEquals(error, errorA);
        }
      },
    );

    test(
      "No error.",
      async () => {
        const publicDir = new URL(
          "./test/fixtures/publicFileResponse/public/",
          import.meta.url,
        );
        const addedHeadersEntry = /** @type {const} */ ([
          "access-control-allow-origin",
          "*",
        ]);
        const response = await publicFileResponse(
          new Request("http://localhost/A.mjs"),
          publicDir,
          (_request, responseInit) => {
            responseInit.headers.set(...addedHeadersEntry);
            return responseInit;
          },
        );

        assertInstanceOf(response.headers, Headers);
        assertEquals(Array.from(response.headers.entries()), [
          addedHeadersEntry,
          ["content-type", "text/javascript; charset=UTF-8"],
        ]);
        assertStrictEquals(
          await response.text(),
          await Deno.readTextFile(new URL("./A.mjs", publicDir)),
        );
      },
    );
  });
});
