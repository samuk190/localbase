"use strict"

// TODO: remove "this is a work in progress" from readme
// TODO: create an errors array on the class - push errors into this in the various methods
//       and then in the actions, check for errors and reject, logging them all out
//       REMEMBER to clear the errors array in the reset method
/*  
  collection() ✅
    - no collection specified ✅
    - wrong/invalid type in collection() ✅
  doc() ✅
    - no doc specified ✅
    - wrong type in doc() ✅
  orderBy() ✅
    - no field specified ✅
    - first parameter not a string ✅
    - second parameter not a string == 'asc' or 'desc' ✅
  limit() ✅
    - no limit specified ✅
    - not an integer >= 1 ✅
  add() ✅
    - nothing specified in add() ✅
    - wrong type in add() ✅
  update() ✅
    - nothing specified in update() ✅
    - wrong type in update() ✅
    - document doesn't exist ✅
  set() ✅
    - nothing specified in set() ✅
    - wrong type in set() ✅
    - document doesn't exist ✅
  get() ✅
    - wrong type in get() ✅
    - document doesn't exist ✅
  delete() ✅
    - document doesn't exist ✅
*/

// import api methods
import collection from './api/selectors/collection'
import doc from './api/selectors/doc'

import orderBy from './api/filters/orderBy'
import limit from './api/filters/limit'

import get from './api/actions/get'
import add from './api/actions/add'
import update from './api/actions/update'
import set from './api/actions/set'
import deleteIt from './api/actions/delete'

// Localbase
class Localbase {
  constructor(dbName) {

    // properties
    this.dbName = dbName
    this.lf = {} // where we store our localForage instances
    this.collectionName = null
    this.orderByProperty = null
    this.orderByDirection = null
    this.limitBy = null
    this.docSelectionCriteria = null

    // queues
    this.deleteCollectionQueue = {
      queue: [],
      running: false
    }

    // config
    this.config = {
      debug: true
    }

    // user errors - e.g. wrong type or no value passed to a method
    this.userErrors = []

    // api - selectors
    this.collection = collection.bind(this)
    this.doc = doc.bind(this)

    // api - filters
    this.orderBy = orderBy.bind(this)
    this.limit = limit.bind(this)

    // api - actions
    this.get = get.bind(this)
    this.add = add.bind(this)
    this.update = update.bind(this)
    this.set = set.bind(this)
    this.delete = deleteIt.bind(this)

  }
}

export default Localbase