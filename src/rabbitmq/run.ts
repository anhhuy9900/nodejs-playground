import { RabbitMQLib } from './rabbitmq';

async function consumer() {
    const rabbit = new RabbitMQLib('amqp://admin:admin@localhost:5672');

    try {
        await rabbit.connect();
        // Declare the queue before consuming messages
        await rabbit.channel?.assertQueue('nodejs-queue', { durable: true, exclusive: false, autoDelete: false });

        await rabbit.consume('ccu-game-data-queue', (message) => {
            console.log('Processing message:', message);
            // Add your message processing logic here
        });
    } catch (error) {
        console.error(error);
    }
}

consumer();