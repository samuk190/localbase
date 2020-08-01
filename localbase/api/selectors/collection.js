import * as localForage from "localforage";

export default function collection(collectionName) {
  if (!collectionName) this.collectionName = 'undefined'
  else {
    this.collectionName = collectionName

    let dbName = this.dbName

    // if we've not created a localForage instance 
    // for this collection, create one
    if (!(collectionName in this.lf)) {
      this.lf[collectionName] = localForage.createInstance({
        driver      : localForage.INDEXEDDB,
        name        : dbName,
        storeName   : collectionName
      })
    }

    return this
  }

}