import { X, Weight } from 'lucide-react'

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

function WeightQuickView({ pet, weights, onClose, onOpenProfile }) {
  const initial = (pet.name || '?').charAt(0).toUpperCase()
  const petWeights = weights
    .filter((entry) => entry.petId === pet.id)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
  const latest = petWeights[0]
  const previous = petWeights[1]
  const delta = latest && previous ? latest.value - previous.value : null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-sheet-header">
          <div className="modal-pet-identity">
            <span className="modal-pet-photo">
              {pet.photo ? (
                <img src={pet.photo} alt="" className="pet-photo-img" />
              ) : (
                <span className="pet-photo-initial">{initial}</span>
              )}
            </span>
            <span className="modal-pet-name">{pet.name}</span>
          </div>
          <button type="button" className="icon-btn" aria-label="Fechar" onClick={onClose}>
            <X size={18} strokeWidth={2.25} />
          </button>
        </div>

        <div className="card supply-status-card">
          <div className="supply-status-top">
            <span className="stat-icon tone-lilac">
              <Weight size={20} strokeWidth={2.2} />
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

        <button type="button" className="btn-pill" onClick={onOpenProfile}>
          Ver perfil completo
        </button>
      </div>
    </div>
  )
}

export default WeightQuickView
