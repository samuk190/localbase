import isSubset from '../../utils/isSubset'
import updateObject from '../../utils/updateObject'
import success from '../../api-utils/success'
import error from '../../api-utils/error'
import showUserErrors from '../../api-utils/showUserErrors'
import reset from '../../api-utils/reset'
import { generateKey } from '../../utils/uuid'

export default function upsert(data) {
  const collectionName = this.collectionName
  const docSelectionCriteria = this.docSelectionCriteria
  const lf = this.lf

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    this.userErrors.push('Data passed to .upsert() must be an object, e.g. { name: "Bill", age: 47 }')
    showUserErrors.call(this)
    return Promise.reject(error.call(this, 'Invalid arguments passed to .upsert()'))
  }

  if (!collectionName || !docSelectionCriteria) {
    this.userErrors.push('Both collection and doc criteria must be specified before calling .upsert()')
    showUserErrors.call(this)
    return Promise.reject(error.call(this, 'Invalid selection for .upsert()'))
  }

  const lockKey = typeof docSelectionCriteria === 'string'
    ? `${collectionName}:${docSelectionCriteria}`
    : `${collectionName}:criteria:${JSON.stringify(docSelectionCriteria)}`

  const perform = async () => {
    try {
      if (typeof docSelectionCriteria === 'string') {
        const key = docSelectionCriteria
        const existing = await lf[collectionName].getItem(key)

        let finalDoc
        let actionMessage
        if (existing !== null && existing !== undefined) {
          finalDoc = updateObject(existing, data)
          actionMessage = `Document in "${collectionName}" with key "${key}" was updated via upsert.`
        } else {
          finalDoc = data
          actionMessage = `Document in "${collectionName}" with key "${key}" was inserted via upsert.`
        }

        await lf[collectionName].setItem(key, finalDoc)
        if (this.syncChannel) {
          this.syncChannel.broadcast(`collection:${collectionName}:change`, { action: 'upsert', key, data: finalDoc })
        }
        reset.call(this)
        return success.call(this, actionMessage, { key, data: finalDoc })
      } else {
        // Criteria-based upsert
        let matchedKey = null
        let matchedDoc = null

        await lf[collectionName].iterate((value, key) => {
          if (isSubset(value, docSelectionCriteria)) {
            matchedKey = key
            matchedDoc = value
            return true // Stop iteration
          }
        })

        let finalKey
        let finalDoc
        let actionMessage

        if (matchedKey) {
          finalKey = matchedKey
          finalDoc = updateObject(matchedDoc, data)
          actionMessage = `Document in "${collectionName}" matching criteria was updated via upsert.`
        } else {
          finalKey = generateKey()
          finalDoc = { ...docSelectionCriteria, ...data }
          actionMessage = `New document created in "${collectionName}" via upsert.`
        }

        await lf[collectionName].setItem(finalKey, finalDoc)
        if (this.syncChannel) {
          this.syncChannel.broadcast(`collection:${collectionName}:change`, { action: 'upsert', key: finalKey, data: finalDoc })
        }
        reset.call(this)
        return success.call(this, actionMessage, { key: finalKey, data: finalDoc })
      }
    } catch (err) {
      reset.call(this)
      throw error.call(this, `Upsert failed in "${collectionName}": ${err.message || err}`)
    }
  }

  return this.lock ? this.lock.acquire(lockKey, perform) : perform()
}
