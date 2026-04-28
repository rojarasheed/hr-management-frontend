'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, isAdmin, getUser } from '@/lib/auth';

export const useAuth = (requireAdmin = false) => {
    const router = useRouter();
    const [clientIsAdmin, setClientIsAdmin] = useState(false);
    const [user, setUser] = useState(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        if (!isAuthenticated()) {
            router.push('/login');
            return;
        }
        if (requireAdmin && !isAdmin()) {
            router.push('/dashboard');
        }
        setClientIsAdmin(isAdmin());
        setUser(getUser());
        setMounted(true);
    }, [router, requireAdmin]);

    return {
        isAuthenticated: mounted ? isAuthenticated() : false,
        isAdmin: clientIsAdmin,
        clientIsAdmin,
        user,
        mounted,
    };
};