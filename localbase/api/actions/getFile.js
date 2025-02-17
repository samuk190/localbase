import isSubset from '../../utils/isSubset'
import logger from "../../utils/logger"
import reset from '../../api-utils/reset'
import selectionLevel from '../../api-utils/selectionLevel'
import showUserErrors from '../../api-utils/showUserErrors'

export default function getFile(options = { keys: false }) {

  this.getCollection = () => {
    let collectionName = this.collectionName
    let orderByProperty = this.orderByProperty
    let orderByDirection = this.orderByDirection
    let colSelectionCriteria = options.filter
    let limitBy = this.limitBy

    let collection = []
    return this.lf[collectionName].iterate((value, key) => {
      let collectionItem = options.keys ? { key, data: value } : value
      if (colSelectionCriteria) {
        if (isSubset(value, colSelectionCriteria)) {
          collection.push(collectionItem)
        }
      } else {
        collection.push(collectionItem)
      }
    }).then(() => {
      let logMessage = `Got "${collectionName}" collection`
      // Order by
      if (orderByProperty) {
        logMessage += `, ordered by "${orderByProperty}"`
        collection.sort((a, b) => {
          let aValue = options.keys ? a.data[orderByProperty] : a[orderByProperty]
          let bValue = options.keys ? b.data[orderByProperty] : b[orderByProperty]
          if (!aValue || !bValue) return 0
          return aValue.toString().localeCompare(bValue.toString())
        })
      }
      if (orderByDirection === 'desc') {
        logMessage += ` (descending)`
        collection.reverse()
      }
      // Limit
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


  this.getDocument = () => {
    let collectionName = this.collectionName
    let docSelectionCriteria = this.docSelectionCriteria

    let collection = []
    let document = {}


    this.getDocumentByCriteria = () => {
      return this.lf[collectionName].iterate((value) => {
        if (isSubset(value, docSelectionCriteria)) {
          collection.push(value)
        }
      }).then(() => {
        if (!collection.length) {
          logger.error.call(this, `Could not find Document in "${collectionName}" collection with criteria: ${JSON.stringify(docSelectionCriteria)}`)
        } else {
          document = collection[0]
          logger.log.call(this, `Got Document with ${JSON.stringify(docSelectionCriteria)}:`, document)
          reset.call(this)
          return this.processFile(document)
        }
      })
    }

    this.getDocumentByKey = () => {
      return this.lf[collectionName].getItem(docSelectionCriteria).then((value) => {
        document = value
        if (document) {
          logger.log.call(this, `Got Document with key ${JSON.stringify(docSelectionCriteria)}:`, document)
        } else {
          logger.error.call(this, `Could not find Document in "${collectionName}" collection with Key: ${JSON.stringify(docSelectionCriteria)}`)
        }
        reset.call(this)
        return this.processFile(document)
      }).catch(() => {
        logger.error.call(this, `Could not find Document in "${collectionName}" collection with Key: ${JSON.stringify(docSelectionCriteria)}`)
        reset.call(this)
      })
    }

    if (typeof docSelectionCriteria === 'object') {
      return this.getDocumentByCriteria()
    } else {
      return this.getDocumentByKey()
    }
  }

  this.processFile = (document) => {
    if (document.base64 && document.name && document.extension) {
      const byteCharacters = atob(document.base64.split(',')[1]) // Decode Base64
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const file = new Blob([byteArray], { type: document.type })

      return {
        file,
        name: document.name,
        extension: document.extension,
        size: document.size,
      }
    }
    return document
  }

  if (!(typeof options === 'object' && !Array.isArray(options))) {
    this.userErrors.push('Data passed to .get() must be an object. Not an array, string, number, or boolean. The object must contain a "keys" property set to true or false, e.g. { keys: true }')
  } else {
    if (!options.hasOwnProperty('keys')) {
      this.userErrors.push('Object passed to get() method must contain a "keys" property set to boolean true or false, e.g. { keys: true }')
    } else if (typeof options.keys !== 'boolean') {
      this.userErrors.push('Property "keys" passed into get() method must be assigned a boolean value (true or false). Not a string or integer.')
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
