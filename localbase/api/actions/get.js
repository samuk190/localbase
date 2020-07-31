import isSubset from '../../utils/isSubset'
import logger from "../../utils/logger"
import reset from '../../api-utils/reset'
import selectionLevel from '../../api-utils/selectionLevel'

export default function get(options = { keys: false }) {

  // get collection
  this.getCollection = () => {
    let collection = []
    return this.lf[this.collectionName].iterate((value, key) => {
      let collectionItem = {}
      if (!options.keys) {
        collectionItem = value
      }
      else {
        collectionItem = {
          key: key,
          data: value
        }
      }
      collection.push(collectionItem)
    }).then(() => {
      let logMessage = `Got "${ this.collectionName }" collection`
      // orderBy
      if (this.orderByProperty) {
        logMessage += `, ordered by "${ this.orderByProperty }"`
        if (!options.keys) {
          collection.sort((a, b) => {
            return a[this.orderByProperty].toString().localeCompare(b[this.orderByProperty].toString())
          })
        }
        else {
          collection.sort((a, b) => {
            return a.data[this.orderByProperty].toString().localeCompare(b.data[this.orderByProperty].toString())
          })
        }
      }
      if (this.orderByDirection == 'desc') {
        logMessage += ` (descending)`
        collection.reverse()
      }
      // limit
      if (this.limitBy) {
        logMessage += `, limited to ${ this.limitBy }`
        collection = collection.splice(0,this.limitBy)
      }
      logMessage += `:`
      logger.log.call(this, logMessage, collection)
      reset.call(this)
      return collection
    })
  }

  // get document
  this.getDocument = () => {
    let collection = []
    let document = {}

    // get document by criteria
    this.getDocumentByCriteria = () => {
      return this.lf[this.collectionName].iterate((value, key) => {
        if (isSubset(value, this.docSelectionCriteria)) {
          collection.push(value)
        }
      }).then(() => {
        document = collection[0]
        logger.log.call(this, `Got Document with ${ JSON.stringify(this.docSelectionCriteria) }:`, document)
        reset.call(this)
        return document
      })
    }

    // get document by key
    this.getDocumentByKey = () => {
      return this.lf[this.collectionName].getItem(this.docSelectionCriteria).then((value) => {
        document = value
        if (document) {
          logger.log.call(this, `Got Document with key ${ JSON.stringify(this.docSelectionCriteria) }:`, document)
        }
        else {
          logger.error.call(this, `Could not get Document with Key: ${ JSON.stringify(this.docSelectionCriteria)}`)
        }
        reset.call(this)
        return document
      }).catch(err => {
        logger.error.call(this, `Could not get Document with Key: ${ JSON.stringify(this.docSelectionCriteria)}`)
        reset.call(this)
      });
    }

    if (typeof this.docSelectionCriteria == 'object') {
      return this.getDocumentByCriteria()
    }
    else {
      return this.getDocumentByKey()
    }
  }

  let currentSelectionLevel = selectionLevel.call(this)

  if (currentSelectionLevel == 'collection') {
    return this.getCollection()
  }
  else if (currentSelectionLevel == 'doc') {
    return this.getDocument()
  }
}