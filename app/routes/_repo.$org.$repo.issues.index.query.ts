import type { Params } from "@remix-run/react";
import { graphql } from "~/graphql";
import type {
  RepoIssuesQueryQuery,
  RepoIssuesQueryQueryVariables,
} from "~/graphql/types";

export const entryPoint = {
  query: graphql<
    RepoIssuesQueryQuery,
    RepoIssuesQueryQueryVariables,
    Params<"repo" | "org">
  >`
    query RepoIssuesQuery($name: String!, $owner: String!) {
      repository(name: $name, owner: $owner) {
        issues(first: 10, orderBy: { field: CREATED_AT, direction: DESC }) {
          edges {
            node {
              id
              number
              title
              author {
                avatarUrl
                login
              }
            }
          }
        }
      }
    }
  `(({ params }) => ({
    name: params.repo!,
    owner: params.org!,
  })),
};
