import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import FoodBowlIcon from '../icons/FoodBowlIcon'
import PoopIcon from '../icons/PoopIcon'

export const SUPPLY_TYPES = ['racao', 'areia']

export const SUPPLY_LABELS = {
  racao: 'Ração',
  areia: 'Higiene',
}

export const SUPPLY_ICONS = {
  racao: FoodBowlIcon,
  areia: PoopIcon,
}

export const SUPPLY_TONES = {
  racao: 'peach',
  areia: 'lilac',
}

function mapSupply(row) {
  return {
    id: row.id,
    type: row.tipo,
    brand: row.marca || '',
    subBrand: row.sub_marca || '',
    price: row.preco,
    place: row.local_compra || '',
    purchaseDate: row.data_compra,
    endDate: row.data_fim,
  }
}

export function useSupplies(casaId) {
  const [supplies, setSupplies] = useState([])

  const reload = useCallback(() => {
    if (!casaId) return
    supabase
      .from('compras_racao_areia')
      .select('id, tipo, marca, sub_marca, preco, local_compra, data_compra, data_fim')
      .eq('casa_id', casaId)
      .order('data_compra', { ascending: false })
      .then(({ data }) => setSupplies((data || []).map(mapSupply)))
  }, [casaId])

  useEffect(() => {
    reload()
  }, [reload])

  async function addSupply({ type, brand, subBrand, price, place, purchaseDate }) {
    const { error } = await supabase.from('compras_racao_areia').insert({
      casa_id: casaId,
      tipo: type,
      marca: brand?.trim() || null,
      sub_marca: subBrand?.trim() || null,
      preco: price === '' || price == null ? null : Number(price),
      local_compra: place?.trim() || null,
      data_compra: purchaseDate,
    })
    if (error) throw error
    await reload()
  }

  async function markSupplyEnded(id, endDate) {
    const { error } = await supabase
      .from('compras_racao_areia')
      .update({ data_fim: endDate })
      .eq('id', id)
    if (error) throw error
    await reload()
  }

  async function updateSupply(id, { type, brand, subBrand, price, place, purchaseDate }) {
    const { error } = await supabase
      .from('compras_racao_areia')
      .update({
        tipo: type,
        marca: brand?.trim() || null,
        sub_marca: subBrand?.trim() || null,
        preco: price === '' || price == null ? null : Number(price),
        local_compra: place?.trim() || null,
        data_compra: purchaseDate,
      })
      .eq('id', id)
    if (error) throw error
    await reload()
  }

  async function deleteSupply(id) {
    const { error } = await supabase.from('compras_racao_areia').delete().eq('id', id)
    if (error) throw error
    await reload()
  }

  return { supplies, addSupply, markSupplyEnded, updateSupply, deleteSupply }
}
