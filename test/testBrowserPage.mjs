// @ts-check

/** @import { Page } from "@astral/astral" */

import { Browser } from "@astral/astral";
import { ensureDir } from "@std/fs/ensure-dir";
import { fromFileUrl } from "@std/path/from-file-url";

const projectDirUrl = new URL("../", import.meta.url);
const coverageDirUrl = new URL("coverage/", projectDirUrl);

/**
 * Creates a new Astral browser page for testing served project files with
 * script coverage enabled.
 * @param {Browser} browser Astral browser.
 * @param {URL} projectFilesOriginUrl Project files origin URL.
 * @returns {Promise<AsyncDisposable & { page: Page }>} Async disposable handle
 *   and the Astral browser page, ready for testing.
 */
export default async function testBrowserPage(
  browser,
  projectFilesOriginUrl,
) {
  if (!(browser instanceof Browser)) {
    throw new TypeError(
      "Argument 1 `browser` must be an Astral `Browser` instance.",
    );
  }

  if (!(projectFilesOriginUrl instanceof URL)) {
    throw new TypeError(
      "Argument 2 `projectFilesOriginUrl` must be a `URL` instance.",
    );
  }

  await using resources = new AsyncDisposableStack();
  const page = resources.use(await browser.newPage());

  page.addEventListener("console", ({ detail }) => {
    console.group("Astral browser page console event:");
    console.dir(detail);
    console.groupEnd();
  });

  const celestial = page.unsafelyGetCelestialBindings();

  await celestial.Profiler.enable();
  await celestial.Profiler.startPreciseCoverage({
    callCount: true,
    detailed: true,
  });

  resources.defer(async () => {
    const { result } = await celestial.Profiler.takePreciseCoverage();
    await celestial.Profiler.stopPreciseCoverage();

    await ensureDir(fromFileUrl(coverageDirUrl));

    /** @type {Array<Promise<void>>} */
    const writes = [];

    for (const scriptCoverage of result) {
      if (scriptCoverage.url.startsWith(projectFilesOriginUrl.href)) {
        writes.push(
          Deno.writeTextFile(
            new URL(`${crypto.randomUUID()}.json`, coverageDirUrl),
            JSON.stringify(
              {
                ...scriptCoverage,
                url: projectDirUrl.href +
                  scriptCoverage.url.slice(projectFilesOriginUrl.href.length),
              },
              null,
              2,
            ),
          ),
        );
      }
    }

    await Promise.all(writes);
  });

  const disposable = resources.move();

  return {
    [Symbol.asyncDispose]: () => disposable.disposeAsync(),
    page,
  };
}
