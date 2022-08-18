import type { ActionArgs, LoaderArgs } from "@remix-run/node";

import { runEntryPoint, useEntryPoint } from "~/graphql";
import { entryPoint } from "./gists.query";

export function action(args: ActionArgs) {
  return runEntryPoint(args, entryPoint);
}

export function loader(args: LoaderArgs) {
  return runEntryPoint(args, entryPoint);
}

export default function Gists() {
  const { data } = useEntryPoint<typeof entryPoint>();

  return (
    <div>
      <form>
        <input type="hidden" name="intent" value="like" />
      </form>
      <ul>
        {data.viewer.gists.edges?.map((edge) => {
          if (!edge?.node) {
            return null;
          }

          const { description, id, url } = edge.node;
          return (
            <li key={id}>
              <a href={url} rel="noopener noreferrer" target="_blank">
                {description}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
