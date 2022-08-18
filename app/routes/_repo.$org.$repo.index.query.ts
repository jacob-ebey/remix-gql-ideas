import type { Params } from "@remix-run/react";
import { graphql } from "~/graphql";
import type {
  RepoIndexQueryQuery,
  RepoIndexQueryQueryVariables,
} from "~/graphql/types";

export const entryPoint = {
  query: graphql<
    RepoIndexQueryQuery,
    RepoIndexQueryQueryVariables,
    Params<"repo" | "org">
  >`
    query RepoIndexQuery($name: String!, $owner: String!) {
      repository(name: $name, owner: $owner) {
        stargazerCount
      }
    }
  `(({ params }) => ({
    name: params.repo!,
    owner: params.org!,
  })),
};
