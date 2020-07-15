import * as localForage from "localforage";

export default function collection(collectionName) {
  this.collectionName = collectionName
  localForage.config({ storeName: collectionName })
  return this
}