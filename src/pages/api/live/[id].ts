import PollEmitter from '@/lib/PollEmitter';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request, params }) => {
  const id = params.id as string;

  if (!id) {
    return new Response('Not found', { status: 404 });
  }

  let isClosed = false;
  const body = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const sendEvent = () => {
        if (!isClosed) {
          const message = `data: ${JSON.stringify({ update: true })}\n\n`;
          controller.enqueue(encoder.encode(message));
        }
      };

      PollEmitter.getInstance().subscribe(id, sendEvent);

      request.signal.addEventListener('abort', () => {
        isClosed = true;
        PollEmitter.getInstance().unsubscribe(id, sendEvent);
        controller.close();
      });
    },
    cancel() {
      isClosed = true;
      PollEmitter.getInstance().unsubscribe(id, () => {});
    }
  });

  return new Response(body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive'
    }
  });
};
