import * as localForage from "localforage"
import isSubset from '../../utils/isSubset'
import logger from "../../utils/logger";

export default function deleteIt() {

  return new Promise((resolve, reject) => {

    // delete database
    this.deleteDatabase = () => {
      indexedDB.deleteDatabase(this.dbName)
      resolve(
        this.success(
          `Database "${ this.dbName }" deleted.`
        )
      )
    }

    // delete collection
    this.deleteCollection = () => {

      if (this.collectionName == 'undefined') {
        reject(
          this.error(
            'No collection name passed into .collection() method.'
          )
        )
      }
      else {
        localForage.dropInstance().then(() => {
          resolve(
            this.success(
              `Collection "${ this.collectionName }" deleted.`
            )
          )
        }).catch(error => {
          reject(
            this.error(
              `Collection "${ this.collectionName }" could not be deleted.`
            )
          )
        })
      }

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
          if (keysForDeletion.length > 1) {
            logger.warn(`Multiple documents (${ keysForDeletion.length }) with ${ JSON.stringify(this.docSelectionCriteria) } found.`)
          }
        }).then(() => {
          keysForDeletion.forEach((key, index) => {
            localForage.removeItem(key).then(() => {
              if (index === (keysForDeletion.length - 1)) {
                resolve(
                  this.success(
                    `${ keysForDeletion.length } Document${ keysForDeletion.length > 1 ? 's' : '' } with ${ JSON.stringify(this.docSelectionCriteria) } deleted.`
                  )
                )
              }
            }).catch(err => {
              reject(
                this.error(
                  `Could not delete ${ keysForDeletion.length } Documents in ${ this.collectionName } Collection.`
                )
              )
            })
          })
        })
      }

      // delete document by key
      this.deleteDocumentByKey = () => {
        localForage.getItem(this.docSelectionCriteria).then(value => {
          if (value) {
            localForage.removeItem(this.docSelectionCriteria).then(() => {
              resolve(
                this.success(
                  `Document with key ${ JSON.stringify(this.docSelectionCriteria) } deleted.`
                )
              )
            }).catch(function(err) {
              reject(
                this.error(
                  `Document with key ${ JSON.stringify(this.docSelectionCriteria) } could not be deleted.`
                )
              )
            });
          }
          else {
            reject(
              this.error(
                `Document with key ${ JSON.stringify(this.docSelectionCriteria) } could not be deleted.`
              )
            )
          }
        });

      }

      if (this.docSelectionCriteria === 'undefined') {
        reject(
          this.error(
            `No criteria or key passed into doc() method.`
          )
        )
      }
      else if (typeof this.docSelectionCriteria == 'object') {
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

  })

}