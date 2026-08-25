import { useState } from 'react'
import { PawPrint } from 'lucide-react'

export default function CompletarCasaScreen({ session, entrarNaCasa }) {
  const token = new URLSearchParams(window.location.search).get('convite')
  const [nome, setNome] = useState('')
  const [nomeCasa, setNomeCasa] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setEnviando(true)
    try {
      await entrarNaCasa({ nome, nomeCasa, token, userId: session.user.id })
    } catch (err) {
      setErro(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="app auth-screen">
      <div className="auth-brand">
        <span className="avatar-photo" aria-hidden="true">
          <PawPrint size={26} strokeWidth={2.4} />
        </span>
        <h1 className="brand">Meu Pet</h1>
      </div>

      <div className="card auth-invite-banner">
        <p>Sua conta já existe! Só falta esse último passo pra terminar o cadastro.</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="auth-form">
          <label className="field">
            <span className="field-label">Seu nome</span>
            <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required />
          </label>

          {!token && (
            <label className="field">
              <span className="field-label">Nome da casa (ex: Casa do Thiago e Michele)</span>
              <input
                type="text"
                value={nomeCasa}
                onChange={(e) => setNomeCasa(e.target.value)}
                required
              />
            </label>
          )}

          {erro && <p className="auth-error">{erro}</p>}

          <button type="submit" className="btn-pill" disabled={enviando}>
            {enviando ? 'Um instante...' : 'Concluir cadastro'}
          </button>
        </form>
      </div>
    </div>
  )
}
