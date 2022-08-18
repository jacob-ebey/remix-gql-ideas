import { graphql } from "~/graphql";
import type {
  GistsCriticalQueryQuery,
  GistsCriticalQueryQueryVariables,
} from "~/graphql/types";

type NonNullableGists = NonNullable<
  NonNullable<
    NonNullable<
      NonNullable<
        NonNullable<GistsCriticalQueryQuery["viewer"]>["gists"]["edges"]
      >[number]
    >["node"]
  >
>;

export const entryPoint = {
  query: graphql<
    GistsCriticalQueryQuery,
    GistsCriticalQueryQueryVariables,
    {},
    {
      gists: NonNullableGists[];
    }
  >`
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
  `({
    filter: ({ viewer }) => {
      if (!viewer.gists.edges) {
        return { gists: [] };
      }

      return {
        gists: viewer.gists.edges
          .map((edge) => edge?.node)
          .filter(Boolean) as NonNullableGists[],
      };
    },
  }),
};
