import reset from '../../api-utils/reset'
import { jsonToCsv } from '../../utils/csv'

export default async function exportData(options = { format: 'json' }) {
  const collectionName = this.collectionName
  const format = options.format || 'json'

  // Helper to trigger browser download
  const triggerDownload = (content, filename, mimeType) => {
    if (typeof document !== 'undefined' && document.createElement) {
      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  // 1. Single Collection Export
  if (collectionName) {
    const docs = await this.collection(collectionName).get({ keys: options.keys || false })
    reset.call(this)

    if (format === 'csv') {
      const csvStr = jsonToCsv(docs)
      if (options.download) {
        triggerDownload(csvStr, options.filename || `${collectionName}.csv`, 'text/csv')
      }
      return csvStr
    }

    // Default JSON
    const jsonStr = options.pretty ? JSON.stringify(docs, null, 2) : JSON.stringify(docs)
    if (options.download) {
      triggerDownload(jsonStr, options.filename || `${collectionName}.json`, 'application/json')
    }
    return options.raw ? docs : jsonStr
  }

  // 2. Full Database Export
  const dbDump = {}
  const collectionNames = Object.keys(this.lf).filter(
    (name) => name !== '__localbase_metadata__'
  )

  for (const col of collectionNames) {
    dbDump[col] = await this.collection(col).get({ keys: options.keys || false })
  }

  reset.call(this)

  const jsonStr = options.pretty ? JSON.stringify(dbDump, null, 2) : JSON.stringify(dbDump)
  if (options.download) {
    triggerDownload(jsonStr, options.filename || `${this.dbName}_backup.json`, 'application/json')
  }

  return options.raw ? dbDump : jsonStr
}
