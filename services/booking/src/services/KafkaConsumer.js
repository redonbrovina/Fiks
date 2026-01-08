/**
 * Kafka Consumer using KafkaJS
 * Listens for events from Identity and Catalog services
 */

const { Kafka } = require('kafkajs');

class KafkaConsumer {
    constructor() {
        this.consumer = null;
        this.isConnected = false;

        const brokers = process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'];

        this.kafka = new Kafka({
            clientId: 'booking-service',
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
            this.consumer = this.kafka.consumer({ groupId: 'booking-group' });
            await this.consumer.connect();

            // Subscribe to topics
            // Add topics to listen to here, e.g.:
            // await this.consumer.subscribe({ topic: 'user.created', fromBeginning: false });
            // await this.consumer.subscribe({ topic: 'service.created', fromBeginning: false });

            console.log('[KAFKA] Consumer connected (no active subscriptions yet)');

            // Start consuming
            await this.consumer.run({
                eachMessage: async ({ topic, partition, message }) => {
                    try {
                        const data = JSON.parse(message.value.toString());
                        console.log(`[KAFKA] Received message from ${topic}:`, JSON.stringify(data, null, 2));

                        // Handle messages
                        // if (topic === 'user.created') ...
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
