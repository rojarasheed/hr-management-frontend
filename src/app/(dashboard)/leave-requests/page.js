'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';
import { useAuth } from '@/hooks/useAuth';
import { format, parseISO } from 'date-fns';
import TopBar from '@/components/layout/TopBar';

function StatusBadge({ status }) {
    const map = {
        pending:  { label: 'Pending',  cls: 'badge-pending'  },
        approved: { label: 'Approved', cls: 'badge-approved' },
        rejected: { label: 'Rejected', cls: 'badge-rejected' },
    };
    const { label, cls } = map[status] ?? { label: status, cls: '' };
    return <span className={`badge ${cls}`}>{label}</span>;
}

function Modal({ title, onClose, children }) {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">{title}</h2>
                    <button className="text-slate-400 hover:text-slate-600 text-lg leading-none" onClick={onClose}>✕</button>
                </div>
                <div className="modal-body">{children}</div>
            </div>
        </div>
    );
}

export default function LeaveRequestsPage() {
    const { clientIsAdmin, user } = useAuth();
const [clientclientIsAdmin, setClientclientIsAdmin] = useState(false);

useEffect(() => {
    setClientclientIsAdmin(clientIsAdmin);
}, [clientIsAdmin]);

    const [requests,    setRequests]    = useState([]);
    const [leaveTypes,  setLeaveTypes]  = useState([]);
    const [employees,   setEmployees]   = useState([]);
    const [loading,     setLoading]     = useState(true);
    const [error,       setError]       = useState('');

    const [filterStatus,   setFilterStatus]   = useState('');
    const [filterEmployee, setFilterEmployee] = useState('');
    const [searchQuery,    setSearchQuery]    = useState('');

    const [showApplyModal,  setShowApplyModal]  = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);

    const [form,       setForm]       = useState({ leave_type_id: '', start_date: '', end_date: '', reason: '' });
    const [formError,  setFormError]  = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const params = {};
            if (filterStatus)   params.status      = filterStatus;
            if (filterEmployee) params.employee_id = filterEmployee;
            const res = await api.get('/leave-requests', { params });
            setRequests(res.data.data ?? res.data);
        } catch {
            setError('Failed to load leave requests.');
        } finally {
            setLoading(false);
        }
    }, [filterStatus, filterEmployee]);

    useEffect(() => { fetchRequests(); }, [fetchRequests]);

    useEffect(() => {
        api.get('/leave-types').then(r => setLeaveTypes(r.data.data ?? r.data)).catch(() => {});
        if (clientclientIsAdmin) {
            api.get('/employees').then(r => setEmployees(r.data.data ?? r.data)).catch(() => {});
        }
    }, [clientclientIsAdmin]);

    const handleApplySubmit = async e => {
        e.preventDefault();
        setFormError('');
        if (!form.leave_type_id || !form.start_date || !form.end_date || !form.reason.trim()) {
            setFormError('Please fill in all fields.');
            return;
        }
        if (new Date(form.end_date) < new Date(form.start_date)) {
            setFormError('End date cannot be before start date.');
            return;
        }
        setSubmitting(true);
        try {
            await api.post('/leave-requests', form);
            setShowApplyModal(false);
            setForm({ leave_type_id: '', start_date: '', end_date: '', reason: '' });
            fetchRequests();
        } catch (err) {
            setFormError(err.response?.data?.message ?? 'Failed to submit request.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleStatusChange = async (id, status) => {
        try {
            await api.post(`/leave-requests/${id}/${status}`);
            fetchRequests();
            setShowDetailModal(false);
        } catch(err) {
            console.log('Status:', err.response?.status);
        console.log('Message:', err.response?.data);
        alert(err.response?.data?.message ?? err.message);
        }
    };

    const handleDelete = async id => {
        if (!confirm('Cancel this leave request?')) return;
        try {
            await api.delete(`/leave-requests/${id}`);
            fetchRequests();
        } catch {
            alert('Failed to cancel request.');
        }
    };

    const handleExportPdf = async () => {
    try {
        const params = new URLSearchParams();
        if (filterStatus)   params.append('status', filterStatus);
        if (filterEmployee) params.append('employee_id', filterEmployee);

        const response = await api.get(`/leave-requests/export-pdf?${params.toString()}`, {
            responseType: 'blob',
        });

        const url  = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href  = url;
        link.setAttribute('download', `leave-report-${new Date().toISOString().split('T')[0]}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    } catch {
        alert('Failed to export PDF.');
    }
};

    const filtered = requests.filter(r => {
        if (!searchQuery) return true;
        const q    = searchQuery.toLowerCase();
        const name = r.employee?.user?.name?.toLowerCase() ?? '';
        const type = r.leave_type?.name?.toLowerCase() ?? '';
        return name.includes(q) || type.includes(q);
    });

    const daysBetween = (start, end) =>
        Math.floor((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24)) + 1;

    const fmt = dateStr => {
        try { return format(parseISO(dateStr), 'dd MMM yyyy'); }
        catch { return dateStr; }
    };

    return (
        <div>
            <TopBar title="Leave Requests" />
            <div className="page-content">

                {/* Summary Cards */}
                {requests.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
                        <div className="card">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Total</p>
                            <p className="text-3xl font-extrabold text-slate-800 mt-1">{requests.length}</p>
                        </div>
                        <div className="card">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Pending</p>
                            <p className="text-3xl font-extrabold text-amber-600 mt-1">{requests.filter(r => r.status === 'pending').length}</p>
                        </div>
                        <div className="card">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Approved</p>
                            <p className="text-3xl font-extrabold text-emerald-600 mt-1">{requests.filter(r => r.status === 'approved').length}</p>
                        </div>
                        <div className="card">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Rejected</p>
                            <p className="text-3xl font-extrabold text-red-600 mt-1">{requests.filter(r => r.status === 'rejected').length}</p>
                        </div>
                    </div>
                )}

                {/* Toolbar */}
                <div className="lr-header">
                    <div className="lr-header-sub">
                    <input
                        className="form-control max-w-xs mr-1"
                        placeholder="Search by name or leave type..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                    <select className="form-control max-w-[180px] " value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                    {clientIsAdmin && employees.length > 0 && (
                        <select className="form-control max-w-[180px] ml-1" value={filterEmployee} onChange={e => setFilterEmployee(e.target.value)}>
                            <option value="">All Employees</option>
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>{emp.user?.name}</option>
                            ))}
                        </select>
                    )}
                    </div>
                    <div className="lr-header-sub">
                    <button className="btn btn-secondary" onClick={fetchRequests}>↻ Refresh</button>
                    {!clientIsAdmin && (
                        <button className="btn btn-primary ml-1" onClick={() => setShowApplyModal(true)}>
                            + Apply for Leave
                        </button>
                    )}
                    {clientIsAdmin && (
                        <button className="btn btn-secondary" onClick={handleExportPdf}>
                            ⬇ Export PDF
                        </button>
                    )}
                    </div>
                </div>

                {error && <div className="error-msg">{error}</div>}

                {/* Table */}
                <div className="table-wrapper">
                    {loading ? (
                        <div className="state-box">
                            <p className="text-3xl mb-2">⏳</p>
                            <p>Loading leave requests...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="state-box">
                            <p className="text-3xl mb-2">📋</p>
                            <p>{searchQuery || filterStatus || filterEmployee ? 'No requests match your filters.' : 'No leave requests found.'}</p>
                        </div>
                    ) : (
                        <table className="w-full border-collapse">
                            <thead>
                                <tr>
                                    {clientIsAdmin && <th className="th">Employee</th>}
                                    <th className="th">Leave Type</th>
                                    <th className="th">From</th>
                                    <th className="th">To</th>
                                    <th className="th">Days</th>
                                    <th className="th">Status</th>
                                    <th className="th">Applied On</th>
                                    <th className="th">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(req => (
                                    <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                                        {clientIsAdmin && (
                                            <td className="td">
                                                <p className="text-sm font-semibold text-slate-800">{req.employee?.user?.name ?? '—'}</p>
                                                <p className="text-xs text-slate-400">{req.employee?.department?.name ?? ''}</p>
                                            </td>
                                        )}
                                        <td className="td">{req.leave_type?.name ?? '—'}</td>
                                        <td className="td">{fmt(req.start_date)}</td>
                                        <td className="td">{fmt(req.end_date)}</td>
                                        <td className="td">{daysBetween(req.start_date, req.end_date)}</td>
                                        <td className="td"><StatusBadge status={req.status} /></td>
                                        <td className="td">{fmt(req.created_at)}</td>
                                        <td className="td">
                                            <div className="flex gap-2">
                                                <button
                                                    className="btn btn-secondary btn-sm"
                                                    onClick={() => { setSelectedRequest(req); setShowDetailModal(true); }}
                                                >
                                                    View
                                                </button>
                                                {!clientIsAdmin && req.status === 'pending' && (
                                                    <button
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() => handleDelete(req.id)}
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Apply Modal */}
            {showApplyModal && (
                <Modal title="Apply for Leave" onClose={() => { setShowApplyModal(false); setFormError(''); }}>
                    <form onSubmit={handleApplySubmit}>
                        {formError && <div className="form-error">{formError}</div>}
                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="form-label">Leave Type *</label>
                                <select
                                    className="form-control"
                                    value={form.leave_type_id}
                                    onChange={e => setForm(f => ({ ...f, leave_type_id: e.target.value }))}
                                >
                                    <option value="">Select leave type...</option>
                                    {leaveTypes.map(lt => (
                                        <option key={lt.id} value={lt.id}>{lt.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="form-label">Start Date *</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={form.start_date}
                                        min={new Date().toISOString().split('T')[0]}
                                        onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <label className="form-label">End Date *</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={form.end_date}
                                        min={form.start_date || new Date().toISOString().split('T')[0]}
                                        onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                                    />
                                </div>
                            </div>
                            {form.start_date && form.end_date && new Date(form.end_date) >= new Date(form.start_date) && (
                                <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2.5 text-sm text-emerald-700">
                                    📅 Duration: <strong>{daysBetween(form.start_date, form.end_date)} day(s)</strong>
                                </div>
                            )}
                            <div>
                                <label className="form-label">Reason *</label>
                                <textarea
                                    className="form-control"
                                    style={{ resize: 'vertical', minHeight: '90px' }}
                                    placeholder="Briefly describe the reason for your leave..."
                                    value={form.reason}
                                    onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6 justify-end">
                            <button type="button" className="btn btn-secondary" onClick={() => { setShowApplyModal(false); setFormError(''); }}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary" disabled={submitting}>
                                {submitting ? 'Submitting...' : 'Submit Request'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Detail Modal */}
            {showDetailModal && selectedRequest && (
                <Modal title="Leave Request Details" onClose={() => setShowDetailModal(false)}>
                    <div className="flex flex-col divide-y divide-slate-100">
                        {[
                            { label: 'Employee',   value: selectedRequest.employee?.user?.name ?? '—' },
                            { label: 'Department', value: selectedRequest.employee?.department?.name ?? '—' },
                            { label: 'Leave Type', value: selectedRequest.leave_type?.name ?? '—' },
                            { label: 'From',       value: fmt(selectedRequest.start_date) },
                            { label: 'To',         value: fmt(selectedRequest.end_date) },
                            { label: 'Duration',   value: `${daysBetween(selectedRequest.start_date, selectedRequest.end_date)} day(s)` },
                            { label: 'Reason',     value: selectedRequest.reason ?? '—' },
                            { label: 'Applied On', value: fmt(selectedRequest.created_at) },
                        ].map(({ label, value }) => (
                            <div key={label} className="flex py-2.5">
                                <span className="w-32 text-xs font-semibold text-slate-400 uppercase tracking-wide shrink-0 pt-0.5">{label}</span>
                                <span className="text-sm text-slate-800">{value}</span>
                            </div>
                        ))}
                        <div className="flex py-2.5">
                            <span className="w-32 text-xs font-semibold text-slate-400 uppercase tracking-wide shrink-0 pt-0.5">Status</span>
                            <StatusBadge status={selectedRequest.status} />
                        </div>
                    </div>
                    {clientIsAdmin && selectedRequest.status === 'pending' && (
                        <div className="flex gap-3 mt-6 justify-end">
                            <button className="btn btn-danger"   onClick={() => handleStatusChange(selectedRequest.id, 'reject')}>Reject</button>
                            <button className="btn btn-success"  onClick={() => handleStatusChange(selectedRequest.id, 'approve')}>Approve</button>
                        </div>
                    )}
                </Modal>
            )}
        </div>
    );
}