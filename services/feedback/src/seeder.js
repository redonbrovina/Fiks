const { Review } = require('./models');

const seedReviews = async () => {
    console.log('Running Feedback seeder...');

    const sampleReviews = [
        { score: 5, mesazhi: 'Sherbim i shkelqyeshem! Shume profesional dhe i shpejte.' },
        { score: 4, mesazhi: 'Puna u krye ne rregull, jam i kenaqur.' },
        { score: 5, mesazhi: 'Sakte ne kohe dhe shume i sjellshem. Rekomandohet!' },
        { score: 5, mesazhi: 'Instalimi u be ne menyre perfekte. Faleminderit.' },
        { score: 3, mesazhi: 'Puna u krye mire por pati pak vonese ne mberritje.' },
        { score: 5, mesazhi: 'Shpjegoi cdo gje qe beri, shume i qarte.' },
        { score: 4, mesazhi: 'Cilesia e punes eshte shume e mire.' },
        { score: 5, mesazhi: 'Me i miri ne qytet per kete sherbim.' },
        { score: 4, mesazhi: 'Gjithcka ne rregull sipas marreveshjes.' },
        { score: 5, mesazhi: 'Eksperience shume e mire, do tju therras perseri!' }
    ];

    for (let i = 1; i <= 10; i++) {
        const userId = i; // Klient 1 to 10
        const proId = ((i + 1) % 10) + 1; // Round robin

        await Review.findOrCreate({
            where: { perdoruesi_id: userId, profesionisti_id: proId, mesazhi: sampleReviews[i - 1].mesazhi },
            defaults: {
                score: sampleReviews[i - 1].score,
                mesazhi: sampleReviews[i - 1].mesazhi,
                perdoruesi_id: userId,
                profesionisti_id: proId,
                termini_id: i + 100 // Dummy termini ID
            }
        });
    }

    console.log('✅ Feedback seeded successfully');
};

module.exports = seedReviews;
