import AdminTable from '../../../components/AdminTable';

// Static mock data for professionals
const mockProfessionals = [
    { id: 1, emri: 'Faton Haliti', email: 'faton@email.com', telefon: '+383 44 111 222', sherbimi: 'Elektricist', qyteti: 'Prishtinë', rating: 4.8 },
    { id: 2, emri: 'Shpend Kelmendi', email: 'shpend@email.com', telefon: '+383 45 222 333', sherbimi: 'Hidraulik', qyteti: 'Prizren', rating: 4.5 },
    { id: 3, emri: 'Besnik Osmani', email: 'besnik@email.com', telefon: '+383 44 333 444', sherbimi: 'Pastrues', qyteti: 'Ferizaj', rating: 4.9 },
    { id: 4, emri: 'Valon Berisha', email: 'valon@email.com', telefon: '+383 49 444 555', sherbimi: 'Programer', qyteti: 'Gjakovë', rating: 5.0 },
    { id: 5, emri: 'Granit Dedaj', email: 'granit@email.com', telefon: '+383 44 555 666', sherbimi: 'Marangoz', qyteti: 'Pejë', rating: 4.2 },
    { id: 6, emri: 'Leart Ismajli', email: 'leart@email.com', telefon: '+383 45 666 777', sherbimi: 'Llogaritar', qyteti: 'Mitrovicë', rating: 4.7 },
];

// Column definitions for the table
const professionalColumns = [
    { key: 'id', label: 'ID' },
    { key: 'emri', label: 'Emri' },
    { key: 'email', label: 'Email' },
    { key: 'telefon', label: 'Telefoni' },
    { key: 'sherbimi', label: 'Shërbimi' },
    { key: 'qyteti', label: 'Qyteti' },
    {
        key: 'rating',
        label: 'Vlerësimi',
        render: (value) => (
            <div className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-white font-medium">{value.toFixed(1)}</span>
            </div>
        )
    },
];

export default function ProfessionalsManagement() {
    const handleEdit = (professional) => {
        console.log('Edit professional:', professional);
        // TODO: Open edit modal
    };

    const handleDelete = (professional) => {
        console.log('Delete professional:', professional);
        // TODO: Show confirmation modal and delete
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Menaxhimi i Profesionistëve</h1>
                    <p className="text-white/60 font-medium">Shiko dhe menaxho të gjithë profesionistët e regjistruar.</p>
                </div>
                <button className="px-6 py-3 bg-[#C00F0C] text-white font-bold rounded-2xl shadow-xl shadow-red-900/30 hover:shadow-red-900/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Shto Profesionist
                </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#3a3a3a] rounded-2xl p-4 border border-white/5">
                    <p className="text-2xl font-bold text-[#C00F0C]">{mockProfessionals.length}</p>
                    <p className="text-xs text-white/40 font-medium">Total Profesionistë</p>
                </div>
                <div className="bg-[#3a3a3a] rounded-2xl p-4 border border-white/5">
                    <p className="text-2xl font-bold text-green-500">4</p>
                    <p className="text-xs text-white/40 font-medium">Aktivë Sot</p>
                </div>
                <div className="bg-[#3a3a3a] rounded-2xl p-4 border border-white/5">
                    <div className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <p className="text-2xl font-bold text-white">4.7</p>
                    </div>
                    <p className="text-xs text-white/40 font-medium">Mesatarja e Vlerësimit</p>
                </div>
                <div className="bg-[#3a3a3a] rounded-2xl p-4 border border-white/5">
                    <p className="text-2xl font-bold text-yellow-500">1</p>
                    <p className="text-xs text-white/40 font-medium">Në Pritje Verifikimi</p>
                </div>
            </div>

            {/* Table */}
            <AdminTable
                columns={professionalColumns}
                data={mockProfessionals}
                onEdit={handleEdit}
                onDelete={handleDelete}
                searchPlaceholder="Kërko profesionistë..."
            />
        </div>
    );
}
