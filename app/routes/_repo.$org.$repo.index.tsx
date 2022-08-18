import { Link, Outlet } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/node";

import { runEntryPoint, useEntryPoint } from "~/graphql";
import { entryPoint } from "./_repo.$org.$repo.index.query";

export function loader(args: LoaderArgs) {
  return runEntryPoint(args, entryPoint);
}

export default function RepoLayout() {
  const { data } = useEntryPoint<typeof entryPoint>();

  // TODO: Introduce a way in the entrypoint or query to filter data / throw response.
  if (!data.repository) {
    return <h1>Repository not found</h1>;
  }

  const { stargazerCount } = data.repository;

  return (
    <div>
      <p>Stargazers: {stargazerCount}</p>
    </div>
  );
}
