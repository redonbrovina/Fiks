/**
 * Kafka Consumer using KafkaJS
 * Listens for booking completion events to prompt reviews
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

            // Subscribe to booking completion events
            await this.consumer.subscribe({
                topic: 'booking_completed',
                fromBeginning: false
            });

            console.log('[KAFKA] Consumer subscribed to booking_completed');

            // Start consuming
            await this.consumer.run({
                eachMessage: async ({ topic, partition, message }) => {
                    try {
                        const data = JSON.parse(message.value.toString());
                        console.log(`[KAFKA] Received message from ${topic}:`, JSON.stringify(data, null, 2));

                        if (topic === 'booking_completed') {
                            await this.handleBookingCompleted(data);
                        }
                    } catch (error) {
                        console.error('[KAFKA] Error processing message:', error);
                    }
                }
            });

            this.isConnected = true;
            console.log('[KAFKA] Consumer connected and running');
        } catch (error) {
            console.error('[KAFKA] Consumer connection failed:', error.message);
            this.isConnected = false;
        }
    }

    /**
     * Handle booking_completed event
     * This can be used to prompt users to leave a review
     */
    async handleBookingCompleted(data) {
        try {
            const { termini_id, profesionisti_id, perdoruesi_id, timestamp } = data;

            console.log(`[KAFKA] Booking completed - Appointment: ${termini_id}`);
            console.log(`[KAFKA] Professional: ${profesionisti_id}, User: ${perdoruesi_id}`);

            // In a full implementation, this could:
            // 1. Store a pending review request in the database
            // 2. Trigger a push notification to the user
            // 3. Send an email reminder to leave a review

            // For now, we just log the event
            console.log(`[KAFKA] Review prompt ready for user ${perdoruesi_id} regarding professional ${profesionisti_id}`);
        } catch (error) {
            console.error('[KAFKA] Error handling booking_completed:', error);
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

