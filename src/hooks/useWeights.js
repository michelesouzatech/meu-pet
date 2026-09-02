import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

function mapWeight(row) {
  return {
    id: row.id,
    petId: row.pet_id,
    date: row.data,
    value: row.valor,
  }
}

export function useWeights() {
  const [weights, setWeights] = useState([])

  const reload = useCallback(() => {
    supabase
      .from('pesos')
      .select('id, pet_id, data, valor')
      .order('data', { ascending: false })
      .then(({ data }) => setWeights((data || []).map(mapWeight)))
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  async function addWeight({ petId, date, value }) {
    const { error } = await supabase.from('pesos').insert({
      pet_id: petId,
      data: date,
      valor: value,
    })
    if (error) throw error
    await reload()
  }

  async function updateWeight(id, { date, value }) {
    const { error } = await supabase.from('pesos').update({ data: date, valor: value }).eq('id', id)
    if (error) throw error
    await reload()
  }

  async function deleteWeight(id) {
    const { error } = await supabase.from('pesos').delete().eq('id', id)
    if (error) throw error
    await reload()
  }

  return { weights, addWeight, updateWeight, deleteWeight }
}
