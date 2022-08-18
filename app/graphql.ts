import type { LoaderArgs } from "@remix-run/node";
import { defer, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import type { Params } from "@remix-run/react";

export interface EntryPoint<
  Query extends EntryPointQuery<unknown, unknown>,
  DeferredQueries extends Record<string, EntryPointQuery<unknown, unknown>>
> {
  query: Query;
  deferredQueries?: DeferredQueries;
}

export type QueryArgs = {
  params: Params;
  searchParams: URLSearchParams;
};

export interface EntryPointQuery<TData, TVariables> {
  query: string;
  variables?: (args: QueryArgs) => TVariables;
  " $data": TData;
}

export const graphql =
  <TQuery, TVariables>(templates: TemplateStringsArray) =>
  (
    variables?: (args: QueryArgs) => TVariables
  ): EntryPointQuery<TQuery, TVariables> => {
    return {
      query: templates[0] as string,
      variables,
    } as EntryPointQuery<TQuery, TVariables>;
  };

type Critical<TEntryPoint> = TEntryPoint extends EntryPoint<infer Data, any>
  ? NonNullable<Data[" $data"]>
  : never;

type Deferred<TEntryPoint> = TEntryPoint extends EntryPoint<any, infer Deferred>
  ? {
      [K in keyof Deferred]: Deferred[K] extends EntryPointQuery<
        infer Data,
        any
      >
        ? Promise<Data>
        : never;
    }
  : never;

export function useEntryPoint<
  TEntryPoint extends EntryPoint<
    any,
    Record<string, EntryPointQuery<unknown, unknown>>
  >
>(): {
  data: Critical<TEntryPoint>;
  deferredData: Deferred<TEntryPoint>;
} {
  let { criticalData, ...rest } = useLoaderData();

  return {
    data: criticalData,
    deferredData: Object.entries(rest).reduce((acc, [key, value]) => {
      const promise = value as Promise<unknown>;
      if (key.startsWith("__") && typeof promise?.then === "function") {
        acc[key.slice(2)] = promise;
      }
      return acc;
    }, {} as Record<string, Promise<unknown>>) as any,
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

export async function runEntryPoint<TEntryPoint extends EntryPoint<any, any>>(
  args: LoaderArgs,
  entryPoint: TEntryPoint
) {
  const searchParams = new URL(args.request.url).searchParams;

  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  headers.set("Authorization", `bearer ${process.env.GITHUB_PAT}`);

  let criticalPromise: Promise<Critical<TEntryPoint>> | undefined;
  if (entryPoint.query) {
    criticalPromise = runQuery(
      entryPoint.query.query,
      entryPoint.query.variables?.({
        params: args.params,
        searchParams,
      }),
      headers
    );
  }

  let deferredPromises: Record<string, Promise<unknown>> = {};
  if (entryPoint.deferredQueries) {
    for (let [name, query] of Object.entries(entryPoint.deferredQueries) as [
      string,
      EntryPointQuery<any, any>
    ][]) {
      deferredPromises["__" + name] = runQuery(
        query.query,
        query.variables?.({
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
