import isSubset from '../../utils/isSubset'
import logger from "../../utils/logger"
import reset from '../../api-utils/reset'
import selectionLevel from '../../api-utils/selectionLevel'
import showUserErrors from '../../api-utils/showUserErrors'

function Levenshtein(a, b) {
  var n = a.length;
  var m = b.length;

  // matriz de cambios mínimos
  var d = [];

  // si una de las dos está vacía, la distancia
  // es insertar todas las otras
  if(n == 0)
      return m;
  if(m == 0)
      return n;

  // inicializamos el peor caso (insertar todas)
  for(var i = 0; i <= n; i++)
      (d[i] = [])[0] = i;
  for(var j = 0; j <= m; j++)
      d[0][j] = j;

  // cada elemento de la matriz será la transición con menor coste
  for(var i = 1, I = 0; i <= n; i++, I++)
    for(var j = 1, J = 0; j <= m; j++, J++)
        if(b[J] == a[I])
            d[i][j] = d[I][J];
        else
            d[i][j] = Math.min(d[I][j], d[i][J], d[I][J]) + 1;

  // el menor número de operaciones
  return d[n][m];
}

export default function get(options = { keys: false }) {

  // get collection
  this.getCollection = () => {
    let collectionName = this.collectionName
    let orderByProperty = this.orderByProperty
    let orderByDirection = this.orderByDirection
    let limitBy = this.limitBy
    let containsProperty = this.containsProperty
    let containsValue = this.containsValue
    const MIN_DISTANCE = this.MIN_DISTANCE || 3

    let collection = []
    let logMessage
    return this.lf[collectionName].iterate((value, key) => {
      let collectionItem = {}
      if (!options.keys) {
        collectionItem = value
      }
      else {
        collectionItem = {
          key: key,
          data: value
        }
      }
      logMessage = `Got "${ collectionName }" collection`
      if(containsProperty && containsValue){
        let valor = value[containsProperty]
        try {
          if(typeof valor === 'boolean' && typeof containsValue === 'boolean'){
            if(valor === containsValue) collection.push(collectionItem)
          }else if(typeof valor === 'string' && typeof containsValue === 'string'){
            const val = String(valor).toLowerCase()
            const cVal = String(containsValue).toLowerCase()
            if(Levenshtein(val, cVal) <= MIN_DISTANCE || val.includes(cVal)) collection.push(collectionItem)
            if(limitBy){
              if(collection.length > limitBy) {
                logMessage += `, limited to contains is ${ limitBy } `
                return collection
              }
            }
          }else if(typeof valor === 'number' && typeof containsValue === 'number'){
            if(valor === containsValue) collection.push(collectionItem)
          }
          logMessage += `, contains: "${ containsValue }" in "${containsProperty}"`
        } catch (error) {
          this.userErrors.push(`Constain():${error.message}`)
        }
      }else{
        collection.push(collectionItem)
      }

    }).then(() => {
      // orderBy
      if (orderByProperty) {
        logMessage += `, ordered by "${ orderByProperty }"`
        if (!options.keys) {
          collection.sort((a, b) => {
            return a[orderByProperty].toString().localeCompare(b[orderByProperty].toString())
          })
        }
        else {
          collection.sort((a, b) => {
            return a.data[orderByProperty].toString().localeCompare(b.data[orderByProperty].toString())
          })
        }
      }
      if (orderByDirection == 'desc') {
        logMessage += ` (descending)`
        collection.reverse()
      }
      // limit
      if (limitBy) {
        logMessage += `, limited to ${ limitBy }`
        collection = collection.splice(0,limitBy)
      }
      logMessage += `:`
      logger.log.call(this, logMessage, collection)
      reset.call(this)
      return collection
    })
  }

  // get document
  this.getDocument = () => {
    let collectionName = this.collectionName
    let docSelectionCriteria = this.docSelectionCriteria

    let collection = []
    let document = {}

    // get document by criteria
    this.getDocumentByCriteria = () => {
      return this.lf[collectionName].iterate((value, key) => {
        if (isSubset(value, docSelectionCriteria)) {
          collection.push(value)
        }
      }).then(() => {
        if (!collection.length) {
          logger.error.call(this, `Could not find Document in "${ collectionName }" collection with criteria: ${ JSON.stringify(docSelectionCriteria)}`)
        }
        else {
          document = collection[0]
          logger.log.call(this, `Got Document with ${ JSON.stringify(docSelectionCriteria) }:`, document)
          reset.call(this)
          return document
        }
      })
    }

    // get document by key
    this.getDocumentByKey = () => {
      return this.lf[collectionName].getItem(docSelectionCriteria).then((value) => {
        document = value
        if (document) {
          logger.log.call(this, `Got Document with key ${ JSON.stringify(docSelectionCriteria) }:`, document)
        }
        else {
          logger.error.call(this, `Could not find Document in "${ collectionName }" collection with Key: ${ JSON.stringify(docSelectionCriteria)}`)
        }
        reset.call(this)
        return document
      }).catch(err => {
        logger.error.call(this, `Could not find Document in "${ collectionName }" collection with Key: ${ JSON.stringify(docSelectionCriteria)}`)
        reset.call(this)
      });
    }

    if (typeof docSelectionCriteria == 'object') {
      return this.getDocumentByCriteria()
    }
    else {
      return this.getDocumentByKey()
    }
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

  if (!this.userErrors.length) {
    let currentSelectionLevel = selectionLevel.call(this)

    if (currentSelectionLevel == 'collection') {
      return this.getCollection()
    }
    else if (currentSelectionLevel == 'doc') {
      return this.getDocument()
    }
  }
  else {
    showUserErrors.call(this)
    return null
  }

}