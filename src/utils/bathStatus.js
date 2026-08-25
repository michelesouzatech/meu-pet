import { daysUntil } from './supplyStatus'

const ALERT_THRESHOLD_DAYS = 3

export function getPetBaths(baths, petId) {
  return baths
    .filter((bath) => bath.petId === petId)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
}

export function getNextBath(baths, petId) {
  const upcoming = baths
    .filter((bath) => bath.petId === petId && bath.nextDate)
    .map((bath) => ({ bath, daysLeft: daysUntil(bath.nextDate) }))
    .sort((a, b) => a.daysLeft - b.daysLeft)
  return upcoming[0] || null
}

export function getBathAlerts(baths) {
  return baths
    .filter((bath) => bath.nextDate)
    .map((bath) => ({ bath, daysLeft: daysUntil(bath.nextDate) }))
    .filter((alert) => alert.daysLeft <= ALERT_THRESHOLD_DAYS)
    .sort((a, b) => a.daysLeft - b.daysLeft)
}

export function getNextBathOverall(baths) {
  const upcoming = baths
    .filter((bath) => bath.nextDate)
    .map((bath) => ({ bath, daysLeft: daysUntil(bath.nextDate) }))
    .sort((a, b) => a.daysLeft - b.daysLeft)
  return upcoming[0] || null
}

export function groupBathsByDate(baths) {
  const map = new Map()
  for (const bath of baths) {
    if (!map.has(bath.date)) map.set(bath.date, [])
    map.get(bath.date).push(bath)
  }
  return Array.from(map.values())
    .map((entries) => ({
      date: entries[0].date,
      nextDate: entries[0].nextDate,
      entries,
    }))
    .sort((a, b) => (a.date < b.date ? 1 : -1))
}
