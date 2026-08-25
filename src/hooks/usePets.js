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
  }
}

export function usePets(casaId) {
  const [pets, setPets] = useState([])

  const reload = useCallback(() => {
    if (!casaId) return
    supabase
      .from('pets')
      .select('id, nome, raca, data_nascimento, foto_url, sexo, sobre')
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

  return { pets, addPet, updatePet }
}
