"use strict"

// TODO: come up with a list of user errors to handle
/*  
  add()
    - no collection specified
    - wrong type in collection()
    - wrong type in add()
    - nothing specified in add()
  update()
    - no collection specified
    - wrong type in collection()
    - no doc specified
    - wrong type in doc()
    - wrong type in update()
    - nothing specified in update()
  set()
    - no collection specified
    - wrong type in collection()
    - no doc specified
    - wrong type in doc()
    - wrong type in set()
    - nothing specified in set()
  get()
    - no collection specified
    - wrong type in collection()
    - wrong type in get()
    - invalid criteria / type in doc()
  delete() 
    - no collection / invalid type in collection()
    - collection doesn't exist
    - invalid document criteria / type
    - document doesn't exist
  general
    - methods in wrong order
*/
// TODO: database editor

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