import logger from "../../utils/logger"
import reset from '../../api-utils/reset'
import selectionLevel from '../../api-utils/selectionLevel'
import showUserErrors from '../../api-utils/showUserErrors'
import { single, go, highlight } from 'fuzzysort';



export default function search(query = '', opciones = { destacado:true }) {

  if (!query) return logger.error.call(this, 'query in search is empty');
  if (typeof opciones !== 'object') return logger.error.call(this, 'no valid opciones');

  this.go = async () => {
    let collectionName = this.collectionName;

    const targets = await new Promise((res, rej) => {
      const targets = []
      this.lf[collectionName].iterate((value, key) => {
        const si = single(query, value.___prepared___);
        if (si) {
          if (si.score > -200) {
            if(opciones.destacado) {value.__destacado = highlight(si,'<strong>','</strong>');}
            if(targets.push(value) > 100) return targets;
          }
        }
      }).then(() => {
        res(targets)
      }).catch(e => rej(e));
    })

    const options = {
      limit: 100, // don't return more results than you need!
      threshold: -10000, // don't return bad results
      key: '___prepared___'
    }

    const results = go(query, targets, options);
    reset.call(this);
    logger.log.call(this, 'SEARCHS', results.length);
    return results.map(o => o.obj);
  }

  // check for user errors
  if (!(typeof options == 'object' && options instanceof Array == false)) {
    this.userErrors.push('Data passed to .get() must be an object. Not an array, string, number or boolean. The object must contain a "keys" property set to true or false, e.g. { keys: true }')
  }
  else {
    if (!options.hasOwnProperty('keys')) {
      this.userErrors.push('Object passed to get() method must contain a "keys" property set to boolean true or false, e.g. { keys: true }')
    }
    else {
      if (typeof options.keys !== 'boolean') {
        this.userErrors.push('Property "keys" passed into get() method must be assigned a boolean value (true or false). Not a string or integer.')
      }
    }
  }

  let currentSelectionLevel = selectionLevel.call(this)

  if (currentSelectionLevel == 'collection') {
    return this.go();
  }
  else if (currentSelectionLevel == 'doc') {
    this.userErrors.push('Function no avalible in doc')
  }
  if (this.userErrors.length) {
    showUserErrors.call(this)
    return null
  }

}