import { Suspense } from "react";
import { Await } from "@remix-run/react";

import type { EntryPoint } from "~/graphql";
import { graphql, useQuery } from "~/graphql";

// This can probably be removed as a requirement, but for now
// this is required to tell the client runtime a loader exists for the route.
export const loader = () => "OOPS";

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

type CriticalQuery = any;
type DeferredFollowersQuery = any;

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
    </div>
  );
}
