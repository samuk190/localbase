import * as localForage from "localforage";
import logger from '../../utils/logger'
import isSubset from '../../utils/isSubset'
import updateObject from '../../utils/updateObject'

export default function update(docUpdates) {
  this.docUpdates = docUpdates

  // update document by criteria
  this.updateDocumentByCriteria = () => {
    let docsToUpdate = []
    localForage.iterate((value, key) => {
      if (isSubset(value, this.docSelectionCriteria)) {
        let newDocument = updateObject(value, this.docUpdates)
        docsToUpdate.push({ key, newDocument })
      }
    }).then(() => {
      console.log('docsToUpdate: ', docsToUpdate)
      if (docsToUpdate.length > 1) {
        logger.warn(`Multiple documents (${ docsToUpdate.length }) with ${ JSON.stringify(this.docSelectionCriteria) } found for updating.`)
      }
      docsToUpdate.forEach(docToUpdate => {
        localForage.setItem(docToUpdate.key, docToUpdate.newDocument)
        logger.log(`Document in "${ this.collectionName }" collection with ${ JSON.stringify(this.docSelectionCriteria) } updated to:`, docToUpdate.newDocument)
      })
      this.reset()
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