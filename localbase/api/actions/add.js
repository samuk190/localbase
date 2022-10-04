import cuid from 'cuid'
import success from '../../api-utils/success'
import error from '../../api-utils/error'
import showUserErrors from '../../api-utils/showUserErrors'
import { prepare } from 'fuzzysort'

const searchStringInObject = (value) => {
  let keys = []
  Object.keys(value).forEach(async k => {
    if (typeof value[k] === 'string' && value[k].length > 200) {
      if (isNaN(Number(value[k]))) {
        keys.push(k)
      }
    }
  });
  let str = ''
  keys.forEach(k2 => str += `${value[k2]} `);
  return str;
}

export default function add(data, keyProvided, keys= ['nombre', 'category']) {
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
        key = cuid();
      }
      else {
        key = keyProvided
      }

      try {
      if(Array.isArray(keys)){
          if (typeof data === 'string') data.___prepared___ = prepare(data);
            if (!Array.isArray(data) && typeof data === 'object' && Object.keys(data).some(k => keys.some(k2 => k2 === k))) {
              let str = ''
              keys.forEach(k2 => str += `${data[k2]} `);
              data.___prepared___ = prepare(str);
            } else if (!Array.isArray(data) && typeof data === 'object') {
              data.___prepared___ = prepare(searchStringInObject(data))
            } else if (Array.isArray(data)) {
              let str = ''
              data.forEach(v => {
                if (typeof v === 'string') {
                  if (str.length > 500) {
                    str += v
                  }
                } else if (!Array.isArray(v) && typeof v === 'object') {
                  str += searchStringInObject(v);
                }
              });
              data.___prepared___ = prepare(str);
            }
          }
      } catch (error) {
        console.trace(error)
      }

      return this.lf[collectionName].setItem(key, data).then(async () => {
        
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