import isSubset from '../../utils/isSubset'
import logger from "../../utils/logger"
import selectionLevel from '../../api-utils/selectionLevel'
import success from '../../api-utils/success'
import error from '../../api-utils/error'
import showUserErrors from '../../api-utils/showUserErrors'

export default function deleteIt() {

  return new Promise((resolve, reject) => {

    // delete database
    this.deleteDatabase = () => {
      let dbName = this.dbName

      indexedDB.deleteDatabase(dbName)
      resolve(
        success.call(
          this,
          `Database "${ dbName }" deleted.`,
          { database: dbName }
        )
      )
    }

    // delete collection
    this.deleteCollection = () => {
      let dbName = this.dbName
      let collectionName = this.collectionName

      // we can only delete one collection at a time, which is why we need a queue

      this.addToDeleteCollectionQueue = (collectionName) => {
        this.deleteCollectionQueue.queue.push(collectionName)
        this.runDeleteCollectionQueue()
      }

      this.runDeleteCollectionQueue = () => {
        if (this.deleteCollectionQueue.running == false) {
          this.deleteCollectionQueue.running = true
          this.deleteNextCollectionFromQueue()
        }
      }

      this.deleteNextCollectionFromQueue = () => {
        if (this.deleteCollectionQueue.queue.length) {
          let collectionToDelete = this.deleteCollectionQueue.queue[0]
          this.deleteCollectionQueue.queue.shift()

          this.lf[collectionToDelete].dropInstance({
            name        : dbName,
            storeName   : collectionToDelete
          }).then(() => {
            this.deleteNextCollectionFromQueue()
            resolve(
              success.call(
                this,
                `Collection "${ collectionToDelete }" deleted.`,
                { collection: collectionToDelete }
              )
            )
          }).catch(error => {
            reject(
              error.call(
                this,
                `Collection "${ collectionToDelete }" could not be deleted.`
              )
            )
          })
        }
        else {
          this.deleteCollectionQueue.running = false
        }
      }

      this.addToDeleteCollectionQueue(collectionName)
    }

    // delete document
    this.deleteDocument = () => {

      let collectionName = this.collectionName
      let docSelectionCriteria = this.docSelectionCriteria

      // delete document by criteria
      this.deleteDocumentByCriteria = () => {
        let keysForDeletion = []
        this.lf[collectionName].iterate((value, key) => {
          if (isSubset(value, docSelectionCriteria)) {
            keysForDeletion.push(key)
          }
        }).then(() => {
          if (!keysForDeletion.length) {
            reject(
              error.call(
                this,
                `No Documents found in "${ collectionName }" Collection with criteria ${ JSON.stringify(docSelectionCriteria) }. No documents deleted.`
              )
            )
          }
          if (keysForDeletion.length > 1) {
            logger.warn.call(this, `Multiple documents (${ keysForDeletion.length }) with ${ JSON.stringify(docSelectionCriteria) } found.`)
          }
        }).then(() => {
          keysForDeletion.forEach((key, index) => {
            this.lf[collectionName].removeItem(key).then(() => {
              if (index === (keysForDeletion.length - 1)) {
                resolve(
                  success.call(
                    this,
                    `${ keysForDeletion.length } Document${ keysForDeletion.length > 1 ? 's' : '' } with ${ JSON.stringify(docSelectionCriteria) } deleted.`,
                    { keys: keysForDeletion }
                  )
                )
              }
            }).catch(err => {
              reject(
                error.call(
                  this,
                  `Could not delete ${ keysForDeletion.length } Documents in ${ collectionName } Collection.`
                )
              )
            })
          })
        })
      }

      // delete document by key
      this.deleteDocumentByKey = () => {
        this.lf[collectionName].getItem(docSelectionCriteria).then(value => {
          if (value) {
            this.lf[collectionName].removeItem(docSelectionCriteria).then(() => {
              resolve(
                success.call(
                  this,
                  `Document with key ${ JSON.stringify(docSelectionCriteria) } deleted.`,
                  { key: docSelectionCriteria }
                )
              )
            }).catch(function(err) {
              reject(
                error.call(
                  this,
                  `No Document found in "${ collectionName }" Collection with key ${ JSON.stringify(docSelectionCriteria) }. No document was deleted.`
                )
              )
            });
          }
          else {
            reject(
              error.call(
                this,
                `No Document found in "${ collectionName }" Collection with key ${ JSON.stringify(docSelectionCriteria) }. No document was deleted.`
              )
            )
          }
        });

      }

      if (typeof docSelectionCriteria == 'object') {
        return this.deleteDocumentByCriteria()
      }
      else {
        return this.deleteDocumentByKey()
      }
    }
    
    if (!this.userErrors.length) {
      let currentSelectionLevel = selectionLevel.call(this)
  
      if (currentSelectionLevel == 'db') {
        return this.deleteDatabase()
      }
      else if (currentSelectionLevel == 'collection') {
        return this.deleteCollection()
      }
      else if (currentSelectionLevel == 'doc') {
        return this.deleteDocument()
      }
    }
    else {
      showUserErrors.call(this)
    }

  })

}