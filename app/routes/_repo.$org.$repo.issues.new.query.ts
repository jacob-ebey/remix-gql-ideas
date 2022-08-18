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
    Params<"repo" | "org">
  >`
    query RepoNewIssueQuery($name: String!, $owner: String!) {
      repository(name: $name, owner: $owner) {
        id
      }
    }
  `(({ params }) => ({
    name: params.repo!,
    owner: params.org!,
  })),
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
    `(({ formData }) => ({
      repositoryId: formData.get("repositoryId")!,
      title: formData.get("title")!,
      body: formData.get("body"),
    })),
  },
};
