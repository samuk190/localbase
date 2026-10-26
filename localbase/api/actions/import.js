import reset from '../../api-utils/reset'
import { csvToJson } from '../../utils/csv'
import { generateKey } from '../../utils/uuid'

export default async function importData(payload, options = { overwrite: false }) {
  const collectionName = this.collectionName

  let parsedData = payload
  if (typeof payload === 'string') {
    const trimmed = payload.trim()
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      parsedData = JSON.parse(trimmed)
    } else {
      // CSV format
      parsedData = csvToJson(trimmed)
    }
  }

  // 1. Single Collection Import
  if (collectionName) {
    if (!Array.isArray(parsedData)) {
      throw new Error(`Data imported into collection "${collectionName}" must be an array of documents.`)
    }

    if (options.overwrite) {
      await this.collection(collectionName).delete()
    }

    let importedCount = 0
    for (const item of parsedData) {
      const key = item._key || item.key || (item.id !== undefined ? String(item.id) : generateKey())
      const docData = { ...item }
      delete docData._key
      delete docData.key
      await this.collection(collectionName).doc(key).set(docData)
      importedCount++
    }

    reset.call(this)
    return { collection: collectionName, imported: importedCount }
  }

  // 2. Full Database Import
  if (typeof parsedData !== 'object' || Array.isArray(parsedData) || parsedData === null) {
    throw new Error('Full database import requires an object with collection names as keys.')
  }

  const results = {}
  for (const col of Object.keys(parsedData)) {
    const colData = parsedData[col]
    if (Array.isArray(colData)) {
      if (options.overwrite) {
        await this.collection(col).delete()
      }
      for (const item of colData) {
        const key = item._key || item.key || (item.id !== undefined ? String(item.id) : generateKey())
        const docData = { ...item }
        delete docData._key
        delete docData.key
        await this.collection(col).doc(key).set(docData)
      }
      results[col] = colData.length
    }
  }

  reset.call(this)
  return results
}
