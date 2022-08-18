import { json } from "@remix-run/node";
import type { Params } from "@remix-run/react";

import { graphql } from "~/graphql";
import type {
  CreateIssueMutationMutation,
  CreateIssueMutationMutationVariables,
  RepoNewIssueQueryQuery,
  RepoNewIssueQueryQueryVariables,
} from "~/graphql/types";

export const entryPoint = {
  query: graphql<
    RepoNewIssueQueryQuery,
    RepoNewIssueQueryQueryVariables,
    Params<"repo" | "org">,
    { repository: NonNullable<RepoNewIssueQueryQuery["repository"]> }
  >`
    query RepoNewIssueQuery($name: String!, $owner: String!) {
      repository(name: $name, owner: $owner) {
        id
      }
    }
  `({
    variables: ({ params }) => ({
      name: params.repo!,
      owner: params.org!,
    }),
    filter: (data) => {
      if (!data.repository) {
        throw json("Repo not found", 404);
      }

      return { repository: data.repository };
    },
  }),
  mutations: {
    createIssue: graphql<
      CreateIssueMutationMutation,
      CreateIssueMutationMutationVariables,
      Params<"repo" | "org">
    >`
      mutation CreateIssueMutation(
        $repositoryId: ID!
        $title: String!
        $body: String
      ) {
        createIssue(
          input: { repositoryId: $repositoryId, title: $title, body: $body }
        ) {
          clientMutationId
        }
      }
    `({
      variables: ({ formData }) => ({
        repositoryId: formData.get("repositoryId")!,
        title: formData.get("title")!,
        body: formData.get("body"),
      }),
    }),
  },
};
