# Localbase <!-- omit in toc -->

A Firebase-Style Database ... Offline!

Localbase gives you an offline database with the simplicity & power of Firebase, all stored in the user's browser (in an IndexedDB database).

You can create as many databases as you like.

Databases are organised into Collections and Documents (just like Firebase Cloud Firestore).

- **Databases** contain **Collections** (e.g. `users`)
- **Collections** contain **Documents** (e.g. `{ id: 1, name: 'Bill', age: 47 }`

Localbase is built on top of [LocalForage](https://github.com/localForage/localForage).

**Note:** this is very much a work in progress, but please feel free to play around with it.

## Contents <!-- omit in toc -->

- [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Initialisation](#initialisation)
- [Quick Start](#quick-start)
  - [Add a document to a collection](#add-a-document-to-a-collection)
  - [Get a collection](#get-a-collection)
- [Adding Data](#adding-data)
  - [Add a document to a collection](#add-a-document-to-a-collection-1)
  - [Update a document](#update-a-document)
  - [Set a document (overwrite)](#set-a-document-overwrite)
- [Getting Data](#getting-data)
  - [Get a collection](#get-a-collection-1)
  - [Order a collection](#order-a-collection)
  - [Limit a collection](#limit-a-collection)
  - [Get a document](#get-a-document)
- [Deleting Data](#deleting-data)
  - [Delete a document](#delete-a-document)
  - [Delete a collection](#delete-a-collection)
  - [Delete a database](#delete-a-database)
- [Advanced Usage with Keys](#advanced-usage-with-keys)
  - [Add a document & specify your own key](#add-a-document--specify-your-own-key)
  - [Get, Update, Set or Delete a Document by key (instead of by document criteria)](#get-update-set-or-delete-a-document-by-key-instead-of-by-document-criteria)
  - [Get a Collection and return the keys along with the data.](#get-a-collection-and-return-the-keys-along-with-the-data)


## Getting Started

### Installation
```
npm install localbase --save
```

### Initialisation
```javascript
import Localbase from 'localbase'
```
```javascript
let db = new Localbase('db')
```

## Quick Start
### Add a document to a collection
Get started by adding a document to a collection. Just specify the collection name with the `collection` method (the collection will be created automatically) then specify the document you want to add with the `add` method: 
```javascript
db.collection('users').add({
  id: 1,
  name: 'Bill',
  age: 47
})
```
Simples!

### Get a collection
Once you've added some data to a collection, you can get the whole collection with the `get` method:
```javascript
db.collection('users').get().then(users => {
  console.log(users)
})

//  [
//    { id: 1, name: 'Bill', age: 47 },
//    { id: 2, name: 'Paul', age: 34 }
//  ]
```

## Adding Data

### Add a document to a collection

Add a new document to a collection.

```javascript
db.collection('users').add({
  id: 1,
  name: 'Bill',
  age: 47
})
```

### Update a document

Update an existing document. Just pass an object with a field and value (usually id) to match the document. Then pass in only the fields you want to update with the `update` method.

```javascript
db.collection('users').doc({ id: 1 }).update({
  name: 'William'
})

//  [
//    { id: 1, name: 'William', age: 47 },
//    { id: 2, name: 'Paul', age: 34 }
//  ]
```

**Note:** if more than one document is matched by your criteria e.g `.doc({ gender: 'male' })` then **all** matched documents will be updated. 

### Set a document (overwrite)

Overwrite an existing document. This will completely overwrite the selected document, so all required fields should be passed into the `set` method.

```javascript
db.collection('users').doc({ id: 2 }).set({
  id: 4, 
  name: 'Pauline',
  age: 27
})

//  [
//    { id: 1, name: 'William', age: 47 },
//    { id: 4, name: 'Pauline', age: 27 }
//  ]
```

**Note:** if more than one document is matched by your criteria e.g `.doc({ gender: 'male' })` then **all** matched documents will be overwritten. 

## Getting Data

### Get a collection

Get all items from a collection. The collection will be returned in an array.

```javascript
db.collection('users').get().then(users => {
  console.log(users)
})

//  [
//    { id: 1, name: 'Bill', age: 47 },
//    { id: 2, name: 'Paul', age: 34 }
//  ]
```

### Order a collection

Get a collection and order it by a particular field (ascending).

```javascript
db.collection('users').orderBy('age').get().then(users => {
  console.log('users: ', users)
})

//  [
//    { id: 2, name: 'Paul', age: 34 },
//    { id: 1, name: 'Bill', age: 47 }
//  ]
```

Get a collection and order it by a particular field (descending).

```javascript
db.collection('users').orderBy('name', 'desc').get().then(users => {
  console.log('users: ', users)
})

//  [
//    { id: 2, name: 'Paul', age: 34 },
//    { id: 1, name: 'Bill', age: 47 }
//  ]
```

### Limit a collection

Order a collection & limit it to a particular number of documents.

```javascript
db.collection('users').orderBy('name', 'desc').limit(1).get().then(users => {
  console.log('users: ', users)
})

//  [
//    { id: 2, name: 'Paul', age: 34 }
//  ]
```


### Get a document

Get an individual document from a collection

```javascript
db.collection('users').doc({ id: 1 }).get().then(document => {
  console.log(document)
})

// { id: 1, name: 'Bill', age: 47 }
```

## Deleting Data

### Delete a document
Delete a document from a collection.
```javascript
db.collection('users').doc({ id: 1 }).delete()

//  [
//    { id: 2, name: 'Paul', age: 34 }
//  ]
```

**Note:** if more than one document is matched by your criteria e.g `.doc({ gender: 'male' })` then **all** matched documents will be deleted. 

### Delete a collection
Delete a collection and all documents contained in it.
```javascript
db.collection('users').delete()
```

### Delete a database
Delete a database and all collections contained in it.
```javascript
db.delete()
```

## Advanced Usage with Keys

Your documents are stored in an IndexedDB store with keys:

![IndexedDB Store - Keys](images/indexed-db-keys.png)

By default, Localbase generates random, ordered, unique IDs for these keys.

But you might want to take control of these keys. For example, you might want to:
- Specify your own key when you add a document
- Use the key for selecting a document (when getting, updating, setting or deleting a document) instead of using some document criteria
- Return all of the keys as well as the document fields, when getting a collection, e.g.
```javascript
[
  {
    key: 'mykey-2',
    data: {
      { id: 2, name: 'Paul', age: 34 }
    }
  },
  {
    key: 'mykey-1',
    data: {
      { id: 1, name: 'Bill', age: 47 }
    }
  }
]
```

You can do all this with Localbase:

### Add a document & specify your own key

After specifying your document data, pass in a key (to be used by the IndexedDB store) as a second parameter:

```javascript
db.collection('users').add({
  id: 1,
  name: 'Bill',
  age: 47
}, 'mykey-1')
```

Or, you can just use the `set` method:

```javascript
db.collection('users').doc('mykey-1').set({
  id: 1, 
  name: 'Bill',
  age: 47
})
```

Which would look like this in the IndexedDB:

![IndexedDB Store - Own Keys](images/indexed-db-own-keys.png)

### Get, Update, Set or Delete a Document by key (instead of by document criteria)

When selecting a document with the `doc` method, instead of passing in an object with a field name and value, just pass in a string (or integer) with your key:
```javascript
// get document by key
db.collection('users').doc('mykey-1').get().then(document => {
  console.log(document)
})

// update document by key
db.collection('users').doc('mykey-1').update({
  name: 'William'
})

// set document by key
db.collection('users').doc('mykey-2').set({
  id: 4, 
  name: 'Pauline',
  age: 27
})

// delete a document by key
db.collection('users').doc('mykey-1').delete()
```


### Get a Collection and return the keys along with the data.

When getting a collection, just pass `{ keys: true }` into the `get` method:

```javascript
db.collection('users').orderBy('name', 'desc').get({ keys: true }).then(users => {
  console.log('users: ', users)
})

//  [
//    {
//      key: 'mykey-2',
//      data: {
//        { id: 2, name: 'Paul', age: 34 }
//      }
//    },
//    {
//      key: 'mykey-1',
//      data: {
//        { id: 1, name: 'Bill', age: 47 }
//      }
//    }
//  ]
```