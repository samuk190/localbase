import localForage from 'localforage'

export async function getVersion() {
  const metaStore = this.lf['__localbase_metadata__'] || localForage.createInstance({
    driver: localForage.INDEXEDDB,
    name: this.dbName,
    storeName: '__localbase_metadata__'
  })
  const currentVersion = (await metaStore.getItem('__db_version__')) || 1
  return currentVersion
}

export async function version(targetVersion, migrationFn) {
  if (typeof targetVersion !== 'number' || targetVersion < 1) {
    throw new Error('Target version passed to db.version() must be a positive integer.')
  }

  const metaStore = this.lf['__localbase_metadata__'] || localForage.createInstance({
    driver: localForage.INDEXEDDB,
    name: this.dbName,
    storeName: '__localbase_metadata__'
  })
  this.lf['__localbase_metadata__'] = metaStore

  const currentVersion = (await metaStore.getItem('__db_version__')) || 1

  if (currentVersion < targetVersion) {
    if (typeof migrationFn === 'function') {
      await migrationFn(this)
    }
    await metaStore.setItem('__db_version__', targetVersion)
  }

  return targetVersion
}

export default {
  getVersion,
  version
}
