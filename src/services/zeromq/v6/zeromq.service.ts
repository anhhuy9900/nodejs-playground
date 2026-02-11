import logger from '../../../logger/logger';
import type { Publisher, Subscriber } from 'zeromq';
import * as zmq from 'zeromq';
import { ZmqMessageHandler } from './zeromq-service.type';

export interface ZeroMQServiceInterface {
  initPublisher: (bindAddress: string) => Promise<void>;
  publish: (topic: string, data: any) => Promise<void>;
  initSubscriber: (connectAddress: string, topics: string[], onMessage: ZmqMessageHandler) => Promise<void>;
  close: () => Promise<void>;
}

export class ZeroMQService implements ZeroMQServiceInterface {
  private publisher?: Publisher;
  private subscriber?: Subscriber;
  private subscriberTopics = new Set<string>();

  async initPublisher(bindAddress: string): Promise<void> {
    this.publisher = new zmq.Publisher();
    await this.publisher.bind(bindAddress);
    logger.logInfo(`ZeroMQService -> [ZeroMQ] Publisher bound to ${bindAddress}`);
  }

  async publish(topic: string, data: any): Promise<void> {
    if (!this.publisher) {
      throw new Error('ZeroMQService -> [ZeroMQ] Publisher not initialized.');
    }
    await this.publisher.send([topic, JSON.stringify(data)]);
  }

  async initSubscriber(connectAddress: string, topics: string[], onMessage: ZmqMessageHandler): Promise<void> {
    this.subscriber = new zmq.Subscriber();
    this.subscriber.connect(connectAddress);

    for (const topic of topics) {
      this.subscriber.subscribe(topic);
      this.subscriberTopics.add(topic);
    }

    logger.logInfo(
      `ZeroMQService -> [ZeroMQ] Subscriber connected to ${connectAddress} and subscribed to:`,
      topics.join(', '),
    );

    this.listen(onMessage);
  }

  async close(): Promise<void> {
    if (this.publisher) {
      await this.publisher.close();
      logger.logInfo('ZeroMQService -> [ZeroMQ] Publisher closed');
    }
    if (this.subscriber) {
      await this.subscriber.close();
      logger.logInfo('ZeroMQService -> [ZeroMQ] Subscriber closed');
    }
  }

  private async listen(handler: ZmqMessageHandler) {
    if (!this.subscriber) return;

    for await (const [topicBuf, messageBuf] of this.subscriber) {
      const topic = topicBuf.toString();
      const message = JSON.parse(messageBuf.toString());

      handler(topic, message);
    }
  }
}
