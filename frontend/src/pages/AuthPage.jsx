import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'

const ROLE_CARDS = {
  CITIZEN: {
    title: 'Citizen View',
    points: ['Submit smart complaints', 'Voice input + AI category hint', 'Track timeline and feedback'],
  },
  ADMIN: {
    title: 'Admin View',
    points: ['Smart assignment & priority', 'Kanban board for SLA', 'Realtime city control center'],
  },
  OFFICER: {
    title: 'Officer View',
    points: ['Assigned complaint queue', 'Before/after proof updates', 'Resolution timeline workflow'],
  },
}

export function AuthPage() {
  const { t } = useTranslation()
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState('preview')
  const [role, setRole] = useState('CITIZEN')
  const [loading, setLoading] = useState(false)
  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const [registerForm, setRegisterForm] = useState({ username: '', password: '', email: '', phone: '' })

  const roleCard = useMemo(() => ROLE_CARDS[role], [role])

  const enterDemo = () => {
    setMode('login')
    setLoginForm((v) => ({ ...v, username: role === 'CITIZEN' ? 'citizen_demo' : role === 'ADMIN' ? 'admin_demo' : 'officer_demo' }))
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(loginForm)
      toast.success('Welcome to CivicPulse')
      navigate('/dashboard')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await register({ ...registerForm, role })
      toast.success('Registration successful')
      navigate('/dashboard')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_20%_20%,rgba(14,116,144,0.18),transparent_40%),radial-gradient(circle_at_90%_10%,rgba(124,58,237,0.24),transparent_35%),radial-gradient(circle_at_50%_90%,rgba(15,118,110,0.2),transparent_45%)]">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.07)_1px,transparent_1px)] bg-[size:42px_42px] opacity-25 dark:opacity-10" />
      <div className="relative mx-auto grid min-h-screen w-full max-w-6xl items-center gap-6 px-4 py-10 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-white/30 bg-white/45 p-6 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/50">
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-700 dark:text-cyan-300">{t('appName')}</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-900 dark:text-white">{t('subtitle')}</h1>
          <p className="mt-3 text-slate-700 dark:text-slate-300">Citizen-centric grievance platform with role-aware workflows, SLA monitoring, and real-time transparency.</p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {Object.keys(ROLE_CARDS).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`rounded-xl border px-3 py-2 text-left text-sm font-semibold transition ${role === r ? 'border-cyan-500 bg-cyan-500/15 text-cyan-900 dark:text-cyan-100' : 'border-white/40 bg-white/50 text-slate-700 hover:bg-white dark:border-white/10 dark:bg-slate-800/50 dark:text-slate-200'}`}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-white/40 bg-white/55 p-4 dark:border-white/10 dark:bg-slate-800/40">
            <p className="text-lg font-bold">{roleCard.title}</p>
            <ul className="mt-2 space-y-1 text-sm text-slate-700 dark:text-slate-300">
              {roleCard.points.map((point) => (
                <li key={point}>• {point}</li>
              ))}
            </ul>
            {mode === 'preview' && (
              <Button className="mt-4 w-full" onClick={enterDemo}>{t('rolePreview')} → {t('login')}</Button>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-white/40 bg-white/60 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60">
            <CardHeader>
              <div className="flex gap-2">
                <Button variant={mode === 'login' ? 'default' : 'outline'} onClick={() => setMode('login')}>{t('login')}</Button>
                <Button variant={mode === 'register' ? 'default' : 'outline'} onClick={() => setMode('register')}>{t('register')}</Button>
              </div>
              <CardTitle className="pt-3">{mode === 'login' ? 'Sign in to continue' : 'Create your account'}</CardTitle>
              <CardDescription>JWT authentication with role-based routing</CardDescription>
            </CardHeader>
            <CardContent>
              {mode === 'login' ? (
                <form className="space-y-3" onSubmit={handleLogin}>
                  <Input placeholder="Username" required value={loginForm.username} onChange={(e) => setLoginForm((v) => ({ ...v, username: e.target.value }))} />
                  <Input type="password" placeholder="Password" required value={loginForm.password} onChange={(e) => setLoginForm((v) => ({ ...v, password: e.target.value }))} />
                  <Button className="w-full" disabled={loading}>{loading ? 'Please wait...' : t('login')}</Button>
                </form>
              ) : (
                <form className="space-y-3" onSubmit={handleRegister}>
                  <Input placeholder="Username" required value={registerForm.username} onChange={(e) => setRegisterForm((v) => ({ ...v, username: e.target.value }))} />
                  <Input type="email" placeholder="Email" required value={registerForm.email} onChange={(e) => setRegisterForm((v) => ({ ...v, email: e.target.value }))} />
                  <Input placeholder="Phone" value={registerForm.phone} onChange={(e) => setRegisterForm((v) => ({ ...v, phone: e.target.value }))} />
                  <Input type="password" placeholder="Password" required value={registerForm.password} onChange={(e) => setRegisterForm((v) => ({ ...v, password: e.target.value }))} />
                  <Button className="w-full" disabled={loading}>{loading ? 'Please wait...' : t('register')}</Button>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
