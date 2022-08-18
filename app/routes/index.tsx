import { Suspense } from "react";
import { Await } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/node";

import { runEntryPoint, useEntryPoint } from "~/graphql";
import { entryPoint } from "./index.query";

export function loader(args: LoaderArgs) {
  return runEntryPoint(args, entryPoint);
}

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
          {(followers) =>
            !followers.length ? (
              <p>No followers...</p>
            ) : (
              <ul>
                {followers.map((follower) => (
                  <li key={follower.login}>
                    {follower.name || follower.login}
                  </li>
                ))}
              </ul>
            )
          }
        </Await>
      </Suspense>

      <form>
        <input type="hidden" name="intent" value="like" />
      </form>
    </div>
  );
}
