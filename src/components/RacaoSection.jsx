import { useState } from 'react'
import FoodBowlIcon from '../icons/FoodBowlIcon'
import { SUPPLY_TYPES, SUPPLY_LABELS } from '../hooks/useSupplies'
import { getSupplyStatus, diffDays } from '../utils/supplyStatus'

function formatDate(dateStr) {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}/${year}`
}

function formatPrice(price) {
  if (price == null) return ''
  return Number(price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function daysLeftLabel(daysLeft) {
  if (daysLeft < 0) {
    const days = Math.abs(daysLeft)
    return `Acabou há ${days} ${days === 1 ? 'dia' : 'dias'}`
  }
  if (daysLeft === 0) return 'Acaba hoje'
  return `Acaba em ${daysLeft} ${daysLeft === 1 ? 'dia' : 'dias'}`
}

function StatusCard({ type, supplies }) {
  const label = SUPPLY_LABELS[type]
  const status = getSupplyStatus(supplies, type)
  const brandLine = status ? [status.current.brand, status.current.subBrand].filter(Boolean).join(' · ') : ''

  return (
    <div className="card supply-status-card">
      <div className="supply-status-top">
        <span className="stat-icon tone-peach">
          <FoodBowlIcon size={20} strokeWidth={2.2} />
        </span>
        <div className="supply-status-info">
          <div className="supply-status-name">{label}</div>
          <div className="pet-meta">{status ? brandLine || 'Sem marca registrada' : 'Nenhuma compra registrada ainda'}</div>
        </div>
      </div>
      {status && (
        status.daysLeft == null ? (
          <span className="field-hint">Ainda sem histórico para prever quando acaba</span>
        ) : (
          <span className={`tag ${status.daysLeft <= 3 ? 'coral' : 'mint'}`}>
            {daysLeftLabel(status.daysLeft)}
            {status.estimated ? ' (estimado)' : ''}
          </span>
        )
      )}
    </div>
  )
}

function HistoryItem({ entry, onMarkEnded }) {
  const [editing, setEditing] = useState(false)
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10))
  const duration = entry.endDate ? diffDays(entry.purchaseDate, entry.endDate) : null

  function confirmEnd(e) {
    e.preventDefault()
    onMarkEnded(entry.id, endDate)
    setEditing(false)
  }

  return (
    <div className="card supply-history-item">
      <div className="supply-history-top">
        <span className="stat-icon tone-peach">
          <FoodBowlIcon size={18} strokeWidth={2.2} />
        </span>
        <div className="supply-history-info">
          <div className="supply-history-title">
            {[SUPPLY_LABELS[entry.type], entry.brand, entry.subBrand].filter(Boolean).join(' · ')}
          </div>
          <div className="pet-meta">
            Comprada em {formatDate(entry.purchaseDate)}
            {entry.price != null ? ` · ${formatPrice(entry.price)}` : ''}
            {entry.place ? ` · ${entry.place}` : ''}
          </div>
          {entry.endDate && (
            <div className="pet-meta">
              Acabou em {formatDate(entry.endDate)} · durou {duration} {duration === 1 ? 'dia' : 'dias'}
            </div>
          )}
        </div>
      </div>

      {!entry.endDate && (
        editing ? (
          <form className="supply-end-form" onSubmit={confirmEnd}>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              max={new Date().toISOString().slice(0, 10)}
              min={entry.purchaseDate}
            />
            <button type="submit" className="btn-pill btn-pill-small">
              Confirmar
            </button>
            <button type="button" className="btn-text" onClick={() => setEditing(false)}>
              Cancelar
            </button>
          </form>
        ) : (
          <button type="button" className="btn-text" onClick={() => setEditing(true)}>
            Marcar que acabou
          </button>
        )
      )}
    </div>
  )
}

function RacaoSection({ supplies, onAddSupply, onMarkEnded }) {
  const [type, setType] = useState('racao')
  const [brand, setBrand] = useState('')
  const [subBrand, setSubBrand] = useState('')
  const [price, setPrice] = useState('')
  const [place, setPlace] = useState('')
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().slice(0, 10))
  const [saved, setSaved] = useState(false)
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!purchaseDate) return
    setErro('')
    setSalvando(true)
    try {
      await onAddSupply({ type, brand, subBrand, price, place, purchaseDate })
      setBrand('')
      setSubBrand('')
      setPrice('')
      setPlace('')
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
      <div className="section-label">Situação atual</div>
      <div className="pet-list">
        {SUPPLY_TYPES.map((supplyType) => (
          <StatusCard key={supplyType} type={supplyType} supplies={supplies} />
        ))}
      </div>

      <div className="section-label">Registrar compra</div>
      <form className="card supply-form" onSubmit={handleSubmit}>
        <div className="type-toggle" role="tablist" aria-label="Tipo de compra">
          {SUPPLY_TYPES.map((supplyType) => (
            <button
              key={supplyType}
              type="button"
              role="tab"
              aria-selected={type === supplyType}
              className={`type-toggle-btn ${type === supplyType ? 'active' : ''}`}
              onClick={() => setType(supplyType)}
            >
              {SUPPLY_LABELS[supplyType]}
            </button>
          ))}
        </div>

        <label className="field">
          <span className="field-label">Marca</span>
          <input
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="Ex: Premier"
          />
        </label>

        <label className="field">
          <span className="field-label">Submarca / linha</span>
          <input
            value={subBrand}
            onChange={(e) => setSubBrand(e.target.value)}
            placeholder="Ex: Pelos Longos Ambientes Internos"
          />
        </label>

        <label className="field">
          <span className="field-label">Preço pago (R$)</span>
          <input
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            placeholder="0,00"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </label>

        <label className="field">
          <span className="field-label">Onde comprou</span>
          <input
            value={place}
            onChange={(e) => setPlace(e.target.value)}
            placeholder="Ex: Petz, Cobasi, Mercado Livre..."
          />
        </label>

        <label className="field">
          <span className="field-label">Data da compra</span>
          <input
            type="date"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            max={new Date().toISOString().slice(0, 10)}
            required
          />
        </label>

        {erro && <p className="auth-error">{erro}</p>}

        <button type="submit" className="btn-pill" disabled={salvando}>
          {salvando ? 'Salvando...' : saved ? 'Registrado!' : 'Registrar compra'}
        </button>
      </form>

      <div className="section-label">Histórico</div>
      {supplies.length === 0 ? (
        <div className="card coming-soon">
          <p>Nenhuma compra registrada ainda.</p>
        </div>
      ) : (
        <div className="pet-list">
          {supplies.map((entry) => (
            <HistoryItem key={entry.id} entry={entry} onMarkEnded={onMarkEnded} />
          ))}
        </div>
      )}
    </div>
  )
}

export default RacaoSection
