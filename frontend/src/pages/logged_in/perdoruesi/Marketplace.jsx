import UserTable from '../../../components/UserTable';

// Static mock data for services/professionals
const professionals = [
    { id: 1, emri: 'Artan Limani', sherbimi: 'Instalime Ujësjellësi', qyteti: 'Prishtinë', rating: 4.8, cmimi: '€20/ora' },
    { id: 2, emri: 'Teuta Krasniqi', sherbimi: 'Pastrim Shtëpie', qyteti: 'Fushë Kosovë', rating: 4.9, cmimi: '€15/ora' },
    { id: 3, emri: 'Bekim Shalaj', sherbimi: 'Rregullim Mobiljesh', qyteti: 'Prizren', rating: 4.5, cmimi: '€25/ora' },
    { id: 4, emri: 'Vlora Gashi', sherbimi: 'Kujdestari Fëmijësh', qyteti: 'Prishtinë', rating: 5.0, cmimi: '€10/ora' },
    { id: 5, emri: 'Dren Maloku', sherbimi: 'Moler', qyteti: 'Ferizaj', rating: 4.7, cmimi: '€18/m2' },
];

// Column definitions
const marketColumns = [
    { key: 'emri', label: 'Profesionisti', render: (val) => <span className="font-bold text-gray-900">{val}</span> },
    { key: 'sherbimi', label: 'Shërbimi' },
    { key: 'qyteti', label: 'Qyteti' },
    {
        key: 'rating',
        label: 'Vlerësimi',
        render: (val) => (
            <div className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="font-bold text-gray-700">{val}</span>
            </div>
        )
    },
    { key: 'cmimi', label: 'Tarifa', render: (val) => <span className="font-bold text-[#C00F0C]">{val}</span> },
];

export default function Marketplace() {
    const handleBook = (pro) => {
        console.log('Book professional:', pro);
        // TODO: Open booking modal
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Marketi i Shërbimeve</h1>
                    <p className="text-gray-500 font-medium">Gjeni profesionistët më të mirë për nevojat tuaja.</p>
                </div>

                {/* Filters (Mock) */}
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                    {['Të Gjitha', 'Elektricist', 'Hidraulik', 'Pastrim', 'Ndërtim'].map((cat, idx) => (
                        <button
                            key={idx}
                            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${idx === 0
                                ? 'bg-[#C00F0C] text-white shadow-lg shadow-red-200'
                                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Marketplace Table */}
            <UserTable
                columns={marketColumns}
                data={professionals}
                onAction={handleBook}
                actionLabel="Rezervo"
                searchPlaceholder="Kërko shërbime ose profesionistë..."
            />
        </div>
    );
}
