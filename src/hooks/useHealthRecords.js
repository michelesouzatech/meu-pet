import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export const HEALTH_TYPES = ['vacina', 'consulta']

export const HEALTH_LABELS = {
  vacina: 'Vacina',
  consulta: 'Consulta',
}

function mapRecord(row) {
  return {
    id: row.id,
    petId: row.pet_id,
    type: row.tipo,
    description: row.descricao || '',
    date: row.data,
    nextDate: row.proxima_data,
    notes: row.observacoes || '',
    clinic: row.clinica || '',
    professional: row.profissional || '',
    specialty: row.especialidade || '',
    attachment: row.anexo_url
      ? { name: row.anexo_nome || row.anexo_url.split('/').pop(), path: row.anexo_url }
      : null,
  }
}

export function useHealthRecords(casaId) {
  const [records, setRecords] = useState([])

  const reload = useCallback(() => {
    supabase
      .from('vacinas_consultas')
      .select(
        'id, pet_id, tipo, descricao, data, proxima_data, observacoes, clinica, profissional, especialidade, anexo_url, anexo_nome'
      )
      .order('data', { ascending: false })
      .then(({ data }) => setRecords((data || []).map(mapRecord)))
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  async function addRecord({
    petId,
    type,
    description,
    date,
    nextDate,
    notes,
    clinic,
    professional,
    specialty,
    attachment,
  }) {
    let anexoUrl = null
    let anexoNome = null
    if (attachment instanceof File) {
      const nomeSeguro = attachment.name.replace(/[^a-zA-Z0-9._-]/g, '-')
      const path = `${casaId}/${petId}-${Date.now()}-${nomeSeguro}`
      const { error: uploadError } = await supabase.storage.from('anexos').upload(path, attachment)
      if (uploadError) throw uploadError
      anexoUrl = path
      anexoNome = attachment.name
    }

    const { error } = await supabase.from('vacinas_consultas').insert({
      pet_id: petId,
      tipo: type,
      descricao: description?.trim() || null,
      data: date,
      proxima_data: nextDate || null,
      observacoes: notes?.trim() || null,
      clinica: clinic?.trim() || null,
      profissional: professional?.trim() || null,
      especialidade: specialty?.trim() || null,
      anexo_url: anexoUrl,
      anexo_nome: anexoNome,
    })
    if (error) throw error
    await reload()
  }

  return { records, addRecord }
}
