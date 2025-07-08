import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ url, locals }) => {
	try {
		const searchParams = new URL(url).searchParams;
		const action = searchParams.get('action') || 'info';
		const pollId = searchParams.get('pollId') || 'test-poll-123';

		// Get the Durable Object binding
		const env = locals.runtime?.env;
		if (!env?.POLL_HUB) {
			return new Response(JSON.stringify({
				error: 'POLL_HUB Durable Object binding not found'
			}), {
				status: 500,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		// Get the Durable Object instance for the test poll
		const id = env.POLL_HUB.idFromName(pollId);
		const pollHub = env.POLL_HUB.get(id);

		switch (action) {
			case 'broadcast':
				// Test broadcasting an update
				const broadcastResult = await pollHub.fetch(new Request('https://dummy.com/broadcast'));
				const broadcastText = await broadcastResult.text();

				return new Response(JSON.stringify({
					success: true,
					action: 'broadcast',
					pollId,
					durableObjectId: id.toString(),
					result: broadcastText,
					timestamp: new Date().toISOString()
				}), {
					headers: { 'Content-Type': 'application/json' }
				});

			case 'websocket':
				// Test WebSocket upgrade (this will return the WebSocket response)
				const wsResult = await pollHub.fetch(new Request('https://dummy.com/ws', {
					headers: { 'Upgrade': 'websocket' }
				}));

				return new Response(JSON.stringify({
					success: true,
					action: 'websocket_test',
					pollId,
					durableObjectId: id.toString(),
					status: wsResult.status,
					hasWebSocket: !!wsResult.webSocket,
					timestamp: new Date().toISOString()
				}), {
					headers: { 'Content-Type': 'application/json' }
				});

			case 'info':
			default:
				// Return basic info about the Durable Object
				return new Response(JSON.stringify({
					success: true,
					action: 'info',
					pollId,
					durableObjectId: id.toString(),
					binding: 'POLL_HUB',
					availableActions: ['info', 'broadcast', 'websocket'],
					usage: {
						'GET /api/test-do': 'Default info',
						'GET /api/test-do?action=broadcast&pollId=test123': 'Test broadcast',
						'GET /api/test-do?action=websocket&pollId=test123': 'Test WebSocket upgrade',
						'GET /api/test-do?action=info&pollId=test123': 'Get DO info'
					},
					timestamp: new Date().toISOString()
				}), {
					headers: { 'Content-Type': 'application/json' }
				});
		}

	} catch (error) {
		console.error('Test DO API Error:', error);
		return new Response(JSON.stringify({
			error: 'Failed to test Durable Object',
			message: error instanceof Error ? error.message : 'Unknown error'
		}), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
};

export const POST: APIRoute = async ({ request, locals }) => {
	try {
		const body = await request.json();
		const { pollId = 'test-poll-123', message } = body;

		const env = locals.runtime?.env;
		if (!env?.POLL_HUB) {
			return new Response(JSON.stringify({
				error: 'POLL_HUB Durable Object binding not found'
			}), {
				status: 500,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		// Get the Durable Object instance
		const id = env.POLL_HUB.idFromName(pollId);
		const pollHub = env.POLL_HUB.get(id);

		// Send a custom broadcast
		const broadcastResult = await pollHub.fetch(new Request('https://dummy.com/broadcast', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ customMessage: message })
		}));

		const broadcastText = await broadcastResult.text();

		return new Response(JSON.stringify({
			success: true,
			action: 'custom_broadcast',
			pollId,
			durableObjectId: id.toString(),
			message,
			result: broadcastText,
			timestamp: new Date().toISOString()
		}), {
			headers: { 'Content-Type': 'application/json' }
		});

	} catch (error) {
		console.error('Test DO POST API Error:', error);
		return new Response(JSON.stringify({
			error: 'Failed to send custom broadcast',
			message: error instanceof Error ? error.message : 'Unknown error'
		}), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
}; 