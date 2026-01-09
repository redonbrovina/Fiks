import { useState, useEffect } from 'react';
import { useNavigate, NavLink, Link } from 'react-router-dom';
import { authApi, tokenStorage } from '../services/api';

export default function UserNavbar() {
    const navigate = useNavigate();
    const [profileImage, setProfileImage] = useState(null);
    const user = tokenStorage.getUser();

    useEffect(() => {
        // Get profile image from localStorage
        const storedUser = tokenStorage.getUser();
        if (storedUser?.profileImage) {
            setProfileImage(storedUser.profileImage);
        }

        // Listen for storage changes (when profile image is updated)
        const handleStorageChange = () => {
            const updatedUser = tokenStorage.getUser();
            if (updatedUser?.profileImage) {
                setProfileImage(updatedUser.profileImage);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

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

    const handleProfileClick = () => {
        navigate('/profile');
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        // Check if it's a base64 image (for regular users)
        if (imagePath.startsWith('data:image')) return imagePath;
        // Check if it's a full URL
        if (imagePath.startsWith('http')) return imagePath;
        // Otherwise it's a server path
        return `/api/v1/catalog${imagePath}`;
    };

    const navLinkClass = ({ isActive }) =>
        `text-sm font-bold transition-colors ${isActive ? 'text-[#C00F0C]' : 'text-[#444444]/60 hover:text-[#C00F0C]'
        }`;

    return (
        <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
            <div className="flex items-center gap-8">
                <div className="md:flex items-center gap-6">
                    <NavLink to="/dashboard" className={navLinkClass}>Dashboard</NavLink>
                    <NavLink to="/professional-dashboard" className={navLinkClass}>Paneli Profesionist</NavLink>
                    <NavLink to="/marketplace" className={navLinkClass}>Marketi</NavLink>
                    <NavLink to="/bookings" className={navLinkClass}>Rezervimet</NavLink>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button
                    onClick={handleLogout}
                    className="px-5 py-2.5 bg-gray-50 text-[#444444] text-sm font-bold rounded-xl hover:bg-red-50 hover:text-[#C00F0C] transition-all duration-300"
                >
                    Dil
                </button>
                <button
                    onClick={handleProfileClick}
                    className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center border-2 border-[#C00F0C]/20 hover:border-[#C00F0C]/50 transition-all duration-300 hover:scale-105 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C00F0C]/30"
                    title="Shko te Profili"
                >
                    {profileImage ? (
                        <img
                            src={getImageUrl(profileImage)}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-[#C00F0C]/5 flex items-center justify-center">
                            <span className="text-[#C00F0C] font-bold text-sm">
                                {user?.emri?.charAt(0)?.toUpperCase() || '?'}
                            </span>
                        </div>
                    )}
                </button>
            </div>
        </nav>
    );
}

