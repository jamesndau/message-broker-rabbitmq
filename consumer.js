const amqp = require('amqplib/callback_api');
const axios = require('axios');

const RABBITMQ_URL = 'amqps://cafpasvn:dIXnKbsHNgNFfgqT9-vVDb5B3C07TpPH@crow.rmq.cloudamqp.com/cafpasvn';
const QUEUE_NAME = 'user_created';

const SENDPORTAL_API_URL = ''; 
const API_TOKEN = ''; 

function consumeMessages() {
    amqp.connect(RABBITMQ_URL, (error0, connection) => {
        if (error0) {
            throw error0;
        }

        connection.createChannel((error1, channel) => {
            if (error1) {
                throw error1;
            }

            channel.assertQueue(QUEUE_NAME, { durable: true });

            console.log(`[*] Waiting for messages in ${QUEUE_NAME}.`);

            channel.consume(QUEUE_NAME, async (msg) => {
                if (msg !== null) {
                    const userData = JSON.parse(msg.content.toString());
                    const { firstname, lastname, email, date } = userData;

                    console.log(`
                    First Name: ${firstname}
                    Last Name: ${lastname}
                    Email: ${email}
                    Date: ${new Date(date).toLocaleString()}
                    `);

                   
                    try {
                        const response = await axios.post(
                            SENDPORTAL_API_URL,
                            {
                                first_name: firstname,
                                last_name: lastname,
                                email: email
                            },
                            {
                                headers: {
                                    'Authorization': `Bearer ${API_TOKEN}`,
                                    'Content-Type': 'application/json'
                                }
                            }
                        );

                        console.log('Subscriber created in SendPortal:', response.data);
                    } catch (apiError) {
                        console.error('Error creating subscriber in SendPortal:', apiError.response ? apiError.response.data : apiError.message);
                    }

                    
                    channel.ack(msg);
                }
            });
        });
    });
}

consumeMessages();
