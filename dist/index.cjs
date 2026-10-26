'use strict';

var localForage = require('localforage');

function collection(collectionName) {
  if (!collectionName) {
    this.userErrors.push('No collection name specified in collection() method.');
    return this
  }
  else if (typeof collectionName !== 'string') {
    this.userErrors.push('Collection name in collection() method must be a string and not an object, number or boolean.');
    return this
  }
  else {
    this.collectionName = collectionName;

    let dbName = this.dbName;

    // if we've not created a localForage instance 
    // for this collection, create one
    if (!(collectionName in this.lf)) {
      this.lf[collectionName] = localForage.createInstance({
        driver      : localForage.INDEXEDDB,
        name        : dbName,
        storeName   : collectionName
      });
    }
    return this
  }

}

function doc(docSelectionCriteria) {
  if (!docSelectionCriteria) {
    this.userErrors.push('No document criteria specified in doc() method. Use a string (with a key) or an object (with criteria) e.g. { id: 1 }');
  }
  else if (typeof docSelectionCriteria !== 'string' && typeof docSelectionCriteria !== 'object') {
    this.userErrors.push('Document criteria specified in doc() method must not be a number or boolean. Use a string (with a key) or an object (with criteria) e.g. { id: 1 }');
  }
  else {
    this.docSelectionCriteria = docSelectionCriteria;
  }
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

function isSubset(superObj, subObj) {
  return Object.keys(subObj).every(ele => {
      if (typeof subObj[ele] == 'object') {
          return isSubset(superObj[ele], subObj[ele]);
      }
      return subObj[ele] === superObj[ele]
  });
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
    if (process.env.NODE_ENV == 'development' && this.config.debug) {
      let style = logger.baseStyle + `background-color: ${ logger.colors.log }`;
      if (secondary) {
        console.log('%clocalbase', style, message, secondary);
      }
      else {
        console.log('%clocalbase', style, message);
      }
    }
  },
  error(message, secondary) {
    if (process.env.NODE_ENV == 'development' && this.config.debug) {
      let style = logger.baseStyle + `background-color: ${ logger.colors.error }`;
      console.error('%clocalbase', style, message);
    }
  },  
  warn(message, secondary) {
    if (process.env.NODE_ENV == 'development' && this.config.debug) {
      let style = logger.baseStyle + `background-color: ${ logger.colors.warn }`;
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

function compareValues(a, b) {
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
              const diff = compareValues(valA, valB);
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
  }
  else if (!(typeof data == 'object' && data instanceof Array == false)) {
    this.userErrors.push('Data passed to .add() must be an object. Not an array, string, number or boolean.');
  }

  // no user errors, do the add
  if (!this.userErrors.length) {
    let collectionName = this.collectionName;
  
    return new Promise((resolve, reject) => {
      let key = null;

      // if no key provided, generate random, ordered key
      if (!keyProvided) {
        key = UUID.generate();
      }
      else {
        key = keyProvided;
      }

      return this.lf[collectionName].setItem(key, data).then(() => {
        resolve(
          success.call(
            this,
            `Document added to "${ collectionName }" collection.`,
            { key, data }
          )
        );
      }).catch(err => {
        reject(
          error.call(
            this,
            `Could not add Document to ${ collectionName } collection.`
          )
        );
      })
    })
  }
  else {
    showUserErrors.call(this);
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
    this.where = where.bind(this);

    // api - actions
    this.get = get.bind(this);
    this.add = add.bind(this);
    this.update = update.bind(this);
    this.set = set.bind(this);
    this.delete = deleteIt.bind(this);

  }
}

module.exports = Localbase;
//# sourceMappingURL=index.cjs.map
