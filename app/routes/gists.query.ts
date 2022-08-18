import { graphql } from "~/graphql";
import type {
  GistsCriticalQueryQuery,
  GistsCriticalQueryQueryVariables,
} from "~/graphql/types";

export const entryPoint = {
  query: graphql<GistsCriticalQueryQuery, GistsCriticalQueryQueryVariables>`
    query GistsCriticalQuery {
      viewer {
        gists(first: 10, orderBy: { field: CREATED_AT, direction: DESC }) {
          edges {
            node {
              id
              description
              url
            }
          }
        }
      }
    }
  `(),
};
