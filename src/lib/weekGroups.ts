/** "Week of Aug 11 - Aug 17, 2026" for the Saturday-Friday week starting `weekStart`. */
export function formatWeekRange(weekStart: Date): string {
  const weekEnd = new Date(
    weekStart.getFullYear(),
    weekStart.getMonth(),
    weekStart.getDate() + 6,
  )
  const fmt = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `Week of ${fmt(weekStart)} - ${fmt(weekEnd)}, ${weekEnd.getFullYear()}`
}
