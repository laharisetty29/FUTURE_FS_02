import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Leads.css';

const STATUS_COLORS = { new: 'new', contacted: 'contacted', converted: 'converted', lost: 'lost' };
const SOURCES = ['Website', 'Referral', 'Social Media', 'Email Campaign', 'Cold Call', 'Other'];

function AddLeadModal({ onClose, onSave }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', source: 'Website', message: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('/api/leads', form);
      onSave(res.data.lead);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add lead');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 700 }}>Add New Lead</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div style={{ color: 'var(--red)', fontSize: 13, marginBottom: 12, padding: '8px 12px', background: 'rgba(239,68,68,0.1)', borderRadius: 6 }}>{error}</div>}
            <div className="form-grid">
              <div className="input-group">
                <label>Full Name *</label>
                <input className="input-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="John Doe" />
              </div>
              <div className="input-group">
                <label>Email *</label>
                <input className="input-field" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required placeholder="john@example.com" />
              </div>
              <div className="input-group">
                <label>Phone</label>
                <input className="input-field" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+91 98765 43210" />
              </div>
              <div className="input-group">
                <label>Source</label>
                <select className="input-field" value={form.source} onChange={e => setForm({...form, source: e.target.value})}>
                  {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="input-group" style={{ gridColumn: '1/-1' }}>
                <label>Message</label>
                <textarea className="input-field" value={form.message} onChange={e => setForm({...form, message: e.target.value})} rows={3} placeholder="What are they looking for?" />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Adding...' : 'Add Lead'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Leads() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [toast, setToast] = useState(null);
  const [filters, setFilters] = useState({ status: 'all', source: 'all', search: '' });
  const [pagination, setPagination] = useState({ total: 0, page: 1 });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters, page: pagination.page };
      const res = await axios.get('/api/leads', { params });
      setLeads(res.data.leads);
      setPagination(p => ({ ...p, total: res.data.pagination.total }));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [filters, pagination.page]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const handleStatusChange = async (id, status) => {
    try {
      await axios.patch(`/api/leads/${id}/status`, { status });
      setLeads(prev => prev.map(l => l._id === id ? { ...l, status } : l));
      showToast('Status updated');
    } catch { showToast('Failed to update', 'error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this lead?')) return;
    try {
      await axios.delete(`/api/leads/${id}`);
      setLeads(prev => prev.filter(l => l._id !== id));
      showToast('Lead deleted');
    } catch { showToast('Failed to delete', 'error'); }
  };

  const handleAddSave = (lead) => {
    setLeads(prev => [lead, ...prev]);
    setShowAdd(false);
    showToast('Lead added successfully');
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' });

  return (
    <div className="leads-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Leads</h2>
          <p className="page-subtitle">{pagination.total} total leads</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Lead
        </button>
      </div>

      <div className="filters-bar">
        <div className="search-wrap">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ position: 'absolute', left: 12, color: 'var(--text3)' }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input className="input-field search-input" placeholder="Search name, email, phone..."
            value={filters.search} onChange={e => setFilters({...filters, search: e.target.value, page: 1})} />
        </div>
        <select className="input-field filter-select" value={filters.status}
          onChange={e => setFilters({...filters, status: e.target.value})}>
          <option value="all">All Status</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="converted">Converted</option>
          <option value="lost">Lost</option>
        </select>
        <select className="input-field filter-select" value={filters.source}
          onChange={e => setFilters({...filters, source: e.target.value})}>
          <option value="all">All Sources</option>
          {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="leads-table-wrap card">
        {loading ? (
          <div className="page-loading">Loading leads...</div>
        ) : leads.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: 40 }}>📭</div>
            <p>No leads found</p>
          </div>
        ) : (
          <table className="leads-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Source</th>
                <th>Status</th>
                <th>Notes</th>
                <th>Added</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map(lead => (
                <tr key={lead._id} className="lead-row">
                  <td>
                    <div className="lead-name" onClick={() => navigate(`/leads/${lead._id}`)}>
                      <div className="lead-avatar">{lead.name[0].toUpperCase()}</div>
                      <div>
                        <div className="name-text">{lead.name}</div>
                        {lead.phone && <div className="phone-text">{lead.phone}</div>}
                      </div>
                    </div>
                  </td>
                  <td><span className="email-text">{lead.email}</span></td>
                  <td><span className="source-tag">{lead.source}</span></td>
                  <td>
                    <select className={`status-select badge ${STATUS_COLORS[lead.status]}`}
                      value={lead.status} onChange={e => handleStatusChange(lead._id, e.target.value)}>
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="converted">Converted</option>
                      <option value="lost">Lost</option>
                    </select>
                  </td>
                  <td><span className="notes-count">{lead.notes?.length || 0} notes</span></td>
                  <td><span className="date-text">{formatDate(lead.createdAt)}</span></td>
                  <td>
                    <div className="row-actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/leads/${lead._id}`)}>View</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(lead._id)}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showAdd && <AddLeadModal onClose={() => setShowAdd(false)} onSave={handleAddSave} />}
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}
