import logger from '../../utils/logger.js'
import isSubset from '../../utils/isSubset.js'
import updateObject from '../../utils/updateObject.js'
import success from '../../api-utils/success.js'
import error from '../../api-utils/error.js'
import showUserErrors from '../../api-utils/showUserErrors.js'
import isValidFuntionAnExecute from '../../api-utils/isValidFunctionAndExecute.js'
import cumpleCriterios from '../../api-utils/cumpleCriterio.js'

export default function update(docUpdates) {
  let collectionName = this.collectionName
  let docSelectionCriteria = this.docSelectionCriteria
  let whereArguments = this.whereArguments
  const cuantosWhere = whereArguments.length
  if (cuantosWhere > 10) throw new Error('No se pueden usar mas de 10 where en una consulta')

  return new Promise((resolve, reject) => {

    // update document by criteria
    this.updateDocumentByCriteria = (isWhere = false) => {
      let docsToUpdate = []
      this.lf[collectionName].iterate((value, key) => {
        let oldDocument = value;
        const dataAUpdated = isValidFuntionAnExecute(docUpdates, oldDocument);
        if (!isWhere) {
          if (isSubset(dataAUpdated, docSelectionCriteria)) {
            let newDocument = updateObject(value, dataAUpdated)
            docsToUpdate.push({ key, newDocument, oldDocument })
          }
        } else if (cumpleCriterios.call(this, value)) {
          let newDocument = updateObject(value, dataAUpdated)
          docsToUpdate.push({ key, newDocument, oldDocument })
        }
      }).then(() => {
        if (!docsToUpdate.length) {
          reject(
            error.call(
              this,
              `No Documents found in ${collectionName} Collection with criteria ${JSON.stringify(docSelectionCriteria)}.`
            )
          )
        }
        if (docsToUpdate.length > 1) {
          logger.warn.call(this, `Multiple documents (${docsToUpdate.length}) with ${JSON.stringify(docSelectionCriteria)} found for updating.`)
        }
      }).then(() => {
        docsToUpdate.forEach((docToUpdate, index) => {
          this.lf[collectionName].setItem(docToUpdate.key, docToUpdate.newDocument).then(value => {
            this.change(collectionName, 'UPDATE', { ...docToUpdate }, docToUpdate.key)
            if (index === (docsToUpdate.length - 1)) {
              resolve(
                success.call(
                  this,
                  `${docsToUpdate.length} Document${docsToUpdate.length > 1 ? 's' : ''} in "${collectionName}" collection with ${JSON.stringify(docSelectionCriteria)} updated.`,
                  docUpdates
                )
              )
            }

          }).catch(err => {
            reject(
              error.call(
                this,
                `Could not update ${docsToUpdate.length} Documents in ${collectionName} Collection.`
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
        docToUpdate = { oldDocument: value };
        const dataAUpdated = isValidFuntionAnExecute(docUpdates, docToUpdate.oldDocument);
        docToUpdate.newDocument = updateObject(JSON.parse(JSON.stringify(docToUpdate.oldDocument)), dataAUpdated);
        this.lf[collectionName].setItem(docSelectionCriteria, docToUpdate.newDocument)
        this.change(collectionName, 'UPDATE', docToUpdate, docToUpdate.key)
        resolve(
          success.call(
            this,
            `Document in "${collectionName}" collection with key ${JSON.stringify(docSelectionCriteria)} updated.`,
            docToUpdate.newDocument
          )
        )
      }).catch(err => {
        reject(
          error.call(
            this,
            `No Document found in "${collectionName}" collection with key ${JSON.stringify(docSelectionCriteria)}`
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
      console.log('docSelectionCriteria', docSelectionCriteria)
      if (typeof docSelectionCriteria == 'object') {
        if (docSelectionCriteria !== null) {
          this.updateDocumentByCriteria()
        } else if (cuantosWhere) {
          this.updateDocumentByCriteria(true)
        }
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