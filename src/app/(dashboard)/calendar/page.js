'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { useAuth } from '@/hooks/useAuth';
import TopBar from '@/components/layout/TopBar';

export default function CalendarPage() {
    useAuth();

    const today = new Date();

    const [month, setMonth] = useState(today.getMonth() + 1);
    const [year, setYear] = useState(today.getFullYear());
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCalendar = async () => {
        setLoading(true);

        try {
            const res = await api.get('/leave-requests/calendar', {
                params: { month, year },
            });

            setLeaves(res.data);
        } catch (error) {
            console.error(error);
            alert('Failed to load calendar.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCalendar();
    }, [month, year]);

    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDay = new Date(year, month - 1, 1).getDay();

    const days = [];

    for (let i = 0; i < firstDay; i++) {
        days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        days.push(day);
    }

    const getLeavesForDay = (day) => {
        if (!day) return [];

        const currentDate = new Date(year, month - 1, day);

        return leaves.filter((leave) => {
            const start = new Date(leave.start_date);
            const end = new Date(leave.end_date);

            return currentDate >= start && currentDate <= end;
        });
    };

    const goPrevMonth = () => {
        if (month === 1) {
            setMonth(12);
            setYear(year - 1);
        } else {
            setMonth(month - 1);
        }
    };

    const goNextMonth = () => {
        if (month === 12) {
            setMonth(1);
            setYear(year + 1);
        } else {
            setMonth(month + 1);
        }
    };

    const monthName = new Date(year, month - 1).toLocaleString('default', {
        month: 'long',
    });

    return (
        <div>
            <TopBar title="Leave Calendar" />

            <div className="page-content">
                <div className="card mb-5 flex items-center justify-between">
                    <button className="btn btn-secondary" onClick={goPrevMonth}>
                        ← Previous
                    </button>

                    <h2 className="text-xl font-bold text-slate-800">
                        {monthName} {year}
                    </h2>

                    <button className="btn btn-secondary" onClick={goNextMonth}>
                        Next →
                    </button>
                </div>

                {loading ? (
                    <div className="state-box">
                        <p className="text-3xl mb-2">⏳</p>
                        <p>Loading calendar...</p>
                    </div>
                ) : (
                    <div className="card overflow-x-auto">
                        <div className="grid grid-cols-7 border-b border-slate-200">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                                <div
                                    key={day}
                                    className="p-3 text-center text-xs font-bold text-slate-500 uppercase"
                                >
                                    {day}
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7">
                            {days.map((day, index) => {
                                const dayLeaves = getLeavesForDay(day);

                                return (
                                    <div
                                        key={index}
                                        className="min-h-[120px] border-b border-r border-slate-100 p-2"
                                    >
                                        {day && (
                                            <>
                                                <p className="text-sm font-semibold text-slate-700 mb-2">
                                                    {day}
                                                </p>

                                                <div className="space-y-1">
                                                    {dayLeaves.map((leave) => (
                                                        <div
                                                            key={leave.id}
                                                            className="rounded-md bg-emerald-50 border border-emerald-200 px-2 py-1"
                                                        >
                                                            <p className="text-xs font-semibold text-emerald-700 truncate">
                                                                {leave.employee?.user?.name}
                                                            </p>
                                                            <p className="text-[11px] text-emerald-600 truncate">
                                                                {leave.leave_type?.name}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}