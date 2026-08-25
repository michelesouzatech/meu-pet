import { SUPPLY_TYPES } from '../hooks/useSupplies'

const ALERT_THRESHOLD_DAYS = 3

export function daysUntil(dateStr) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(`${dateStr}T00:00:00`)
  return Math.round((target - today) / (1000 * 60 * 60 * 24))
}

export function diffDays(fromStr, toStr) {
  const from = new Date(`${fromStr}T00:00:00`)
  const to = new Date(`${toStr}T00:00:00`)
  return Math.round((to - from) / (1000 * 60 * 60 * 24))
}

export function addDays(dateStr, days) {
  const date = new Date(`${dateStr}T00:00:00`)
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

export function getCurrentSupply(supplies, type) {
  const items = supplies
    .filter((supply) => supply.type === type)
    .sort((a, b) => (a.purchaseDate < b.purchaseDate ? 1 : -1))
  return items[0] || null
}

// Duração real só se conhece quando o usuário registra que a compra acabou.
// A previsão usa a média das durações reais já registradas (de preferência da
// mesma marca/submarca; se não houver, usa a média geral do tipo).
function getAverageDuration(supplies, type, brand, subBrand) {
  const completed = supplies.filter((supply) => supply.type === type && supply.endDate)
  const matching = completed.filter((supply) => supply.brand === brand && supply.subBrand === subBrand)
  const pool = matching.length > 0 ? matching : completed
  if (pool.length === 0) return null
  const total = pool.reduce((sum, supply) => sum + diffDays(supply.purchaseDate, supply.endDate), 0)
  return Math.round(total / pool.length)
}

export function getSupplyStatus(supplies, type) {
  const current = getCurrentSupply(supplies, type)
  if (!current) return null

  if (current.endDate) {
    return {
      current,
      endDate: current.endDate,
      daysLeft: daysUntil(current.endDate),
      estimated: false,
    }
  }

  const avgDuration = getAverageDuration(supplies, type, current.brand, current.subBrand)
  if (avgDuration == null) {
    return { current, endDate: null, daysLeft: null, estimated: true }
  }

  const endDate = addDays(current.purchaseDate, avgDuration)
  return { current, endDate, daysLeft: daysUntil(endDate), estimated: true }
}

export function getSupplyAlerts(supplies) {
  return SUPPLY_TYPES.map((type) => {
    const status = getSupplyStatus(supplies, type)
    if (!status || status.daysLeft == null || status.daysLeft > ALERT_THRESHOLD_DAYS) return null
    return { type, ...status }
  })
    .filter(Boolean)
    .sort((a, b) => a.daysLeft - b.daysLeft)
}
