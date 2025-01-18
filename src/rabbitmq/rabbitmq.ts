import amqp, { Channel, Connection } from 'amqplib';

export class RabbitMQLib {
    private connection: Connection | null = null;
    channel: Channel | null = null;

    constructor(private readonly url: string) {}

    async connect(): Promise<void> {
        try {
            this.connection = await amqp.connect(this.url);
            this.channel = await this.connection.createChannel();
            console.log('RabbitMQ connected successfully');
        } catch (error) {
            console.error('Failed to connect to RabbitMQ:', error);
            throw error;
        }
    }

    /**
     * Publish a message to an exchange and routing key
     * @param exchange - The exchange name
     * @param routingKey - The routing key
     * @param message - The message to send
     */
    async publish(exchange: string, routingKey: string, message: string): Promise<void> {
        if (!this.channel) {
            throw new Error('RabbitMQ channel is not initialized');
        }

        try {
            await this.channel.assertExchange(exchange, 'topic', { durable: true });
            this.channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(message)), {
                persistent: true,
            });
            console.log(`Message published to exchange "${exchange}" with routing key "${routingKey}"`);
        } catch (error) {
            console.error('Failed to publish message:', error);
            throw error;
        }
    }

    /**
     * Consume messages from a queue
     * @param queue - The queue to consume from
     * @param handler - The handler function to process the message
     */
    async consume(queue: string, handler: (message: string) => void): Promise<void> {
        if (!this.channel) {
            throw new Error('RabbitMQ channel is not initialized');
        }

        try {
            // Declare the queue
            await this.channel.assertQueue(queue, { durable: true });

            // Bind the queue to the exchange with the routing key
            await this.channel.bindQueue(queue, 'rabbit-exchange', 'my-routing-key');

            // Start consuming messages
            this.channel.consume(queue, (msg) => {
                if (msg) {
                    handler(msg.content.toString());
                    this.channel?.ack(msg); // Acknowledge the message after processing
                }
            });
            console.log(`Consuming from queue "${queue}"`);
        } catch (error) {
            console.error('Failed to consume message:', error);
            throw error;
        }
    }

    async close(): Promise<void> {
        try {
            await this.channel?.close();
            await this.connection?.close();
            console.log('RabbitMQ connection closed gracefully');
        } catch (error) {
            console.error('Failed to close RabbitMQ connection:', error);
        }
    }
}