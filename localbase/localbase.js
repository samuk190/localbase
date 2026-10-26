"use strict"

// import api methods
import collection from './api/selectors/collection'
import doc from './api/selectors/doc'

import orderBy from './api/filters/orderBy'
import limit from './api/filters/limit'
import where from './api/filters/where'
import offset from './api/filters/offset'

import get from './api/actions/get'
import add from './api/actions/add'
import update from './api/actions/update'
import set from './api/actions/set'
import deleteIt from './api/actions/delete'
import count from './api/actions/count'
import paginate from './api/actions/paginate'
import exists from './api/actions/exists'
import upsert from './api/actions/upsert'
import onSnapshot from './api/actions/onSnapshot'
import AsyncLock from './utils/asyncLock'
import EventEmitter from './utils/eventEmitter'
import SyncChannel from './utils/syncChannel'

// Localbase
export default class Localbase {
  constructor(dbName) {

    // properties
    this.dbName = dbName
    this.lf = {} // where we store our localForage instances
    this.collectionName = null
    this.orderByProperty = null
    this.orderByDirection = null
    this.orderByClauses = []
    this.queryFilters = []
    this.limitBy = null
    this.docSelectionCriteria = null

    // queues
    this.lock = new AsyncLock()
    this.events = new EventEmitter()
    this.syncChannel = new SyncChannel(this.dbName, this.events)
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
    this.offset = offset.bind(this)
    this.skip = offset.bind(this)
    this.where = where.bind(this)

    // api - actions
    this.get = get.bind(this)
    this.add = add.bind(this)
    this.update = update.bind(this)
    this.set = set.bind(this)
    this.delete = deleteIt.bind(this)
    this.count = count.bind(this)
    this.paginate = paginate.bind(this)
    this.exists = exists.bind(this)
    this.upsert = upsert.bind(this)
    this.onSnapshot = onSnapshot.bind(this)

  }
}