import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { CheckCircle2, Clock3, ClipboardList, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { STATUS_COLORS } from '../utils/constants';
import Loader from '../components/Loader';

export default function CitizenDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get(`/complaints/user/${user.id}`);
        setComplaints(data);
      } catch (err) {
        setError(err.response?.data?.message || t('citizenDashboard.failedLoad'));
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user.id]);

  if (loading) return <Loader />;
  if (error) return <div className="glass rounded-2xl p-6 shadow-card text-rose-600">{error}</div>;

  const stats = {
    total: complaints.length,
    pending: complaints.filter((c) => c.status === 'PENDING').length,
    inProgress: complaints.filter((c) => c.status === 'IN_PROGRESS').length,
    resolved: complaints.filter((c) => c.status === 'RESOLVED').length
  };

  const recentComplaints = [...complaints]
    .sort((a, b) => new Date(b.submissionDate) - new Date(a.submissionDate))
    .slice(0, 3);

  return (
    <div className="space-y-5">
      <section className="glass rounded-2xl p-6 md:p-7 shadow-card border border-white/60">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary inline-flex items-center gap-1">
              <Sparkles size={14} /> {t('common.welcome')}
            </p>
            <h2 className="text-2xl md:text-3xl font-heading font-semibold mt-2">
              {user?.name || ''} - {t('citizenDashboard.title')}
            </h2>
            <p className="text-sm text-slate-500 mt-1">{t('citizenDashboard.description')}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/submit" className="rounded-xl bg-secondary text-white px-4 py-2.5 text-sm font-semibold hover:opacity-95">
              {t('common.submitComplaint')}
            </Link>
            <Link to="/my-complaints" className="rounded-xl border border-slate-200 bg-white/70 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-white">
              {t('citizenDashboard.myComplaints')}
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
          <InfoCard title={t('adminDashboard.cards.total')} value={stats.total} icon={<ClipboardList size={16} />} tone="text-slate-800" />
          <InfoCard title={t('adminDashboard.cards.pending')} value={stats.pending} icon={<Clock3 size={16} />} tone="text-amber-700" />
          <InfoCard title={t('adminDashboard.manage.inProgress')} value={stats.inProgress} icon={<Clock3 size={16} />} tone="text-blue-700" />
          <InfoCard title={t('adminDashboard.cards.resolved')} value={stats.resolved} icon={<CheckCircle2 size={16} />} tone="text-emerald-700" />
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="glass rounded-2xl p-4 shadow-card lg:col-span-2 overflow-x-auto">
          <h3 className="font-semibold mb-3">{t('citizenDashboard.myComplaints')}</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b">
                <th className="py-2">{t('citizenDashboard.columns.id')}</th><th>{t('citizenDashboard.columns.title')}</th><th>{t('citizenDashboard.columns.category')}</th><th>{t('citizenDashboard.columns.status')}</th><th>{t('citizenDashboard.columns.date')}</th><th>{t('citizenDashboard.columns.details')}</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((c) => (
                <tr key={c.id} className="border-b last:border-b-0">
                  <td className="py-3">#{c.id}</td>
                  <td>{c.title}</td>
                  <td>{t(`categories.${c.category}`, { defaultValue: c.category.replace('_', ' ') })}</td>
                  <td>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[c.status]}`}>
                      {t(`status.${c.status}`, { defaultValue: c.status.replace('_', ' ') })}
                    </span>
                  </td>
                  <td>{new Date(c.submissionDate).toLocaleDateString()}</td>
                  <td><Link className="text-primary font-medium" to={`/complaints/${c.id}`}>{t('common.view')}</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="glass rounded-2xl p-4 shadow-card">
          <h3 className="font-semibold">Recent Activity</h3>
          <p className="text-xs text-slate-500 mt-1">Your latest complaint updates</p>
          <div className="mt-3 space-y-2">
            {recentComplaints.length === 0 ? (
              <p className="text-sm text-slate-500">No complaints submitted yet.</p>
            ) : (
              recentComplaints.map((complaint) => (
                <Link key={complaint.id} to={`/complaints/${complaint.id}`} className="block rounded-xl border border-slate-200 bg-white/70 p-3 hover:bg-white transition">
                  <p className="text-sm font-semibold text-slate-800 truncate">{complaint.title}</p>
                  <p className="text-xs text-slate-500 mt-1">{new Date(complaint.submissionDate).toLocaleDateString()}</p>
                  <span className={`inline-block mt-2 px-2 py-1 rounded-full text-[11px] font-medium ${STATUS_COLORS[complaint.status]}`}>
                    {t(`status.${complaint.status}`, { defaultValue: complaint.status.replace('_', ' ') })}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function InfoCard({ title, value, icon, tone }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white/75 p-3 dark:border-slate-700/70 dark:bg-slate-900/60">
      <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-300 inline-flex items-center gap-1">
        <span className="text-primary dark:text-sky-400">{icon}</span> {title}
      </p>
      <p className={`text-2xl font-semibold mt-2 ${tone} dark:text-slate-50`}>{value}</p>
    </div>
  );
}
