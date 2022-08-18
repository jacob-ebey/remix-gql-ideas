import { Suspense } from "react";
import { Await } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/node";

import { runEntryPoint, useEntryPoint } from "~/graphql";
import { entryPoint } from "./index.query";

export const loader = (args: LoaderArgs) => runEntryPoint(args, entryPoint);

export default function Index() {
  const {
    data,
    deferredData: { followers },
  } = useEntryPoint<typeof entryPoint>();

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
