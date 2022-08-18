import { graphql } from "~/graphql";
import type {
  IndexCriticalQueryQuery,
  IndexCriticalQueryQueryVariables,
} from "~/graphql/types";

type IndexDeferredFollowersQueryData = {
  viewer: { followers: { nodes: { login: string; name: string }[] } };
};
type IndexDeferredFollowersQueryVariables = {};

export const entryPoint = {
  query: graphql<IndexCriticalQueryQuery, IndexCriticalQueryQueryVariables>`
    query IndexCriticalQuery {
      viewer {
        bioHTML
        name
      }
    }
  `(),
  deferredQueries: {
    followers: graphql<
      IndexDeferredFollowersQueryData,
      IndexDeferredFollowersQueryVariables
    >`
      query IndexDeferredFollowersQuery {
        viewer {
          followers(first: 5) {
            nodes {
              login
              name
            }
          }
        }
      }
    `(),
  },
};
