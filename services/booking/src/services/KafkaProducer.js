/**
 * Kafka Producer using KafkaJS
 * Connects to Kafka broker and publishes events
 */

const { Kafka } = require('kafkajs');

class KafkaProducer {
    constructor() {
        this.producer = null;
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
            console.log('[KAFKA] Producer connecting...');
            this.producer = this.kafka.producer();
            await this.producer.connect();
            this.isConnected = true;
            console.log('[KAFKA] Producer connected successfully');
        } catch (error) {
            console.error('[KAFKA] Producer connection failed:', error.message);
            // Don't throw - allow service to continue without Kafka
            this.isConnected = false;
        }
    }

    async publish(topic, message) {
        if (!this.isConnected) {
            console.log('[KAFKA] Producer not connected, attempting to connect...');
            await this.connect();
        }

        if (!this.isConnected) {
            console.warn('[KAFKA] Cannot publish - producer not connected');
            return false;
        }

        try {
            await this.producer.send({
                topic,
                messages: [
                    {
                        key: Date.now().toString(),
                        value: JSON.stringify(message)
                    }
                ]
            });
            console.log(`[KAFKA] Published to ${topic}:`, JSON.stringify(message, null, 2));
            return true;
        } catch (error) {
            console.error(`[KAFKA] Failed to publish to ${topic}:`, error.message);
            return false;
        }
    }

    async disconnect() {
        if (this.producer) {
            await this.producer.disconnect();
            this.isConnected = false;
            console.log('[KAFKA] Producer disconnected');
        }
    }
}

module.exports = new KafkaProducer();
