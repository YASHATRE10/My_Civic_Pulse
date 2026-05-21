import { useEffect, useMemo, useState } from 'react';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip
} from 'chart.js';
import api from '../services/api';
import Loader from '../components/Loader';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend, LineElement, PointElement);

export default function AdminDashboard({ chartOnly = false }) {
  const { t } = useTranslation();
  const [complaints, setComplaints] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [pendingOfficers, setPendingOfficers] = useState([]);
  const [reports, setReports] = useState({ categories: [], monthly: [], sla: [] });
  const [filters, setFilters] = useState({ search: '', status: 'ALL' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [complaintsRes, usersRes, pendingRes, categoriesRes, monthlyRes, slaRes] = await Promise.all([
        api.get('/complaints'),
        api.get('/auth/users'),
        api.get('/auth/officers/pending'),
        api.get('/reports/categories'),
        api.get('/reports/monthly'),
        api.get('/reports/sla')
      ]);
      setComplaints(complaintsRes.data);
      // only approved officers for assignment
      setOfficers(usersRes.data.filter((u) => u.role === 'OFFICER' && u.approved));
      setPendingOfficers(pendingRes.data || []);
      setReports({
        categories: categoriesRes.data,
        monthly: monthlyRes.data,
        sla: slaRes.data
      });
    } catch (err) {
      setError(err.response?.data?.message || t('adminDashboard.failedLoad'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const assignComplaint = async (complaintId, officerId, deadline, onSuccess) => {
    try {
      if (!deadline) {
        throw new Error(t('adminDashboard.manage.deadlineRequired'));
      }
      await api.put('/complaints/assign', {
        complaintId,
        officerId: Number(officerId),
        deadline
      });
      loadData();
      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign complaint');
    }
  };

  const approveOfficer = async (id) => {
    try {
      await api.post(`/auth/officers/${id}/approve`);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve officer');
    }
  };

  const filteredComplaints = useMemo(() => {
    return complaints
      .filter((c) => (filters.status === 'ALL' ? true : c.status === filters.status))
      .filter((c) => c.title.toLowerCase().includes(filters.search.toLowerCase()))
      .sort((a, b) => new Date(b.submissionDate) - new Date(a.submissionDate));
  }, [complaints, filters]);

  const cardData = {
    total: complaints.length,
    pending: complaints.filter((c) => c.status === 'PENDING').length,
    resolved: complaints.filter((c) => c.status === 'RESOLVED').length,
    avgTime:
      reports.sla.length > 0
        ? Math.round(reports.sla.reduce((acc, item) => acc + item.days, 0) / reports.sla.length)
        : 0
  };

  if (loading) return <Loader />;
  if (error) {
    return (
      <div className="glass rounded-2xl p-6 shadow-card">
        <h2 className="text-2xl font-heading font-semibold">{t('adminDashboard.title')}</h2>
        <p className="mt-3 text-sm text-rose-600">{error}</p>
        <button onClick={loadData} className="mt-4 rounded-xl bg-primary px-4 py-2 text-white">
          {t('common.retry')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-heading font-semibold">{t('adminDashboard.title')}</h2>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title={t('adminDashboard.cards.total')} value={cardData.total} />
        <StatCard title={t('adminDashboard.cards.pending')} value={cardData.pending} color="text-accent" />
        <StatCard title={t('adminDashboard.cards.resolved')} value={cardData.resolved} color="text-secondary" />
        <StatCard title={t('adminDashboard.cards.avgResolution')} value={cardData.avgTime} color="text-primary" />
        <StatCard title={t('adminDashboard.cards.activeOfficers')} value={officers.length} color="text-blue-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartPanel title={t('adminDashboard.charts.byCategory')}>
          <Pie
            data={{
              labels: reports.categories.map((i) => t(`categories.${i.category}`, { defaultValue: i.category.replace('_', ' ') })),
              datasets: [{ data: reports.categories.map((i) => i.count), backgroundColor: ['#2563EB', '#10B981', '#F59E0B', '#0EA5E9', '#F43F5E'] }]
            }}
          />
        </ChartPanel>
        <ChartPanel title={t('adminDashboard.charts.monthly')}>
          <Bar
            data={{
              labels: reports.monthly.map((i) => i.month),
              datasets: [{ label: t('adminDashboard.charts.complaints'), data: reports.monthly.map((i) => i.count), backgroundColor: '#2563EB' }]
            }}
          />
        </ChartPanel>
        <ChartPanel title={t('adminDashboard.charts.resolutionTrend')}>
          <Line
            data={{
              labels: reports.sla.map((i) => `#${i.id}`),
              datasets: [{ label: t('adminDashboard.charts.days'), data: reports.sla.map((i) => i.days), borderColor: '#10B981', tension: 0.35 }]
            }}
          />
        </ChartPanel>
        <div className="glass rounded-2xl p-4 shadow-card">
          <h3 className="font-semibold mb-4">{t('adminDashboard.charts.problemZones')}</h3>
          <div className="grid grid-cols-2 gap-3">
            {['North', 'South', 'East', 'West'].map((zone, idx) => (
              <div key={zone} className={`rounded-xl p-4 text-white ${['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500'][idx]}`}>
                <p className="text-xs uppercase opacity-80">{zone} {t('adminDashboard.charts.zone')}</p>
                <p className="text-2xl font-semibold">{Math.max(1, complaints.filter((c) => c.location.toLowerCase().includes(zone.toLowerCase())).length)}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="glass rounded-2xl p-4 shadow-card">
          <h3 className="font-semibold mb-4">{t('adminDashboard.officers.pendingTitle')}</h3>
          {pendingOfficers.length === 0 ? (
            <p className="text-sm text-slate-500">{t('adminDashboard.officers.noPending')}</p>
          ) : (
            <ul className="space-y-3">
              {pendingOfficers.map((o) => (
                <li key={o.id} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{o.name}</div>
                    <div className="text-xs text-slate-500">{o.email} • {o.phone}</div>
                  </div>
                  <div>
                    <button onClick={() => approveOfficer(o.id)} className="px-3 py-1 rounded-lg bg-emerald-600 text-white">{t('adminDashboard.officers.approveButton')}</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {!chartOnly && (
        <div className="glass rounded-2xl p-4 shadow-card overflow-x-auto">
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:justify-between mb-4">
            <h3 className="font-semibold">{t('adminDashboard.manage.title')}</h3>
            <div className="flex gap-2">
              <input
                placeholder={t('adminDashboard.manage.search')}
                className="rounded-lg border border-slate-200 px-3 py-2"
                value={filters.search}
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              />
              <select
                className="rounded-lg border border-slate-200 px-3 py-2"
                value={filters.status}
                onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
              >
                <option value="ALL">{t('adminDashboard.manage.all')}</option>
                <option value="PENDING">{t('adminDashboard.manage.pending')}</option>
                <option value="IN_PROGRESS">{t('adminDashboard.manage.inProgress')}</option>
                <option value="RESOLVED">{t('adminDashboard.manage.resolved')}</option>
                <option value="REOPENED">{t('adminDashboard.manage.reopened')}</option>
              </select>
            </div>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b">
                <th className="py-2">{t('adminDashboard.manage.columns.id')}</th><th>{t('adminDashboard.manage.columns.title')}</th><th>{t('adminDashboard.manage.columns.status')}</th><th>{t('adminDashboard.manage.columns.date')}</th><th>{t('adminDashboard.manage.columns.assign')}</th><th>{t('adminDashboard.manage.columns.priority')}</th><th>{t('adminDashboard.manage.columns.action')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredComplaints.map((c) => (
                <AdminRow key={c.id} complaint={c} officers={officers} onAssign={assignComplaint} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AdminRow({ complaint, officers, onAssign }) {
  const { t } = useTranslation();
  const [officerId, setOfficerId] = useState(complaint.assignedOfficerId || '');
  const [deadline, setDeadline] = useState(complaint.deadline || '');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Update local state when complaint data changes
  useEffect(() => {
    setOfficerId(complaint.assignedOfficerId || '');
    setDeadline(complaint.deadline || '');
    setSuccess(false);
  }, [complaint.assignedOfficerId, complaint.deadline]);

  const handleAssign = async () => {
    if (!officerId) return;
    if (!deadline) {
      setError(t('adminDashboard.manage.deadlineRequired'));
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    // Validate deadline is not before submission date
    if (deadline) {
      const deadlineDate = new Date(deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (deadlineDate < today) {
        setError(t('adminDashboard.manage.deadlineTodayOrLater') || 'Deadline must be today or later');
        setTimeout(() => setError(''), 3000);
        return;
      }
    }
    
    setIsLoading(true);
    setError('');
    try {
      await onAssign(complaint.id, officerId, deadline, () => {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign');
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnassign = () => {
    setOfficerId('');
    setDeadline('');
  };

  const assignedOfficer = officers.find(o => o.id === complaint.assignedOfficerId)?.name;
  const isResolved = complaint.status === 'RESOLVED';
  
  // Format submission date for min attribute (YYYY-MM-DD)
  const minDate = new Date().toISOString().split('T')[0];

  return (
    <tr className="border-b last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-900 transition">
      <td className="py-3 px-2">#{complaint.id}</td>
      <td className="px-2 truncate max-w-xs">{complaint.title}</td>
      <td className="px-2">
        <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
          complaint.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
          complaint.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
          complaint.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {t(`status.${complaint.status}`, { defaultValue: complaint.status.replace('_', ' ') })}
        </span>
      </td>
      <td className="px-2 text-sm">{new Date(complaint.submissionDate).toLocaleDateString()}</td>
      
      {/* Officer Assignment Column */}
      <td className="px-2">
        {assignedOfficer ? (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded-lg text-sm font-semibold">
              ✓ {assignedOfficer}
            </span>
            {!isResolved && (
              <button 
                onClick={handleUnassign}
                className="text-xs text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded transition"
                title={t('adminDashboard.manage.unassign')}
              >
                {t('common.clear')}
              </button>
            )}
          </div>
        ) : (
          <select 
            className="w-full rounded-lg border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            value={officerId} 
            onChange={(e) => setOfficerId(e.target.value)}
            disabled={isLoading || isResolved}
          >
            <option value="">{t('adminDashboard.manage.selectOfficer')}</option>
            {officers.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
        )}
      </td>
      
      {/* Priority Column */}
      <td className="px-2">
        <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${
          complaint.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
          complaint.priority === 'MEDIUM' ? 'bg-orange-100 text-orange-800' :
          'bg-green-100 text-green-800'
        }`}>
          {complaint.priority}
        </span>
      </td>
      
      {/* Action Column */}
      <td className="px-2">
        {!assignedOfficer && !isResolved && (
          <div className="flex gap-1 flex-wrap items-center">
            <input 
              type="date" 
              min={minDate}
              className="rounded-lg border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              disabled={isLoading}
              title={t('adminDashboard.manage.deadlineTodayOrLater') || 'Deadline must be today or later'}
            />
            <button 
              disabled={!officerId || !deadline || isLoading}
              onClick={handleAssign}
              className="px-3 py-1 rounded-lg bg-blue-600 text-white text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition whitespace-nowrap"
              title={!officerId ? t('adminDashboard.manage.selectOfficer') : !deadline ? t('adminDashboard.manage.deadlineRequired') : ''}
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-1">
                  <span className="animate-spin">⟳</span> {t('common.loading')}
                </span>
              ) : (
                t('adminDashboard.manage.assignButton')
              )}
            </button>
          </div>
        )}
        {isResolved && (
          <span className="text-xs text-gray-500 italic">{t('adminDashboard.manage.assignDisabled')}</span>
        )}
        {success && (
          <div className="text-green-600 text-xs font-semibold animate-pulse mt-1">
            ✓ {t('common.success')}
          </div>
        )}
        {error && (
          <div className="text-red-600 text-xs font-semibold mt-1">
            ✗ {error}
          </div>
        )}
      </td>
    </tr>
  );
}

function StatCard({ title, value, color = 'text-slate-800' }) {
  return (
    <div className="glass rounded-2xl p-4 shadow-card">
      <p className="text-xs uppercase text-slate-500">{title}</p>
      <p className={`text-3xl font-semibold mt-2 ${color}`}>{value}</p>
    </div>
  );
}

function ChartPanel({ title, children }) {
  return (
    <div className="glass rounded-2xl p-4 shadow-card">
      <h3 className="font-semibold mb-4">{title}</h3>
      <div className="h-64">{children}</div>
    </div>
  );
}
