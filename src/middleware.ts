import { defineMiddleware } from "astro:middleware";
import { auth } from "./lib/auth";
import type { MiddlewareHandler } from "astro";
import type { User, Session } from "better-auth";

export const onRequest: MiddlewareHandler = defineMiddleware(async (context, next) => {
	const isAuthed = await auth.api
		.getSession({
			headers: context.request.headers,
		})

	if (isAuthed) {
		context.locals.user = isAuthed.user as User | null;
		context.locals.session = isAuthed.session as Session | null;
	} else {
		context.locals.user = null;
		context.locals.session = null;
	}

	return next();
});