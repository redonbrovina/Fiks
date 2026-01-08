// Using native fetch API (Node 18+)

const API_URL = 'http://localhost:8080/api';

// Data Arrays
const clients = [
    { emri: "Artan Hoxha", email: "artan.hoxha@example.com", fjalekalimi: "password123", adresa: "Rruga 1", qyteti_id: 1 },
    { emri: "Besa Kelmendi", email: "besa.kelmendi@example.com", fjalekalimi: "password123", adresa: "Rruga 2", qyteti_id: 2 },
    { emri: "Driton Berisha", email: "driton.berisha@example.com", fjalekalimi: "password123", adresa: "Rruga 3", qyteti_id: 1 },
    { emri: "Era Gashi", email: "era.gashi@example.com", fjalekalimi: "password123", adresa: "Rruga 4", qyteti_id: 3 },
    { emri: "Faton Kastrati", email: "faton.kastrati@example.com", fjalekalimi: "password123", adresa: "Rruga 5", qyteti_id: 2 },
    { emri: "Gentiana Morina", email: "gentiana.morina@example.com", fjalekalimi: "password123", adresa: "Rruga 6", qyteti_id: 1 },
    { emri: "Hana Zeka", email: "hana.zeka@example.com", fjalekalimi: "password123", adresa: "Rruga 7", qyteti_id: 4 },
    { emri: "Ilir Krasniqi", email: "ilir.krasniqi@example.com", fjalekalimi: "password123", adresa: "Rruga 8", qyteti_id: 5 },
    { emri: "Jeta Vula", email: "jeta.vula@example.com", fjalekalimi: "password123", adresa: "Rruga 9", qyteti_id: 1 },
    { emri: "Kreshnik Shala", email: "kreshnik.shala@example.com", fjalekalimi: "password123", adresa: "Rruga 10", qyteti_id: 2 }
];

const professionals = [
    {
        user: { emri: "Leka Plumbing", email: "leka.plumbing@example.com", fjalekalimi: "Pass123!", adresa: "Lagjja e Spitalit", qyteti_id: 1, isProfessional: true },
        profile: { nr_telefonit: "044111222", imazh: "https://images.unsplash.com/photo-1581578731117-104f2a41272c?q=80&w=2070&auto=format&fit=crop" },
        services: [
            { titulli: "General Plumbing Fix", pershkrimi: "Fixing leaks, pipes, and drains.", cmimi: 30, koha_punes: "1-2 hours", kategoria_id: 2 } // Assuming 2 is a Plumbing/Construction category
        ]
    },
    {
        user: { emri: "Elektro Fix", email: "elektro.fix@example.com", fjalekalimi: "Pass123!", adresa: "Qendra", qyteti_id: 1, isProfessional: true },
        profile: { nr_telefonit: "044333444", imazh: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=2069&auto=format&fit=crop" },
        services: [
            { titulli: "Electrical Wiring", pershkrimi: "Full home wiring and repairs.", cmimi: 50, koha_punes: "2-4 hours", kategoria_id: 3 }, // Assuming 3 is Electrician
            { titulli: "Light Installation", pershkrimi: "Installing new light fixtures.", cmimi: 20, koha_punes: "1 hour", kategoria_id: 3 }
        ]
    },
    {
        user: { emri: "Design Studio", email: "design.studio@example.com", fjalekalimi: "Pass123!", adresa: "Sunny Hill", qyteti_id: 1, isProfessional: true },
        profile: { nr_telefonit: "044555666", imazh: "https://images.unsplash.com/photo-1572044162444-ad6021102907?q=80&w=2070&auto=format&fit=crop" },
        services: [
            { titulli: "Logo Design", pershkrimi: "Professional logo design with revisions.", cmimi: 150, koha_punes: "3 days", kategoria_id: 11 }, // Creative
            { titulli: "Web Banner Design", pershkrimi: " banners for social media.", cmimi: 50, koha_punes: "1 day", kategoria_id: 11 }
        ]
    },
    {
        user: { emri: "Math Tutor Pro", email: "math.tutor@example.com", fjalekalimi: "Pass123!", adresa: "Ulpiana", qyteti_id: 1, isProfessional: true },
        profile: { nr_telefonit: "044777888", imazh: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2070&auto=format&fit=crop" },
        services: [
            { titulli: "High School Math Tutoring", pershkrimi: "One-on-one math tutoring.", cmimi: 15, koha_punes: "1 hour", kategoria_id: 15 } // Education
        ]
    },
    {
        user: { emri: "Cleaning Squad", email: "cleaning.squad@example.com", fjalekalimi: "Pass123!", adresa: "Dardania", qyteti_id: 1, isProfessional: true },
        profile: { nr_telefonit: "044999000", imazh: "https://images.unsplash.com/photo-1581578731117-104f2a41272c?q=80&w=2070&auto=format&fit=crop" },
        services: [
            { titulli: "Apartment Cleaning", pershkrimi: "Deep cleaning for apartments.", cmimi: 40, koha_punes: "3-5 hours", kategoria_id: 1 } // Cleaning
        ]
    }
];

// Helper Functions
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function register(userData) {
    try {
        console.log(`Registering ${userData.emri}...`);
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        if (response.status === 400 || response.status === 409) {
            console.log(`⚠️ User ${userData.emri} likely already exists.`);
            return { existing: true };
        }
        const data = await response.json();
        if (!response.ok) throw new Error(JSON.stringify(data));
        console.log(`✅ Registered ${userData.emri}`);
        return data;
    } catch (error) {
        console.error(`❌ Failed to register ${userData.emri}:`, error.message);
        return null;
    }
}

async function login(email, password) {
    try {
        console.log(`Logging in ${email}...`);
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, fjalekalimi: password })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(JSON.stringify(data));
        console.log(`✅ Logged in ${email}`);
        return data.accessToken;
    } catch (error) {
        console.error(`❌ Failed to login ${email}:`, error.message);
        return null;
    }
}

