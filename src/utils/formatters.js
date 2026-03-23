export function formatKES(amount) {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function calculateRentScore(payments = [], rentals = [], issues = []) {
  // New tenants with no history start at 50 (neutral)
  // Score builds up or down from there based on real activity
  const hasAnyActivity = payments.length > 0 || rentals.length > 0 || issues.length > 0
  let score = hasAnyActivity ? 50 : 50

  const completedPayments = payments.filter(p => p.status === 'Completed')
  const overduePayments = payments.filter(p => p.status === 'Overdue')
  const pendingPayments = payments.filter(p => p.status === 'Pending')

  const activeRentals = rentals.filter(r => r.status === 'active')
  const expiredWithoutRenewal = rentals.filter(r => r.status === 'expired' && !r.renewals)
  const totalRenewals = rentals.reduce((acc, r) => acc + (r.renewals || 0), 0)

  const resolvedIssues = issues.filter(i => i.status === 'Resolved')
  const openIssues = issues.filter(i => i.status === 'Open')
  const inProgressIssues = issues.filter(i => i.status === 'In Progress')

  // Positive signals
  score += completedPayments.length * 5        // +5 per on-time payment (capped contribution)
  score += activeRentals.length * 4            // +4 per active tenancy
  score += totalRenewals * 6                   // +6 per lease renewal (loyalty signal)
  score += resolvedIssues.length * 2           // +2 per resolved issue (responsible tenant)

  // Negative signals
  score -= overduePayments.length * 12         // -12 per overdue payment (serious)
  score -= pendingPayments.length * 3          // -3 per pending (mild concern)
  score -= expiredWithoutRenewal.length * 5    // -5 per abandoned lease
  score -= openIssues.length * 4              // -4 per unresolved open issue
  score -= inProgressIssues.length * 2        // -2 per in-progress issue

  // Cap completed payments bonus at 30 to prevent gaming
  const paymentBonus = Math.min(completedPayments.length * 5, 30)
  score = score - completedPayments.length * 5 + paymentBonus

  return Math.max(0, Math.min(100, Math.round(score)))
}

export function getFairRentRange(house, allHouses) {
  const comparables = allHouses.filter(h =>
    h.id !== house.id &&
    h.county === house.county &&
    h.type === house.type &&
    Math.abs(h.bedrooms - house.bedrooms) <= 1 &&
    h.status === 'Available'
  )

  if (comparables.length < 2) {
    return {
      min: house.price * 0.85,
      avg: house.price,
      max: house.price * 1.15,
      verdict: 'fair',
      percentDiff: 0,
    }
  }

  const prices = comparables.map(h => h.price)
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const avg = prices.reduce((a, b) => a + b, 0) / prices.length

  const percentDiff = ((house.price - avg) / avg) * 100

  let verdict = 'fair'
  if (percentDiff > 15) verdict = 'above'
  else if (percentDiff < -15) verdict = 'below'

  return { min, avg, max, verdict, percentDiff }
}

export function daysUntil(dateStr) {
  const target = new Date(dateStr)
  const now = new Date()
  const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24))
  return diff
}

export function generateTransactionId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}