import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../api/authService';
import { User, LoginRequest, RegisterRequest } from '../types';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (data: LoginRequest) => Promise<{ success: boolean; message: string }>;
    register: (data: RegisterRequest) => Promise<{ success: boolean; message: string }>;
    logout: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check auth state on mount
    useEffect(() => {
        checkAuthState();
    }, []);

    const checkAuthState = async () => {
        try {
            const isAuth = await authService.isAuthenticated();
            if (isAuth) {
                const storedUser = await authService.getStoredUser();
                if (storedUser) {
                    setUser(storedUser);
                    // Optionally refresh from server
                    try {
                        const response = await authService.getProfile();
                        if (response.success) {
                            setUser(response.data.user);
                        }
                    } catch (error) {
                        // Token might be invalid, logout
                        await authService.logout();
                        setUser(null);
                    }
                }
            }
        } catch (error) {
            console.error('Error checking auth state:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (data: LoginRequest): Promise<{ success: boolean; message: string }> => {
        try {
            const response = await authService.login(data);
            if (response.success) {
                setUser(response.data.user);
            }
            return { success: response.success, message: response.message };
        } catch (error: any) {
            const message = error.response?.data?.message || 'حدث خطأ أثناء تسجيل الدخول';
            return { success: false, message };
        }
    };

    const register = async (data: RegisterRequest): Promise<{ success: boolean; message: string }> => {
        try {
            const response = await authService.register(data);
            return { success: response.success, message: response.message };
        } catch (error: any) {
            const message = error.response?.data?.message || 'حدث خطأ أثناء التسجيل';
            return { success: false, message };
        }
    };

    const logout = async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
        }
    };

    const refreshProfile = async () => {
        try {
            const response = await authService.getProfile();
            if (response.success) {
                setUser(response.data.user);
            }
        } catch (error) {
            console.error('Error refreshing profile:', error);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                login,
                register,
                logout,
                refreshProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
