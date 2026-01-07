import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi, catalogApi, tokenStorage } from '../../../services/api';

export default function AddService() {
    const navigate = useNavigate();
    const [isProfessional, setIsProfessional] = useState(false);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        // Professional info (only if upgrading)
        bio: '',

        // Service info
        titulli: '',
        pershkrimi: '',
        cmimi: '',
        kategoria_id: '',
        koha_punes: '1 orë' // Default
    });
    const [error, setError] = useState('');

    useEffect(() => {
        // Check if user is already professional
        const checkRole = () => {
            if (tokenStorage.isProfessional()) {
                setIsProfessional(true);
            }
        };
        checkRole();

        // Fetch categories
        const fetchCategories = async () => {
            try {
                const data = await catalogApi.getCategories();
                setCategories(data);
            } catch (err) {
                console.error('Failed to load categories', err);
            }
        };
        fetchCategories();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isProfessional) {
                // Add Service (Catalog API)
                await catalogApi.createService(formData);
                navigate('/professional-dashboard', { state: { success: 'Shërbimi u shtua me sukses!' } });
            } else {
                // Become Professional (Identity API)
                const payload = {
                    bio: formData.bio,
                    service: {
                        titulli: formData.titulli,
                        pershkrimi: formData.pershkrimi,
                        cmimi: parseFloat(formData.cmimi),
                        kategoria_id: parseInt(formData.kategoria_id)
                    }
                };
                await userApi.becomeProfessional(payload);

                // Since token changes (new role), we might need to re-login or just update local storage?
                // The API returns new tokens.
                navigate('/professional-dashboard', { state: { success: 'Urime! Tani jeni profesionist.' } });
                window.location.reload(); // Force reload to refresh context/state with new token
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error?.message || 'Ndodhi një gabim gjatë procesimit.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#3a3a3a] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-[#2a2a2a] rounded-2xl shadow-xl overflow-hidden border border-white/5">
                    <div className="px-8 py-6 border-b border-white/5 bg-white/5">
                        <h2 className="text-2xl font-bold text-white">
                            {isProfessional ? 'Shto Shërbim të Ri' : 'Bëhu Profesionist'}
                        </h2>
                        <p className="mt-1 text-gray-400">
                            {isProfessional
                                ? 'Plotësoni detajet për shërbimin e ri që ofroni.'
                                : 'Për t\'u bërë profesionist, ju lutem plotësoni bion dhe shtoni shërbimin tuaj të parë.'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-red-200 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Bio - Only for new professionals */}
                        {!isProfessional && (
                            <div className="space-y-2">
                                <label className="text-white text-sm font-medium">Bio Personale</label>
                                <textarea
                                    name="bio"
                                    required
                                    rows="3"
                                    className="w-full px-4 py-3 bg-[#3a3a3a] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#C00F0C] focus:ring-1 focus:ring-[#C00F0C] transition-colors resize-none"
                                    placeholder="Shkruani diçka rreth jush dhe eksperiencës suaj..."
                                    value={formData.bio}
                                    onChange={handleChange}
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Service Title */}
                            <div className="space-y-2">
                                <label className="text-white text-sm font-medium">Titulli i Shërbimit</label>
                                <input
                                    type="text"
                                    name="titulli"
                                    required
                                    className="w-full px-4 py-3 bg-[#3a3a3a] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#C00F0C] focus:ring-1 focus:ring-[#C00F0C] transition-colors"
                                    placeholder="p.sh. Pastrim Shtëpie"
                                    value={formData.titulli}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Category */}
                            <div className="space-y-2">
                                <label className="text-white text-sm font-medium">Kategoria</label>
                                <select
                                    name="kategoria_id"
                                    required
                                    className="w-full px-4 py-3 bg-[#3a3a3a] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#C00F0C] focus:ring-1 focus:ring-[#C00F0C] transition-colors appearance-none"
                                    value={formData.kategoria_id}
                                    onChange={handleChange}
                                >
                                    <option value="" className="bg-[#3a3a3a]">Zgjidhni kategorinë</option>
                                    {categories.map((cat) => (
                                        <optgroup key={cat.kategoria_id} label={cat.lloji_kategorise} className="bg-[#3a3a3a]">
                                            {cat.nenKategorite?.map((sub) => (
                                                <option key={sub.kategoria_id} value={sub.kategoria_id}>
                                                    {sub.lloji_kategorise}
                                                </option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
                            </div>

                            {/* Price */}
                            <div className="space-y-2">
                                <label className="text-white text-sm font-medium">Çmimi (€)</label>
                                <input
                                    type="number"
                                    name="cmimi"
                                    step="0.01"
                                    required
                                    className="w-full px-4 py-3 bg-[#3a3a3a] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#C00F0C] focus:ring-1 focus:ring-[#C00F0C] transition-colors"
                                    placeholder="0.00"
                                    value={formData.cmimi}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <label className="text-white text-sm font-medium">Përshkrimi i Shërbimit</label>
                            <textarea
                                name="pershkrimi"
                                required
                                rows="4"
                                className="w-full px-4 py-3 bg-[#3a3a3a] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#C00F0C] focus:ring-1 focus:ring-[#C00F0C] transition-colors resize-none"
                                placeholder="Përshkruani detajet e shërbimit, çfarë përfshihet, etj..."
                                value={formData.pershkrimi}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end gap-4 pt-4 border-t border-white/5">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="px-6 py-2.5 text-white/70 hover:text-white font-medium transition-colors"
                            >
                                Anulo
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-8 py-2.5 bg-[#C00F0C] hover:bg-[#a00c0a] text-white font-bold rounded-xl shadow-lg shadow-red-900/20 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Duke procesuar...' : (isProfessional ? 'Shto Shërbimin' : 'Regjistrohu & Shto')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
