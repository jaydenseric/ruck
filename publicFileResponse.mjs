// @ts-check

import { contentType, lookup } from "media_types/mod.ts";
import { Status, STATUS_TEXT } from "std/http/http_status.ts";
import { readableStreamFromReader } from "std/streams/conversion.ts";

/**
 * Creates a response for a public file request.
 * @param {Request} request Request.
 * @param {URL} publicDir Public directory file URL.
 * @param {(
 *   request: Request,
 *   responseInit: import("./serve.mjs").ResponseInit
 * ) => import("./serve.mjs").ResponseInit
 *   | Promise<import("./serve.mjs").ResponseInit
 * >} [customizeResponseInit] Customizes the response init.
 * @returns {Promise<Response>} Response that streams the public file.
 */
export default async function publicFileResponse(
  request,
  publicDir,
  customizeResponseInit,
) {
  if (!(request instanceof Request)) {
    throw new TypeError("Argument 1 `request` must be a `Request` instance.");
  }

  if (!(publicDir instanceof URL)) {
    throw new TypeError("Argument 2 `publicDir` must be a `URL` instance.");
  }

  if (!publicDir.href.endsWith("/")) {
    throw new TypeError(
      "Argument 2 `publicDir` must be a URL ending with `/`.",
    );
  }

  if (
    customizeResponseInit !== undefined &&
    typeof customizeResponseInit !== "function"
  ) {
    throw new TypeError(
      "Argument 3 `customizeResponseInit` must be a function.",
    );
  }

  const requestUrl = new URL(request.url);
  const fileUrl = new URL("." + requestUrl.pathname, publicDir);
  const file = await Deno.open(fileUrl);
  const body = readableStreamFromReader(file);

  /** @type {import("./serve.mjs").ResponseInit} */
  let responseInit = {
    status: Status.OK,
    statusText: STATUS_TEXT.get(Status.OK),
    headers: new Headers(),
  };

  const mimeType = lookup(requestUrl.pathname);

  if (mimeType) {
    const contentTypeHeader = contentType(mimeType);

    if (contentTypeHeader) {
      responseInit.headers.set("content-type", contentTypeHeader);
    }
  }

  if (typeof customizeResponseInit === "function") {
    responseInit = await customizeResponseInit(request, responseInit);
  }

  return new Response(body, responseInit);
}
