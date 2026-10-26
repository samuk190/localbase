import logger from '../../utils/logger'
import isSubset from '../../utils/isSubset'
import updateObject from '../../utils/updateObject'
import success from '../../api-utils/success'
import error from '../../api-utils/error'
import showUserErrors from '../../api-utils/showUserErrors'
import reset from '../../api-utils/reset'

export default function update(docUpdates) {
  const collectionName = this.collectionName
  const docSelectionCriteria = this.docSelectionCriteria
  const lf = this.lf

  return new Promise((resolve, reject) => {
    // check for user errors
    if (!docUpdates) {
      this.userErrors.push('No update object provided to update() method. Use an object e.g. { name: "William" }')
    } else if (!(typeof docUpdates == 'object' && !(docUpdates instanceof Array))) {
      this.userErrors.push('Data passed to .update() must be an object. Not an array, string, number or boolean.')
    }

    if (this.userErrors.length) {
      showUserErrors.call(this)
      return reject(error.call(this, 'Invalid arguments passed to .update()'))
    }

    // update document by criteria
    const updateDocumentByCriteria = () => {
      const lockKey = `${collectionName}:criteria:${JSON.stringify(docSelectionCriteria)}`
      return (this.lock ? this.lock.acquire(lockKey, perform) : perform())

      function perform() {
        let docsToUpdate = []
        return lf[collectionName]
          .iterate((value, key) => {
            if (isSubset(value, docSelectionCriteria)) {
              let newDocument = updateObject(value, docUpdates)
              docsToUpdate.push({ key, newDocument })
            }
          })
          .then(() => {
            if (!docsToUpdate.length) {
              const msg = `No Documents found in ${collectionName} Collection with criteria ${JSON.stringify(docSelectionCriteria)}.`
              reject(error.call(this, msg))
              return
            }
            if (docsToUpdate.length > 1) {
              logger.warn.call(this, `Multiple documents (${docsToUpdate.length}) with ${JSON.stringify(docSelectionCriteria)} found for updating.`)
            }

            return Promise.all(
              docsToUpdate.map(docToUpdate => lf[collectionName].setItem(docToUpdate.key, docToUpdate.newDocument))
            ).then(() => {
              if (this.syncChannel) {
                this.syncChannel.broadcast(`collection:${collectionName}:change`, { action: 'update', criteria: docSelectionCriteria, docUpdates })
              }
              reset.call(this)
              resolve(
                success.call(
                  this,
                  `${docsToUpdate.length} Document${docsToUpdate.length > 1 ? 's' : ''} in "${collectionName}" collection with ${JSON.stringify(docSelectionCriteria)} updated.`,
                  docUpdates
                )
              )
            })
          })
          .catch(err => {
            reset.call(this)
            reject(error.call(this, `Could not update Documents in ${collectionName} Collection: ${err.message || err}`))
          })
      }
    }

    // update document by key
    const updateDocumentByKey = () => {
      const lockKey = `${collectionName}:${docSelectionCriteria}`
      return (this.lock ? this.lock.acquire(lockKey, perform.bind(this)) : perform.call(this))

      function perform() {
        return lf[collectionName]
          .getItem(docSelectionCriteria)
          .then(value => {
            if (value === null || value === undefined) {
              const msg = `No Document found in "${collectionName}" collection with key ${JSON.stringify(docSelectionCriteria)}`
              reset.call(this)
              reject(error.call(this, msg))
              return
            }
            const newDocument = updateObject(value, docUpdates)
            return lf[collectionName].setItem(docSelectionCriteria, newDocument).then(() => {
              if (this.syncChannel) {
                this.syncChannel.broadcast(`collection:${collectionName}:change`, { action: 'update', key: docSelectionCriteria, docUpdates })
              }
              reset.call(this)
              resolve(
                success.call(
                  this,
                  `Document in "${collectionName}" collection with key ${JSON.stringify(docSelectionCriteria)} updated.`,
                  newDocument
                )
              )
            })
          })
          .catch(err => {
            reset.call(this)
            reject(error.call(this, `No Document found in "${collectionName}" collection with key ${JSON.stringify(docSelectionCriteria)}`))
          })
      }
    }

    if (typeof docSelectionCriteria == 'object') {
      updateDocumentByCriteria.call(this)
    } else {
      updateDocumentByKey.call(this)
    }
  })
}
