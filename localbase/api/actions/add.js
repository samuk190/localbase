import * as localForage from "localforage";
let UUID = require('ordered-uuid');
import logger from '../../utils/logger'

export default function add(data, keyProvided) {
  if (typeof data == 'object' && data instanceof Array == false) {
    let key = null

    // if no key provided, generate random, ordered key
    if (!keyProvided) {
      key = UUID.generate()
    }
    else {
      key = keyProvided
    }

    return localForage.setItem(key, data).then(() => {
      logger.log(`Document added to "${ this.collectionName }" collection:`, { key, data })
      this.reset()
      return {
        key, data
      }
    }).catch(err => {
      logger.error(`Could not add Document to ${ this.collectionName } collection.`)
      this.reset()
      return this
    })

  }
  else {
    logger.error('Data passed to .add() must be an object. Not an array, string, number or boolean.')
    this.reset()
    return
  }
}