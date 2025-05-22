/// <reference path="../.astro/types.d.ts" />
type Runtime = import('@astrojs/cloudflare').Runtime<Env>;

type ENV = {
  // replace `MY_KV` with your KV namespace
  MY_KV: KVNamespace;
};


declare namespace App {
  // Note: 'import {} from ""' syntax does not work in .d.ts files.
  interface Locals {
    user: import("better-auth").User | null;
    session: import("better-auth").Session | null;
  }
}