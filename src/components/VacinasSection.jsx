import { useState } from 'react'
import { Syringe, Paperclip, X } from 'lucide-react'
import { HEALTH_TYPES, HEALTH_LABELS } from '../hooks/useHealthRecords'
import { getPetRecords, getNextHealthRecord } from '../utils/healthStatus'
import { supabase } from '../lib/supabaseClient'

async function abrirAnexo(path) {
  const { data, error } = await supabase.storage.from('anexos').createSignedUrl(path, 300)
  if (!error && data) window.open(data.signedUrl, '_blank', 'noopener')
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}/${year}`
}

function daysLeftLabel(daysLeft) {
  if (daysLeft < 0) {
    const days = Math.abs(daysLeft)
    return `Atrasada há ${days} ${days === 1 ? 'dia' : 'dias'}`
  }
  if (daysLeft === 0) return 'Hoje'
  return `Em ${daysLeft} ${daysLeft === 1 ? 'dia' : 'dias'}`
}

function NextRecordCard({ records, petId }) {
  const next = getNextHealthRecord(records, petId)

  return (
    <div className="card supply-status-card">
      <div className="supply-status-top">
        <span className="stat-icon tone-yellow">
          <Syringe size={20} strokeWidth={2.2} />
        </span>
        <div className="supply-status-info">
          <div className="supply-status-name">Próxima vacina/consulta</div>
          <div className="pet-meta">
            {next
              ? [HEALTH_LABELS[next.record.type], next.record.description].filter(Boolean).join(' · ')
              : 'Nada agendado ainda'}
          </div>
        </div>
      </div>
      {next && (
        <span className={`tag ${next.daysLeft <= 7 ? 'coral' : 'mint'}`}>
          {daysLeftLabel(next.daysLeft)}
        </span>
      )}
    </div>
  )
}

function HistoryItem({ entry }) {
  const isConsulta = entry.type === 'consulta'
  const consultaMeta = [entry.clinic, entry.professional, entry.specialty].filter(Boolean).join(' · ')

  return (
    <div className="card supply-history-item">
      <div className="supply-history-top">
        <span className="stat-icon tone-yellow">
          <Syringe size={18} strokeWidth={2.2} />
        </span>
        <div className="supply-history-info">
          <div className="supply-history-title">
            {[HEALTH_LABELS[entry.type], entry.description].filter(Boolean).join(' · ')}
          </div>
          <div className="pet-meta">Realizada em {formatDate(entry.date)}</div>
          {isConsulta && consultaMeta && <div className="pet-meta">{consultaMeta}</div>}
          {entry.nextDate && (
            <div className="pet-meta">
              {isConsulta ? 'Retorno em' : 'Próxima prevista em'} {formatDate(entry.nextDate)}
            </div>
          )}
          {entry.notes && <div className="pet-meta">{entry.notes}</div>}
          {entry.attachment && (
            <button
              type="button"
              className="btn-text attachment-link"
              onClick={() => abrirAnexo(entry.attachment.path)}
            >
              <Paperclip size={13} strokeWidth={2.5} aria-hidden="true" />
              {entry.attachment.name}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

const EMPTY_FORM = {
  description: '',
  nextDate: '',
  notes: '',
  clinic: '',
  professional: '',
  specialty: '',
  hasFollowUp: false,
  attachment: null,
}

function VacinasSection({ pets, records, onAddRecord }) {
  const [selectedPetId, setSelectedPetId] = useState(pets[0]?.id)
  const [type, setType] = useState('vacina')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [form, setForm] = useState(EMPTY_FORM)
  const [saved, setSaved] = useState(false)
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  const selectedPet = pets.find((pet) => pet.id === selectedPetId)
  const petRecords = getPetRecords(records, selectedPetId)
  const isConsulta = type === 'consulta'

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleTypeChange(nextType) {
    setType(nextType)
    setForm(EMPTY_FORM)
  }

  function handleAttachmentChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setField('attachment', file)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!selectedPetId || !date) return
    setErro('')
    setSalvando(true)
    try {
      await onAddRecord({
        petId: selectedPetId,
        type,
        description: form.description,
        date,
        nextDate: form.hasFollowUp || !isConsulta ? form.nextDate : '',
        notes: form.notes,
        clinic: isConsulta ? form.clinic : '',
        professional: isConsulta ? form.professional : '',
        specialty: isConsulta ? form.specialty : '',
        attachment: isConsulta ? form.attachment : null,
      })
      setForm(EMPTY_FORM)
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

      <NextRecordCard records={records} petId={selectedPetId} />

      <div className="section-label">Registrar vacina ou consulta</div>
      <form className="card supply-form" onSubmit={handleSubmit}>
        <div className="type-toggle" role="tablist" aria-label="Tipo de registro">
          {HEALTH_TYPES.map((healthType) => (
            <button
              key={healthType}
              type="button"
              role="tab"
              aria-selected={type === healthType}
              className={`type-toggle-btn ${type === healthType ? 'active' : ''}`}
              onClick={() => handleTypeChange(healthType)}
            >
              {HEALTH_LABELS[healthType]}
            </button>
          ))}
        </div>

        <label className="field">
          <span className="field-label">{isConsulta ? 'Motivo da consulta' : 'Nome da vacina'}</span>
          <input
            value={form.description}
            onChange={(e) => setField('description', e.target.value)}
            placeholder={isConsulta ? 'Ex: Check-up anual, salivando muito...' : 'Ex: V4, Raiva...'}
          />
        </label>

        <label className="field">
          <span className="field-label">{isConsulta ? 'Data da consulta' : 'Data realizada'}</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={new Date().toISOString().slice(0, 10)}
            required
          />
        </label>

        {isConsulta && (
          <>
            <label className="field">
              <span className="field-label">Clínica</span>
              <input
                value={form.clinic}
                onChange={(e) => setField('clinic', e.target.value)}
                placeholder="Ex: Clínica Pet Amor"
              />
            </label>

            <label className="field">
              <span className="field-label">Profissional</span>
              <input
                value={form.professional}
                onChange={(e) => setField('professional', e.target.value)}
                placeholder="Ex: Dra. Ana Souza"
              />
            </label>

            <label className="field">
              <span className="field-label">Especialidade</span>
              <input
                value={form.specialty}
                onChange={(e) => setField('specialty', e.target.value)}
                placeholder="Ex: Clínico geral, dermatologia..."
              />
            </label>

            <div className="field">
              <span className="field-label">Tem retorno agendado?</span>
              <div className="type-toggle" role="tablist" aria-label="Tem retorno agendado">
                <button
                  type="button"
                  role="tab"
                  aria-selected={!form.hasFollowUp}
                  className={`type-toggle-btn ${!form.hasFollowUp ? 'active' : ''}`}
                  onClick={() => setForm((prev) => ({ ...prev, hasFollowUp: false, nextDate: '' }))}
                >
                  Não
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={form.hasFollowUp}
                  className={`type-toggle-btn ${form.hasFollowUp ? 'active' : ''}`}
                  onClick={() => setField('hasFollowUp', true)}
                >
                  Sim
                </button>
              </div>
            </div>

            {form.hasFollowUp && (
              <label className="field">
                <span className="field-label">Data do retorno</span>
                <input
                  type="date"
                  value={form.nextDate}
                  onChange={(e) => setField('nextDate', e.target.value)}
                  min={date}
                  required
                />
              </label>
            )}

            <label className="field">
              <span className="field-label">Receita (foto ou PDF)</span>
              <input type="file" accept="image/*,.pdf" onChange={handleAttachmentChange} />
              {form.attachment && (
                <span className="field-hint attachment-hint">
                  <Paperclip size={13} strokeWidth={2.5} aria-hidden="true" />
                  {form.attachment.name}
                  <button
                    type="button"
                    className="attachment-remove"
                    onClick={() => setField('attachment', null)}
                    aria-label="Remover anexo"
                  >
                    <X size={13} strokeWidth={2.5} />
                  </button>
                </span>
              )}
            </label>
          </>
        )}

        {!isConsulta && (
          <label className="field">
            <span className="field-label">Próxima dose prevista</span>
            <input
              type="date"
              value={form.nextDate}
              onChange={(e) => setField('nextDate', e.target.value)}
              min={date}
            />
          </label>
        )}

        <label className="field">
          <span className="field-label">Observações</span>
          <input
            value={form.notes}
            onChange={(e) => setField('notes', e.target.value)}
            placeholder="Ex: reação leve, levar carteirinha..."
          />
        </label>

        {erro && <p className="auth-error">{erro}</p>}

        <button type="submit" className="btn-pill" disabled={salvando}>
          {salvando ? 'Salvando...' : saved ? 'Registrado!' : 'Registrar'}
        </button>
      </form>

      <div className="section-label">Histórico</div>
      {petRecords.length === 0 ? (
        <div className="card coming-soon">
          <p>Nenhum registro ainda para {selectedPet?.name || 'esse pet'}.</p>
        </div>
      ) : (
        <div className="pet-list">
          {petRecords.map((entry) => (
            <HistoryItem key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  )
}

export default VacinasSection
