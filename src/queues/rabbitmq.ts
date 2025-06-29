import amqp from 'amqplib';

async function publishToRabbit() {
  const queue = 'barcode-card-signal-mock-dpga';
  const message = {
    scannerId: '4',
    type: 'PLAYER_4_DRAW',
    data: '4060',
    timestamp: '2025-05-12T14:27:46+07:00',
  };

  try {
    const conn = await amqp.connect('amqp://admin:admin@localhost:5672');
    const channel = await conn.createChannel();
    await channel.assertQueue(queue, { durable: true });

    channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
    console.log(' [x] Sent message to queue:', queue);

    setTimeout(() => {
      channel.close();
      conn.close();
    }, 500);
  } catch (err) {
    console.error('Failed to publish:', err);
  }

  process.exit(0);
}

publishToRabbit();
