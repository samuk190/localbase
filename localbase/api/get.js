import * as localForage from "localforage";
import isSubset from '../utils/isSubset'

export default function get() {
  // get collection
  if (this.editType == 'collection') {
    let collection = []
    return localForage.iterate((value, key) => {
      collection.push(value)
    }).then(() => {
      // orderBy
      if (this.orderByProperty) {
          collection.sort((a, b) => {
          return a[this.orderByProperty].toString().localeCompare(b[this.orderByProperty].toString())
        })
      }
      if (this.orderByDirection == 'desc') {
        collection.reverse()
      }
      // limit
      if (this.limitBy) {
        collection = collection.splice(0,this.limitBy)
      }
      return collection
    })
  }
  // get document
  else if (this.editType == 'doc') {
    let collection = []
    let document = {}
    return localForage.iterate((value, key) => {
      console.log(key, value)
      if (isSubset(value, this.docSelectionCriteria)) {
        collection.push(value)
      }
    }).then(() => {
      document = collection[0]
      return document
    })
  }
}