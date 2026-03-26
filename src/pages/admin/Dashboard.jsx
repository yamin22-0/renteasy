import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Home, Users, CreditCard, AlertCircle, TrendingUp,
  ArrowUp, ArrowDown, DollarSign, Calendar, CheckCircle,
  XCircle, Clock, Eye, ChevronRight
} from 'lucide-react'
import {
  useHouses,
  useUsers,
  useBookings,
  useRentals,
  usePayments,
  useIssues
} from '../../hooks/useApi'
import { formatKES, formatDate, calculateRentScore } from '../../utils/formatters'

// Stat Card Component
function StatCard({ title, value, icon: Icon, color, trend, trendValue }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-5"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl bg-${color}-100 dark:bg-${color}-500/10 flex items-center justify-center`}>
          <Icon size={20} className={`text-${color}-600 dark:text-${color}-400`} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
            {trend === 'up' ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
            <span>{trendValue}%</span>
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{title}</div>
    </motion.div>
  )
}

// Chart Component (simplified for now)
function SimpleChart({ data, title }) {
  const maxValue = Math.max(...data.map(d => d.value))
  
  return (
    <div className="card p-5">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      <div className="flex items-end gap-2 h-40">
        {data.map((item, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2">
            <div
              className="w-full bg-brand-500 rounded-t-lg transition-all duration-500"
              style={{ height: `${(item.value / maxValue) * 100}%`, minHeight: '4px' }}
            />
            <span className="text-xs text-gray-500">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const { data: houses = [], isLoading: housesLoading } = useHouses({})
  const { data: users = [], isLoading: usersLoading } = useUsers()
  const { data: bookings = [], isLoading: bookingsLoading } = useBookings({})
  const { data: rentals = [], isLoading: rentalsLoading } = useRentals({})
  const { data: payments = [], isLoading: paymentsLoading } = usePayments({})
  const { data: issues = [], isLoading: issuesLoading } = useIssues({})

  const isLoading = housesLoading || usersLoading || bookingsLoading || rentalsLoading || paymentsLoading || issuesLoading

  // Calculate stats
  const totalProperties = houses.length
  const availableProperties = houses.filter(h => h.status === 'Available').length
  const rentedProperties = houses.filter(h => h.status === 'Rented').length
  const totalTenants = users.filter(u => u.role === 'tenant').length
  const pendingBookings = bookings.filter(b => b.status === 'Pending').length
  const approvedBookings = bookings.filter(b => b.status === 'Approved').length
  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0)
  const pendingIssues = issues.filter(i => i.status !== 'Resolved').length

  // Chart data - monthly bookings
  const monthlyBookings = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    return months.map(month => ({
      label: month,
      value: bookings.filter(b => new Date(b.createdAt).getMonth() === months.indexOf(month)).length
    }))
  }, [bookings]);

  // Recent bookings with house titles
  const recentBookings = useMemo(() => 
    bookings
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(booking => ({
        ...booking,
        houseTitle: houses.find(h => h.id === booking.houseId)?.title || `House #${booking.houseId}`
      })),
    [bookings, houses]
  );

  // Recent rentals with house titles
  const recentRentals = useMemo(() => 
    rentals
      .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
      .slice(0, 5)
      .map(rental => ({
        ...rental,
        houseTitle: houses.find(h => h.id === rental.houseId)?.title || `House #${rental.houseId}`,
        tenantName: users.find(u => u.id === rental.tenantId)?.name || `Tenant #${rental.tenantId}`
      })),
    [rentals, houses, users]
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton h-32 rounded-2xl" />
          ))}
        </div>
        <div className="skeleton h-80 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Welcome back! Here's what's happening with your properties.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Properties"
          value={totalProperties}
          icon={Home}
          color="brand"
          trend="up"
          trendValue="12"
        />
        <StatCard
          title="Active Tenants"
          value={totalTenants}
          icon={Users}
          color="blue"
          trend="up"
          trendValue="8"
        />
        <StatCard
          title="Pending Bookings"
          value={pendingBookings}
          icon={Calendar}
          color="amber"
        />
        <StatCard
          title="Total Revenue"
          value={formatKES(totalRevenue)}
          icon={DollarSign}
          color="green"
          trend="up"
          trendValue="23"
        />
      </div>

      {/* Second Row Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-500/10 flex items-center justify-center">
              <CheckCircle size={16} className="text-green-600" />
            </div>
            <span className="text-sm text-gray-500">Available</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{availableProperties}</div>
          <div className="text-xs text-gray-400 mt-1">{((availableProperties / totalProperties) * 100).toFixed(0)}% of total</div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-500/10 flex items-center justify-center">
              <XCircle size={16} className="text-red-600" />
            </div>
            <span className="text-sm text-gray-500">Rented</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{rentedProperties}</div>
          <div className="text-xs text-gray-400 mt-1">{((rentedProperties / totalProperties) * 100).toFixed(0)}% of total</div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center">
              <Clock size={16} className="text-amber-600" />
            </div>
            <span className="text-sm text-gray-500">Approved Bookings</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{approvedBookings}</div>
          <div className="text-xs text-gray-400 mt-1">Total approved</div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-500/10 flex items-center justify-center">
              <AlertCircle size={16} className="text-red-600" />
            </div>
            <span className="text-sm text-gray-500">Open Issues</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{pendingIssues}</div>
          <div className="text-xs text-gray-400 mt-1">Need attention</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleChart data={monthlyBookings} title="Bookings by Month" />
        
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Revenue Overview</h3>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-3xl font-bold text-brand-600 dark:text-brand-400">{formatKES(totalRevenue)}</div>
              <div className="text-sm text-gray-500">Total revenue from all rentals</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-green-500">+23%</div>
              <div className="text-xs text-gray-400">vs last month</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Average Rent per Property</span>
              <span className="font-semibold">
                {formatKES(
                  rentals.filter(r => r.status === 'active').reduce((acc, r) => acc + r.price, 0) / 
                  (rentals.filter(r => r.status === 'active').length || 1)
                )}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total Rentals Active</span>
              <span className="font-semibold">{rentals.filter(r => r.status === 'active').length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div className="card overflow-hidden">
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white">Recent Bookings</h3>
          <Link to="/admin/bookings" className="text-brand-500 text-sm hover:underline flex items-center gap-1">
            View All <ChevronRight size={14} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-t border-gray-100 dark:border-[#2A2A2A] bg-gray-50 dark:bg-[#2A2A2A]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Property</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tenant</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Move-in</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#2A2A2A]">
              {recentBookings.map(booking => {
                const tenant = users.find(u => u.id === booking.tenantId)
                return (
                  <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-[#2A2A2A] transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">#{booking.id}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 font-medium">
                      {booking.houseTitle}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {tenant?.name || `Tenant #${booking.tenantId}`}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{formatDate(booking.moveInDate)}</td>
                    <td className="px-4 py-3 font-mono font-semibold text-brand-600 dark:text-brand-400">{formatKES(booking.price)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        booking.status === 'Approved' ? 'bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300' :
                        booking.status === 'Pending' ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300' :
                        'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {recentBookings.length === 0 && (
          <div className="p-8 text-center text-gray-400">No bookings yet</div>
        )}
      </div>

      {/* Recent Rentals Table */}
      <div className="card overflow-hidden">
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white">Recent Rentals</h3>
          <Link to="/admin/rentals" className="text-brand-500 text-sm hover:underline flex items-center gap-1">
            View All <ChevronRight size={14} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-t border-gray-100 dark:border-[#2A2A2A] bg-gray-50 dark:bg-[#2A2A2A]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Property</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tenant</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Start Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">End Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#2A2A2A]">
              {recentRentals.map(rental => (
                <tr key={rental.id} className="hover:bg-gray-50 dark:hover:bg-[#2A2A2A] transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">#{rental.id}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400 font-medium">
                    {rental.houseTitle}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{rental.tenantName}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{formatDate(rental.startDate)}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{formatDate(rental.endDate)}</td>
                  <td className="px-4 py-3 font-mono font-semibold text-brand-600 dark:text-brand-400">{formatKES(rental.price)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      rental.status === 'active' ? 'bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300' : 'bg-gray-100 dark:bg-[#2A2A2A] text-gray-500'
                    }`}>
                      {rental.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {recentRentals.length === 0 && (
          <div className="p-8 text-center text-gray-400">No rentals yet</div>
        )}
      </div>
    </div>
  )
}