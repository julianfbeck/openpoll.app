/// <reference path="../.astro/types.d.ts" />

type ENV = {
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  ALLOW_SIGNUP?: string;
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
  TURSO_URL: string;
  TURSO_AUTH_TOKEN?: string;
  POLL_HUB?: DurableObjectNamespace;
};

declare namespace App {
  interface Locals {
    user: import("better-auth").User | null;
    session: import("better-auth").Session | null;
    // The Node adapter does not populate this. Keeping it optional allows the
    // legacy Durable Object code to remain isolated until realtime is replaced.
    runtime?: { env?: ENV };
  }
}
