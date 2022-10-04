import logger from "../../utils/logger"
import reset from '../../api-utils/reset'
import selectionLevel from '../../api-utils/selectionLevel'
import showUserErrors from '../../api-utils/showUserErrors'
import { single, go, highlight } from 'fuzzysort';


/**
 * 
 * @param {string} query  text to search within the collection
 * @param {Array} inKeys properties of the object where to search eg: ['title','category']
 * @param {object} options { highlights:true }
 * @returns [...any] search results in order
 */
export default function search(query = '',inKeys =[], options = { highlights:true }) {

  if (!query) return logger.error.call(this, 'query in search is empty');
  if (typeof options !== 'object') return logger.error.call(this, 'no valid options');

  this.go = async () => {
    let collectionName = this.collectionName;
    let isPrepared = false
    const targets = await new Promise((res, rej) => {
      const targets = []
      this.lf[collectionName].iterate((value, key) => {
        if(Array.isArray(inKeys) && inKeys.length){
          targets.push(value);
        }else{
          if(!(value.___prepared___)){
            targets.push(value);
          }else{
            isPrepared = true;
            const si = single(query, value.___prepared___);
            if (si) {
              if (si.score > -200) {
                if(options.highlights) {value.__highlights = highlight(si,'<strong>','</strong>');}
                if(targets.push(value) > 100) return targets;
              }
            }
          }
      }
      }).then(() => {
        res(targets)
      }).catch(e => rej(e));
    })

    const optionsFuzzy = {
      limit: 100, // don't return more results than you need!
      threshold: -10000, // don't return bad results
      key: Array.isArray(inKeys) && inKeys.length ? null : isPrepared ? '___prepared___':null,
      keys: Array.isArray(inKeys) && inKeys.length ? inKeys : null
    }

    const results = go(query, targets, optionsFuzzy);
    reset.call(this);
    logger.log.call(this, 'SEARCHS', results.length);
    return results.map(o => o.obj);
  }

  // check for user errors
  if (!(typeof options == 'object' && options instanceof Array == false)) {
    this.userErrors.push('Data passed to .search() must be an object. Not an array, string, number or boolean. The object must contain a "highlights" property set to true or false, e.g. { highlights: true }')
  }
  else {
    if (!options.hasOwnProperty('highlights')) {
      this.userErrors.push('Object passed to search() method must contain a "highlights" property set to boolean true or false, e.g. { highlights: true }')
    }
    else {
      if (typeof options.highlights !== 'boolean') {
        this.userErrors.push('Property "highlights" passed into search() method must be assigned a boolean value (true or false). Not a string or integer.')
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