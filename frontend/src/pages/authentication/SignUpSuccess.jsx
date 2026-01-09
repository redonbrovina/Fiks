import { Link } from 'react-router-dom';

export default function SignUpSuccess() {
    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#E6E6E6] font-sans p-6 overflow-hidden relative">

            {/* Background Decorative Elements matches SignUp */}
            <div className="absolute top-[-20%] left-[-10%] w-[70vh] h-[70vh] bg-[#C00F0C]/5 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[60vh] h-[60vh] bg-[#C00F0C]/10 rounded-full blur-[100px] pointer-events-none"></div>

            {/* Main Card */}
            <div className="w-full max-w-md bg-white p-10 md:p-12 rounded-[3rem] shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col items-center text-center relative z-10 animate-in fade-in zoom-in duration-500">
                {/* Success Icon */}
                <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 animate-bounce">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>

                <h1 className="text-3xl font-bold text-[#444444] mb-3 tracking-tight">
                    Llogaria u krijua!
                </h1>

                <p className="text-gray-400 font-medium text-sm mb-8 leading-relaxed px-4">
                    Faleminderit qe u bashkuat me Fiks. Tani mund te kyçeni ne llogarine tuaj dhe te filloni rrugetimin tuaj.
                </p>

                {/* Login Button */}
                <Link
                    to="/login"
                    className="w-full py-4 px-4 bg-[#C00F0C] text-white font-bold rounded-2xl shadow-xl shadow-red-200 hover:shadow-red-300 hover:scale-[1.01] active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-red-100 transition-all duration-300 flex items-center justify-center gap-2"
                >
                    <span>Kyçu Tani</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                </Link>
            </div>

            {/* Footer Copyright */}
            <div className="absolute bottom-6 text-[#444444]/40 text-xs font-bold">
                &copy; {new Date().getFullYear()} Fiks Platform.
            </div>
        </div>
    );
}