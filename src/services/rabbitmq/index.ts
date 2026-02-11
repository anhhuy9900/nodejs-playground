import amqplib from 'amqplib';
import type { Channel, Connection, ConsumeMessage, Options } from 'amqplib';
import logger, { COLOR_LOG } from '../../logger/logger';

export interface RabbitMQServiceOptions {
  url: string;
  prefetch?: number;
  reconnectDelayMs?: number;
}

export type MessageHandler<T = any> = (data: T, raw: ConsumeMessage) => Promise<void>;

export interface RabbitMQServiceInterface {
  publish: <T>(queue: string, message: T, options?: Options.Publish) => Promise<void>;

  consume: <T>(queue: string, handler: MessageHandler<T>, options?: Options.Consume) => Promise<void>;

  close: () => Promise<void>;
}

export class RabbitMQService implements RabbitMQServiceInterface {
  private static instance: RabbitMQService;
  private connection: Connection | any = null;
  private channel: Channel | any = null;
  private readonly url: string;
  private readonly prefetch: number;
  private readonly reconnectDelayMs: number;
  private isConnecting = false;
  private reconnectIntervalHandle: NodeJS.Timeout | null = null;
  private consumerRegistry = new Map<string, { handler: MessageHandler<any>; options?: Options.Consume }>();

  private constructor(options: RabbitMQServiceOptions) {
    this.url = options.url;
    this.prefetch = options.prefetch || 10;
    this.reconnectDelayMs = options.reconnectDelayMs || 3000;
  }

  static async init(options: RabbitMQServiceOptions): Promise<RabbitMQService> {
    if (!RabbitMQService.instance) {
      RabbitMQService.instance = new RabbitMQService(options);
      await RabbitMQService.instance.connect();
    }
    return RabbitMQService.instance;
  }

  static getInstance(): RabbitMQService {
    if (!RabbitMQService.instance) {
      throw new Error('[RabbitMQService] Not initialized. Call init() first.');
    }
    return RabbitMQService.instance;
  }

  async publish<T>(queue: string, message: T, options?: Options.Publish): Promise<void> {
    if (!this.channel) throw new Error('RabbitMQService channel is not initialized.');
    await this.channel.assertQueue(queue, { durable: true });
    const buffer = Buffer.from(JSON.stringify(message));
    const success = this.channel.sendToQueue(queue, buffer, { persistent: true, ...options });

    if (!success) logger.logDebug('[RabbitMQService] Failed to publish to %s', queue);
  }

  async consume<T>(queue: string, handler: MessageHandler<T>, options?: Options.Consume): Promise<void> {
    if (!this.channel) throw new Error('RabbitMQ channel is not initialized.');
    await this.channel.assertQueue(queue, { durable: true });

    if (!this.consumerRegistry.has(queue)) {
      this.consumerRegistry.set(queue, { handler, options });
    }

    await this.channel.consume(
      queue,
      async (msg: amqplib.ConsumeMessage) => {
        if (msg) {
          try {
            const data = JSON.parse(msg.content.toString());
            await handler(data, msg);
            this.channel?.ack(msg);
          } catch (err) {
            logger.logError('[RabbitMQService] Failed to process message: %s', (err as Error).message);
            this.channel?.nack(msg, false, false);
          }
        }
      },
      options,
    );
  }

  async close(): Promise<void> {
    await this.channel?.close();
    await this.connection?.close();
    logger.logInfo('[RabbitMQService] Gracefully closed connection');
  }

  private async connect(): Promise<void> {
    if (this.isConnecting) return;
    this.isConnecting = true;

    try {
      this.connection = await amqplib.connect(this.url);
      this.channel = await this.connection.createChannel();
      await this.channel.prefetch(this.prefetch);

      this.connection.on('close', () => {
        logger.logError('[RabbitMQService] Connection closed. Starting reconnect loop.');
        this.channel = null;
        this.connection = null;
        this.startReconnectInterval();
      });
      this.connection.on('error', (err: { message: any; }) => {
        logger.logError('[RabbitMQService] Connection error: %s', err.message);
      });

      logger.logInfoColor(COLOR_LOG.GREEN, '* [RabbitMQService] Connected to %s', this.url);

      this.clearReconnectInterval();
      await this.rebindConsumers();
    } catch (err) {
      logger.logError('[RabbitMQService] Failed to connect: %s', (err as Error).message);
      this.startReconnectInterval();
    } finally {
      this.isConnecting = false;
    }
  }

  private async rebindConsumers() {
    for (const [queue, { handler, options }] of this.consumerRegistry.entries()) {
      logger.logInfo('[RabbitMQService] Rebinding consumer for queue: %s', queue);
      await this.consume(queue, handler, options); // Will not re-register in map again
    }
  }

  private startReconnectInterval() {
    if (this.reconnectIntervalHandle) return;
    logger.logInfo('[RabbitMQService] Starting reconnect interval');
    this.reconnectIntervalHandle = setInterval(() => {
      (async () => {
        try {
          await this.connect();
          if (this.channel && this.connection) {
            logger.logInfo('[RabbitMQService] Reconnected successfully');
            this.clearReconnectInterval();
          }
        } catch (err) {
          logger.logError('[RabbitMQService] Reconnect attempt failed: %s', (err as Error).message);
        }
      })();
    }, this.reconnectDelayMs);
  }

  private clearReconnectInterval() {
    if (this.reconnectIntervalHandle) {
      clearInterval(this.reconnectIntervalHandle);
      this.reconnectIntervalHandle = null;
    }
  }
}
