import { json } from "@remix-run/node";
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
    Params<"repo" | "org">,
    { repository: NonNullable<RepoIndexQueryQuery["repository"]> }
  >`
    query RepoIndexQuery($name: String!, $owner: String!) {
      repository(name: $name, owner: $owner) {
        stargazerCount
      }
    }
  `({
    variables: ({ params }) => ({
      name: params.repo!,
      owner: params.org!,
    }),
    filter: ({ repository }) => {
      if (!repository) {
        throw json("Repo not found", 404);
      }

      return { repository };
    },
  }),
};
