import * as localForage from "localforage";
import logger from '../../utils/logger'
import isSubset from '../../utils/isSubset'
import updateObject from '../../utils/updateObject'

export default async function update(docUpdates) {
  this.docUpdates = docUpdates
  let collectionName = this.collectionName

  return new Promise((resolve, reject) => {

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
      }).then(() => {
        docsToUpdate.forEach((docToUpdate, index) => {
          console.log('index: ', index)
          localForage.setItem(docToUpdate.key, docToUpdate.newDocument).then(value => {

            if (index === (docsToUpdate.length - 1)) {
              logger.log(`${ docsToUpdate.length } Document${ docsToUpdate.length > 1 ? 's' : '' } in "${ this.collectionName }" collection with ${ JSON.stringify(this.docSelectionCriteria) } updated with:`, docUpdates)
              resolve(`Success: ${ docsToUpdate.length } Document${ docsToUpdate.length > 1 ? 's' : '' } in "${ this.collectionName }" collection with ${ JSON.stringify(this.docSelectionCriteria) } updated with: ${ JSON.stringify(docUpdates) }`)
              this.reset()
              return
            }

          }).catch(err => {
            // return `Error: Could not update ${ docsToUpdate.length } Documents in ${ collectionName } Collection.`
            reject(`Error: Could not update ${ docsToUpdate.length } Documents in ${ collectionName } Collection.`)
            
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
        resolve('Done by key!')
      }).catch(err => {
        logger.error(`Document in "${ this.collectionName }" collection with key ${ JSON.stringify(this.docSelectionCriteria) } could not be updated.`);
        reject(`Document in "${ this.collectionName }" collection with key ${ JSON.stringify(this.docSelectionCriteria) } could not be updated.`)
      })
    }
  
    if (!docUpdates) {
      logger.error('Error: No update object provided.')
      return reject('Error: No update object provided.')
    }

    if (typeof this.docSelectionCriteria == 'object') {
      this.updateDocumentByCriteria()
    }
    else {
      this.updateDocumentByKey()
    }

  })

}