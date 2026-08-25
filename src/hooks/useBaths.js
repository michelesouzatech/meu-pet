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

  async function addBath({ petIds, date, nextDate }) {
    const rows = petIds.map((petId) => ({
      pet_id: petId,
      data: date,
      proxima_data: nextDate || null,
    }))
    const { error } = await supabase.from('banhos').insert(rows)
    if (error) throw error
    await reload()
  }

  return { baths, addBath }
}
