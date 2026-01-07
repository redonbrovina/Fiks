import AdminTable from '../../../components/AdminTable';

// Static mock data for users
const mockUsers = [
    { id: 1, emri: 'Arben Krasniqi', email: 'arben@email.com', telefon: '+383 44 123 456', qyteti: 'Prishtinë', dataRegjistrimit: '2024-12-15' },
    { id: 2, emri: 'Fjolla Berisha', email: 'fjolla@email.com', telefon: '+383 45 234 567', qyteti: 'Prizren', dataRegjistrimit: '2024-12-20' },
    { id: 3, emri: 'Driton Gashi', email: 'driton@email.com', telefon: '+383 44 345 678', qyteti: 'Ferizaj', dataRegjistrimit: '2025-01-02' },
    { id: 4, emri: 'Lindita Hoxha', email: 'lindita@email.com', telefon: '+383 49 456 789', qyteti: 'Gjakovë', dataRegjistrimit: '2025-01-05' },
    { id: 5, emri: 'Besart Morina', email: 'besart@email.com', telefon: '+383 44 567 890', qyteti: 'Pejë', dataRegjistrimit: '2025-01-06' },
    { id: 6, emri: 'Elvana Rexha', email: 'elvana@email.com', telefon: '+383 45 678 901', qyteti: 'Mitrovicë', dataRegjistrimit: '2025-01-07' },
];

// Column definitions for the table
const userColumns = [
    { key: 'id', label: 'ID' },
    { key: 'emri', label: 'Emri' },
    { key: 'email', label: 'Email' },
    { key: 'telefon', label: 'Telefoni' },
    { key: 'qyteti', label: 'Qyteti' },
    {
        key: 'dataRegjistrimit',
        label: 'Data Regjistrimit',
        render: (value) => new Date(value).toLocaleDateString('sq-AL')
    },
];

export default function UserManagement() {
    const handleEdit = (user) => {
        console.log('Edit user:', user);
        // TODO: Open edit modal
    };

    const handleDelete = (user) => {
        console.log('Delete user:', user);
        // TODO: Show confirmation modal and delete
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Menaxhimi i Përdoruesve</h1>
                    <p className="text-white/60 font-medium">Shiko dhe menaxho të gjithë përdoruesit e regjistruar.</p>
                </div>
                <button className="px-6 py-3 bg-[#C00F0C] text-white font-bold rounded-2xl shadow-xl shadow-red-900/30 hover:shadow-red-900/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Shto Përdorues
                </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#3a3a3a] rounded-2xl p-4 border border-white/5">
                    <p className="text-2xl font-bold text-[#C00F0C]">{mockUsers.length}</p>
                    <p className="text-xs text-white/40 font-medium">Total Përdorues</p>
                </div>
                <div className="bg-[#3a3a3a] rounded-2xl p-4 border border-white/5">
                    <p className="text-2xl font-bold text-green-500">5</p>
                    <p className="text-xs text-white/40 font-medium">Aktivë Sot</p>
                </div>
                <div className="bg-[#3a3a3a] rounded-2xl p-4 border border-white/5">
                    <p className="text-2xl font-bold text-white">2</p>
                    <p className="text-xs text-white/40 font-medium">Të Rinj Këtë Javë</p>
                </div>
                <div className="bg-[#3a3a3a] rounded-2xl p-4 border border-white/5">
                    <p className="text-2xl font-bold text-yellow-500">0</p>
                    <p className="text-xs text-white/40 font-medium">Në Pritje</p>
                </div>
            </div>

            {/* Table */}
            <AdminTable
                columns={userColumns}
                data={mockUsers}
                onEdit={handleEdit}
                onDelete={handleDelete}
                searchPlaceholder="Kërko përdorues..."
            />
        </div>
    );
}
