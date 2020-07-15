import * as localForage from "localforage"
import isSubset from '../../utils/isSubset'
import logger from "../../utils/logger";

export default function deleteIt() {
  if (this.selectionLevel() == 'db') {
    indexedDB.deleteDatabase(this.dbName)
    logger.log(`Database "${ this.dbName }" deleted.`)
    this.reset()
  }
  else if (this.selectionLevel() == 'collection') {
    localForage.dropInstance().then(() => {
      logger.log(`Collection "${ this.collectionName }" deleted.`)
      this.reset()
    });
  }
  else if (this.selectionLevel() == 'doc') {
    let keysForDeletion = []
    localForage.iterate((value, key) => {
      if (isSubset(value, this.docSelectionCriteria)) {
        keysForDeletion.push(key)
      }
    }).then(() => {
      console.log('keysForDeletion: ', keysForDeletion)
      if (keysForDeletion.length > 1) {
        logger.warn(`Multiple documents (${ keysForDeletion.length }) with ${ JSON.stringify(this.docSelectionCriteria) } found.`)
      }
      keysForDeletion.forEach(key => {
        localForage.removeItem(key)
      })
      logger.log(`${ keysForDeletion.length } Document${ keysForDeletion.length > 1 ? 's' : '' } with ${ JSON.stringify(this.docSelectionCriteria) } deleted.`)
      this.reset()
    })
  }
}