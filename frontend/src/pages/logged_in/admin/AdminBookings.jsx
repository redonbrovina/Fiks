import React, { useState, useEffect } from 'react';
import { bookingApi } from '../../../services/api';

export default function AdminBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const data = await bookingApi.getAllWorkRequests();
            setBookings(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Admin: Delete this request?')) return;
        try {
            await bookingApi.deleteWorkRequest(id);
            setBookings(bookings.filter(b => b.kerkesa_punes_id !== id));
        } catch (err) {
            alert('Failed to delete: ' + err.message);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">All Bookings (Admin)</h1>

            <div className="bg-[#3a3a3a] rounded-[2.5rem] p-8 shadow-lg border border-white/5">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-gray-300">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="pb-4 font-semibold">ID</th>
                                <th className="pb-4 font-semibold">Description</th>
                                <th className="pb-4 font-semibold">User ID</th>
                                <th className="pb-4 font-semibold">Status</th>
                                <th className="pb-4 font-semibold">Date</th>
                                <th className="pb-4 font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {bookings.map(booking => (
                                <tr key={booking.kerkesa_punes_id} className="hover:bg-white/5 transition-colors">
                                    <td className="py-4 font-mono text-sm opacity-60">#{booking.kerkesa_punes_id}</td>
                                    <td className="py-4">
                                        <div className="font-medium text-white">{booking.pershkrimi}</div>
                                        <div className="text-sm opacity-60 truncate max-w-xs">{booking.mesazhi}</div>
                                    </td>
                                    <td className="py-4 font-mono text-xs">{booking.perdoruesi_id}</td>
                                    <td className="py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs ${booking.statusi?.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-300' :
                                                booking.statusi?.status === 'Accepted' ? 'bg-green-500/20 text-green-300' :
                                                    'bg-gray-500/20 text-gray-300'
                                            }`}>
                                            {booking.statusi?.status || 'Unknown'}
                                        </span>
                                    </td>
                                    <td className="py-4 text-sm">{new Date(booking.koha_krijimit).toLocaleDateString()}</td>
                                    <td className="py-4">
                                        <button
                                            onClick={() => handleDelete(booking.kerkesa_punes_id)}
                                            className="text-red-400 hover:text-red-300 text-sm font-medium"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {bookings.length === 0 && !loading && (
                        <div className="text-center py-8 text-gray-500">No bookings found.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
