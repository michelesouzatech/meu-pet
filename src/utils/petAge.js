export function formatAge(birthDate) {
  if (!birthDate) return ''
  const birth = new Date(birthDate)
  if (Number.isNaN(birth.getTime())) return ''

  const now = new Date()
  let years = now.getFullYear() - birth.getFullYear()
  let months = now.getMonth() - birth.getMonth()

  if (now.getDate() < birth.getDate()) months -= 1
  if (months < 0) {
    years -= 1
    months += 12
  }

  if (years <= 0 && months <= 0) return 'Recém-nascido'

  const parts = []
  if (years > 0) parts.push(`${years} ${years === 1 ? 'ano' : 'anos'}`)
  if (months > 0) parts.push(`${months} ${months === 1 ? 'mês' : 'meses'}`)
  return parts.join(' e ')
}
