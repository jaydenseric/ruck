![Ruck logo](./ruck-logo.svg)

# Ruck

[Ruck](https://ruck.tech) is an open source buildless
[React](https://reactjs.org) web application framework for
[Deno](https://deno.land). It can be used to create basic sites or powerful
apps.

Work with cutting edge standard technologies such as
[ESM](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules),
[dynamic imports](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules#dynamic_module_loading),
[HTTP imports](https://deno.land/manual/linking_to_external_code), and
[import maps](https://github.com/WICG/import-maps) to avoid build steps like
transpilation or bundling. Deno and browsers directly run the source code. Ruck
is _extremely_ lean with few dependencies. Modules are focused with default
exports that are only deep imported when needed.

Some things that are complicated or impossible with traditional frameworks are
easy with Ruck, for example…

- Matching dynamic routes with RegEx or custom logic. Ideally an invalid slug in
  a route URL results in a error page without loading the route’s components or
  data.
- Components can use the [`TransferContext`](./TransferContext.mjs) React
  context during SSR to read the page HTTP request and modify the response. This
  is surprisingly difficult with [Next.js](https://nextjs.org), see
  [`next-server-context`](https://github.com/jaydenseric/next-server-context).
- Proper React rendering of head tags specified by the
  [`useHead`](./useHead.mjs) React hook. React components with a normal
  lifecycle can be used to render head tags that can be grouped, ordered, and
  prioritized for overrides. Frameworks like [Next.js](https://nextjs.org)
  provide a React component that accepts basic head tags as children that it
  manually iterates and syncs in the document head DOM.
- SSR with component level data fetching. This is quite tricky with frameworks
  like [Next.js](https://nextjs.org) and [Remix](https://remix.run) that support
  data fetching at the route level, see
  [`next-graphql-react`](https://github.com/jaydenseric/next-graphql-react).
- [GraphQL](https://graphql.org) ready to use via React hooks from
  [`graphql-react`](https://github.com/jaydenseric/graphql-react).
- Declarative system for auto loading and unloading component CSS file
  dependencies with absolute or relative URLs.
- Baked-in type safety and IntelliSense via
  [TypeScript JSDoc comments](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html).

## Installation

A Ruck project contains:

- [Import map](https://github.com/WICG/import-maps) JSON files that tell your
  IDE, Deno, and browsers where to import dependencies from. Ruck automatically
  uses [`es-module-shims`](https://github.com/guybedford/es-module-shims) so you
  don’t need to worry about poor
  [browser support for import maps](https://caniuse.com/import-maps).

  Ideally use separate development and production import maps for the server and
  client. This way a version of React that has more detailed error messages can
  be used during local development, and server specific dependencies can be
  excluded from the browser import map for a faster page load.

  Recommended import map file names and starter contents:

  - `importMap.server.dev.json`

    ```json
    {
      "imports": {
        "graphql-react/": "https://unpkg.com/graphql-react@18.0.0/",
        "media_types/": "https://deno.land/x/media_types@v3.0.2/",
        "react": "https://esm.sh/react@17.0.2?dev",
        "react-dom/server": "https://esm.sh/react-dom@17.0.2/server?dev",
        "react-waterfall-render/": "https://unpkg.com/react-waterfall-render@4.0.0/",
        "ruck/": "https://deno.land/x/ruck@v2.0.0/",
        "std/": "https://deno.land/std@0.133.0/"
      }
    }
    ```
  - `importMap.server.json`

    ```json
    {
      "imports": {
        "graphql-react/": "https://unpkg.com/graphql-react@18.0.0/",
        "media_types/": "https://deno.land/x/media_types@v3.0.2/",
        "react": "https://esm.sh/react@17.0.2",
        "react-dom/server": "https://esm.sh/react-dom@17.0.2/server",
        "react-waterfall-render/": "https://unpkg.com/react-waterfall-render@4.0.0/",
        "ruck/": "https://deno.land/x/ruck@v2.0.0/",
        "std/": "https://deno.land/std@0.133.0/"
      }
    }
    ```
  - `importMap.client.dev.json`

    ```json
    {
      "imports": {
        "graphql-react/": "https://unpkg.com/graphql-react@18.0.0/",
        "react": "https://cdn.esm.sh/v76/react@17.0.2/es2021/react.development.js",
        "react-dom": "https://cdn.esm.sh/v76/react-dom@17.0.2/es2021/react-dom.development.js",
        "react-waterfall-render/": "https://unpkg.com/react-waterfall-render@4.0.0/",
        "ruck/": "https://deno.land/x/ruck@v2.0.0/"
      }
    }
    ```
  - `importMap.client.json`

    ```json
    {
      "imports": {
        "graphql-react/": "https://unpkg.com/graphql-react@18.0.0/",
        "react": "https://cdn.esm.sh/v76/react@17.0.2/es2021/react.js",
        "react-dom": "https://cdn.esm.sh/v76/react-dom@17.0.2/es2021/react-dom.js",
        "react-waterfall-render/": "https://unpkg.com/react-waterfall-render@4.0.0/",
        "ruck/": "https://deno.land/x/ruck@v2.0.0/"
      }
    }
    ```

  A DRY approach is to Git ignore the import map files and generate them with a
  script that’s a single source of truth.
- A module that imports and uses Ruck’s [`serve`](./serve.mjs) function to start
  the Ruck app server, typically called `scripts/serve.mjs`. Here’s an example:

  ```js
  // @ts-check

  import serve from "ruck/serve.mjs";

  serve({
    clientImportMap: new URL(
      Deno.env.get("RUCK_DEV") === "true"
        ? "../importMap.client.dev.json"
        : "../importMap.client.json",
      import.meta.url,
    ),
    port: Number(Deno.env.get("RUCK_PORT")),
  });

  console.info(
    `Ruck app HTTP server listening on http://localhost:${
      Deno.env.get("RUCK_PORT")
    }`,
  );
  ```

  The
  [Deno CLI](https://deno.land/manual/getting_started/command_line_interface) is
  used to run this script; Ruck doesn’t have a CLI.

  You may choose to create a `scripts/serve.sh` shell script that serves the
  Ruck app:

  ```sh
  #!/bin/sh
  # Serves the Ruck app.

  # Asserts an environment variable is set.
  # Argument 1: Name.
  # Argument 2: Value.
  assertEnvVar() {
    if [ -z "$2" ]
    then
      echo "Missing environment variable \`$1\`." >&2
      exit 1
    fi
  }

  # Assert environment variables are set.
  assertEnvVar RUCK_DEV $RUCK_DEV
  assertEnvVar RUCK_PORT $RUCK_PORT

  # Serve the Ruck app.
  if [ "$RUCK_DEV" = "true" ]
  then
    deno run \
      --allow-env \
      --allow-net \
      --allow-read \
      --import-map=importMap.server.dev.json \
      --watch=. \
      scripts/serve.mjs
  else
    deno run \
      --allow-env \
      --allow-net \
      --allow-read \
      --import-map=importMap.server.json \
      scripts/serve.mjs
  fi
  ```

  First, ensure it’s executable:

  ```sh
  chmod +x ./scripts/serve.sh
  ```

  Then, run it like this:

  ```sh
  RUCK_DEV="true" RUCK_PORT="3000" ./scripts/serve.sh
  ```

  You may choose to store environment variables in a Git ignored
  `scripts/.env.sh` file:

  ```sh
  export RUCK_DEV="true"
  export RUCK_PORT="3000"
  ```

  Then, you could create a `scripts/dev.sh` shell script (also ensure it’s
  executable):

  ```sh
  #!/bin/sh
  # Loads the environment variables and serves the Ruck app.

  # Load the environment variables.
  . scripts/.env.sh &&

  # Serve the Ruck app.
  ./scripts/serve.sh
  ```

  This way you only need to run this when developing your Ruck app:

  ```sh
  ./scripts/dev.sh
  ```

  There isn’t a universally “correct” way to use environment variables or start
  serving the Ruck app; create an optimal workflow for your particular
  development and production environments.
- A public directory containing files that Ruck serves directly to browsers, by
  default called `public`. For example, `public/favicon.ico` could be accessed
  in a browser at the URL path `/favicon.ico`.
- A `router.mjs` module in the public directory that default exports a function
  that Ruck calls on both the server and client with details such as the route
  URL to determine what the route content should be. It should have this JSDoc
  type:

  ```js
  /** @type {import("ruck/serve.mjs").Router} */
  ```

  Ruck provides an (optional) declarative system for automatic loading and
  unloading of component CSS file dependencies served by Ruck via the public
  directory or CDN. Ruck’s
  [`routePlanForContentWithCss`](./routePlanForContentWithCss.mjs) function can
  be imported and used to create route plan for content with CSS file
  dependencies.

  Here is an example for a website that has a home page, a `/blog` page that
  lists blog posts, and a `/blog/post-id-slug-here` page for individual blog
  posts:

  ```js
  // @ts-check

  import { createElement as h } from "react";
  import routePlanForContentWithCss from "ruck/routePlanForContentWithCss.mjs";

  // The component used to display a route loading error (e.g. due to an
  // internet dropout) should be imported up front instead of dynamically
  // importing it when needed, as it would likely also fail to load.
  import PageError, {
    // A `Set` instance containing CSS URLs.
    css as cssPageError,
  } from "./components/PageError.mjs";

  /**
   * Gets the Ruck app route plan for a URL.
   * @type {import("ruck/serve.mjs").Router}
   */
  export default function router(url, headManager, isInitialRoute) {
    if (url.pathname === "/") {
      return routePlanForContentWithCss(
        // Dynamically import route components so they only load when needed.
        import("./components/PageHome.mjs").then(
          ({ default: PageHome, css }) => ({
            content: h(PageHome),
            css,
          }),
          // It’s important to handle dynamic import loading errors.
          catchImportContentWithCss,
        ),
        headManager,
        isInitialRoute,
      );
    }

    if (url.pathname === "/blog") {
      return routePlanForContentWithCss(
        import("./components/PageBlog.mjs").then(
          ({ default: PageBlog, css }) => ({
            content: h(PageBlog),
            css,
          }),
          catchImportContentWithCss,
        ),
        headManager,
        isInitialRoute,
      );
    }

    // For routes with URL slugs, use RegEx that only matches valid slugs,
    // instead of simply extracting the whole slug. This way an invalid URL slug
    // naturally results in an immediate 404 error and avoids loading the route
    // component or loading data with the invalid slug.
    const matchPagePost = url.pathname.match(/^\/blog\/(?<postId>[\w-]+)$/u);

    if (matchPagePost?.groups) {
      const { postId } = matchPagePost.groups;

      return routePlanForContentWithCss(
        import("./components/PagePost.mjs").then(
          ({ default: PagePost, css }) => ({
            content: h(PagePost, { postId }),
            css,
          }),
        ),
        headManager,
        isInitialRoute,
      );
    }

    // Fallback to a 404 error page.
    return routePlanForContentWithCss(
      // If you have a component specifically for a 404 error page, it would be
      // ok to dynamically import it here. In this particular example the
      // component was already imported for the loading error page.
      {
        content: h(PageError, {
          status: 404,
          title: "Error 404",
          description: "Something is missing.",
        }),
        css: cssPageError,
      },
      headManager,
      isInitialRoute,
    );
  }

  /**
   * Catches a dynamic import error for route content with CSS.
   * @param {Error} cause Import error.
   * @returns {import("ruck/routePlanForContentWithCss.mjs").RouteContentWithCss}
   */
  function catchImportContentWithCss(cause) {
    console.error(new Error("Import rejection for route with CSS.", { cause }));

    return {
      content: h(PageError, {
        status: 500,
        title: "Error loading",
        description: "Unable to load.",
      }),
      css: cssPageError,
    };
  }
  ```

  For the previous example, here’s the `public/components/PageError.mjs` module:

  ```js
  // @ts-check

  import { createElement as h, useContext } from "react";
  import TransferContext from "ruck/TransferContext.mjs";

  import Heading, { css as cssHeading } from "./Heading.mjs";
  import Para, { css as cssPara } from "./Para.mjs";

  // Export CSS URLs for the component and its dependencies.
  export const css = new Set([
    ...cssHeading,
    ...cssPara,
    "/components/PageError.css",
  ]);

  /**
   * React component for an error page.
   * @param {object} props Props.
   * @param {number} props.status HTTP status code.
   * @param {number} props.title Error title.
   * @param {string} props.description Error description.
   */
  export default function PageError({ status, title, description }) {
    // Ruck’s transfer (request/response) context; only populated on the server.
    const ruckTransfer = useContext(TransferContext);

    // If server side rendering, modify the HTTP status code for the Ruck app
    // page response.
    if (ruckTransfer) ruckTransfer.responseInit.status = status;

    return h(
      "section",
      { className: "PageError__section" },
      h(Heading, null, title),
      h(Para, null, description),
    );
  }
  ```
- A `components/App.mjs` module in the public directory that default exports a
  React component that renders the entire app. It should have this JSDoc type:

  ```js
  /** @type {import("ruck/serve.mjs").AppComponent} */
  ```

  It typically imports and uses several React hooks from Ruck:
  - [`useCss`](./useCss.mjs) to declare CSS files that apply to the entire app.
  - [`useHead`](./useHead.mjs) to establish head tags that apply to the entire
    app such as `meta[name="viewport"]` and `link[rel="manifest"]`.
  - [`useRoute`](./useRoute.mjs) to get the current route URL and content, and
    render it in a persistent layout containing global content such as a header
    and footer.

  Here’s an example `public/components/App.mjs` module for a website with home
  and blog pages:

  ```js
  // @ts-check

  import { createElement as h, Fragment, useMemo } from "react";
  import useCss from "ruck/useCss.mjs";
  import useHead from "ruck/useHead.mjs";
  import useRoute from "ruck/useRoute.mjs";

  import NavLink, { css as cssNavLink } from "./NavLink.mjs";

  const css = new Set([
    ...cssNavLink,
    "/components/App.css",
  ]);

  /**
   * React component for the Ruck app.
   * @type {import("ruck/serve.mjs").AppComponent}
   */
  export default function App() {
    const route = useRoute();

    useHead(
      // Head tag fragments render in the document head in key order. A good
      // convention is to use group and subgroup numbers, followed by a
      // descriptive name.
      "1-1-meta",
      // Must be memoized. If it’s dynamic use the `useMemo` React hook,
      // otherwise define it outside the component function scope.
      useMemo(() =>
        h(
          Fragment,
          null,
          h("meta", {
            name: "viewport",
            content: "width=device-width, initial-scale=1",
          }),
          h("meta", {
            name: "og:image",
            content:
              // Sometimes an absolute URL is necessary.
              `${route.url.origin}/social-preview.png`,
          }),
          h("link", { rel: "manifest", href: "/manifest.webmanifest" }),
          // More head tags here…
        ), [route.url.origin]),
    );

    // This loop doesn’t break React hook rules as the list never changes.
    for (const href of css) useCss(href);

    return h(
      Fragment,
      null,
      // Global nav…
      h(
        "nav",
        { className: "App__nav" },
        h(NavLink, { href: "/" }, "Home"),
        h(NavLink, { href: "/blog" }, "Blog"),
      ),
      // Route content…
      route.content,
      // Global footer…
      h("footer", { className: "App__footer" }, "Global footer content."),
    );
  }
  ```

  Ruck app route navigation links make use of these React hooks from Ruck:

  - [`useRoute`](./useRoute.mjs) to get the current route URL path for
    comparison with the link’s URL path to determine active state.
  - [`useOnClickRouteLink`](./useOnClickRouteLink.mjs) to replace the default
    browser navigation that happens when a link is clicked with a Ruck client
    side route navigation.

  For the previous example, here’s the `public/components/NavLink.mjs` module:

  ```js
  // @ts-check

  import { createElement as h } from "react";
  import useOnClickRouteLink from "ruck/useOnClickRouteLink.mjs";
  import useRoute from "ruck/useRoute.mjs";

  export const css = new Set([
    "/components/NavLink.css",
  ]);

  /**
   * React component for a navigation link.
   * @param {object} props Props.
   * @param {string} props.href Link URL.
   * @param {import("react").ReactNode} [props.children] Children.
   */
  export default function NavLink({ href, children }) {
    const route = useRoute();
    const onClick = useOnClickRouteLink();

    let className = "NavLink__a";
    if (href === route.url.pathname) className += " NavLink__a--active";

    return h("a", { className, href, onClick }, children);
  }
  ```

## Examples

- [Ruck website repo](https://github.com/jaydenseric/ruck-website).

## Requirements

- [Deno CLI](https://deno.land/#installation) v1.20.1+.

## Contributing

### Scripts

These CLI scripts are used for development and
[GitHub Actions CI](./.github/workflows/ci.yml) checks.

#### Install

To install development dependencies (primarily [Puppeteer](https://pptr.dev)):

```sh
./scripts/install.sh
```

#### Test

Beforehand, run the install script. To run the tests:

```sh
./scripts/test.sh
```

#### Serve

To serve the Ruck project files for testing in other local projects (argument 1
is the localhost port for the HTTP server to listen on):

```sh
./scripts/serve.sh 3001
```

#### Format

To format the project:

```sh
deno fmt
```

#### Lint

To lint the project:

```sh
deno lint
```
