import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './LeadDetail.css';

const SOURCES = ['Website', 'Referral', 'Social Media', 'Email Campaign', 'Cold Call', 'Other'];

export default function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [noteText, setNoteText] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    axios.get(`/api/leads/${id}`)
      .then(res => { setLead(res.data.lead); setEditForm(res.data.lead); })
      .catch(() => navigate('/leads'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await axios.put(`/api/leads/${id}`, editForm);
      setLead(res.data.lead);
      setEditing(false);
      showToast('Lead updated');
    } catch { showToast('Failed to save', 'error'); }
    finally { setSaving(false); }
  };

  const handleStatusChange = async (status) => {
    try {
      const res = await axios.patch(`/api/leads/${id}/status`, { status });
      setLead(res.data.lead);
      showToast('Status updated');
    } catch { showToast('Failed to update', 'error'); }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    try {
      const res = await axios.post(`/api/leads/${id}/notes`, { text: noteText });
      setLead(res.data.lead);
      setNoteText('');
      showToast('Note added');
    } catch { showToast('Failed to add note', 'error'); }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      const res = await axios.delete(`/api/leads/${id}/notes/${noteId}`);
      setLead(res.data.lead);
      showToast('Note deleted');
    } catch { showToast('Failed to delete note', 'error'); }
  };

  if (loading) return <div className="page-loading">Loading lead...</div>;
  if (!lead) return null;

  const formatDate = (d) => new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="lead-detail">
      <div className="detail-header">
        <button className="btn btn-ghost btn-sm back-btn" onClick={() => navigate('/leads')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back to Leads
        </button>
        <div className="header-actions">
          {editing ? (
            <>
              <button className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
            </>
          ) : (
            <button className="btn btn-ghost" onClick={() => setEditing(true)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Edit Lead
            </button>
          )}
        </div>
      </div>

      <div className="detail-grid">
        {/* Lead Info Card */}
        <div className="card detail-card">
          <div className="lead-profile">
            <div className="lead-avatar-lg">{lead.name[0].toUpperCase()}</div>
            <div>
              {editing ? (
                <input className="input-field" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }} />
              ) : (
                <h2 className="detail-name">{lead.name}</h2>
              )}
              <span className={`badge ${lead.status}`} style={{ cursor: 'pointer' }}>● {lead.status}</span>
            </div>
          </div>

          <div className="info-section">
            <h4 className="section-label">Contact Info</h4>
            <div className="info-grid">
              <div className="info-row">
                <span className="info-key">Email</span>
                {editing ? <input className="input-field" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} /> : <span className="info-val">{lead.email}</span>}
              </div>
              <div className="info-row">
                <span className="info-key">Phone</span>
                {editing ? <input className="input-field" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} /> : <span className="info-val">{lead.phone || '—'}</span>}
              </div>
              <div className="info-row">
                <span className="info-key">Source</span>
                {editing ? (
                  <select className="input-field" value={editForm.source} onChange={e => setEditForm({...editForm, source: e.target.value})}>
                    {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                ) : <span className="info-val">{lead.source}</span>}
              </div>
              <div className="info-row">
                <span className="info-key">Added</span>
                <span className="info-val">{formatDate(lead.createdAt)}</span>
              </div>
            </div>
          </div>

          {(lead.message || editing) && (
            <div className="info-section">
              <h4 className="section-label">Message</h4>
              {editing ? (
                <textarea className="input-field" value={editForm.message} onChange={e => setEditForm({...editForm, message: e.target.value})} rows={3} />
              ) : (
                <p className="message-text">{lead.message}</p>
              )}
            </div>
          )}

          <div className="info-section">
            <h4 className="section-label">Update Status</h4>
            <div className="status-buttons">
              {['new', 'contacted', 'converted', 'lost'].map(s => (
                <button key={s} className={`status-btn badge ${s} ${lead.status === s ? 'active' : ''}`}
                  onClick={() => handleStatusChange(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Notes Card */}
        <div className="card notes-card">
          <h3 className="notes-title">Follow-up Notes</h3>
          <p className="notes-sub">{lead.notes?.length || 0} note{lead.notes?.length !== 1 ? 's' : ''}</p>

          <form onSubmit={handleAddNote} className="add-note-form">
            <textarea
              className="input-field"
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              rows={3}
              placeholder="Add a follow-up note..."
            />
            <button type="submit" className="btn btn-primary btn-sm" disabled={!noteText.trim()}>
              Add Note
            </button>
          </form>

          <div className="notes-list">
            {lead.notes?.length === 0 ? (
              <div className="no-notes">No notes yet. Add your first follow-up note above.</div>
            ) : (
              [...lead.notes].reverse().map(note => (
                <div key={note._id} className="note-item animate-in">
                  <div className="note-header">
                    <span className="note-date">{formatDate(note.createdAt)}</span>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteNote(note._id)}>✕</button>
                  </div>
                  <p className="note-text">{note.text}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}
