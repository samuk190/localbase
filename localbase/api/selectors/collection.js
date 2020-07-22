import * as localForage from "localforage";

export default function collection(collectionName) {
  if (!collectionName) this.collectionName = 'undefined'
  else {
    this.collectionName = collectionName

    // if we've not created a localForage instance 
    // for this collection, create one
    if (!(this.collectionName in this.lf)) {
      this.lf[this.collectionName] = localForage.createInstance({
        driver      : localForage.INDEXEDDB,
        name        : this.dbName,
        storeName   : this.collectionName
      })
    }

    return this
  }

}