import { useState } from 'react'
import { Pencil, Trash2, Check } from 'lucide-react'
import { SUPPLY_TYPES, SUPPLY_LABELS, SUPPLY_ICONS, SUPPLY_TONES } from '../hooks/useSupplies'
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
  const Icon = SUPPLY_ICONS[type]
  const tone = SUPPLY_TONES[type]
  const status = getSupplyStatus(supplies, type)
  const brandLine = status ? [status.current.brand, status.current.subBrand].filter(Boolean).join(' · ') : ''

  return (
    <div className="card supply-status-card">
      <div className="supply-status-top">
        <span className={`stat-icon tone-${tone}`}>
          <Icon size={20} strokeWidth={2.2} />
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

function EditSupplyForm({ entry, onSave, onCancel }) {
  const [type, setType] = useState(entry.type)
  const [brand, setBrand] = useState(entry.brand)
  const [subBrand, setSubBrand] = useState(entry.subBrand)
  const [price, setPrice] = useState(entry.price ?? '')
  const [place, setPlace] = useState(entry.place)
  const [purchaseDate, setPurchaseDate] = useState(entry.purchaseDate)
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setSalvando(true)
    try {
      await onSave({ type, brand, subBrand, price, place, purchaseDate })
    } catch (err) {
      setErro(err.message)
      setSalvando(false)
    }
  }

  return (
    <form className="supply-form" onSubmit={handleSubmit}>
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
        <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Ex: Premier" />
      </label>

      <label className="field">
        <span className="field-label">Submarca / linha</span>
        <input value={subBrand} onChange={(e) => setSubBrand(e.target.value)} />
      </label>

      <label className="field">
        <span className="field-label">Preço pago (R$)</span>
        <input
          type="number"
          min="0"
          step="0.01"
          inputMode="decimal"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
      </label>

      <label className="field">
        <span className="field-label">Onde comprou</span>
        <input value={place} onChange={(e) => setPlace(e.target.value)} />
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

      <div className="supply-end-form">
        <button type="submit" className="btn-pill btn-pill-small" disabled={salvando}>
          {salvando ? 'Salvando...' : 'Salvar'}
        </button>
        <button type="button" className="btn-text" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  )
}

function HistoryItem({ entry, onMarkEnded, onUpdate, onDelete }) {
  const [endingForm, setEndingForm] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10))
  const duration = entry.endDate ? diffDays(entry.purchaseDate, entry.endDate) : null

  function confirmEnd(e) {
    e.preventDefault()
    onMarkEnded(entry.id, endDate)
    setEndingForm(false)
  }

  async function handleSaveEdit(updates) {
    await onUpdate(entry.id, updates)
    setEditMode(false)
  }

  function handleDelete() {
    if (window.confirm('Excluir este registro de compra?')) {
      onDelete(entry.id)
    }
  }

  const Icon = SUPPLY_ICONS[entry.type]
  const tone = SUPPLY_TONES[entry.type]

  if (editMode) {
    return (
      <div className="card supply-history-item">
        <EditSupplyForm entry={entry} onSave={handleSaveEdit} onCancel={() => setEditMode(false)} />
      </div>
    )
  }

  return (
    <div className="card supply-history-item">
      <div className="supply-history-top">
        <span className={`stat-icon tone-${tone}`}>
          <Icon size={18} strokeWidth={2.2} />
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
        <div className="supply-history-actions">
          <button type="button" className="icon-btn-plain" aria-label="Editar" onClick={() => setEditMode(true)}>
            <Pencil size={15} strokeWidth={2.2} />
          </button>
          <button type="button" className="icon-btn-plain" aria-label="Excluir" onClick={handleDelete}>
            <Trash2 size={15} strokeWidth={2.2} />
          </button>
        </div>
      </div>

      {!entry.endDate && (
        endingForm ? (
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
            <button type="button" className="btn-text" onClick={() => setEndingForm(false)}>
              Cancelar
            </button>
          </form>
        ) : (
          <button type="button" className="btn-text" onClick={() => setEndingForm(true)}>
            Marcar que acabou
          </button>
        )
      )}
    </div>
  )
}

function RacaoSection({ supplies, onAddSupply, onMarkEnded, onUpdateSupply, onDeleteSupply }) {
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
      setTimeout(() => setSaved(false), 2500)
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
        {saved && (
          <p className="form-success">
            <Check size={16} strokeWidth={2.5} aria-hidden="true" />
            Registrado com sucesso! Confira no histórico abaixo.
          </p>
        )}

        <button type="submit" className="btn-pill" disabled={salvando}>
          {salvando ? 'Salvando...' : 'Registrar compra'}
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
            <HistoryItem
              key={entry.id}
              entry={entry}
              onMarkEnded={onMarkEnded}
              onUpdate={onUpdateSupply}
              onDelete={onDeleteSupply}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default RacaoSection
