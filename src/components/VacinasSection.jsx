import { useState } from 'react'
import { Syringe, Paperclip, X, Check, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react'
import { HEALTH_LABELS } from '../hooks/useHealthRecords'
import { getNextHealthRecordOverall, formatHealthDate, healthDaysLeftLabel } from '../utils/healthStatus'
import { supabase } from '../lib/supabaseClient'
import ActionMenu from './ActionMenu'

async function abrirAnexo(path) {
  const { data, error } = await supabase.storage.from('anexos').createSignedUrl(path, 300)
  if (!error && data) window.open(data.signedUrl, '_blank', 'noopener')
}

const formatDate = formatHealthDate
const daysLeftLabel = healthDaysLeftLabel

function NextRecordCard({ records, pets }) {
  const next = getNextHealthRecordOverall(records)
  const petName = next ? pets.find((pet) => pet.id === next.record.petId)?.name : null

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
              ? [HEALTH_LABELS[next.record.type], next.record.description, petName].filter(Boolean).join(' · ')
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

function PetSelect({ pets, petId, onChange }) {
  return (
    <div className="pet-multiselect" role="radiogroup" aria-label="Selecionar pet">
      {pets.map((pet) => (
        <button
          key={pet.id}
          type="button"
          role="radio"
          aria-checked={petId === pet.id}
          className={`pet-multiselect-chip ${petId === pet.id ? 'active' : ''}`}
          onClick={() => onChange(pet.id)}
        >
          {pet.name}
        </button>
      ))}
    </div>
  )
}

const TODAY = () => new Date().toISOString().slice(0, 10)

function VacinaForm({ pets, defaultPetId, initialEntry, submitLabel, onSubmit, onCancel }) {
  const [petId, setPetId] = useState(initialEntry?.petId || defaultPetId)
  const [description, setDescription] = useState(initialEntry?.description || '')
  const [date, setDate] = useState(initialEntry?.date || TODAY())
  const [nextDate, setNextDate] = useState(initialEntry?.nextDate || '')
  const [repetirDose, setRepetirDose] = useState(initialEntry?.repetirDose !== false)
  const [notes, setNotes] = useState(initialEntry?.notes || '')
  const [saved, setSaved] = useState(false)
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!petId || !date) return
    setErro('')
    setSalvando(true)
    try {
      await onSubmit({
        petId,
        description,
        date,
        nextDate,
        repetirDose,
        notes,
        clinic: '',
        professional: '',
        specialty: '',
        attachment: null,
        attachmentChanged: false,
      })
      if (!initialEntry) {
        setDescription('')
        setNextDate('')
        setNotes('')
      }
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
      <div className="field">
        <span className="field-label">Pet</span>
        <PetSelect pets={pets} petId={petId} onChange={setPetId} />
      </div>

      <label className="field">
        <span className="field-label">Nome da vacina</span>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ex: V4, Raiva..."
        />
      </label>

      <label className="field">
        <span className="field-label">Data realizada</span>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          max={TODAY()}
          required
        />
      </label>

      <label className="field">
        <span className="field-label">Próxima dose prevista</span>
        <input
          type="date"
          value={nextDate}
          onChange={(e) => setNextDate(e.target.value)}
          min={date}
        />
      </label>

      <div className="field">
        <span className="field-label">Necessário repetir dose?</span>
        <div className="type-toggle" role="tablist" aria-label="Necessário repetir dose">
          <button
            type="button"
            role="tab"
            aria-selected={repetirDose}
            className={`type-toggle-btn ${repetirDose ? 'active' : ''}`}
            onClick={() => setRepetirDose(true)}
          >
            Sim
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={!repetirDose}
            className={`type-toggle-btn ${!repetirDose ? 'active' : ''}`}
            onClick={() => setRepetirDose(false)}
          >
            Não
          </button>
        </div>
        {!repetirDose && (
          <span className="field-hint">Essa vacina não vai aparecer como atrasada nos resumos.</span>
        )}
      </div>

      <label className="field">
        <span className="field-label">Observações</span>
        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ex: reação leve, levar carteirinha..."
        />
      </label>

      {erro && <p className="auth-error">{erro}</p>}
      {saved && (
        <p className="form-success">
          <Check size={16} strokeWidth={2.5} aria-hidden="true" />
          {initialEntry ? 'Alterações salvas!' : 'Registrado com sucesso! Confira no histórico abaixo.'}
        </p>
      )}

      <div className={initialEntry ? 'supply-end-form' : undefined}>
        <button type="submit" className={`btn-pill ${initialEntry ? 'btn-pill-small' : ''}`} disabled={salvando}>
          {salvando ? 'Salvando...' : submitLabel || 'Registrar'}
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

function ConsultaForm({ pets, defaultPetId, initialEntry, submitLabel, onSubmit, onCancel }) {
  const [petId, setPetId] = useState(initialEntry?.petId || defaultPetId)
  const [description, setDescription] = useState(initialEntry?.description || '')
  const [date, setDate] = useState(initialEntry?.date || TODAY())
  const [clinic, setClinic] = useState(initialEntry?.clinic || '')
  const [professional, setProfessional] = useState(initialEntry?.professional || '')
  const [specialty, setSpecialty] = useState(initialEntry?.specialty || '')
  const [hasFollowUp, setHasFollowUp] = useState(Boolean(initialEntry?.nextDate))
  const [nextDate, setNextDate] = useState(initialEntry?.nextDate || '')
  const [attachment, setAttachment] = useState(null)
  const [existingAttachment, setExistingAttachment] = useState(initialEntry?.attachment || null)
  const [notes, setNotes] = useState(initialEntry?.notes || '')
  const [saved, setSaved] = useState(false)
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  function handleAttachmentChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setAttachment(file)
    setExistingAttachment(null)
  }

  function removeAttachment() {
    setAttachment(null)
    setExistingAttachment(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!petId || !date) return
    setErro('')
    setSalvando(true)
    try {
      const attachmentRemoved = Boolean(initialEntry?.attachment) && !existingAttachment && !attachment
      await onSubmit({
        petId,
        description,
        date,
        nextDate: hasFollowUp ? nextDate : '',
        notes,
        clinic,
        professional,
        specialty,
        attachment,
        attachmentChanged: Boolean(attachment) || attachmentRemoved,
      })
      if (!initialEntry) {
        setDescription('')
        setClinic('')
        setProfessional('')
        setSpecialty('')
        setHasFollowUp(false)
        setNextDate('')
        setAttachment(null)
        setNotes('')
      }
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
      <div className="field">
        <span className="field-label">Pet</span>
        <PetSelect pets={pets} petId={petId} onChange={setPetId} />
      </div>

      <label className="field">
        <span className="field-label">Motivo da consulta</span>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ex: Check-up anual, salivando muito..."
        />
      </label>

      <label className="field">
        <span className="field-label">Data da consulta</span>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        <span className="field-hint">Pode ser uma data passada (já realizada) ou futura (agendada)</span>
      </label>

      <label className="field">
        <span className="field-label">Clínica</span>
        <input
          value={clinic}
          onChange={(e) => setClinic(e.target.value)}
          placeholder="Ex: Clínica Pet Amor"
        />
      </label>

      <label className="field">
        <span className="field-label">Profissional</span>
        <input
          value={professional}
          onChange={(e) => setProfessional(e.target.value)}
          placeholder="Ex: Dra. Ana Souza"
        />
      </label>

      <label className="field">
        <span className="field-label">Especialidade</span>
        <input
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
          placeholder="Ex: Clínico geral, dermatologia..."
        />
      </label>

      <div className="field">
        <span className="field-label">Tem retorno agendado?</span>
        <div className="type-toggle" role="tablist" aria-label="Tem retorno agendado">
          <button
            type="button"
            role="tab"
            aria-selected={!hasFollowUp}
            className={`type-toggle-btn ${!hasFollowUp ? 'active' : ''}`}
            onClick={() => {
              setHasFollowUp(false)
              setNextDate('')
            }}
          >
            Não
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={hasFollowUp}
            className={`type-toggle-btn ${hasFollowUp ? 'active' : ''}`}
            onClick={() => setHasFollowUp(true)}
          >
            Sim
          </button>
        </div>
      </div>

      {hasFollowUp && (
        <label className="field">
          <span className="field-label">Data do retorno</span>
          <input
            type="date"
            value={nextDate}
            onChange={(e) => setNextDate(e.target.value)}
            min={date}
            required
          />
        </label>
      )}

      <label className="field">
        <span className="field-label">Receita (foto ou PDF)</span>
        <input type="file" accept="image/*,.pdf" onChange={handleAttachmentChange} />
        {(attachment || existingAttachment) && (
          <span className="field-hint attachment-hint">
            <Paperclip size={13} strokeWidth={2.5} aria-hidden="true" />
            {attachment ? attachment.name : existingAttachment.name}
            <button
              type="button"
              className="attachment-remove"
              onClick={removeAttachment}
              aria-label="Remover anexo"
            >
              <X size={13} strokeWidth={2.5} />
            </button>
          </span>
        )}
      </label>

      <label className="field">
        <span className="field-label">Observações</span>
        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ex: reação leve, levar carteirinha..."
        />
      </label>

      {erro && <p className="auth-error">{erro}</p>}
      {saved && (
        <p className="form-success">
          <Check size={16} strokeWidth={2.5} aria-hidden="true" />
          {initialEntry ? 'Alterações salvas!' : 'Registrado com sucesso! Confira no histórico abaixo.'}
        </p>
      )}

      <div className={initialEntry ? 'supply-end-form' : undefined}>
        <button type="submit" className={`btn-pill ${initialEntry ? 'btn-pill-small' : ''}`} disabled={salvando}>
          {salvando ? 'Salvando...' : submitLabel || 'Registrar'}
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

function HistoryItem({ entry, pets, onUpdateRecord, onDeleteRecord }) {
  const [editMode, setEditMode] = useState(false)
  const isConsulta = entry.type === 'consulta'
  const isFuture = entry.date > new Date().toISOString().slice(0, 10)
  const consultaMeta = [entry.clinic, entry.professional, entry.specialty].filter(Boolean).join(' · ')
  const petName = pets.find((pet) => pet.id === entry.petId)?.name

  async function handleSaveEdit(updates) {
    await onUpdateRecord(entry.id, updates)
    setEditMode(false)
  }

  function handleDelete() {
    if (window.confirm(`Excluir este registro de ${isConsulta ? 'consulta' : 'vacina'}?`)) {
      onDeleteRecord(entry.id)
    }
  }

  if (editMode) {
    const FormComponent = isConsulta ? ConsultaForm : VacinaForm
    return (
      <div className="card supply-history-item">
        <FormComponent
          pets={pets}
          initialEntry={entry}
          submitLabel="Salvar"
          onSubmit={handleSaveEdit}
          onCancel={() => setEditMode(false)}
        />
      </div>
    )
  }

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
          {petName && <span className="tag lilac history-pet-tag">{petName}</span>}
          <div className="pet-meta">
            {isConsulta && isFuture ? 'Agendada para' : 'Realizada em'} {formatDate(entry.date)}
          </div>
          {isConsulta && consultaMeta && <div className="pet-meta">{consultaMeta}</div>}
          {entry.nextDate && (
            <div className="pet-meta">
              {isConsulta ? 'Retorno em' : 'Próxima prevista em'} {formatDate(entry.nextDate)}
            </div>
          )}
          {!isConsulta && entry.repetirDose === false && (
            <div className="pet-meta">Não precisa repetir dose</div>
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
        <ActionMenu
          ariaLabel="Mais opções do registro"
          actions={[
            { label: 'Editar', onClick: () => setEditMode(true) },
            { label: 'Excluir', destructive: true, onClick: handleDelete },
          ]}
        />
      </div>
    </div>
  )
}

function HistorySection({ title, entries, emptyLabel, pets, onUpdateRecord, onDeleteRecord }) {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <button
        type="button"
        className="history-toggle"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        <span className="history-toggle-label">{title} ({entries.length})</span>
        {open ? <ChevronUp size={18} strokeWidth={2.2} /> : <ChevronDown size={18} strokeWidth={2.2} />}
      </button>
      {open && (
        entries.length === 0 ? (
          <div className="card coming-soon">
            <p>{emptyLabel}</p>
          </div>
        ) : (
          <div className="pet-list">
            {entries.map((entry) => (
              <HistoryItem
                key={entry.id}
                entry={entry}
                pets={pets}
                onUpdateRecord={onUpdateRecord}
                onDeleteRecord={onDeleteRecord}
              />
            ))}
          </div>
        )
      )}
    </div>
  )
}

function PlanoSaudeSummary({ pet }) {
  const plano = pet.planoSaude
  const hasPlano = plano?.nome || plano?.numero || plano?.link || plano?.attachment

  if (!hasPlano) {
    return (
      <div className="card coming-soon">
        <p>Nenhum plano de saúde cadastrado ainda para {pet.name}.</p>
      </div>
    )
  }

  return (
    <div className="card supply-status-card">
      <div className="supply-status-top">
        <span className="stat-icon tone-mint">
          <ShieldCheck size={20} strokeWidth={2.2} />
        </span>
        <div className="supply-status-info">
          <div className="supply-status-name">{plano.nome || 'Plano de saúde'}</div>
          <div className="pet-meta">
            {plano.numero ? `Carteirinha nº ${plano.numero}` : 'Sem número de carteirinha cadastrado'}
          </div>
        </div>
      </div>
      {(plano.attachment || plano.link) && (
        <div className="plano-links">
          {plano.attachment && (
            <button
              type="button"
              className="btn-text attachment-link"
              onClick={() => abrirAnexo(plano.attachment.path)}
            >
              <Paperclip size={13} strokeWidth={2.5} aria-hidden="true" />
              Ver carteirinha
            </button>
          )}
          {plano.link && (
            <a className="btn-text" href={plano.link} target="_blank" rel="noopener noreferrer">
              Abrir portal do plano
            </a>
          )}
        </div>
      )}
    </div>
  )
}

function PlanoSaudeForm({ pet, onSave }) {
  const plano = pet.planoSaude
  const [nome, setNome] = useState(plano?.nome || '')
  const [numero, setNumero] = useState(plano?.numero || '')
  const [link, setLink] = useState(plano?.link || '')
  const [attachment, setAttachment] = useState(null)
  const [existingAttachment, setExistingAttachment] = useState(plano?.attachment || null)
  const [saved, setSaved] = useState(false)
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  function handleAttachmentChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setAttachment(file)
    setExistingAttachment(null)
  }

  function removeAttachment() {
    setAttachment(null)
    setExistingAttachment(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setSalvando(true)
    try {
      const attachmentRemoved = Boolean(plano?.attachment) && !existingAttachment && !attachment
      await onSave({
        nome,
        numero,
        link,
        attachment,
        attachmentChanged: Boolean(attachment) || attachmentRemoved,
      })
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
        <span className="field-label">Nome do plano</span>
        <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Petlove Saúde, Sanor..." />
      </label>

      <label className="field">
        <span className="field-label">Nº da carteirinha</span>
        <input value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="Ex: 000123456" />
      </label>

      <label className="field">
        <span className="field-label">Link do site / portal do plano</span>
        <input
          type="url"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="https://..."
        />
      </label>

      <label className="field">
        <span className="field-label">Carteirinha (foto ou PDF)</span>
        <input type="file" accept="image/*,.pdf" onChange={handleAttachmentChange} />
        {(attachment || existingAttachment) && (
          <span className="field-hint attachment-hint">
            <Paperclip size={13} strokeWidth={2.5} aria-hidden="true" />
            {attachment ? attachment.name : existingAttachment.name}
            <button
              type="button"
              className="attachment-remove"
              onClick={removeAttachment}
              aria-label="Remover anexo"
            >
              <X size={13} strokeWidth={2.5} />
            </button>
          </span>
        )}
      </label>

      {erro && <p className="auth-error">{erro}</p>}
      {saved && (
        <p className="form-success">
          <Check size={16} strokeWidth={2.5} aria-hidden="true" />
          Plano de saúde salvo!
        </p>
      )}

      <button type="submit" className="btn-pill" disabled={salvando}>
        {salvando ? 'Salvando...' : 'Salvar plano de saúde'}
      </button>
    </form>
  )
}

const SUB_SECTIONS = [
  { key: 'vacina', label: 'Vacinas' },
  { key: 'consulta', label: 'Consultas' },
  { key: 'plano', label: 'Plano de saúde' },
]

function VacinasSection({
  pets,
  records,
  onAddRecord,
  onUpdateRecord,
  onDeleteRecord,
  onUpdatePlano,
  preselectedPetId,
  preselectedSubSection,
}) {
  const [planoPetId, setPlanoPetId] = useState(preselectedPetId || pets[0]?.id)
  const [subSection, setSubSection] = useState(preselectedSubSection || 'vacina')

  const planoPet = pets.find((pet) => pet.id === planoPetId)
  const vacinaRecords = records
    .filter((entry) => entry.type === 'vacina')
    .sort((a, b) => (a.date < b.date ? 1 : -1))
  const consultaRecords = records
    .filter((entry) => entry.type === 'consulta')
    .sort((a, b) => (a.date < b.date ? 1 : -1))

  return (
    <div className="racao-section">
      <NextRecordCard records={records} pets={pets} />

      <div className="type-toggle" role="tablist" aria-label="Seção de saúde">
        {SUB_SECTIONS.map((section) => (
          <button
            key={section.key}
            type="button"
            role="tab"
            aria-selected={subSection === section.key}
            className={`type-toggle-btn ${subSection === section.key ? 'active' : ''}`}
            onClick={() => setSubSection(section.key)}
          >
            {section.label}
          </button>
        ))}
      </div>

      {subSection === 'vacina' && (
        <>
          <div className="section-label">Registrar vacina</div>
          <VacinaForm
            pets={pets}
            defaultPetId={preselectedPetId || pets[0]?.id}
            onSubmit={(payload) => onAddRecord({ ...payload, type: 'vacina' })}
          />
          <HistorySection
            title="Histórico de vacinas"
            entries={vacinaRecords}
            emptyLabel="Nenhuma vacina registrada ainda."
            pets={pets}
            onUpdateRecord={onUpdateRecord}
            onDeleteRecord={onDeleteRecord}
          />
        </>
      )}

      {subSection === 'consulta' && (
        <>
          <div className="section-label">Registrar consulta</div>
          <ConsultaForm
            pets={pets}
            defaultPetId={preselectedPetId || pets[0]?.id}
            onSubmit={(payload) => onAddRecord({ ...payload, type: 'consulta' })}
          />
          <HistorySection
            title="Histórico de consultas"
            entries={consultaRecords}
            emptyLabel="Nenhuma consulta registrada ainda."
            pets={pets}
            onUpdateRecord={onUpdateRecord}
            onDeleteRecord={onDeleteRecord}
          />
        </>
      )}

      {subSection === 'plano' && (
        <>
          <div className="section-label">Pet</div>
          <PetSelect pets={pets} petId={planoPetId} onChange={setPlanoPetId} />
          {planoPet && (
            <>
              <PlanoSaudeSummary pet={planoPet} />
              <div className="section-label">Editar plano de saúde</div>
              <PlanoSaudeForm pet={planoPet} onSave={(payload) => onUpdatePlano(planoPetId, payload)} />
            </>
          )}
        </>
      )}
    </div>
  )
}

export default VacinasSection
