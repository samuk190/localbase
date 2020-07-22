import * as localForage from "localforage";
import logger from '../../utils/logger'
import isSubset from '../../utils/isSubset'
import updateObject from '../../utils/updateObject'

export default function update(docUpdates) {
  let collectionName = this.collectionName
  let docSelectionCriteria = this.docSelectionCriteria

  return new Promise((resolve, reject) => {

    // update document by criteria
    this.updateDocumentByCriteria = () => {
      let docsToUpdate = []
      localForage.iterate((value, key) => {
        if (isSubset(value, this.docSelectionCriteria)) {
          let newDocument = updateObject(value, docUpdates)
          docsToUpdate.push({ key, newDocument })
        }
      }).then(() => {
        if (docsToUpdate.length > 1) {
          logger.warn(`Multiple documents (${ docsToUpdate.length }) with ${ JSON.stringify(this.docSelectionCriteria) } found for updating.`)
        }
      }).then(() => {
        docsToUpdate.forEach((docToUpdate, index) => {
          localForage.setItem(docToUpdate.key, docToUpdate.newDocument).then(value => {

            if (index === (docsToUpdate.length - 1)) {
              resolve(
                this.success(
                  `${ docsToUpdate.length } Document${ docsToUpdate.length > 1 ? 's' : '' } in "${ collectionName }" collection with ${ JSON.stringify(docSelectionCriteria) } updated with:`,
                  docUpdates
                )
              )
            }

          }).catch(err => {
            reject(
              this.error(
                `Could not update ${ docsToUpdate.length } Documents in ${ collectionName } Collection.`
              )
            )
          })
        })
      })
    }
  
    // update document by key
    this.updateDocumentByKey = () => {
      let newDocument = {}
      localForage.getItem(docSelectionCriteria).then(value => {
        newDocument = updateObject(value, docUpdates)
        localForage.setItem(docSelectionCriteria, newDocument)
        resolve(
          this.success(
            `Document in "${ collectionName }" collection with key ${ JSON.stringify(docSelectionCriteria) } updated to:`,
            newDocument
          )
        )
      }).catch(err => {
        reject(
          this.error(
            `Document in "${ collectionName }" collection with key ${ JSON.stringify(docSelectionCriteria) } could not be updated.`
          )
        )
      })
    }

    if (!docUpdates) {
      reject(
        this.error('No update object provided.')
      )
    }

    else if (typeof docSelectionCriteria == 'object') {
      this.updateDocumentByCriteria()
    }
    else {
      this.updateDocumentByKey()
    }

  })

}