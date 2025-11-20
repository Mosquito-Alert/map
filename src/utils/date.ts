export const daysSince = (dateString: string): number => {
  const pastDate = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - pastDate.getTime()
  // Convert milliseconds to days
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  return Math.floor(diffDays)
}
