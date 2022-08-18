import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { defer, json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import type { Params } from "@remix-run/react";
import type { UseDataFunctionReturn } from "@remix-run/react/dist/components";

export interface EntryPoint<
  Query extends EntryPointQuery<any, any, any>,
  DeferredQueries extends Record<string, EntryPointQuery<any, any, any>>,
  Mutations extends Record<string, EntryPointQuery<any, any, any>>
> {
  query: Query;
  deferredQueries?: DeferredQueries;
  mutations?: DeferredQueries;
}

export type QueryArgs<TParams extends Params> = {
  params: TParams;
  searchParams: URLSearchParams;
  formData: URLSearchParams;
};

export interface EntryPointQuery<TData, TVariables, TParams extends Params> {
  query: string;
  variables?: (args: QueryArgs<TParams>) => TVariables;
  " $data": TData;
}

export const graphql =
  <TQuery, TVariables, TParams extends Params = Params>(
    templates: TemplateStringsArray
  ) =>
  (
    variables?: (args: QueryArgs<TParams>) => TVariables
  ): EntryPointQuery<TQuery, TVariables, TParams> => {
    return {
      query: templates[0] as string,
      variables,
    } as EntryPointQuery<TQuery, TVariables, TParams>;
  };

type Critical<TEntryPoint> = TEntryPoint extends EntryPoint<
  infer Data,
  any,
  any
>
  ? UseDataFunctionReturn<Data[" $data"]>
  : never;

type Deferred<TEntryPoint> = TEntryPoint extends EntryPoint<
  any,
  infer Deferred,
  any
>
  ? {
      [K in keyof Deferred]: Deferred[K] extends EntryPointQuery<
        infer Data,
        any,
        any
      >
        ? Promise<UseDataFunctionReturn<Data>>
        : never;
    }
  : never;

export function useEntryPoint<
  TEntryPoint extends EntryPoint<
    any,
    Record<string, EntryPointQuery<any, any, any>>,
    any
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

export async function runEntryPoint<
  TEntryPoint extends EntryPoint<any, any, any>
>(args: ActionArgs | LoaderArgs, entryPoint: TEntryPoint, action?: true) {
  const url = new URL(args.request.url);
  const searchParams = url.searchParams;

  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  headers.set("Authorization", `bearer ${process.env.GITHUB_PAT}`);

  if (!action) {
    let criticalPromise: Promise<Critical<TEntryPoint>> | undefined;
    if (entryPoint.query) {
      criticalPromise = runQuery(
        entryPoint.query.query,
        entryPoint.query.variables?.({
          params: args.params,
          searchParams,
          formData: new URLSearchParams(),
        }),
        headers
      );
    }

    let deferredPromises: Record<string, Promise<unknown>> = {};
    if (entryPoint.deferredQueries) {
      for (let [name, query] of Object.entries(entryPoint.deferredQueries) as [
        string,
        EntryPointQuery<any, any, any>
      ][]) {
        deferredPromises["__" + name] = runQuery(
          query.query,
          query.variables?.({
            params: args.params,
            searchParams,
            formData: new URLSearchParams(),
          }),
          headers
        );
      }
    }

    return defer({
      ...deferredPromises,
      criticalData: await criticalPromise,
    });
  } else {
    // I'm using this here to avoid processing file uploads. I.e, assume
    // urlencoded body instead of multipart form data.
    const formData = new URLSearchParams(await args.request.text());
    const mutation = formData.get("_mutation");
    const redirectTo = formData.get("_redirect");
    const query = mutation ? entryPoint.mutations?.[mutation] : undefined;

    if (!query) {
      throw new Error("No mutation found");
    }

    const result = await runQuery(
      query.query,
      query.variables?.({
        params: args.params,
        searchParams,
        formData,
      }),
      headers
    );

    // TODO: Validate redirect
    if (redirectTo) {
      return redirect(redirectTo);
    }

    return json(result);
  }
}
