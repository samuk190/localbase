let UUID = require('ordered-uuid');

export default function add(data, keyProvided) {
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

      return this.lf[this.collectionName].setItem(key, data).then(() => {
        resolve(
          this.success(
            `Document added to "${ this.collectionName }" collection:`,
            { key, data }
          )
        )
      }).catch(err => {
        reject(
          this.error(
            `Could not add Document to ${ this.collectionName } collection.`
          )
        )
      })

    }
    else {
      reject(
        this.error('Data passed to .add() must be an object. Not an array, string, number or boolean.')
      )
    }
  })
}