'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    isAuthenticated as checkAuthenticated,
    isAdmin as checkAdmin,
    getUser,
} from '@/lib/auth';

export const useAuth = (requireAdmin = false) => {
    const router = useRouter();

    const [mounted, setMounted] = useState(false);
    const [authenticated, setAuthenticated] = useState(false);
    const [clientIsAdmin, setClientIsAdmin] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const loggedIn = checkAuthenticated();
        const admin = checkAdmin();

        setAuthenticated(loggedIn);
        setClientIsAdmin(admin);
        setUser(getUser());
        setMounted(true);

        if (!loggedIn) {
            router.replace('/login');
            return;
        }

        if (requireAdmin && !admin) {
            router.replace('/dashboard');
        }
    }, [router, requireAdmin]);

    return {
        mounted,
        isAuthenticated: authenticated,
        isAdmin: clientIsAdmin,
        clientIsAdmin,
        user,
    };
};