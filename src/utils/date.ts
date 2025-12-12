export const daysSince = (dateString: string): number => {
  const pastDate = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - pastDate.getTime()
  // Convert milliseconds to days
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  return Math.floor(diffDays)
}

// Format a date string (ISO format) to "DD/MM/YYYY"
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0') // Months are zero-based
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}
