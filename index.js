"use strict"

// TODO: split into multiple files
// TODO: update - add then block response
// TODO: set - add then block response
// TODO: delete - add then block response
// TODO: database editor
// TODO: error handling

import * as localForage from "localforage";
import logger from './logger'
let UUID = require('ordered-uuid');

class Localbase {
  constructor(dbName) {
    localForage.config({
      driver      : localForage.INDEXEDDB,
      name        : dbName
    });

    this.dbName = dbName
    this.collectionName = null
    this.editType = 'db' // 'db' | 'collection' | 'doc'
    this.orderByProperty = null
    this.orderByDirection = null
    this.limitBy = null
    this.docSelectionCriteria = null
    this.docUpdates = null
  }
  collection(collectionName) {
    this.collectionName = collectionName
    localForage.config({ storeName: collectionName })
    this.editType = 'collection'
    return this
  }
  orderBy(property, direction) {
    if (property) this.orderByProperty = property
    if (direction) this.orderByDirection = direction
    return this
  }
  limit(limitBy) {
    if (limitBy) this.limitBy = limitBy
    console.log('this.limitBy: ', this.limitBy)
    return this
  }
  add(document, keyProvided) {
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
  get() {
    // get collection
    if (this.editType == 'collection') {
      let collection = []
      return localForage.iterate((value, key) => {
        collection.push(value)
      }).then(() => {
        // orderBy
        if (this.orderByProperty) {
            collection.sort((a, b) => {
            return a[this.orderByProperty].toString().localeCompare(b[this.orderByProperty].toString())
          })
        }
        if (this.orderByDirection == 'desc') {
          collection.reverse()
        }
        // limit
        if (this.limitBy) {
          collection = collection.splice(0,this.limitBy)
        }
        return collection
      })
    }
    // get document
    else if (this.editType == 'doc') {
      let collection = []
      let document = {}
      return localForage.iterate((value, key) => {
        console.log(key, value)
        if (this.isSubset(value, this.docSelectionCriteria)) {
          collection.push(value)
        }
      }).then(() => {
        document = collection[0]
        return document
      })
    }
  }
  doc(docSelectionCriteria) {
    this.editType = 'doc'
    this.docSelectionCriteria = docSelectionCriteria
    return this
  }
  update(docUpdates) {
    this.docUpdates = docUpdates
    localForage.iterate((value, key) => {
      if (this.isSubset(value, this.docSelectionCriteria)) {
        console.log('apply docUpdates to this one: ', this.docUpdates)
        let newDocument = this.updateObject(value, this.docUpdates)
        localForage.setItem(key, newDocument)
      }
    })
  }
  set(newDocument) {
    localForage.iterate((value, key) => {
      console.log(key, value)
      if (this.isSubset(value, this.docSelectionCriteria)) {
        localForage.setItem(key, newDocument)
      }
    })
  }
  delete() {
    console.log('delete')
    if (this.editType == 'db') {
      indexedDB.deleteDatabase(this.dbName)
    }
    else if (this.editType == 'collection') {
      localForage.dropInstance().then(function() {
        console.log('Dropped the store of the current instance');
      });
    }
    else if (this.editType == 'doc') {
      console.log('delete document with criteria: ', this.docSelectionCriteria)
      localForage.iterate((value, key) => {
        console.log(key, value)
        if (this.isSubset(value, this.docSelectionCriteria)) {
          localForage.removeItem(key)
        }
      })
    }
  }

  admin() {
    
  }

  // utilities
  isSubset(superObj, subObj) {
    return Object.keys(subObj).every(ele => {
        if (typeof subObj[ele] == 'object') {
            return isSubset(superObj[ele], subObj[ele]);
        }
        return subObj[ele] === superObj[ele]
    });
  }
  updateObject(obj/*, …*/) {
    for (var i=1; i<arguments.length; i++) {
        for (var prop in arguments[i]) {
            var val = arguments[i][prop];
            if (typeof val == "object") // this also applies to arrays or null!
                update(obj[prop], val);
            else
                obj[prop] = val;
        }
    }
    return obj;
  }
  reset() {
    this.collectionName = null
    this.editType = 'db'
    this.orderByProperty = null
    this.orderByDirection = null
    this.limitBy = null
    this.docSelectionCriteria = null
  }
}

export default Localbase