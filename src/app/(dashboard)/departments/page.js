'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import TopBar from '@/components/layout/TopBar';

export default function DepartmentsPage() {
    const [departments, setDepartments] = useState([]);
    const [loading,     setLoading]     = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal,   setShowModal]   = useState(false);
    const [editing,     setEditing]     = useState(null);
    const [saving,      setSaving]      = useState(false);
    const [error,       setError]       = useState('');
    const [form,        setForm]        = useState({ name: '', description: '' });

    useEffect(() => { fetchDepartments(); }, []);

    const fetchDepartments = async () => {
        setLoading(true);
        try {
            const res = await api.get('/departments');
            setDepartments(res.data.data ?? res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const openAdd = () => {
        setEditing(null);
        setForm({ name: '', description: '' });
        setError('');
        setShowModal(true);
    };

    const openEdit = (dept) => {
        setEditing(dept);
        setForm({ name: dept.name, description: dept.description ?? '' });
        setError('');
        setShowModal(true);
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');
        if (!form.name.trim()) { setError('Department name is required.'); setSaving(false); return; }
        try {
            if (editing) {
                await api.put(`/departments/${editing.id}`, form);
            } else {
                await api.post('/departments', form);
            }
            setShowModal(false);
            fetchDepartments();
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this department? This may affect assigned employees.')) return;
        try {
            await api.delete(`/departments/${id}`);
            fetchDepartments();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete department');
        }
    };

    const filtered = departments.filter(d =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div>
            <TopBar title="Departments" />
            <div className="page-content">

                {/* Toolbar */}
                <div className="lr-header">
                    <input
                        className="form-control max-w-xs"
                        placeholder="Search departments..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                    <button className="btn btn-primary ml-auto" onClick={openAdd}>
                        + Add Department
                    </button>
                </div>

                {/* Cards */}
                {loading ? (
                    <div className="state-box">
                        <p className="text-3xl mb-2">⏳</p>
                        <p>Loading departments...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="state-box">
                        <p className="text-3xl mb-2">🏢</p>
                        <p>{searchQuery ? 'No departments match your search.' : 'No departments found.'}</p>
                    </div>
                ) : (
                    <div className="cards-grid">
                        {filtered.map(dept => (
                            <div key={dept.id} className="card flex flex-col gap-3 hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-xl shrink-0">
                                        🏢
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">{dept.name}</p>
                                        <p className="text-xs text-slate-400 mt-0.5">{dept.description || 'No description provided.'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="badge bg-slate-100 text-slate-600">
                                        👥 {dept.employees_count ?? dept.employees?.length ?? 0} employee(s)
                                    </span>
                                </div>
                                <div className="flex gap-2 mt-auto">
                                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(dept)}>Edit</button>
                                    <button className="btn btn-danger btn-sm"    onClick={() => handleDelete(dept.id)}>Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">{editing ? 'Edit Department' : 'Add Department'}</h2>
                            <button className="text-slate-400 hover:text-slate-600 text-lg leading-none" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            {error && <div className="error-msg">{error}</div>}
                            <div className="flex flex-col gap-4">
                                <div>
                                    <label className="form-label">Department Name *</label>
                                    <input
                                        className="form-control"
                                        placeholder="e.g. Engineering"
                                        value={form.name}
                                        onChange={e => setForm({ ...form, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Description</label>
                                    <textarea
                                        className="form-control"
                                        style={{ resize: 'vertical', minHeight: '80px' }}
                                        placeholder="Brief description of this department..."
                                        value={form.description}
                                        onChange={e => setForm({ ...form, description: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6 justify-end">
                                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                                    {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Department'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}