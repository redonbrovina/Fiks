import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { authApi } from '../../services/api';

export default function ResetPassword() {
    const navigate = useNavigate();
    const location = useLocation();

    // Pre-fill email if passed from previous step
    const initialEmail = location.state?.email || '';

    const [email, setEmail] = useState(initialEmail);
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError('Fjalëkalimet nuk përputhen.');
            return;
        }

        if (password.length < 6) {
            setError('Fjalëkalimi duhet të ketë të paktën 6 karaktere.');
            return;
        }

        if (code.length !== 6) {
            setError('Kodi duhet të jetë 6 shifror.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            await authApi.resetPassword({ email, code, fjalekalimi: password });
            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.data?.error?.message || 'Dështoi rivendosja e fjalëkalimit. Provojeni përsëri.');
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-[#F9FAFB] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-outfit">
                <div className="sm:mx-auto sm:w-full sm:max-w-md bg-white py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 text-center border border-gray-100">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                        <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Sukses!</h2>
                    <p className="text-gray-600">Fjalëkalimi juaj u rivendos me sukses. Do të ridrejtoheni te faqja e kyçjes së shpejti.</p>
                    <Link to="/login" className="mt-4 inline-block font-bold text-[#C00F0C] hover:underline">
                        Kliko këtu nëse nuk ridrejtoheni
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F9FAFB] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-outfit">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Link to="/" className="flex justify-center mb-6">
                    <span className="text-3xl font-black text-[#C00F0C] tracking-tighter">FIKS</span>
                </Link>
                <h2 className="text-center text-3xl font-extrabold text-gray-900">
                    Rivendos Fjalëkalimin
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Shkruani kodin e marrë në email dhe fjalëkalimin tuaj të ri.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-gray-100">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="rounded-xl bg-red-50 p-4 border border-red-100 animate-shake">
                                <div className="flex">
                                    <div className="ml-3 text-sm font-medium text-red-800">{error}</div>
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Email Adresa
                            </label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C00F0C] transition-all"
                                placeholder="emri@shembull.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Kodi i Konfirmimit (6 shifra)
                            </label>
                            <input
                                type="text"
                                required
                                maxLength="6"
                                value={code}
                                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                                className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C00F0C] tracking-widest text-center text-lg font-bold"
                                placeholder="000000"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Fjalëkalimi i Ri
                            </label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C00F0C] transition-all"
                                placeholder="******"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Konfirmo Fjalëkalimin
                            </label>
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C00F0C] transition-all"
                                placeholder="******"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-[#C00F0C] hover:bg-[#a50d0a] focus:ring-2 focus:ring-[#C00F0C] disabled:opacity-50 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {isLoading ? 'Duke u procesuar...' : 'Rivendos Fjalëkalimin'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
