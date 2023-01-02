import logger from '../../utils/logger.js'
import isSubset from '../../utils/isSubset.js'
import updateObject from '../../utils/updateObject.js'
import success from '../../api-utils/success.js'
import error from '../../api-utils/error.js'
import showUserErrors from '../../api-utils/showUserErrors.js'

export default function update(docUpdates) {
  let collectionName = this.collectionName
  let docSelectionCriteria = this.docSelectionCriteria

  return new Promise((resolve, reject) => {

    // update document by criteria
    this.updateDocumentByCriteria = () => {
      let docsToUpdate = []
      this.lf[collectionName].iterate((value, key) => {
        if (isSubset(value, docSelectionCriteria)) {
          let newDocument = updateObject(value, docUpdates)
          docsToUpdate.push({ key, newDocument, oldDocument })
        }
      }).then(() => {
        if (!docsToUpdate.length) {
          reject(
            error.call(
              this,
              `No Documents found in ${ collectionName } Collection with criteria ${ JSON.stringify(docSelectionCriteria) }.`
            )
          )
        }
        if (docsToUpdate.length > 1) {
          logger.warn.call(this, `Multiple documents (${ docsToUpdate.length }) with ${ JSON.stringify(docSelectionCriteria) } found for updating.`)
        }
      }).then(() => {
        docsToUpdate.forEach((docToUpdate, index) => {
          this.lf[collectionName].setItem(docToUpdate.key, docToUpdate.newDocument).then(value => {
            this.change(collectionName,'UPDATE',{ ...docToUpdate }, docToUpdate.key)
            if (index === (docsToUpdate.length - 1)) {
              resolve(
                success.call(
                  this,
                  `${ docsToUpdate.length } Document${ docsToUpdate.length > 1 ? 's' : '' } in "${ collectionName }" collection with ${ JSON.stringify(docSelectionCriteria) } updated.`,
                  docUpdates
                )
              )
            }

          }).catch(err => {
            reject(
              error.call(
                this,
                `Could not update ${ docsToUpdate.length } Documents in ${ collectionName } Collection.`
              )
            )
          })
        })
      })
    }
  
    // update document by key
    this.updateDocumentByKey = () => {
      let docToUpdate = { key: docSelectionCriteria }
      this.lf[collectionName].getItem(docSelectionCriteria).then(value => {
        docToUpdate = { oldDocument: value};
        docToUpdate.newDocument = updateObject(value, docUpdates)
        this.lf[collectionName].setItem(docSelectionCriteria, docToUpdate.newDocument)
        this.change(collectionName,'UPDATE',docToUpdate, docToUpdate.key)
        resolve(
          success.call(
            this,
            `Document in "${ collectionName }" collection with key ${ JSON.stringify(docSelectionCriteria) } updated.`,
            docToUpdate.newDocument
          )
        )
      }).catch(err => {
        reject(
          error.call(
            this,
            `No Document found in "${ collectionName }" collection with key ${ JSON.stringify(docSelectionCriteria) }`
          )
        )
      })
    }

    // check for user errors
    if (!docUpdates) {
      this.userErrors.push('No update object provided to update() method. Use an object e.g. { name: "William" }')
    }
    else if (!(typeof docUpdates == 'object' && docUpdates instanceof Array == false)) {
      this.userErrors.push('Data passed to .update() must be an object. Not an array, string, number or boolean.')
    }

    if (!this.userErrors.length) {
      if (typeof docSelectionCriteria == 'object') {
        this.updateDocumentByCriteria()
      }
      else {
        this.updateDocumentByKey()
      }
    }
    else {
      showUserErrors.call(this)
    }

  })

}