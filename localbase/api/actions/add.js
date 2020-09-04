let UUID = require('ordered-uuid')
import success from '../../api-utils/success'
import error from '../../api-utils/error'
import showSelectorAndFilterErrors from '../../api-utils/showSelectorAndFilterErrors'

export default function add(data, keyProvided) {
  if (!this.selectorAndFilterErrors.length) {
    let collectionName = this.collectionName
  
    return new Promise((resolve, reject) => {
      if (typeof data == 'object' && data instanceof Array == false) {
        let key = null
  
        // if no key provided, generate random, ordered key
        if (!keyProvided) {
          key = UUID.generate()
        }
        else {
          key = keyProvided
        }
  
        return this.lf[collectionName].setItem(key, data).then(() => {
          resolve(
            success.call(
              this,
              `Document added to "${ collectionName }" collection:`,
              { key, data }
            )
          )
        }).catch(err => {
          reject(
            error.call(
              this,
              `Could not add Document to ${ collectionName } collection.`
            )
          )
        })
  
      }
      else {
        reject(
          error.call(
            this,
            'Data passed to .add() must be an object. Not an array, string, number or boolean.')
        )
      }
    })
  }
  else {
    showSelectorAndFilterErrors.call(this)
  }
}