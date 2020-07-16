import * as localForage from "localforage"
import isSubset from '../../utils/isSubset'
import logger from "../../utils/logger";

export default function deleteIt() {

  // delete database
  this.deleteDatabase = () => {
    indexedDB.deleteDatabase(this.dbName)
    logger.log(`Database "${ this.dbName }" deleted.`)
    this.reset()
  }

  // delete collection
  this.deleteCollection = () => {
    localForage.dropInstance().then(() => {
      logger.log(`Collection "${ this.collectionName }" deleted.`)
      this.reset()
    });
  }

  // delete document
  this.deleteDocument = () => {

    // delete document by criteria
    this.deleteDocumentByCriteria = () => {
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

    // delete document by key
    this.deleteDocumentByKey = () => {
      localForage.getItem(this.docSelectionCriteria).then(value => {
        if (value) {
          localForage.removeItem(this.docSelectionCriteria).then(() => {
            logger.log(`Document with key ${ JSON.stringify(this.docSelectionCriteria) } deleted.`)
            this.reset()
          }).catch(function(err) {
            logger.error(`Document with key ${ JSON.stringify(this.docSelectionCriteria) } could not be deleted.`)
            this.reset()
          });
        }
        else {
          logger.error(`Document with key ${ JSON.stringify(this.docSelectionCriteria) } could not be deleted.`)
          this.reset()          
        }
      });

    }

    if (typeof this.docSelectionCriteria == 'object') {
      return this.deleteDocumentByCriteria()
    }
    else {
      return this.deleteDocumentByKey()
    }
  }
  
  if (this.selectionLevel() == 'db') {
    return this.deleteDatabase()
  }
  else if (this.selectionLevel() == 'collection') {
    return this.deleteCollection()
  }
  else if (this.selectionLevel() == 'doc') {
    return this.deleteDocument()
  }

}