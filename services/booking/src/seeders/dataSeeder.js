const seedData = async (sequelize) => {
    const { KerkesaPunes, Termini, KerkesaPunesStatus } = sequelize.models;

    console.log('Running Booking data seeder...');

    try {
        const statuses = await KerkesaPunesStatus.findAll();
        const pendingStatus = statuses.find(s => s.status === 'Pending');
        const acceptedStatus = statuses.find(s => s.status === 'Accepted');
        const completedStatus = statuses.find(s => s.status === 'Completed');

        if (!pendingStatus || !acceptedStatus || !completedStatus) {
            console.error('Statuses not found, skipping data seed');
            return;
        }

        // Seed 10 Work Requests
        for (let i = 1; i <= 10; i++) {
            const userId = i; // Klient 1 to 10
            const proId = ((i + 2) % 10) + 1; // Round robin pro selection

            const [request] = await KerkesaPunes.findOrCreate({
                where: { perdoruesi_id: userId, profesionisti_id: proId, mesazhi: `Pershendetje, kam nevoje per sherbimin tuaj nr ${i}.` },
                defaults: {
                    perdoruesi_id: userId,
                    profesionisti_id: proId,
                    mesazhi: `Pershendetje, kam nevoje per sherbimin tuaj nr ${i}.`,
                    pershkrimi: `Kerkesa ${i} per sherbim profesional.`,
                    kerkesa_punes_status_id: i > 5 ? (i > 8 ? completedStatus.kerkesa_punes_status_id : acceptedStatus.kerkesa_punes_status_id) : pendingStatus.kerkesa_punes_status_id
                }
            });

            // If the request is accepted or completed, create an appointment (Termini)
            if (request.kerkesa_punes_status_id !== pendingStatus.kerkesa_punes_status_id) {
                const start = new Date();
                start.setDate(start.getDate() + i);
                start.setHours(10, 0, 0);
                const end = new Date(start);
                end.setHours(12, 0, 0);

                await Termini.findOrCreate({
                    where: { kerkesa_punes_id: request.kerkesa_punes_id },
                    defaults: {
                        kerkesa_punes_id: request.kerkesa_punes_id,
                        koha_fillimit: start,
                        koha_mbarimit: end,
                        cmimi: 25.00 + i
                    }
                });
            }
        }
        console.log('✅ Booking data seeded successfully');
    } catch (error) {
        console.error('❌ Booking seeder error:', error);
    }
};

module.exports = seedData;

