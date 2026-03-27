import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { AppLayout } from '../components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'

export function DashboardPage() {
  const { user } = useAuth()

  const tilesByRole = {
    CITIZEN: [
      { to: '/citizen/submit', label: 'Submit Smart Complaint' },
      { to: '/citizen/my-complaints', label: 'Track My Complaints' },
      { to: '/analytics', label: 'Public Analytics' },
    ],
    ADMIN: [
      { to: '/admin', label: 'Open Admin Control Desk' },
      { to: '/analytics', label: 'City Analytics + SLA' },
    ],
    OFFICER: [
      { to: '/officer', label: 'Open Officer Work Queue' },
      { to: '/analytics', label: 'Performance Analytics' },
    ],
  }

  const tiles = tilesByRole[user?.role] || []

  return (
    <AppLayout title="Dashboard" subtitle="Role-based smart city workflow home">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card className="md:col-span-2 xl:col-span-3">
          <CardHeader>
            <CardTitle>Welcome, {user?.username}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">You are signed in as <b>{user?.role}</b>. Use the modules below to manage civic outcomes effectively.</p>
          </CardContent>
        </Card>

        {tiles.map((tile) => (
          <Link key={tile.to} to={tile.to}>
            <Card className="h-full transition hover:-translate-y-0.5 hover:shadow-lg">
              <CardContent className="p-6">
                <p className="text-lg font-bold">{tile.label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </motion.div>
    </AppLayout>
  )
}
