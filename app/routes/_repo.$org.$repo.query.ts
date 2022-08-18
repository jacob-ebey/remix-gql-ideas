import { json } from "@remix-run/node";
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
    Params<"repo" | "org">,
    { repository: NonNullable<RepoLayoutQueryQuery["repository"]> }
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
