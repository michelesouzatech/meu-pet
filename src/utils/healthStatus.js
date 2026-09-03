import { daysUntil } from './supplyStatus'

const ALERT_THRESHOLD_DAYS = 7

// Vacina marcada como "não precisa repetir dose" não deve contar como pendente,
// mesmo que tenha uma próxima data registrada.
function isTrackable(record) {
  return Boolean(record.nextDate) && !(record.type === 'vacina' && record.repetirDose === false)
}

export function getNextHealthRecord(records, petId) {
  const upcoming = records
    .filter((record) => record.petId === petId && isTrackable(record))
    .map((record) => ({ record, daysLeft: daysUntil(record.nextDate) }))
    .sort((a, b) => a.daysLeft - b.daysLeft)
  return upcoming[0] || null
}

export function getNextHealthRecordOverall(records) {
  const upcoming = records
    .filter(isTrackable)
    .map((record) => ({ record, daysLeft: daysUntil(record.nextDate) }))
    .sort((a, b) => a.daysLeft - b.daysLeft)
  return upcoming[0] || null
}

export function getHealthAlerts(records) {
  return records
    .filter(isTrackable)
    .map((record) => ({ record, daysLeft: daysUntil(record.nextDate) }))
    .filter((alert) => alert.daysLeft <= ALERT_THRESHOLD_DAYS)
    .sort((a, b) => a.daysLeft - b.daysLeft)
}

export function getLastConsulta(records, petId) {
  const today = new Date().toISOString().slice(0, 10)
  return (
    records
      .filter((record) => record.petId === petId && record.type === 'consulta' && record.date <= today)
      .sort((a, b) => (a.date < b.date ? 1 : -1))[0] || null
  )
}

export function formatHealthDate(dateStr) {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}/${year}`
}

export function healthDaysLeftLabel(daysLeft) {
  if (daysLeft < 0) {
    const days = Math.abs(daysLeft)
    return `Atrasada há ${days} ${days === 1 ? 'dia' : 'dias'}`
  }
  if (daysLeft === 0) return 'Hoje'
  return `Em ${daysLeft} ${daysLeft === 1 ? 'dia' : 'dias'}`
}
