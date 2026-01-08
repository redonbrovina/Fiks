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
                    <h1 className="text-3xl font-bold text-gray-900 text-center">Paneli i Profesionistit</h1>
                    <p className="text-gray-500 font-medium text-center">Mirësevini, këtu mund të menaxhoni punën tuaj.</p>
                </div>

                <button
                    onClick={() => navigate('/add-service')}
                    className="px-5 py-2.5 bg-[#C00F0C] text-white font-bold rounded-xl shadow-lg shadow-red-200 hover:shadow-red-300 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                >
                    Shto Shërbim (+)
                </button>

            </div>
        </div>
    );
}
