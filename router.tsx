import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from './App';
import { AuthProvider, useAuth } from './admin/AuthContext';
import { LoginPage } from './admin/pages/LoginPage';
import { Dashboard } from './admin/pages/Dashboard';

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/admin/login" replace />;
    }

    return <>{children}</>;
}

// Admin layout with auth provider
function AdminLayout({ children }: { children: React.ReactNode }) {
    return <AuthProvider>{children}</AuthProvider>;
}

export const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
    },
    {
        path: '/admin',
        element: (
            <AdminLayout>
                <ProtectedRoute>
                    <Dashboard />
                </ProtectedRoute>
            </AdminLayout>
        ),
    },
    {
        path: '/admin/login',
        element: (
            <AdminLayout>
                <LoginPage />
            </AdminLayout>
        ),
    },
]);
