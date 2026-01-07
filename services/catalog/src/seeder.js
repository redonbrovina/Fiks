/**
 * Category Seeder for Catalog service
 * Pre-populates default service categories
 */

const { Kategoria } = require('./models');

const categories = [
    // Main categories (no parent)
    { lloji_kategorise: 'Pastrim', parent: null },
    { lloji_kategorise: 'Riparim', parent: null },
    { lloji_kategorise: 'Instalime', parent: null },
    { lloji_kategorise: 'Kujdes Personal', parent: null },
    { lloji_kategorise: 'Transportim', parent: null },
    { lloji_kategorise: 'Edukim', parent: null },
    { lloji_kategorise: 'Teknologji', parent: null },
    { lloji_kategorise: 'Tjera', parent: null }
];

// Subcategories mapped to parent names
const subcategories = {
    'Pastrim': [
        'Pastrim Shtëpie',
        'Pastrim Zyre',
        'Pastrim Dritaresh',
        'Pastrim pas Ndërtimit'
    ],
    'Riparim': [
        'Elektricist',
        'Hidraulik',
        'Mobileri',
        'Pajisje Elektroshtëpiake'
    ],
    'Instalime': [
        'Instalime Elektrike',
        'Instalime Hidraulike',
        'Montim Mobileri',
        'Instalim Klimash'
    ],
    'Kujdes Personal': [
        'Parukeri',
        'Masazhe',
        'Manikyr/Pedikyr',
        'Makeup'
    ],
    'Transportim': [
        'Shpërngulje',
        'Transport Mallrash',
        'Shofer Privat'
    ],
    'Edukim': [
        'Mësimdhënie Private',
        'Kurse Gjuhësh',
        'Trajnime'
    ],
    'Teknologji': [
        'Riparim Kompjuterash',
        'Instalim Softuerash',
        'Rrjete & Internet'
    ]
};

async function runSeeder() {
    console.log('Running Catalog category seeder...');

    try {
        // Create main categories
        const createdCategories = {};
        for (const cat of categories) {
            const [category] = await Kategoria.findOrCreate({
                where: { lloji_kategorise: cat.lloji_kategorise, kategoria_parent_id: null },
                defaults: { lloji_kategorise: cat.lloji_kategorise }
            });
            createdCategories[cat.lloji_kategorise] = category;
        }
        console.log(`Seeded ${categories.length} main categories`);

        // Create subcategories
        let subCount = 0;
        for (const [parentName, subs] of Object.entries(subcategories)) {
            const parent = createdCategories[parentName];
            if (parent) {
                for (const subName of subs) {
                    await Kategoria.findOrCreate({
                        where: { lloji_kategorise: subName, kategoria_parent_id: parent.kategoria_id },
                        defaults: {
                            lloji_kategorise: subName,
                            kategoria_parent_id: parent.kategoria_id
                        }
                    });
                    subCount++;
                }
            }
        }
        console.log(`Seeded ${subCount} subcategories`);

    } catch (error) {
        console.error('Category seeder error:', error);
    }
}

module.exports = { runSeeder };
