import { useState, useEffect } from 'react';
import AdminTable from '../../../components/AdminTable';
import { feedbackApi, adminApi } from '../../../services/api';

// Column definitions for the reviews table
const reviewColumns = [
    { key: 'review_id', label: 'ID' },
    {
        key: 'score',
        label: 'Vlerësimi',
        render: (val) => {
            const stars = '★'.repeat(val) + '☆'.repeat(5 - val);
            return <span className="text-yellow-400">{stars}</span>;
        }
    },
    {
        key: 'mesazhi',
        label: 'Mesazhi',
        render: (val) => val ? (val.length > 50 ? val.substring(0, 50) + '...' : val) : '—'
    },
    { key: 'profesionisti_id', label: 'Prof. ID' },
    { key: 'perdoruesi_id', label: 'Klient ID' },
    {
        key: 'pergjigje',
        label: 'Përgjigje',
        render: (val) => val ? '✅' : '—'
    },
    {
        key: 'koha_krijimit',
        label: 'Data',
        render: (value) => value ? new Date(value).toLocaleDateString('sq-AL') : '—'
    },
];

// View Review Modal Component
function ViewReviewModal({ review, onClose }) {
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-[#2a2a2a] rounded-2xl w-full max-w-lg shadow-2xl border border-white/10">
                <div className="p-6 border-b border-white/10">
                    <h2 className="text-xl font-bold text-white">Detajet e Vlerësimit</h2>
                    <p className="text-sm text-white/60">ID: {review?.review_id}</p>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-white/60 mb-1">Vlerësimi</label>
                        <div className="text-2xl text-yellow-400">
                            {'★'.repeat(review?.score || 0)}{'☆'.repeat(5 - (review?.score || 0))}
                            <span className="text-white ml-2">({review?.score}/5)</span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-white/60 mb-1">Mesazhi</label>
                        <p className="text-white bg-[#3a3a3a] p-3 rounded-xl">{review?.mesazhi || 'Asnjë mesazh'}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-white/60 mb-1">Profesionisti ID</label>
                            <p className="text-white">{review?.profesionisti_id}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-white/60 mb-1">Klienti ID</label>
                            <p className="text-white">{review?.perdoruesi_id}</p>
                        </div>
                    </div>
                    {review?.pergjigje && (
                        <div>
                            <label className="block text-sm font-medium text-white/60 mb-1">Përgjigja e Profesionistit</label>
                            <p className="text-white bg-green-900/30 p-3 rounded-xl border border-green-500/30">
                                {review.pergjigje.mesazhi}
                            </p>
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-white/60 mb-1">Data e Krijimit</label>
                        <p className="text-white">{review?.koha_krijimit ? new Date(review.koha_krijimit).toLocaleString('sq-AL') : '—'}</p>
                    </div>
                </div>
                <div className="p-6 border-t border-white/10">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2.5 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
                    >
                        Mbyll
                    </button>
                </div>
            </div>
        </div>
    );
}

// Edit Review Modal Component
function EditReviewModal({ review, onClose, onSave }) {
    const [formData, setFormData] = useState({
        score: review?.score || 5,
        mesazhi: review?.mesazhi || ''
    });
    const [saving, setSaving] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await onSave(review.review_id, formData);
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
                    <h2 className="text-xl font-bold text-white">Redakto Vlerësimin</h2>
                    <p className="text-sm text-white/60">ID: {review?.review_id}</p>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-1">Vlerësimi</label>
                        <select
                            name="score"
                            value={formData.score}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 bg-[#3a3a3a] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#C00F0C]"
                        >
                            <option value="1">1 - Shumë Keq</option>
                            <option value="2">2 - Keq</option>
                            <option value="3">3 - Mesatar</option>
                            <option value="4">4 - Mirë</option>
                            <option value="5">5 - Shkëlqyeshëm</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-1">Mesazhi</label>
                        <textarea
                            name="mesazhi"
                            value={formData.mesazhi}
                            onChange={handleChange}
                            rows="4"
                            className="w-full px-4 py-2.5 bg-[#3a3a3a] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#C00F0C]"
                            placeholder="Mesazhi i vlerësimit..."
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

export default function AdminReviews() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingReview, setEditingReview] = useState(null);
    const [viewingReview, setViewingReview] = useState(null);
    const [stats, setStats] = useState({ total: 0, avgRating: 0, thisWeek: 0 });

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const data = await feedbackApi.getAllReviews();
            setReviews(data || []);

            // Calculate stats
            if (data && data.length > 0) {
                const totalScore = data.reduce((sum, r) => sum + r.score, 0);
                const avgRating = totalScore / data.length;
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                const thisWeek = data.filter(r => new Date(r.koha_krijimit) > weekAgo).length;

                setStats({
                    total: data.length,
                    avgRating: Math.round(avgRating * 10) / 10,
                    thisWeek
                });
            }
        } catch (err) {
            setError(err.message);
            console.error('Failed to fetch reviews:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (review) => {
        setEditingReview(review);
    };

    const handleView = (review) => {
        setViewingReview(review);
    };

    const handleSaveEdit = async (reviewId, reviewData) => {
        await feedbackApi.updateReview(reviewId, reviewData);
        setReviews(reviews.map(r =>
            r.review_id === reviewId
                ? { ...r, ...reviewData }
                : r
        ));
    };

    const handleDelete = async (review) => {
        if (!confirm(`Jeni të sigurt që doni të fshini vlerësimin #${review.review_id}?`)) return;
        try {
            await feedbackApi.deleteReview(review.review_id, { is_admin: true });
            setReviews(reviews.filter(r => r.review_id !== review.review_id));
        } catch (err) {
            alert('Dështoi fshirja: ' + err.message);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Modals */}
            {editingReview && (
                <EditReviewModal
                    review={editingReview}
                    onClose={() => setEditingReview(null)}
                    onSave={handleSaveEdit}
                />
            )}
            {viewingReview && (
                <ViewReviewModal
                    review={viewingReview}
                    onClose={() => setViewingReview(null)}
                />
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Menaxhimi i Vlerësimeve</h1>
                    <p className="text-white/60 font-medium">Shiko dhe menaxho të gjithë vlerësimet e klientëve.</p>
                </div>
                <button
                    onClick={fetchReviews}
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
                    <p className="text-2xl font-bold text-[#C00F0C]">{stats.total}</p>
                    <p className="text-xs text-white/40 font-medium">Total Vlerësime</p>
                </div>
                <div className="bg-[#3a3a3a] rounded-2xl p-4 border border-white/5">
                    <p className="text-2xl font-bold text-yellow-400">
                        <span className="text-lg">★</span> {stats.avgRating}
                    </p>
                    <p className="text-xs text-white/40 font-medium">Mesatarja</p>
                </div>
                <div className="bg-[#3a3a3a] rounded-2xl p-4 border border-white/5">
                    <p className="text-2xl font-bold text-green-500">
                        {reviews.filter(r => r.score >= 4).length}
                    </p>
                    <p className="text-xs text-white/40 font-medium">Pozitive (4-5★)</p>
                </div>
                <div className="bg-[#3a3a3a] rounded-2xl p-4 border border-white/5">
                    <p className="text-2xl font-bold text-white">{stats.thisWeek}</p>
                    <p className="text-xs text-white/40 font-medium">Këtë Javë</p>
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className="text-center py-12 text-white/60">Duke ngarkuar vlerësimet...</div>
            ) : error ? (
                <div className="text-center py-12 text-red-400">{error}</div>
            ) : (
                <AdminTable
                    columns={reviewColumns}
                    data={reviews}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onView={handleView}
                    searchPlaceholder="Kërko vlerësime..."
                />
            )}
        </div>
    );
}
