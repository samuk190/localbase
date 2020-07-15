import * as localForage from "localforage"
import isSubset from '../../utils/isSubset'

export default function deleteIt() {
  if (this.selectionLevel() == 'db') {
    indexedDB.deleteDatabase(this.dbName)
    this.reset()
  }
  else if (this.selectionLevel() == 'collection') {
    localForage.dropInstance().then(() => {
      console.log('Dropped the store of the current instance');
      this.reset()
    });
  }
  else if (this.selectionLevel() == 'doc') {
    console.log('delete document with criteria: ', this.docSelectionCriteria)
    localForage.iterate((value, key) => {
      console.log(key, value)
      if (isSubset(value, this.docSelectionCriteria)) {
        localForage.removeItem(key)
      }
    }).then(() => {
      this.reset()
    })
  }
}