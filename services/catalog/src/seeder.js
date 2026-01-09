const { Kategoria, Sherbimi, Profili } = require('./models');

const categories = [
    { lloji_kategorise: 'Pastrim', parent: null },
    { lloji_kategorise: 'Riparim', parent: null },
    { lloji_kategorise: 'Instalime', parent: null },
    { lloji_kategorise: 'Kujdes Personal', parent: null },
    { lloji_kategorise: 'Transportim', parent: null },
    { lloji_kategorise: 'Edukim', parent: null },
    { lloji_kategorise: 'Teknologji', parent: null },
    { lloji_kategorise: 'Tjera', parent: null }
];

const subcategories = {
    'Pastrim': ['Pastrim Shtëpie', 'Pastrim Zyre', 'Pastrim Dritaresh'],
    'Riparim': ['Elektricist', 'Hidraulik', 'Mobileri'],
    'Instalime': ['Instalime Elektrike', 'Instalime Hidraulike', 'Montim Mobileri'],
    'Kujdes Personal': ['Parukeri', 'Masazhe', 'Makeup'],
    'Transportim': ['Shpërngulje', 'Transport Mallrash'],
    'Edukim': ['Mësimdhënie Private', 'Kurse Gjuhësh'],
    'Teknologji': ['Riparim Kompjuterash', 'Instalim Softuerash']
};

async function runSeeder() {
    console.log('Running Catalog database seeder...');

    try {
        // 1. Seed Categories
        const createdCategories = {};
        for (const cat of categories) {
            const [category] = await Kategoria.findOrCreate({
                where: { lloji_kategorise: cat.lloji_kategorise, kategoria_parent_id: null },
                defaults: { lloji_kategorise: cat.lloji_kategorise }
            });
            createdCategories[cat.lloji_kategorise] = category;
        }

        const allSubCats = [];
        for (const [parentName, subs] of Object.entries(subcategories)) {
            const parent = createdCategories[parentName];
            if (parent) {
                for (const subName of subs) {
                    const [sub] = await Kategoria.findOrCreate({
                        where: { lloji_kategorise: subName, kategoria_parent_id: parent.kategoria_id },
                        defaults: { lloji_kategorise: subName, kategoria_parent_id: parent.kategoria_id }
                    });
                    allSubCats.push(sub);
                }
            }
        }
        console.log(`Seeded ${Object.keys(createdCategories).length} main categories and ${allSubCats.length} subcategories`);

        // 2. Seed Professionals (Profili) and Services (Sherbimi)
        // We assume IDs 1-10 are from Identity Professionals
        const servicesData = [
            { titulli: 'Instalime Elektrike Profesionale', cmimi: 25.00, subCat: 'Elektricist' },
            { titulli: 'Riparime Hidraulike 24/7', cmimi: 30.00, subCat: 'Hidraulik' },
            { titulli: 'Pastrim i Thelle i Shtepise', cmimi: 50.00, subCat: 'Pastrim Shtëpie' },
            { titulli: 'Servis i Lavatriceve dhe Frigorifereve', cmimi: 20.00, subCat: 'Riparim' },
            { titulli: 'Montim i Klimave (Inverter)', cmimi: 45.00, subCat: 'Instalime' },
            { titulli: 'Montim i Mobiljeve te Kuzhines', cmimi: 100.00, subCat: 'Montim Mobileri' },
            { titulli: 'Prerje dhe Stillim Flokesh', cmimi: 15.00, subCat: 'Parukeri' },
            { titulli: 'Masazhe Relaksuese dhe Terapeutike', cmimi: 35.00, subCat: 'Masazhe' },
            { titulli: 'Mesime Private ne Anglisht', cmimi: 10.00, subCat: 'Mësimdhënie Private' },
            { titulli: 'Riparim i Laptopave dhe PC', cmimi: 40.00, subCat: 'Riparim Kompjuterash' }
        ];

        const initialRatings = [5, 4, 5, 5, 3, 5, 4, 5, 4, 5];
        const professionalNames = [
            "Agim Ismajli", "Besnik Kelmendi", "Valbona Dervishi", "Ilir Spahiu", "Bujar Rexhepi",
            "Afrim Kryeziu", "Edita Thaçi", "Sokol Kabashi", "Mimoza Veliu", "Artan Limani"
        ];

        for (let i = 1; i <= 10; i++) {
            // In our Identity seeder:
            // Professionals 1-10 have:
            // perdoruesi_id: 10 + i (11, 12, ... 20)
            // profesionisti_id: i (1, 2, ... 10)

            const [profile, created] = await Profili.findOrCreate({
                where: { profesionisti_id: i },
                defaults: {
                    emri: professionalNames[i - 1],
                    email: `pro${i}@fiks.com`,
                    perdoruesi_id: 10 + i,
                    profesionisti_id: i,
                    rating: initialRatings[i - 1]
                }
            });

            // Ensure name and rating are synced
            const updates = {};
            if (profile.emri.startsWith('Profesionisti ')) {
                updates.emri = professionalNames[i - 1];
            }
            if (!created && (profile.rating === 0 || profile.rating === '0.00')) {
                updates.rating = initialRatings[i - 1];
            }

            if (Object.keys(updates).length > 0) {
                await profile.update(updates);
            }

            // Create service for this profile
            const sData = servicesData[i - 1];
            const categoryMatch = allSubCats.find(c => c.lloji_kategorise === sData.subCat) || allSubCats[0];

            await Sherbimi.findOrCreate({
                where: { titulli: sData.titulli, profili_id: profile.profili_id },
                defaults: {
                    titulli: sData.titulli,
                    pershkrimi: `Sherbim cilesor i ofruar nga ${profile.emri}.`,
                    cmimi: sData.cmimi,
                    kategoria_id: categoryMatch.kategoria_id,
                    profili_id: profile.profili_id
                }
            });
        }
        console.log('Seeded 10 Professionals and 10 Services in Catalog');

    } catch (error) {
        console.error('Catalog seeder error:', error);
    }
}

module.exports = { runSeeder };
