import { motion } from 'framer-motion'
import { useUsers } from '../../hooks/useApi'
import { formatDate } from '../../utils/formatters'

export default function AdminTenants() {
  const { data: tenants = [], isLoading } = useUsers()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Tenants</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{tenants.length} registered tenants</p>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-[#2A2A2A]">
              <tr>
                {['Tenant', 'Email', 'Phone', 'Joined'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#2A2A2A]">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>{Array.from({length: 4}).map((_,j) => <td key={j} className="px-4 py-3"><div className="skeleton h-4 w-28 rounded" /></td>)}</tr>
                ))
              ) : tenants.map((t, i) => (
                <motion.tr
                  key={t.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-gray-50 dark:hover:bg-[#2A2A2A] transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={t.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=22c55e&color=fff&size=64`}
                        alt={t.name}
                        className="w-9 h-9 rounded-full object-cover"
                        onError={e => e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&size=64`}
                      />
                      <span className="font-medium text-gray-900 dark:text-white">{t.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{t.email}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400 font-mono text-xs">{t.phone}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(t.joinDate)}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
