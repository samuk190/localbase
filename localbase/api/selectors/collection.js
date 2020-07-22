import * as localForage from "localforage";

export default function collection(collectionName) {
  if (!collectionName) this.collectionName = 'undefined'
  else this.collectionName = collectionName
  localForage.config({ storeName: collectionName })
  return this
}