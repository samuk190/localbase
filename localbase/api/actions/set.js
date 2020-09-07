import logger from '../../utils/logger'
import isSubset from '../../utils/isSubset'
import success from '../../api-utils/success'
import error from '../../api-utils/error'
import showUserErrors from '../../api-utils/showUserErrors'

export default function set(newDocument) {

  let collectionName = this.collectionName
  let docSelectionCriteria = this.docSelectionCriteria

  return new Promise((resolve, reject) => {

    // set document by criteria
    this.setDocumentByCriteria = () => {
      let docsToSet = []
      this.lf[collectionName].iterate((value, key) => {
        if (isSubset(value, docSelectionCriteria)) {
          docsToSet.push({ key, newDocument })
        }
      }).then(() => {
        if (!docsToSet.length) {
          reject(
            error.call(
              this,
              `No Documents found in ${ collectionName } Collection with criteria ${ JSON.stringify(docSelectionCriteria) }.`
            )
          )
        }
        if (docsToSet.length > 1) {
          logger.warn.call(this, `Multiple documents (${ docsToSet.length }) with ${ JSON.stringify(docSelectionCriteria) } found for setting.`)
        }
      }).then(() => {
        docsToSet.forEach((docToSet, index) => {
          this.lf[collectionName].setItem(docToSet.key, docToSet.newDocument).then(value => {

            if (index === (docsToSet.length - 1)) {
              resolve(
                success.call(
                  this,
                  `${ docsToSet.length } Document${ docsToSet.length > 1 ? 's' : '' } in "${ collectionName }" collection with ${ JSON.stringify(docSelectionCriteria) } set to:`, 
                  newDocument
                )
              )
            }
          }).catch(err => {
            reject(
              error.call(
                this,
                `Could not set ${ docsToSet.length } Documents in ${ collectionName } Collection.`
              )
            )
          })
        })
      })
    }

    // set document by key
    this.setDocumentByKey = () => {
      this.lf[collectionName].setItem(docSelectionCriteria, newDocument).then(value => {
        resolve(
          success.call(
            this,
            `Document in "${ collectionName }" collection with key ${ JSON.stringify(docSelectionCriteria) } set to:`,
            newDocument
          )
        )
      }).catch(err => {
        reject(
          error.call(
            this,
            `Document in "${ collectionName }" collection with key ${ JSON.stringify(docSelectionCriteria) } could not be set.`
          )
        )
      })
    }

    // check for errors
    if (!newDocument) {
      this.userErrors.push('No new Document object provided to set() method. Use an object e.g. { id: 1, name: "Bill", age: 47 }')
    }
    else if (!(typeof newDocument == 'object' && newDocument instanceof Array == false)) {
      this.userErrors.push('Data passed to .set() must be an object. Not an array, string, number or boolean.')
    }

    if (!this.userErrors.length) {
      if (typeof docSelectionCriteria == 'object') {
        return this.setDocumentByCriteria()
      }
      else {
        return this.setDocumentByKey()
      }
    }
    else {
      showUserErrors.call(this)
    }

  })
}