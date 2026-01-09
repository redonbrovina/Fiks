import React, { useState, useEffect, useCallback, useMemo } from 'react';
import UserTable from '../../../components/UserTable';
import { bookingApi, catalogApi, feedbackApi, tokenStorage } from '../../../services/api';

// Column definitions
const marketColumns = [
    { key: 'profili', label: 'Profesionisti', render: (val) => val?.emri || 'N/A' },
    { key: 'titulli', label: 'Shërbimi' },
    { key: 'kategoria', label: 'Kategoria', render: (val) => val?.lloji_kategorise || 'N/A' },
    { key: 'cmimi', label: 'Çmimi', render: (val) => val ? `€${parseFloat(val).toFixed(2)}` : 'N/A' },
    {
        key: 'rating', label: 'Rating', render: (val, row) => {
            try {
                const rating = row?.profili?.rating || 0;
                const ratingNum = typeof rating === 'number' ? rating : parseFloat(rating) || 0;
                return (
                    <span className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {isNaN(ratingNum) ? '0.0' : ratingNum.toFixed(1)}
                    </span>
                );
            } catch (e) {
                console.warn('Error rendering rating:', e, row);
                return <span className="text-gray-400">N/A</span>;
            }
        }
    },
];

// Category icons mapping
const categoryIcons = {
    'Hidraulik': '🔧',
    'Elektricist': '⚡',
    'Pastrim': '🧹',
    'Riparime': '🔨',
    'Teknologji': '💻',
    'Transport': '🚗',
    'Ndërtim': '🏗️',
    'Mobilim': '🪑',
    'Kopshtari': '🌱',
    'Gatim': '🍳',
    'default': '📋'
};

