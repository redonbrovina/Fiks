import { useNavigate } from 'react-router-dom';
import UserTable from '../../../components/UserTable';

// Static mock data for active jobs
const activeJobs = [
    { id: 1, klienti: 'Agon Rama', sherbimi: 'Rregullim Elektrik', data: '2024-01-15', status: 'Në Proces', cmimi: '€45.00' },
    { id: 2, klienti: 'Borta Hoti', sherbimi: 'Instalim Priza', data: '2024-01-18', status: 'E Konfirmuar', cmimi: '€30.00' },
    { id: 3, klienti: 'Liridon Gashi', sherbimi: 'Kontrollim Siguresash', data: '2024-01-20', status: 'Në Pritje', cmimi: '€25.00' },
];

// Column definitions for active jobs
const jobColumns = [
    { key: 'klienti', label: 'Klienti' },
    { key: 'sherbimi', label: 'Shërbimi' },
    { key: 'data', label: 'Data', render: (val) => new Date(val).toLocaleDateString('sq-AL') },
    {
        key: 'status',
        label: 'Statusi',
        render: (val) => {
            const colors = {
                'Në Proces': 'bg-blue-100 text-blue-700',
                'E Konfirmuar': 'bg-green-100 text-green-700',
                'Në Pritje': 'bg-yellow-100 text-yellow-700',
            };
            return (
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${colors[val] || 'bg-gray-100 text-gray-700'}`}>
                    {val}
                </span>
            );
        }
    },
    { key: 'cmimi', label: 'Çmimi', render: (val) => <span className="font-bold text-[#C00F0C]">{val}</span> },
];

export default function ProfessionalDashboard() {
    const navigate = useNavigate();

    // DEBUG: Verify component update
    console.log("Professional Dashboard Loaded - Version 2");

    const handleJobAction = (job) => {
        console.log('Action on job:', job);
        // TODO: Open detailed view or edit modal
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Paneli i Profesionistit</h1>
                    <p className="text-gray-500 font-medium">Mirësevini, këtu mund të menaxhoni punën tuaj.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl shadow-sm hover:bg-gray-50 transition-all duration-300">
                        Ndrysho Disponueshmërinë
                    </button>
                    <button
                        onClick={() => navigate('/add-service')}
                        className="px-5 py-2.5 bg-[#C00F0C] text-white font-bold rounded-xl shadow-lg shadow-red-200 hover:shadow-red-300 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                    >
                        Shto Shërbim (+)
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-gray-200/50 border border-gray-100">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-400">Punë Aktive</p>
                            <h3 className="text-2xl font-black text-gray-800">3</h3>
                        </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '70%' }}></div>
                    </div>
                </div>

                <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-gray-200/50 border border-gray-100">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-green-50 text-green-600 rounded-2xl">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-400">Fitimet (Muaji Fundit)</p>
                            <h3 className="text-2xl font-black text-gray-800">€450.00</h3>
                        </div>
                    </div>
                    <p className="text-xs font-bold text-green-600 bg-green-50 inline-block px-2 py-1 rounded-lg">
                        +12% nga muaji i kaluar
                    </p>
                </div>

                <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-gray-200/50 border border-gray-100">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-yellow-50 text-yellow-600 rounded-2xl">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-400">Vlerësimi Mesatar</p>
                            <h3 className="text-2xl font-black text-gray-800">4.9</h3>
                        </div>
                    </div>
                    <p className="text-xs font-bold text-gray-400">
                        Bazuar në <span className="text-gray-800">24 rishikime</span>
                    </p>
                </div>
            </div>

            {/* Active Jobs Table */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Punët e Fundit</h2>
                <UserTable
                    columns={jobColumns}
                    data={activeJobs}
                    onAction={handleJobAction}
                    actionLabel="Detajet"
                    searchPlaceholder="Kërko punë..."
                />
            </div>
        </div>
    );
}
