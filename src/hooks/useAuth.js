'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, isAdmin, getUser } from '@/lib/auth';

export const useAuth = (requireAdmin = false) => {
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated()) {
            router.push('/login');
            return;
        }
        if (requireAdmin && !isAdmin()) {
            router.push('/dashboard');
        }
    }, [router, requireAdmin]);

    return {
        isAuthenticated: isAuthenticated(),
        isAdmin: isAdmin(),
        user: getUser(),
    };
};