import React, { useState, useEffect } from 'react';
import { bookingApi, feedbackApi } from '../../../services/api';
import { tokenStorage } from '../../../services/api';

export default function Bookings() {
    const [workRequests, setWorkRequests] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('appointments'); // 'appointments' or 'requests'

    // New Request Form State
    const [showForm, setShowForm] = useState(false);
    const [desc, setDesc] = useState('');
    const [msg, setMsg] = useState('');

    // Review Modal State
    const [reviewModal, setReviewModal] = useState(null); // { appointment, profesionisti_id }
    const [reviewScore, setReviewScore] = useState(5);
    const [reviewMessage, setReviewMessage] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);
    const [existingReviews, setExistingReviews] = useState({}); // termini_id -> review

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const user = tokenStorage.getUser();
            if (!user || !user.perdoruesi_id) {
                setError('Ju lutem identifikohuni');
                setLoading(false);
                return;
            }

            // Initialize with empty arrays
            let requests = [];
            let apps = [];

            // Fetch work requests - handle errors gracefully
            try {
                const requestsResponse = await bookingApi.getWorkRequestsByUser(user.perdoruesi_id);
                requests = Array.isArray(requestsResponse) ? requestsResponse : [];
                console.log('Fetched work requests:', requests.length);
            } catch (reqErr) {
                if (reqErr.status === 404 || reqErr.status === 200) {
                    console.log('No work requests found (this is normal)');
                    requests = [];
                } else {
                    console.warn('Error fetching work requests:', reqErr);
                    requests = [];
                }
            }

            // Fetch appointments - handle errors gracefully
            try {
                const appsResponse = await bookingApi.getAllAppointments({ perdoruesi_id: user.perdoruesi_id });
                apps = Array.isArray(appsResponse) ? appsResponse : [];
                console.log('Fetched appointments:', apps.length);
            } catch (aptErr) {
                if (aptErr.status === 404 || aptErr.status === 200) {
                    console.log('No appointments found (this is normal)');
                    apps = [];
                } else {
                    console.warn('Error fetching appointments:', aptErr);
                    apps = [];
                }
            }

            setWorkRequests(requests);
            setAppointments(apps);
        } catch (err) {
            console.error('Unexpected error fetching bookings:', err);
            const errorMessage = err?.data?.error?.message || err?.message || 'Unknown error';
            console.error('Detailed error:', errorMessage, err.status);

            // Only show error for serious issues
            if (err.status && err.status !== 404) {
                setError('Dështoi ngarkimi i rezervimeve. Ju lutem provoni përsëri.');
            } else {
                // For 404 or empty responses, just show empty state
                setError(null);
                setWorkRequests([]);
                setAppointments([]);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCreateRequest = async (e) => {
        e.preventDefault();
        try {
            const user = tokenStorage.getUser();
            if (!user) {
                alert('Ju lutem identifikohuni përsëri.');
                return;
            }

            await bookingApi.createWorkRequest({
                pershkrimi: desc,
                mesazhi: msg,
                perdoruesi_id: user.perdoruesi_id,
                kategoria_id: null,
                profesionisti_id: null // Open request
            });

            await fetchData();
            setShowForm(false);
            setDesc('');
            setMsg('');
        } catch (err) {
            alert('Dështoi krijimi i kërkesës: ' + (err.data?.error?.message || err.message));
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Jeni të sigurt që dëshironi të fshini këtë kërkesë?')) return;
        try {
            await bookingApi.deleteWorkRequest(id);
            setWorkRequests(workRequests.filter(b => b.kerkesa_punes_id !== id));
        } catch (err) {
            alert('Dështoi fshirja: ' + (err.data?.error?.message || err.message));
        }
    };

    // Open review modal
    const openReviewModal = (appointment) => {
        const profesionisti_id = appointment.kerkesaPunes?.profesionisti_id;
        if (!profesionisti_id) {
            alert('Nuk mund të lini vlerësim për këtë termin');
            return;
        }
        setReviewModal({ appointment, profesionisti_id });
        setReviewScore(5);
        setReviewMessage('');
    };

    // Submit review
    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!reviewModal) return;

        try {
            setSubmittingReview(true);
            const user = tokenStorage.getUser();

            await feedbackApi.createReview({
                score: parseInt(reviewScore),
                mesazhi: reviewMessage || null,
                profesionisti_id: reviewModal.profesionisti_id,
                perdoruesi_id: user.perdoruesi_id,
                termini_id: reviewModal.appointment.termini_id
            });

            // Update existing reviews cache
            setExistingReviews(prev => ({
                ...prev,
                [reviewModal.appointment.termini_id]: true
            }));

            alert('Faleminderit për vlerësimin tuaj!');
            setReviewModal(null);
        } catch (err) {
            const errorMsg = err?.data?.error?.message || err?.message || 'Unknown error';
            if (errorMsg.includes('already reviewed')) {
                alert('Ju keni lënë tashmë një vlerësim për këtë termin.');
                setExistingReviews(prev => ({
                    ...prev,
                    [reviewModal.appointment.termini_id]: true
                }));
                setReviewModal(null);
            } else {
                alert('Dështoi dërgimi i vlerësimit: ' + errorMsg);
            }
        } finally {
            setSubmittingReview(false);
        }
    };

    // Check if appointment can be reviewed (confirmed or past end time)
    const isAppointmentCompleted = (appointment) => {
        // If end time has passed, definitely completed
        if (appointment.koha_mbarimit && new Date(appointment.koha_mbarimit) < new Date()) {
            return true;
        }
        // Also allow reviewing if the status is Confirmed
        if (appointment.kerkesaPunes?.statusi?.status === 'Confirmed') {
            return true;
        }
        return false;
    };

    // Check if user already reviewed this appointment
    const hasReviewed = (terminiId) => {
        return existingReviews[terminiId] === true;
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Review Modal */}
            {reviewModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Lini Vlerësim</h2>
                            <button
                                onClick={() => setReviewModal(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmitReview} className="space-y-6">
                            {/* Star Rating */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">Vlerësimi</label>
                                <div className="flex gap-2 justify-center">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setReviewScore(star)}
                                            className="p-1 transition-transform hover:scale-110"
                                        >
                                            <svg
                                                className={`w-10 h-10 ${star <= reviewScore ? 'text-yellow-400' : 'text-gray-300'}`}
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        </button>
                                    ))}
                                </div>
                                <p className="text-center text-sm text-gray-500 mt-2">
                                    {reviewScore === 1 && 'Shumë Keq'}
                                    {reviewScore === 2 && 'Keq'}
                                    {reviewScore === 3 && 'Mesatar'}
                                    {reviewScore === 4 && 'Mirë'}
                                    {reviewScore === 5 && 'Shkëlqyeshëm'}
                                </p>
                            </div>

                            {/* Message */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mesazhi (opsional)
                                </label>
                                <textarea
                                    value={reviewMessage}
                                    onChange={(e) => setReviewMessage(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#C00F0C] focus:border-[#C00F0C] h-32"
                                    placeholder="Rrëfeni përvojën tuaj me profesionistin..."
                                />
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setReviewModal(null)}
                                    className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50"
                                >
                                    Anulo
                                </button>
                                <button
                                    type="submit"
                                    disabled={submittingReview}
                                    className="flex-1 px-4 py-3 bg-[#C00F0C] text-white font-bold rounded-xl hover:bg-[#a50d0a] shadow-lg shadow-red-200 disabled:opacity-50"
                                >
                                    {submittingReview ? 'Duke dërguar...' : 'Dërgo Vlerësimin'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 text-center">Rezervimet e Mia</h1>
                    <p className="text-gray-500 font-medium text-center">Menaxhoni rezervimet dhe kërkesat tuaja</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="px-5 py-2.5 bg-[#C00F0C] text-white font-bold rounded-xl shadow-lg shadow-red-200 hover:shadow-red-300 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                >
                    {showForm ? 'Anulo' : 'Kërkesë e Re'}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('appointments')}
                    className={`px-6 py-3 font-semibold transition-colors ${activeTab === 'appointments'
                        ? 'text-[#C00F0C] border-b-2 border-[#C00F0C]'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Terminet ({appointments.length})
                </button>
                <button
                    onClick={() => setActiveTab('requests')}
                    className={`px-6 py-3 font-semibold transition-colors ${activeTab === 'requests'
                        ? 'text-[#C00F0C] border-b-2 border-[#C00F0C]'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Kërkesat ({workRequests.length})
                </button>
            </div>

            {/* New Request Form */}
            {showForm && (
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-lg animate-in fade-in slide-in-from-top-4">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Krijo Kërkesë të Re</h2>
                    <form onSubmit={handleCreateRequest} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Përshkrimi</label>
                            <input
                                type="text"
                                value={desc}
                                onChange={e => setDesc(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C00F0C] focus:border-[#C00F0C]"
                                placeholder="Më duhet një elektricist..."
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mesazhi</label>
                            <textarea
                                value={msg}
                                onChange={e => setMsg(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C00F0C] focus:border-[#C00F0C] h-24"
                                placeholder="Detaje rreth problemit..."
                                required
                            />
                        </div>
                        <button type="submit" className="w-full bg-[#C00F0C] hover:bg-[#a50d0a] text-white font-bold py-2 px-4 rounded-lg shadow-lg shadow-red-200">
                            Dërgo Kërkesën
                        </button>
                    </form>
                </div>
            )}

            {/* Content */}
            {loading ? (
                <div className="text-center text-gray-500 py-10">Duke ngarkuar rezervimet...</div>
            ) : error ? (
                <div className="text-center text-red-500 py-10">{error}</div>
            ) : (
                <>
                    {/* Appointments Tab */}
                    {activeTab === 'appointments' && (
                        <div className="space-y-4">
                            {appointments.length === 0 ? (
                                <div className="text-center text-gray-500 py-10 bg-white rounded-xl border border-gray-200">
                                    Nuk keni termine. Rezervoni një shërbim për të filluar!
                                </div>
                            ) : (
                                appointments.map(appointment => (
                                    <div key={appointment.termini_id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {appointment.kerkesaPunes?.pershkrimi || 'Termin'}
                                                </h3>
                                                {appointment.kerkesaPunes?.mesazhi && (
                                                    <p className="text-gray-600 mt-1">{appointment.kerkesaPunes.mesazhi}</p>
                                                )}
                                                <div className="mt-4 flex flex-wrap gap-3">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        <span className="text-gray-700 font-medium">
                                                            {appointment.koha_fillimit
                                                                ? new Date(appointment.koha_fillimit).toLocaleDateString('sq-AL', {
                                                                    weekday: 'long',
                                                                    year: 'numeric',
                                                                    month: 'long',
                                                                    day: 'numeric'
                                                                })
                                                                : 'N/A'
                                                            }
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <span className="text-gray-700 font-medium">
                                                            {appointment.koha_fillimit && appointment.koha_mbarimit
                                                                ? `${new Date(appointment.koha_fillimit).toLocaleTimeString('sq-AL', { hour: '2-digit', minute: '2-digit' })} - ${new Date(appointment.koha_mbarimit).toLocaleTimeString('sq-AL', { hour: '2-digit', minute: '2-digit' })}`
                                                                : 'N/A'
                                                            }
                                                        </span>
                                                    </div>
                                                    {appointment.cmimi && (
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <span className="text-[#C00F0C] font-bold">
                                                                €{parseFloat(appointment.cmimi).toFixed(2)}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${appointment.kerkesaPunes?.statusi?.status === 'Confirmed'
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {appointment.kerkesaPunes?.statusi?.status || 'Pending'}
                                                    </span>
                                                </div>
                                            </div>
                                            {/* Leave Review Button - Only for completed appointments */}
                                            {isAppointmentCompleted(appointment) && !hasReviewed(appointment.termini_id) && (
                                                <button
                                                    onClick={() => openReviewModal(appointment)}
                                                    className="ml-4 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-yellow-200 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                                >
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                    Lini Vlerësim
                                                </button>
                                            )}
                                            {hasReviewed(appointment.termini_id) && (
                                                <span className="ml-4 px-4 py-2 bg-green-100 text-green-700 font-bold rounded-xl flex items-center gap-2">
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                    Vlerësuar
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Work Requests Tab */}
                    {activeTab === 'requests' && (
                        <div className="space-y-4">
                            {workRequests.length === 0 ? (
                                <div className="text-center text-gray-500 py-10 bg-white rounded-xl border border-gray-200">
                                    Nuk keni kërkesa. Krijo një për të filluar!
                                </div>
                            ) : (
                                workRequests.map(request => (
                                    <div key={request.kerkesa_punes_id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-lg hover:shadow-xl transition-shadow flex justify-between items-start">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900">{request.pershkrimi}</h3>
                                            {request.mesazhi && (
                                                <p className="text-gray-600 mt-1">{request.mesazhi}</p>
                                            )}
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${request.statusi?.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                                    request.statusi?.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                                                        request.statusi?.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {request.statusi?.status || 'Pending'}
                                                </span>
                                                <span className="px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                                                    {new Date(request.koha_krijimit).toLocaleDateString('sq-AL')}
                                                </span>
                                                {request.terminet && request.terminet.length > 0 && (
                                                    <>
                                                        <span className="px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                                                            Ka Termin
                                                        </span>
                                                        {request.terminet[0].cmimi && (
                                                            <span className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-700 font-bold">
                                                                €{parseFloat(request.terminet[0].cmimi).toFixed(2)}
                                                            </span>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(request.kerkesa_punes_id)}
                                            className="text-red-400 hover:text-red-600 p-2 ml-4"
                                            title="Fshi Kërkesën"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}