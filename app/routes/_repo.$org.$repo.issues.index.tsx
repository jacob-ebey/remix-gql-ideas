import { Link } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/node";

import { runEntryPoint, useEntryPoint } from "~/graphql";
import { entryPoint } from "./_repo.$org.$repo.issues.index.query";

export function loader(args: LoaderArgs) {
  return runEntryPoint(args, entryPoint);
}

export default function RepoIssues() {
  const { data } = useEntryPoint<typeof entryPoint>();

  // TODO: Introduce a way in the entrypoint or query to filter data / throw response.
  if (!data.repository) {
    return <h1>Repository not found</h1>;
  }

  const { issues } = data.repository;

  return (
    <div>
      <h1>Issues</h1>
      <p>
        <Link to="new">Create New Issue</Link>
      </p>
      {!issues?.edges?.length ? (
        <h1>No issues found</h1>
      ) : (
        <ul>
          {issues.edges.map((edge) => {
            if (!edge?.node) {
              return null;
            }

            const { id, number, title, author } = edge.node;

            return (
              <li key={id}>
                <Link to={String(number)}>
                  {title}
                  <br />
                  {author?.avatarUrl && (
                    <img
                      height={20}
                      width={20}
                      src={author?.avatarUrl}
                      alt={"avatar for " + author.login}
                    />
                  )}
                  {author?.login}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
