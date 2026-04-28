'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import TopBar from '@/components/layout/TopBar';

const roleBadge = {
    admin:    'bg-violet-100 text-violet-700',
    employee: 'bg-blue-100 text-blue-700',
};

export default function EmployeesPage() {
    const [employees,   setEmployees]   = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading,     setLoading]     = useState(true);
    const [search,      setSearch]      = useState('');
    const [deptFilter,  setDeptFilter]  = useState('');
    const [showModal,   setShowModal]   = useState(false);
    const [editing,     setEditing]     = useState(null);
    const [saving,      setSaving]      = useState(false);
    const [error,       setError]       = useState('');
    const [form,        setForm]        = useState({
        name: '', email: '', password: '', department_id: '',
        position: '', phone: '', role: 'employee', joining_date: '',
    });

    useEffect(() => {
        fetchEmployees();
        fetchDepartments();
    }, []);

    useEffect(() => {
        const delay = setTimeout(fetchEmployees, 400);
        return () => clearTimeout(delay);
    }, [search, deptFilter]);

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const params = {};
            if (search)     params.search        = search;
            if (deptFilter) params.department_id = deptFilter;
            const res = await api.get('/employees', { params });
            setEmployees(res.data.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchDepartments = async () => {
        const res = await api.get('/departments');
        setDepartments(res.data.data ?? res.data);
    };

    const openAdd = () => {
        setEditing(null);
        setForm({ name: '', email: '', password: '', department_id: '', position: '', phone: '', role: 'employee', joining_date: '' });
        setError('');
        setShowModal(true);
    };

    const openEdit = (emp) => {
        setEditing(emp);
        setForm({
            name:          emp.user.name,
            email:         emp.user.email,
            password:      '',
            department_id: emp.department_id,
            position:      emp.position,
            phone:         emp.phone || '',
            role:          emp.role,
            joining_date:  emp.joining_date,
        });
        setError('');
        setShowModal(true);
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');
        try {
            if (editing) {
                await api.put(`/employees/${editing.id}`, form);
            } else {
                await api.post('/employees', form);
            }
            setShowModal(false);
            fetchEmployees();
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this employee?')) return;
        try {
            await api.delete(`/employees/${id}`);
            fetchEmployees();
        } catch {
            alert('Failed to delete employee');
        }
    };

    return (
        <div>
            <TopBar title="Employees" />
            <div className="page-content">

                {/* Toolbar */}
                <div className="lr-header">
                    <div className='lr-header-sub'>
                    <input
                        className="form-control max-w-xs mr-10"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    <select
                        className="form-control max-w-[200px]"
                        value={deptFilter}
                        onChange={e => setDeptFilter(e.target.value)}
                    >
                        <option value="">All Departments</option>
                        {departments.map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                    </select>
                    </div>
                    
                    <button className="btn btn-primary ml-auto" onClick={openAdd}>
                        + Add Employee
                    </button>
                </div>

                {/* Table */}
                <div className="table-wrapper">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr>
                                {['Employee', 'Department', 'Position', 'Role', 'Joined', 'Leave Balance', 'Actions'].map(h => (
                                    <th key={h} className="th">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading && (
                                <tr>
                                    <td colSpan={7} className="td text-center py-10 text-slate-400">Loading...</td>
                                </tr>
                            )}
                            {!loading && employees.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="td text-center py-10 text-slate-400">No employees found</td>
                                </tr>
                            )}
                            {employees.map(emp => (
                                <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="td">
                                        <div className="flex items-center gap-3">
                                            <div className="avatar">
                                                {emp.user?.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-800">{emp.user?.name}</p>
                                                <p className="text-xs text-slate-400">{emp.user?.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="td">{emp.department?.name}</td>
                                    <td className="td">{emp.position}</td>
                                    <td className="td">
                                        <span className={`badge ${roleBadge[emp.role]}`}>
                                            {emp.role}
                                        </span>
                                    </td>
                                    <td className="td text-slate-400 text-xs">{emp.joining_date}</td>
                                    <td className="td text-xs">
                                        🌴 {emp.annual_leave_balance} &nbsp;·&nbsp; 🏥 {emp.sick_leave_balance}
                                    </td>
                                    <td className="td">
                                        <div className="flex gap-2">
                                            <button className="btn btn-secondary btn-sm" onClick={() => openEdit(emp)}>Edit</button>
                                            <button className="btn btn-danger btn-sm"    onClick={() => handleDelete(emp.id)}>Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">{editing ? 'Edit Employee' : 'Add New Employee'}</h2>
                            <button className="text-slate-400 hover:text-slate-600 text-lg leading-none" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            {error && <div className="error-msg">{error}</div>}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="form-label">Full Name</label>
                                    <input className="form-control" value={form.name}
                                        onChange={e => setForm({ ...form, name: e.target.value })} />
                                </div>
                                <div className="col-span-2">
                                    <label className="form-label">Email</label>
                                    <input className="form-control" type="email" value={form.email}
                                        onChange={e => setForm({ ...form, email: e.target.value })}
                                        disabled={!!editing} />
                                </div>
                                {!editing && (
                                    <div className="col-span-2">
                                        <label className="form-label">Password</label>
                                        <input className="form-control" type="password" value={form.password}
                                            onChange={e => setForm({ ...form, password: e.target.value })} />
                                    </div>
                                )}
                                <div>
                                    <label className="form-label">Department</label>
                                    <select className="form-control" value={form.department_id}
                                        onChange={e => setForm({ ...form, department_id: e.target.value })}>
                                        <option value="">Select...</option>
                                        {departments.map(d => (
                                            <option key={d.id} value={d.id}>{d.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="form-label">Role</label>
                                    <select className="form-control" value={form.role}
                                        onChange={e => setForm({ ...form, role: e.target.value })}>
                                        <option value="employee">Employee</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className="form-label">Position</label>
                                    <input className="form-control" value={form.position}
                                        onChange={e => setForm({ ...form, position: e.target.value })} />
                                </div>
                                <div>
                                    <label className="form-label">Phone</label>
                                    <input className="form-control" value={form.phone}
                                        onChange={e => setForm({ ...form, phone: e.target.value })} />
                                </div>
                                <div>
                                    <label className="form-label">Joining Date</label>
                                    <input className="form-control" type="date" value={form.joining_date}
                                        onChange={e => setForm({ ...form, joining_date: e.target.value })} />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6 justify-end">
                                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                                    {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Employee'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}