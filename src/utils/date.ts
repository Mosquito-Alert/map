export enum PeriodicityEnum {
  Day = 'day',
  Month = 'month',
  Year = 'year',
}

export const formatDateByPeriodicity = (
  dateString: string | null,
  periodicity: PeriodicityEnum,
) => {
  if (!dateString) return ''

  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return ''

  if (periodicity === PeriodicityEnum.Year) {
    return String(date.getFullYear())
  }

  if (periodicity === PeriodicityEnum.Month) {
    const month = String(date.getMonth() + 1).padStart(2, '0')
    return `${month}/${date.getFullYear()}`
  }

  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${day}/${month}/${date.getFullYear()}`
}

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

/**
 * Given a date, returns the index of the day in the year.
 * For example, January 1st is 0, January 2nd is 1, and so on.
 * @param date
 * @returns
 */
export const getDayIndexInYear = (date: any): number => {
  const startOfYear = new Date(date.getFullYear(), 0, 1) as any
  const diffInMs = date - startOfYear
  const dayIndex = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
  return dayIndex
}

/**
 * Returns an array of timestamps between start and end (inclusive),
 * stepping by the given periodicity.
 * @param start
 * @param end
 * @param periodicity
 * @returns [number]. Example: [1672531200000, 1672617600000, ...] for daily timestamps
 * @throws Error if start is after end
 */
export const getTimestampsBetween = (
  start: Date,
  end: Date,
  periodicity: PeriodicityEnum,
): number[] => {
  if (start > end) {
    throw new Error('Start date must be before or equal to end date')
  }

  const result: number[] = []
  let current = new Date(start)

  while (current <= end) {
    result.push(current.getTime())

    current = addPeriod(current, periodicity)
  }

  return result
}

/**
 * Given a record of date strings to numbers, fills in any missing dates between the earliest and latest date with a value of 0.
 * @param data. The date could be either in ISO format (e.g. "2023-01-01") or as a timestamp string (e.g. "1672531200000").
 * All keys must use the same format.
 * @returns {number: number}. Example: { 1672531200000: 5, 1672617600000: 0, ... }
 */
export const fillMissingDates = (
  data: Record<string, number>,
  periodicity: PeriodicityEnum,
): Record<number, number> => {
  const keys = Object.keys(data)
  if (keys.length === 0) {
    return {}
  }

  const sortedKeys = keys.sort()
  const isTimestampFormat = /^\d+$/.test(sortedKeys[0] as string)

  const start = isTimestampFormat
    ? new Date(Number(sortedKeys[0] as string))
    : new Date(sortedKeys[0] as string)
  const end = isTimestampFormat
    ? new Date(Number(sortedKeys[sortedKeys.length - 1] as string))
    : new Date(sortedKeys[sortedKeys.length - 1] as string)

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new Error('Invalid date keys')
  }

  const result: Record<number, number> = {}
  for (let d = new Date(start); d <= end; d = addPeriod(d, periodicity)) {
    const timestampKey = d.getTime()
    const inputKey = isTimestampFormat ? String(timestampKey) : d.toISOString().slice(0, 10)
    result[timestampKey] = data[inputKey] ?? 0
  }

  return result
}

/**
 * Takes a date and returns a new date incremented by one unit (day, month, or year).
 * @param date
 * @param periodicity
 * @returns Date. Example: addPeriod(new Date("2023-01-31"), PeriodicityEnum.Month) returns new Date("2023-02-28")
 */
const addPeriod = (date: Date, periodicity: PeriodicityEnum): Date => {
  const d = new Date(date)

  switch (periodicity) {
    case PeriodicityEnum.Day:
      d.setDate(d.getDate() + 1)
      return d

    case PeriodicityEnum.Month: {
      const day = d.getDate()

      d.setDate(1)
      d.setMonth(d.getMonth() + 1)

      const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()

      d.setDate(Math.min(day, lastDay))
      return d
    }

    case PeriodicityEnum.Year: {
      const originalMonth = d.getMonth()

      d.setFullYear(d.getFullYear() + 1)

      // Handle Feb 29 rollover
      if (d.getMonth() !== originalMonth) {
        d.setDate(0)
      }

      return d
    }
  }
}
