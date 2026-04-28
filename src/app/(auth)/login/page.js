'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import api from '@/lib/axios';
import { setAuth } from '@/lib/auth';

export default function LoginPage() {
    const router = useRouter();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = async (data) => {
        setLoading(true);
        setError('');
        try {
            const response = await api.post('/login', data);
            const { token, user, employee } = response.data;
            setAuth(token, user, employee);
            router.push('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '40px',
                width: '100%',
                maxWidth: '420px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #e2e8f0',
            }}>
                {/* Logo / Title */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        width: '52px',
                        height: '52px',
                        background: '#1e293b',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                        fontSize: '24px',
                    }}>
                        👥
                    </div>
                    <h1 style={{ fontSize: '22px', fontWeight: '600', color: '#1e293b' }}>
                        HR Management
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
                        Sign in to your account
                    </p>
                </div>

                {/* Error message */}
                {error && (
                    <div style={{
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '8px',
                        padding: '12px',
                        marginBottom: '20px',
                        color: '#dc2626',
                        fontSize: '14px',
                    }}>
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)}>
                    {/* Email */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '6px',
                        }}>
                            Email address
                        </label>
                        <input
                            type="email"
                            placeholder="you@company.com"
                            {...register('email', {
                                required: 'Email is required',
                                pattern: {
                                    value: /^\S+@\S+$/i,
                                    message: 'Invalid email address'
                                }
                            })}
                            style={{
                                width: '100%',
                                padding: '10px 14px',
                                border: errors.email ? '1px solid #dc2626' : '1px solid #d1d5db',
                                borderRadius: '8px',
                                fontSize: '14px',
                                outline: 'none',
                                color: '#1e293b',
                            }}
                        />
                        {errors.email && (
                            <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    {/* Password */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '6px',
                        }}>
                            Password
                        </label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            {...register('password', {
                                required: 'Password is required',
                                minLength: {
                                    value: 6,
                                    message: 'Password must be at least 6 characters'
                                }
                            })}
                            style={{
                                width: '100%',
                                padding: '10px 14px',
                                border: errors.password ? '1px solid #dc2626' : '1px solid #d1d5db',
                                borderRadius: '8px',
                                fontSize: '14px',
                                outline: 'none',
                                color: '#1e293b',
                            }}
                        />
                        {errors.password && (
                            <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
                                {errors.password.message}
                            </p>
                        )}
                    </div>

                    {/* Submit button */}
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '11px',
                            background: loading ? '#94a3b8' : '#1e293b',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '15px',
                            fontWeight: '500',
                            cursor: loading ? 'not-allowed' : 'pointer',
                        }}
                    >
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>

                {/* Test credentials */}
                <div style={{
                    marginTop: '24px',
                    padding: '12px',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                }}>
                    <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px', fontWeight: '500' }}>
                        Test credentials:
                    </p>
                    <p style={{ fontSize: '12px', color: '#64748b' }}>
                        Admin: admin@hr.com / password
                    </p>
                    <p style={{ fontSize: '12px', color: '#64748b' }}>
                        Employee: ahmed@hr.com / password
                    </p>
                </div>
            </div>
        </div>
    );
}