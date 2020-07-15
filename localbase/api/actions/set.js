import * as localForage from "localforage";
import isSubset from '../../utils/isSubset'

export default function set(newDocument) {
  localForage.iterate((value, key) => {
    console.log(key, value)
    if (isSubset(value, this.docSelectionCriteria)) {
      localForage.setItem(key, newDocument)
    }
  })
}