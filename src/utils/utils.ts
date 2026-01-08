// Array should be sorted
export const quantile = (ascSortedArr: number[], q: number): number => {
  const pos = (ascSortedArr.length - 1) * q
  const base = Math.floor(pos)
  const rest = pos - base
  return ascSortedArr[base + 1] !== undefined
    ? ascSortedArr[base] + rest * (ascSortedArr[base + 1] - ascSortedArr[base])
    : ascSortedArr[base]
}
