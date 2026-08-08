export function csvCell(value) {
  const text = value == null ? '' : String(value)
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export function exportCsv(rows, filename = 'agencyos-export.csv') {
  try {
    if (!Array.isArray(rows) || rows.length === 0 || typeof window === 'undefined') return false
    const headers = [...new Set(rows.flatMap((row) => Object.keys(row || {})))]
    const content = [headers, ...rows.map((row) => headers.map((key) => csvCell(row?.[key])))]
      .map((row) => row.join(','))
      .join('\r\n')
    const url = URL.createObjectURL(new Blob([`\uFEFF${content}`], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
    return true
  } catch { return false }
}
