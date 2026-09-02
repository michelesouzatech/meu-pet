import { ArrowLeft, PawPrint, Calendar, Syringe, Stethoscope, ShowerHead, ShieldCheck, Mars, Venus } from 'lucide-react'
import { formatAge } from '../utils/petAge'
import { SEX_LABELS } from '../hooks/usePets'
import { HEALTH_LABELS } from '../hooks/useHealthRecords'
import {
  getNextHealthRecord,
  getLastConsulta,
  formatHealthDate,
  healthDaysLeftLabel,
} from '../utils/healthStatus'
import { healthStatLabel, bathStatLabel } from './Dashboard'
import ActionMenu from './ActionMenu'
import WeightCard from './WeightCard'

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

function HealthSummaryCard({ pet, healthRecords, onOpenHealth }) {
  const next = getNextHealthRecord(healthRecords, pet.id)
  const lastConsulta = getLastConsulta(healthRecords, pet.id)

  return (
    <div className="card">
      <div className="supply-status-top">
        <span className="stat-icon tone-yellow">
          <Syringe size={18} strokeWidth={2.2} />
        </span>
        <div className="supply-status-info">
          <div className="supply-status-name">Próxima vacina/consulta</div>
          <div className="pet-meta">
            {next
              ? [HEALTH_LABELS[next.record.type], next.record.description].filter(Boolean).join(' · ')
              : 'Nada agendado ainda'}
          </div>
        </div>
        {next && (
          <span className={`tag ${next.daysLeft <= 7 ? 'coral' : 'mint'}`}>
            {healthDaysLeftLabel(next.daysLeft)}
          </span>
        )}
      </div>

      <div className="supply-status-top">
        <span className="stat-icon tone-mint">
          <Stethoscope size={18} strokeWidth={2.2} />
        </span>
        <div className="supply-status-info">
          <div className="supply-status-name">Última consulta</div>
          <div className="pet-meta">
            {lastConsulta
              ? `${lastConsulta.description || 'Consulta'} · ${formatHealthDate(lastConsulta.date)}`
              : 'Nenhuma consulta registrada ainda'}
          </div>
        </div>
      </div>

      <button type="button" className="btn-text" onClick={onOpenHealth}>
        Ver histórico completo
      </button>
    </div>
  )
}

function PlanoSaudeSummaryCard({ pet, onOpenPlano }) {
  const plano = pet.planoSaude
  const hasPlano = Boolean(plano?.nome || plano?.numero || plano?.attachment || plano?.link)

  return (
    <div className="card">
      <div className="supply-status-top">
        <span className="stat-icon tone-mint">
          <ShieldCheck size={18} strokeWidth={2.2} />
        </span>
        <div className="supply-status-info">
          <div className="supply-status-name">Plano de saúde</div>
          <div className="pet-meta">
            {hasPlano
              ? [plano.nome, plano.numero ? `Carteirinha nº ${plano.numero}` : null].filter(Boolean).join(' · ')
              : 'Nenhum plano cadastrado ainda'}
          </div>
        </div>
      </div>
      <button type="button" className="btn-text" onClick={onOpenPlano}>
        {hasPlano ? 'Ver plano de saúde' : 'Cadastrar plano de saúde'}
      </button>
    </div>
  )
}

function PetProfileScreen({
  pet,
  healthRecords,
  baths,
  weights,
  onBack,
  onOpenHealth,
  onEditProfile,
  onAddWeight,
  onUpdateWeight,
  onDeleteWeight,
}) {
  const initial = (pet.name || '?').charAt(0).toUpperCase()
  const vaccineRecords = healthRecords.filter((record) => record.type === 'vacina')
  const SexIcon = pet.sex === 'macho' ? Mars : pet.sex === 'femea' ? Venus : PawPrint

  return (
    <div className="pet-profile">
      <div className="pet-profile-header">
        <button type="button" className="icon-btn" onClick={onBack} aria-label="Voltar">
          <ArrowLeft size={18} strokeWidth={2.25} />
        </button>
        <ActionMenu
          ariaLabel="Mais opções do pet"
          triggerClassName="icon-btn"
          iconSize={18}
          actions={[{ label: 'Editar perfil', onClick: onEditProfile }]}
        />
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

      <HealthSummaryCard pet={pet} healthRecords={healthRecords} onOpenHealth={() => onOpenHealth?.(pet.id)} />

      <WeightCard
        pet={pet}
        weights={weights}
        onAddWeight={onAddWeight}
        onUpdateWeight={onUpdateWeight}
        onDeleteWeight={onDeleteWeight}
      />

      <PlanoSaudeSummaryCard pet={pet} onOpenPlano={() => onOpenHealth?.(pet.id, 'plano')} />

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
