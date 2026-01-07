const { Qyteti, Roli, Perdoruesi } = require('./models');

const cities = [
    'Prishtine',
    'Prizren',
    'Peje',
    'Gjakove',
    'Mitrovice',
    'Ferizaj',
    'Gjilan',
    'Deqan',
    'Rahovec',
    'Vushtrri',
    'Drenice'
];

const roles = ['klient', 'admin'];

async function runSeeder() {
    console.log('Running database seeder...');

    // Seed cities
    for (const cityName of cities) {
        await Qyteti.findOrCreate({
            where: { emri: cityName },
            defaults: { emri: cityName }
        });
    }
    console.log(`Seeded ${cities.length} cities`);

    // Seed roles
    for (const roleName of roles) {
        await Roli.findOrCreate({
            where: { lloji: roleName },
            defaults: { lloji: roleName }
        });
    }
    console.log(`Seeded ${roles.length} roles`);

    // Create test admin user (only in development)
    if (process.env.NODE_ENV === 'development') {
        const adminEmail = 'admin@fiks.com';
        const existingAdmin = await Perdoruesi.findOne({ where: { email: adminEmail } });

        if (!existingAdmin) {
            // Get Prishtine as default city for admin
            const defaultCity = await Qyteti.findOne({ where: { emri: 'Prishtine' } });

            const adminUser = await Perdoruesi.create({
                emri: 'Administrator',
                email: adminEmail,
                fjalekalimi: 'admin123', // Will be hashed by the model hook
                adresa: 'Rruga Agim Ramadani, Nr. 1, Prishtine',
                nr_telefonit: '+383 44 000 000',
                qyteti_id: defaultCity ? defaultCity.qyteti_id : null
            });

            // Assign admin role
            const adminRole = await Roli.findOne({ where: { lloji: 'admin' } });
            if (adminRole) {
                await adminUser.addRolet(adminRole);
            }
            console.log('Created test admin user: admin@fiks.com / admin123');
        } else {
            console.log('Test admin user already exists');
        }
    }
}

module.exports = { runSeeder };
