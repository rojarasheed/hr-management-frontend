'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import TopBar from '@/components/layout/TopBar';

const typeStyles = {
    'Annual':    { icon: '🌴', bg: 'bg-emerald-50',  text: 'text-emerald-700' },
    'Sick':      { icon: '🏥', bg: 'bg-blue-50',     text: 'text-blue-700'    },
    'Emergency': { icon: '🚨', bg: 'bg-red-50',      text: 'text-red-700'     },
    'Maternity': { icon: '👶', bg: 'bg-pink-50',     text: 'text-pink-700'    },
};

const getStyle = (name) => typeStyles[name] ?? { icon: '📋', bg: 'bg-slate-50', text: 'text-slate-600' };

export default function LeaveTypesPage() {
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [loading,    setLoading]    = useState(true);
    const [showModal,  setShowModal]  = useState(false);
    const [editing,    setEditing]    = useState(null);
    const [saving,     setSaving]     = useState(false);
    const [error,      setError]      = useState('');
    const [form,       setForm]       = useState({ name: '', max_days: '', description: '' });

    useEffect(() => { fetchLeaveTypes(); }, []);

    const fetchLeaveTypes = async () => {
        setLoading(true);
        try {
            const res = await api.get('/leave-types');
            setLeaveTypes(res.data.data ?? res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const openAdd = () => {
        setEditing(null);
        setForm({ name: '', max_days: '', description: '' });
        setError('');
        setShowModal(true);
    };

    const openEdit = (lt) => {
        setEditing(lt);
        setForm({ name: lt.name, max_days: lt.max_days, description: lt.description ?? '' });
        setError('');
        setShowModal(true);
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');
        if (!form.name.trim() || !form.max_days) {
            setError('Name and days allowed are required.');
            setSaving(false);
            return;
        }
        try {
            if (editing) {
                await api.put(`/leave-types/${editing.id}`, form);
            } else {
                await api.post('/leave-types', form);
            }
            setShowModal(false);
            fetchLeaveTypes();
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this leave type? Existing requests using it may be affected.')) return;
        try {
            await api.delete(`/leave-types/${id}`);
            fetchLeaveTypes();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete leave type');
        }
    };

    return (
        <div>
            <TopBar title="Leave Types" />
            <div className="page-content">

                {/* Toolbar */}
                <div className="lr-header">
                    <p className="text-sm text-slate-500">
                        {leaveTypes.length} leave type{leaveTypes.length !== 1 ? 's' : ''} configured
                    </p>
                    <button className="btn btn-primary" onClick={openAdd}>
                        + Add Leave Type
                    </button>
                </div>

                {/* Cards */}
                {loading ? (
                    <div className="state-box">
                        <p className="text-3xl mb-2">⏳</p>
                        <p>Loading leave types...</p>
                    </div>
                ) : leaveTypes.length === 0 ? (
                    <div className="state-box">
                        <p className="text-3xl mb-2">📋</p>
                        <p>No leave types found. Add one to get started.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {leaveTypes.map(lt => {
                            const { icon, bg, text } = getStyle(lt.name);
                            return (
                                <div key={lt.id} className="card flex flex-col gap-3 hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center text-xl shrink-0`}>
                                            {icon}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800">{lt.name}</p>
                                            <p className="text-xs text-slate-400 mt-0.5">{lt.description || 'No description provided.'}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <span className={`badge ${bg} ${text}`}>
                                            {lt.max_days} days / year
                                        </span>
                                    </div>
                                    <div className="flex gap-2 mt-auto">
                                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(lt)}>Edit</button>
                                        <button className="btn btn-danger btn-sm"    onClick={() => handleDelete(lt.id)}>Delete</button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">{editing ? 'Edit Leave Type' : 'Add Leave Type'}</h2>
                            <button className="text-slate-400 hover:text-slate-600 text-lg leading-none" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            {error && <div className="error-msg">{error}</div>}
                            <div className="flex flex-col gap-4">
                                <div>
                                    <label className="form-label">Leave Type Name *</label>
                                    <input
                                        className="form-control"
                                        placeholder="e.g. Annual, Sick, Emergency"
                                        value={form.name}
                                        onChange={e => setForm({ ...form, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Days Allowed Per Year *</label>
                                    <input
                                        className="form-control"
                                        type="number"
                                        min="1"
                                        placeholder="e.g. 30"
                                        value={form.max_days}
                                        onChange={e => setForm({ ...form, max_days: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Description</label>
                                    <textarea
                                        className="form-control"
                                        style={{ resize: 'vertical', minHeight: '80px' }}
                                        placeholder="Brief description of this leave type..."
                                        value={form.description}
                                        onChange={e => setForm({ ...form, description: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6 justify-end">
                                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                                    {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Leave Type'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}