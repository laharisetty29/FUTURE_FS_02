import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import './Dashboard.css';

const StatCard = ({ label, value, color, icon }) => (
  <div className="stat-card" style={{ '--accent-color': color }}>
    <div className="stat-icon">{icon}</div>
    <div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  </div>
);

const COLORS = ['#6c63ff', '#f59e0b', '#22c55e', '#ef4444'];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/stats')
      .then(res => setStats(res.data.stats))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading">Loading dashboard...</div>;
  if (!stats) return <div className="page-loading">Failed to load stats.</div>;

  const pieData = [
    { name: 'New', value: stats.newLeads },
    { name: 'Contacted', value: stats.contacted },
    { name: 'Converted', value: stats.converted },
    { name: 'Lost', value: stats.lost },
  ].filter(d => d.value > 0);

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <h2 className="page-title">Dashboard</h2>
          <p className="page-subtitle">Overview of your lead pipeline</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard label="Total Leads" value={stats.total} color="#6c63ff"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
        />
        <StatCard label="New Leads" value={stats.newLeads} color="#3b82f6"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>}
        />
        <StatCard label="Contacted" value={stats.contacted} color="#f59e0b"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>}
        />
        <StatCard label="Converted" value={stats.converted} color="#22c55e"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>}
        />
        <StatCard label="Conversion Rate" value={`${stats.conversionRate}%`} color="#a855f7"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>}
        />
      </div>

      <div className="charts-grid">
        <div className="card chart-card">
          <h3 className="chart-title">Leads Last 7 Days</h3>
          {stats.dailyStats?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.dailyStats} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <XAxis dataKey="_id" tick={{ fill: '#9096a8', fontSize: 11 }} tickLine={false} axisLine={false}
                  tickFormatter={v => v.slice(5)} />
                <YAxis tick={{ fill: '#9096a8', fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: '#1a1d24', border: '1px solid #2e3240', borderRadius: 8, color: '#e8eaf0' }} />
                <Bar dataKey="count" fill="#6c63ff" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="no-data">No data for last 7 days</div>}
        </div>

        <div className="card chart-card">
          <h3 className="chart-title">Lead Status Breakdown</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                  dataKey="value" paddingAngle={3}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1a1d24', border: '1px solid #2e3240', borderRadius: 8, color: '#e8eaf0' }} />
                <Legend wrapperStyle={{ fontSize: 12, color: '#9096a8' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="no-data">No leads yet</div>}
        </div>

        <div className="card chart-card">
          <h3 className="chart-title">Leads by Source</h3>
          {stats.sourceStats?.length > 0 ? (
            <div className="source-list">
              {stats.sourceStats.map((s, i) => (
                <div key={i} className="source-row">
                  <span className="source-name">{s._id}</span>
                  <div className="source-bar-wrap">
                    <div className="source-bar" style={{ width: `${(s.count / stats.total) * 100}%`, background: COLORS[i % COLORS.length] }}/>
                  </div>
                  <span className="source-count">{s.count}</span>
                </div>
              ))}
            </div>
          ) : <div className="no-data">No data</div>}
        </div>
      </div>
    </div>
  );
}
