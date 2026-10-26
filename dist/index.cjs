'use strict';

var localForage = require('localforage');

function collection(collectionName, options = {}) {
  if (!collectionName) {
    this.userErrors.push('No collection name specified in collection() method.');
    return this
  } else if (typeof collectionName !== 'string') {
    this.userErrors.push('Collection name in collection() method must be a string and not an object, number or boolean.');
    return this
  } else {
    this.collectionName = collectionName;
    this.docSelectionCriteria = null;

    if (!this.collectionOptions) {
      this.collectionOptions = {};
    }
    if (options && typeof options === 'object') {
      this.collectionOptions[collectionName] = options;
    }

    let dbName = this.dbName;

    // if we've not created a localForage instance
    // for this collection, create one
    if (!(collectionName in this.lf)) {
      this.lf[collectionName] = localForage.createInstance({
        driver: localForage.INDEXEDDB,
        name: dbName,
        storeName: collectionName
      });
    }

    // Ensure metadata store exists
    if (!('__localbase_metadata__' in this.lf)) {
      this.lf['__localbase_metadata__'] = localForage.createInstance({
        driver: localForage.INDEXEDDB,
        name: dbName,
        storeName: '__localbase_metadata__'
      });
    }

    return this
  }
}

function doc(docSelectionCriteria) {
  if (docSelectionCriteria === null || docSelectionCriteria === undefined) {
    this.userErrors.push('No document criteria specified in doc() method. Use a string/number (key) or an object (criteria) e.g. { id: 1 }');
    return this
  }
  if (typeof docSelectionCriteria !== 'string' && typeof docSelectionCriteria !== 'number' && typeof docSelectionCriteria !== 'object') {
    this.userErrors.push('Document criteria specified in doc() method must be a string, number, or object.');
    return this
  }
  this.docSelectionCriteria = docSelectionCriteria;
  return this
}

function orderBy(...args) {
  if (!this.orderByClauses) {
    this.orderByClauses = [];
  }

  if (!args.length) {
    this.userErrors.push("No field name specified in orderBy() method. Use a string e.g. 'name'");
    return this
  }

  // Support orderBy(['l_name', 'f_name'])
  if (Array.isArray(args[0])) {
    for (const prop of args[0]) {
      if (typeof prop === 'string') {
        this.orderByClauses.push({ property: prop, direction: 'asc' });
      }
    }
    return this
  }

  // Support orderBy('l_name', 'f_name') where second param is another field (Issue #15)
  // vs orderBy('name', 'desc')
  const [first, second] = args;
  if (typeof first !== 'string') {
    this.userErrors.push("Property in orderBy() method must be a string, e.g. 'name'");
    return this
  }

  if (second === 'asc' || second === 'desc') {
    this.orderByProperty = first;
    this.orderByDirection = second;
    this.orderByClauses.push({ property: first, direction: second });
  } else if (typeof second === 'string') {
    // Both are fields with default 'asc'
    this.orderByProperty = first;
    this.orderByDirection = 'asc';
    this.orderByClauses.push({ property: first, direction: 'asc' });
    this.orderByClauses.push({ property: second, direction: 'asc' });
  } else {
    this.orderByProperty = first;
    this.orderByDirection = 'asc';
    this.orderByClauses.push({ property: first, direction: 'asc' });
  }

  return this
}

function limit(limitBy) {
  if (!limitBy) {
    this.userErrors.push("No integer specified in limit() method.");
  }
  else if (!Number.isInteger(limitBy)) {
    this.userErrors.push("Limit parameter in limit() method must be an integer (e.g. 3) and not a float, boolean, string or object.");
  }
  else {
    this.limitBy = limitBy;
  }
  return this
}

function where(field, operator, value) {
  if (!field || typeof field !== 'string') {
    this.userErrors.push('First parameter in where() method must be a string field name, e.g. "age"');
    return this
  }

  // Shorthand where('name', 'Bill') -> where('name', '==', 'Bill')
  if (value === undefined && operator !== undefined) {
    value = operator;
    operator = '==';
  }

  const validOperators = [
    '==', '===', '!=', '<>', '>', '>=', '<', '<=',
    'gt', 'gte', 'lt', 'lte',
    'in', 'not-in', 'array-contains', 'array-contains-any', 'between'
  ];

  if (!validOperators.includes(operator)) {
    this.userErrors.push(
      `Invalid operator "${operator}" in where() method. Supported operators: ${validOperators.join(', ')}`
    );
    return this
  }

  if (!this.queryFilters) {
    this.queryFilters = [];
  }

  this.queryFilters.push({ field, operator, value });
  return this
}

function offset(skipCount) {
  if (typeof skipCount !== 'number' || skipCount < 0) {
    this.userErrors.push('Parameter passed to .offset() / .skip() must be a non-negative number, e.g. 10');
    return this
  }
  this.offsetBy = Math.floor(skipCount);
  return this
}

function isSubset(superObj, subObj) {
  return Object.keys(subObj).every(ele => {
      if (typeof subObj[ele] == 'object') {
          return isSubset(superObj[ele], subObj[ele]);
      }
      return subObj[ele] === superObj[ele]
  });
}

function isDevMode() {
  if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV) {
    return process.env.NODE_ENV === 'development'
  }
  return true
}

let logger = {
  baseStyle: `
    padding: 2px 5px;
    background-color: #124F5C;
    border-radius: 4px;
    color: white; 
  `,
  colors: {
    log: '#124F5C',
    error: '#ed2939',
    warn: '#f39c12'
  },
  log(message, secondary) {
    if (this.config && this.config.debug && isDevMode()) {
      let style = logger.baseStyle + `background-color: ${logger.colors.log}`;
      if (secondary !== undefined) {
        console.log('%clocalbase', style, message, secondary);
      } else {
        console.log('%clocalbase', style, message);
      }
    }
  },
  error(message, secondary) {
    if (this.config && this.config.debug && isDevMode()) {
      let style = logger.baseStyle + `background-color: ${logger.colors.error}`;
      console.error('%clocalbase', style, message);
    }
  },
  warn(message, secondary) {
    if (this.config && this.config.debug && isDevMode()) {
      let style = logger.baseStyle + `background-color: ${logger.colors.warn}`;
      console.warn('%clocalbase', style, message);
    }
  }
};

function reset() {
  this.collectionName = null;
  this.orderByProperty = null;
  this.orderByDirection = null;
  this.orderByClauses = [];
  this.queryFilters = [];
  this.limitBy = null;
  this.docSelectionCriteria = null;
  this.userErrors = [];
}

