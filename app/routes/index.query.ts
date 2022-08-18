import { graphql } from "~/graphql";
import type {
  IndexCriticalQueryQuery,
  IndexCriticalQueryQueryVariables,
  IndexDeferredFollowersQueryQuery,
  IndexDeferredFollowersQueryQueryVariables,
} from "~/graphql/types";

type NonNullableFollower = NonNullable<
  NonNullable<
    NonNullable<
      NonNullable<
        NonNullable<
          IndexDeferredFollowersQueryQuery["viewer"]
        >["followers"]["edges"]
      >[number]
    >["node"]
  >
>;

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
      IndexDeferredFollowersQueryQuery,
      IndexDeferredFollowersQueryQueryVariables,
      {},
      NonNullableFollower[]
    >`
      query IndexDeferredFollowersQuery {
        viewer {
          followers(first: 5) {
            edges {
              node {
                login
                name
              }
            }
          }
        }
      }
    `({
      filter: ({ viewer }) => {
        if (!viewer.followers.edges) {
          return [];
        }

        return viewer.followers.edges
          .map((edge) => edge?.node)
          .filter(Boolean) as NonNullableFollower[];
      },
    }),
  },
};
