import type { Params } from "@remix-run/react";
import { graphql } from "~/graphql";
import type {
  RepoLayoutQueryQuery,
  RepoLayoutQueryQueryVariables,
} from "~/graphql/types";

export const entryPoint = {
  query: graphql<
    RepoLayoutQueryQuery,
    RepoLayoutQueryQueryVariables,
    Params<"repo" | "org">
  >`
    query RepoLayoutQuery($name: String!, $owner: String!) {
      repository(name: $name, owner: $owner) {
        name
        owner {
          avatarUrl
          login
        }
      }
    }
  `(({ params }) => ({
    name: params.repo!,
    owner: params.org!,
  })),
};
