import { daysUntil } from './supplyStatus'

const ALERT_THRESHOLD_DAYS = 7

export function getPetRecords(records, petId) {
  return records
    .filter((record) => record.petId === petId)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
}

export function getNextHealthRecord(records, petId) {
  const upcoming = records
    .filter((record) => record.petId === petId && record.nextDate)
    .map((record) => ({ record, daysLeft: daysUntil(record.nextDate) }))
    .sort((a, b) => a.daysLeft - b.daysLeft)
  return upcoming[0] || null
}

export function getHealthAlerts(records) {
  return records
    .filter((record) => record.nextDate)
    .map((record) => ({ record, daysLeft: daysUntil(record.nextDate) }))
    .filter((alert) => alert.daysLeft <= ALERT_THRESHOLD_DAYS)
    .sort((a, b) => a.daysLeft - b.daysLeft)
}
