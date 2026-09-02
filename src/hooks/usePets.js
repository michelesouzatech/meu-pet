import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const TONES = ['theo', 'chloe']

export const SEX_LABELS = {
  femea: 'Fêmea',
  macho: 'Macho',
}

function mapPet(row, index) {
  return {
    id: row.id,
    name: row.nome,
    breed: row.raca || '',
    birthDate: row.data_nascimento || '',
    photo: row.foto_url || null,
    sex: row.sexo || '',
    about: row.sobre || '',
    tone: TONES[index % TONES.length],
    planoSaude: {
      nome: row.plano_saude_nome || '',
      numero: row.plano_saude_numero || '',
      link: row.plano_saude_link || '',
      attachment: row.plano_saude_anexo_url
        ? { name: row.plano_saude_anexo_nome || row.plano_saude_anexo_url.split('/').pop(), path: row.plano_saude_anexo_url }
        : null,
    },
  }
}

export function usePets(casaId) {
  const [pets, setPets] = useState([])

  const reload = useCallback(() => {
    if (!casaId) return
    supabase
      .from('pets')
      .select(
        'id, nome, raca, data_nascimento, foto_url, sexo, sobre, plano_saude_nome, plano_saude_numero, plano_saude_link, plano_saude_anexo_url, plano_saude_anexo_nome'
      )
      .eq('casa_id', casaId)
      .order('created_at', { ascending: true })
      .then(({ data }) => setPets((data || []).map(mapPet)))
  }, [casaId])

  useEffect(() => {
    reload()
  }, [reload])

  async function addPet({ name, breed, birthDate, photo, sex, about }) {
    const { error } = await supabase.from('pets').insert({
      casa_id: casaId,
      nome: name.trim(),
      raca: breed?.trim() || null,
      data_nascimento: birthDate || null,
      foto_url: photo || null,
      sexo: sex || null,
      sobre: about?.trim() || null,
    })
    if (error) throw error
    await reload()
  }

  async function updatePet(id, updates) {
    const payload = {}
    if ('name' in updates) payload.nome = updates.name
    if ('breed' in updates) payload.raca = updates.breed || null
    if ('birthDate' in updates) payload.data_nascimento = updates.birthDate || null
    if ('photo' in updates) payload.foto_url = updates.photo || null
    if ('sex' in updates) payload.sexo = updates.sex || null
    if ('about' in updates) payload.sobre = updates.about?.trim() || null

    const { error } = await supabase.from('pets').update(payload).eq('id', id)
    if (error) throw error
    await reload()
  }

  async function updatePlanoSaude(id, { nome, numero, link, attachment, attachmentChanged }) {
    const payload = {
      plano_saude_nome: nome?.trim() || null,
      plano_saude_numero: numero?.trim() || null,
      plano_saude_link: link?.trim() || null,
    }

    if (attachmentChanged) {
      if (attachment instanceof File) {
        const nomeSeguro = attachment.name.replace(/[^a-zA-Z0-9._-]/g, '-')
        const path = `${casaId}/${id}-carteirinha-${Date.now()}-${nomeSeguro}`
        const { error: uploadError } = await supabase.storage.from('anexos').upload(path, attachment)
        if (uploadError) throw uploadError
        payload.plano_saude_anexo_url = path
        payload.plano_saude_anexo_nome = attachment.name
      } else {
        payload.plano_saude_anexo_url = null
        payload.plano_saude_anexo_nome = null
      }
    }

    const { error } = await supabase.from('pets').update(payload).eq('id', id)
    if (error) throw error
    await reload()
  }

  return { pets, addPet, updatePet, updatePlanoSaude }
}
