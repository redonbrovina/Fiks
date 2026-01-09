import React, { useState, useEffect, useRef } from 'react';
import { tokenStorage, userApi, catalogApi } from '../../../services/api';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    // User state
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Profile data
    const [userData, setUserData] = useState({
        emri: '',
        email: '',
        nr_telefonit: '',
        adresa: ''
    });

    // Profile image (stored locally for all users)
    const [profileImage, setProfileImage] = useState(null);

    // Professional profile data (from catalog)
    const [profileData, setProfileData] = useState({
        pershkrimi: ''
    });

    // Experience data
    const [experiences, setExperiences] = useState([]);
    const [showExperienceForm, setShowExperienceForm] = useState(false);
    const [editingExperience, setEditingExperience] = useState(null);
    const [experienceForm, setExperienceForm] = useState({
        pozicioni: '',
        data_fillimit: '',
        data_mbarimit: '',
        roli: '',
        pershkrimi: ''
    });

    // Role checks
    const isProfessional = tokenStorage.isProfessional();
    const user = tokenStorage.getUser();
    const [profesionistiId, setProfesionistiId] = useState(null);

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Get existing profile image from localStorage
            const storedUser = tokenStorage.getUser();
            if (storedUser?.profileImage) {
                setProfileImage(storedUser.profileImage);
            }

            // Fetch user data from identity service
            const userResponse = await userApi.getMe();
            setUserData({
                emri: userResponse.emri || '',
                email: userResponse.email || '',
                nr_telefonit: userResponse.nr_telefonit || '',
                adresa: userResponse.adresa || ''
            });

            // If professional, fetch profile and experiences from catalog
            if (isProfessional && userResponse.profesionisti?.profesionisti_id) {
                const profId = userResponse.profesionisti.profesionisti_id;
                setProfesionistiId(profId);
                localStorage.setItem('profesionisti_id', profId);

                try {
                    const profileResponse = await catalogApi.getProfile(profId);
                    setProfileData({
                        pershkrimi: profileResponse.pershkrimi || ''
                    });

                    // If profile has image, use it
                    if (profileResponse.imazh) {
                        setProfileImage(profileResponse.imazh);
                        // Update in localStorage for navbar
                        const existingUser = tokenStorage.getUser();
                        localStorage.setItem('user', JSON.stringify({
                            ...existingUser,
                            profileImage: profileResponse.imazh
                        }));
                    }
                } catch (profileError) {
                    // Profile might not exist yet, that's ok
                    console.log('No catalog profile found, will create on save');
                }

                try {
                    const experiencesResponse = await catalogApi.getExperiences(profId);
                    setExperiences(Array.isArray(experiencesResponse) ? experiencesResponse : []);
                } catch (expError) {
                    console.log('No experiences found');
                    setExperiences([]);
                }
            }
        } catch (err) {
            console.error('Error fetching user data:', err);
            setError('Dështoi ngarkimi i të dhënave. Ju lutem provoni përsëri.');
        } finally {
            setLoading(false);
        }
    };

    const handleUserChange = (field, value) => {
        setUserData(prev => ({ ...prev, [field]: value }));
    };

    const handleProfileChange = (field, value) => {
        setProfileData(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveProfile = async () => {
        try {
            setSaving(true);
            setError(null);
            setSuccess(null);

            // Update user data in identity service (this works for ALL users)
            await userApi.updateMe({
                emri: userData.emri,
                nr_telefonit: userData.nr_telefonit,
                adresa: userData.adresa
            });

            // Update user in localStorage
            const existingUser = tokenStorage.getUser();
            localStorage.setItem('user', JSON.stringify({
                ...existingUser,
                emri: userData.emri
            }));

            // If professional with catalog profile, update it too
            if (isProfessional && profesionistiId) {
                try {
                    await catalogApi.updateProfile(profesionistiId, {
                        emri: userData.emri,
                        email: userData.email,
                        nr_telefonit: userData.nr_telefonit,
                        pershkrimi: profileData.pershkrimi
                    });
                } catch (profileError) {
                    // Profile might not exist, try to create it
                    if (profileError.status === 404) {
                        try {
                            await catalogApi.createProfile({
                                profesionisti_id: parseInt(profesionistiId),
                                perdoruesi_id: existingUser.perdoruesi_id,
                                emri: userData.emri,
                                email: userData.email,
                                nr_telefonit: userData.nr_telefonit,
                                pershkrimi: profileData.pershkrimi
                            });
                        } catch (createError) {
                            console.log('Could not create catalog profile:', createError.message);
                            // Don't fail the whole save if catalog profile creation fails
                        }
                    } else {
                        console.log('Could not update catalog profile:', profileError.message);
                        // Don't fail the whole save if catalog profile update fails
                    }
                }
            }

            setSuccess('Profili u ruajt me sukses!');
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error('Error saving profile:', err);
            setError('Dështoi ruajtja e profilit. ' + (err.message || ''));
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Ju lutem zgjidhni një imazh.');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('Imazhi duhet të jetë më i vogël se 5MB.');
            return;
        }

        // For professionals with catalog profile, upload to server
        if (isProfessional && profesionistiId) {
            try {
                setSaving(true);
                setError(null);

                const response = await catalogApi.uploadProfileImage(profesionistiId, file);

                // Update local state
                setProfileImage(response.imagePath);

                // Update localStorage for navbar
                const existingUser = tokenStorage.getUser();
                localStorage.setItem('user', JSON.stringify({
                    ...existingUser,
                    profileImage: response.imagePath
                }));

                // Trigger a storage event for navbar to pick up
                window.dispatchEvent(new Event('storage'));

                setSuccess('Imazhi u ngarkua me sukses!');
                setTimeout(() => setSuccess(null), 3000);
            } catch (err) {
                console.error('Error uploading image:', err);
                setError('Dështoi ngarkimi i imazhit. ' + (err.message || ''));
            } finally {
                setSaving(false);
            }
        } else {
            // For regular users, store image locally as base64
            try {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64Image = reader.result;
                    setProfileImage(base64Image);

                    // Update localStorage for navbar
                    const existingUser = tokenStorage.getUser();
                    localStorage.setItem('user', JSON.stringify({
                        ...existingUser,
                        profileImage: base64Image
                    }));

                    // Trigger a storage event for navbar to pick up
                    window.dispatchEvent(new Event('storage'));

                    setSuccess('Imazhi u ruajt me sukses!');
                    setTimeout(() => setSuccess(null), 3000);
                };
                reader.readAsDataURL(file);
            } catch (err) {
                console.error('Error saving image locally:', err);
                setError('Dështoi ruajtja e imazhit.');
            }
        }
    };

    // Experience CRUD
    const handleExperienceChange = (field, value) => {
        setExperienceForm(prev => ({ ...prev, [field]: value }));
    };

    const resetExperienceForm = () => {
        setExperienceForm({
            pozicioni: '',
            data_fillimit: '',
            data_mbarimit: '',
            roli: '',
            pershkrimi: ''
        });
        setEditingExperience(null);
        setShowExperienceForm(false);
    };

    const handleEditExperience = (exp) => {
        setEditingExperience(exp);
        setExperienceForm({
            pozicioni: exp.pozicioni || '',
            data_fillimit: exp.data_fillimit || '',
            data_mbarimit: exp.data_mbarimit || '',
            roli: exp.roli || '',
            pershkrimi: exp.pershkrimi || ''
        });
        setShowExperienceForm(true);
    };

    const handleSaveExperience = async () => {
        try {
            setSaving(true);
            setError(null);

            if (!profesionistiId) {
                setError('ID e profesionistit nuk u gjet.');
                return;
            }

            if (editingExperience) {
                // Update existing
                await catalogApi.updateExperience(editingExperience.pervoja_id, experienceForm);
                setExperiences(prev => prev.map(exp =>
                    exp.pervoja_id === editingExperience.pervoja_id
                        ? { ...exp, ...experienceForm }
                        : exp
                ));
            } else {
                // Create new
                const newExp = await catalogApi.createExperience({
                    profesionisti_id: parseInt(profesionistiId),
                    ...experienceForm
                });
                setExperiences(prev => [newExp, ...prev]);
            }

            resetExperienceForm();
            setSuccess('Përvoja u ruajt me sukses!');
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error('Error saving experience:', err);
            setError('Dështoi ruajtja e përvojës. ' + (err.message || ''));
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteExperience = async (pervojaId) => {
        if (!confirm('A jeni të sigurt që dëshironi ta fshini këtë përvojë?')) return;

        try {
            setSaving(true);
            await catalogApi.deleteExperience(pervojaId);
            setExperiences(prev => prev.filter(exp => exp.pervoja_id !== pervojaId));
            setSuccess('Përvoja u fshi me sukses!');
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error('Error deleting experience:', err);
            setError('Dështoi fshirja e përvojës.');
        } finally {
            setSaving(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Aktualisht';
        return new Date(dateString).toLocaleDateString('sq-AL', {
            year: 'numeric',
            month: 'long'
        });
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        // Check if it's a base64 image
        if (imagePath.startsWith('data:image')) return imagePath;
        // Check if it's a full URL
        if (imagePath.startsWith('http')) return imagePath;
        // Otherwise it's a server path
        return `/api/v1/catalog${imagePath}`;
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="text-center py-10 text-gray-500">Duke ngarkuar...</div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Profili Im</h1>
                <p className="text-gray-500 mt-1">Menaxhoni informacionin tuaj personal</p>
            </div>

            {/* Alerts */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
                    {error}
                </div>
            )}
            {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl">
                    {success}
                </div>
            )}

            {/* Profile Picture Section - Available for ALL users */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Foto e Profilit</h2>
                <div className="flex items-center gap-6">
                    <div className="relative">
                        {profileImage ? (
                            <img
                                src={getImageUrl(profileImage)}
                                alt="Profile"
                                className="w-24 h-24 rounded-full object-cover border-4 border-[#C00F0C]/20"
                            />
                        ) : (
                            <div className="w-24 h-24 bg-[#C00F0C]/10 rounded-full flex items-center justify-center border-4 border-[#C00F0C]/20">
                                <span className="text-[#C00F0C] font-bold text-3xl">
                                    {userData.emri?.charAt(0)?.toUpperCase() || '?'}
                                </span>
                            </div>
                        )}
                    </div>
                    <div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            accept="image/*"
                            className="hidden"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={saving}
                            className="px-5 py-2.5 bg-[#C00F0C] text-white font-bold rounded-xl hover:bg-[#a00d0a] transition-all duration-300 disabled:opacity-50"
                        >
                            {saving ? 'Duke ngarkuar...' : 'Ngarko Foto'}
                        </button>
                        <p className="text-sm text-gray-500 mt-2">JPG, PNG deri në 5MB</p>
                    </div>
                </div>
            </div>

            {/* Basic Info Section */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Informacioni Bazë</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Emri</label>
                        <input
                            type="text"
                            value={userData.emri}
                            onChange={(e) => handleUserChange('emri', e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#C00F0C] focus:ring-2 focus:ring-[#C00F0C]/20 outline-none transition-all"
                            placeholder="Emri juaj"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            value={userData.email}
                            disabled
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                            placeholder="Email-i juaj"
                        />
                        <p className="text-xs text-gray-400 mt-1">Email-i nuk mund të ndryshohet</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Numri i Telefonit</label>
                        <input
                            type="tel"
                            value={userData.nr_telefonit}
                            onChange={(e) => handleUserChange('nr_telefonit', e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#C00F0C] focus:ring-2 focus:ring-[#C00F0C]/20 outline-none transition-all"
                            placeholder="+383 4X XXX XXX"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Adresa</label>
                        <input
                            type="text"
                            value={userData.adresa}
                            onChange={(e) => handleUserChange('adresa', e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#C00F0C] focus:ring-2 focus:ring-[#C00F0C]/20 outline-none transition-all"
                            placeholder="Adresa juaj"
                        />
                    </div>
                </div>

                {/* Description (for professionals) */}
                {isProfessional && (
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Përshkrimi</label>
                        <textarea
                            value={profileData.pershkrimi}
                            onChange={(e) => handleProfileChange('pershkrimi', e.target.value)}
                            rows={4}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#C00F0C] focus:ring-2 focus:ring-[#C00F0C]/20 outline-none transition-all resize-none"
                            placeholder="Shkruani një përshkrim të shkurtër për veten tuaj..."
                        />
                    </div>
                )}

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="px-6 py-3 bg-[#C00F0C] text-white font-bold rounded-xl shadow-lg shadow-red-200 hover:shadow-red-300 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? 'Duke ruajtur...' : 'Ruaj Ndryshimet'}
                    </button>
                </div>
            </div>

            {/* Experience Section (Professionals only) */}
            {isProfessional && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Përvoja</h2>
                        {!showExperienceForm && (
                            <button
                                onClick={() => setShowExperienceForm(true)}
                                className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-all flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Shto Përvojë
                            </button>
                        )}
                    </div>

                    {/* Experience Form */}
                    {showExperienceForm && (
                        <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
                            <h3 className="font-semibold text-gray-900 mb-4">
                                {editingExperience ? 'Ndrysho Përvojën' : 'Shto Përvojë të Re'}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Pozicioni *</label>
                                    <input
                                        type="text"
                                        value={experienceForm.pozicioni}
                                        onChange={(e) => handleExperienceChange('pozicioni', e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#C00F0C] focus:ring-2 focus:ring-[#C00F0C]/20 outline-none"
                                        placeholder="p.sh. Elektricist"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Roli</label>
                                    <input
                                        type="text"
                                        value={experienceForm.roli}
                                        onChange={(e) => handleExperienceChange('roli', e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#C00F0C] focus:ring-2 focus:ring-[#C00F0C]/20 outline-none"
                                        placeholder="p.sh. Senior, Junior"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Data e Fillimit *</label>
                                    <input
                                        type="date"
                                        value={experienceForm.data_fillimit}
                                        onChange={(e) => handleExperienceChange('data_fillimit', e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#C00F0C] focus:ring-2 focus:ring-[#C00F0C]/20 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Data e Mbarimit</label>
                                    <input
                                        type="date"
                                        value={experienceForm.data_mbarimit}
                                        onChange={(e) => handleExperienceChange('data_mbarimit', e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#C00F0C] focus:ring-2 focus:ring-[#C00F0C]/20 outline-none"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">Lëreni bosh nëse akoma punoni</p>
                                </div>
                            </div>
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Përshkrimi</label>
                                <textarea
                                    value={experienceForm.pershkrimi}
                                    onChange={(e) => handleExperienceChange('pershkrimi', e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#C00F0C] focus:ring-2 focus:ring-[#C00F0C]/20 outline-none resize-none"
                                    placeholder="Përshkruani përvojën tuaj..."
                                />
                            </div>
                            <div className="mt-4 flex gap-3 justify-end">
                                <button
                                    onClick={resetExperienceForm}
                                    className="px-4 py-2 text-gray-600 font-semibold hover:text-gray-800 transition-colors"
                                >
                                    Anulo
                                </button>
                                <button
                                    onClick={handleSaveExperience}
                                    disabled={saving || !experienceForm.pozicioni || !experienceForm.data_fillimit}
                                    className="px-5 py-2 bg-[#C00F0C] text-white font-bold rounded-lg hover:bg-[#a00d0a] transition-all disabled:opacity-50"
                                >
                                    {saving ? 'Duke ruajtur...' : editingExperience ? 'Ruaj' : 'Shto'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Experience List */}
                    {experiences.length === 0 && !showExperienceForm ? (
                        <div className="text-center py-8 text-gray-500">
                            <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <p>Nuk keni asnjë përvojë të regjistruar.</p>
                            <button
                                onClick={() => setShowExperienceForm(true)}
                                className="mt-3 text-[#C00F0C] font-semibold hover:underline"
                            >
                                Shtoni përvojën tuaj të parë
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {experiences.map((exp) => (
                                <div key={exp.pervoja_id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900">{exp.pozicioni}</h3>
                                            {exp.roli && (
                                                <p className="text-[#C00F0C] font-medium">{exp.roli}</p>
                                            )}
                                            <p className="text-sm text-gray-500 mt-1">
                                                {formatDate(exp.data_fillimit)} - {formatDate(exp.data_mbarimit)}
                                            </p>
                                            {exp.pershkrimi && (
                                                <p className="text-gray-600 mt-2 text-sm">{exp.pershkrimi}</p>
                                            )}
                                        </div>
                                        <div className="flex gap-2 ml-4">
                                            <button
                                                onClick={() => handleEditExperience(exp)}
                                                className="p-2 text-gray-400 hover:text-[#C00F0C] transition-colors"
                                                title="Ndrysho"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteExperience(exp.pervoja_id)}
                                                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                                title="Fshi"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
