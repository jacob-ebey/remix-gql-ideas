import { graphql } from "~/graphql";

type IndexCriticalQueryData = { viewer: { bioHTML: string; name: string } };
type IndexCriticalQueryVariables = {};

type IndexDeferredFollowersQueryData = {
  viewer: { followers: { nodes: { login: string; name: string }[] } };
};
type IndexDeferredFollowersQueryVariables = {};

export const entryPoint = {
  query: graphql<IndexCriticalQueryData, IndexCriticalQueryVariables>`
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
