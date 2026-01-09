import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../../services/api';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await authApi.forgotPassword(email);
            setMessage(response.message);
        } catch (err) {
            setError(err.data?.error?.message || 'Dështoi dërgimi i emailit. Ju lutem provoni përsëri.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F9FAFB] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-outfit">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Link to="/" className="flex justify-center mb-6">
                    <span className="text-3xl font-black text-[#C00F0C] tracking-tighter">FIKS</span>
                </Link>
                <h2 className="text-center text-3xl font-extrabold text-gray-900">
                    Keni harruar fjalëkalimin?
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Shkruani email-in tuaj dhe ne do t'ju dërgojmë një link për ta rivendosur atë.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-gray-100">
                    {message ? (
                        <div className="rounded-xl bg-green-50 p-4 mb-6 border border-green-100 animate-in fade-in zoom-in duration-300">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-green-800">{message}</p>
                                </div>
                            </div>
                            <div className="mt-4">
                                <Link to="/login" className="text-sm font-bold text-green-800 hover:text-green-900 underline">
                                    Kthehu te kyçja
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {error && (
                                <div className="rounded-xl bg-red-50 p-4 border border-red-100 animate-shake">
                                    <div className="flex">
                                        <div className="ml-3 text-sm font-medium text-red-800">{error}</div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">
                                    Email Adresa
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C00F0C] focus:border-transparent transition-all sm:text-sm"
                                    placeholder="emri@shembull.com"
                                />
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-[#C00F0C] hover:bg-[#a50d0a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C00F0C] disabled:opacity-50 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    {isLoading ? 'Duke dërguar...' : 'Dërgo Linkun'}
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Ose</span>
                            </div>
                        </div>

                        <div className="mt-6 text-center">
                            <Link to="/login" className="font-bold text-[#C00F0C] hover:text-[#a50d0a] transition-colors">
                                Kthehu te kyçja
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
