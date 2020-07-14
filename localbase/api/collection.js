import * as localForage from "localforage";

export default function collection(collectionName) {
  this.collectionName = collectionName
  localForage.config({ storeName: collectionName })
  this.editType = 'collection'
  return this
}