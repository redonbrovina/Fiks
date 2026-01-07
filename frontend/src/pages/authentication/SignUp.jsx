import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import fiksLogo from '../../assets/images/fiks.png';
import { authApi, qytetiApi, tokenStorage } from '../../services/api';

const SignUp = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        emri: '',
        email: '',
        nr_telefonit: '',
        fjalekalimi: '',
        qyteti_id: '',
        isProfessional: false,
        bio: ''
    });
    const [cities, setCities] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState('');

    // Fetch cities on mount
    useEffect(() => {
        const fetchCities = async () => {
            try {
                const data = await qytetiApi.getAll();
                setCities(data);
            } catch (error) {
                console.error('Failed to fetch cities:', error);
            }
        };
        fetchCities();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    // Client-side validation
    const validateForm = () => {
        const newErrors = {};

        // Name validation
        if (!formData.emri.trim()) {
            newErrors.emri = 'Emri eshte i detyrueshem';
        } else if (formData.emri.trim().length < 3) {
            newErrors.emri = 'Emri duhet te kete se paku 3 karaktere';
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            newErrors.email = 'Email eshte i detyrueshem';
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Email i pavlefshem';
        }

        // Phone validation (optional but if provided must be valid)
        if (formData.nr_telefonit) {
            const phoneRegex = /^(\+383|0)?\s?4[3-9]\s?\d{3}\s?\d{3}$/;
            if (!phoneRegex.test(formData.nr_telefonit.replace(/\s/g, ''))) {
                newErrors.nr_telefonit = 'Numri i telefonit duhet te jete valid (psh: +383 44 123 456)';
            }
        }

        // Password validation
        if (!formData.fjalekalimi) {
            newErrors.fjalekalimi = 'Fjalekalimi eshte i detyrueshem';
        } else if (formData.fjalekalimi.length < 6) {
            newErrors.fjalekalimi = 'Fjalekalimi duhet te kete se paku 6 karaktere';
        }

        // City validation
        if (!formData.qyteti_id) {
            newErrors.qyteti_id = 'Ju lutem zgjedhni qytetin';
        }

        // Professional bio validation
        if (formData.isProfessional && formData.bio && formData.bio.length > 500) {
            newErrors.bio = 'Bio nuk mund te kete me shume se 500 karaktere';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError('');

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const result = await authApi.register({
                emri: formData.emri.trim(),
                email: formData.email.trim().toLowerCase(),
                fjalekalimi: formData.fjalekalimi,
                nr_telefonit: formData.nr_telefonit || null,
                qyteti_id: parseInt(formData.qyteti_id),
                isProfessional: formData.isProfessional,
                bio: formData.isProfessional ? formData.bio : null
            });

            // Store tokens
            tokenStorage.setTokens(result.accessToken, result.refreshToken);

            // Redirect to success page
            navigate('/signup-success');
        } catch (error) {
            if (error.status === 409) {
                setApiError('Ky email tashme ekziston. Ju lutem perdorni nje email tjeter.');
            } else {
                setApiError(error.message || 'Dicka shkoi keq. Ju lutem provoni perseri.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-screen w-full flex flex-col md:flex-row bg-[#E6E6E6] font-sans overflow-hidden relative">
            {/* Split Back Button (Matching SignIn style) */}
            <div className="absolute top-6 left-6 z-20">
                <Link
                    to="/"
                    className="group flex items-center gap-2 text-[#444444] hover:text-[#C00F0C] transition-all duration-300"
                >
                    <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:shadow-md transition-all duration-300">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </div>
                    <span className="text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        Kthehu
                    </span>
                </Link>
            </div>

            {/* Left Side: Design & Logo */}
            <div className="hidden md:flex w-1/2 lg:w-[45%] bg-[#C00F0C] relative items-center justify-center p-12 overflow-hidden">
                {/* Abstract Design Elements */}
                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-black/5 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-white/5 rounded-full blur-[80px]"></div>

                <div className="relative z-10 text-center max-w-sm">
                    <div className="bg-white/10 backdrop-blur-md p-10 rounded-[3rem] border border-white/20 shadow-2xl mb-8 transform hover:scale-105 transition-transform duration-500">
                        <img
                            src={fiksLogo}
                            alt="Fiks Logo"
                            className="w-48 h-auto mx-auto brightness-0 invert"
                        />
                    </div>
                    <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight">
                        Bashkohu me platformen me te madhe te sherbimeve
                    </h2>
                    <p className="text-white/70 text-lg font-medium">
                        Krijo llogarinne tende dhe gjej profesionistet e duhur ose ofro sherbimet tua.
                    </p>
                </div>

                {/* Decorative Pattern */}
                <div className="absolute bottom-0 right-0 p-12 opacity-10 pointer-events-none">
                    <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="100" cy="100" r="100" fill="white" />
                    </svg>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="flex-1 bg-[#E6E6E6] flex items-center justify-center p-6 md:p-12 lg:p-16 overflow-y-auto">
                <div className="w-full max-w-2xl bg-white md:p-10 lg:p-12 md:rounded-[3rem] shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col justify-center min-h-max">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-[#444444] mb-2 tracking-tight">Krijoni llogarinne</h1>
                        <p className="text-gray-400 font-medium italic text-sm">Plotesoni te dhenat per te filluar rrugetimin tuaj.</p>
                    </div>

                    {/* API Error Message */}
                    {apiError && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm font-medium">
                            {apiError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        {/* Name Field */}
                        <div className="space-y-1.5 font-medium">
                            <label htmlFor="emri" className="block text-sm font-bold text-[#444444] ml-1">
                                Emri dhe Mbiemri
                            </label>
                            <input
                                type="text"
                                id="emri"
                                name="emri"
                                value={formData.emri}
                                onChange={handleChange}
                                placeholder="Filan Fisteku"
                                className={`w-full px-5 py-3.5 bg-gray-50 border-2 ${errors.emri ? 'border-red-300' : 'border-transparent'} focus:border-[#C00F0C]/10 rounded-2xl text-[#444444] placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#C00F0C]/5 transition-all duration-300 text-sm font-medium`}
                            />
                            {errors.emri && <p className="text-red-500 text-xs ml-1 mt-1">{errors.emri}</p>}
                        </div>

                        {/* Email Field */}
                        <div className="space-y-1.5">
                            <label htmlFor="email" className="block text-sm font-bold text-[#444444] ml-1">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="emri@email.com"
                                className={`w-full px-5 py-3.5 bg-gray-50 border-2 ${errors.email ? 'border-red-300' : 'border-transparent'} focus:border-[#C00F0C]/10 rounded-2xl text-[#444444] placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#C00F0C]/5 transition-all duration-300 text-sm font-medium`}
                            />
                            {errors.email && <p className="text-red-500 text-xs ml-1 mt-1">{errors.email}</p>}
                        </div>

                        {/* Phone Field */}
                        <div className="space-y-1.5">
                            <label htmlFor="nr_telefonit" className="block text-sm font-bold text-[#444444] ml-1">
                                Numri i telefonit
                            </label>
                            <input
                                type="tel"
                                id="nr_telefonit"
                                name="nr_telefonit"
                                value={formData.nr_telefonit}
                                onChange={handleChange}
                                placeholder="+383 4X XXX XXX"
                                className={`w-full px-5 py-3.5 bg-gray-50 border-2 ${errors.nr_telefonit ? 'border-red-300' : 'border-transparent'} focus:border-[#C00F0C]/10 rounded-2xl text-[#444444] placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#C00F0C]/5 transition-all duration-300 text-sm font-medium`}
                            />
                            {errors.nr_telefonit && <p className="text-red-500 text-xs ml-1 mt-1">{errors.nr_telefonit}</p>}
                        </div>

                        {/* City Dropdown */}
                        <div className="space-y-1.5">
                            <label htmlFor="qyteti_id" className="block text-sm font-bold text-[#444444] ml-1">
                                Qyteti
                            </label>
                            <div className="relative">
                                <select
                                    id="qyteti_id"
                                    name="qyteti_id"
                                    value={formData.qyteti_id}
                                    onChange={handleChange}
                                    className={`w-full px-5 py-3.5 bg-gray-50 border-2 ${errors.qyteti_id ? 'border-red-300' : 'border-transparent'} focus:border-[#C00F0C]/10 rounded-2xl text-[#444444] focus:outline-none focus:ring-4 focus:ring-[#C00F0C]/5 transition-all duration-300 text-sm font-medium appearance-none cursor-pointer pr-12`}
                                >
                                    <option value="">{isLoading ? 'Duke u ngarkuar...' : 'Zgjedhni qytetin'}</option>
                                    {cities.map((city) => (
                                        <option key={city.qyteti_id} value={city.qyteti_id}>
                                            {city.emri}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-[#444444]/40">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                            {errors.qyteti_id && <p className="text-red-500 text-xs ml-1 mt-1">{errors.qyteti_id}</p>}
                        </div>

                        {/* Password Field */}
                        <div className="space-y-1.5 md:col-span-2">
                            <label htmlFor="fjalekalimi" className="block text-sm font-bold text-[#444444] ml-1">
                                Fjalekalimi
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="fjalekalimi"
                                    name="fjalekalimi"
                                    value={formData.fjalekalimi}
                                    onChange={handleChange}
                                    placeholder="********"
                                    className={`w-full px-5 pr-12 py-3.5 bg-gray-50 border-2 ${errors.fjalekalimi ? 'border-red-300' : 'border-transparent'} focus:border-[#C00F0C]/10 rounded-2xl text-[#444444] placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#C00F0C]/5 transition-all duration-300 text-sm font-medium`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#444444]/30 hover:text-[#444444] transition-colors"
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {errors.fjalekalimi && <p className="text-red-500 text-xs ml-1 mt-1">{errors.fjalekalimi}</p>}
                        </div>

                        {/* Professional Section */}
                        <div className="md:col-span-2 bg-[#FDF2F2] p-5 rounded-3xl border border-[#C00F0C]/10 transition-all duration-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-[#444444] text-sm md:text-base">Regjistrohu si Profesionist</h3>
                                    <p className="text-xs text-[#444444]/60 font-medium pr-10">Ofroni sherbimet tuaja dhe filloni te fitoni sot.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="isProfessional"
                                        checked={formData.isProfessional}
                                        onChange={handleChange}
                                        className="sr-only peer"
                                    />
                                    <div className="w-12 h-6 md:w-14 md:h-8 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 md:after:h-6 md:after:w-6 after:transition-all peer-checked:bg-[#C00F0C]"></div>
                                </label>
                            </div>

                            {formData.isProfessional && (
                                <div className="mt-4 grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="space-y-1.5">
                                        <label htmlFor="bio" className="block text-xs font-bold text-[#444444] ml-1">
                                            Pershkruani pervoojen tuaj (Bio)
                                        </label>
                                        <textarea
                                            id="bio"
                                            name="bio"
                                            value={formData.bio}
                                            onChange={handleChange}
                                            placeholder="Une kam mbi 5 vite pervoje si..."
                                            rows="2"
                                            className={`w-full px-4 py-2.5 bg-white border-2 ${errors.bio ? 'border-red-300' : 'border-transparent'} focus:border-[#C00F0C]/10 rounded-xl text-[#444444] placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#C00F0C]/5 transition-all duration-300 text-xs font-medium resize-none`}
                                        ></textarea>
                                        {errors.bio && <p className="text-red-500 text-xs ml-1 mt-1">{errors.bio}</p>}
                                        <p className="text-xs text-gray-400 ml-1">{formData.bio.length}/500 karaktere</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Submit Button & Switch Link */}
                        <div className="md:col-span-2 space-y-4 pt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 px-4 bg-[#C00F0C] text-white font-bold rounded-2xl shadow-xl shadow-red-200 hover:shadow-red-300 hover:scale-[1.01] active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Duke u procesuar...</span>
                                    </>
                                ) : (
                                    <span>Krijo Llogarine</span>
                                )}
                            </button>

                            <p className="text-center text-[#444444]/60 font-bold text-sm">
                                Tashme keni llogari?{' '}
                                <Link to="/login" className="text-[#C00F0C] hover:underline underline-offset-4 font-bold transition-all">
                                    Kyqu ketu
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
