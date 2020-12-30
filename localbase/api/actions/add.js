let UUID = require('ordered-uuid')
import success from '../../api-utils/success'
import error from '../../api-utils/error'
import showUserErrors from '../../api-utils/showUserErrors'

export default function add(data, keyProvided) {
  // check for user errors
  if (!data) {
    this.userErrors.push('No data specified in add() method. You must use an object, e.g { id: 1, name: "Bill", age: 47 }')
  }
  else if (!(typeof data == 'object' && data instanceof Array == false)) {
    this.userErrors.push('Data passed to .add() must be an object. Not an array, string, number or boolean.')
  }

  // no user errors, do the add
  if (!this.userErrors.length) {
    let collectionName = this.collectionName
  
    return new Promise((resolve, reject) => {
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
            `Document added to "${ collectionName }" collection.`,
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
    })
  }
  else {
    showUserErrors.call(this)
  }
}