function selectionLevel() {
  let level;
  if (!this.collectionName && !this.docSelectionCriteria) level = 'db';
  else if (this.collectionName && !this.docSelectionCriteria) level = 'collection';
  else if (this.collectionName && this.docSelectionCriteria) level = 'doc';
  return level
}

function showUserErrors() {
  for (let i = 0; i < this.userErrors.length; i++) {
    logger.error.call(this, this.userErrors[i]);
  }
  reset.call(this);
}

function getNestedValue(obj, path) {
  if (!obj || typeof obj !== 'object') return undefined
  if (!path.includes('.')) return obj[path]
  const keys = path.split('.');
  let current = obj;
  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined
    }
    current = current[key];
  }
  return current
}

function evaluateCondition(recordValue, operator, targetValue) {
  switch (operator) {
    case '==':
    case '===':
      if (recordValue instanceof Date && targetValue instanceof Date) {
        return recordValue.getTime() === targetValue.getTime()
      }
      return recordValue === targetValue

    case '!=':
    case '<>':
      if (recordValue instanceof Date && targetValue instanceof Date) {
        return recordValue.getTime() !== targetValue.getTime()
      }
      return recordValue !== targetValue

    case '>':
    case 'gt':
      if (recordValue instanceof Date && targetValue instanceof Date) {
        return recordValue.getTime() > targetValue.getTime()
      }
      return recordValue > targetValue

    case '>=':
    case 'gte':
      if (recordValue instanceof Date && targetValue instanceof Date) {
        return recordValue.getTime() >= targetValue.getTime()
      }
      return recordValue >= targetValue

    case '<':
    case 'lt':
      if (recordValue instanceof Date && targetValue instanceof Date) {
        return recordValue.getTime() < targetValue.getTime()
      }
      return recordValue < targetValue

    case '<=':
    case 'lte':
      if (recordValue instanceof Date && targetValue instanceof Date) {
        return recordValue.getTime() <= targetValue.getTime()
      }
      return recordValue <= targetValue

    case 'in':
      if (!Array.isArray(targetValue)) return false
      return targetValue.some(t => {
        if (recordValue instanceof Date && t instanceof Date) {
          return recordValue.getTime() === t.getTime()
        }
        return recordValue === t
      })

    case 'not-in':
      if (!Array.isArray(targetValue)) return true
      return !targetValue.some(t => {
        if (recordValue instanceof Date && t instanceof Date) {
          return recordValue.getTime() === t.getTime()
        }
        return recordValue === t
      })

    case 'array-contains':
      if (!Array.isArray(recordValue)) return false
      return recordValue.some(item => {
        if (item instanceof Date && targetValue instanceof Date) {
          return item.getTime() === targetValue.getTime()
        }
        return item === targetValue
      })

    case 'array-contains-any':
      if (!Array.isArray(recordValue) || !Array.isArray(targetValue)) return false
      return targetValue.some(target => recordValue.includes(target))

    case 'between':
      if (!Array.isArray(targetValue) || targetValue.length !== 2) return false
      const [min, max] = targetValue;
      if (recordValue instanceof Date) {
        const val = recordValue.getTime();
        const minVal = min instanceof Date ? min.getTime() : min;
        const maxVal = max instanceof Date ? max.getTime() : max;
        return val >= minVal && val <= maxVal
      }
      return recordValue >= min && recordValue <= max

    default:
      return false
  }
}

function matchesAllFilters(record, filters) {
  if (!filters || !filters.length) return true

  return filters.every(filter => {
    const recordValue = getNestedValue(record, filter.field);
    return evaluateCondition(recordValue, filter.operator, filter.value)
  })
}

function compareValues$1(a, b) {
  if (a === b) return 0
  if (a === undefined || a === null) return 1
  if (b === undefined || b === null) return -1
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b
  }
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() - b.getTime()
  }
  return a.toString().localeCompare(b.toString())
}

