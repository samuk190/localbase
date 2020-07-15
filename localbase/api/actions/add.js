import * as localForage from "localforage";
let UUID = require('ordered-uuid');
import logger from '../../utils/logger'

export default function add(document, keyProvided) {
  if (typeof document == 'object' && document instanceof Array == false) {
    let key = null

    // if no key provided, generate random, ordered key
    if (!keyProvided) {
      key = UUID.generate()
    }
    else {
      key = keyProvided
    }

    console.log('key: ', key)

    return localForage.setItem(key, document).then(() => {
      logger.log(`Document added to ${ this.collectionName } collection.`, { key, document })
      return {
        key, document
      }
    }).catch(err => {
      logger.error(`Could not add Document to ${ this.collectionName } collection.`)
      return this
    })

  }
  else {
    logger.error('Data passed to .add() must be an object. Not an array, string, number or boolean.')
    return
  }
}