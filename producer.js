const amqp = require('amqplib');

const RABBITMQ_URL = 'amqps://cafpasvn:dIXnKbsHNgNFfgqT9-vVDb5B3C07TpPH@crow.rmq.cloudamqp.com/cafpasvn';
const QUEUE_NAME = 'user_created';

async function sendMessage() {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();

        await channel.assertQueue(QUEUE_NAME, { durable: true });

        const message = {
            firstname: 'jay',
            lastname: 'kanoti',
            email: 'kanoti@gmail.com',
            date: new Date().toISOString()
        };

        console.log('Message to be sent:', message);

        
        channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(message)), { persistent: true });
        
        console.log('Message sent:', message);

        setTimeout(() => {
            channel.close();
            connection.close();
        }, 500);
    } catch (error) {
        console.error('Error:', error);
    }
}

sendMessage();
