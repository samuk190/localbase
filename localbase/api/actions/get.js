import isSubset from '../../utils/isSubset'
import logger from '../../utils/logger'
import reset from '../../api-utils/reset'
import selectionLevel from '../../api-utils/selectionLevel'
import showUserErrors from '../../api-utils/showUserErrors'
import { matchesAllFilters } from '../../utils/matcher'

function compareValues(a, b) {
  if (a === b) return 0
  if (a === undefined || a === null) return 1
  if (b === undefined || b === null) return -1
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b
  }
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() - b.getTime()
  }
  return a.toString().localeCompare(b.toString())
}

export default function get(options = { keys: false }) {
  if (options && typeof options === 'object' && !Array.isArray(options)) {
    if (!options.hasOwnProperty('keys')) {
      options.keys = false
    }
  }

  // get collection
  this.getCollection = () => {
    let collectionName = this.collectionName
    let orderByClauses = this.orderByClauses || []
    let queryFilters = this.queryFilters || []
    let colSelectionCriteria = options.filter
    let limitBy = this.limitBy

    // Fallback to legacy single orderByProperty if orderByClauses empty
    if (!orderByClauses.length && this.orderByProperty) {
      orderByClauses.push({
        property: this.orderByProperty,
        direction: this.orderByDirection || 'asc'
      })
    }

    let collection = []
    return this.lf[collectionName]
      .iterate((value, key) => {
        let collectionItem = options.keys ? { key, data: value } : value

        // 1. Check legacy filter
        if (colSelectionCriteria && !isSubset(value, colSelectionCriteria)) {
          return
        }

        // 2. Check modern query filters (.where())
        if (queryFilters.length && !matchesAllFilters(value, queryFilters)) {
          return
        }

        collection.push(collectionItem)
      })
      .then(() => {
        let logMessage = `Got "${collectionName}" collection`

        // Sort collection using multi-clause comparator
        if (orderByClauses.length) {
          logMessage += `, ordered by ${orderByClauses.map(c => `"${c.property}" (${c.direction})`).join(', ')}`
          collection.sort((itemA, itemB) => {
            const a = options.keys ? itemA.data : itemA
            const b = options.keys ? itemB.data : itemB

            for (const clause of orderByClauses) {
              const valA = a[clause.property]
              const valB = b[clause.property]
              const diff = compareValues(valA, valB)
              if (diff !== 0) {
                return clause.direction === 'desc' ? -diff : diff
              }
            }
            return 0
          })
        }

        // limit
        if (limitBy) {
          logMessage += `, limited to ${limitBy}`
          collection = collection.slice(0, limitBy)
        }

        logMessage += `:`
        logger.log.call(this, logMessage, collection)
        reset.call(this)
        return collection
      })
  }

  // get document
  this.getDocument = () => {
    let collectionName = this.collectionName
    let docSelectionCriteria = this.docSelectionCriteria

    let collection = []
    let document = null

    // get document by criteria
    this.getDocumentByCriteria = () => {
      return this.lf[collectionName]
        .iterate((value, key) => {
          if (isSubset(value, docSelectionCriteria)) {
            collection.push(options.keys ? { key, data: value } : value)
          }
        })
        .then(() => {
          if (!collection.length) {
            logger.error.call(
              this,
              `Could not find Document in "${collectionName}" collection with criteria: ${JSON.stringify(docSelectionCriteria)}`
            )
            reset.call(this)
            if (this.config && this.config.rejectOnNotFound) {
              return Promise.reject(new Error(`Document not found in "${collectionName}"`))
            }
            return null
          } else {
            document = collection[0]
            logger.log.call(this, `Got Document with ${JSON.stringify(docSelectionCriteria)}:`, document)
            reset.call(this)
            return document
          }
        })
    }

    // get document by key
    this.getDocumentByKey = () => {
      return this.lf[collectionName]
        .getItem(docSelectionCriteria)
        .then(value => {
          if (value !== null && value !== undefined) {
            document = options.keys ? { key: docSelectionCriteria, data: value } : value
            logger.log.call(this, `Got Document with key ${JSON.stringify(docSelectionCriteria)}:`, document)
            reset.call(this)
            return document
          } else {
            logger.error.call(
              this,
              `Could not find Document in "${collectionName}" collection with Key: ${JSON.stringify(docSelectionCriteria)}`
            )
            reset.call(this)
            if (this.config && this.config.rejectOnNotFound) {
              return Promise.reject(new Error(`Document not found with key "${docSelectionCriteria}"`))
            }
            return null
          }
        })
        .catch(err => {
          logger.error.call(
            this,
            `Could not find Document in "${collectionName}" collection with Key: ${JSON.stringify(docSelectionCriteria)}`
          )
          reset.call(this)
          if (this.config && this.config.rejectOnNotFound) {
            throw err
          }
          return null
        })
    }

    if (typeof docSelectionCriteria === 'object') {
      return this.getDocumentByCriteria()
    } else {
      return this.getDocumentByKey()
    }
  }

  // check for user errors
  if (!(typeof options === 'object' && !Array.isArray(options))) {
    this.userErrors.push(
      'Data passed to .get() must be an object. Not an array, string, number or boolean. The object must contain a "keys" property set to true or false, e.g. { keys: true }'
    )
  } else {
    if (typeof options.keys !== 'boolean') {
      this.userErrors.push('Property "keys" passed into get() method must be assigned a boolean value (true or false).')
    }
  }

  if (!this.userErrors.length) {
    let currentSelectionLevel = selectionLevel.call(this)

    if (currentSelectionLevel === 'collection') {
      return this.getCollection()
    } else if (currentSelectionLevel === 'doc') {
      return this.getDocument()
    }
  } else {
    showUserErrors.call(this)
    return null
  }
}
