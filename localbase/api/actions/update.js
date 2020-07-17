import * as localForage from "localforage";
import logger from '../../utils/logger'
import isSubset from '../../utils/isSubset'
import updateObject from '../../utils/updateObject'

export default function update(docUpdates) {
  this.docUpdates = docUpdates
  let collectionName = this.collectionName

  // update document by criteria
  this.updateDocumentByCriteria = () => {
    let docsToUpdate = []
    return localForage.iterate((value, key) => {
      if (isSubset(value, this.docSelectionCriteria)) {
        let newDocument = updateObject(value, this.docUpdates)
        docsToUpdate.push({ key, newDocument })
      }
    }).then(() => {
      console.log('docsToUpdate: ', docsToUpdate)
      if (docsToUpdate.length > 1) {
        logger.warn(`Multiple documents (${ docsToUpdate.length }) with ${ JSON.stringify(this.docSelectionCriteria) } found for updating.`)
      }
      docsToUpdate.forEach((docToUpdate, index) => {
        console.log('index: ', index)
        return localForage.setItem(docToUpdate.key, docToUpdate.newDocument).then(value => {
          logger.log(`Document in "${ this.collectionName }" collection with ${ JSON.stringify(this.docSelectionCriteria) } updated to:`, docToUpdate.newDocument)
          if (index == docsToUpdate.length - 1) {
            this.reset()
            return
          }
        }).catch(err => {
          return `Error: Could not update ${ docsToUpdate.length } Documents in ${ collectionName } Collection.`
        })
      })
    })
  }

  // update document by key
  this.updateDocumentByKey = () => {
    let newDocument = {}
    localForage.getItem(this.docSelectionCriteria).then(value => {
      newDocument = updateObject(value, this.docUpdates)
      localForage.setItem(this.docSelectionCriteria, newDocument)
      logger.log(`Document in "${ this.collectionName }" collection with key ${ JSON.stringify(this.docSelectionCriteria) } updated to:`, newDocument)
    }).catch(err => {
      logger.error(`Document in "${ this.collectionName }" collection with key ${ JSON.stringify(this.docSelectionCriteria) } could not be updated.`);
    })
  }

  if (typeof this.docSelectionCriteria == 'object') {
    return this.updateDocumentByCriteria()
  }
  else {
    return this.updateDocumentByKey()
  }
}