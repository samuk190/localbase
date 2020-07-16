import * as localForage from "localforage";
import isSubset from '../../utils/isSubset'
import logger from "../../utils/logger";

export default function get() {
  // get collection
  this.getCollection = () => {
    let collection = []
    return localForage.iterate((value, key) => {
      collection.push(value)
    }).then(() => {
      let logMessage = `Got "${ this.collectionName }" collection`
      // orderBy
      if (this.orderByProperty) {
          logMessage += `, ordered by "${ this.orderByProperty }"`
          collection.sort((a, b) => {
          return a[this.orderByProperty].toString().localeCompare(b[this.orderByProperty].toString())
        })
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
      logger.log(logMessage, collection)
      this.reset()
      return collection
    })
  }

  // get document
  this.getDocument = () => {
    let collection = []
    let document = {}

    // get document by criteria
    this.getDocumentByCriteria = () => {
      return localForage.iterate((value, key) => {
        if (isSubset(value, this.docSelectionCriteria)) {
          collection.push(value)
        }
      }).then(() => {
        document = collection[0]
        logger.log(`Got Document with ${ JSON.stringify(this.docSelectionCriteria) }:`, document)
        this.reset()
        return document
      })
    }

    // get document by key
    this.getDocumentByKey = () => {
      return localForage.getItem(this.docSelectionCriteria).then((value) => {
        document = value
        if (document) {
          logger.log(`Got Document with key ${ JSON.stringify(this.docSelectionCriteria) }:`, document)
        }
        else {
          logger.error(`Could not get Document with Key: ${ JSON.stringify(this.docSelectionCriteria)}`)
        }
        this.reset()
        return document
      }).catch(err => {
        logger.error(`Could not get Document with Key: ${ JSON.stringify(this.docSelectionCriteria)}`)
        this.reset()
      });
    }

    if (typeof this.docSelectionCriteria == 'object') {
      return this.getDocumentByCriteria()
    }
    else {
      return this.getDocumentByKey()
    }
  }

  if (this.selectionLevel() == 'collection') {
    return this.getCollection()
  }
  else if (this.selectionLevel() == 'doc') {
    return this.getDocument()
  }
}