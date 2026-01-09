import React, { useState, useEffect } from 'react';
import UserTable from '../../../components/UserTable';
import { bookingApi, catalogApi, tokenStorage } from '../../../services/api';

export default function Marketplace() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPro, setSelectedPro] = useState(null);
    const [desc, setDesc] = useState('');
    const [msg, setMsg] = useState('');
    const [services, setServices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('Të Gjitha');
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [loading, setLoading] = useState(true);

    // Column definitions
    const marketColumns = [
        { key: 'emri', label: 'Profesionisti', render: (val) => <span className="font-bold text-gray-900">{val}</span> },
        { key: 'titulli', label: 'Shërbimi' },
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

    useEffect(() => {
        fetchServices();
        fetchCategories();
    }, []);

    const fetchServices = async () => {
        try {
            setLoading(true);
            const data = await catalogApi.getAllServices();
            setServices(data);
        } catch (error) {
            console.error('Failed to fetch services:', error);
            // Fallback to mock data if API fails
            setServices([
                { id: 1, emri: 'Artan Limani', titulli: 'Instalime Ujësjellësi', qyteti: 'Prishtinë', rating: 4.8, cmimi: '€20/ora', kategoria_id: 3 },
                { id: 2, emri: 'Teuta Krasniqi', titulli: 'Pastrim Shtëpie', qyteti: 'Fushë Kosovë', rating: 4.9, cmimi: '€15/ora', kategoria_id: 1 },
                { id: 3, emri: 'Bekim Shalaj', titulli: 'Rregullim Mobiljesh', qyteti: 'Prizren', rating: 4.5, cmimi: '€25/ora', kategoria_id: 2 },
                { id: 4, emri: 'Vlora Gashi', titulli: 'Kujdestari Fëmijësh', qyteti: 'Prishtinë', rating: 5.0, cmimi: '€10/ora', kategoria_id: 4 },
                { id: 5, emri: 'Dren Maloku', titulli: 'Moler', qyteti: 'Ferizaj', rating: 4.7, cmimi: '€18/m2', kategoria_id: 2 },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const data = await catalogApi.getCategories();
            setCategories(data);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const handleBook = (service) => {
        setSelectedPro(service);
        setDesc(`Booking for ${service.titulli}`);
        setIsModalOpen(true);
    };

    const submitBooking = async (e) => {
        e.preventDefault();
        try {
            const user = tokenStorage.getUser();
            if (!user) {
                alert('Please login first');
                return;
            }

            await bookingApi.createWorkRequest({
                pershkrimi: desc,
                mesazhi: msg,
                profesionisti_id: selectedPro.profesionisti_id,
                perdoruesi_id: user.perdoruesi_id,
                kategoria_id: selectedPro.kategoria_id
            });

            alert('Booking request sent successfully!');
            setIsModalOpen(false);
            setDesc('');
            setMsg('');
        } catch (error) {
            console.error(error);
            alert('Failed to send booking: ' + (error.data?.error?.message || error.message));
        }
    };

    const filteredServices = selectedCategory === 'Të Gjitha' 
        ? services 
        : services.filter(service => {
            const category = categories.find(cat => cat.kategoria_id === service.kategoria_id);
            return category && category.lloji_kategorise === selectedCategory;
        });

    const allCategoryNames = ['Të Gjitha', ...categories.map(cat => cat.lloji_kategorise)];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Marketi i Shërbimeve</h1>
                    <p className="text-gray-500 font-medium">Gjeni profesionistët më të mirë për nevojat tuaja.</p>
                </div>

                {/* Category Filters */}
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 relative">
                    {/* Main category buttons */}
                    {['Të Gjitha', 'Pastrim', 'Riparim', 'Instalime', 'Kujdes Personal'].map((cat, idx) => (
                        <button
                            key={idx}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${selectedCategory === cat
                                ? 'bg-[#C00F0C] text-white shadow-lg shadow-red-200'
                                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                    
                    {/* All Categories Dropdown Button */}
                    <div className="relative">
                        <button
                            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                            className="px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all bg-gradient-to-r from-[#C00F0C] to-[#8B0000] text-white shadow-lg shadow-red-200 hover:shadow-red-300 hover:scale-[1.02]"
                        >
                            Të Gjitha Kategoritë ▼
                        </button>
                        
                        {/* Dropdown Menu */}
                        {showCategoryDropdown && (
                            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-80 overflow-y-auto">
                                <div className="p-2">
                                    {allCategoryNames.map((cat, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                setSelectedCategory(cat);
                                                setShowCategoryDropdown(false);
                                            }}
                                            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all hover:bg-gray-50 ${selectedCategory === cat
                                                ? 'bg-[#C00F0C]/10 text-[#C00F0C] font-bold'
                                                : 'text-gray-700'
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Current Category Display */}
            {selectedCategory !== 'Të Gjitha' && (
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Filtruar sipas:</span>
                    <span className="px-3 py-1 bg-[#C00F0C]/10 text-[#C00F0C] text-sm font-bold rounded-full">
                        {selectedCategory}
                    </span>
                    <button
                        onClick={() => setSelectedCategory('Të Gjitha')}
                        className="text-sm text-gray-500 hover:text-gray-700"
                    >
                        Pastro filtrin
                    </button>
                </div>
            )}

            {/* Marketplace Table */}
            <UserTable
                columns={marketColumns}
                data={filteredServices}
                loading={loading}
                actions={(service) => (
                    <button
                        onClick={() => handleBook(service)}
                        className="px-4 py-2 bg-[#C00F0C] text-white text-sm font-bold rounded-lg hover:bg-[#a00d0a] transition-colors duration-200"
                    >
                        Rezervo
                    </button>
                )}
            />

            {/* Booking Modal */}
            {isModalOpen && selectedPro && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
                        <h3 className="text-2xl font-bold mb-6">Rezervo Shërbim</h3>
                        
                        <div className="mb-6">
                            <p className="text-sm text-gray-600 mb-2">Profesionisti:</p>
                            <p className="font-bold text-lg">{selectedPro.emri}</p>
                            <p className="text-gray-700">{selectedPro.titulli}</p>
                        </div>

                        <form onSubmit={submitBooking} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Përshkrimi
                                </label>
                                <textarea
                                    value={desc}
                                    onChange={(e) => setDesc(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C00F0C] focus:border-transparent"
                                    rows={3}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mesazh Shtesë
                                </label>
                                <textarea
                                    value={msg}
                                    onChange={(e) => setMsg(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C00F0C] focus:border-transparent"
                                    rows={3}
                                    placeholder="Opsionale: Shtoni detaje shtesë..."
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3 bg-[#C00F0C] text-white font-bold rounded-lg hover:bg-[#a00d0a] transition-colors duration-200"
                                >
                                    Dërgo Kërkesën
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition-colors duration-200"
                                >
                                    Anulo
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
