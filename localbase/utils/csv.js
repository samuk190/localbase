/**
 * Lightweight JSON to CSV and CSV to JSON converter.
 */
export function jsonToCsv(data) {
  if (!Array.isArray(data) || !data.length) {
    return ''
  }

  // Extract all unique headers across all objects
  const headers = Array.from(
    new Set(
      data.reduce((keys, obj) => {
        if (obj && typeof obj === 'object') {
          return keys.concat(Object.keys(obj))
        }
        return keys
      }, [])
    )
  )

  const escapeField = (val) => {
    if (val === null || val === undefined) return ''
    if (typeof val === 'object') {
      val = JSON.stringify(val)
    }
    const str = String(val)
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  const csvRows = [headers.map(escapeField).join(',')]

  for (const item of data) {
    const row = headers.map((header) => escapeField(item ? item[header] : ''))
    csvRows.push(row.join(','))
  }

  return csvRows.join('\n')
}

export function csvToJson(csvString) {
  if (!csvString || typeof csvString !== 'string') return []

  const lines = csvString.trim().split(/\r?\n/)
  if (lines.length < 2) return []

  // Parse header
  const parseRow = (row) => {
    const entries = []
    let current = ''
    let insideQuotes = false

    for (let i = 0; i < row.length; i++) {
      const char = row[i]
      if (char === '"' && (i === 0 || row[i - 1] !== '\\')) {
        if (insideQuotes && row[i + 1] === '"') {
          current += '"'
          i++
        } else {
          insideQuotes = !insideQuotes
        }
      } else if (char === ',' && !insideQuotes) {
        entries.push(current)
        current = ''
      } else {
        current += char
      }
    }
    entries.push(current)
    return entries
  }

  const headers = parseRow(lines[0])
  const result = []

  for (let i = 1; i < lines.length; i++) {
    const values = parseRow(lines[i])
    const obj = {}
    headers.forEach((header, index) => {
      let val = values[index] !== undefined ? values[index] : ''
      // Attempt numeric parse
      if (val !== '' && !isNaN(val)) {
        val = Number(val)
      } else if (val === 'true') {
        val = true
      } else if (val === 'false') {
        val = false
      }
      obj[header] = val
    })
    result.push(obj)
  }

  return result
}

export default {
  jsonToCsv,
  csvToJson
}
