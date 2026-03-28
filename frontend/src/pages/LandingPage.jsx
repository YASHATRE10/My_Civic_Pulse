import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const highlights = [
  {
    title: 'Real-Time Grievance Tracking',
    description: 'Submit complaints and monitor status updates from submission to resolution.'
  },
  {
    title: 'Role-Based Transparency',
    description: 'Citizens, officers, and administrators work in a clear, accountable workflow.'
  },
  {
    title: 'Evidence-Ready Reporting',
    description: 'Attach supporting images and feedback to improve service quality and trust.'
  }
];

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen px-4 py-8 md:py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="glass rounded-2xl p-6 md:p-10 shadow-soft border border-white/50">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">CivicPulse Hub</p>
          <h1 className="text-3xl md:text-5xl font-heading font-bold text-slate-900 mt-2 leading-tight">
            Your City's Digital Grievance and Service Transparency Portal
          </h1>
          <p className="mt-4 text-slate-600 max-w-3xl text-base md:text-lg">
            CivicPulse helps residents report civic issues, track progress, and share feedback while enabling officers and admins to respond faster with data-driven accountability.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {user ? (
              <Link
                to="/dashboard"
                className="rounded-xl bg-primary text-white px-5 py-3 font-semibold shadow-soft"
              >
                Open My Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-xl bg-primary text-white px-5 py-3 font-semibold shadow-soft"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="rounded-xl bg-secondary text-white px-5 py-3 font-semibold shadow-soft"
                >
                  Create Account
                </Link>
              </>
            )}
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {highlights.map((item) => (
            <article key={item.title} className="glass rounded-2xl p-6 shadow-card border border-white/50">
              <h2 className="text-lg font-heading font-semibold text-slate-900">{item.title}</h2>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">{item.description}</p>
            </article>
          ))}
        </section>

        <section className="glass rounded-2xl p-6 md:p-8 shadow-card border border-white/50">
          <h2 className="text-2xl font-heading font-semibold text-slate-900">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="rounded-xl bg-white/70 p-4">
              <p className="text-sm font-semibold text-primary">Step 1</p>
              <p className="text-sm text-slate-700 mt-1">Citizens submit complaints with details, category, and location.</p>
            </div>
            <div className="rounded-xl bg-white/70 p-4">
              <p className="text-sm font-semibold text-primary">Step 2</p>
              <p className="text-sm text-slate-700 mt-1">Officers review, assign priority, and update progress transparently.</p>
            </div>
            <div className="rounded-xl bg-white/70 p-4">
              <p className="text-sm font-semibold text-primary">Step 3</p>
              <p className="text-sm text-slate-700 mt-1">Citizens confirm resolution and provide feedback to improve services.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}