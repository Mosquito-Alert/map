// --- Debounce helper ---
export const debounce = <T extends (...args: any[]) => void>(fn: T, delay: number) => {
  let timer: number | undefined
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = window.setTimeout(() => fn(...args), delay)
  }
}
