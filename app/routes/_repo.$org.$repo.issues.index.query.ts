import { json } from "@remix-run/node";
import type { Params } from "@remix-run/react";

import { graphql } from "~/graphql";
import type {
  RepoIssuesQueryQuery,
  RepoIssuesQueryQueryVariables,
} from "~/graphql/types";

type NonNullableIssue = NonNullable<
  NonNullable<
    NonNullable<
      NonNullable<
        NonNullable<RepoIssuesQueryQuery["repository"]>["issues"]["edges"]
      >[number]
    >["node"]
  >
>;

export const entryPoint = {
  query: graphql<
    RepoIssuesQueryQuery,
    RepoIssuesQueryQueryVariables,
    Params<"repo" | "org">,
    {
      issues: NonNullableIssue[];
    }
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
  `({
    variables: ({ params }) => ({
      name: params.repo!,
      owner: params.org!,
    }),
    filter: ({ repository }) => {
      if (!repository) {
        throw json("Issue not found", 404);
      }

      let issues =
        (repository.issues.edges
          ?.map((edge) => edge?.node)
          .filter(Boolean) as NonNullableIssue[]) || [];

      return {
        issues,
      };
    },
  }),
};
