import { motion } from 'framer-motion'
import { Building2, Home, TrendingUp, AlertTriangle } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useHouses, useRentals, usePayments, useIssues } from '../../hooks/useApi'
import { formatKES, formatDate } from '../../utils/formatters'

const REVENUE_DATA = [
  { month: 'Jul', revenue: 280000 },
  { month: 'Aug', revenue: 320000 },
  { month: 'Sep', revenue: 290000 },
  { month: 'Oct', revenue: 380000 },
  { month: 'Nov', revenue: 410000 },
  { month: 'Dec', revenue: 360000 },
  { month: 'Jan', revenue: 445000 },
]

const BOOKING_DATA = [
  { month: 'Oct', bookings: 8 },
  { month: 'Nov', bookings: 12 },
  { month: 'Dec', bookings: 9 },
  { month: 'Jan', bookings: 15 },
]

function StatCard({ icon: Icon, label, value, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="card p-5"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
      <div className="font-mono text-2xl font-bold text-gray-900 dark:text-white mb-0.5">{value}</div>
      <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
    </motion.div>
  )
}

export default function AdminDashboard() {
  const { data: houses = [] } = useHouses({})
  const { data: rentals = [] } = useRentals({})
  const { data: payments = [] } = usePayments({})
  const { data: issues = [] } = useIssues({})

  const totalRevenue = payments.filter(p => p.status === 'Completed').reduce((s, p) => s + p.amount, 0)
  const openIssues = issues.filter(i => i.status === 'Open' || i.status === 'In Progress').length

  const stats = [
    { icon: Building2, label: 'Total Properties', value: houses.length, color: 'bg-blue-500', delay: 0 },
    { icon: Home, label: 'Active Rentals', value: rentals.filter(r => r.status === 'active').length, color: 'bg-brand-500', delay: 0.05 },
    { icon: TrendingUp, label: 'Total Revenue', value: formatKES(totalRevenue), color: 'bg-purple-500', delay: 0.1 },
    { icon: AlertTriangle, label: 'Open Issues', value: openIssues, color: 'bg-amber-500', delay: 0.15 },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Overview of your rental business</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Revenue (Last 7 Months)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={REVENUE_DATA}>
              <defs>
                <linearGradient id="rv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => `${v/1000}k`} tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={v => [formatKES(v), 'Revenue']} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              <Area type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2.5} fill="url(#rv)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Bookings</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={BOOKING_DATA} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="bookings" fill="#22c55e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent rentals table */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-[#2A2A2A]">
          <h2 className="font-semibold text-gray-900 dark:text-white">Recent Rentals</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-[#2A2A2A]">
              <tr>
                {['ID', 'House ID', 'Tenant ID', 'Start', 'End', 'Rent', 'Status'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#2A2A2A]">
              {rentals.slice(0, 8).map(r => (
                <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-[#2A2A2A] transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">#{r.id}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">House #{r.houseId}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">Tenant #{r.tenantId}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{formatDate(r.startDate)}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{formatDate(r.endDate)}</td>
                  <td className="px-4 py-3 font-mono font-semibold text-brand-600 dark:text-brand-400">{formatKES(r.price)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${r.status === 'active' ? 'bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300' : 'bg-gray-100 dark:bg-[#2A2A2A] text-gray-500'}`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
