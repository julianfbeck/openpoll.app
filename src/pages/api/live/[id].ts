import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ params, locals }) => {
	const id = params.id as string;

	if (!id) {
		return new Response('Not found', { status: 404 });
	}

	// Get the Durable Object binding
	const env = locals.runtime?.env;
	if (!env?.POLL_HUB) {
		return new Response('Durable Object binding not found', { status: 500 });
	}

	try {
		// Get the Durable Object instance for this poll
		const durableObjectId = env.POLL_HUB.idFromName(id);
		const pollHub = env.POLL_HUB.get(durableObjectId);

		// Forward the WebSocket upgrade request to the Durable Object
		const response = await pollHub.fetch(new Request('https://dummy.com/websocket', {
			headers: { 'Upgrade': 'websocket' }
		}));

		return response;
	} catch (error) {
		console.error('WebSocket proxy error:', error);
		return new Response('Internal Server Error', { status: 500 });
	}
};
