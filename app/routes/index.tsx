import { Suspense } from "react";
import { Await } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/node";

import type { EntryPoint } from "~/graphql";
import { graphql, runEntryPoint, useQuery } from "~/graphql";

export const loader = (args: LoaderArgs) => runEntryPoint(args, GraphQL);

export const GraphQL: EntryPoint = {
  query: graphql`
    query IndexCriticalQuery {
      viewer {
        bioHTML
        name
      }
    }
  `((params) => ({})),
  deferredQueries: {
    followers: graphql`
      query IndexDeferredFollowers {
        viewer {
          followers(first: 5) {
            nodes {
              login
              name
            }
          }
        }
      }
    `((params) => ({})),
  },
};

export default function Index() {
  const {
    data,
    deferredData: { followers },
  } = useQuery(GraphQL);

  return (
    <div>
      <h1>{data.viewer.name}</h1>
      <div dangerouslySetInnerHTML={{ __html: data.viewer.bioHTML }} />

      <Suspense fallback="Loading followers...">
        <Await resolve={followers}>
          {(followersData) => (
            <ul>
              {followersData.viewer.followers.nodes.map((follower) => (
                <li key={follower.login}>{follower.name || follower.login}</li>
              ))}
            </ul>
          )}
        </Await>
      </Suspense>

      <form>
        <input type="hidden" name="intent" value="like" />
      </form>
    </div>
  );
}
