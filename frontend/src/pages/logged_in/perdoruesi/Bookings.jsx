import React, { useState, useEffect } from 'react';
import { bookingApi } from '../../../services/api';
import { tokenStorage } from '../../../services/api';

export default function Bookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // New Request Form State
    const [showForm, setShowForm] = useState(false);
    const [desc, setDesc] = useState('');
    const [msg, setMsg] = useState('');

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const data = await bookingApi.getAllWorkRequests();
            // Filter locally for now effectively showing only my requests if backend returned all
            // In a real scenario, backend should filter by user from token
            const user = tokenStorage.getUser();
            const myBookings = data.filter(b => b.perdoruesi_id === user?.id);
            setBookings(myBookings.length > 0 ? myBookings : data); // Fallback to all if filtering fails/no user (for demo)
        } catch (err) {
            setError('Failed to fetch bookings');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateRequest = async (e) => {
        e.preventDefault();
        try {
            const user = tokenStorage.getUser();
            if (!user) {
                alert('User not found in storage. Please login again.');
                return;
            }

            await bookingApi.createWorkRequest({
                pershkrimi: desc,
                mesazhi: msg,
                perdoruesi_id: user.perdoruesi_id,
                kategoria_id: null, // Set to null to avoid FK error with dummy ID
                profesionisti_id: null // Open request
            });

            await fetchBookings();
            setShowForm(false);
            setDesc('');
            setMsg('');
        } catch (err) {
            alert('Error creating request: ' + err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this widget?')) return;
        try {
            await bookingApi.deleteWorkRequest(id);
            setBookings(bookings.filter(b => b.kerkesa_punes_id !== id));
        } catch (err) {
            alert('Failed to delete: ' + err.message);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">My Bookings</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    {showForm ? 'Cancel' : 'New Request'}
                </button>
            </div>

            {showForm && (
                <div className="bg-[#2a2a2a] p-6 rounded-xl border border-white/10 animate-in fade-in slide-in-from-top-4">
                    <h2 className="text-xl font-semibold text-white mb-4">Create New Request</h2>
                    <form onSubmit={handleCreateRequest} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                            <input
                                type="text"
                                value={desc}
                                onChange={e => setDesc(e.target.value)}
                                className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-indigo-500"
                                placeholder="I need a plumber..."
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Message</label>
                            <textarea
                                value={msg}
                                onChange={e => setMsg(e.target.value)}
                                className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-indigo-500 h-24"
                                placeholder="Details about the problem..."
                                required
                            />
                        </div>
                        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg">
                            Submit Request
                        </button>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="text-center text-gray-400">Loading bookings...</div>
            ) : error ? (
                <div className="text-center text-red-500">{error}</div>
            ) : bookings.length === 0 ? (
                <div className="text-center text-gray-500 py-10">
                    No bookings found. Create one to get started!
                </div>
            ) : (
                <div className="grid gap-4">
                    {bookings.map(booking => (
                        <div key={booking.kerkesa_punes_id} className="bg-[#2a2a2a] p-5 rounded-xl border border-white/5 hover:border-white/10 transition-colors flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-semibold text-white">{booking.pershkrimi}</h3>
                                <p className="text-gray-400 mt-1">{booking.mesazhi}</p>
                                <div className="mt-3 flex gap-2">
                                    <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded-full">
                                        Status: {booking.statusi?.emri || 'Pending'}
                                    </span>
                                    <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full">
                                        {new Date(booking.koha_krijimit).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDelete(booking.kerkesa_punes_id)}
                                className="text-red-400 hover:text-red-300 p-2"
                                title="Delete Request"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}