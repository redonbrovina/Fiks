import { useState, useEffect } from 'react';
import { bookingApi, adminApi, catalogApi } from '../../../services/api';

export default function AdminKerkesat() {
    const [kerkesat, setKerkesat] = useState([]);
    const [professionals, setProfessionals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedKerkesa, setSelectedKerkesa] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [actionType, setActionType] = useState(null); // 'approve', 'reject', 'assign', 'appointment'

    // Form states
    const [selectedProfessionalId, setSelectedProfessionalId] = useState('');
    const [appointmentDate, setAppointmentDate] = useState('');
    const [appointmentStartTime, setAppointmentStartTime] = useState('');
    const [appointmentEndTime, setAppointmentEndTime] = useState('');

    useEffect(() => {
        fetchKerkesat();
        fetchProfessionals();
    }, []);

    const fetchKerkesat = async () => {
        try {
            setLoading(true);
            const data = await bookingApi.getAllWorkRequests();
            setKerkesat(data);
        } catch (err) {
            setError(err.message);
            console.error('Failed to fetch work requests:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchProfessionals = async () => {
        try {
            const data = await adminApi.getProfiles();
            setProfessionals(data);
        } catch (err) {
            console.error('Failed to fetch professionals:', err);
        }
    };

    const handleApprove = async (kerkesa) => {
        // Check if professional is assigned
        if (!kerkesa.profesionisti_id) {
            alert('Nuk mund të miratohet: Kërkesa duhet të ketë një profesionist të caktuar fillimisht.');
            return;
        }

        // Check if appointment (termini) exists
        if (!kerkesa.terminet || kerkesa.terminet.length === 0) {
            alert('Nuk mund të miratohet: Kërkesa duhet të ketë të paktën një termin (appointment) të krijuar fillimisht.');
            return;
        }

        try {
            await bookingApi.approveWorkRequest(kerkesa.kerkesa_punes_id);
            alert('Kërkesa u miratua me sukses!');
            fetchKerkesat();
        } catch (err) {
            alert('Dështoi miratimi: ' + (err.data?.error?.message || err.message));
        }
    };

    const handleReject = async (kerkesa) => {
        if (!window.confirm('Jeni të sigurt që dëshironi të refuzoni këtë kërkesë?')) {
            return;
        }
        try {
            await bookingApi.denyWorkRequest(kerkesa.kerkesa_punes_id);
            alert('Kërkesa u refuzua me sukses!');
            fetchKerkesat();
        } catch (err) {
            alert('Dështoi refuzimi: ' + (err.data?.error?.message || err.message));
        }
    };

    const handleDelete = async (kerkesa) => {
        if (!window.confirm(`Jeni të sigurt që dëshironi të fshini kërkesën #${kerkesa.kerkesa_punes_id}? Ky veprim nuk mund të zhbëhet.`)) {
            return;
        }
        try {
            console.log('Deleting work request:', kerkesa.kerkesa_punes_id);
            const result = await bookingApi.deleteWorkRequest(kerkesa.kerkesa_punes_id);
            console.log('Delete result:', result);
            alert('Kërkesa u fshi me sukses!');
            // Remove from local state immediately
            setKerkesat(kerkesat.filter(k => k.kerkesa_punes_id !== kerkesa.kerkesa_punes_id));
            // Also refresh from server to be safe
            fetchKerkesat();
        } catch (err) {
            console.error('Delete error:', err);
            console.error('Error details:', {
                status: err.status,
                data: err.data,
                message: err.message
            });
            const errorMessage = err.data?.error?.message || err.data?.error?.details || err.message || 'Error i panjohur';
            alert('Dështoi fshirja: ' + errorMessage);
        }
    };

    const handleAssignProfessional = async () => {
        if (!selectedProfessionalId) {
            alert('Ju lutem zgjidhni një profesionist');
            return;
        }
        try {
            await bookingApi.assignProfessional(selectedKerkesa.kerkesa_punes_id, parseInt(selectedProfessionalId, 10));
            alert('Profesionisti u caktua me sukses!');
            setShowModal(false);
            setSelectedKerkesa(null);
            setSelectedProfessionalId('');
            fetchKerkesat();
        } catch (err) {
            alert('Dështoi caktimi: ' + (err.data?.error?.message || err.message));
        }
    };

    const handleCreateAppointment = async () => {
        if (!appointmentDate || !appointmentStartTime || !appointmentEndTime) {
            alert('Ju lutem plotësoni datën dhe orarin');
            return;
        }

        if (!selectedKerkesa.profesionisti_id) {
            alert('Kërkesa duhet të ketë një profesionist të caktuar fillimisht');
            return;
        }

        try {
            // Fetch professional's services to get their price
            let professionalPrice = null;
            try {
                const services = await catalogApi.getProfessionalServices(selectedKerkesa.profesionisti_id);
                if (services && services.length > 0) {
                    // Calculate average price from all services, or use first service price
                    const prices = services.map(s => parseFloat(s.cmimi)).filter(p => !isNaN(p) && p > 0);
                    if (prices.length > 0) {
                        professionalPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
                        console.log('Professional service prices:', prices, 'Average:', professionalPrice);
                    } else {
                        // If no valid prices, use first service price or null
                        professionalPrice = parseFloat(services[0].cmimi) || null;
                    }
                }
            } catch (serviceErr) {
                console.warn('Could not fetch professional services for price:', serviceErr);
                // Continue without price if we can't fetch it
            }

            const startDateTime = new Date(`${appointmentDate}T${appointmentStartTime}`);
            const endDateTime = new Date(`${appointmentDate}T${appointmentEndTime}`);

            await bookingApi.createAppointmentForRequest(selectedKerkesa.kerkesa_punes_id, {
                koha_fillimit: startDateTime.toISOString(),
                koha_mbarimit: endDateTime.toISOString(),
                cmimi: professionalPrice
            });

            alert('Termini u krijua me sukses!' + (professionalPrice ? ` (Çmimi: €${professionalPrice.toFixed(2)})` : ''));
            setShowModal(false);
            setSelectedKerkesa(null);
            setAppointmentDate('');
            setAppointmentStartTime('');
            setAppointmentEndTime('');
            fetchKerkesat();
        } catch (err) {
            alert('Dështoi krijimi i terminë: ' + (err.data?.error?.message || err.message));
        }
    };

    const openModal = async (kerkesa, type) => {
        // If opening appointment modal, fetch the latest kerkesa data to ensure we have updated professional info
        if (type === 'appointment') {
            try {
                const updatedKerkesa = await bookingApi.getWorkRequest(kerkesa.kerkesa_punes_id);
                setSelectedKerkesa(updatedKerkesa);
                
                // Debug logging
                console.log('Opening appointment modal - Kerkesa data:', {
                    kerkesaId: updatedKerkesa.kerkesa_punes_id,
                    profesionistiId: updatedKerkesa.profesionisti_id,
                    professionalsAvailable: professionals.length,
                    professionalIds: professionals.map(p => ({ id: p.profesionisti_id, name: p.emri }))
                });
                
                if (updatedKerkesa.terminet && updatedKerkesa.terminet.length > 0) {
                    const termin = updatedKerkesa.terminet[0];
                    if (termin.koha_fillimit) {
                        const startDate = new Date(termin.koha_fillimit);
                        setAppointmentDate(startDate.toISOString().split('T')[0]);
                        setAppointmentStartTime(startDate.toTimeString().slice(0, 5));
                        if (termin.koha_mbarimit) {
                            const endDate = new Date(termin.koha_mbarimit);
                            setAppointmentEndTime(endDate.toTimeString().slice(0, 5));
                        }
                    }
                }
            } catch (err) {
                console.error('Error fetching updated kerkesa:', err);
                setSelectedKerkesa(kerkesa);
            }
        } else {
            setSelectedKerkesa(kerkesa);
            if (type === 'assign') {
                setSelectedProfessionalId(kerkesa.profesionisti_id ? String(kerkesa.profesionisti_id) : '');
            }
        }
        
        setActionType(type);
        setShowModal(true);
    };

    const getStatusBadge = (status) => {
        const statusName = status?.status || 'Unknown';
        const colors = {
            'Pending': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
            'Approved': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            'Confirmed': 'bg-green-500/20 text-green-400 border-green-500/30',
            'Rejected': 'bg-red-500/20 text-red-400 border-red-500/30',
        };
        const color = colors[statusName] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${color}`}>
                {statusName}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="text-center py-10 text-gray-500">Duke ngarkuar...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Modal */}
            {showModal && selectedKerkesa && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" style={{ backdropFilter: 'blur(4px)' }}>
                    <div className="bg-[#3a3a3a] rounded-2xl p-6 max-w-2xl w-full border border-white/10 shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold text-white">
                                {actionType === 'assign' && 'Cakto Profesionist'}
                                {actionType === 'appointment' && 'Krijo Termin'}
                            </h2>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setSelectedKerkesa(null);
                                    setActionType(null);
                                    setSelectedProfessionalId('');
                                    setAppointmentDate('');
                                    setAppointmentStartTime('');
                                    setAppointmentEndTime('');
                                }}
                                className="text-white/60 hover:text-white transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div>
                                <p className="text-white/60 text-sm mb-1">Kërkesa:</p>
                                <p className="text-white font-medium">{selectedKerkesa.pershkrimi || 'Nuk ka përshkrim'}</p>
                            </div>
                            {selectedKerkesa.mesazhi && (
                                <div>
                                    <p className="text-white/60 text-sm mb-1">Mesazh:</p>
                                    <p className="text-white">{selectedKerkesa.mesazhi}</p>
                                </div>
                            )}
                        </div>

                        {actionType === 'assign' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-white/80 text-sm font-medium mb-2">
                                        Zgjidh Profesionist
                                    </label>
                                    <select
                                        value={selectedProfessionalId}
                                        onChange={(e) => setSelectedProfessionalId(e.target.value)}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#C00F0C]"
                                    >
                                        <option value="">Zgjidh profesionist...</option>
                                        {professionals.map(prof => (
                                            <option key={prof.profili_id} value={prof.profesionisti_id}>
                                                {prof.emri} ({prof.email})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModal(false);
                                            setSelectedKerkesa(null);
                                            setActionType(null);
                                            setSelectedProfessionalId('');
                                        }}
                                        className="flex-1 px-4 py-2.5 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
                                    >
                                        Anulo
                                    </button>
                                    <button
                                        onClick={handleAssignProfessional}
                                        className="flex-1 px-4 py-2.5 bg-[#C00F0C] text-white font-bold rounded-xl hover:bg-[#a00c0a] transition-colors"
                                    >
                                        Cakto
                                    </button>
                                </div>
                            </div>
                        )}

                        {actionType === 'appointment' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-white/80 text-sm font-medium mb-2">
                                            Data
                                        </label>
                                        <input
                                            type="date"
                                            value={appointmentDate}
                                            onChange={(e) => setAppointmentDate(e.target.value)}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#C00F0C]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-white/80 text-sm font-medium mb-2">
                                            Profesionisti
                                        </label>
                                        {(() => {
                                            const professionalId = selectedKerkesa?.profesionisti_id;
                                            if (!professionalId) {
                                                return (
                                                    <input
                                                        type="text"
                                                        value="Nuk është caktuar - Ju lutem caktoni profesionist fillimisht"
                                                        disabled
                                                        className="w-full px-4 py-3 bg-white/5 border border-red-500/30 rounded-xl text-red-400"
                                                    />
                                                );
                                            }
                                            
                                            // Find the professional by matching IDs (handle both string and number)
                                            const professional = professionals.find(p => {
                                                const pId = parseInt(p.profesionisti_id, 10);
                                                const kId = parseInt(professionalId, 10);
                                                return !isNaN(pId) && !isNaN(kId) && pId === kId;
                                            });
                                            
                                            if (professional) {
                                                return (
                                                    <>
                                                        <input
                                                            type="text"
                                                            value={professional.emri || `ID: ${professionalId}`}
                                                            disabled
                                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white/80"
                                                        />
                                                        {professional.email && (
                                                            <p className="text-xs text-white/40 mt-1">
                                                                {professional.email}
                                                            </p>
                                                        )}
                                                    </>
                                                );
                                            }
                                            
                                            // Professional ID exists but profile not found
                                            return (
                                                <>
                                                    <input
                                                        type="text"
                                                        value={`ID: ${professionalId} (Profili nuk u gjet)`}
                                                        disabled
                                                        className="w-full px-4 py-3 bg-white/5 border border-yellow-500/30 rounded-xl text-yellow-400"
                                                    />
                                                    <p className="text-xs text-yellow-400/60 mt-1">
                                                        Profesionisti me ID {professionalId} nuk u gjet në listën e profileve. Mund të jetë në një shërbim tjetër.
                                                    </p>
                                                </>
                                            );
                                        })()}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-white/80 text-sm font-medium mb-2">
                                            Ora Fillimit
                                        </label>
                                        <input
                                            type="time"
                                            value={appointmentStartTime}
                                            onChange={(e) => setAppointmentStartTime(e.target.value)}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#C00F0C]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-white/80 text-sm font-medium mb-2">
                                            Ora Mbarimit
                                        </label>
                                        <input
                                            type="time"
                                            value={appointmentEndTime}
                                            onChange={(e) => setAppointmentEndTime(e.target.value)}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#C00F0C]"
                                        />
                                    </div>
                                </div>
                                {(() => {
                                    const professionalId = selectedKerkesa?.profesionisti_id;
                                    const professional = professionalId 
                                        ? professionals.find(p => {
                                            const pId = parseInt(p.profesionisti_id, 10);
                                            const kId = parseInt(professionalId, 10);
                                            return !isNaN(pId) && !isNaN(kId) && pId === kId;
                                        })
                                        : null;
                                    
                                    if (professional) {
                                        return (
                                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                                                <p className="text-sm text-blue-400 font-medium">
                                                    💰 Çmimi do të vendoset automatikisht sipas çmimeve të shërbimeve të profesionistit
                                                </p>
                                            </div>
                                        );
                                    }
                                    return null;
                                })()}
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModal(false);
                                            setSelectedKerkesa(null);
                                            setActionType(null);
                                            setAppointmentDate('');
                                            setAppointmentStartTime('');
                                            setAppointmentEndTime('');
                                        }}
                                        className="flex-1 px-4 py-2.5 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
                                    >
                                        Anulo
                                    </button>
                                    <button
                                        onClick={handleCreateAppointment}
                                        className="flex-1 px-4 py-2.5 bg-[#C00F0C] text-white font-bold rounded-xl hover:bg-[#a00c0a] transition-colors"
                                    >
                                        Krijo Termin
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Menaxhimi i Kërkesave</h1>
                    <p className="text-white/60 font-medium">Mirato, refuzo dhe cakto profesionistë për kërkesat e punës.</p>
                </div>
                <button
                    onClick={fetchKerkesat}
                    className="px-6 py-3 bg-[#C00F0C] text-white font-bold rounded-2xl shadow-xl shadow-red-900/30 hover:shadow-red-900/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Rifresko
                </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#3a3a3a] rounded-2xl p-4 border border-white/5">
                    <p className="text-2xl font-bold text-[#C00F0C]">{kerkesat.length}</p>
                    <p className="text-xs text-white/40 font-medium">Total Kërkesa</p>
                </div>
                <div className="bg-[#3a3a3a] rounded-2xl p-4 border border-white/5">
                    <p className="text-2xl font-bold text-yellow-400">
                        {kerkesat.filter(k => k.statusi?.status === 'Pending').length}
                    </p>
                    <p className="text-xs text-white/40 font-medium">Në Pritje</p>
                </div>
                <div className="bg-[#3a3a3a] rounded-2xl p-4 border border-white/5">
                    <p className="text-2xl font-bold text-green-400">
                        {kerkesat.filter(k => k.statusi?.status === 'Confirmed').length}
                    </p>
                    <p className="text-xs text-white/40 font-medium">Të Konfirmuara</p>
                </div>
                <div className="bg-[#3a3a3a] rounded-2xl p-4 border border-white/5">
                    <p className="text-2xl font-bold text-red-400">
                        {kerkesat.filter(k => k.statusi?.status === 'Rejected').length}
                    </p>
                    <p className="text-xs text-white/40 font-medium">Të Refuzuara</p>
                </div>
            </div>

            {/* Table */}
            <div className="bg-[#3a3a3a] rounded-[2.5rem] p-8 shadow-lg border border-white/5">
                {error && (
                    <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400">
                        {error}
                    </div>
                )}

                {kerkesat.length === 0 ? (
                    <div className="text-center py-10 text-white/60">
                        Nuk ka kërkesa për të shfaqur.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="text-left py-4 px-4 text-white/80 font-bold text-sm">ID</th>
                                    <th className="text-left py-4 px-4 text-white/80 font-bold text-sm">Përshkrimi</th>
                                    <th className="text-left py-4 px-4 text-white/80 font-bold text-sm">Statusi</th>
                                    <th className="text-left py-4 px-4 text-white/80 font-bold text-sm">Profesionisti</th>
                                    <th className="text-left py-4 px-4 text-white/80 font-bold text-sm">Terminet</th>
                                    <th className="text-left py-4 px-4 text-white/80 font-bold text-sm">Data</th>
                                    <th className="text-left py-4 px-4 text-white/80 font-bold text-sm">Veprime</th>
                                </tr>
                            </thead>
                            <tbody>
                                {kerkesat.map((kerkesa) => (
                                    <tr key={kerkesa.kerkesa_punes_id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="py-4 px-4 text-white/60">{kerkesa.kerkesa_punes_id}</td>
                                        <td className="py-4 px-4 text-white">
                                            <div className="max-w-xs truncate" title={kerkesa.pershkrimi}>
                                                {kerkesa.pershkrimi || 'Nuk ka përshkrim'}
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            {getStatusBadge(kerkesa.statusi)}
                                        </td>
                                        <td className="py-4 px-4 text-white/60">
                                            {kerkesa.profesionisti_id 
                                                ? (professionals.find(p => parseInt(p.profesionisti_id, 10) === parseInt(kerkesa.profesionisti_id, 10))?.emri || `ID: ${kerkesa.profesionisti_id}`)
                                                : 'Nuk është caktuar'
                                            }
                                        </td>
                                        <td className="py-4 px-4 text-white/60">
                                            {kerkesa.terminet && kerkesa.terminet.length > 0 
                                                ? `${kerkesa.terminet.length} termin(e)`
                                                : 'Nuk ka'
                                            }
                                        </td>
                                        <td className="py-4 px-4 text-white/60 text-sm">
                                            {new Date(kerkesa.createdAt || kerkesa.koha_krijimit).toLocaleDateString('sq-AL')}
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {kerkesa.statusi?.status === 'Pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(kerkesa)}
                                                            className={`px-3 py-1.5 rounded-lg transition-colors text-xs font-medium ${
                                                                kerkesa.profesionisti_id && kerkesa.terminet && kerkesa.terminet.length > 0
                                                                    ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                                                    : 'bg-gray-500/20 text-gray-400 cursor-not-allowed opacity-50'
                                                            }`}
                                                            title={
                                                                !kerkesa.profesionisti_id
                                                                    ? 'Mirato: Duhet të caktohet profesionist fillimisht'
                                                                    : (!kerkesa.terminet || kerkesa.terminet.length === 0)
                                                                    ? 'Mirato: Duhet të krijohet termin fillimisht'
                                                                    : 'Mirato'
                                                            }
                                                            disabled={!kerkesa.profesionisti_id || !kerkesa.terminet || kerkesa.terminet.length === 0}
                                                        >
                                                            Mirato
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(kerkesa)}
                                                            className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-xs font-medium"
                                                            title="Refuzo"
                                                        >
                                                            Refuzo
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    onClick={() => openModal(kerkesa, 'assign')}
                                                    className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-xs font-medium"
                                                    title="Cakto Profesionist"
                                                >
                                                    Cakto
                                                </button>
                                                {kerkesa.profesionisti_id && (
                                                    <button
                                                        onClick={() => openModal(kerkesa, 'appointment')}
                                                        className="px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors text-xs font-medium"
                                                        title="Krijo Termin"
                                                    >
                                                        Termin
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(kerkesa)}
                                                    className="px-3 py-1.5 bg-red-600/20 text-red-300 rounded-lg hover:bg-red-600/30 transition-colors text-xs font-medium border border-red-500/30"
                                                    title="Fshi Kërkesën"
                                                >
                                                    Fshi
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
