const seedStatuses = async (sequelize) => {
    const { KerkesaPunesStatus } = sequelize.models;

    // Statuses to seed
    const statuses = [
        { status: 'Pending' },
        { status: 'Accepted' },
        { status: 'Rejected' },
        { status: 'Completed' },
        { status: 'Cancelled' }
    ];

    for (const status of statuses) {
        await KerkesaPunesStatus.findOrCreate({
            where: { status: status.status },
            defaults: status
        });
    }

    console.log('✅ Statuses seeded successfully');
};

module.exports = seedStatuses;
