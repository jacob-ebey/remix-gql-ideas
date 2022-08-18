const { defer, json } = require("@remix-run/node");
const build = require("./build");

for (let [key, value] of Object.entries(build)) {
  module.exports[key] = value;
}

async function runQuery(query, variables, headers) {
  if (query.match(/IndexDeferredFollowers/)) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  let response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    body: JSON.stringify({
      query,
      variables,
    }),
    headers,
  });

  if (!response.ok) {
    console.log(await response.text());
    // TODO: Log failure
    throw new Error("GraphQL request failed");
  }

  let body = await response.json();

  if (body.errors) {
    throw json(body.errors, 500);
  }

  return body.data;
}

module.exports.routes = Object.entries(build.routes).reduce(
  (routes, [key, value]) => {
    console.log(value);
    routes[key] = value;

    console.log(value);
    if (value.module.GraphQL) {
      /** @type {import("./app/graphql").EntryPoint} */
      const { query, deferredQueries } = value.module.GraphQL;

      routes[key] = {
        ...value,
        module: {
          ...value.module,
          /**
           * @type {(args: import("@remix-run/node").LoaderArgs) => any}
           */
          loader: async (args) => {
            const searchParams = new URL(args.request.url).searchParams;

            const headers = new Headers();
            headers.set("Content-Type", "application/json");
            headers.set("Authorization", `bearer ${process.env.GITHUB_PAT}`);

            let criticalPromise;
            if (query) {
              criticalPromise = runQuery(
                query.query,
                query.variables({
                  params: args.params,
                  searchParams,
                }),
                headers
              );
            }

            let deferredPromises = {};
            if (deferredQueries) {
              for (let [name, query] of Object.entries(deferredQueries)) {
                deferredPromises["__" + name] = runQuery(
                  query.query,
                  query.variables({
                    params: args.params,
                    searchParams,
                  }),
                  headers
                );
              }
            }

            return defer({
              ...deferredPromises,
              criticalData: await criticalPromise,
            });
          },
        },
      };
    }
    return routes;
  },
  {}
);
