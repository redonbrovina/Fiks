import { useState, useEffect } from 'react';
import AdminTable from '../../../components/AdminTable';
import { adminApi } from '../../../services/api';

// Column definitions for the table
const professionalColumns = [
    { key: 'profili_id', label: 'ID' },
    { key: 'emri', label: 'Emri' },
    { key: 'email', label: 'Email' },
    { key: 'nr_telefonit', label: 'Telefoni', render: (val) => val || '—' },
    {
        key: 'sherbimet',
        label: 'Shërbime',
        render: (val) => val?.length || 0
    },
    {
        key: 'rating',
        label: 'Vlerësimi',
        render: (value) => (
            <div className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-white font-medium">{value ? Number(value).toFixed(1) : '—'}</span>
            </div>
        )
    },
    {
        key: 'createdAt',
        label: 'Data Krijimit',
        render: (value) => new Date(value).toLocaleDateString('sq-AL')
    },
];

// Edit Profile Modal Component
function EditProfileModal({ profile, onClose, onSave }) {
    const [formData, setFormData] = useState({
        emri: profile?.emri || '',
        email: profile?.email || '',
        nr_telefonit: profile?.nr_telefonit || ''
    });
    const [saving, setSaving] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await onSave(profile.profili_id, formData);
            onClose();
        } catch (err) {
            alert('Dështoi ruajtja: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-[#2a2a2a] rounded-2xl w-full max-w-md shadow-2xl border border-white/10">
                <div className="p-6 border-b border-white/10">
                    <h2 className="text-xl font-bold text-white">Redakto Profesionistin</h2>
                    <p className="text-sm text-white/60">ID: {profile?.profili_id}</p>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-1">Emri</label>
                        <input
                            type="text"
                            name="emri"
                            value={formData.emri}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 bg-[#3a3a3a] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#C00F0C]"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 bg-[#3a3a3a] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#C00F0C]"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-1">Nr. Telefonit</label>
                        <input
                            type="text"
                            name="nr_telefonit"
                            value={formData.nr_telefonit}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 bg-[#3a3a3a] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#C00F0C]"
                        />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
                        >
                            Anulo
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 px-4 py-2.5 bg-[#C00F0C] text-white font-bold rounded-xl hover:bg-[#a00c0a] transition-colors disabled:opacity-50"
                        >
                            {saving ? 'Duke ruajtur...' : 'Ruaj'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function ProfessionalsManagement() {
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingProfile, setEditingProfile] = useState(null);

    useEffect(() => {
        fetchProfiles();
    }, []);

    const fetchProfiles = async () => {
        try {
            setLoading(true);
            const data = await adminApi.getProfiles();
            setProfiles(data);
        } catch (err) {
            setError(err.message);
            console.error('Failed to fetch profiles:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (profile) => {
        setEditingProfile(profile);
    };

    const handleSaveEdit = async (profileId, profileData) => {
        await adminApi.updateProfile(profileId, profileData);
        setProfiles(profiles.map(p =>
            p.profili_id === profileId ? { ...p, ...profileData } : p
        ));
    };

    const handleDelete = async (profile) => {
        if (!confirm(`Jeni të sigurt që doni të fshini profesionistin "${profile.emri}"?`)) return;
        try {
            await adminApi.deleteProfile(profile.profili_id);
            setProfiles(profiles.filter(p => p.profili_id !== profile.profili_id));
        } catch (err) {
            alert('Dështoi fshirja: ' + err.message);
        }
    };

    // Calculate average rating
    const avgRating = profiles.length > 0
        ? (profiles.reduce((sum, p) => sum + (Number(p.rating) || 0), 0) / profiles.length).toFixed(1)
        : '0.0';

    // Count total services
    const totalServices = profiles.reduce((sum, p) => sum + (p.sherbimet?.length || 0), 0);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Edit Modal */}
            {editingProfile && (
                <EditProfileModal
                    profile={editingProfile}
                    onClose={() => setEditingProfile(null)}
                    onSave={handleSaveEdit}
                />
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Menaxhimi i Profesionistëve</h1>
                    <p className="text-white/60 font-medium">Shiko dhe menaxho të gjithë profesionistët e regjistruar.</p>
                </div>
                <button
                    onClick={fetchProfiles}
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
                    <p className="text-2xl font-bold text-[#C00F0C]">{profiles.length}</p>
                    <p className="text-xs text-white/40 font-medium">Total Profesionistë</p>
                </div>
                <div className="bg-[#3a3a3a] rounded-2xl p-4 border border-white/5">
                    <p className="text-2xl font-bold text-green-500">{totalServices}</p>
                    <p className="text-xs text-white/40 font-medium">Total Shërbime</p>
                </div>
                <div className="bg-[#3a3a3a] rounded-2xl p-4 border border-white/5">
                    <div className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <p className="text-2xl font-bold text-white">{avgRating}</p>
                    </div>
                    <p className="text-xs text-white/40 font-medium">Mesatarja e Vlerësimit</p>
                </div>
                <div className="bg-[#3a3a3a] rounded-2xl p-4 border border-white/5">
                    <p className="text-2xl font-bold text-yellow-500">
                        {profiles.filter(p => {
                            const date = new Date(p.createdAt);
                            const weekAgo = new Date();
                            weekAgo.setDate(weekAgo.getDate() - 7);
                            return date > weekAgo;
                        }).length}
                    </p>
                    <p className="text-xs text-white/40 font-medium">Të Rinj Këtë Javë</p>
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className="text-center py-12 text-white/60">Duke ngarkuar profesionistët...</div>
            ) : error ? (
                <div className="text-center py-12 text-red-400">{error}</div>
            ) : (
                <AdminTable
                    columns={professionalColumns}
                    data={profiles}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    searchPlaceholder="Kërko profesionistë..."
                />
            )}
        </div>
    );
}

