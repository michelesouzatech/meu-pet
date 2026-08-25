import { useState } from 'react'
import { PawPrint } from 'lucide-react'

function traduzirErro(mensagem) {
  const mapa = {
    'Invalid login credentials': 'E-mail ou senha incorretos.',
    'User already registered': 'Já existe uma conta com esse e-mail. Tente entrar.',
    'Password should be at least 6 characters': 'A senha precisa ter pelo menos 6 caracteres.',
    'Email not confirmed': 'E-mail ainda não confirmado.',
  }
  return mapa[mensagem] || mensagem
}

export default function AuthScreen({ signIn, signUp }) {
  const token = new URLSearchParams(window.location.search).get('convite')
  const [modo, setModo] = useState(token ? 'cadastro' : 'login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nome, setNome] = useState('')
  const [nomeCasa, setNomeCasa] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setEnviando(true)
    try {
      if (modo === 'login') {
        await signIn({ email, password })
      } else {
        await signUp({ email, password, nome, nomeCasa, token })
      }
    } catch (err) {
      setErro(traduzirErro(err.message))
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

      {token && modo === 'cadastro' && (
        <div className="card auth-invite-banner">
          <p>Você recebeu um convite! Crie sua conta abaixo pra entrar na casa.</p>
        </div>
      )}

      <div className="card">
        {!token && (
          <div className="type-toggle">
            <button
              type="button"
              className={`type-toggle-btn ${modo === 'login' ? 'active' : ''}`}
              onClick={() => setModo('login')}
            >
              Entrar
            </button>
            <button
              type="button"
              className={`type-toggle-btn ${modo === 'cadastro' ? 'active' : ''}`}
              onClick={() => setModo('cadastro')}
            >
              Criar conta
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="card auth-form">
          {modo === 'cadastro' && (
            <label className="field">
              <span className="field-label">Seu nome</span>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </label>
          )}

          {modo === 'cadastro' && !token && (
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

          <label className="field">
            <span className="field-label">E-mail</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="field">
            <span className="field-label">Senha</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </label>

          {erro && <p className="auth-error">{erro}</p>}

          <button type="submit" className="btn-pill" disabled={enviando}>
            {enviando ? 'Um instante...' : modo === 'login' ? 'Entrar' : 'Criar conta'}
          </button>
        </form>
      </div>
    </div>
  )
}