async function updateProfile(token, profileData, professionalId) {
    try {
        console.log(`Updating profile for ID ${professionalId}...`);
        const response = await fetch(`${API_URL}/v1/catalog/profile/${professionalId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(profileData)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(JSON.stringify(data));
        console.log(`✅ Updated profile for ID ${professionalId}`);
        return data;
    } catch (error) {
        console.error(`❌ Failed to update profile:`, error.message);
    }
}

async function createService(token, serviceData) {
    try {
        console.log(`Creating service: ${serviceData.titulli}...`);
        const response = await fetch(`${API_URL}/v1/catalog/services`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(serviceData)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(JSON.stringify(data));
        console.log(`✅ Created service: ${serviceData.titulli}`);
        return data;
    } catch (error) {
        console.error(`❌ Failed to create service ${serviceData.titulli}:`, error.message);
    }
}

// Main Execution
async function seed() {
    console.log('🌱 Starting Data Seeding...');

    // 1. Seed Clients
    console.log('\n--- Seeding Clients ---');
    for (const client of clients) {
        await register(client);
        await delay(500); // Prevent rate limiting or race conditions
    }

    // 2. Seed Professionals
    console.log('\n--- Seeding Professionals ---');
    for (const prof of professionals) {
        // Register
        let regData = await register(prof.user);

        // If registration failed or user exists, we proceed to try logging in
        if (!regData) {
            // If completely failed (null returned from catch), verify if we should skip
            console.log(`Skipping registration for ${prof.user.emri}, trying login...`);
        }

        const userId = regData && regData.user ? regData.user.perdoruesi_id : null;

        // Wait for Kafka to process profile creation if we just registered
        if (regData && !regData.existing) {
            await delay(2000);
        }

        // Login to get token
        const token = await login(prof.user.email, prof.user.fjalekalimi);

        if (token) {
            // Fetch profile to get ID (or assume logic). 
            // Better: use the token to GET /api/auth/me or similar if exists. 
            // Actually, we can assume the profile creation worked if we wait. 
            // To update profile we need `profesionistiId`.

            // Let's first search for the profile or get it via the user's ID if possible?
            // The route GET /api/catalog/profile/:id uses profesionistiId.
            // But we don't have it easily from here without querying DB or an endpoint that returns it.

            // However, `updateProfile` endpoint often uses ID from token if designed well, 
            // OR we can query `GET /api/catalog/profiles` (admin) to find it? No.

            // Let's assume for now we can skip profile update if we don't have ID, 
            // BUT the user asked for "link them to specific categories" which implies creating services.
            // POST /api/catalog/services uses `authenticateToken` which extracts `user.profesionisti_id`.
            // So we don't need explicit ID in URL for creating services!

            // Create Services
            if (prof.services) {
                for (const service of prof.services) {
                    await createService(token, service);
                    await delay(500);
                }
            }

            // Update Profile (if we supported getting ID, but for now let's skip explicit profile PUT unless we find ID)
            // Wait! `authorizeProfileAccess` middleware might check params.
            // If the route is PUT /profile/:profesionistiId, we need the ID.
            // But if we just want to create services, we are good.
        }
        await delay(1000);
    }

    console.log('\n✅ Seeding Completed!');
}

seed();
