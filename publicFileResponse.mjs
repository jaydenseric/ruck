// @ts-check

import { STATUS_CODE, STATUS_TEXT } from "@std/http/status";
import { contentType } from "@std/media-types/content-type";
import { extname } from "@std/path/extname";

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

  try {
    const { isFile } = await file.stat();

    if (!isFile) throw new Deno.errors.NotFound();

    /** @type {import("./serve.mjs").ResponseInit} */
    let responseInit = {
      status: STATUS_CODE.OK,
      statusText: STATUS_TEXT[STATUS_CODE.OK],
      headers: new Headers(),
    };

    const fileExtension = extname(fileUrl.pathname);

    if (fileExtension) {
      const contentTypeHeader = contentType(fileExtension);

      if (contentTypeHeader) {
        responseInit.headers.set("content-type", contentTypeHeader);
      }
    }

    if (typeof customizeResponseInit === "function") {
      responseInit = await customizeResponseInit(request, responseInit);
    }

    return new Response(file.readable, responseInit);
  } catch (error) {
    // Avoid closing an already closed file, see:
    // https://github.com/denoland/deno/issues/14210
    if (file.rid in Deno.resources()) Deno.close(file.rid);

    throw error;
  }
}
