const { Qyteti, Roli } = require('./models');

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
}

module.exports = { runSeeder };