export default function Marketplace() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [desc, setDesc] = useState('');
    const [msg, setMsg] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [price, setPrice] = useState('');
    const [availableSlots, setAvailableSlots] = useState(null);
    const [loadingSlots, setLoadingSlots] = useState(false);

    // Category filtering state
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [loadingCategories, setLoadingCategories] = useState(true);

    const fetchServices = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await catalogApi.getAllServices();
            console.log('Fetched services from API:', data);

            // Ensure data is an array
            if (Array.isArray(data)) {
                // Filter out services without profiles (professionals)
                const validServices = data.filter(service => {
                    try {
                        return service &&
                            service.profili &&
                            service.profili.profesionisti_id &&
                            service.profili.profesionisti_id !== null &&
                            service.profili.profesionisti_id !== undefined;
                    } catch (e) {
                        console.warn('Error filtering service:', e, service);
                        return false;
                    }
                });
                console.log('Valid services with professionals:', validServices.length);

                // Enrich services with live ratings from Feedback service
                const enrichedServices = await Promise.all(
                    validServices.map(async (service) => {
                        try {
                            const ratingData = await feedbackApi.getAverageRating(service.profili.profesionisti_id);
                            return {
                                ...service,
                                profili: {
                                    ...service.profili,
                                    rating: ratingData.average_rating || 0,
                                    total_reviews: ratingData.total_reviews || 0
                                }
                            };
                        } catch (e) {
                            // If rating fetch fails, keep original rating (0)
                            console.warn('Error fetching rating for professional:', service.profili.profesionisti_id, e);
                            return service;
                        }
                    })
                );

                setServices(enrichedServices);

                if (validServices.length === 0 && data.length > 0) {
                    console.warn('Services found but no valid professionals:', data);
                    setError('U gjetën shërbime por pa profesionistë të lidhur. Ju lutem kontrolloni databazën.');
                } else if (validServices.length === 0) {
                    console.log('No services found in database');
                    setError(null); // Not an error, just empty
                }
            } else {
                console.error('Invalid response format from getAllServices:', data);
                setServices([]);
                setError('Përgjigje e pavlefshme nga serveri');
            }
        } catch (err) {
            console.error('Error fetching services:', err);
            const errorMsg = err?.data?.error?.message || err?.message || 'Unknown error';
            console.error('Detailed error:', errorMsg, err.status);
            setError('Dështoi ngarkimi i shërbimeve: ' + errorMsg);
            setServices([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch categories
    const fetchCategories = useCallback(async () => {
        try {
            setLoadingCategories(true);
            const data = await catalogApi.getCategories();
            console.log('Fetched categories:', data);
            if (Array.isArray(data)) {
                setCategories(data);
            }
        } catch (err) {
            console.error('Error fetching categories:', err);
        } finally {
            setLoadingCategories(false);
        }
    }, []);

    // Filter services based on selected category
    const filteredServices = useMemo(() => {
        if (!selectedCategory) {
            return services;
        }
        return services.filter(service => {
            const serviceKategoriaId = service.kategoria?.kategoria_id || service.kategoria_id;
            // Check if matches main category
            if (serviceKategoriaId === selectedCategory.kategoria_id) {
                return true;
            }
            // Check if matches subcategory
            if (selectedCategory.nenKategorite && Array.isArray(selectedCategory.nenKategorite)) {
                return selectedCategory.nenKategorite.some(sub => sub.kategoria_id === serviceKategoriaId);
            }
            return false;
        });
    }, [services, selectedCategory]);

    // Get main categories for quick filter bar (first 5)
    const mainCategories = useMemo(() => {
        return categories.slice(0, 5);
    }, [categories]);

    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            try {
                await Promise.all([fetchServices(), fetchCategories()]);
            } catch (err) {
                if (isMounted) {
                    console.error('Failed to load data:', err);
                    setError('Dështoi ngarkimi i shërbimeve');
                    setLoading(false);
                }
            }
        };

        loadData();

        return () => {
            isMounted = false;
        };
    }, [fetchServices, fetchCategories]);

    useEffect(() => {
        if (selectedService && selectedService.profili && selectedService.profili.profesionisti_id && selectedDate) {
            fetchAvailableSlots();
        } else {
            setAvailableSlots(null);
        }
    }, [selectedService, selectedDate]);


    const fetchAvailableSlots = async () => {
        try {
            // Validate inputs before proceeding
            if (!selectedService || !selectedService.profili || !selectedService.profili.profesionisti_id || !selectedDate) {
                console.log('Missing required data for fetching slots');
                setAvailableSlots(null);
                return;
            }

            setLoadingSlots(true);
            // Ensure professional ID is integer
            const professionalIdInt = parseInt(selectedService.profili.profesionisti_id, 10);
            if (isNaN(professionalIdInt)) {
                console.error('Invalid professional ID:', selectedService.profili.profesionisti_id);
                setAvailableSlots(null);
                return;
            }

            const slots = await bookingApi.getAvailableSlots(
                professionalIdInt,
                selectedDate
            );
            setAvailableSlots(slots || null);
        } catch (err) {
            console.error('Error fetching slots:', err);
            // Don't show error to user, just silently fail
            setAvailableSlots(null);
        } finally {
            setLoadingSlots(false);
        }
    };

    const handleBook = (service) => {
        try {
            if (!service) {
                console.error('No service provided to handleBook');
                return;
            }

            setSelectedService(service);
            setDesc(service.titulli || '');
            setPrice(service.cmimi || service.profili?.cmimi || '');
            setMsg('');
            setSelectedDate('');
            setStartTime('');
            setEndTime('');
            setAvailableSlots(null);
            setIsModalOpen(true);
        } catch (err) {
            console.error('Error in handleBook:', err);
            alert('Dështoi hapja e formularit të rezervimit');
        }
    };

    const submitBooking = async (e) => {
        e.preventDefault();
        try {
            const user = tokenStorage.getUser();
            if (!user || !user.perdoruesi_id) {
                alert('Ju lutem identifikohuni fillimisht');
                return;
            }

            if (!selectedService || !selectedService.profili) {
                alert('Shërbimi nuk është i disponueshëm');
                return;
            }

            if (!selectedDate || !startTime || !endTime) {
                alert('Ju lutem zgjidhni datën dhe orarin');
                return;
            }

            const profesionistiId = selectedService.profili?.profesionisti_id;
            if (!profesionistiId) {
                alert('Profesionisti nuk është i disponueshëm');
                return;
            }

            // Ensure professional ID is an integer
            const professionalIdInt = parseInt(profesionistiId, 10);
            if (isNaN(professionalIdInt)) {
                alert('ID e profesionistit është e pavlefshme');
                return;
            }

            // Validate date/time
            const startDateTime = new Date(`${selectedDate}T${startTime}`);
            const endDateTime = new Date(`${selectedDate}T${endTime}`);

            if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
                alert('Data ose ora e zgjedhur është e pavlefshme');
                return;
            }

            if (endDateTime <= startDateTime) {
                alert('Koha e mbarimit duhet të jetë pas orës së fillimit');
                return;
            }

            // Check if date is in the past
            if (startDateTime < new Date()) {
                alert('Nuk mund të rezervoni në të kaluarën');
                return;
            }

            console.log('Creating work request with data:', {
                pershkrimi: desc,
                mesazhi: msg,
                profesionisti_id: professionalIdInt,
                perdoruesi_id: parseInt(user.perdoruesi_id, 10),
                kategoria_id: selectedService.kategoria_id ? parseInt(selectedService.kategoria_id, 10) : null
            });

            // Create work request first
            let workRequest;
            try {
                workRequest = await bookingApi.createWorkRequest({
                    pershkrimi: desc,
                    mesazhi: msg,
                    profesionisti_id: professionalIdInt,
                    perdoruesi_id: parseInt(user.perdoruesi_id, 10),
                    kategoria_id: selectedService.kategoria_id ? parseInt(selectedService.kategoria_id, 10) : null
                });
                console.log('Work request created:', workRequest);
            } catch (workRequestError) {
                console.error('Error creating work request:', workRequestError);
                const errorMsg = workRequestError?.data?.error?.message || workRequestError?.message || 'Unknown error';
                alert('Dështoi krijimi i kërkesës së punës: ' + errorMsg);
                return;
            }

            if (!workRequest || !workRequest.kerkesa_punes_id) {
                alert('Kërkesa e punës u krijua por nuk ka ID. Ju lutem provoni përsëri.');
                return;
            }

            console.log('Creating appointment with data:', {
                kerkesa_punes_id: workRequest.kerkesa_punes_id,
                koha_fillimit: startDateTime.toISOString(),
                koha_mbarimit: endDateTime.toISOString(),
                cmimi: price || selectedService.cmimi || null
            });

            // Create appointment immediately
            try {
                await bookingApi.createAppointment({
                    kerkesa_punes_id: workRequest.kerkesa_punes_id,
                    koha_fillimit: startDateTime.toISOString(),
                    koha_mbarimit: endDateTime.toISOString(),
                    cmimi: price || selectedService.cmimi || null
                });
                console.log('Appointment created successfully');
            } catch (appointmentError) {
                console.error('Error creating appointment:', appointmentError);
                const errorMsg = appointmentError?.data?.error?.message || appointmentError?.message || 'Unknown error';
                const isNetworkError = appointmentError?.networkError || appointmentError?.status === 0 ||
                    errorMsg.toLowerCase().includes('fetch') ||
                    errorMsg.toLowerCase().includes('network') ||
                    errorMsg.toLowerCase().includes('failed to fetch');

                if (errorMsg.includes('conflicts') || errorMsg.includes('Time slot conflicts')) {
                    alert('Kjo orë është e zënë. Ju lutem zgjidhni një orë tjetër.');
                } else if (errorMsg.includes('outside professional') || errorMsg.includes('availability')) {
                    // Show availability error with available slots if provided
                    const availableSlots = appointmentError?.data?.error?.availableSlots;
                    let alertMsg = 'Orari i zgjedhur është jashtë orëve të disponueshme të profesionistit.\n\n';
                    if (availableSlots && availableSlots.length > 0) {
                        alertMsg += 'Orët e disponueshme:\n';
                        availableSlots.forEach(slot => {
                            alertMsg += `• ${slot.start} - ${slot.end}\n`;
                        });
                    } else {
                        alertMsg += errorMsg;
                    }
                    alert(alertMsg);
                } else if (isNetworkError) {
                    console.error('Network error details:', {
                        message: errorMsg,
                        status: appointmentError?.status,
                        networkError: appointmentError?.networkError,
                        endpoint: '/api/bookings'
                    });
                    alert('Dështoi lidhja me serverin. Ju lutem kontrolloni lidhjen tuaj të internetit dhe provoni përsëri.');
                } else {
                    alert('Dështoi krijimi i terminës: ' + errorMsg);
                }
                return;
            }

            alert('Rezervimi u konfirmua me sukses!');
            setIsModalOpen(false);
            setDesc('');
            setMsg('');
            setSelectedDate('');
            setStartTime('');
            setEndTime('');
            setPrice('');
            setAvailableSlots(null);
            setSelectedService(null);

            // Refresh services list to show updated data
            await fetchServices();
        } catch (error) {
            console.error('Unexpected error in submitBooking:', error);
            const errorMsg = error?.data?.error?.message || error?.message || 'Unknown error';
            const isNetworkError = error?.networkError || error?.status === 0 ||
                errorMsg.toLowerCase().includes('fetch') ||
                errorMsg.toLowerCase().includes('network') ||
                errorMsg.toLowerCase().includes('failed to fetch');

            if (isNetworkError) {
                console.error('Network error details:', {
                    message: errorMsg,
                    status: error?.status,
                    networkError: error?.networkError
                });
                alert('Dështoi lidhja me serverin. Ju lutem kontrolloni lidhjen tuaj të internetit dhe provoni përsëri.');
            } else {
                alert('Dështoi rezervimi: ' + errorMsg);
            }
        }
    };

    // Show loading state
    if (loading) {
        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center py-10 text-gray-500">Duke ngarkuar shërbimet...</div>
            </div>
        );
    }

    // Show error state
    if (error && services.length === 0) {
        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                    <p className="text-red-800 font-medium">{error}</p>
                    <button
                        onClick={fetchServices}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                        Provo Përsëri
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 text-center">Marketi i Shërbimeve</h1>
                    <p className="text-gray-500 font-medium text-center">Gjeni profesionistët më të mirë për nevojat tuaja.</p>
                </div>
            </div>

            {/* Error message if any */}
            {error && services.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-yellow-800 text-sm">
                    {error}
                </div>
            )}

            {/* Category Filter Bar */}
            <div className="bg-white rounded-2xl p-4 shadow-lg shadow-gray-200/50 border border-gray-100">
                <div className="flex flex-wrap items-center gap-3">
                    {/* "All" button */}
                    <button
                        onClick={() => setSelectedCategory(null)}
                        className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 ${!selectedCategory
                            ? 'bg-gradient-to-r from-[#C00F0C] to-[#e63946] text-white shadow-lg shadow-red-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        Të Gjitha
                    </button>

                    {/* Main category pills */}
                    {!loadingCategories && mainCategories.map(category => (
                        <button
                            key={category.kategoria_id}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center gap-2 ${selectedCategory?.kategoria_id === category.kategoria_id
                                ? 'bg-gradient-to-r from-[#C00F0C] to-[#e63946] text-white shadow-lg shadow-red-200'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            <span>{categoryIcons[category.lloji_kategorise] || categoryIcons['default']}</span>
                            {category.lloji_kategorise}
                        </button>
                    ))}

                    {/* Show All Categories button */}
                    {categories.length > 0 && (
                        <button
                            onClick={() => setIsCategoryModalOpen(true)}
                            className="px-4 py-2 rounded-xl font-semibold text-sm bg-gray-800 text-white hover:bg-gray-700 transition-all duration-200 flex items-center gap-2 ml-auto"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                            Të Gjitha Kategoritë ({categories.length})
                        </button>
                    )}

                    {loadingCategories && (
                        <span className="text-sm text-gray-400 animate-pulse">Duke ngarkuar kategoritë...</span>
                    )}
                </div>

                {/* Selected category indicator */}
                {selectedCategory && (
                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="font-medium">Filtër aktiv:</span>
                            <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full font-semibold flex items-center gap-1">
                                {categoryIcons[selectedCategory.lloji_kategorise] || categoryIcons['default']}
                                {selectedCategory.lloji_kategorise}
                            </span>
                            {selectedCategory.nenKategorite && selectedCategory.nenKategorite.length > 0 && (
                                <span className="text-gray-400">
                                    (+{selectedCategory.nenKategorite.length} nën-kategori)
                                </span>
                            )}
                        </div>
                        <button
                            onClick={() => setSelectedCategory(null)}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>

            {/* Marketplace Table */}
            {filteredServices.length === 0 ? (
                <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-gray-200/50 border border-gray-100 text-center py-10">
                    {selectedCategory ? (
                        <>
                            <p className="text-gray-500 font-medium mb-2">Nuk u gjetën shërbime në këtë kategori.</p>
                            <p className="text-sm text-gray-400 mb-4">
                                Kategoria: {selectedCategory.lloji_kategorise}
                            </p>
                            <button
                                onClick={() => setSelectedCategory(null)}
                                className="px-4 py-2 bg-[#C00F0C] text-white rounded-lg hover:bg-[#a50d0a] transition-colors"
                            >
                                Shiko të gjitha shërbimet
                            </button>
                        </>
                    ) : (
                        <>
                            <p className="text-gray-500 font-medium mb-2">Nuk u gjetën shërbime.</p>
                            <p className="text-sm text-gray-400">Profesionistët mund të shtojnë shërbimet e tyre në "Shto Shërbim".</p>
                        </>
                    )}
                </div>
            ) : Array.isArray(filteredServices) && filteredServices.length > 0 ? (
                <UserTable
                    columns={marketColumns}
                    data={filteredServices}
                    onAction={handleBook}
                    actionLabel="Rezervo"
                    searchPlaceholder="Kërko shërbime ose profesionistë..."
                />
            ) : (
                <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-gray-200/50 border border-gray-100 text-center py-10">
                    <p className="text-gray-500 font-medium mb-2">Nuk u gjetën shërbime.</p>
                    <p className="text-sm text-gray-400">Profesionistët mund të shtojnë shërbimet e tyre në "Shto Shërbim".</p>
                </div>
            )}

            {/* Booking Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">
                                Rezervo {selectedService?.profili?.emri || 'Shërbim'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={submitBooking} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Shërbimi</label>
                                <input
                                    type="text"
                                    value={desc}
                                    onChange={e => setDesc(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C00F0C] focus:border-[#C00F0C]"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Çmimi (€)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={price}
                                    onChange={e => setPrice(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C00F0C] focus:border-[#C00F0C]"
                                    placeholder={selectedService?.cmimi || '0.00'}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={e => setSelectedDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C00F0C] focus:border-[#C00F0C]"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ora e Fillimit</label>
                                    <input
                                        type="time"
                                        value={startTime}
                                        onChange={e => setStartTime(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C00F0C] focus:border-[#C00F0C]"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ora e Mbarimit</label>
                                    <input
                                        type="time"
                                        value={endTime}
                                        onChange={e => setEndTime(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C00F0C] focus:border-[#C00F0C]"
                                        required
                                    />
                                </div>
                            </div>

                            {loadingSlots && (
                                <div className="text-sm text-gray-500">Duke kontrolluar disponueshmërinë...</div>
                            )}

                            {availableSlots && availableSlots.booked_appointments && availableSlots.booked_appointments.length > 0 && (
                                <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
                                    ⚠️ Ka {availableSlots.booked_appointments.length} rezervime ekzistuese për këtë ditë.
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mesazhi / Detajet</label>
                                <textarea
                                    value={msg}
                                    onChange={e => setMsg(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C00F0C] focus:border-[#C00F0C] h-32"
                                    placeholder="Pershëndetje, dua të rezervoj..."
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
                                    Konfirmo Rezervimin
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Category Selection Modal */}
            {isCategoryModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[85vh] overflow-hidden flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">
                                Zgjidhni Kategorinë
                            </h2>
                            <button onClick={() => setIsCategoryModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="overflow-y-auto flex-1">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {categories.map(category => (
                                    <div
                                        key={category.kategoria_id}
                                        className="border border-gray-200 rounded-xl p-4 hover:border-[#C00F0C]/30 hover:shadow-lg transition-all duration-200"
                                    >
                                        {/* Main Category */}
                                        <button
                                            onClick={() => {
                                                setSelectedCategory(category);
                                                setIsCategoryModalOpen(false);
                                            }}
                                            className={`w-full text-left p-3 rounded-lg mb-2 transition-all duration-200 flex items-center gap-3 ${selectedCategory?.kategoria_id === category.kategoria_id
                                                ? 'bg-gradient-to-r from-[#C00F0C] to-[#e63946] text-white shadow-lg'
                                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                                }`}
                                        >
                                            <span className="text-2xl">{categoryIcons[category.lloji_kategorise] || categoryIcons['default']}</span>
                                            <div>
                                                <span className="font-bold text-lg">{category.lloji_kategorise}</span>
                                                {category.nenKategorite && category.nenKategorite.length > 0 && (
                                                    <p className={`text-sm ${selectedCategory?.kategoria_id === category.kategoria_id ? 'text-white/80' : 'text-gray-500'}`}>
                                                        {category.nenKategorite.length} nën-kategori
                                                    </p>
                                                )}
                                            </div>
                                        </button>

                                        {/* Subcategories */}
                                        {category.nenKategorite && category.nenKategorite.length > 0 && (
                                            <div className="flex flex-wrap gap-2 pl-4">
                                                {category.nenKategorite.map(sub => (
                                                    <button
                                                        key={sub.kategoria_id}
                                                        onClick={() => {
                                                            // Create a pseudo-category for subcategory filtering
                                                            setSelectedCategory({
                                                                kategoria_id: sub.kategoria_id,
                                                                lloji_kategorise: sub.lloji_kategorise,
                                                                nenKategorite: []
                                                            });
                                                            setIsCategoryModalOpen(false);
                                                        }}
                                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${selectedCategory?.kategoria_id === sub.kategoria_id
                                                            ? 'bg-red-100 text-red-700 ring-2 ring-red-500'
                                                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                                            }`}
                                                    >
                                                        {sub.lloji_kategorise}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-100 flex gap-3">
                            <button
                                onClick={() => {
                                    setSelectedCategory(null);
                                    setIsCategoryModalOpen(false);
                                }}
                                className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                Pastro Filtrin
                            </button>
                            <button
                                onClick={() => setIsCategoryModalOpen(false)}
                                className="flex-1 px-4 py-3 bg-[#C00F0C] text-white font-bold rounded-xl hover:bg-[#a50d0a] shadow-lg shadow-red-200 transition-colors"
                            >
                                Mbyll
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
