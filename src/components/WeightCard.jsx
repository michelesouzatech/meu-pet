import { useState } from 'react'
import { Weight, Check, ChevronDown, ChevronUp } from 'lucide-react'
import ActionMenu from './ActionMenu'

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

function WeightForm({ initialEntry, submitLabel, onSubmit, onCancel }) {
  const [date, setDate] = useState(initialEntry?.date || new Date().toISOString().slice(0, 10))
  const [value, setValue] = useState(initialEntry?.value ?? '')
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!date || !value) return
    setErro('')
    setSalvando(true)
    try {
      await onSubmit({ date, value: Number(value) })
      if (!initialEntry) setValue('')
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setErro(err.message)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <form className="card supply-form" onSubmit={handleSubmit}>
      <label className="field">
        <span className="field-label">Data da pesagem</span>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          max={new Date().toISOString().slice(0, 10)}
          required
        />
      </label>

      <label className="field">
        <span className="field-label">Peso (kg)</span>
        <input
          type="number"
          min="0"
          step="0.01"
          inputMode="decimal"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Ex: 12,5"
          required
        />
      </label>

      {erro && <p className="auth-error">{erro}</p>}
      {saved && (
        <p className="form-success">
          <Check size={16} strokeWidth={2.5} aria-hidden="true" />
          {initialEntry ? 'Alterações salvas!' : 'Peso registrado!'}
        </p>
      )}

      <div className={initialEntry ? 'supply-end-form' : undefined}>
        <button type="submit" className={`btn-pill ${initialEntry ? 'btn-pill-small' : ''}`} disabled={salvando}>
          {salvando ? 'Salvando...' : submitLabel || 'Registrar peso'}
        </button>
        {onCancel && (
          <button type="button" className="btn-text" onClick={onCancel}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}

function WeightHistoryItem({ entry, onUpdateWeight, onDeleteWeight }) {
  const [editMode, setEditMode] = useState(false)

  async function handleSave(updates) {
    await onUpdateWeight(entry.id, updates)
    setEditMode(false)
  }

  function handleDelete() {
    if (window.confirm('Excluir este registro de peso?')) {
      onDeleteWeight(entry.id)
    }
  }

  if (editMode) {
    return (
      <div className="card supply-history-item">
        <WeightForm initialEntry={entry} submitLabel="Salvar" onSubmit={handleSave} onCancel={() => setEditMode(false)} />
      </div>
    )
  }

  return (
    <div className="card supply-history-item">
      <div className="supply-history-top">
        <span className="stat-icon tone-lilac">
          <Weight size={18} strokeWidth={2.2} />
        </span>
        <div className="supply-history-info">
          <div className="supply-history-title">{formatWeight(entry.value)}</div>
          <div className="pet-meta">{formatDate(entry.date)}</div>
        </div>
        <ActionMenu
          ariaLabel="Mais opções do registro de peso"
          actions={[
            { label: 'Editar', onClick: () => setEditMode(true) },
            { label: 'Excluir', destructive: true, onClick: handleDelete },
          ]}
        />
      </div>
    </div>
  )
}

function WeightCard({ pet, weights, onAddWeight, onUpdateWeight, onDeleteWeight }) {
  const [historyOpen, setHistoryOpen] = useState(false)
  const petWeights = weights
    .filter((entry) => entry.petId === pet.id)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
  const latest = petWeights[0]
  const previous = petWeights[1]
  const delta = latest && previous ? latest.value - previous.value : null

  return (
    <>
      <div className="card">
        <div className="supply-status-top">
          <span className="stat-icon tone-lilac">
            <Weight size={18} strokeWidth={2.2} />
          </span>
          <div className="supply-status-info">
            <div className="supply-status-name">Peso</div>
            <div className="pet-meta">
              {latest ? `${formatWeight(latest.value)} em ${formatDate(latest.date)}` : 'Nenhum peso registrado ainda'}
            </div>
          </div>
          {delta != null && (
            <span className={`tag ${delta > 0 ? 'coral' : delta < 0 ? 'mint' : 'lilac'}`}>{formatDelta(delta)}</span>
          )}
        </div>
      </div>

      <WeightForm onSubmit={(payload) => onAddWeight({ ...payload, petId: pet.id })} />

      <div>
        <button
          type="button"
          className="history-toggle"
          onClick={() => setHistoryOpen((prev) => !prev)}
          aria-expanded={historyOpen}
        >
          <span className="history-toggle-label">Histórico de peso ({petWeights.length})</span>
          {historyOpen ? <ChevronUp size={18} strokeWidth={2.2} /> : <ChevronDown size={18} strokeWidth={2.2} />}
        </button>
        {historyOpen && (
          petWeights.length === 0 ? (
            <div className="card coming-soon">
              <p>Nenhum peso registrado ainda para {pet.name}.</p>
            </div>
          ) : (
            <div className="pet-list">
              {petWeights.map((entry) => (
                <WeightHistoryItem
                  key={entry.id}
                  entry={entry}
                  onUpdateWeight={onUpdateWeight}
                  onDeleteWeight={onDeleteWeight}
                />
              ))}
            </div>
          )
        )}
      </div>
    </>
  )
}

export default WeightCard
