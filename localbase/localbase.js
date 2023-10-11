"use strict"

// import api methods
import collection from './api/selectors/collection.js'
import doc from './api/selectors/doc.js'

//filter
import orderBy from './api/filters/orderBy.js'
import limit from './api/filters/limit.js'
import contains from './api/filters/contains.js'

import get from './api/actions/get.js'
import add from './api/actions/add.js'
import update from './api/actions/update.js'
import set from './api/actions/set.js'
import deleteIt from './api/actions/delete.js'
import search from './api/actions/search.js'
import uid from './api-utils/uid.js'

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
    this.set = set.bind(this);
    this.delete = deleteIt.bind(this);

    this.cache = {}
    this.time = 0

    this.search = search.bind(this);

    //util - uid
    this.uid = uid.bind(this);
  }

  change(collection,action,data,key){
    Localbase.onChange({ database:this.dbName, collection, action, data, key })
    if(!!key){
      Localbase.onChangeDoc({ key, action, data });
    }
  }

  static onChange(movimiento){}
  static onChangeDoc(movimiento){}
}