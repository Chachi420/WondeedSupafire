// Indian-convention number formatting used across all dashboard pages

export function fmtRupee(n: number): string {
  if (n >= 10_000_000) return '₹' + (n / 10_000_000).toFixed(1).replace(/\.0$/, '') + 'Cr'
  if (n >= 100_000)    return '₹' + (n / 100_000).toFixed(1).replace(/\.0$/, '') + 'L'
  if (n >= 1_000)      return '₹' + (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K'
  return '₹' + n.toLocaleString('en-IN')
}

// Full rupee with Indian comma grouping (for precise values like wallet balance)
export function fmtRupeeFull(n: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(n)
}

export function fmtViews(n: number): string {
  if (n >= 10_000_000) return (n / 10_000_000).toFixed(1).replace(/\.0$/, '') + 'Cr'
  if (n >= 100_000)    return (n / 100_000).toFixed(1).replace(/\.0$/, '') + 'L'
  if (n >= 1_000)      return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K'
  return n.toLocaleString('en-IN')
}

export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}
