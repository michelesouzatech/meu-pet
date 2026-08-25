import { useState } from 'react'
import { ShowerHead, Check, Pencil } from 'lucide-react'
import { getNextBathOverall, groupBathsByDate } from '../utils/bathStatus'

function formatDate(dateStr) {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}/${year}`
}

function daysLeftLabel(daysLeft) {
  if (daysLeft < 0) {
    const days = Math.abs(daysLeft)
    return `Atrasado há ${days} ${days === 1 ? 'dia' : 'dias'}`
  }
  if (daysLeft === 0) return 'Hoje'
  return `Em ${daysLeft} ${daysLeft === 1 ? 'dia' : 'dias'}`
}

function petNamesFor(petIds, pets) {
  return petIds
    .map((petId) => pets.find((pet) => pet.id === petId)?.name)
    .filter(Boolean)
    .join(' e ')
}

function NextBathCard({ baths, pets }) {
  const next = getNextBathOverall(baths)
  const names = next
    ? petNamesFor(
        baths.filter((bath) => bath.nextDate === next.bath.nextDate).map((bath) => bath.petId),
        pets
      )
    : ''

  return (
    <div className="card supply-status-card">
      <div className="supply-status-top">
        <span className="stat-icon tone-mint">
          <ShowerHead size={20} strokeWidth={2.2} />
        </span>
        <div className="supply-status-info">
          <div className="supply-status-name">Próximo banho</div>
          <div className="pet-meta">
            {next
              ? `Previsto para ${formatDate(next.bath.nextDate)}${names ? ` · ${names}` : ''}`
              : 'Nada agendado ainda'}
          </div>
        </div>
      </div>
      {next && (
        <span className={`tag ${next.daysLeft <= 3 ? 'coral' : 'mint'}`}>
          {daysLeftLabel(next.daysLeft)}
        </span>
      )}
    </div>
  )
}

function PetMultiselect({ pets, petIds, onToggle }) {
  return (
    <div className="pet-multiselect" role="group" aria-label="Selecionar pets">
      {pets.map((pet) => {
        const checked = petIds.includes(pet.id)
        return (
          <button
            key={pet.id}
            type="button"
            aria-pressed={checked}
            className={`pet-multiselect-chip ${checked ? 'active' : ''}`}
            onClick={() => onToggle(pet.id)}
          >
            {pet.name}
          </button>
        )
      })}
    </div>
  )
}

function EditBathForm({ group, pets, onSave, onCancel }) {
  const [petIds, setPetIds] = useState(group.entries.map((entry) => entry.petId))
  const [date, setDate] = useState(group.date)
  const [nextDate, setNextDate] = useState(group.nextDate || '')
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  function togglePet(petId) {
    setPetIds((current) =>
      current.includes(petId) ? current.filter((id) => id !== petId) : [...current, petId]
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (petIds.length === 0 || !date) return
    setErro('')
    setSalvando(true)
    try {
      await onSave({ petIds, date, nextDate })
    } catch (err) {
      setErro(err.message)
      setSalvando(false)
    }
  }

  return (
    <form className="supply-form" onSubmit={handleSubmit}>
      <div className="field">
        <span className="field-label">Quem tomou banho</span>
        <PetMultiselect pets={pets} petIds={petIds} onToggle={togglePet} />
      </div>

      <label className="field">
        <span className="field-label">Data do banho</span>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          max={new Date().toISOString().slice(0, 10)}
          required
        />
      </label>

      <label className="field">
        <span className="field-label">Próximo banho previsto</span>
        <input type="date" value={nextDate} onChange={(e) => setNextDate(e.target.value)} min={date} />
      </label>

      {petIds.length === 0 && <span className="field-hint">Selecione pelo menos um pet</span>}
      {erro && <p className="auth-error">{erro}</p>}

      <div className="supply-end-form">
        <button type="submit" className="btn-pill btn-pill-small" disabled={salvando || petIds.length === 0}>
          {salvando ? 'Salvando...' : 'Salvar'}
        </button>
        <button type="button" className="btn-text" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  )
}

function HistoryItem({ group, pets, onUpdate }) {
  const [editMode, setEditMode] = useState(false)
  const names = petNamesFor(group.entries.map((entry) => entry.petId), pets)

  async function handleSaveEdit(updates) {
    await onUpdate(group.entries, updates)
    setEditMode(false)
  }

  if (editMode) {
    return (
      <div className="card supply-history-item">
        <EditBathForm group={group} pets={pets} onSave={handleSaveEdit} onCancel={() => setEditMode(false)} />
      </div>
    )
  }

  return (
    <div className="card supply-history-item">
      <div className="supply-history-top">
        <span className="stat-icon tone-mint">
          <ShowerHead size={18} strokeWidth={2.2} />
        </span>
        <div className="supply-history-info">
          <div className="supply-history-title">Banho{names ? ` · ${names}` : ''}</div>
          <div className="pet-meta">Feito em {formatDate(group.date)}</div>
          {group.nextDate && (
            <div className="pet-meta">Próximo previsto em {formatDate(group.nextDate)}</div>
          )}
        </div>
        <div className="supply-history-actions">
          <button
            type="button"
            className="icon-btn-plain"
            aria-label="Editar"
            onClick={() => setEditMode(true)}
          >
            <Pencil size={15} strokeWidth={2.2} />
          </button>
        </div>
      </div>
    </div>
  )
}

function BanhosSection({ pets, baths, onAddBath, onUpdateBath }) {
  const [registerPetIds, setRegisterPetIds] = useState(pets.map((pet) => pet.id))
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [nextDate, setNextDate] = useState('')
  const [saved, setSaved] = useState(false)
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  const groups = groupBathsByDate(baths)

  function toggleRegisterPet(petId) {
    setRegisterPetIds((current) =>
      current.includes(petId) ? current.filter((id) => id !== petId) : [...current, petId]
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (registerPetIds.length === 0 || !date) return
    setErro('')
    setSalvando(true)
    try {
      await onAddBath({ petIds: registerPetIds, date, nextDate })
      setNextDate('')
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setErro(err.message)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="racao-section">
      <NextBathCard baths={baths} pets={pets} />

      <div className="section-label">Registrar banho</div>
      <form className="card supply-form" onSubmit={handleSubmit}>
        <div className="field">
          <span className="field-label">Quem tomou banho</span>
          <PetMultiselect pets={pets} petIds={registerPetIds} onToggle={toggleRegisterPet} />
        </div>

        <label className="field">
          <span className="field-label">Data do banho</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={new Date().toISOString().slice(0, 10)}
            required
          />
        </label>

        <label className="field">
          <span className="field-label">Próximo banho previsto</span>
          <input type="date" value={nextDate} onChange={(e) => setNextDate(e.target.value)} min={date} />
        </label>

        {registerPetIds.length === 0 && (
          <span className="field-hint">Selecione pelo menos um pet</span>
        )}
        {erro && <p className="auth-error">{erro}</p>}
        {saved && (
          <p className="form-success">
            <Check size={16} strokeWidth={2.5} aria-hidden="true" />
            Registrado com sucesso! Confira no histórico abaixo.
          </p>
        )}

        <button type="submit" className="btn-pill" disabled={salvando || registerPetIds.length === 0}>
          {salvando ? 'Salvando...' : 'Registrar'}
        </button>
      </form>

      <div className="section-label">Histórico</div>
      {groups.length === 0 ? (
        <div className="card coming-soon">
          <p>Nenhum banho registrado ainda.</p>
        </div>
      ) : (
        <div className="pet-list">
          {groups.map((group) => (
            <HistoryItem key={group.date} group={group} pets={pets} onUpdate={onUpdateBath} />
          ))}
        </div>
      )}
    </div>
  )
}

export default BanhosSection
