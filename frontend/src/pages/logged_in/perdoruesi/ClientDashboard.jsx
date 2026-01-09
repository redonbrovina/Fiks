import React, { useState, useEffect } from 'react';
import { bookingApi, tokenStorage } from '../../../services/api';
import { useNavigate } from 'react-router-dom';

export default function ClientDashboard() {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [workRequests, setWorkRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        totalAppointments: 0,
        upcomingAppointments: 0,
        pendingRequests: 0,
        confirmedAppointments: 0
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);
            const user = tokenStorage.getUser();
            if (!user) {
                setError('Ju lutem identifikohuni');
                setLoading(false);
                return;
            }

            // Ensure user has perdoruesi_id
            if (!user.perdoruesi_id) {
                console.error('User object missing perdoruesi_id:', user);
                setError('Të dhënat e përdoruesit nuk janë të plota. Ju lutem identifikohuni përsëri.');
                setLoading(false);
                return;
            }

            // Initialize with empty arrays in case of errors
            let apps = [];
            let requests = [];

            try {
                // Fetch appointments - handle empty response or errors gracefully
                const appointmentsResponse = await bookingApi.getAllAppointments({ perdoruesi_id: user.perdoruesi_id });
                apps = Array.isArray(appointmentsResponse) ? appointmentsResponse : [];
                console.log('Fetched appointments:', apps.length);
            } catch (aptErr) {
                // Log but don't show error if it's a 404 or empty response
                if (aptErr.status === 404 || aptErr.status === 200) {
                    console.log('No appointments found (this is normal for new users)');
                    apps = [];
                } else {
                    console.warn('Error fetching appointments (continuing anyway):', aptErr);
                    apps = [];
                }
            }

            try {
                // Fetch work requests - handle empty response or errors gracefully
                const requestsResponse = await bookingApi.getWorkRequestsByUser(user.perdoruesi_id);
                requests = Array.isArray(requestsResponse) ? requestsResponse : [];
                console.log('Fetched work requests:', requests.length);
            } catch (reqErr) {
                // Log but don't show error if it's a 404 or empty response
                if (reqErr.status === 404 || reqErr.status === 200) {
                    console.log('No work requests found (this is normal for new users)');
                    requests = [];
                } else {
                    console.warn('Error fetching work requests (continuing anyway):', reqErr);
                    requests = [];
                }
            }

            setAppointments(apps);
            setWorkRequests(requests);

            // Calculate stats - handle empty data gracefully
            const now = new Date();
            const upcoming = apps.filter(apt => {
                try {
                    if (!apt || !apt.koha_fillimit) return false;
                    const aptDate = new Date(apt.koha_fillimit);
                    return aptDate > now && !isNaN(aptDate.getTime());
                } catch {
                    return false;
                }
            });
            
            const confirmed = apps.filter(apt => 
                apt?.kerkesaPunes?.statusi?.status === 'Confirmed'
            );
            
            const pending = requests.filter(req => 
                req?.statusi?.status === 'Pending' || !req?.statusi?.status
            );

            setStats({
                totalAppointments: apps.length || 0,
                upcomingAppointments: upcoming.length || 0,
                pendingRequests: pending.length || 0,
                confirmedAppointments: confirmed.length || 0
            });
        } catch (err) {
            console.error('Unexpected error fetching dashboard data:', err);
            // Only show error if it's a serious issue (not 404 or network issue that we already handled)
            // Most errors should already be caught in the individual try-catch blocks above
            const errorMessage = err?.data?.error?.message || err?.message || 'Unknown error';
            console.error('Detailed error:', errorMessage, err.status);
            
            // Only show error message for unexpected errors (not handled above)
            if (err.status && err.status !== 404) {
                setError('Dështoi ngarkimi i të dhënave. Ju lutem provoni përsëri.');
            } else {
                // For 404 or network issues, just show empty state
                setError(null);
            }
            
            // Set empty arrays so UI doesn't break
            setAppointments([]);
            setWorkRequests([]);
            setStats({
                totalAppointments: 0,
                upcomingAppointments: 0,
                pendingRequests: 0,
                confirmedAppointments: 0
            });
        } finally {
            setLoading(false);
        }
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString('sq-AL', { 
                weekday: 'short', 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            }),
            time: date.toLocaleTimeString('sq-AL', { hour: '2-digit', minute: '2-digit' })
        };
    };

    if (loading) {
        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center py-10 text-gray-500">Duke ngarkuar...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center py-10 text-red-500">{error}</div>
            </div>
        );
    }

    const upcomingAppointments = appointments.filter(apt => {
        if (!apt.koha_fillimit) return false;
        return new Date(apt.koha_fillimit) > new Date();
    }).slice(0, 5);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 text-center">Paneli i Klientit</h1>
                    <p className="text-gray-500 font-medium text-center">Mirësevini në panelin tuaj të kontrollit.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate('/marketplace')}
                        className="px-5 py-2.5 bg-[#C00F0C] text-white font-bold rounded-xl shadow-lg shadow-red-200 hover:shadow-red-300 hover:scale-[1.02] transition-all duration-300"
                    >
                        Shfaq Shërbimet
                    </button>
                    <button
                        onClick={() => navigate('/bookings')}
                        className="px-5 py-2.5 bg-gray-700 text-white font-bold rounded-xl hover:bg-gray-600 hover:scale-[1.02] transition-all duration-300"
                    >
                        Rezervimet
                    </button>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 font-medium">Total Rezervime</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalAppointments}</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 font-medium">Terminet e Ardhshme</p>
                            <p className="text-2xl font-bold text-green-600 mt-1">{stats.upcomingAppointments}</p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-lg">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 font-medium">Kërkesa në Pritje</p>
                            <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pendingRequests}</p>
                        </div>
                        <div className="p-3 bg-yellow-100 rounded-lg">
                            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 font-medium">Të Konfirmuara</p>
                            <p className="text-2xl font-bold text-[#C00F0C] mt-1">{stats.confirmedAppointments}</p>
                        </div>
                        <div className="p-3 bg-red-100 rounded-lg">
                            <svg className="w-6 h-6 text-[#C00F0C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Upcoming Appointments */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Terminet e Ardhshme</h2>
                {upcomingAppointments.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                        Nuk keni termine të ardhshme. <button onClick={() => navigate('/marketplace')} className="text-[#C00F0C] font-semibold hover:underline">Rezervoni një shërbim</button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {upcomingAppointments.map(appointment => {
                            const dateTime = formatDateTime(appointment.koha_fillimit);
                            return (
                                <div key={appointment.termini_id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {appointment.kerkesaPunes?.pershkrimi || 'Termin'}
                                            </h3>
                                            {appointment.kerkesaPunes?.mesazhi && (
                                                <p className="text-gray-600 mt-1 text-sm">{appointment.kerkesaPunes.mesazhi}</p>
                                            )}
                                            <div className="mt-3 flex flex-wrap gap-3 text-sm">
                                                <span className="flex items-center gap-2 text-gray-700">
                                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    {dateTime.date}
                                                </span>
                                                <span className="flex items-center gap-2 text-gray-700">
                                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    {dateTime.time}
                                                    {appointment.koha_mbarimit && (
                                                        <> - {formatDateTime(appointment.koha_mbarimit).time}</>
                                                    )}
                                                </span>
                                                {appointment.cmimi && (
                                                    <span className="text-[#C00F0C] font-bold">
                                                        €{parseFloat(appointment.cmimi).toFixed(2)}
                                                    </span>
                                                )}
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                    appointment.kerkesaPunes?.statusi?.status === 'Confirmed' 
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                    {appointment.kerkesaPunes?.statusi?.status || 'Pending'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
                {appointments.length > 5 && (
                    <div className="mt-4 text-center">
                        <button
                            onClick={() => navigate('/bookings')}
                            className="text-[#C00F0C] font-semibold hover:underline"
                        >
                            Shiko të gjitha rezervimet →
                        </button>
                    </div>
                )}
            </div>

            {/* Recent Requests */}
            {workRequests.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Kërkesat e Fundit</h2>
                    <div className="space-y-3">
                        {workRequests.slice(0, 3).map(request => (
                            <div key={request.kerkesa_punes_id} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{request.pershkrimi}</h3>
                                        <p className="text-sm text-gray-600 mt-1">{new Date(request.koha_krijimit).toLocaleDateString('sq-AL')}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                        request.statusi?.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                                        request.statusi?.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-gray-100 text-gray-700'
                                    }`}>
                                        {request.statusi?.status || 'Pending'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                    {workRequests.length > 3 && (
                        <div className="mt-4 text-center">
                            <button
                                onClick={() => navigate('/bookings')}
                                className="text-[#C00F0C] font-semibold hover:underline"
                            >
                                Shiko të gjitha kërkesat →
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
