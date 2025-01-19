// @ts-check

import { STATUS_CODE, STATUS_TEXT } from "@std/http/status";
import { getFreePort } from "free_port/mod.ts";

import publicFileResponse from "../publicFileResponse.mjs";

const publicDir = new URL("../", import.meta.url);

/**
 * Serves the files of this project on a free port so the modules can be
 * imported and tested in a headless browser environment.
 * @param {AbortSignal} [signal] Abort signal to close the file server.
 * @returns {Promise<{ port: number, close: Promise<void> }>} Port the file
 *   server is listening on, and a promise that resolves once the server closes.
 */
export default async function serveProjectFiles(signal) {
  if (signal !== undefined && !(signal instanceof AbortSignal)) {
    throw new TypeError(
      "Argument 1 `signal` must be an `AbortSignal` instance.",
    );
  }

  const port = await getFreePort(3000);
  const server = Deno.serve(
    { port, signal },
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

  return {
    port,
    close: server.finished,
  };
}

/** @type {NonNullable<Parameters<publicFileResponse>[2]>} */
function customizeResponseInit(_request, responseInit) {
  responseInit.headers.set("access-control-allow-origin", "*");
  return responseInit;
}
