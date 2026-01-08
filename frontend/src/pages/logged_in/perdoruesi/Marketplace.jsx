import React, { useState } from 'react';
import UserTable from '../../../components/UserTable';
import { bookingApi, tokenStorage } from '../../../services/api';

// Static mock data for services/professionals
const professionals = [
];

// Column definitions
const marketColumns = [
];

export default function Marketplace() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPro, setSelectedPro] = useState(null);
    const [desc, setDesc] = useState('');
    const [msg, setMsg] = useState('');

    const handleBook = (pro) => {
        setSelectedPro(pro);
        setDesc(`Booking for ${pro.sherbimi}`);
        setIsModalOpen(true);
    };

    const submitBooking = async (e) => {
        e.preventDefault();
        try {
            const user = tokenStorage.getUser();
            console.log('👤 Current User from TokenStorage:', user);
            if (!user) {
                alert('Please login first');
                return;
            }

            await bookingApi.createWorkRequest({
                pershkrimi: desc,
                mesazhi: msg,
                profesionisti_id: selectedPro.id,
                perdoruesi_id: user.perdoruesi_id,
                kategoria_id: null // Set to null to avoid FK issues
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

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 text-center">Marketi i Shërbimeve</h1>
                    <p className="text-gray-500 font-medium text-center">Gjeni profesionistët më të mirë për nevojat tuaja.</p>
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

            {/* Booking Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Rezervo {selectedPro?.emri}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={submitBooking} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Përshkrimi</label>
                                <input
                                    type="text"
                                    value={desc}
                                    onChange={e => setDesc(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C00F0C] focus:border-[#C00F0C]"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mesazhi / Detajet</label>
                                <textarea
                                    value={msg}
                                    onChange={e => setMsg(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C00F0C] focus:border-[#C00F0C] h-32"
                                    placeholder="Pershëndetje, dua të rezervoj..."
                                    required
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50"
                                >
                                    Anulo
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-[#C00F0C] text-white font-bold rounded-xl hover:bg-[#a50d0a] shadow-lg shadow-red-200"
                                >
                                    Konfirmo
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
