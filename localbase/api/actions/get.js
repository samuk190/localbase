import * as localForage from "localforage";
import isSubset from '../../utils/isSubset'
import logger from "../../utils/logger";

export default function get() {
  // get collection
  if (this.selectionLevel() == 'collection') {
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
  else if (this.selectionLevel() == 'doc') {
    let collection = []
    let document = {}
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
}