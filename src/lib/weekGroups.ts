/** "Week of Aug 11 - Aug 17, 2026" for the Monday-Sunday week starting `monday`. */
export function formatWeekRange(monday: Date): string {
  const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6)
  const fmt = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `Week of ${fmt(monday)} - ${fmt(sunday)}, ${sunday.getFullYear()}`
}