function get(options = { keys: false }) {
  if (options && typeof options === 'object' && !Array.isArray(options)) {
    if (!options.hasOwnProperty('keys')) {
      options.keys = false;
    }
  }

  // get collection
  this.getCollection = () => {
    let collectionName = this.collectionName;
    let orderByClauses = this.orderByClauses || [];
    let queryFilters = this.queryFilters || [];
    let colSelectionCriteria = options.filter;
    let limitBy = this.limitBy;

    // Fallback to legacy single orderByProperty if orderByClauses empty
    if (!orderByClauses.length && this.orderByProperty) {
      orderByClauses.push({
        property: this.orderByProperty,
        direction: this.orderByDirection || 'asc'
      });
    }

    let collection = [];
    return this.lf[collectionName]
      .iterate((value, key) => {
        let collectionItem = options.keys ? { key, data: value } : value;

        // 1. Check legacy filter
        if (colSelectionCriteria && !isSubset(value, colSelectionCriteria)) {
          return
        }

        // 2. Check modern query filters (.where())
        if (queryFilters.length && !matchesAllFilters(value, queryFilters)) {
          return
        }

        collection.push(collectionItem);
      })
      .then(() => {
        let logMessage = `Got "${collectionName}" collection`;

        // Sort collection using multi-clause comparator
        if (orderByClauses.length) {
          logMessage += `, ordered by ${orderByClauses.map(c => `"${c.property}" (${c.direction})`).join(', ')}`;
          collection.sort((itemA, itemB) => {
            const a = options.keys ? itemA.data : itemA;
            const b = options.keys ? itemB.data : itemB;

            for (const clause of orderByClauses) {
              const valA = a[clause.property];
              const valB = b[clause.property];
              const diff = compareValues$1(valA, valB);
              if (diff !== 0) {
                return clause.direction === 'desc' ? -diff : diff
              }
            }
            return 0
          });
        }

        // limit
        if (limitBy) {
          logMessage += `, limited to ${limitBy}`;
          collection = collection.slice(0, limitBy);
        }

        logMessage += `:`;
        logger.log.call(this, logMessage, collection);
        reset.call(this);
        return collection
      })
  };

  // get document
  this.getDocument = () => {
    let collectionName = this.collectionName;
    let docSelectionCriteria = this.docSelectionCriteria;

    let collection = [];
    let document = null;

    // get document by criteria
    this.getDocumentByCriteria = () => {
      return this.lf[collectionName]
        .iterate((value, key) => {
          if (isSubset(value, docSelectionCriteria)) {
            collection.push(options.keys ? { key, data: value } : value);
          }
        })
        .then(() => {
          if (!collection.length) {
            logger.error.call(
              this,
              `Could not find Document in "${collectionName}" collection with criteria: ${JSON.stringify(docSelectionCriteria)}`
            );
            reset.call(this);
            if (this.config && this.config.rejectOnNotFound) {
              return Promise.reject(new Error(`Document not found in "${collectionName}"`))
            }
            return null
          } else {
            document = collection[0];
            logger.log.call(this, `Got Document with ${JSON.stringify(docSelectionCriteria)}:`, document);
            reset.call(this);
            return document
          }
        })
    };

    // get document by key
    this.getDocumentByKey = () => {
      return this.lf[collectionName]
        .getItem(docSelectionCriteria)
        .then(value => {
          if (value !== null && value !== undefined) {
            document = options.keys ? { key: docSelectionCriteria, data: value } : value;
            logger.log.call(this, `Got Document with key ${JSON.stringify(docSelectionCriteria)}:`, document);
            reset.call(this);
            return document
          } else {
            logger.error.call(
              this,
              `Could not find Document in "${collectionName}" collection with Key: ${JSON.stringify(docSelectionCriteria)}`
            );
            reset.call(this);
            if (this.config && this.config.rejectOnNotFound) {
              return Promise.reject(new Error(`Document not found with key "${docSelectionCriteria}"`))
            }
            return null
          }
        })
        .catch(err => {
          logger.error.call(
            this,
            `Could not find Document in "${collectionName}" collection with Key: ${JSON.stringify(docSelectionCriteria)}`
          );
          reset.call(this);
          if (this.config && this.config.rejectOnNotFound) {
            throw err
          }
          return null
        })
    };

    if (typeof docSelectionCriteria === 'object') {
      return this.getDocumentByCriteria()
    } else {
      return this.getDocumentByKey()
    }
  };

  // check for user errors
  if (!(typeof options === 'object' && !Array.isArray(options))) {
    this.userErrors.push(
      'Data passed to .get() must be an object. Not an array, string, number or boolean. The object must contain a "keys" property set to true or false, e.g. { keys: true }'
    );
  } else {
    if (typeof options.keys !== 'boolean') {
      this.userErrors.push('Property "keys" passed into get() method must be assigned a boolean value (true or false).');
    }
  }

  if (!this.userErrors.length) {
    let currentSelectionLevel = selectionLevel.call(this);

    if (currentSelectionLevel === 'collection') {
      return this.getCollection()
    } else if (currentSelectionLevel === 'doc') {
      return this.getDocument()
    }
  } else {
    showUserErrors.call(this);
    return null
  }
}

/**
 * Cryptographically secure, ordered UUID generator without external dependencies.
 * Resolves vulnerability GHSA-w5hq-g745-h8pq and eliminates deprecated uuid dependency.
 */
