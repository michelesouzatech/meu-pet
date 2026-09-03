import { ArrowLeft, PawPrint, Calendar, Syringe, ShowerHead, Weight, Mars, Venus } from 'lucide-react'
import { formatAge } from '../utils/petAge'
import { SEX_LABELS } from '../hooks/usePets'
import { healthStatLabel, bathStatLabel } from './Dashboard'

function formatDate(dateStr) {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}/${year}`
}

function formatWeight(value) {
  return `${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} kg`
}

function formatDelta(delta) {
  const rounded = Number(delta.toFixed(2))
  if (rounded === 0) return 'Sem variação'
  const sign = rounded > 0 ? '+' : ''
  return `${sign}${rounded.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} kg`
}

function SummaryItem({ icon: Icon, tone, label, value }) {
  return (
    <div className="profile-summary-item">
      <span className={`profile-summary-icon tone-${tone}`}>
        <Icon size={16} strokeWidth={2.2} />
      </span>
      <span className="profile-summary-label">{label}</span>
      <span className="profile-summary-value">{value}</span>
    </div>
  )
}

function PetSummaryScreen({ pet, healthRecords, baths, weights, onBack, onOpenFullProfile }) {
  const initial = (pet.name || '?').charAt(0).toUpperCase()
  const SexIcon = pet.sex === 'macho' ? Mars : pet.sex === 'femea' ? Venus : PawPrint
  const vaccineRecords = healthRecords.filter((record) => record.type === 'vacina')

  const petWeights = weights
    .filter((entry) => entry.petId === pet.id)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
  const latest = petWeights[0]
  const previous = petWeights[1]
  const delta = latest && previous ? latest.value - previous.value : null

  return (
    <div className="pet-profile">
      <div className="pet-profile-header">
        <button type="button" className="icon-btn" onClick={onBack} aria-label="Voltar">
          <ArrowLeft size={18} strokeWidth={2.25} />
        </button>
      </div>

      <div className={`pet-profile-photo tone-${pet.tone}`}>
        {pet.photo ? (
          <img src={pet.photo} alt="" className="pet-photo-img" />
        ) : (
          <span className="pet-photo-initial">{initial}</span>
        )}
      </div>

      <div className="pet-profile-name">{pet.name}</div>

      <div className="profile-summary-capsule">
        <SummaryItem icon={SexIcon} tone="coral" label="Sexo" value={SEX_LABELS[pet.sex] || 'A definir'} />
        <SummaryItem icon={PawPrint} tone="peach" label="Raça" value={pet.breed || 'SRD'} />
        <SummaryItem icon={Calendar} tone="lilac" label="Idade" value={formatAge(pet.birthDate) || '—'} />
        <SummaryItem
          icon={Syringe}
          tone="yellow"
          label="Vacina"
          value={healthStatLabel(vaccineRecords, pet.id)}
        />
        <SummaryItem icon={ShowerHead} tone="mint" label="Banho" value={bathStatLabel(baths, pet.id)} />
      </div>

      <div className="card supply-status-card">
        <div className="supply-status-top">
          <span className="stat-icon tone-lilac">
            <Weight size={18} strokeWidth={2.2} />
          </span>
          <div className="supply-status-info">
            <div className="supply-status-name">Peso atual</div>
            <div className="pet-meta">
              {latest
                ? `${formatWeight(latest.value)} em ${formatDate(latest.date)}`
                : 'Nenhum peso registrado ainda'}
            </div>
          </div>
        </div>
        {delta != null && (
          <span className={`tag ${delta > 0 ? 'coral' : delta < 0 ? 'mint' : 'lilac'}`}>
            {formatDelta(delta)}
          </span>
        )}
      </div>

      <button type="button" className="btn-pill" onClick={onOpenFullProfile}>
        Ver perfil completo
      </button>
    </div>
  )
}

export default PetSummaryScreen
