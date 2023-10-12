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
import Connection from './utils/conecction.js'
import where from './api/filters/where.js'

// Localbase
export default class Localbase {
  constructor(dbName, config = null) {

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
    this.whereArguments = []

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
    this.where = where.bind(this);

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
    this.promesaConexion = new Promise((resolve, reject) => {
      this.resolverPromesa = resolve; // Función para resolver la promesa
    });

    if (!!config) {
      if(!config.url) this.resolverPromesa()
      try {
        const con = new Connection(config.url);
        this.socket = con.socket;
        const onOpen = () => {
          console.log('conectado');
          this.socket.isOpened = true;
          this.resolverPromesa()
        }
        this.socket.addEventListener('open',onOpen );
        this.socket.onerror = (error) => {
          console.log('error');
          this.socket.removeEventListener('open',onOpen)
          this.resolverPromesa()
        }
      } catch (error) {
        
      }

    } else  try {this.resolverPromesa()} catch (e) {}
  }

  async conected() {
    return this.promesaConexion
  }

  change(collection, action, data, key) {
    if (!!this.socket && this.socket.isOpened) this.socket.send(`change:${collection}:${action}:${key}:=>${JSON.stringify(data)}`,true);
    Localbase.onChange({ database: this.dbName, collection, action, data, key })
    if (!!key) {
      Localbase.onChangeDoc({ key, action, data });
    }
  }

  static onChange(movimiento) {}
  static onChangeDoc(movimiento) { }

  /**
   * Returns a function that increments a given number by a specified amount.
   * @param {number} cuanto - The amount to increment the number by.
   * @returns {function} A function that takes a number and returns the incremented value.
   */
  static increment(cuanto) {
    if (typeof cuanto !== 'number') return (valor) => valor;
    return (valor) => {
      if (typeof valor !== 'number') return valor;
      return valor + cuanto;
    }
  }

  /**
   * Returns a function that takes an array and returns a new array with the given data appended to it if it doesn't already exist in the array.
   * @param {*} data - The data to append to the array.
   * @returns {function} A function that takes an array and returns a new array with the given data appended to it if it doesn't already exist in the array.
   */
  static arrayUnion(data) {
    return (array) => {
      if (!Array.isArray(array)) return array;
      
      const index = array.findIndex((element) => Bun.deepEquals(element, data, true));

      if (index === -1) {
        array.push(data);
      }

      return array;
    }
  }

  /**
   * Returns a function that removes the first occurrence of the given data object from an array.
   * @param {Object} data - The data object to remove from the array.
   * @returns {Function} A function that takes an array and returns a new array with the first occurrence of the given data object removed.
   */
  static arrayRemove(data) {
    return (array) => {
      if (!Array.isArray(array)) {
        return array;
      }
      const index = array.findIndex((element) => Bun.deepEquals(element, data, true));

      if (index !== -1) {
        array.splice(index, 1);
      }

      return array;
    }
  }

  static toTimestamp(){
    return Date.now();
  }

  static toDateString(timestamp){
    return new Date(timestamp).toLocaleDateString();
  }
}