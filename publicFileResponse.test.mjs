// @ts-check

import { assert } from "@std/assert/assert";
import { assertEquals } from "@std/assert/equals";
import { assertRejects } from "@std/assert/rejects";
import { assertStrictEquals } from "@std/assert/strict-equals";

import publicFileResponse from "./publicFileResponse.mjs";

Deno.test(
  "`publicFileResponse` with argument 1 `request` not a `Request` instance.",
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

Deno.test(
  "`publicFileResponse` with argument 2 `publicDir` not a `URL` instance.",
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

Deno.test(
  "`serve` with argument 2 `publicDir` not a URL ending with `/`.",
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

Deno.test(
  "`publicFileResponse` with argument 3 `customizeResponseInit` not a function.",
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

Deno.test("`publicFileResponse` with a directory.", async () => {
  await assertRejects(
    () =>
      publicFileResponse(
        new Request("http://localhost/directory"),
        new URL("./test/fixtures/publicFileResponse/public/", import.meta.url),
      ),
    Deno.errors.NotFound,
    "",
  );
});

Deno.test("`publicFileResponse` with a missing file.", async () => {
  await assertRejects(
    () =>
      publicFileResponse(
        new Request("http://localhost/B.css"),
        new URL("./test/fixtures/publicFileResponse/public/", import.meta.url),
      ),
    Deno.errors.NotFound,
    "",
  );
});

Deno.test("`publicFileResponse` with an extensionless file.", async () => {
  const publicDir = new URL(
    "./test/fixtures/publicFileResponse/public/",
    import.meta.url,
  );
  const response = await publicFileResponse(
    new Request("http://localhost/A"),
    publicDir,
  );

  assert(response.headers instanceof Headers);
  assertEquals(Array.from(response.headers.entries()), []);
  assertStrictEquals(
    await response.text(),
    await Deno.readTextFile(new URL("./A", publicDir)),
  );
});

Deno.test("`publicFileResponse` with an unknown file extension.", async () => {
  const publicDir = new URL(
    "./test/fixtures/publicFileResponse/public/",
    import.meta.url,
  );
  const response = await publicFileResponse(
    new Request("http://localhost/A.abcdefg"),
    publicDir,
  );

  assert(response.headers instanceof Headers);
  assertEquals(Array.from(response.headers.entries()), []);
  assertStrictEquals(
    await response.text(),
    await Deno.readTextFile(new URL("./A.abcdefg", publicDir)),
  );
});

Deno.test("`publicFileResponse` with a CSS file.", async () => {
  const publicDir = new URL(
    "./test/fixtures/publicFileResponse/public/",
    import.meta.url,
  );
  const response = await publicFileResponse(
    new Request("http://localhost/A.css"),
    publicDir,
  );

  assert(response.headers instanceof Headers);
  assertEquals(Array.from(response.headers.entries()), [
    ["content-type", "text/css; charset=UTF-8"],
  ]);
  assertStrictEquals(
    await response.text(),
    await Deno.readTextFile(new URL("./A.css", publicDir)),
  );
});

Deno.test("`publicFileResponse` with a JavaScript module.", async () => {
  const publicDir = new URL(
    "./test/fixtures/publicFileResponse/public/",
    import.meta.url,
  );
  const response = await publicFileResponse(
    new Request("http://localhost/A.mjs"),
    publicDir,
  );

  assert(response.headers instanceof Headers);
  assertEquals(Array.from(response.headers.entries()), [
    ["content-type", "text/javascript; charset=UTF-8"],
  ]);
  assertStrictEquals(
    await response.text(),
    await Deno.readTextFile(new URL("./A.mjs", publicDir)),
  );
});

Deno.test(
  "`publicFileResponse` with a JavaScript module, customized response, error.",
  async () => {
    const errorA = new Error("A.");

    try {
      await publicFileResponse(
        new Request("http://localhost/A.mjs"),
        new URL("./test/fixtures/publicFileResponse/public/", import.meta.url),
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

Deno.test(
  "`publicFileResponse` with a JavaScript module, customized response, no error.",
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

    assert(response.headers instanceof Headers);
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
