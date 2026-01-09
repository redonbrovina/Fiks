const { Qyteti, Roli, Perdoruesi, Profesionisti } = require('./models');

const cities = [
    'Prishtine', 'Prizren', 'Peje', 'Gjakove', 'Mitrovice',
    'Ferizaj', 'Gjilan', 'Deqan', 'Rahovec', 'Vushtrri', 'Drenice'
];

const roles = ['klient', 'admin', 'profesionist'];

async function runSeeder() {
    console.log('Running database seeder...');

    // Seed cities
    const seededCities = [];
    for (const cityName of cities) {
        const [city] = await Qyteti.findOrCreate({
            where: { emri: cityName },
            defaults: { emri: cityName }
        });
        seededCities.push(city);
    }
    console.log(`Seeded ${cities.length} cities`);

    // Seed roles
    const seededRoles = {};
    for (const roleName of roles) {
        const [role] = await Roli.findOrCreate({
            where: { lloji: roleName },
            defaults: { lloji: roleName }
        });
        seededRoles[roleName] = role;
    }
    console.log(`Seeded ${roles.length} roles`);

    if (process.env.NODE_ENV === 'development') {
        const clientNames = [
            'Arben Krasniqi', 'Teuta Berisha', 'Liridon Gashi', 'Vlora Shala', 'Bekim Morina',
            'Fatmire Bytyqi', 'Driton Aliu', 'Shqipe Hoti', 'Gentian Rama', 'Blerta Osmani'
        ];

        // Create 10 Klient (Customers)
        for (let i = 1; i <= 10; i++) {
            const email = `klient${i}@fiks.com`;
            const name = clientNames[i - 1];
            const city = seededCities[i % seededCities.length];

            const existing = await Perdoruesi.findOne({ where: { email } });
            if (!existing) {
                const user = await Perdoruesi.create({
                    emri: name,
                    email,
                    fjalekalimi: 'password123',
                    adresa: `Rruga e Klienteve, Nr. ${i}, ${city.emri}`,
                    nr_telefonit: `+383 44 111 00${i - 1}`,
                    qyteti_id: city.qyteti_id
                });
                await user.addRolet(seededRoles['klient']);
            } else if (existing.emri.startsWith('Klient ')) {
                await existing.update({ emri: name });
            }
        }
        console.log('Seeded 10 Klient users');

        // Create 10 Professionals
        const professionalData = [
            { name: "Agim Ismajli", bio: "Elektricist me pervoje 10 vjecare ne instalime industriale dhe shtepiake." },
            { name: "Besnik Kelmendi", bio: "Hidraulik i specializuar ne meremetimin e banjave dhe rjetit ujesjelles." },
            { name: "Valbona Dervishi", bio: "Profesionist i pastrimit te shtepive dhe zyrave me standarde te larta." },
            { name: "Ilir Spahiu", bio: "Teknik per riparimin e pajisjeve elektroshtepiake (lavatrice, frigorifere)." },
            { name: "Bujar Rexhepi", bio: "Instalues i certifikuar i sistemeve te klimatizimit dhe ngrohjes qendrore." },
            { name: "Afrim Kryeziu", bio: "Mjeshter per montimin dhe riparimin e mobiljeve te ndryshme." },
            { name: "Edita Thaçi", bio: "Parukier dhe stilist flokesh me specializim ne ngjyrosje dhe prerje." },
            { name: "Sokol Kabashi", bio: "Trajner personal i certifikuar per fitnes dhe ushqim te shendetshem." },
            { name: "Mimoza Veliu", bio: "Mesimdhenes i gjuhes angleze per nivele te ndryshme (A1-C2)." },
            { name: "Artan Limani", bio: "Programer per zgjidhjen e problemeve softuerike dhe riparim kompjuterash." }
        ];

        for (let i = 1; i <= 10; i++) {
            const email = `pro${i}@fiks.com`;
            const pData = professionalData[i - 1];
            const city = seededCities[(i + 5) % seededCities.length];

            const existing = await Perdoruesi.findOne({ where: { email } });
            if (!existing) {
                const user = await Perdoruesi.create({
                    emri: pData.name,
                    email,
                    fjalekalimi: 'password123',
                    adresa: `Rruga Profesionale, Nr. ${i}, ${city.emri}`,
                    nr_telefonit: `+383 49 222 00${i - 1}`,
                    qyteti_id: city.qyteti_id
                });
                await user.addRolet(seededRoles['klient']);
                await user.addRolet(seededRoles['profesionist']);

                await Profesionisti.create({
                    perdoruesi_id: user.perdoruesi_id,
                    bio: pData.bio
                });
            } else if (existing.emri.startsWith('Profesionisti ')) {
                await existing.update({ emri: pData.name });
            }
        }
        console.log('Seeded 10 Professionals');

        // Admin User
        const adminEmail = 'admin@fiks.com';
        const existingAdmin = await Perdoruesi.findOne({ where: { email: adminEmail } });
        if (!existingAdmin) {
            const adminUser = await Perdoruesi.create({
                emri: 'Administrator',
                email: adminEmail,
                fjalekalimi: 'admin123',
                adresa: 'Rruga Agim Ramadani, Nr. 1, Prishtine',
                nr_telefonit: '+383 44 000 000',
                qyteti_id: seededCities[0].qyteti_id
            });
            await adminUser.addRolet(seededRoles['admin']);
            await adminUser.addRolet(seededRoles['klient']);
            console.log('Created test admin user: admin@fiks.com / admin123');
        }
    }
}

module.exports = { runSeeder };

