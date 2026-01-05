import { useState } from 'react';
import { Link } from 'react-router-dom';
import fiksLogo from '../../assets/images/fiks.png';

const SignIn = () => {
    const [formData, setFormData] = useState({
        email: '',
        fjalekalimi: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // TODO: Connect to Identity service API
        console.log('Login attempt:', formData);

        setTimeout(() => {
            setIsLoading(false);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-[#E6E6E6] flex flex-col font-sans">
            {/* Back Button */}
            <div className="absolute top-6 left-6 z-10">
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

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md">
                    {/* Logo */}
                    <div className="text-center mb-10">
                        <div className="flex justify-center mb-6">
                            <img
                                src={fiksLogo}
                                alt="Fiks Logo"
                                className="h-12 w-auto"
                            />
                        </div>
                        <h1 className="text-3xl font-bold text-[#444444] mb-2">Mirësevini përsëri</h1>
                    </div>

                    {/* Sign In Card */}
                    <div className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-gray-200/50 border border-gray-100">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Email Field */}
                            <div className="space-y-2">
                                <label htmlFor="email" className="block text-sm font-bold text-[#444444] ml-1">
                                    Email
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5 text-[#444444]/40"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                        </svg>
                                    </div>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="emri@email.com"
                                        required
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl text-[#444444] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C00F0C]/20 transition-all duration-300 font-medium"
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <label htmlFor="fjalekalimi" className="block text-sm font-bold text-[#444444] ml-1">
                                    Fjalëkalimi
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5 text-[#444444]/40"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="fjalekalimi"
                                        name="fjalekalimi"
                                        value={formData.fjalekalimi}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        required
                                        className="w-full pl-12 pr-12 py-4 bg-gray-50 border-none rounded-2xl text-[#444444] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C00F0C]/20 transition-all duration-300 font-medium"
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
                            </div>

                            {/* Remember Me & Forgot Password */}
                            <div className="flex items-center justify-between px-1">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <div className="relative flex items-center">
                                        <input
                                            type="checkbox"
                                            className="peer appearance-none w-5 h-5 rounded-md border-2 border-gray-200 bg-white checked:bg-[#C00F0C] checked:border-[#C00F0C] transition-all duration-200 cursor-pointer"
                                        />
                                        <svg className="absolute w-3 h-3 text-white left-1 pointer-events-none hidden peer-checked:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-semibold text-[#444444]/70 group-hover:text-[#444444] transition-colors">Më mbaj mend</span>
                                </label>
                                <Link
                                    to="/harresa-fjalekalimi"
                                    className="text-sm font-bold text-[#C00F0C] hover:underline underline-offset-4 transition-all"
                                >
                                    Harruat fjalëkalimin?
                                </Link>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 px-4 bg-[#C00F0C] text-white font-bold rounded-2xl shadow-lg shadow-red-200 hover:shadow-red-300 hover:scale-[1.01] active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 mt-4"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Duke u kyçur...</span>
                                    </>
                                ) : (
                                    <span>Vazhdo</span>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Sign Up Link */}
                    <p className="text-center mt-8 text-[#444444]/60 font-semibold">
                        Nuk keni llogari?{' '}
                        <Link to="/signup" className="text-[#C00F0C] hover:underline underline-offset-4 font-bold transition-all">
                            Regjistrohu tani
                        </Link>
                    </p>
                </div>
            </div>

            {/* Subtle patterns for visual interest */}
            <div className="fixed inset-0 pointer-events-none opacity-20">
                <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-[#C00F0C]/5 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[30%] bg-blue-400/5 rounded-full blur-[80px]"></div>
            </div>
        </div>
    );
};

export default SignIn;
