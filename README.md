# OpenPoll

![OpenPoll](/public/og-image.jpg)

> OpenPoll is a free and open-source platform to create and share polls. Use moderation features to share your polls during a live event or meetings.

OpenPoll uses SQLite, Server Sent Events, and Redis to create fast real-time polls.
Build on top of TRPC, Shadcn/UI and litestream/turso.

View Example Poll: [https://openpoll.app/poll/trU02FHXws](https://openpoll.app/poll/trU02FHXws)

## Tech Stack

OpenPoll is build on top of Astro. It uses the following technologies to create a combination of a static and dynamic website. 
- [Astro](https://astro.build/) as the main framework.
- [React](https://reactjs.org/) for the dynamic parts of the website. 
- TRPC for the API. Trpc is a framework that allows you to create a type-safe API. In OpenPoll TRPC APIs get called from Astro componentens on the server side and from react components on the client side.
- shadcn/ui - Beautifully designed components built with Radix UI and Tailwind CSS.
- [Tailwind CSS](https://tailwindcss.com/) for styling.
- Drizzle as the DB-ORM
- SQLite as the database. The DB can be hosted on Turso or on your own server using litestream and the tiny stack. See https://logsnag.com/blog/the-tiny-stack (The Tiny Stack (Astro, SQLite, Litestream))
- Redis is used for Rate Limiting and PubSub


## Self Hosting

OpenPoll can be self-hosted. You can decide to either use Sqlite locally backed by Litestream or use the Turso.  To configure OpenPoll to use Litestream uncomment the specific lines inside the `db.ts` file and add `--use-litestream` to the Dockerfile `run.sh` script.

Currently im running the OpenPoll on a [Fly.io](https://fly.io) instance. For more information on how to deploy OpenPoll to Fly.io see the [Fly.io Docs](https://fly.io/docs/)

