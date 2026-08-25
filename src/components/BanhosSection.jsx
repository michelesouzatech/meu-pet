import { useState } from 'react'
import { ShowerHead } from 'lucide-react'
import { getPetBaths, getNextBath } from '../utils/bathStatus'

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

function NextBathCard({ baths, petId }) {
  const next = getNextBath(baths, petId)

  return (
    <div className="card supply-status-card">
      <div className="supply-status-top">
        <span className="stat-icon tone-mint">
          <ShowerHead size={20} strokeWidth={2.2} />
        </span>
        <div className="supply-status-info">
          <div className="supply-status-name">Próximo banho</div>
          <div className="pet-meta">
            {next ? `Previsto para ${formatDate(next.bath.nextDate)}` : 'Nada agendado ainda'}
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

function HistoryItem({ entry }) {
  return (
    <div className="card supply-history-item">
      <div className="supply-history-top">
        <span className="stat-icon tone-mint">
          <ShowerHead size={18} strokeWidth={2.2} />
        </span>
        <div className="supply-history-info">
          <div className="supply-history-title">Banho</div>
          <div className="pet-meta">Feito em {formatDate(entry.date)}</div>
          {entry.nextDate && (
            <div className="pet-meta">Próximo previsto em {formatDate(entry.nextDate)}</div>
          )}
        </div>
      </div>
    </div>
  )
}

function BanhosSection({ pets, baths, onAddBath }) {
  const [selectedPetId, setSelectedPetId] = useState(pets[0]?.id)
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [nextDate, setNextDate] = useState('')
  const [saved, setSaved] = useState(false)
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  const selectedPet = pets.find((pet) => pet.id === selectedPetId)
  const petBaths = getPetBaths(baths, selectedPetId)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!selectedPetId || !date) return
    setErro('')
    setSalvando(true)
    try {
      await onAddBath({ petId: selectedPetId, date, nextDate })
      setNextDate('')
      setSaved(true)
      setTimeout(() => setSaved(false), 1500)
    } catch (err) {
      setErro(err.message)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="racao-section">
      <div className="section-label">Pet</div>
      <div className="type-toggle" role="tablist" aria-label="Selecionar pet">
        {pets.map((pet) => (
          <button
            key={pet.id}
            type="button"
            role="tab"
            aria-selected={selectedPetId === pet.id}
            className={`type-toggle-btn ${selectedPetId === pet.id ? 'active' : ''}`}
            onClick={() => setSelectedPetId(pet.id)}
          >
            {pet.name}
          </button>
        ))}
      </div>

      <NextBathCard baths={baths} petId={selectedPetId} />

      <div className="section-label">Registrar banho</div>
      <form className="card supply-form" onSubmit={handleSubmit}>
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

        {erro && <p className="auth-error">{erro}</p>}

        <button type="submit" className="btn-pill" disabled={salvando}>
          {salvando ? 'Salvando...' : saved ? 'Registrado!' : 'Registrar'}
        </button>
      </form>

      <div className="section-label">Histórico</div>
      {petBaths.length === 0 ? (
        <div className="card coming-soon">
          <p>Nenhum banho registrado ainda para {selectedPet?.name || 'esse pet'}.</p>
        </div>
      ) : (
        <div className="pet-list">
          {petBaths.map((entry) => (
            <HistoryItem key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  )
}

export default BanhosSection
