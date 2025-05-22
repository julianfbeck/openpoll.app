/// <reference path="../.astro/types.d.ts" />
type Runtime = import('@astrojs/cloudflare').Runtime<Env>;

type ENV = {
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  PUBLIC_TRPC_URL: string;
  TURSO_URL: string;
  TURSO_AUTH_TOKEN: string;
};


declare namespace App {
  interface Locals extends Runtime {
    user: import("better-auth").User | null;
    session: import("better-auth").Session | null;
  }
}

npx wrangler secret put BETTER_AUTH_SECRET m7oNZAVqqlLLgh7GrL8oZQ8wf8kGnI6R && npx wrangler secret put BETTER_AUTH_URL http://localhost:4321 && npx wrangler secret put GITHUB_CLIENT_ID 12e4fc83fe06dc636d15 && npx wrangler secret put GITHUB_CLIENT_SECRET a7665d56cbbe5c2a671a6a06ca5767282503c6eb && npx wrangler secret put PUBLIC_TRPC_URL http://localhost:4321/api/trpc && npx wrangler secret put TURSO_URL libsql://openpoll-julianfbeck.turso.io && npx wrangler secret put TURSO_AUTH_TOKEN eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3MTQ4NTY0ODcsImlkIjoiNmFhNzNhNTMtMzQzZi00YWIwLWI1ZDQtZDNkMjE5NDIxZDE0In0.KbzIAQlEUJH40tIBF1BvoYJyhZ05eDFuQhZVRs-Lp-pdUio7Asi6T9KkY33b53OjY6COhtgEq3rUxsnUOUyFDQ