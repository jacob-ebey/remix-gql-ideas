import { useLoaderData } from "@remix-run/react";

export interface EntryPoint {
  query?: Query<unknown, unknown>;
  deferredQueries?: Record<string, Query<unknown, unknown>>;
}

export type QueryArgs = {
  params: Record<string, string>;
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

// export function useQuery<T extends Query<unknown, unknown>>(
//   thing: T
// ): Required<T>[" $query"] {
//   return {} as any;
// }
