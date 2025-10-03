// src/layouts/DashboardLayout.jsx

import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Settings, LogOut, PlusCircle } from 'lucide-react';
// Shadcn imports for components
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/useAuthStore';

// --- Sidebar Navigation Links ---
const navLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { to: '/dashboard/posts', icon: FileText, label: 'All Posts' },
    { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

const Sidebar = ({ navigate }) => {
    const logout = useAuthStore((state) => state.logout);
    const user = useAuthStore((state) => state.user);

    const handleLogout = () => {
        logout();
        navigate('/');
    };
    
    // Use user.name or a simple message
    const userName = user ? user.name || user.email.split('@')[0] : 'Author'; 

    return (
        <div className="w-64 h-full bg-white border-r border-gray-200 p-4 flex flex-col">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Welcome, {userName}!</h2>
            
            {/* Main Navigation */}
            <nav className="flex flex-col space-y-1">
                {navLinks.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        className={({ isActive }) => 
                            `flex items-center p-3 rounded-lg transition-colors text-gray-700 
                             ${isActive ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'hover:bg-gray-100'}`
                        }
                    >
                        <link.icon size={20} className="mr-3" />
                        {link.label}
                    </NavLink>
                ))}
            </nav>
            
            <Separator className="my-6" />

            {/* Create New Post Button (Primary Action) */}
            <Button 
                onClick={() => navigate('/new-post')} 
                className="w-full bg-green-600 hover:bg-green-700 text-white shadow-md mb-6"
            >
                <PlusCircle size={20} className="mr-2" /> New Post
            </Button>
            
            {/* Logout Button (Fixed at the bottom) */}
            <div className="mt-auto">
                <Button 
                    variant="ghost" 
                    onClick={handleLogout}
                    className="w-full text-red-500 hover:bg-red-50 hover:text-red-600"
                >
                    <LogOut size={20} className="mr-3" /> Sign Out
                </Button>
            </div>
        </div>
    );
};

const DashboardLayout = ({ children }) => {
    // The main app router's navigate function needs to be passed down
    // We'll use the hook here and pass it to Sidebar
    const navigate = useNavigate(); 
    
    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar navigate={navigate} />
            
            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto p-8">
                {children}
            </main>
        </div>
    );
};

export default DashboardLayout;