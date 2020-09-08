import localForage from "localforage";

export default function collection(collectionName) {
  if (!collectionName) {
    this.userErrors.push('No collection name specified in collection() method.')
    return this
  }
  else if (typeof collectionName !== 'string') {
    this.userErrors.push('Collection name in collection() method must be a string and not an object, number or boolean.')
    return this
  }
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