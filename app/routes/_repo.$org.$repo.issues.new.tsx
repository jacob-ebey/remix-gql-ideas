import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { useParams } from "@remix-run/react";

import { runEntryPoint, useEntryPoint } from "~/graphql";
import { entryPoint } from "./_repo.$org.$repo.issues.new.query";

export function action(args: ActionArgs) {
  return runEntryPoint(args, entryPoint, true);
}

export function loader(args: LoaderArgs) {
  return runEntryPoint(args, entryPoint);
}

export default function NewIssue() {
  const { data } = useEntryPoint<typeof entryPoint>();
  const { org, repo } = useParams<"org" | "repo">();

  // TODO: Introduce a way in the entrypoint or query to filter data / throw response.
  if (!data.repository) {
    return <h1>Repository not found</h1>;
  }

  const { id } = data.repository;

  return (
    <div>
      <h1>New Issue</h1>
      <form method="post">
        <input type="hidden" name="_mutation" value="createIssue" />
        <input
          type="hidden"
          name="_redirect"
          value={`/${org}/${repo}/issues`}
        />

        <input type="hidden" name="repositoryId" value={id} />
        <input type="text" name="title" placeholder="Title" />
        <br />
        <textarea name="body" placeholder="Body" />
        <br />
        <button type="submit">Create Issue</button>
      </form>
    </div>
  );
}
