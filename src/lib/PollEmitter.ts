// Import ioredis
import Redis from 'ioredis';

class PollEmitter {
  private static instance: PollEmitter;
  private subscriber: Redis; // For subscribing to messages
  private publisher: Redis; // For publishing messages

  private constructor() {
    // Initialize Redis connections for pub/sub
    this.subscriber = new Redis(); // Connect to Redis using default settings
    this.publisher = new Redis(); // Separate connection for publishing
  }

  static getInstance(): PollEmitter {
    if (!PollEmitter.instance) {
      PollEmitter.instance = new PollEmitter();
    }
    return PollEmitter.instance;
  }

  public async subscribe(roomId: string, callback: () => void): Promise<void> {
    // Subscribe to a channel
    await this.subscriber.subscribe(`update:${roomId}`);
    this.subscriber.on('message', (channel, message) => {
      if (channel === `update:${roomId}`) {
        callback();
      }
    });
  }

  public async unsubscribe(
    roomId: string,
    callback: () => void
  ): Promise<void> {
    // Unsubscribe logic can be tricky with Redis since it doesn't support unsubscribing a specific callback
    // You might need to handle this differently, perhaps by keeping track of callbacks manually and invoking them as needed
    await this.subscriber.unsubscribe(`update:${roomId}`);
    // Removing the specific callback functionality as it needs a different approach with Redis
  }

  public notifyRoom(roomId: string): void {
    // Publish an update to a room
    this.publisher.publish(
      `update:${roomId}`,
      JSON.stringify({ update: true })
    );
  }
}

export default PollEmitter;
