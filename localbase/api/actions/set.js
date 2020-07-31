import logger from '../../utils/logger'
import isSubset from '../../utils/isSubset'
import success from '../../api-utils/success'
import error from '../../api-utils/error'

export default function set(newDocument) {

  return new Promise((resolve, reject) => {

    // set document by criteria
    this.setDocumentByCriteria = () => {
      let docsToSet = []
      this.lf[this.collectionName].iterate((value, key) => {
        if (isSubset(value, this.docSelectionCriteria)) {
          docsToSet.push({ key, newDocument })
        }
      }).then(() => {
        if (docsToSet.length > 1) {
          logger.warn.call(this, `Multiple documents (${ docsToSet.length }) with ${ JSON.stringify(this.docSelectionCriteria) } found for setting.`)
        }
      }).then(() => {
        docsToSet.forEach((docToSet, index) => {
          this.lf[this.collectionName].setItem(docToSet.key, docToSet.newDocument).then(value => {

            if (index === (docsToSet.length - 1)) {
              resolve(
                success.call(
                  this,
                  `${ docsToSet.length } Document${ docsToSet.length > 1 ? 's' : '' } in "${ this.collectionName }" collection with ${ JSON.stringify(this.docSelectionCriteria) } set to:`, 
                  newDocument
                )
              )
            }
          }).catch(err => {
            reject(
              error.call(
                this,
                `Could not set ${ docsToSet.length } Documents in ${ this.collectionName } Collection.`
              )
            )
          })
        })
      })
    }

    // set document by key
    this.setDocumentByKey = () => {
      this.lf[this.collectionName].setItem(this.docSelectionCriteria, newDocument).then(value => {
        resolve(
          success.call(
            this,
            `Document in "${ this.collectionName }" collection with key ${ JSON.stringify(this.docSelectionCriteria) } set to:`,
            newDocument
          )
        )
      }).catch(err => {
        reject(
          error.call(
            this,
            `Document in "${ this.collectionName }" collection with key ${ JSON.stringify(this.docSelectionCriteria) } could not be set.`
          )
        )
      })
    }

    if (!newDocument) {
      reject(
        error.call(
          this, 
          'No new document object provided to set() method.'
        )
      )
    }
    else if (typeof this.docSelectionCriteria == 'object') {
      return this.setDocumentByCriteria()
    }
    else {
      return this.setDocumentByKey()
    }

  })
}