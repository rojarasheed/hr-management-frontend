'use client';
import { useState, useEffect } from 'react';
import { getUser } from '@/lib/auth';

export default function TopBar({ title }) {
    const [user, setUser] = useState(null);

    useEffect(() => {
        setUser(getUser());
    }, []);

    return (
        <div style={{
            height: '64px',
            background: 'white',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            position: 'sticky',
            top: 0,
            zIndex: 10,
        }}>
            <h1 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>
                {title}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    background: '#1e293b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '13px',
                    fontWeight: '600',
                }}>
                    {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: '14px', color: '#374151' }}>{user?.name}</span>
            </div>
        </div>
    );
}