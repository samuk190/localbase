import * as localForage from "localforage";
import logger from '../../utils/logger'
import isSubset from '../../utils/isSubset'

export default function set(newDocument) {

  return new Promise((resolve, reject) => {

    // set document by criteria
    this.setDocumentByCriteria = () => {
      let docsToSet = []
      localForage.iterate((value, key) => {
        if (isSubset(value, this.docSelectionCriteria)) {
          docsToSet.push({ key, newDocument })
        }
      }).then(() => {
        if (docsToSet.length > 1) {
          logger.warn(`Multiple documents (${ docsToSet.length }) with ${ JSON.stringify(this.docSelectionCriteria) } found for setting.`)
        }
      }).then(() => {
        docsToSet.forEach((docToSet, index) => {
          localForage.setItem(docToSet.key, docToSet.newDocument).then(value => {

            if (index === (docsToSet.length - 1)) {
              resolve(
                this.success(
                  `${ docsToSet.length } Document${ docsToSet.length > 1 ? 's' : '' } in "${ this.collectionName }" collection with ${ JSON.stringify(this.docSelectionCriteria) } set to:`, 
                  newDocument
                )
              )
            }
          }).catch(err => {
            reject(
              this.error(
                `Could not set ${ docsToSet.length } Documents in ${ this.collectionName } Collection.`
              )
            )
          })
        })
      })
    }

    // set document by key
    this.setDocumentByKey = () => {
      localForage.setItem(this.docSelectionCriteria, newDocument).then(value => {
        resolve(
          this.success(
            `Document in "${ this.collectionName }" collection with key ${ JSON.stringify(this.docSelectionCriteria) } set to:`,
            newDocument
          )
        )
      }).catch(err => {
        reject(
          this.error(
            `Document in "${ this.collectionName }" collection with key ${ JSON.stringify(this.docSelectionCriteria) } could not be set.`
          )
        )
      })
    }

    if (!newDocument) {
      reject(
        this.error('No new document object provided to set() method.')
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