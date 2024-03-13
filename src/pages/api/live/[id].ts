import type { APIRoute } from 'astro';
import { Redis } from 'ioredis';
const redisSubscriber = new Redis('redis://localhost:6379');

export const GET: APIRoute = async ({ request, params }) => {
  const id = params.id as string;

  if (!id) {
    return new Response('Not found', { status: 404 });
  }

  const encoder = new TextEncoder();
  let isControllerClosed = false; // Flag to track if the controller is closed

  const customReadable = new ReadableStream({
    start(controller) {
      redisSubscriber.subscribe(`update:${id}`, (err) => {
        if (err) console.log(err);
      });

      // Listen for new posts from Redis
      redisSubscriber.on('message', (channel, message) => {
        console.log(channel, message);
        if (channel === `update:${id}` && !isControllerClosed) {
          controller.enqueue(encoder.encode(`data: ${message}\n\n`));
        }
        if (isControllerClosed) {
          redisSubscriber.unsubscribe(`update:${id}`);
        }
      });

      redisSubscriber.on('end', () => {
        isControllerClosed = true; // Update flag when the controller is closed
        controller.close();
      });
    },
    cancel() {
      //this is important to close the connection, otherwise it can crash the server
      console.log('Controller is closed');
      isControllerClosed = true;
      redisSubscriber.unsubscribe(`update:${id}`);
      redisSubscriber.quit();
    }
  });

  return new Response(customReadable, {
    headers: {
      Connection: 'keep-alive',
      'Content-Encoding': 'none',
      'Cache-Control': 'no-cache, no-transform',
      'Content-Type': 'text/event-stream; charset=utf-8'
    }
  });
};
