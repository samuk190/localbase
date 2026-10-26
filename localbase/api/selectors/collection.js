import localForage from 'localforage'

export default function collection(collectionName, options = {}) {
  if (!collectionName) {
    this.userErrors.push('No collection name specified in collection() method.')
    return this
  } else if (typeof collectionName !== 'string') {
    this.userErrors.push('Collection name in collection() method must be a string and not an object, number or boolean.')
    return this
  } else {
    this.collectionName = collectionName
    this.docSelectionCriteria = null

    if (!this.collectionOptions) {
      this.collectionOptions = {}
    }
    if (options && typeof options === 'object') {
      this.collectionOptions[collectionName] = options
    }

    let dbName = this.dbName

    // if we've not created a localForage instance
    // for this collection, create one
    if (!(collectionName in this.lf)) {
      this.lf[collectionName] = localForage.createInstance({
        driver: localForage.INDEXEDDB,
        name: dbName,
        storeName: collectionName
      })
    }

    // Ensure metadata store exists
    if (!('__localbase_metadata__' in this.lf)) {
      this.lf['__localbase_metadata__'] = localForage.createInstance({
        driver: localForage.INDEXEDDB,
        name: dbName,
        storeName: '__localbase_metadata__'
      })
    }

    return this
  }
}
