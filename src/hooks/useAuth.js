import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

async function fetchPerfil(userId) {
  const { data } = await supabase
    .from('perfis')
    .select('id, casa_id, nome')
    .eq('id', userId)
    .maybeSingle()
  return data
}

export function useAuth() {
  const [session, setSession] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) {
      setPerfil(null)
      setLoading(false)
      return
    }
    setLoading(true)
    fetchPerfil(session.user.id).then((data) => {
      setPerfil(data)
      setLoading(false)
    })
  }, [session])

  async function entrarNaCasa({ nome, nomeCasa, token, userId }) {
    const { error: rpcError } = token
      ? await supabase.rpc('entrar_por_convite', { p_token: token, p_nome_pessoa: nome })
      : await supabase.rpc('criar_casa_e_perfil', { p_nome_casa: nomeCasa, p_nome_pessoa: nome })

    if (rpcError) throw rpcError

    setPerfil(await fetchPerfil(userId))
  }

  async function signUp({ email, password, nome, nomeCasa, token }) {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error

    if (data.session) {
      // Garante que o cliente já está usando a sessão nova antes da próxima chamada,
      // evitando uma corrida em que o RPC saía como visitante anônimo (401).
      await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      })
    }

    await entrarNaCasa({ nome, nomeCasa, token, userId: data.user.id })
  }

  async function signIn({ email, password }) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return { session, perfil, loading, signUp, signIn, signOut, entrarNaCasa }
}
