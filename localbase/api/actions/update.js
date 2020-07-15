import * as localForage from "localforage";
import isSubset from '../../utils/isSubset'
import updateObject from '../../utils/updateObject'

export default function update(docUpdates) {
  this.docUpdates = docUpdates
  localForage.iterate((value, key) => {
    if (isSubset(value, this.docSelectionCriteria)) {
      console.log('apply docUpdates to this one: ', this.docUpdates)
      let newDocument = updateObject(value, this.docUpdates)
      localForage.setItem(key, newDocument)
    }
  })
}