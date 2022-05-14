"use strict"

// import api methods
import collection from './api/selectors/collection'
import doc from './api/selectors/doc'

//filter
import orderBy from './api/filters/orderBy'
import limit from './api/filters/limit'
import contains from './api/filters/contains'

import get from './api/actions/get'
import add from './api/actions/add'
import update from './api/actions/update'
import set from './api/actions/set'
import deleteIt from './api/actions/delete'


// Localbase
export default class Localbase {
  constructor(dbName) {

    // properties
    this.dbName = dbName
    this.lf = {} // where we store our localForage instances
    this.collectionName = null
    this.orderByProperty = null
    this.orderByDirection = null
    this.limitBy = null
    this.docSelectionCriteria = null

    this.containsProperty = null
    this.containsValue = null
    this.containsExact = false
    this.containsSinError = false

    // queues
    this.deleteCollectionQueue = {
      queue: [],
      running: false
    }

    // config
    this.MIN_DISTANCE = 2
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
    this.contains = contains.bind(this)

    // api - actions
    this.get = get.bind(this)
    this.add = add.bind(this)
    this.update = update.bind(this)
    this.set = set.bind(this)
    this.delete = deleteIt.bind(this)

  }
}