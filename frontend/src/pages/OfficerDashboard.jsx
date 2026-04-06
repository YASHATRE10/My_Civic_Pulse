import { useEffect, useState } from 'react';
import { CheckCheck, GaugeCircle, RotateCcw, Timer } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ComplaintCard from '../components/ComplaintCard';
import Loader from '../components/Loader';
import Toast from '../components/Toast';

export default function OfficerDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [notes, setNotes] = useState({});
  const [proofFiles, setProofFiles] = useState({});

  const loadComplaints = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/complaints', { params: { assignedOfficerId: user.id } });
      setComplaints(data.filter((c) => c.assignedOfficerId === user.id));
    } catch (err) {
      setError(err.response?.data?.message || t('officerDashboard.failedLoad'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  const updateStatus = async (complaintId, status) => {
    try {
      const payload = {
        complaintId,
        status,
        resolutionNote: notes[complaintId] || t('officerDashboard.defaultResolutionNote')
      };

      const selectedFile = proofFiles[complaintId];
      if (selectedFile) {
        const formData = new FormData();
        formData.append('payload', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
        formData.append('proofImage', selectedFile);
        await api.put('/complaints/status', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.put('/complaints/status', payload);
      }

      setToast({ message: t('officerDashboard.statusUpdated'), type: 'success' });
      loadComplaints();
    } catch (err) {
      setToast({ message: err.response?.data?.message || t('officerDashboard.updateFailed'), type: 'error' });
    }
  };

  if (loading) return <Loader />;
  if (error) return <div className="glass rounded-2xl p-6 shadow-card text-rose-600">{error}</div>;

  const stats = {
    assigned: complaints.length,
    inProgress: complaints.filter((c) => c.status === 'IN_PROGRESS').length,
    resolved: complaints.filter((c) => c.status === 'RESOLVED').length,
    reopened: complaints.filter((c) => c.status === 'REOPENED').length
  };

  return (
    <div className="space-y-5">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />
      <section className="glass rounded-2xl p-6 md:p-7 shadow-card border border-white/60">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Field Operations</p>
            <h2 className="text-2xl md:text-3xl font-heading font-semibold mt-2">{t('officerDashboard.title')}</h2>
            <p className="text-sm text-slate-500 mt-1">{t('officerDashboard.description')}</p>
          </div>
          <button onClick={loadComplaints} className="rounded-xl bg-primary px-4 py-2.5 text-white text-sm font-semibold hover:opacity-95">
            {t('common.refresh')}
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
          <MetricCard title="Assigned" value={stats.assigned} icon={<GaugeCircle size={16} />} tone="text-slate-800" />
          <MetricCard title={t('officerDashboard.inProgress')} value={stats.inProgress} icon={<Timer size={16} />} tone="text-blue-700" />
          <MetricCard title={t('officerDashboard.resolve')} value={stats.resolved} icon={<CheckCheck size={16} />} tone="text-emerald-700" />
          <MetricCard title="Reopened" value={stats.reopened} icon={<RotateCcw size={16} />} tone="text-rose-700" />
        </div>
      </section>

      {complaints.length === 0 ? (
        <div className="glass rounded-2xl p-8 shadow-card text-center">
          <h3 className="text-xl font-semibold text-slate-800">{t('officerDashboard.emptyTitle')}</h3>
          <p className="mt-2 text-sm text-slate-500">
            {t('officerDashboard.emptyDescription')}
          </p>
          <button onClick={loadComplaints} className="mt-5 rounded-xl bg-primary px-4 py-2 text-white">
            {t('common.refresh')}
          </button>
        </div>
      ) : null}

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {complaints.map((complaint) => (
          <ComplaintCard
            key={complaint.id}
            complaint={complaint}
            actionSlot={
              <div className="space-y-3">
                <textarea
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  placeholder={t('officerDashboard.addResolutionNote')}
                  value={notes[complaint.id] || ''}
                  onChange={(e) => setNotes((prev) => ({ ...prev, [complaint.id]: e.target.value }))}
                />
                <input
                  type="file"
                  accept="image/*"
                  className="text-sm rounded-lg border border-slate-200 bg-white/80 px-2 py-1.5 w-full"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setProofFiles((prev) => ({ ...prev, [complaint.id]: file }));
                  }}
                />
                <div className="flex gap-2">
                  <button onClick={() => updateStatus(complaint.id, 'IN_PROGRESS')} className="px-3 py-2 rounded-lg text-sm bg-blue-100 text-blue-700 font-medium hover:bg-blue-200">{t('officerDashboard.inProgress')}</button>
                  <button onClick={() => updateStatus(complaint.id, 'RESOLVED')} className="px-3 py-2 rounded-lg text-sm bg-emerald-100 text-emerald-700 font-medium hover:bg-emerald-200">{t('officerDashboard.resolve')}</button>
                </div>
              </div>
            }
          />
        ))}
      </section>
    </div>
  );
}

function MetricCard({ title, value, icon, tone }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white/75 p-3 dark:border-slate-700/70 dark:bg-slate-900/60">
      <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-300 inline-flex items-center gap-1">
        <span className="text-primary dark:text-sky-400">{icon}</span> {title}
      </p>
      <p className={`text-2xl font-semibold mt-2 ${tone} dark:text-slate-50`}>{value}</p>
    </div>
  );
}
