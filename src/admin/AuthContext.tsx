import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
    id: number;
    email: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    // No loading state needed - no session to check
    const isLoading = false;

    const login = (newToken: string, newUser: User) => {
        setToken(newToken);
        setUser(newUser);
        // No localStorage - session only in memory
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        // No localStorage to clear
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

