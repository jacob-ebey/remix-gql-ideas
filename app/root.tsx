import type { MetaFunction } from "@remix-run/node";
import {
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
} from "@remix-run/react";

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "New Remix App",
  viewport: "width=device-width,initial-scale=1",
});

function Document({ children }: any) {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <header>
          <nav>
            <Link to="/">Home</Link> / <Link to="/gists">Gists</Link>
          </nav>
        </header>
        {children}
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export function CatchBoundary({ error }: { error: Error }) {
  let caught = useCatch();
  console.error("CAUGHT:", caught.data);

  return (
    <Document>
      <h1>{caught.status}</h1>
    </Document>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error("ERROR:", error);

  return (
    <Document>
      <h1>Something went terribly wrong...</h1>
    </Document>
  );
}

export default function App() {
  return (
    <Document>
      <Outlet />
    </Document>
  );
}
