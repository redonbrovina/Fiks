import { Outlet, Navigate } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';
import { tokenStorage } from '../services/api';

export default function AdminLayout() {
    // Check if user is authenticated
    if (!tokenStorage.isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }

    // Check if user has admin role
    if (!tokenStorage.isAdmin()) {
        // User is logged in but not an admin - redirect to regular dashboard
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="min-h-screen bg-[#2d2d2d] flex flex-col font-sans">
            <AdminNavbar />
            <main className="flex-grow p-6 md:p-10 max-w-7xl mx-auto w-full">
                <Outlet />
            </main>
        </div>
    );
}
