# Ruck changelog

## Next

### Major

- Updated the required Deno version to v2+.
- Updated the Deno standard library dependencies.
  - They are now [https://jsr.io/@std](https://jsr.io/@std) packages, instead of
    the package [https://deno.land/std@0.154.0](https://deno.land/std@0.154.0).
  - Ruck now serves JavaScript files with the content type `text/javascript`
    instead of `application/javascript`.
- Migrated the HTTP server from the deprecated Deno standard library function to
  `Deno.serve`.
- Migrated from the deprecated Deno standard library function
  `readableStreamFromReader` to the new Deno API `Deno.FsFile.readable`.
- Migrated from the deprecated Deno APIs `Deno.FsFile.rid`, `Deno.resources`,
  and `Deno.close` to manually calling the modern `Deno.FsFile` method
  `Symbol.dispose`.
- Ruck app pages no longer include an
  [ES Module Shims](https://github.com/guybedford/es-module-shims) script in the
  server side rendered HTML, as now all modern browsers support import maps.
  - Removed the function `serve` option `esModuleShimsSrc`.
  - Removed the React component `Html` prop `esModuleShimsScript`.
- Use the TypeScript JSDoc tag `@import` to import types in modules and readme
  example code.

### Patch

- Updated the GitHub Actions CI config:
  - No longer run the workflow on pull request.
  - Enable manual workflow dispatching.
  - Run checks in separate jobs.
  - For the test job on Linux, disable the modern security feature “AppArmor” so
    the Chromium developer build installed by Astral can be used (see
    [crbug.com/373753919](https://crbug.com/373753919)).
  - Removed custom step names.
  - Use Deno v2.
  - Updated actions/checkout to v4.
  - Updated actions/setup-deno to v2.
- Updated the project and readme import maps for the latest React v18.3.1 URLs.
- Configured Deno to not auto-generate a lockfile.
- Fixed formatting issues caused by updating Deno.
- Added in project and readme scripts the CLI `deno` flag `--allow-import`, as
  required by Deno v2.
- Modernized the project find min compatible Deno version script.
- Modernized the project type check script.
- Modernized the test helper function `serveProjectFiles`.
- Implemented Deno test steps now that
  [denoland/deno#15425](https://github.com/denoland/deno/issues/15425) is no
  longer an issue.
- Added a project `.zed/settings.json` file to make is easier to contribute
  using the Zed editor.
- Migrated from
  [`deno-puppeteer`](https://github.com/lucacasonato/deno-puppeteer) to
  [`@astral/astral`](https://github.com/lino-levan/astral) in tests.

## 8.0.1

### Patch

- Fixed a bug in the function `createPseudoNode` where click events could
  sometimes cause React rendering errors in the head app.

## 8.0.0

### Major

- Updated dependencies.
- React v18 is now supported; dropping support for earlier versions.
  - Project client import maps must now have a `react-dom/client` entry, instead
    of `react-dom`.
  - Ruck now uses in `hydrate.mjs` the new function `hydrateRoot` from
    `react-dom/client` instead of the old function `hydrate` from `react-dom`.

### Patch

- Updated dependencies.
- Different approach to [esm.sh](https://esm.sh) dependency URLs:
  - Remove the `cdn` subdomain that was deprecated in [esm.sh](https://esm.sh)
    [v79](https://github.com/ije/esm.sh/releases/tag/v79).
  - Use `?target=deno` in server import maps.
- Updated the readme:
  - Added heading links to the intro.
  - Added a “Features” heading.
  - Mention
    [optimal JavaScript module design](https://jaydenseric.com/blog/optimal-javascript-module-design).
  - Document how client import map [esm.sh](https://esm.sh) URLs are updated.
- No longer using the Deno `--unstable` flag for the install and test scripts.
- Made it easier to run the script for finding the minimum compatible Deno
  version by making it executable and adding a shebang.
- Added a new script to type check every JavaScript module in the project, and
  configured GitHub Actions CI to use it.
- Updated Puppeteer for tests and modernized related test helper code.
- Improved console logging of Puppeteer browser console output in tests.
- Refactored function `createPseudoNode` tests to better isolate each test.
- Refactored function `hydrate` tests to better isolate each test and avoid
  Puppeteer browser errors relating to modifying HTML and import maps.
- Changed some test assertions to be less noisy if they fail.
- Updated GitHub Actions CI config.

## 7.0.0

### Major

- Updated dependencies.

### Patch

- Fixed SSR cache data not being HTML escaped within the HTML inline script for
  client side hydration.
- In the readme “Installation” section, recommend using the Deno `run` command
  `--no-check` flag when serving the Ruck app in production.

## 6.0.0

### Major

- Updated the required Deno version to v1.21.2+.
- Updated dependencies.

### Patch

- Replaced the [`media_types`](https://deno.land/x/media_types) dependency with
  new Deno `std` APIs, fixing
  [#5](https://github.com/jaydenseric/ruck/issues/5).
- Fixed the test script not exiting with an error status when tests fail.
- Fixed the React hook `useOnClickRouteLink` tests failing in Linux environments
  due to the different macOS Chrome browser behavior when a “meta” key is
  pressed while clicking a link.
- Added a script for finding Ruck’s minimum compatible Deno version.
- Use a more specific Deno version for the setup Deno step in the GitHub Actions
  CI config.

## 5.0.0

### Major

- Removed TypeScript triple slash reference comments from Ruck modules that were
  originally intended to enable DOM types. Ruck projects now must have a Deno
  config file (`deno.json` or `deno.jsonc`), containing:

  ```json
  {
    "compilerOptions": {
      "lib": [
        "dom",
        "dom.iterable",
        "dom.asynciterable",
        "deno.ns",
        "deno.unstable"
      ]
    }
  }
  ```

### Patch

- Updated dependencies.
- Updated GitHub Actions CI config:
  - Updated `actions/checkout` to v3.
- Implemented a `deno.json` Deno config file.

## 4.0.0

### Major

- The `navigate` function powering Ruck app route navigation on the client
  that’s populated in the React context `NavigateContext` by the React component
  `ClientProvider` now converts a relative URL used for option `url` to an
  absolute URL using `document.baseURI` as the base instead of
  `location.origin`. This is consistent with how a native `a` element with a
  `href` attribute relative to a document `base` element navigates.

### Minor

- The function `serve` option `clientImportMap` now also accepts an import map
  object.

### Patch

- Updated dependencies.
- Use development versions of React related dependencies in the development
  import map.
- Function `documentHasStyleSheet` fixes and improvements:
  - A relative URL used for argument 1 `href` now converts to an absolute URL
    using `document.baseURI` as the base instead of `location.origin`.
  - Added runtime argument type checks.
  - Added tests.
- React hook `useOnClickRouteLink` fixes and improvements:
  - Now the click event handler doesn’t do anything if the event default action
    is already prevented, if a non main mouse button was pressed, or if any of
    the following keys were pressed during the click:
    - Alt (in Safari, downloads the link)
    - Control (in Safari, displays the link context menu)
    - Meta (in Safari, opens the link in a new tab)
    - Shift (in Safari, adds the link to Reading List)
  - Added tests.
- Added tests for the React component `Effect`.
- Added tests for the function `hydrate`.
- Moved code into `try` blocks in tests.
- Tidied order of imports in tests.
- Tweaked whitespace in `scripts/test.sh`.
- Added to the readme “Examples” section.

## 3.0.0

### Major

- Updated the required Deno version to v1.20.1+.
- Removed a `@ts-ignore` comment within tests that’s redundant for TypeScript
  v4.6+.

### Patch

- Updated dependencies.
- Updated `publicFileResponse.mjs`:
  - Prevent directories within a Ruck project public directory from being served
    as if they are files.
  - Close the open file if there’s an error when preparing a public file
    response.

## 2.0.0

### Major

- Route related function/module names and types have been improved to clarify in
  which situations route content may be a promise. When a route is being
  prepared and may have a promise for content it’s called a “route plan”, and
  when the resolved content renders it’s just called a “route”. The word “plan”
  was chosen because sometimes navigation to a route doesn’t go according to
  plan; the content promise (typically from a dynamic import) could reject or
  the navigation could be aborted before the content promise resolves and is
  ready to render.
  - Renamed the function/module `routeDetailsForContentWithCss.mjs` to
    `routePlanForContentWithCss.mjs`.
  - The `Router` type (from `serve.mjs`) intended for the default export of a
    project `public/router.mjs` module now returns a new `RoutePlan` type (also
    from `serve.mjs`) instead of `RouteDetails`, which has been removed.
  - The `Route` type (from `serve.mjs`) for the `RouteContext` React context
    value that the `useRoute` React hook returns no longer suggests the
    `content` property could be a promise. This type was previously used for
    both when a route was planned and rendering, and while it’s ok to plan a
    route without using a promise for the content, it created the false
    impression that the content for a rendered route might be a promise.
  - Reworded several error messages within `serve.mjs`.

### Patch

- Updated dependencies.
- Fixed a readme code example comment typo.
- Improved the readme code example for a Ruck app component.

## 1.1.0

### Minor

- The Ruck app server request handler created by the `serve` function from
  `serve.mjs` now reads the request headers `x-forwarded-proto` and
  `x-forwarded-host` when determining the route URL, which should be what the
  client originally used to start the request. Reverse proxy servers (load
  balancers, CDNs, etc.) may forward client requests to the Ruck app server
  using a different protocol or host. E.g. [Fly.io](https://fly.io) forwards
  `https:` requests to the deployed server using `http:`.

### Patch

- Fixed relative URLs to project files in the readme.
- Corrected an example shell script in the readme.
- Tweaked example code in the readme.
- Removed a redundant image from the `.github` directory.

## 1.0.0

Initial release.
