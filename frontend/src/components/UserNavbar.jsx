import { useNavigate, Link } from 'react-router-dom';
import { authApi, tokenStorage } from '../services/api';
import fiksLogo from '../assets/images/fiks.png';

export default function UserNavbar() {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await authApi.logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
            // Even if API fails, clear tokens and redirect
            tokenStorage.clearTokens();
            navigate('/login');
        }
    };

    return (
        <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
            <div className="flex items-center gap-8">
                <Link to="/dashboard" className="flex items-center gap-2">
                    <span className="text-xl font-bold text-[#444444] tracking-tight">Fiks<span className="text-[#C00F0C]">.</span></span>
                </Link>

                <div className="hidden md:flex items-center gap-6">
                    <Link to="/dashboard" className="text-sm font-bold text-[#C00F0C]">Dashboard</Link>
                    <Link to="/bookings" className="text-sm font-bold text-[#444444]/60 hover:text-[#C00F0C] transition-colors">Rezervimet</Link>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button
                    onClick={handleLogout}
                    className="px-5 py-2.5 bg-gray-50 text-[#444444] text-sm font-bold rounded-xl hover:bg-red-50 hover:text-[#C00F0C] transition-all duration-300"
                >
                    Dil
                </button>
                <div className="w-10 h-10 bg-[#C00F0C]/5 rounded-full flex items-center justify-center border border-[#C00F0C]/10">
                    <span className="text-[#C00F0C] font-bold text-sm">RB</span>
                </div>
            </div>
        </nav>
    );
}
