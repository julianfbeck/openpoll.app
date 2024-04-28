import type { APIRoute } from 'astro';
import { Redis } from 'ioredis';

export const GET: APIRoute = async ({ request, params }) => {
  const id = params.id as string;

  if (!id) {
    return new Response('Not found', { status: 404 });
  }

  const redisSubscriber = new Redis('redis://localhost:6379');
  const encoder = new TextEncoder();
  let isControllerClosed = false; // Flag to track if the controller is closed

  const customReadable = new ReadableStream({
    start(controller) {
      redisSubscriber.subscribe(`update:${id}`, (err) => {
        if (err) console.log(err);
      });

      redisSubscriber.on('message', (channel, message) => {
        if (channel === `update:${id}` && !isControllerClosed) {
          controller.enqueue(encoder.encode(`data: ${message}\n\n`));
        }
      });

      redisSubscriber.on('end', () => {
        if (!isControllerClosed) {
          isControllerClosed = true;
          controller.close(); // Ensures the stream is properly closed
        }
      });
    },
    cancel(reason) {
      cleanUp();
    }
  });

  function cleanUp() {
    if (!isControllerClosed) {
      isControllerClosed = true;
      // Proper cleanup logic here
      redisSubscriber
        .unsubscribe()
        .then(() => {
          return redisSubscriber.quit();
        })
        .catch(console.error);
      // No direct controller.close() here as it's not accessible, but the stream will be closed automatically after cancel
    }
  }

  return new Response(customReadable, {
    headers: {
      Connection: 'keep-alive',
      'Content-Encoding': 'none',
      'Cache-Control': 'no-cache, no-transform',
      'Content-Type': 'text/event-stream; charset=utf-8'
    }
  });
};
