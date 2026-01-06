import { Outlet, Navigate } from 'react-router-dom';
import UserNavbar from './UserNavbar';
import { tokenStorage } from '../services/api';

export default function UserLayout() {
    if (!tokenStorage.isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="min-h-screen bg-[#E6E6E6] flex flex-col font-sans">
            <UserNavbar />
            <main className="flex-grow p-6 md:p-10 max-w-7xl mx-auto w-full">
                <Outlet />
            </main>
        </div>
    );
}
