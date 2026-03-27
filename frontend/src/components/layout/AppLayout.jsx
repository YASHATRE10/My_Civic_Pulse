import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Moon, Sun } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import { Button } from '../ui/button'

export function AppLayout({ title, subtitle, children }) {
  const { t, i18n } = useTranslation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const linksByRole = {
    CITIZEN: [
      { to: '/dashboard', label: t('dashboard') },
      { to: '/citizen/submit', label: t('submitComplaint') },
      { to: '/citizen/my-complaints', label: t('myComplaints') },
      { to: '/analytics', label: t('analytics') },
    ],
    ADMIN: [
      { to: '/dashboard', label: t('dashboard') },
      { to: '/admin', label: t('adminDesk') },
      { to: '/analytics', label: t('analytics') },
    ],
    OFFICER: [
      { to: '/dashboard', label: t('dashboard') },
      { to: '/officer', label: t('officerDesk') },
      { to: '/analytics', label: t('analytics') },
    ],
  }

  const links = linksByRole[user?.role] || []

  const toggleTheme = () => {
    const root = document.documentElement
    root.classList.toggle('dark')
    localStorage.setItem('civicpulse_theme', root.classList.contains('dark') ? 'dark' : 'light')
  }

  const switchLang = () => {
    const next = i18n.language === 'en' ? 'hi' : 'en'
    i18n.changeLanguage(next)
    localStorage.setItem('civicpulse_lang', next)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto grid min-h-screen max-w-[1600px] grid-cols-1 lg:grid-cols-[260px_1fr]">
        <aside className="hidden border-r border-border bg-slate-950/95 p-4 text-slate-100 backdrop-blur lg:block">
          <div className="mb-8 rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-2xl font-bold tracking-tight">CivicPulse</p>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{user?.role}</p>
          </div>
          <nav className="space-y-1">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`block rounded-lg px-3 py-2 text-sm font-medium transition ${
                  location.pathname === link.to ? 'bg-slate-100 text-slate-950' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-10 border-b border-border bg-background/90 px-4 py-3 backdrop-blur md:px-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold md:text-2xl">{title}</h1>
                <p className="text-xs text-muted-foreground md:text-sm">{subtitle}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={switchLang}>{t('language')}</Button>
                <Button variant="outline" size="sm" onClick={toggleTheme}>
                  <Sun className="mr-1 h-4 w-4 dark:hidden" />
                  <Moon className="mr-1 hidden h-4 w-4 dark:inline" />
                  {t('darkMode')}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    logout()
                    navigate('/')
                  }}
                >
                  {t('logout')}
                </Button>
              </div>
            </div>
          </header>
          <section className="flex-1 p-4 md:p-6">{children}</section>
        </main>
      </div>
    </div>
  )
}
