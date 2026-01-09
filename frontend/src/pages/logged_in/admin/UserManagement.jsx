import { useState, useEffect } from 'react';
import AdminTable from '../../../components/AdminTable';
import { adminApi, qytetiApi } from '../../../services/api';

// Column definitions for the table
const userColumns = [
    { key: 'perdoruesi_id', label: 'ID' },
    { key: 'emri', label: 'Emri' },
    { key: 'email', label: 'Email' },
    { key: 'nr_telefonit', label: 'Telefoni', render: (val) => val || '—' },
    {
        key: 'qyteti',
        label: 'Qyteti',
        render: (val) => val?.emri || '—'
    },
    {
        key: 'rolet',
        label: 'Rolet',
        render: (val) => val?.map(r => r.lloji).join(', ') || 'klient'
    },
    {
        key: 'createdAt',
        label: 'Data Regjistrimit',
        render: (value) => new Date(value).toLocaleDateString('sq-AL')
    },
];

// Edit User Modal Component
function EditUserModal({ user, qytetet, onClose, onSave }) {
    const [formData, setFormData] = useState({
        emri: user?.emri || '',
        adresa: user?.adresa || '',
        nr_telefonit: user?.nr_telefonit || '',
        qyteti_id: user?.qyteti_id || ''
    });
    const [saving, setSaving] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await onSave(user.perdoruesi_id, formData);
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
                    <h2 className="text-xl font-bold text-white">Redakto Përdoruesin</h2>
                    <p className="text-sm text-white/60">{user?.email}</p>
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
                        <label className="block text-sm font-medium text-white/80 mb-1">Adresa</label>
                        <input
                            type="text"
                            name="adresa"
                            value={formData.adresa}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 bg-[#3a3a3a] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#C00F0C]"
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
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-1">Qyteti</label>
                        <select
                            name="qyteti_id"
                            value={formData.qyteti_id}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 bg-[#3a3a3a] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#C00F0C]"
                        >
                            <option value="">Zgjidhni qytetin</option>
                            {qytetet.map(q => (
                                <option key={q.qyteti_id} value={q.qyteti_id}>{q.emri}</option>
                            ))}
                        </select>
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

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [qytetet, setQytetet] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingUser, setEditingUser] = useState(null);

    useEffect(() => {
        fetchUsers();
        fetchQytetet();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await adminApi.getUsers();
            setUsers(data);
        } catch (err) {
            setError(err.message);
            console.error('Failed to fetch users:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchQytetet = async () => {
        try {
            const data = await qytetiApi.getAll();
            setQytetet(data);
        } catch (err) {
            console.error('Failed to fetch cities:', err);
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
    };

    const handleSaveEdit = async (userId, userData) => {
        const result = await adminApi.updateUser(userId, userData);
        // Update the user in local state
        setUsers(users.map(u =>
            u.perdoruesi_id === userId
                ? { ...u, ...userData, qyteti: qytetet.find(q => q.qyteti_id == userData.qyteti_id) }
                : u
        ));
    };

    const handleDelete = async (user) => {
        if (!confirm(`Jeni të sigurt që doni të fshini përdoruesin "${user.emri}"?`)) return;
        try {
            await adminApi.deleteUser(user.perdoruesi_id);
            setUsers(users.filter(u => u.perdoruesi_id !== user.perdoruesi_id));
        } catch (err) {
            alert('Dështoi fshirja: ' + err.message);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Edit Modal */}
            {editingUser && (
                <EditUserModal
                    user={editingUser}
                    qytetet={qytetet}
                    onClose={() => setEditingUser(null)}
                    onSave={handleSaveEdit}
                />
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Menaxhimi i Përdoruesve</h1>
                    <p className="text-white/60 font-medium">Shiko dhe menaxho të gjithë përdoruesit e regjistruar.</p>
                </div>
                <button
                    onClick={fetchUsers}
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
                    <p className="text-2xl font-bold text-[#C00F0C]">{users.length}</p>
                    <p className="text-xs text-white/40 font-medium">Total Përdorues</p>
                </div>
                <div className="bg-[#3a3a3a] rounded-2xl p-4 border border-white/5">
                    <p className="text-2xl font-bold text-green-500">
                        {users.filter(u => u.rolet?.some(r => r.lloji === 'profesionist')).length}
                    </p>
                    <p className="text-xs text-white/40 font-medium">Profesionistë</p>
                </div>
                <div className="bg-[#3a3a3a] rounded-2xl p-4 border border-white/5">
                    <p className="text-2xl font-bold text-white">
                        {users.filter(u => u.rolet?.some(r => r.lloji === 'admin')).length}
                    </p>
                    <p className="text-xs text-white/40 font-medium">Adminë</p>
                </div>
                <div className="bg-[#3a3a3a] rounded-2xl p-4 border border-white/5">
                    <p className="text-2xl font-bold text-yellow-500">
                        {users.filter(u => {
                            const date = new Date(u.createdAt);
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
                <div className="text-center py-12 text-white/60">Duke ngarkuar përdoruesit...</div>
            ) : error ? (
                <div className="text-center py-12 text-red-400">{error}</div>
            ) : (
                <AdminTable
                    columns={userColumns}
                    data={users}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    searchPlaceholder="Kërko përdorues..."
                />
            )}
        </div>
    );
}

