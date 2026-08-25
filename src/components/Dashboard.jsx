import { PawPrint, Syringe, ShowerHead } from 'lucide-react'
import { formatAge } from '../utils/petAge'
import { SEX_LABELS } from '../hooks/usePets'
import { SUPPLY_LABELS, SUPPLY_ICONS, SUPPLY_TONES } from '../hooks/useSupplies'
import { HEALTH_LABELS } from '../hooks/useHealthRecords'
import { getSupplyAlerts } from '../utils/supplyStatus'
import { getHealthAlerts, getNextHealthRecord } from '../utils/healthStatus'
import { getBathAlerts, getNextBath } from '../utils/bathStatus'

function supplyAlertMessage({ type, daysLeft, current }) {
  const label = SUPPLY_LABELS[type]
  const brandPart = current?.brand ? ` (${current.brand})` : ''
  if (daysLeft < 0) {
    const days = Math.abs(daysLeft)
    return `${label}${brandPart} acabou há ${days} ${days === 1 ? 'dia' : 'dias'}`
  }
  if (daysLeft === 0) return `${label}${brandPart} acaba hoje`
  return `${label}${brandPart} acaba em ${daysLeft} ${daysLeft === 1 ? 'dia' : 'dias'}`
}

function healthAlertMessage({ record, daysLeft }, pets) {
  const label = HEALTH_LABELS[record.type]
  const petName = pets.find((pet) => pet.id === record.petId)?.name || 'Pet'
  const descPart = record.description ? ` (${record.description})` : ''
  if (daysLeft < 0) {
    const days = Math.abs(daysLeft)
    return `${label} de ${petName}${descPart} atrasada há ${days} ${days === 1 ? 'dia' : 'dias'}`
  }
  if (daysLeft === 0) return `${label} de ${petName}${descPart} é hoje`
  return `${label} de ${petName}${descPart} prevista para daqui ${daysLeft} ${daysLeft === 1 ? 'dia' : 'dias'}`
}

function bathAlertMessage({ bath, daysLeft }, pets) {
  const petName = pets.find((pet) => pet.id === bath.petId)?.name || 'Pet'
  if (daysLeft < 0) {
    const days = Math.abs(daysLeft)
    return `Banho de ${petName} atrasado há ${days} ${days === 1 ? 'dia' : 'dias'}`
  }
  if (daysLeft === 0) return `Banho de ${petName} é hoje`
  return `Banho de ${petName} previsto para daqui ${daysLeft} ${daysLeft === 1 ? 'dia' : 'dias'}`
}

function AlertCard({ icon: Icon, tone, text, daysLeft, onClick }) {
  const urgent = daysLeft <= 1
  return (
    <button
      type="button"
      className={`card alert-card ${urgent ? 'urgent' : 'warning'}`}
      onClick={onClick}
    >
      <span className={`stat-icon tone-${tone}`}>
        <Icon size={20} strokeWidth={2.2} />
      </span>
      <span className="alert-card-text">{text}</span>
    </button>
  )
}

export function healthStatLabel(healthRecords, petId) {
  const next = getNextHealthRecord(healthRecords, petId)
  if (!next) return 'Sem dados'
  if (next.daysLeft < 0) return 'Atrasada'
  if (next.daysLeft === 0) return 'Hoje'
  return `${next.daysLeft} ${next.daysLeft === 1 ? 'dia' : 'dias'}`
}

export function bathStatLabel(baths, petId) {
  const next = getNextBath(baths, petId)
  if (!next) return 'Sem dados'
  if (next.daysLeft < 0) return 'Atrasado'
  if (next.daysLeft === 0) return 'Hoje'
  return `${next.daysLeft} ${next.daysLeft === 1 ? 'dia' : 'dias'}`
}

const GRID_TONES = ['1', '2', '3', '4']

function PetGridCard({ pet, index, onSelect }) {
  const initial = (pet.name || '?').charAt(0).toUpperCase()
  const tone = GRID_TONES[index % GRID_TONES.length]
  const age = formatAge(pet.birthDate)
  const sexLabel = SEX_LABELS[pet.sex]

  return (
    <button type="button" className={`pet-grid-card tone-${tone}`} onClick={() => onSelect(pet.id)}>
      <div className="pet-grid-photo">
        {pet.photo ? (
          <img src={pet.photo} alt="" className="pet-photo-img" />
        ) : (
          <span className="pet-photo-initial">{initial}</span>
        )}
      </div>
      <div className="pet-grid-name">{pet.name}</div>
      {(sexLabel || age) && (
        <div className="pet-grid-tags">
          {sexLabel && <span className="pet-grid-tag">{sexLabel}</span>}
          {age && <span className="pet-grid-tag">{age}</span>}
        </div>
      )}
    </button>
  )
}

function Dashboard({ pets, supplies, healthRecords, baths, onAlertClick, onSelectPet }) {
  const supplyAlerts = getSupplyAlerts(supplies).map((alert) => ({
    id: `supply-${alert.type}`,
    icon: SUPPLY_ICONS[alert.type],
    tone: SUPPLY_TONES[alert.type],
    text: supplyAlertMessage(alert),
    daysLeft: alert.daysLeft,
    section: 'racao',
  }))

  const healthAlerts = getHealthAlerts(healthRecords).map((alert) => ({
    id: `health-${alert.record.id}`,
    icon: Syringe,
    tone: 'yellow',
    text: healthAlertMessage(alert, pets),
    daysLeft: alert.daysLeft,
    section: 'vacinas',
  }))

  const bathAlerts = getBathAlerts(baths).map((alert) => ({
    id: `bath-${alert.bath.id}`,
    icon: ShowerHead,
    tone: 'mint',
    text: bathAlertMessage(alert, pets),
    daysLeft: alert.daysLeft,
    section: 'banhos',
  }))

  const alerts = [...supplyAlerts, ...healthAlerts, ...bathAlerts].sort((a, b) => a.daysLeft - b.daysLeft)

  return (
    <div className="dashboard">
      <div className="section-label">Alertas</div>
      {alerts.length === 0 ? (
        <div className="card alert-empty">
          <PawPrint size={22} strokeWidth={2} aria-hidden="true" />
          <p>
            Nenhum alerta por enquanto. Assim que você registrar ração, vacinas ou banhos, os
            avisos aparecem aqui.
          </p>
        </div>
      ) : (
        <div className="pet-list">
          {alerts.map((alert) => (
            <AlertCard key={alert.id} {...alert} onClick={() => onAlertClick?.(alert.section)} />
          ))}
        </div>
      )}

      <div className="section-label">Seus pets</div>
      <div className="pet-grid">
        {pets.map((pet, index) => (
          <PetGridCard key={pet.id} pet={pet} index={index} onSelect={onSelectPet} />
        ))}
      </div>
    </div>
  )
}

export default Dashboard
