import { ArrowLeft, MoreVertical, PawPrint, Calendar, Syringe, ShowerHead, Mars, Venus } from 'lucide-react'
import { formatAge } from '../utils/petAge'
import { SEX_LABELS } from '../hooks/usePets'
import { healthStatLabel, bathStatLabel } from './Dashboard'

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

function PetProfileScreen({ pet, healthRecords, baths, onBack }) {
  const initial = (pet.name || '?').charAt(0).toUpperCase()
  const vaccineRecords = healthRecords.filter((record) => record.type === 'vacina')
  const SexIcon = pet.sex === 'macho' ? Mars : pet.sex === 'femea' ? Venus : PawPrint

  return (
    <div className="pet-profile">
      <div className="pet-profile-header">
        <button type="button" className="icon-btn" onClick={onBack} aria-label="Voltar">
          <ArrowLeft size={18} strokeWidth={2.25} />
        </button>
        <button type="button" className="icon-btn" aria-label="Mais opções">
          <MoreVertical size={18} strokeWidth={2.25} />
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

      {pet.about && (
        <div className="card profile-about-card">
          <span className="section-label">Sobre</span>
          <p className="profile-about-text">{pet.about}</p>
        </div>
      )}
    </div>
  )
}

export default PetProfileScreen
