import * as localForage from "localforage"
import isSubset from '../utils/isSubset'

export default function deleteIt() {
  console.log('delete')
  if (this.editType == 'db') {
    indexedDB.deleteDatabase(this.dbName)
  }
  else if (this.editType == 'collection') {
    localForage.dropInstance().then(function() {
      console.log('Dropped the store of the current instance');
    });
  }
  else if (this.editType == 'doc') {
    console.log('delete document with criteria: ', this.docSelectionCriteria)
    localForage.iterate((value, key) => {
      console.log(key, value)
      if (isSubset(value, this.docSelectionCriteria)) {
        localForage.removeItem(key)
      }
    })
  }
}