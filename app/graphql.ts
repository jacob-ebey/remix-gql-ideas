import type { LoaderArgs } from "@remix-run/node";
import { defer, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import type { Params } from "@remix-run/react";

export interface EntryPoint {
  query?: Query<unknown, unknown>;
  deferredQueries?: Record<string, Query<unknown, unknown>>;
}

export type QueryArgs = {
  params: Params;
  searchParams: URLSearchParams;
};

export interface Query<TQuery, TVariables> {
  query: string;
  variables: (args: QueryArgs) => TVariables;
  " $query"?: TQuery;
}

export const graphql =
  <TQuery, TVariables>(templates: TemplateStringsArray) =>
  (variables: (args: QueryArgs) => TVariables): Query<TQuery, TVariables> => {
    return {
      query: templates[0] as string,
      variables,
    };
  };

// TODO: Type this bad boy out
export function useQuery<TEntryPoint extends EntryPoint>(
  entryPoint: TEntryPoint
): {
  data: Required<Required<TEntryPoint>["query"]>[" $query"];
  deferredData: {
    [key in keyof TEntryPoint["deferredQueries"]]: Promise<
      Required<Required<TEntryPoint>["deferredQueries"]>[" $query"]
    >;
  };
} {
  let { criticalData, ...rest } = useLoaderData();

  return {
    data: criticalData,
    deferredData: Object.entries(rest as Record<string, any>).reduce(
      (acc, [key, value]) => {
        if (key.startsWith("__") && typeof value?.then === "function") {
          acc[key.slice(2)] = value;
        }
        return acc;
      },
      {} as Record<string, Promise<unknown>>
    ),
  };
}

async function runQuery(query: string, variables: unknown, headers: Headers) {
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

export async function runEntryPoint(args: LoaderArgs, entryPoint: EntryPoint) {
  const searchParams = new URL(args.request.url).searchParams;

  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  headers.set("Authorization", `bearer ${process.env.GITHUB_PAT}`);

  let criticalPromise;
  if (entryPoint.query) {
    criticalPromise = runQuery(
      entryPoint.query.query,
      entryPoint.query.variables({
        params: args.params,
        searchParams,
      }),
      headers
    );
  }

  let deferredPromises: Record<string, Promise<unknown>> = {};
  if (entryPoint.deferredQueries) {
    for (let [name, query] of Object.entries(entryPoint.deferredQueries)) {
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
}
