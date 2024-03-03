// src/controllers/chat.ts
import EventEmitter from 'events';

class PollEmitter {
  private static instance: PollEmitter;
  private constructor() {}
  private emitter: EventEmitter = new EventEmitter();

  static getInstance(): PollEmitter {
    if (!PollEmitter.instance) {
      PollEmitter.instance = new PollEmitter();
    }
    return PollEmitter.instance;
  }

  public subscribe(roomId: string, callback: () => void): void {
    this.emitter.on(`update:${roomId}`, callback);
  }

  public unsubscribe(roomId: string, callback: () => void): void {
    this.emitter.off(`update:${roomId}`, callback);
  }

  public notifyRoom(roomId: string): void {
    this.emitter.emit(`update:${roomId}`);
  }
}

export default PollEmitter;
