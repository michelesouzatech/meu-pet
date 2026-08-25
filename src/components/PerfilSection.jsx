import { useEffect, useState } from 'react'
import { formatAge } from '../utils/petAge'
import { SEX_LABELS } from '../hooks/usePets'
import { supabase } from '../lib/supabaseClient'

const SEX_OPTIONS = Object.entries(SEX_LABELS).map(([value, label]) => ({ value, label }))

function PetEditCard({ pet, onSave }) {
  const [name, setName] = useState(pet.name)
  const [breed, setBreed] = useState(pet.breed)
  const [birthDate, setBirthDate] = useState(pet.birthDate)
  const [photo, setPhoto] = useState(pet.photo)
  const [sex, setSex] = useState(pet.sex || '')
  const [about, setAbout] = useState(pet.about || '')
  const [saved, setSaved] = useState(false)
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)
  const ageLabel = formatAge(birthDate)

  function handlePhotoChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPhoto(reader.result)
    reader.readAsDataURL(file)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setSalvando(true)
    try {
      await onSave(pet.id, { name, breed, birthDate, photo, sex, about })
      setSaved(true)
      setTimeout(() => setSaved(false), 1500)
    } catch (err) {
      setErro(err.message)
    } finally {
      setSalvando(false)
    }
  }

  const initial = (name || pet.name || '?').charAt(0).toUpperCase()

  return (
    <form className="card profile-card" onSubmit={handleSubmit}>
      <label className="pet-photo-upload">
        <div className={`pet-photo tone-${pet.tone}`}>
          {photo ? (
            <img src={photo} alt="" className="pet-photo-img" />
          ) : (
            <span className="pet-photo-initial">{initial}</span>
          )}
        </div>
        <input type="file" accept="image/*" onChange={handlePhotoChange} className="sr-only" />
        <span className="profile-photo-hint">Trocar foto</span>
      </label>

      <label className="field">
        <span className="field-label">Nome</span>
        <input value={name} onChange={(e) => setName(e.target.value)} required />
      </label>

      <label className="field">
        <span className="field-label">Raça</span>
        <input
          value={breed}
          onChange={(e) => setBreed(e.target.value)}
          placeholder="Ex: SRD, Siamês..."
        />
      </label>

      <label className="field">
        <span className="field-label">Data de nascimento</span>
        <input
          type="date"
          value={birthDate || ''}
          onChange={(e) => setBirthDate(e.target.value)}
          max={new Date().toISOString().slice(0, 10)}
        />
        {ageLabel && <span className="field-hint">≈ {ageLabel}</span>}
      </label>

      <div className="field">
        <span className="field-label">Sexo</span>
        <div className="type-toggle" role="tablist" aria-label="Sexo do pet">
          {SEX_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={sex === option.value}
              className={`type-toggle-btn ${sex === option.value ? 'active' : ''}`}
              onClick={() => setSex(sex === option.value ? '' : option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <label className="field">
        <span className="field-label">Sobre o pet</span>
        <textarea
          value={about}
          onChange={(e) => setAbout(e.target.value)}
          placeholder="Personalidade, manias, coisas que gosta..."
          rows={3}
        />
      </label>

      {erro && <p className="auth-error">{erro}</p>}

      <button type="submit" className="btn-pill" disabled={salvando}>
        {salvando ? 'Salvando...' : saved ? 'Salvo!' : 'Salvar'}
      </button>
    </form>
  )
}

function AddPetCard({ onAdd }) {
  const [name, setName] = useState('')
  const [breed, setBreed] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setSalvando(true)
    try {
      await onAdd({ name, breed, birthDate, photo: null })
      setName('')
      setBreed('')
      setBirthDate('')
    } catch (err) {
      setErro(err.message)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <span className="section-label">Adicionar pet</span>

      <label className="field">
        <span className="field-label">Nome</span>
        <input value={name} onChange={(e) => setName(e.target.value)} required />
      </label>

      <label className="field">
        <span className="field-label">Raça</span>
        <input
          value={breed}
          onChange={(e) => setBreed(e.target.value)}
          placeholder="Ex: SRD, Persa..."
        />
      </label>

      <label className="field">
        <span className="field-label">Data de nascimento</span>
        <input
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          max={new Date().toISOString().slice(0, 10)}
        />
      </label>

      {erro && <p className="auth-error">{erro}</p>}

      <button type="submit" className="btn-pill" disabled={salvando}>
        {salvando ? 'Adicionando...' : 'Adicionar pet'}
      </button>
    </form>
  )
}

function ConvidarMoradorCard({ session, perfil }) {
  const [casa, setCasa] = useState(null)
  const [link, setLink] = useState('')
  const [erro, setErro] = useState('')
  const [copiado, setCopiado] = useState(false)
  const [gerando, setGerando] = useState(false)

  useEffect(() => {
    supabase
      .from('casas')
      .select('id, nome, criado_por')
      .eq('id', perfil.casa_id)
      .maybeSingle()
      .then(({ data }) => setCasa(data))
  }, [perfil.casa_id])

  if (!casa) return null

  const souCriadora = casa.criado_por === session.user.id

  if (!souCriadora) {
    return (
      <div className="card">
        <span className="section-label">Sua casa</span>
        <p className="field-hint">{casa.nome}</p>
      </div>
    )
  }

  async function handleGerarConvite() {
    setErro('')
    setGerando(true)
    try {
      const { data, error } = await supabase.rpc('gerar_convite')
      if (error) throw error
      setLink(`${window.location.origin}${window.location.pathname}?convite=${data}`)
      setCopiado(false)
    } catch (err) {
      setErro(err.message)
    } finally {
      setGerando(false)
    }
  }

  async function handleCopiar() {
    await navigator.clipboard.writeText(link)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <div className="card">
      <span className="section-label">Chame o outro tutor para participar do app também</span>
      <p className="field-hint">
        Gere um link e mande por WhatsApp pra pessoa entrar na "{casa.nome}"
      </p>
      <button type="button" className="btn-pill" onClick={handleGerarConvite} disabled={gerando}>
        {gerando ? 'Gerando...' : 'Gerar link de convite'}
      </button>
      {erro && <p className="auth-error">{erro}</p>}
      {link && (
        <label className="field">
          <span className="field-label">Link (uso único)</span>
          <input type="text" value={link} readOnly onFocus={(e) => e.target.select()} />
          <button type="button" className="btn-text" onClick={handleCopiar}>
            {copiado ? 'Link copiado!' : 'Copiar link'}
          </button>
        </label>
      )}
    </div>
  )
}

function PerfilSection({ pets, onSave, onAddPet, session, perfil }) {
  return (
    <div className="perfil-section">
      <ConvidarMoradorCard session={session} perfil={perfil} />

      {pets.length > 0 && <div className="section-label">Perfis dos pets</div>}
      {pets.map((pet) => (
        <PetEditCard key={pet.id} pet={pet} onSave={onSave} />
      ))}

      <AddPetCard onAdd={onAddPet} />
    </div>
  )
}

export default PerfilSection
