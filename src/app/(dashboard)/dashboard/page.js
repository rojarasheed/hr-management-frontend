'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { getEmployee } from '@/lib/auth';
import TopBar from '@/components/layout/TopBar';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const StatCard = ({ label, value, color, icon }) => (
    <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '20px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
    }}>
        <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '10px',
            background: color + '20',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
        }}>
            {icon}
        </div>
        <div>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>{label}</p>
            <p style={{ fontSize: '26px', fontWeight: '700', color: '#1e293b' }}>{value}</p>
        </div>
    </div>
);

export default function DashboardPage() {
    const [data, setData]       = useState(null);
    const [loading, setLoading] = useState(true);
    const employee              = getEmployee();
    const isAdmin               = employee?.role === 'admin';

    useEffect(() => {
        api.get('/dashboard')
            .then(res => setData(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div>
            <TopBar title="Dashboard" />
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                Loading...
            </div>
        </div>
    );

    return (
        <div>
            <TopBar title="Dashboard" />
            <div style={{ padding: '24px' }}>

                {/* Admin stats */}
                {isAdmin && (
                    <>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '16px',
                            marginBottom: '24px',
                        }}>
                            <StatCard label="Total Employees"  value={data?.total_employees}   color="#3b82f6" icon="👥" />
                            <StatCard label="Pending Leaves"   value={data?.pending_leaves}    color="#f59e0b" icon="⏳" />
                            <StatCard label="Approved Leaves"  value={data?.approved_leaves}   color="#10b981" icon="✅" />
                            <StatCard label="Rejected Leaves"  value={data?.rejected_leaves}   color="#ef4444" icon="❌" />
                            <StatCard label="Departments"      value={data?.total_departments} color="#8b5cf6" icon="🏢" />
                        </div>

                        {/* Chart */}
                        {data?.by_department?.length > 0 && (
                            <div style={{
                                background: 'white',
                                borderRadius: '12px',
                                padding: '24px',
                                border: '1px solid #e2e8f0',
                                marginBottom: '24px',
                            }}>
                                <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px', color: '#1e293b' }}>
                                    Approved Leaves by Department
                                </h2>
                                <ResponsiveContainer width="100%" height={260}>
                                    <BarChart data={data.by_department}>
                                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                        <YAxis tick={{ fontSize: 12 }} />
                                        <Tooltip />
                                        <Bar dataKey="approved_leaves" radius={[6, 6, 0, 0]}>
                                            {data.by_department.map((_, i) => (
                                                <Cell key={i} fill={['#3b82f6','#10b981','#f59e0b','#8b5cf6'][i % 4]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </>
                )}

                {/* Employee stats */}
                {!isAdmin && (
                    <>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '16px',
                            marginBottom: '24px',
                        }}>
                            <StatCard label="Annual Leave Left"  value={data?.annual_leave_balance} color="#3b82f6" icon="🌴" />
                            <StatCard label="Sick Leave Left"    value={data?.sick_leave_balance}   color="#10b981" icon="🏥" />
                            <StatCard label="Pending Requests"   value={data?.my_pending}           color="#f59e0b" icon="⏳" />
                            <StatCard label="Approved Requests"  value={data?.my_approved}          color="#10b981" icon="✅" />
                        </div>

                        {/* Recent leaves */}
                        <div style={{
                            background: 'white',
                            borderRadius: '12px',
                            padding: '24px',
                            border: '1px solid #e2e8f0',
                        }}>
                            <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#1e293b' }}>
                                Recent Leave Requests
                            </h2>
                            {data?.recent_leaves?.length === 0 && (
                                <p style={{ color: '#94a3b8', fontSize: '14px' }}>No leave requests yet.</p>
                            )}
                            {data?.recent_leaves?.map(leave => (
                                <div key={leave.id} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '12px 0',
                                    borderBottom: '1px solid #f1f5f9',
                                }}>
                                    <div>
                                        <p style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b' }}>
                                            {leave.leave_type?.name}
                                        </p>
                                        <p style={{ fontSize: '12px', color: '#64748b' }}>
                                            {leave.start_date} → {leave.end_date} · {leave.total_days} days
                                        </p>
                                    </div>
                                    <span style={{
                                        padding: '4px 10px',
                                        borderRadius: '20px',
                                        fontSize: '12px',
                                        fontWeight: '500',
                                        background: leave.status === 'approved' ? '#dcfce7' : leave.status === 'rejected' ? '#fee2e2' : '#fef3c7',
                                        color: leave.status === 'approved' ? '#16a34a' : leave.status === 'rejected' ? '#dc2626' : '#d97706',
                                    }}>
                                        {leave.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}