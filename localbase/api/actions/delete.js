import isSubset from '../../utils/isSubset'
import logger from "../../utils/logger"
import selectionLevel from '../../api-utils/selectionLevel'
import success from '../../api-utils/success'
import error from '../../api-utils/error'

export default function deleteIt() {

  return new Promise((resolve, reject) => {

    // delete database
    this.deleteDatabase = () => {
      indexedDB.deleteDatabase(this.dbName)
      resolve(
        success.call(
          this,
          `Database "${ this.dbName }" deleted.`
        )
      )
    }

    // delete collection
    this.deleteCollection = () => {

      if (this.collectionName == 'undefined') {
        reject(
          error.call(
            this,
            'No collection name passed into .collection() method.'
          )
        )
      }
      else {
        this.lf[this.collectionName].dropInstance().then(() => {
          resolve(
            success.call(
              this,
              `Collection "${ this.collectionName }" deleted.`
            )
          )
        }).catch(error => {
          reject(
            error.call(
              this,
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
        this.lf[this.collectionName].iterate((value, key) => {
          if (isSubset(value, this.docSelectionCriteria)) {
            keysForDeletion.push(key)
          }
        }).then(() => {
          if (keysForDeletion.length > 1) {
            logger.warn.call(this, `Multiple documents (${ keysForDeletion.length }) with ${ JSON.stringify(this.docSelectionCriteria) } found.`)
          }
        }).then(() => {
          keysForDeletion.forEach((key, index) => {
            this.lf[this.collectionName].removeItem(key).then(() => {
              if (index === (keysForDeletion.length - 1)) {
                resolve(
                  success.call(
                    this,
                    `${ keysForDeletion.length } Document${ keysForDeletion.length > 1 ? 's' : '' } with ${ JSON.stringify(this.docSelectionCriteria) } deleted.`
                  )
                )
              }
            }).catch(err => {
              reject(
                error.call(
                  this,
                  `Could not delete ${ keysForDeletion.length } Documents in ${ this.collectionName } Collection.`
                )
              )
            })
          })
        })
      }

      // delete document by key
      this.deleteDocumentByKey = () => {
        this.lf[this.collectionName].getItem(this.docSelectionCriteria).then(value => {
          if (value) {
            this.lf[this.collectionName].removeItem(this.docSelectionCriteria).then(() => {
              resolve(
                success.call(
                  this,
                  `Document with key ${ JSON.stringify(this.docSelectionCriteria) } deleted.`
                )
              )
            }).catch(function(err) {
              reject(
                error.call(
                  this,
                  `Document with key ${ JSON.stringify(this.docSelectionCriteria) } could not be deleted.`
                )
              )
            });
          }
          else {
            reject(
              error.call(
                this,
                `Document with key ${ JSON.stringify(this.docSelectionCriteria) } could not be deleted.`
              )
            )
          }
        });

      }

      if (this.docSelectionCriteria === 'undefined') {
        reject(
          error.call(
            this,
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