import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

function mapBath(row) {
  return {
    id: row.id,
    petId: row.pet_id,
    date: row.data,
    nextDate: row.proxima_data,
  }
}

export function useBaths() {
  const [baths, setBaths] = useState([])

  const reload = useCallback(() => {
    supabase
      .from('banhos')
      .select('id, pet_id, data, proxima_data')
      .order('data', { ascending: false })
      .then(({ data }) => setBaths((data || []).map(mapBath)))
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  async function addBath({ petId, date, nextDate }) {
    const { error } = await supabase.from('banhos').insert({
      pet_id: petId,
      data: date,
      proxima_data: nextDate || null,
    })
    if (error) throw error
    await reload()
  }

  return { baths, addBath }
}