function generateKey() {
  // 1. Check for modern standard crypto.randomUUID
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  // 2. Check for Web Crypto API crypto.getRandomValues
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    // Set version 4 and variant RFC4122
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
  }

  // 3. Fallback using timestamp + random (legacy environments)
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 10);
  const randomPart2 = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${randomPart}-${randomPart2}`
}

var UUID = {
  generate: generateKey
};

function success(message, data) {
  reset.call(this);
  logger.log.call(this, message, data);
  return  {
    success: true,
    message: message,
    data: data
  }
}

function error(message) {
  reset.call(this);
  logger.error.call(this, message);
  return (`Error: ${ message }`)
}

function add(data, keyProvided) {
  // check for user errors
  if (!data) {
    this.userErrors.push('No data specified in add() method. You must use an object, e.g { id: 1, name: "Bill", age: 47 }');
  } else if (!(typeof data === 'object' && !(data instanceof Array))) {
    this.userErrors.push('Data passed to .add() must be an object. Not an array, string, number or boolean.');
  }

  // no user errors, do the add
  if (!this.userErrors.length) {
    const collectionName = this.collectionName;
    const isAutoIncrement =
      (this.collectionOptions && this.collectionOptions[collectionName] && this.collectionOptions[collectionName].autoIncrement) ||
      (this.config && this.config.autoIncrement);

    const perform = async () => {
      let key = null;

      if (keyProvided) {
        key = keyProvided;
      } else if (isAutoIncrement) {
        const metaStore = this.lf['__localbase_metadata__'];
        const seqKey = `seq:${collectionName}`;
        let currentSeq = (await metaStore.getItem(seqKey)) || 0;
        currentSeq += 1;
        await metaStore.setItem(seqKey, currentSeq);
        key = currentSeq;
      } else {
        key = UUID.generate();
      }

      await this.lf[collectionName].setItem(key, data);
      if (this.syncChannel) {
        this.syncChannel.broadcast(`collection:${collectionName}:change`, { action: 'add', key, data });
      }
      reset.call(this);
      return success.call(
        this,
        `Document added to "${collectionName}" collection.`,
        { key, data }
      )
    };

    const lockKey = `${collectionName}:add`;
    return this.lock ? this.lock.acquire(lockKey, perform) : perform()
  } else {
    showUserErrors.call(this);
    return Promise.reject(error.call(this, 'Invalid arguments passed to .add()'))
  }
}

function isPlainObject(item) {
  return (
    item !== null &&
    typeof item === 'object' &&
    item.constructor === Object &&
    !(item instanceof Date) &&
    !(item instanceof RegExp) &&
    !(typeof Blob !== 'undefined' && item instanceof Blob) &&
    !(typeof File !== 'undefined' && item instanceof File)
  )
}

function setNestedProperty(target, path, value) {
  const keys = path.split('.');
  let current = target;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!current[key] || !isPlainObject(current[key])) {
      current[key] = {};
    }
    current = current[key];
  }
  current[keys[keys.length - 1]] = value;
}

function updateObject(target, ...sources) {
  if (!target || typeof target !== 'object') {
    target = {};
  }

  for (const source of sources) {
    if (!source || typeof source !== 'object') continue

    for (const key of Object.keys(source)) {
      const val = source[key];

      if (key.includes('.')) {
        // Dot notation support
        setNestedProperty(target, key, val);
      } else if (isPlainObject(val)) {
        if (!target[key] || !isPlainObject(target[key])) {
          target[key] = {};
        }
        updateObject(target[key], val);
      } else {
        target[key] = val;
      }
    }
  }

  return target
}

function update(docUpdates) {
  const collectionName = this.collectionName;
  const docSelectionCriteria = this.docSelectionCriteria;
  const lf = this.lf;

  return new Promise((resolve, reject) => {
    // check for user errors
    if (!docUpdates) {
      this.userErrors.push('No update object provided to update() method. Use an object e.g. { name: "William" }');
    } else if (!(typeof docUpdates == 'object' && !(docUpdates instanceof Array))) {
      this.userErrors.push('Data passed to .update() must be an object. Not an array, string, number or boolean.');
    }

    if (this.userErrors.length) {
      showUserErrors.call(this);
      return reject(error.call(this, 'Invalid arguments passed to .update()'))
    }

    // update document by criteria
    const updateDocumentByCriteria = () => {
      const lockKey = `${collectionName}:criteria:${JSON.stringify(docSelectionCriteria)}`;
      return (this.lock ? this.lock.acquire(lockKey, perform) : perform())

      function perform() {
        let docsToUpdate = [];
        return lf[collectionName]
          .iterate((value, key) => {
            if (isSubset(value, docSelectionCriteria)) {
              let newDocument = updateObject(value, docUpdates);
              docsToUpdate.push({ key, newDocument });
            }
          })
          .then(() => {
            if (!docsToUpdate.length) {
              const msg = `No Documents found in ${collectionName} Collection with criteria ${JSON.stringify(docSelectionCriteria)}.`;
              reject(error.call(this, msg));
              return
            }
            if (docsToUpdate.length > 1) {
              logger.warn.call(this, `Multiple documents (${docsToUpdate.length}) with ${JSON.stringify(docSelectionCriteria)} found for updating.`);
            }

            return Promise.all(
              docsToUpdate.map(docToUpdate => lf[collectionName].setItem(docToUpdate.key, docToUpdate.newDocument))
            ).then(() => {
              if (this.syncChannel) {
                this.syncChannel.broadcast(`collection:${collectionName}:change`, { action: 'update', criteria: docSelectionCriteria, docUpdates });
              }
              reset.call(this);
              resolve(
                success.call(
                  this,
                  `${docsToUpdate.length} Document${docsToUpdate.length > 1 ? 's' : ''} in "${collectionName}" collection with ${JSON.stringify(docSelectionCriteria)} updated.`,
                  docUpdates
                )
              );
            })
          })
          .catch(err => {
            reset.call(this);
            reject(error.call(this, `Could not update Documents in ${collectionName} Collection: ${err.message || err}`));
          })
      }
    };

    // update document by key
    const updateDocumentByKey = () => {
      const lockKey = `${collectionName}:${docSelectionCriteria}`;
      return (this.lock ? this.lock.acquire(lockKey, perform.bind(this)) : perform.call(this))

      function perform() {
        return lf[collectionName]
          .getItem(docSelectionCriteria)
          .then(value => {
            if (value === null || value === undefined) {
              const msg = `No Document found in "${collectionName}" collection with key ${JSON.stringify(docSelectionCriteria)}`;
              reset.call(this);
              reject(error.call(this, msg));
              return
            }
            const newDocument = updateObject(value, docUpdates);
            return lf[collectionName].setItem(docSelectionCriteria, newDocument).then(() => {
              if (this.syncChannel) {
                this.syncChannel.broadcast(`collection:${collectionName}:change`, { action: 'update', key: docSelectionCriteria, docUpdates });
              }
              reset.call(this);
              resolve(
                success.call(
                  this,
                  `Document in "${collectionName}" collection with key ${JSON.stringify(docSelectionCriteria)} updated.`,
                  newDocument
                )
              );
            })
          })
          .catch(err => {
            reset.call(this);
            reject(error.call(this, `No Document found in "${collectionName}" collection with key ${JSON.stringify(docSelectionCriteria)}`));
          })
      }
    };

    if (typeof docSelectionCriteria == 'object') {
      updateDocumentByCriteria.call(this);
    } else {
      updateDocumentByKey.call(this);
    }
  })
}

function set(newDocument, options = { keys: false }) {

  let collectionName = this.collectionName;
  let docSelectionCriteria = this.docSelectionCriteria;
  let currentSelectionLevel = selectionLevel.call(this);

  return new Promise((resolve, reject) => {

    // set collection
    this.setCollection = () => {
      this.lf[collectionName].clear().then(() => {
        if (!options.keys) {
          newDocument.forEach(doc => {
            this.add(doc);
          });
          resolve(
            success.call(
              this,
              `Collection "${ collectionName }" set with ${ newDocument.length } Documents.`, 
              newDocument
            )
          );
        }
        else {
          console.log('keys provided');
          // check that every document in array has a _key property
          let docsWithoutKey = 0;
          newDocument.forEach(doc => {
            if (!doc.hasOwnProperty('_key')) {
              docsWithoutKey++;
            }
          });
          if (docsWithoutKey) {
            reject(
              error.call(
                this,
                `Documents provided to .set() in an array must each have a _key property set to a string.`
              )
            );
          }
          else {
            newDocument.forEach(doc => {
              let key = doc._key;
              delete doc._key;
              this.add(doc, key);
            });
            resolve(
              success.call(
                this,
                `Collection "${ collectionName }" set with ${ newDocument.length } Documents.`, 
                newDocument
              )
            );
          }
        }
      }).catch(err => {
        reject(
          error.call(
            this,
            `Could not set ${ collectionName } Collection with data ${ JSON.stringify(newDocument) }.`
          )
        );
      });
    };

    // set document
    this.setDocument = () => {
      
      // set document by criteria
      this.setDocumentByCriteria = () => {
        let docsToSet = [];
        this.lf[collectionName].iterate((value, key) => {
          if (isSubset(value, docSelectionCriteria)) {
            docsToSet.push({ key, newDocument });
          }
        }).then(() => {
          if (!docsToSet.length) {
            reject(
              error.call(
                this,
                `No Documents found in ${ collectionName } Collection with criteria ${ JSON.stringify(docSelectionCriteria) }.`
              )
            );
          }
          if (docsToSet.length > 1) {
            logger.warn.call(this, `Multiple documents (${ docsToSet.length }) with ${ JSON.stringify(docSelectionCriteria) } found for setting.`);
          }
        }).then(() => {
          docsToSet.forEach((docToSet, index) => {
            this.lf[collectionName].setItem(docToSet.key, docToSet.newDocument).then(value => {
  
              if (index === (docsToSet.length - 1)) {
                resolve(
                  success.call(
                    this,
                    `${ docsToSet.length } Document${ docsToSet.length > 1 ? 's' : '' } in "${ collectionName }" collection with ${ JSON.stringify(docSelectionCriteria) } was set.`, 
                    newDocument
                  )
                );
              }
            }).catch(err => {
              reject(
                error.call(
                  this,
                  `Could not set ${ docsToSet.length } Documents in ${ collectionName } Collection.`
                )
              );
            });
          });
        });
      };
  
      // set document by key
      this.setDocumentByKey = () => {
        this.lf[collectionName].setItem(docSelectionCriteria, newDocument).then(value => {
          resolve(
            success.call(
              this,
              `Document in "${ collectionName }" collection with key ${ JSON.stringify(docSelectionCriteria) } was set.`,
              newDocument
            )
          );
        }).catch(err => {
          reject(
            error.call(
              this,
              `Document in "${ collectionName }" collection with key ${ JSON.stringify(docSelectionCriteria) } could not be set.`
            )
          );
        });
      };

      if (typeof docSelectionCriteria == 'object') {
        return this.setDocumentByCriteria()
      }
      else {
        return this.setDocumentByKey()
      }
    };

    // check for user errors
    if (!newDocument) {
      this.userErrors.push('No new Document object provided to set() method. Use an object e.g. { id: 1, name: "Bill", age: 47 }');
    }
    else if (currentSelectionLevel === 'doc') {
      if (!(typeof newDocument == 'object' && newDocument instanceof Array == false)) {
        this.userErrors.push('Data passed to .set() must be an object. Not an array, string, number or boolean.');
      }
    }
    else if (currentSelectionLevel === 'collection') {
      if (!(typeof newDocument == 'object' && newDocument instanceof Array == true)) {
        this.userErrors.push('Data passed to .set() must be an array of objects. Not an object, string, number or boolean.');
      }
    }

    if (!this.userErrors.length) {
      if (currentSelectionLevel == 'collection') {
        return this.setCollection()
      }
      else if (currentSelectionLevel == 'doc') {
        return this.setDocument()
      }
    }
    else {
      showUserErrors.call(this);
    }

  })
}

function deleteIt() {

  return new Promise((resolve, reject) => {

    // delete database
    this.deleteDatabase = () => {
      let dbName = this.dbName;

      indexedDB.deleteDatabase(dbName);
      resolve(
        success.call(
          this,
          `Database "${ dbName }" deleted.`,
          { database: dbName }
        )
      );
    };

    // delete collection
    this.deleteCollection = () => {
      let dbName = this.dbName;
      let collectionName = this.collectionName;

      // we can only delete one collection at a time, which is why we need a queue

      this.addToDeleteCollectionQueue = (collectionName) => {
        this.deleteCollectionQueue.queue.push(collectionName);
        this.runDeleteCollectionQueue();
      };

      this.runDeleteCollectionQueue = () => {
        if (this.deleteCollectionQueue.running == false) {
          this.deleteCollectionQueue.running = true;
          this.deleteNextCollectionFromQueue();
        }
      };

      this.deleteNextCollectionFromQueue = () => {
        if (this.deleteCollectionQueue.queue.length) {
          let collectionToDelete = this.deleteCollectionQueue.queue[0];
          this.deleteCollectionQueue.queue.shift();

          this.lf[collectionToDelete].dropInstance({
            name        : dbName,
            storeName   : collectionToDelete
          }).then(() => {
            this.deleteNextCollectionFromQueue();
            resolve(
              success.call(
                this,
                `Collection "${ collectionToDelete }" deleted.`,
                { collection: collectionToDelete }
              )
            );
          }).catch(error => {
            reject(
              error.call(
                this,
                `Collection "${ collectionToDelete }" could not be deleted.`
              )
            );
          });
        }
        else {
          this.deleteCollectionQueue.running = false;
        }
      };

      this.addToDeleteCollectionQueue(collectionName);
    };

    // delete document
    this.deleteDocument = () => {

      let collectionName = this.collectionName;
      let docSelectionCriteria = this.docSelectionCriteria;

      // delete document by criteria
      this.deleteDocumentByCriteria = () => {
        let keysForDeletion = [];
        this.lf[collectionName].iterate((value, key) => {
          if (isSubset(value, docSelectionCriteria)) {
            keysForDeletion.push(key);
          }
        }).then(() => {
          if (!keysForDeletion.length) {
            reject(
              error.call(
                this,
                `No Documents found in "${ collectionName }" Collection with criteria ${ JSON.stringify(docSelectionCriteria) }. No documents deleted.`
              )
            );
          }
          if (keysForDeletion.length > 1) {
            logger.warn.call(this, `Multiple documents (${ keysForDeletion.length }) with ${ JSON.stringify(docSelectionCriteria) } found.`);
          }
        }).then(() => {
          return Promise.all(
            keysForDeletion.map(key => this.lf[collectionName].removeItem(key))
          ).then(() => {
            reset.call(this);
            resolve(
              success.call(
                this,
                `${ keysForDeletion.length } Document${ keysForDeletion.length > 1 ? 's' : '' } with ${ JSON.stringify(docSelectionCriteria) } deleted.`,
                { keys: keysForDeletion }
              )
            );
          }).catch(err => {
            reset.call(this);
            reject(
              error.call(
                this,
                `Could not delete ${ keysForDeletion.length } Documents in ${ collectionName } Collection: ${ err.message || err }`
              )
            );
          })
        });
      };

      // delete document by key
      this.deleteDocumentByKey = () => {
        this.lf[collectionName].getItem(docSelectionCriteria).then(value => {
          if (value) {
            this.lf[collectionName].removeItem(docSelectionCriteria).then(() => {
              reset.call(this);
              resolve(
                success.call(
                  this,
                  `Document with key ${ JSON.stringify(docSelectionCriteria) } deleted.`,
                  { key: docSelectionCriteria }
                )
              );
            }).catch(function(err) {
              reset.call(this);
              reject(
                error.call(
                  this,
                  `No Document found in "${ collectionName }" Collection with key ${ JSON.stringify(docSelectionCriteria) }. No document was deleted.`
                )
              );
            });
          }
          else {
            reset.call(this);
            reject(
              error.call(
                this,
                `No Document found in "${ collectionName }" Collection with key ${ JSON.stringify(docSelectionCriteria) }. No document was deleted.`
              )
            );
          }
        });

      };

      if (typeof docSelectionCriteria == 'object') {
        return this.deleteDocumentByCriteria()
      }
      else {
        return this.deleteDocumentByKey()
      }
    };
    
    if (!this.userErrors.length) {
      let currentSelectionLevel = selectionLevel.call(this);
  
      if (currentSelectionLevel == 'db') {
        return this.deleteDatabase()
      }
      else if (currentSelectionLevel == 'collection') {
        return this.deleteCollection()
      }
      else if (currentSelectionLevel == 'doc') {
        return this.deleteDocument()
      }
    }
    else {
      showUserErrors.call(this);
    }

  })

}

function count() {
  const collectionName = this.collectionName;
  const queryFilters = this.queryFilters || [];

  if (!collectionName) {
    this.userErrors.push('No collection name specified before calling .count()');
    showUserErrors.call(this);
    return Promise.reject(new Error('No collection specified'))
  }

  // Fast-path: O(1) count if no filters applied
  if (!queryFilters.length) {
    return this.lf[collectionName].length().then(len => {
      reset.call(this);
      return len
    })
  }

  // Filtered count without accumulating records into memory
  let total = 0;
  return this.lf[collectionName]
    .iterate((value) => {
      if (matchesAllFilters(value, queryFilters)) {
        total++;
      }
    })
    .then(() => {
      reset.call(this);
      return total
    })
}

function compareValues(a, b) {
  if (a === b) return 0
  if (a === undefined || a === null) return 1
  if (b === undefined || b === null) return -1
  if (typeof a === 'number' && typeof b === 'number') return a - b
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime()
  return a.toString().localeCompare(b.toString())
}

async function paginate(options = { page: 1, limit: 10 }) {
  const collectionName = this.collectionName;
  const queryFilters = [...(this.queryFilters || [])];
  const orderByClauses = [...(this.orderByClauses || [])];

  const page = Math.max(1, parseInt(options.page || 1, 10));
  const limit = Math.max(1, parseInt(options.limit || options.pageSize || 10, 10));
  const skip = (page - 1) * limit;

  if (!collectionName) {
    this.userErrors.push('No collection name specified before calling .paginate()');
    showUserErrors.call(this);
    return Promise.reject(new Error('No collection specified'))
  }

  let totalRows = 0;
  let matchedRows = [];

  await this.lf[collectionName].iterate((value, key) => {
    if (matchesAllFilters(value, queryFilters)) {
      totalRows++;
      matchedRows.push(options.keys ? { key, data: value } : value);
    }
  });

  // Sort if order clauses defined
  if (orderByClauses.length) {
    matchedRows.sort((itemA, itemB) => {
      const a = options.keys ? itemA.data : itemA;
      const b = options.keys ? itemB.data : itemB;

      for (const clause of orderByClauses) {
        const valA = a[clause.property];
        const valB = b[clause.property];
        const diff = compareValues(valA, valB);
        if (diff !== 0) {
          return clause.direction === 'desc' ? -diff : diff
        }
      }
      return 0
    });
  }

  const rows = matchedRows.slice(skip, skip + limit);
  const totalPages = Math.ceil(totalRows / limit);

  reset.call(this);

  return {
    total_rows: totalRows,
    row_limit: limit,
    total_page: totalPages,
    current_page: page,
    rows: rows
  }
}

function exists() {
  const collectionName = this.collectionName;
  const docSelectionCriteria = this.docSelectionCriteria;

  if (!collectionName || !docSelectionCriteria) {
    this.userErrors.push('Both collection and doc criteria must be specified before calling .exists()');
    showUserErrors.call(this);
    return Promise.reject(new Error('Invalid selection for .exists()'))
  }

  if (typeof docSelectionCriteria === 'string') {
    return this.lf[collectionName].getItem(docSelectionCriteria).then(val => {
      reset.call(this);
      return val !== null && val !== undefined
    })
  }

  // Object criteria search
  let found = false;
  return this.lf[collectionName]
    .iterate(val => {
      if (isSubset(val, docSelectionCriteria)) {
        found = true;
        return true // Stop iteration early
      }
    })
    .then(() => {
      reset.call(this);
      return found
    })
}

function upsert(data) {
  const collectionName = this.collectionName;
  const docSelectionCriteria = this.docSelectionCriteria;
  const lf = this.lf;

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    this.userErrors.push('Data passed to .upsert() must be an object, e.g. { name: "Bill", age: 47 }');
    showUserErrors.call(this);
    return Promise.reject(error.call(this, 'Invalid arguments passed to .upsert()'))
  }

  if (!collectionName || !docSelectionCriteria) {
    this.userErrors.push('Both collection and doc criteria must be specified before calling .upsert()');
    showUserErrors.call(this);
    return Promise.reject(error.call(this, 'Invalid selection for .upsert()'))
  }

  const lockKey = typeof docSelectionCriteria === 'string'
    ? `${collectionName}:${docSelectionCriteria}`
    : `${collectionName}:criteria:${JSON.stringify(docSelectionCriteria)}`;

  const perform = async () => {
    try {
      if (typeof docSelectionCriteria === 'string') {
        const key = docSelectionCriteria;
        const existing = await lf[collectionName].getItem(key);

        let finalDoc;
        let actionMessage;
        if (existing !== null && existing !== undefined) {
          finalDoc = updateObject(existing, data);
          actionMessage = `Document in "${collectionName}" with key "${key}" was updated via upsert.`;
        } else {
          finalDoc = data;
          actionMessage = `Document in "${collectionName}" with key "${key}" was inserted via upsert.`;
        }

        await lf[collectionName].setItem(key, finalDoc);
        if (this.syncChannel) {
          this.syncChannel.broadcast(`collection:${collectionName}:change`, { action: 'upsert', key, data: finalDoc });
        }
        reset.call(this);
        return success.call(this, actionMessage, { key, data: finalDoc })
      } else {
        // Criteria-based upsert
        let matchedKey = null;
        let matchedDoc = null;

        await lf[collectionName].iterate((value, key) => {
          if (isSubset(value, docSelectionCriteria)) {
            matchedKey = key;
            matchedDoc = value;
            return true // Stop iteration
          }
        });

        let finalKey;
        let finalDoc;
        let actionMessage;

        if (matchedKey) {
          finalKey = matchedKey;
          finalDoc = updateObject(matchedDoc, data);
          actionMessage = `Document in "${collectionName}" matching criteria was updated via upsert.`;
        } else {
          finalKey = generateKey();
          finalDoc = { ...docSelectionCriteria, ...data };
          actionMessage = `New document created in "${collectionName}" via upsert.`;
        }

        await lf[collectionName].setItem(finalKey, finalDoc);
        if (this.syncChannel) {
          this.syncChannel.broadcast(`collection:${collectionName}:change`, { action: 'upsert', key: finalKey, data: finalDoc });
        }
        reset.call(this);
        return success.call(this, actionMessage, { key: finalKey, data: finalDoc })
      }
    } catch (err) {
      reset.call(this);
      throw error.call(this, `Upsert failed in "${collectionName}": ${err.message || err}`)
    }
  };

  return this.lock ? this.lock.acquire(lockKey, perform) : perform()
}

function onSnapshot(callback) {
  if (typeof callback !== 'function') {
    this.userErrors.push('Callback passed to .onSnapshot() must be a function.');
    showUserErrors.call(this);
    return () => {}
  }

  const currentSelectionLevel = selectionLevel.call(this);
  const collectionName = this.collectionName;
  const docSelectionCriteria = this.docSelectionCriteria;
  const queryFilters = [...(this.queryFilters || [])];
  const orderByClauses = [...(this.orderByClauses || [])];
  const limitBy = this.limitBy;

  if (!collectionName) {
    this.userErrors.push('No collection specified before calling .onSnapshot()');
    showUserErrors.call(this);
    return () => {}
  }

  let isSubscribed = true;

  // Helper to re-fetch snapshot
  const fetchAndNotify = async (changeEvent = null) => {
    if (!isSubscribed) return

    try {
      if (currentSelectionLevel === 'doc') {
        const query = this.collection(collectionName).doc(docSelectionCriteria);
        const doc = await query.get();
        if (isSubscribed) {
          callback(doc, changeEvent);
        }
      } else {
        // Collection level query
        const query = this.collection(collectionName);
        for (const f of queryFilters) {
          query.where(f.field, f.operator, f.value);
        }
        for (const o of orderByClauses) {
          query.orderBy(o.property, o.direction);
        }
        if (limitBy) {
          query.limit(limitBy);
        }
        const collection = await query.get();
        if (isSubscribed) {
          callback(collection, changeEvent);
        }
      }
    } catch (err) {
      console.error(`Error in onSnapshot listener for "${collectionName}":`, err);
    }
  };

  // 1. Initial snapshot fetch
  fetchAndNotify({ action: 'initial' });

  // 2. Subscribe to mutation events
  const eventName = `collection:${collectionName}:change`;
  const unsubscribeEvent = this.events.on(eventName, (change) => {
    fetchAndNotify(change);
  });

  // Clean current builder state
  reset.call(this);

  // 3. Return unsubscribe function
  return () => {
    isSubscribed = false;
    unsubscribeEvent();
  }
}

/**
 * Lightweight JSON to CSV and CSV to JSON converter.
 */
function jsonToCsv(data) {
  if (!Array.isArray(data) || !data.length) {
    return ''
  }

  // Extract all unique headers across all objects
  const headers = Array.from(
    new Set(
      data.reduce((keys, obj) => {
        if (obj && typeof obj === 'object') {
          return keys.concat(Object.keys(obj))
        }
        return keys
      }, [])
    )
  );

  const escapeField = (val) => {
    if (val === null || val === undefined) return ''
    if (typeof val === 'object') {
      val = JSON.stringify(val);
    }
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  };

  const csvRows = [headers.map(escapeField).join(',')];

  for (const item of data) {
    const row = headers.map((header) => escapeField(item ? item[header] : ''));
    csvRows.push(row.join(','));
  }

  return csvRows.join('\n')
}

function csvToJson(csvString) {
  if (!csvString || typeof csvString !== 'string') return []

  const lines = csvString.trim().split(/\r?\n/);
  if (lines.length < 2) return []

  // Parse header
  const parseRow = (row) => {
    const entries = [];
    let current = '';
    let insideQuotes = false;

    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      if (char === '"' && (i === 0 || row[i - 1] !== '\\')) {
        if (insideQuotes && row[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === ',' && !insideQuotes) {
        entries.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    entries.push(current);
    return entries
  };

  const headers = parseRow(lines[0]);
  const result = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseRow(lines[i]);
    const obj = {};
    headers.forEach((header, index) => {
      let val = values[index] !== undefined ? values[index] : '';
      // Attempt numeric parse
      if (val !== '' && !isNaN(val)) {
        val = Number(val);
      } else if (val === 'true') {
        val = true;
      } else if (val === 'false') {
        val = false;
      }
      obj[header] = val;
    });
    result.push(obj);
  }

  return result
}

async function exportData(options = { format: 'json' }) {
  const collectionName = this.collectionName;
  const format = options.format || 'json';

  // Helper to trigger browser download
  const triggerDownload = (content, filename, mimeType) => {
    if (typeof document !== 'undefined' && document.createElement) {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  // 1. Single Collection Export
  if (collectionName) {
    const docs = await this.collection(collectionName).get({ keys: options.keys || false });
    reset.call(this);

    if (format === 'csv') {
      const csvStr = jsonToCsv(docs);
      if (options.download) {
        triggerDownload(csvStr, options.filename || `${collectionName}.csv`, 'text/csv');
      }
      return csvStr
    }

    // Default JSON
    const jsonStr = options.pretty ? JSON.stringify(docs, null, 2) : JSON.stringify(docs);
    if (options.download) {
      triggerDownload(jsonStr, options.filename || `${collectionName}.json`, 'application/json');
    }
    return options.raw ? docs : jsonStr
  }

  // 2. Full Database Export
  const dbDump = {};
  const collectionNames = Object.keys(this.lf).filter(
    (name) => name !== '__localbase_metadata__'
  );

  for (const col of collectionNames) {
    dbDump[col] = await this.collection(col).get({ keys: options.keys || false });
  }

  reset.call(this);

  const jsonStr = options.pretty ? JSON.stringify(dbDump, null, 2) : JSON.stringify(dbDump);
  if (options.download) {
    triggerDownload(jsonStr, options.filename || `${this.dbName}_backup.json`, 'application/json');
  }

  return options.raw ? dbDump : jsonStr
}

async function importData(payload, options = { overwrite: false }) {
  const collectionName = this.collectionName;

  let parsedData = payload;
  if (typeof payload === 'string') {
    const trimmed = payload.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      parsedData = JSON.parse(trimmed);
    } else {
      // CSV format
      parsedData = csvToJson(trimmed);
    }
  }

  // 1. Single Collection Import
  if (collectionName) {
    if (!Array.isArray(parsedData)) {
      throw new Error(`Data imported into collection "${collectionName}" must be an array of documents.`)
    }

    if (options.overwrite) {
      await this.collection(collectionName).delete();
    }

    let importedCount = 0;
    for (const item of parsedData) {
      const key = item._key || item.key || (item.id !== undefined ? String(item.id) : generateKey());
      const docData = { ...item };
      delete docData._key;
      delete docData.key;
      await this.collection(collectionName).doc(key).set(docData);
      importedCount++;
    }

    reset.call(this);
    return { collection: collectionName, imported: importedCount }
  }

  // 2. Full Database Import
  if (typeof parsedData !== 'object' || Array.isArray(parsedData) || parsedData === null) {
    throw new Error('Full database import requires an object with collection names as keys.')
  }

  const results = {};
  for (const col of Object.keys(parsedData)) {
    const colData = parsedData[col];
    if (Array.isArray(colData)) {
      if (options.overwrite) {
        await this.collection(col).delete();
      }
      for (const item of colData) {
        const key = item._key || item.key || (item.id !== undefined ? String(item.id) : generateKey());
        const docData = { ...item };
        delete docData._key;
        delete docData.key;
        await this.collection(col).doc(key).set(docData);
      }
      results[col] = colData.length;
    }
  }

  reset.call(this);
  return results
}

async function getVersion() {
  const metaStore = this.lf['__localbase_metadata__'] || localForage.createInstance({
    driver: localForage.INDEXEDDB,
    name: this.dbName,
    storeName: '__localbase_metadata__'
  });
  const currentVersion = (await metaStore.getItem('__db_version__')) || 1;
  return currentVersion
}

async function version(targetVersion, migrationFn) {
  if (typeof targetVersion !== 'number' || targetVersion < 1) {
    throw new Error('Target version passed to db.version() must be a positive integer.')
  }

  const metaStore = this.lf['__localbase_metadata__'] || localForage.createInstance({
    driver: localForage.INDEXEDDB,
    name: this.dbName,
    storeName: '__localbase_metadata__'
  });
  this.lf['__localbase_metadata__'] = metaStore;

  const currentVersion = (await metaStore.getItem('__db_version__')) || 1;

  if (currentVersion < targetVersion) {
    if (typeof migrationFn === 'function') {
      await migrationFn(this);
    }
    await metaStore.setItem('__db_version__', targetVersion);
  }

  return targetVersion
}

/**
 * Lightweight per-key asynchronous lock to serialize concurrent read-modify-write
 * operations on the same document key, preventing race condition data overwrites.
 */
class AsyncLock {
  constructor() {
    this.queues = new Map();
  }

  acquire(key, task) {
    const queueKey = String(key);
    const current = this.queues.get(queueKey) || Promise.resolve();

    const next = current
      .then(() => task())
      .catch((err) => {
        // Propagate error to caller without deadlocking subsequent tasks in queue
        throw err
      })
      .finally(() => {
        if (this.queues.get(queueKey) === next) {
          this.queues.delete(queueKey);
        }
      });

    this.queues.set(queueKey, next);
    return next
  }
}

class EventEmitter {
  constructor() {
    this.events = new Map();
  }

  on(eventName, listener) {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, new Set());
    }
    this.events.get(eventName).add(listener);

    // Unsubscribe helper
    return () => {
      this.off(eventName, listener);
    }
  }

  off(eventName, listener) {
    if (this.events.has(eventName)) {
      this.events.get(eventName).delete(listener);
      if (this.events.get(eventName).size === 0) {
        this.events.delete(eventName);
      }
    }
  }

  emit(eventName, ...args) {
    if (this.events.has(eventName)) {
      for (const listener of this.events.get(eventName)) {
        try {
          listener(...args);
        } catch (err) {
          console.error(`Error in event listener for "${eventName}":`, err);
        }
      }
    }
  }

  removeAllListeners(eventName) {
    if (eventName) {
      this.events.delete(eventName);
    } else {
      this.events.clear();
    }
  }
}

class SyncChannel {
  constructor(dbName, eventEmitter) {
    this.dbName = dbName;
    this.emitter = eventEmitter;
    this.channel = null;

    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.channel = new BroadcastChannel(`localbase_sync_${dbName}`);
        this.channel.onmessage = (event) => {
          const payload = event.data;
          if (payload && payload.db === this.dbName) {
            this.emitter.emit(payload.event, payload.data, true /* fromRemote */);
          }
        };
      } catch (e) {
        // BroadcastChannel unavailable
      }
    }
  }

  broadcast(eventName, data) {
    // 1. Emit locally
    this.emitter.emit(eventName, data, false /* fromRemote */);

    // 2. Broadcast across tabs/windows
    if (this.channel) {
      try {
        this.channel.postMessage({
          db: this.dbName,
          event: eventName,
          data: data,
          timestamp: Date.now()
        });
      } catch (e) {
        // Ignore serialization failure
      }
    }
  }

  close() {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
  }
}

// Localbase
class Localbase {
  constructor(dbName) {

    // properties
    this.dbName = dbName;
    this.lf = {}; // where we store our localForage instances
    this.collectionName = null;
    this.orderByProperty = null;
    this.orderByDirection = null;
    this.orderByClauses = [];
    this.queryFilters = [];
    this.limitBy = null;
    this.docSelectionCriteria = null;

    // queues
    this.lock = new AsyncLock();
    this.events = new EventEmitter();
    this.syncChannel = new SyncChannel(this.dbName, this.events);
    this.deleteCollectionQueue = {
      queue: [],
      running: false
    };

    // config
    this.config = {
      debug: true
    };

    // user errors - e.g. wrong type or no value passed to a method
    this.userErrors = [];

    // api - selectors
    this.collection = collection.bind(this);
    this.doc = doc.bind(this);

    // api - filters
    this.orderBy = orderBy.bind(this);
    this.limit = limit.bind(this);
    this.offset = offset.bind(this);
    this.skip = offset.bind(this);
    this.where = where.bind(this);

    // api - actions
    this.get = get.bind(this);
    this.add = add.bind(this);
    this.update = update.bind(this);
    this.set = set.bind(this);
    this.delete = deleteIt.bind(this);
    this.count = count.bind(this);
    this.paginate = paginate.bind(this);
    this.exists = exists.bind(this);
    this.upsert = upsert.bind(this);
    this.onSnapshot = onSnapshot.bind(this);
    this.export = exportData.bind(this);
    this.import = importData.bind(this);
    this.version = version.bind(this);
    this.getVersion = getVersion.bind(this);

  }
}

module.exports = Localbase;
//# sourceMappingURL=index.cjs.map
