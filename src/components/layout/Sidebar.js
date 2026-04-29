'use client';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getUser, getEmployee, logout } from '@/lib/auth';

const menuItems = [
    { label: 'Dashboard',      href: '/dashboard',      icon: '📊', adminOnly: false },
    { label: 'Employees',      href: '/employees',      icon: '👥', adminOnly: true  },
    { label: 'Departments',    href: '/departments',    icon: '🏢', adminOnly: true  },
    { label: 'Leave Requests', href: '/leave-requests', icon: '📝', adminOnly: false },
    { label: 'Leave Types',    href: '/leave-types',    icon: '📋', adminOnly: true  },
    { label: 'Calendar',       href: '/calendar',       icon: '📅', adminOnly: true  },
];

export default function Sidebar() {
    const pathname          = usePathname();
    const router            = useRouter();
    const [mounted, setMounted]   = useState(false);
    const [user, setUser]         = useState(null);
    const [employee, setEmployee] = useState(null);

    useEffect(() => {
        setUser(getUser());
        setEmployee(getEmployee());
        setMounted(true);
    }, []);

    const isAdmin = employee?.role === 'admin';

    if (!mounted) return null; // don't render until client is ready

    return (
        <div style={{
            width: '260px',
            minHeight: '100vh',
            background: '#1e293b',
            color: 'white',
            position: 'fixed',
            left: 0,
            top: 0,
            display: 'flex',
            flexDirection: 'column',
        }}>
            {/* Logo */}
            <div style={{ padding: '24px 20px', borderBottom: '1px solid #334155' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: '36px', height: '36px',
                        background: '#3b82f6', borderRadius: '8px',
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: '18px',
                    }}>
                        👥
                    </div>
                    <div>
                        <p style={{ fontWeight: '600', fontSize: '15px' }}>HR System</p>
                        <p style={{ fontSize: '11px', color: '#94a3b8' }}>Management Portal</p>
                    </div>
                </div>
            </div>

            {/* Menu */}
            <nav style={{ padding: '16px 12px', flex: 1 }}>
                {menuItems.map((item) => {
                    if (item.adminOnly && !isAdmin) return null;
                    const isActive = pathname === item.href;
                    return (
                        <div
                            key={item.href}
                            onClick={() => router.push(item.href)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '10px 12px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                marginBottom: '4px',
                                background: isActive ? '#3b82f6' : 'transparent',
                                color: isActive ? 'white' : '#94a3b8',
                                fontSize: '14px',
                                fontWeight: isActive ? '500' : '400',
                                transition: 'all 0.15s',
                            }}
                            onMouseEnter={e => {
                                if (!isActive) e.currentTarget.style.background = '#334155';
                            }}
                            onMouseLeave={e => {
                                if (!isActive) e.currentTarget.style.background = 'transparent';
                            }}
                        >
                            <span style={{ fontSize: '16px' }}>{item.icon}</span>
                            {item.label}
                        </div>
                    );
                })}
            </nav>

            {/* User info + logout */}
            <div style={{ padding: '16px 20px', borderTop: '1px solid #334155' }}>
                <div style={{ marginBottom: '12px' }}>
                    <p style={{ fontSize: '13px', fontWeight: '500' }}>{user?.name}</p>
                    <p style={{ fontSize: '11px', color: '#94a3b8' }}>
                        {employee?.role === 'admin' ? '🔑 Admin' : '👤 Employee'} · {employee?.code}
                    </p>
                </div>
                <button
                    onClick={logout}
                    style={{
                        width: '100%', padding: '8px',
                        background: '#dc2626', color: 'white',
                        border: 'none', borderRadius: '8px',
                        fontSize: '13px', cursor: 'pointer', fontWeight: '500',
                    }}
                >
                    Sign out
                </button>
            </div>
        </div>
    );
}