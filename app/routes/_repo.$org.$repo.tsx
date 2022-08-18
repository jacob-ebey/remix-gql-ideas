import { Suspense } from "react";
import { Await, Link, Outlet } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/node";

import { runEntryPoint, useEntryPoint } from "~/graphql";
import { entryPoint } from "./_repo.$org.$repo.query";

export function loader(args: LoaderArgs) {
  return runEntryPoint(args, entryPoint);
}

export default function RepoLayout() {
  const { data } = useEntryPoint<typeof entryPoint>();

  // TODO: Introduce a way in the entrypoint or query to filter data / throw response.
  if (!data.repository) {
    return <h1>Repository not found</h1>;
  }

  const { name, owner } = data.repository;

  return (
    <div>
      <h1>{name}</h1>
      <p>
        {owner.avatarUrl && (
          <img
            height={20}
            width={20}
            src={owner.avatarUrl}
            alt={"avatar for " + owner.login}
          />
        )}
        {owner.login}
      </p>
      <nav>
        <Link to=".">Code</Link> / <Link to="issues">Issues</Link>
      </nav>
      <Outlet />
    </div>
  );
}
