import { PawPrint, Syringe, ShowerHead } from 'lucide-react'
import FoodBowlIcon from '../icons/FoodBowlIcon'
import { formatAge } from '../utils/petAge'
import { SUPPLY_LABELS } from '../hooks/useSupplies'
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

function healthStatLabel(healthRecords, petId) {
  const next = getNextHealthRecord(healthRecords, petId)
  if (!next) return 'Sem dados'
  if (next.daysLeft < 0) return 'Atrasada'
  if (next.daysLeft === 0) return 'Hoje'
  return `${next.daysLeft} ${next.daysLeft === 1 ? 'dia' : 'dias'}`
}

function bathStatLabel(baths, petId) {
  const next = getNextBath(baths, petId)
  if (!next) return 'Sem dados'
  if (next.daysLeft < 0) return 'Atrasado'
  if (next.daysLeft === 0) return 'Hoje'
  return `${next.daysLeft} ${next.daysLeft === 1 ? 'dia' : 'dias'}`
}

function PetSummaryCard({ pet, healthRecords, baths }) {
  const initial = (pet.name || '?').charAt(0).toUpperCase()
  const meta = [pet.breed, formatAge(pet.birthDate)].filter(Boolean).join(' · ')

  return (
    <div className="card pet-card">
      <div className="pet-card-top">
        <div className={`pet-photo tone-${pet.tone}`}>
          {pet.photo ? (
            <img src={pet.photo} alt="" className="pet-photo-img" />
          ) : (
            <span className="pet-photo-initial">{initial}</span>
          )}
        </div>
        <span className="status-pill">
          <PawPrint size={13} strokeWidth={2.5} aria-hidden="true" />
          Em dia
        </span>
      </div>

      <div className="pet-name">{pet.name}</div>
      <div className="pet-meta">{meta || 'Sem detalhes ainda'}</div>

      <div className="stat-row">
        <div className="stat-item">
          <span className="stat-icon tone-peach">
            <FoodBowlIcon size={20} strokeWidth={2.2} />
          </span>
          <span className="stat-label">Sem dados</span>
        </div>
        <div className="stat-item">
          <span className="stat-icon tone-yellow">
            <Syringe size={20} strokeWidth={2.2} />
          </span>
          <span className="stat-label">{healthStatLabel(healthRecords, pet.id)}</span>
        </div>
        <div className="stat-item">
          <span className="stat-icon tone-mint">
            <ShowerHead size={20} strokeWidth={2.2} />
          </span>
          <span className="stat-label">{bathStatLabel(baths, pet.id)}</span>
        </div>
      </div>
    </div>
  )
}

function Dashboard({ pets, activePet, supplies, healthRecords, baths, onAlertClick }) {
  const visiblePets = activePet === 'casa' ? pets : pets.filter((pet) => pet.id === activePet)

  const supplyAlerts = getSupplyAlerts(supplies).map((alert) => ({
    id: `supply-${alert.type}`,
    icon: FoodBowlIcon,
    tone: 'peach',
    text: supplyAlertMessage(alert),
    daysLeft: alert.daysLeft,
    section: 'racao',
  }))

  const visibleHealthRecords =
    activePet === 'casa' ? healthRecords : healthRecords.filter((record) => record.petId === activePet)
  const healthAlerts = getHealthAlerts(visibleHealthRecords).map((alert) => ({
    id: `health-${alert.record.id}`,
    icon: Syringe,
    tone: 'yellow',
    text: healthAlertMessage(alert, pets),
    daysLeft: alert.daysLeft,
    section: 'vacinas',
  }))

  const visibleBaths = activePet === 'casa' ? baths : baths.filter((bath) => bath.petId === activePet)
  const bathAlerts = getBathAlerts(visibleBaths).map((alert) => ({
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

      <div className="section-label">{activePet === 'casa' ? 'Seus pets' : 'Detalhes'}</div>
      <div className="pet-list">
        {visiblePets.map((pet) => (
          <PetSummaryCard key={pet.id} pet={pet} healthRecords={healthRecords} baths={baths} />
        ))}
      </div>
    </div>
  )
}

export default Dashboard
