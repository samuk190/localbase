import logger from '../../utils/logger'
import isSubset from '../../utils/isSubset'
import success from '../../api-utils/success'
import error from '../../api-utils/error'
import showUserErrors from '../../api-utils/showUserErrors'
import selectionLevel from '../../api-utils/selectionLevel'

export default function set(newDocument, options = { keys: false }) {

  let collectionName = this.collectionName
  let docSelectionCriteria = this.docSelectionCriteria
  let currentSelectionLevel = selectionLevel.call(this)

  return new Promise((resolve, reject) => {

    // set collection
    this.setCollection = () => {
      this.lf[collectionName].clear().then(() => {
        if (!options.keys) {
          newDocument.forEach(doc => {
            this.add(doc)
          })
          resolve(
            success.call(
              this,
              `Collection "${ collectionName }" set with ${ newDocument.length } Documents.`, 
              newDocument
            )
          )
        }
        else {
          console.log('keys provided')
          // check that every document in array has a _key property
          let docsWithoutKey = 0
          newDocument.forEach(doc => {
            if (!doc.hasOwnProperty('_key')) {
              docsWithoutKey++
            }
          })
          if (docsWithoutKey) {
            reject(
              error.call(
                this,
                `Documents provided to .set() in an array must each have a _key property set to a string.`
              )
            )
          }
          else {
            newDocument.forEach(doc => {
              let key = doc._key
              delete doc._key
              this.add(doc, key)
            })
            resolve(
              success.call(
                this,
                `Collection "${ collectionName }" set with ${ newDocument.length } Documents.`, 
                newDocument
              )
            )
          }
        }
      }).catch(err => {
        reject(
          error.call(
            this,
            `Could not set ${ collectionName } Collection with data ${ JSON.stringify(newDocument) }.`
          )
        )
      });
    }

    // set document
    this.setDocument = () => {
      
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
                    `${ docsToSet.length } Document${ docsToSet.length > 1 ? 's' : '' } in "${ collectionName }" collection with ${ JSON.stringify(docSelectionCriteria) } was set.`, 
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
              `Document in "${ collectionName }" collection with key ${ JSON.stringify(docSelectionCriteria) } was set.`,
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

      if (typeof docSelectionCriteria == 'object') {
        return this.setDocumentByCriteria()
      }
      else {
        return this.setDocumentByKey()
      }
    }

    // check for user errors
    if (!newDocument) {
      this.userErrors.push('No new Document object provided to set() method. Use an object e.g. { id: 1, name: "Bill", age: 47 }')
    }
    else if (currentSelectionLevel === 'doc') {
      if (!(typeof newDocument == 'object' && newDocument instanceof Array == false)) {
        this.userErrors.push('Data passed to .set() must be an object. Not an array, string, number or boolean.')
      }
    }
    else if (currentSelectionLevel === 'collection') {
      if (!(typeof newDocument == 'object' && newDocument instanceof Array == true)) {
        this.userErrors.push('Data passed to .set() must be an array of objects. Not an object, string, number or boolean.')
      }
    }

    if (!this.userErrors.length) {
      if (currentSelectionLevel == 'collection') {
        return this.setCollection()
      }
      else if (currentSelectionLevel == 'doc') {
        return this.setDocument()
      }
    }
    else {
      showUserErrors.call(this)
    }

  })
}