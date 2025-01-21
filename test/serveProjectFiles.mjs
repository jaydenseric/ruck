// @ts-check

import { STATUS_CODE, STATUS_TEXT } from "@std/http/status";

import publicFileResponse from "../publicFileResponse.mjs";

const publicDir = new URL("../", import.meta.url);

/**
 * Serves the files of this project on a free port so the modules can be
 * imported and tested in a headless browser environment.
 * @param {AbortSignal} [signal] Abort signal to close the file server.
 * @returns The Deno HTTP server.
 */
export default function serveProjectFiles(signal) {
  if (signal !== undefined && !(signal instanceof AbortSignal)) {
    throw new TypeError(
      "Argument 1 `signal` must be an `AbortSignal` instance.",
    );
  }

  return Deno.serve(
    {
      port: 0,
      signal,
    },
    async (request) => {
      try {
        return await publicFileResponse(
          request,
          publicDir,
          customizeResponseInit,
        );
      } catch (error) {
        const headers = new Headers();
        return new Response(
          null,
          await customizeResponseInit(
            request,
            error instanceof Deno.errors.NotFound
              ? {
                status: STATUS_CODE.NotFound,
                statusText: STATUS_TEXT[STATUS_CODE.NotFound],
                headers,
              }
              : {
                status: STATUS_CODE.InternalServerError,
                statusText: STATUS_TEXT[STATUS_CODE.InternalServerError],
                headers,
              },
          ),
        );
      }
    },
  );
}

/** @type {NonNullable<Parameters<publicFileResponse>[2]>} */
function customizeResponseInit(_request, responseInit) {
  responseInit.headers.set("access-control-allow-origin", "*");
  return responseInit;
}
