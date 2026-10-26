import selectionLevel from '../../api-utils/selectionLevel'
import showUserErrors from '../../api-utils/showUserErrors'
import reset from '../../api-utils/reset'

export default function onSnapshot(callback) {
  if (typeof callback !== 'function') {
    this.userErrors.push('Callback passed to .onSnapshot() must be a function.')
    showUserErrors.call(this)
    return () => {}
  }

  const currentSelectionLevel = selectionLevel.call(this)
  const collectionName = this.collectionName
  const docSelectionCriteria = this.docSelectionCriteria
  const queryFilters = [...(this.queryFilters || [])]
  const orderByClauses = [...(this.orderByClauses || [])]
  const limitBy = this.limitBy

  if (!collectionName) {
    this.userErrors.push('No collection specified before calling .onSnapshot()')
    showUserErrors.call(this)
    return () => {}
  }

  let isSubscribed = true

  // Helper to re-fetch snapshot
  const fetchAndNotify = async (changeEvent = null) => {
    if (!isSubscribed) return

    try {
      if (currentSelectionLevel === 'doc') {
        const query = this.collection(collectionName).doc(docSelectionCriteria)
        const doc = await query.get()
        if (isSubscribed) {
          callback(doc, changeEvent)
        }
      } else {
        // Collection level query
        const query = this.collection(collectionName)
        for (const f of queryFilters) {
          query.where(f.field, f.operator, f.value)
        }
        for (const o of orderByClauses) {
          query.orderBy(o.property, o.direction)
        }
        if (limitBy) {
          query.limit(limitBy)
        }
        const collection = await query.get()
        if (isSubscribed) {
          callback(collection, changeEvent)
        }
      }
    } catch (err) {
      console.error(`Error in onSnapshot listener for "${collectionName}":`, err)
    }
  }

  // 1. Initial snapshot fetch
  fetchAndNotify({ action: 'initial' })

  // 2. Subscribe to mutation events
  const eventName = `collection:${collectionName}:change`
  const unsubscribeEvent = this.events.on(eventName, (change) => {
    fetchAndNotify(change)
  })

  // Clean current builder state
  reset.call(this)

  // 3. Return unsubscribe function
  return () => {
    isSubscribed = false
    unsubscribeEvent()
  }
}
