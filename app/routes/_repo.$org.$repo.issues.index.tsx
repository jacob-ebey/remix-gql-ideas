import { Link } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/node";

import { runEntryPoint, useEntryPoint } from "~/graphql";
import { entryPoint } from "./_repo.$org.$repo.issues.index.query";

export function loader(args: LoaderArgs) {
  return runEntryPoint(args, entryPoint);
}

export default function RepoIssues() {
  const { data } = useEntryPoint<typeof entryPoint>();

  return (
    <div>
      <h1>Issues</h1>
      <p>
        <Link to="new">Create New Issue</Link>
      </p>
      {!data.issues.length ? (
        <h1>No issues found</h1>
      ) : (
        <ul>
          {data.issues.map(({ id, number, title, author }) => {
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
