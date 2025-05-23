import { DurableObject } from "cloudflare:workers";

/**
 * Welcome to Cloudflare Workers! This is your first Durable Objects application.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your Durable Object in action
 * - Run `npm run deploy` to publish your application
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/durable-objects
 */

/**
 * PollHub Durable Object handles real-time updates for poll events
 * Each poll gets its own instance identified by the poll's shortId
 */
export class PollHub extends DurableObject {
	// Accept WebSocket connections or broadcast updates
	async fetch(req: Request): Promise<Response> {
		const url = new URL(req.url);

		// ── A. Client opening a WebSocket connection ──────────────────────────
		if (req.headers.get('Upgrade') === 'websocket') {
			console.log('New WebSocket connection for poll:', this.ctx.id.toString());
			const pair = new WebSocketPair();
			const [client, server] = Object.values(pair);

			// WebSocket hibernation keeps sockets alive while the DO is evicted
			this.ctx.acceptWebSocket(server);

			return new Response(null, { status: 101, webSocket: client });
		}

		// ── B. Any non-WebSocket request triggers broadcast to all connected clients ──
		console.log('Broadcasting update for poll:', this.ctx.id.toString());
		const connectedSockets = this.ctx.getWebSockets();
		console.log(`Broadcasting to ${connectedSockets.length} connected clients`);

		for (const ws of connectedSockets) {
			try {
				ws.send(JSON.stringify({
					type: 'poll_update',
					timestamp: Date.now(),
					pollId: this.ctx.id.toString()
				}));
			} catch (error) {
				console.log('Failed to send to closed socket:', error);
			}
		}

		return new Response('Broadcast sent', { status: 200 });
	}

	// Handle WebSocket close events for cleanup
	async webSocketClose(ws: WebSocket, code: number, reason: string) {
		console.log(`WebSocket closed for poll ${this.ctx.id.toString()}: code=${code}, reason=${reason}`);
	}
}

export default {} satisfies ExportedHandler<Env>;
