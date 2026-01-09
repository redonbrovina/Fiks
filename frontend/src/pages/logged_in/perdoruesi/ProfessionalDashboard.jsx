import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import UserTable from '../../../components/UserTable';
import { bookingApi, userApi, catalogApi, adminApi, feedbackApi, tokenStorage } from '../../../services/api';

// Column definitions for work requests
const requestColumns = [
    {
        key: 'pershkrimi',
        label: 'Përshkrimi',
        render: (val) => <span className="font-medium">{val || 'N/A'}</span>
    },
    {
        key: 'mesazhi',
        label: 'Mesazhi',
        render: (val) => <span className="text-gray-600 text-sm">{val || '-'}</span>
    },
    {
        key: 'koha_krijimit',
        label: 'Data',
        render: (val) => val ? new Date(val).toLocaleDateString('sq-AL') : 'N/A'
    },
    {
        key: 'statusi',
        label: 'Statusi',
        render: (val) => {
            const statusName = val?.status || 'Pending';
            const colors = {
                'Pending': 'bg-yellow-100 text-yellow-700',
                'Confirmed': 'bg-green-100 text-green-700',
                'Accepted': 'bg-blue-100 text-blue-700',
                'Rejected': 'bg-red-100 text-red-700',
                'Completed': 'bg-gray-100 text-gray-700',
            };
            return (
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${colors[statusName] || 'bg-gray-100 text-gray-700'}`}>
                    {statusName}
                </span>
            );
        }
    },
    {
        key: 'terminet',
        label: 'Termini',
        render: (val) => {
            if (!val || val.length === 0) return <span className="text-gray-400">Asnjë</span>;
            const termin = val[0];
            if (termin.koha_fillimit) {
                return (
                    <span className="text-sm">
                        {new Date(termin.koha_fillimit).toLocaleDateString('sq-AL')} {' '}
                        {new Date(termin.koha_fillimit).toLocaleTimeString('sq-AL', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                );
            }
            return <span className="text-gray-400">Asnjë</span>;
        }
    },
];

export default function ProfessionalDashboard() {
    const navigate = useNavigate();
    const [workRequests, setWorkRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [appointmentDate, setAppointmentDate] = useState('');
    const [appointmentStartTime, setAppointmentStartTime] = useState('');
    const [appointmentEndTime, setAppointmentEndTime] = useState('');
    const [appointmentPrice, setAppointmentPrice] = useState('');
    const [profesionistiId, setProfesionistiId] = useState(null);

    // Reviews state
    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState({ average_rating: 0, total_reviews: 0 });
    const [loadingReviews, setLoadingReviews] = useState(false);

    useEffect(() => {
        fetchProfessionalInfo();
    }, []);

    useEffect(() => {
        if (profesionistiId) {
            fetchWorkRequests();
            fetchReviews();
        }
    }, [profesionistiId]);

    const fetchProfessionalInfo = async () => {
        try {
            setLoading(true);
            const user = await userApi.getMe();

            if (!user) {
                console.error('User not found');
                setLoading(false);
                return;
            }

            let professionalId = null;

            // Try to get professional ID from user object
            if (user.profesionisti) {
                professionalId = user.profesionisti.profesionisti_id;
            } else if (user.profesionisti_id) {
                professionalId = user.profesionisti_id;
            } else {
                // Try to get from catalog profile using user ID
                try {
                    // Use catalogApi to get profile by profesional ID - but we need perdoruesi_id
                    // Alternative: try to get profile from catalog by user ID
                    // Since we don't have an endpoint for that, let's try a different approach
                    const localUser = tokenStorage.getUser();
                    if (localUser && localUser.perdoruesi_id) {
                        // Try fetching all profiles and filtering (not ideal but works)
                        try {
                            if (adminApi && typeof adminApi.getProfiles === 'function') {
                                const allProfiles = await adminApi.getProfiles();
                                if (Array.isArray(allProfiles)) {
                                    const myProfile = allProfiles.find(p => p.perdoruesi_id === localUser.perdoruesi_id);
                                    if (myProfile && myProfile.profesionisti_id) {
                                        professionalId = myProfile.profesionisti_id;
                                    }
                                }
                            }
                        } catch (profileError) {
                            console.log('Could not fetch from catalog profiles:', profileError);
                        }
                    }
                } catch (profileError) {
                    console.log('Could not fetch profile:', profileError);
                }
            }

            if (professionalId) {
                console.log('Found professional ID:', professionalId);
                setProfesionistiId(professionalId);
            } else {
                // If we can't find professional ID, show empty state but don't crash
                console.warn('Professional ID not found. User might not be a professional yet or profile not created.');
                setProfesionistiId(null);
                setWorkRequests([]);
            }
        } catch (error) {
            console.error('Error fetching professional info:', error);
            // Set empty state instead of crashing
            setProfesionistiId(null);
            setWorkRequests([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchWorkRequests = async () => {
        try {
            if (!profesionistiId) {
                console.warn('No professional ID available');
                setWorkRequests([]);
                return;
            }

            const requests = await bookingApi.getWorkRequestsByProfessional(profesionistiId);
            setWorkRequests(Array.isArray(requests) ? requests : []);
        } catch (error) {
            console.error('Error fetching work requests:', error);
            // Don't show alert for empty/404 responses
            if (error.status && error.status !== 404) {
                console.error('Failed to load work requests:', error);
            }
            setWorkRequests([]);
        }
    };

    // Fetch reviews for this professional
    const fetchReviews = async () => {
        if (!profesionistiId) return;

        try {
            setLoadingReviews(true);

            // Fetch reviews and average rating in parallel
            const [reviewsData, ratingData] = await Promise.all([
                feedbackApi.getReviewsByProfessional(profesionistiId),
                feedbackApi.getAverageRating(profesionistiId)
            ]);

            setReviews(Array.isArray(reviewsData) ? reviewsData : []);
            setAverageRating(ratingData || { average_rating: 0, total_reviews: 0 });
        } catch (error) {
            console.error('Error fetching reviews:', error);
            setReviews([]);
            setAverageRating({ average_rating: 0, total_reviews: 0 });
        } finally {
            setLoadingReviews(false);
        }
    };

    const handleDenyRequest = async () => {
        if (!selectedRequest || !selectedRequest.kerkesa_punes_id) {
            alert('Nuk mund të refuzohet: Kërkesa e punës nuk u gjet.');
            return;
        }

        if (!window.confirm('Jeni të sigurt që dëshironi të refuzoni këtë kërkesë? Ky veprim do ta anulojë terminë (nëse ekziston) dhe do ta shënojë kërkesën si të refuzuar.')) {
            return;
        }

        try {
            const workRequestId = parseInt(selectedRequest.kerkesa_punes_id, 10);
            console.log('Denying work request with ID:', workRequestId, 'from request:', selectedRequest);
            await bookingApi.denyWorkRequest(workRequestId);
            alert('Kërkesa u refuzua me sukses.');
            setIsModalOpen(false);
            await fetchWorkRequests();
        } catch (error) {
            console.error('Error denying request:', error);
            const errorMsg = error?.data?.error?.message || error?.message || 'Unknown error';
            alert('Dështoi refuzimi i kërkesës: ' + errorMsg);
        }
    };

    const handleRequestAction = (request) => {
        setSelectedRequest(request);
        setIsModalOpen(true);
        if (request.terminet && request.terminet.length > 0) {
            const termin = request.terminet[0];
            if (termin.koha_fillimit) {
                const startDate = new Date(termin.koha_fillimit);
                setAppointmentDate(startDate.toISOString().split('T')[0]);
                setAppointmentStartTime(startDate.toTimeString().slice(0, 5));
                if (termin.koha_mbarimit) {
                    const endDate = new Date(termin.koha_mbarimit);
                    setAppointmentEndTime(endDate.toTimeString().slice(0, 5));
                }
                setAppointmentPrice(termin.cmimi || '');
            }
        }
    };

    const handleAcceptRequest = async () => {
        if (!selectedRequest) return;

        try {
            // Update status to Accepted
            const [acceptedStatus] = await bookingApi.getAllWorkRequests(); // We'll need to find status ID
            // For now, just create appointment if date/time provided
            if (appointmentDate && appointmentStartTime && appointmentEndTime) {
                const startDateTime = new Date(`${appointmentDate}T${appointmentStartTime}`);
                const endDateTime = new Date(`${appointmentDate}T${appointmentEndTime}`);

                await bookingApi.createAppointment({
                    kerkesa_punes_id: selectedRequest.kerkesa_punes_id,
                    koha_fillimit: startDateTime.toISOString(),
                    koha_mbarimit: endDateTime.toISOString(),
                    cmimi: appointmentPrice || null
                });

                alert('Termini u krijua me sukses!');
                setIsModalOpen(false);
                await fetchWorkRequests();
                await fetchBookings();
            } else {
                alert('Ju lutem plotësoni datën dhe orarin');
            }
        } catch (error) {
            console.error('Error accepting request:', error);
            alert('Dështoi: ' + (error.data?.error?.message || error.message));
        }
    };

    // Show loading state
    if (loading) {
        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center py-10 text-gray-500">Duke ngarkuar...</div>
            </div>
        );
    }

    // Show error state (non-fatal) - if no professional ID found
    if (!profesionistiId && !loading) {
        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
                    <p className="text-yellow-800 font-medium">Nuk u gjet profesionist i lidhur me llogarinë tuaj.</p>
                    <p className="text-sm text-yellow-600 mt-2">Ju lutem sigurohuni që jeni regjistruar si profesionist dhe profili juaj është krijuar.</p>
                    <button
                        onClick={() => navigate('/add-service')}
                        className="mt-4 px-5 py-2.5 bg-[#C00F0C] text-white font-bold rounded-xl shadow-lg shadow-red-200 hover:shadow-red-300"
                    >
                        Krijo Profil Profesionisti
                    </button>
                </div>
            </div>
        );
    }

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

            {/* Work Requests Table */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Kërkesat e Punës</h2>
                {loading ? (
                    <div className="text-center py-10 text-gray-500">Duke ngarkuar kërkesat...</div>
                ) : (
                    <UserTable
                        columns={requestColumns}
                        data={workRequests}
                        onAction={handleRequestAction}
                        actionLabel="Menaxho"
                        searchPlaceholder="Kërko kërkesa..."
                    />
                )}
            </div>

            {/* Reviews Section */}
            <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">Vlerësimet e Mia</h2>
                    {averageRating.total_reviews > 0 && (
                        <div className="flex items-center gap-3 bg-yellow-50 px-4 py-2 rounded-xl">
                            <div className="flex items-center gap-1">
                                <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <span className="text-xl font-bold text-gray-900">{averageRating.average_rating}</span>
                            </div>
                            <span className="text-sm text-gray-600">({averageRating.total_reviews} vlerësime)</span>
                        </div>
                    )}
                </div>

                {loadingReviews ? (
                    <div className="text-center py-10 text-gray-500">Duke ngarkuar vlerësimet...</div>
                ) : reviews.length === 0 ? (
                    <div className="bg-gray-50 rounded-xl p-6 text-center">
                        <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                        <p className="text-gray-500 font-medium">Nuk keni vlerësime akoma</p>
                        <p className="text-sm text-gray-400 mt-1">Vlerësimet do të shfaqen këtu pasi klientët t'i lënë ato.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {reviews.map(review => (
                            <div key={review.review_id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-lg">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        {/* Stars */}
                                        <div className="flex items-center gap-1 mb-2">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <svg
                                                    key={star}
                                                    className={`w-5 h-5 ${star <= review.score ? 'text-yellow-400' : 'text-gray-300'}`}
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                            <span className="ml-2 text-sm text-gray-500">
                                                {new Date(review.koha_krijimit).toLocaleDateString('sq-AL')}
                                            </span>
                                        </div>
                                        {/* Message */}
                                        {review.mesazhi && (
                                            <p className="text-gray-700">{review.mesazhi}</p>
                                        )}
                                        {!review.mesazhi && (
                                            <p className="text-gray-400 italic">Asnjë koment</p>
                                        )}
                                        {/* Professional Response */}
                                        {review.pergjigje && (
                                            <div className="mt-3 pl-4 border-l-2 border-[#C00F0C]">
                                                <p className="text-sm text-gray-600">
                                                    <span className="font-semibold text-[#C00F0C]">Përgjigja juaj: </span>
                                                    {review.pergjigje.mesazhi}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-2xl font-bold text-gray-200">
                                        {review.score}/5
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Request Detail Modal */}
            {isModalOpen && selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Menaxho Kërkesën</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Përshkrimi</label>
                                <p className="text-gray-900">{selectedRequest.pershkrimi}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mesazhi</label>
                                <p className="text-gray-600">{selectedRequest.mesazhi || '-'}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Statusi</label>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${selectedRequest.statusi?.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                    selectedRequest.statusi?.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                                        'bg-gray-100 text-gray-700'
                                    }`}>
                                    {selectedRequest.statusi?.status || 'Pending'}
                                </span>
                            </div>

                            {selectedRequest.terminet && selectedRequest.terminet.length > 0 ? (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Termini Ekzistues</label>
                                    <p className="text-gray-900">
                                        {new Date(selectedRequest.terminet[0].koha_fillimit).toLocaleString('sq-AL')}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3 pt-4 border-t">
                                    <h3 className="font-semibold text-gray-900">Krijo Termin</h3>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                                        <input
                                            type="date"
                                            value={appointmentDate}
                                            onChange={e => setAppointmentDate(e.target.value)}
                                            min={new Date().toISOString().split('T')[0]}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C00F0C] focus:border-[#C00F0C]"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Ora Fillimit</label>
                                            <input
                                                type="time"
                                                value={appointmentStartTime}
                                                onChange={e => setAppointmentStartTime(e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C00F0C] focus:border-[#C00F0C]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Ora Mbarimit</label>
                                            <input
                                                type="time"
                                                value={appointmentEndTime}
                                                onChange={e => setAppointmentEndTime(e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C00F0C] focus:border-[#C00F0C]"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Çmimi (€)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={appointmentPrice}
                                            onChange={e => setAppointmentPrice(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C00F0C] focus:border-[#C00F0C]"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50"
                                >
                                    Mbyll
                                </button>
                                {selectedRequest.statusi?.status !== 'Rejected' && (
                                    <button
                                        type="button"
                                        onClick={handleDenyRequest}
                                        className="px-4 py-2 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-200"
                                    >
                                        Refuzo
                                    </button>
                                )}
                                {(!selectedRequest.terminet || selectedRequest.terminet.length === 0) && selectedRequest.statusi?.status !== 'Rejected' && (
                                    <button
                                        type="button"
                                        onClick={handleAcceptRequest}
                                        className="flex-1 px-4 py-2 bg-[#C00F0C] text-white font-bold rounded-xl hover:bg-[#a50d0a] shadow-lg shadow-red-200"
                                    >
                                        Konfirmo dhe Krijo Termin
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
