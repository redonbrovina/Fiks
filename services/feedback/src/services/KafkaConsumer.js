/**
 * Kafka Consumer using KafkaJS
 * Listens for events
 */

const { Kafka } = require('kafkajs');

class KafkaConsumer {
    constructor() {
        this.consumer = null;
        this.isConnected = false;

        const brokers = process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'];

        this.kafka = new Kafka({
            clientId: 'feedback-service',
            brokers,
            retry: {
                initialRetryTime: 1000,
                retries: 5
            }
        });
    }

    async connect() {
        try {
            console.log('[KAFKA] Consumer connecting...');
            this.consumer = this.kafka.consumer({ groupId: 'feedback-group' });
            await this.consumer.connect();

            // Subscribe to topics
            // await this.consumer.subscribe({ topic: 'booking.completed', fromBeginning: false });

            console.log('[KAFKA] Consumer connected (no active subscriptions yet)');

            // Start consuming
            await this.consumer.run({
                eachMessage: async ({ topic, partition, message }) => {
                    try {
                        const data = JSON.parse(message.value.toString());
                        console.log(`[KAFKA] Received message from ${topic}:`, JSON.stringify(data, null, 2));
                    } catch (error) {
                        console.error('[KAFKA] Error processing message:', error);
                    }
                }
            });

            this.isConnected = true;
        } catch (error) {
            console.error('[KAFKA] Consumer connection failed:', error.message);
            this.isConnected = false;
        }
    }

    async disconnect() {
        if (this.consumer) {
            await this.consumer.disconnect();
            this.isConnected = false;
            console.log('[KAFKA] Consumer disconnected');
        }
    }
}

module.exports = new KafkaConsumer();
