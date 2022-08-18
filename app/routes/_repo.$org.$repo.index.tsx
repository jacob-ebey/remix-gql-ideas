import type { LoaderArgs } from "@remix-run/node";

import { runEntryPoint, useEntryPoint } from "~/graphql";
import { entryPoint } from "./_repo.$org.$repo.index.query";

export function loader(args: LoaderArgs) {
  return runEntryPoint(args, entryPoint);
}

export default function RepoIndex() {
  const { data } = useEntryPoint<typeof entryPoint>();

  const { stargazerCount } = data.repository;

  return (
    <div>
      <p>Stargazers: {stargazerCount}</p>
    </div>
  );
}
