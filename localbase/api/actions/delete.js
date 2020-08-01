import isSubset from '../../utils/isSubset'
import logger from "../../utils/logger"
import selectionLevel from '../../api-utils/selectionLevel'
import success from '../../api-utils/success'
import error from '../../api-utils/error'

export default function deleteIt() {

  return new Promise((resolve, reject) => {

    // delete database
    this.deleteDatabase = () => {
      let dbName = this.dbName

      indexedDB.deleteDatabase(dbName)
      resolve(
        success.call(
          this,
          `Database "${ dbName }" deleted.`
        )
      )
    }

    // delete collection
    this.deleteCollection = () => {
      let dbName = this.dbName
      let collectionName = this.collectionName

      if (collectionName == 'undefined') {
        reject(
          error.call(
            this,
            'No collection name passed into .collection() method.'
          )
        )
      }
      else {
        console.log('collectionName: ', collectionName)
        this.lf[collectionName].dropInstance({
          name        : dbName,
          storeName   : collectionName
        }).then(() => {
          resolve(
            success.call(
              this,
              `Collection "${ collectionName }" deleted.`
            )
          )
        }).catch(error => {
          reject(
            error.call(
              this,
              `Collection "${ collectionName }" could not be deleted.`
            )
          )
        })
      }

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
                    `${ keysForDeletion.length } Document${ keysForDeletion.length > 1 ? 's' : '' } with ${ JSON.stringify(docSelectionCriteria) } deleted.`
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
                  `Document with key ${ JSON.stringify(docSelectionCriteria) } deleted.`
                )
              )
            }).catch(function(err) {
              reject(
                error.call(
                  this,
                  `Document with key ${ JSON.stringify(docSelectionCriteria) } could not be deleted.`
                )
              )
            });
          }
          else {
            reject(
              error.call(
                this,
                `Document with key ${ JSON.stringify(docSelectionCriteria) } could not be deleted.`
              )
            )
          }
        });

      }

      if (docSelectionCriteria === 'undefined') {
        reject(
          error.call(
            this,
            `No criteria or key passed into doc() method.`
          )
        )
      }
      else if (typeof docSelectionCriteria == 'object') {
        return this.deleteDocumentByCriteria()
      }
      else {
        return this.deleteDocumentByKey()
      }
    }
    
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

  })

}