/**
 * Kafka Consumer using KafkaJS
 * Consumes professional_created events to auto-create profiles and services
 */

const { Kafka } = require('kafkajs');
const { Profili, Sherbimi } = require('../models');

class KafkaConsumer {
    constructor() {
        this.consumer = null;
        this.isConnected = false;

        const brokers = process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'];

        this.kafka = new Kafka({
            clientId: 'catalog-service',
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
            this.consumer = this.kafka.consumer({ groupId: 'catalog-group' });
            await this.consumer.connect();

            // Subscribe to topics
            await this.consumer.subscribe({
                topics: ['professional_created', 'review_created'],
                fromBeginning: false
            });

            console.log('[KAFKA] Consumer subscribed to topics: professional_created, review_created');

            // Start consuming
            await this.consumer.run({
                eachMessage: async ({ topic, partition, message }) => {
                    try {
                        const data = JSON.parse(message.value.toString());
                        console.log(`[KAFKA] Received message from ${topic}:`, JSON.stringify(data, null, 2));

                        if (topic === 'professional_created') {
                            await this.handleProfessionalCreated(data);
                        } else if (topic === 'review_created') {
                            await this.handleReviewCreated(data);
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
     * Handle professional_created event from Identity service
     * Creates a Profili and optionally a Sherbimi in Catalog
     */
    async handleProfessionalCreated(message) {
        try {
            const {
                profesionisti_id,
                perdoruesi_id,
                emri,
                email,
                nr_telefonit,
                bio,
                service
            } = message;

            console.log(`[KAFKA] Processing professional_created for: ${emri} (ID: ${profesionisti_id})`);

            // Check if profile already exists
            const existingProfile = await Profili.findOne({
                where: { profesionisti_id }
            });

            if (existingProfile) {
                console.log(`[KAFKA] Profile already exists for profesionisti_id: ${profesionisti_id}`);
                return;
            }

            // Create profile in Catalog
            const profili = await Profili.create({
                emri,
                email,
                nr_telefonit: nr_telefonit || null,
                profesionisti_id: profesionisti_id,
                perdoruesi_id: perdoruesi_id,
                imazh: null,
                rating: 0
            });

            console.log(`[KAFKA] Created Profili with ID: ${profili.profili_id}`);

            // Create service if provided
            if (service && service.titulli) {
                const sherbimi = await Sherbimi.create({
                    titulli: service.titulli,
                    pershkrimi: service.pershkrimi || '',
                    cmimi: service.cmimi,
                    kategoria_id: service.kategoria_id || null,
                    profili_id: profili.profili_id
                });

                console.log(`[KAFKA] Created Sherbimi with ID: ${sherbimi.sherbimi_id}`);
            }

            console.log(`[KAFKA] Successfully processed professional_created for: ${emri}`);
        } catch (error) {
            console.error('[KAFKA] Error handling professional_created:', error);
        }
    }

    /**
     * Handle review_created event from Feedback service
     * Updates the rating of the professional profile
     */
    async handleReviewCreated(message) {
        try {
            const { profesionisti_id, rating } = message;

            console.log(`[KAFKA] Processing review_created for professional: ${profesionisti_id} with rating: ${rating}`);

            const profile = await Profili.findOne({ where: { profesionisti_id } });

            if (!profile) {
                console.warn(`[KAFKA] Profile not found for professional ID: ${profesionisti_id}`);
                return;
            }

            await profile.update({ rating });
            console.log(`[KAFKA] Updated rating for professional ${profesionisti_id} to ${rating}`);

        } catch (error) {
            console.error('[KAFKA] Error handling review_created:', error);
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
