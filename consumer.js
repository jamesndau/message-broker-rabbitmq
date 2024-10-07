require('dotenv').config();

const amqp = require('amqplib/callback_api');
const axios = require('axios');

const RABBITMQ_URL = process.env.RABBITMQ_URL;
const QUEUE_NAME = process.env.QUEUE_NAME;

const SENDPORTAL_API_URL = process.env.SENDPORTAL_API_URL; 
const API_TOKEN = process.env.API_TOKEN; 

function connectRabbitMQ(callback){
    amqp.connect(RABBITMQ_URL, (error0,connection) =>{
        if (error0){ 
            throw new Error('Failed to connect to RabbitMQ: ${error0.message}');
        }
        console.log('Connected to RabbitMQ');
        callback(connection);
    });
}

function consumeMessages(connection){
    connection.createChannel((error1, channel) =>{
        if(error1){
            throw new Error(`Failed to create RabbitMQ channel: ${error1.message}`);
        }
        channel.assertQueue(QUEUE_NAME, {durable:true});
        console.log(`[*] Waiting for messages in ${QUEUE_NAME}.`);

        channel.consume(QUEUE_NAME, async (msg) =>{
            if (msg !== null) {
                const userData = JSON.parse(msg.content.toString());
                console.log('Received new Message:', userData);

                await processNewUser(userData);

                channel.ack(msg);
            }
        });
    });
}

async function processNewUser(userData){
    const { firstname, lastname, email, date } = userData;
    console.log(`First Name: ${firstname}, Last Name: ${lastname} ,Email: ${email}, Date: ${new Date(date).toLocaleString()}`);
      try{
        const response = await axios.post(
            SENDPORTAL_API_URL, {
                first_name: firstname,
                last_name:lastname,
                email: email
            },{
                headers:{
                    'Authorization': `Bearer ${API_TOKEN}`,
                    'content-type': 'application/json'
                }
            }
        );
        console.log('Subscriber created in Sendportal:',response.data);
      }catch (apiError){
        console.error('Error creating subscriber in Sendportal:',apiError.response ? apiError.response.data : apiError.message);
      }
}

function startConsumer(){
    connectRabbitMQ(consumeMessages);
}

startConsumer();