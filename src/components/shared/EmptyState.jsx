import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function EmptyState({ icon: Icon, title, description, cta, ctaHref }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-[#2A2A2A] flex items-center justify-center mb-4">
          <Icon size={28} className="text-gray-400" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs mb-6">{description}</p>
      {cta && ctaHref && (
        <Link to={ctaHref} className="btn-primary">{cta}</Link>
      )}
    </motion.div>
  )
}
