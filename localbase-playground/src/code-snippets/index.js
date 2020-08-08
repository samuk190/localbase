let codeSnippetSections = [
  {
    sectionTitle: 'Adding Data',
    codeSnippets: [
      {
        id: 1,
        title: 'Add Document',
        running: true,
        code: 
`db.collection('users')
  .add({
    id: 1,
    name: 'Bill',
    age: 47
  })
db.collection('users')
  .add({
    id: 2,
    name: 'Paul',
    age: 34
  })`
      },
      {
        id: 2,
        title: 'Update Document',
        code: 
`db.collection('users')
  .doc({ id: 1 })
  .update({
    name: 'William'
  })`
      },
      {
        id: 3,
        title: 'Set Document',
        code: 
`db.collection('users')
  .doc({ id: 2 })
  .set({
    id: 4, 
    name: 'Pauline',
    age: 27
  })`
      },
    ]
  },
  {
    sectionTitle: 'Getting Data',
    codeSnippets: [
      {
        id: 4,
        title: 'Get Collection',
        code: 
`db.collection('users')
  .get().then(users => {
    console.log(users)
  })`
      },
      {
        id: 5,
        title: 'Order Collection (ascending)',
        code:
`db.collection('users')
  .orderBy('age')
  .get()
  .then(users => {
    console.log('users: ', users)
  })`
      },
      {
        id: 6,
        title: 'Order Collection (descending)',
        code:
`db.collection('users')
  .orderBy('name', 'desc')
  .get()
  .then(users => {
    console.log('users: ', users)
  })`
      },
      {
        id: 7,
        title: 'Limit Collection',
        code: 
`db.collection('users')
  .orderBy('name', 'desc')
  .limit(1)
  .get()
  .then(users => {
    console.log('users: ', users)
  })`
      },
      {
        id: 8,
        title: 'Get Document',
        code: 
`db.collection('users')
  .doc({ id: 1 })
  .get()
  .then(document => {
    console.log(document)
  })`
      },            
    ]
  },
  {
    sectionTitle: 'Deleting Data',
    codeSnippets: [
      {
        id: 9,
        title: 'Delete Document',
        code: 
`db.collection('users')
  .doc({ id: 1 })
  .delete()`
      },
      {
        id: 10,
        title: 'Delete Collection',
        code: 
`db.collection('users')
  .delete()`
      },
      {
        id: 11,
        title: 'Delete Database',
        code: 
`db.delete()`
      }
    ]
  },
  {
    sectionTitle: 'Advanced Usage with Keys',
    codeSnippets: [
      {
        id: 12,
        title: 'Add Document by Key',
        code: 
`db.collection('users')
  .add({
    id: 1,
    name: 'Bill',
    age: 47
  }, 'mykey-1')

// or use .doc(key).set():

db.collection('users')
  .doc('mykey-2')
  .set({
    id: 2,
    name: 'Paul',
    age: 34
  })`
      },
      {
        id: 13,
        title: 'Get Document by Key',
        code: 
`db.collection('users')
  .doc('mykey-1')
  .get()
  .then(document => {
    console.log(document)
  })`
      },     
      {
        id: 14,
        title: 'Update Document by Key',
        code: 
`db.collection('users')
  .doc('mykey-1')
  .update({
    name: 'William'
  })`
      },     
      {
        id: 15,
        title: 'Set Document by Key',
        code: 
`db.collection('users')
  .doc('mykey-2')
  .set({
    id: 4, 
    name: 'Pauline',
    age: 27
  })`
      },
      {
        id: 16,
        title: 'Get Collection with Keys',
        code: 
`db.collection('users')
  .orderBy('name', 'desc')
  .get({ keys: true })
  .then(users => {
    console.log('users: ', users)
  })`
      },
      {
        id: 17,
        title: 'Delete Document by Key',
        code: 
`db.collection('users')
  .doc('mykey-1')
  .delete()`
      }
    ]
  },
  
  {
    sectionTitle: 'Promises',
    codeSnippets: [
      {
        id: 18,
        title: 'Add Document then do something',
        code: 
`db.collection('users')
  .add({
    id: 1,
    name: 'Bill',
    age: 47
  }, 'mykey-1')
  .then(response => {
    console.log('Add successful, now do something.')
  })
  .catch(error => {
    console.log('There was an error, do something else.')
  })

// you can test the error by passing a 
// string, number or boolean into the 
// .add() method, instead of an object`
      },
      {
        id: 19,
        title: 'Update Document then do something',
        code: 
`db.collection('users')
  .doc({ id: 1 })
  .update({
    name: 'William'
  })
  .then(response => {
    console.log('Update successful, now do something.')
  })
  .catch(error => {
    console.log('There was an error, do something else.')
  })
  
// you can test the error by passing nothing
// into the update() method`
      },
      {
        id: 20,
        title: 'Set Document then do something',
        code: 
`db.collection('users')
  .doc({ id: 1 })
  .set({
    id: 1, 
    name: 'Pauline',
    age: 27
  })
  .then(response => {
    console.log('Set successful, now do something.')
  })
  .catch(error => {
    console.log('There was an error, do something else.')
  })

// you can test the error by passing nothing
// into the set() method`
      },
      {
        id: 21,
        title: 'Delete Document then do something',
        code: 
`db.collection('users')
  .doc({ id: 1 })
  .delete()
  .then(response => {
    console.log('Delete successful, now do something.')
  })
  .catch(error => {
    console.log('There was an error, do something else.')
  })

  // you can test the error by passing nothing
  // into the doc() method`
      },
      {
        id: 22,
        title: 'Delete Collection then do something',
        code: 
`db.collection('users')
  .delete()
  .then(response => {
    console.log('Collection deleted, now do something.')
  })
  .catch(error => {
    console.log('There was an error, do something else')
  })
  
// you can test the error by passing nothing
// into the collection() method`
      },
      {
        id: 23,
        title: 'Delete Database then do something',
        code: 
`db.delete()
  .then(response => {
    console.log('Database deleted, now do something.')
  })
  .catch(error => {
    console.log('There was an error, do something else.')
  })
  
// note: sometimes when you delete a
// database, the change won't show up
// in Chrome Dev tools til you reload
// the page`
      },
    ]
  },

  {
    sectionTitle: 'Async / Await',
    codeSnippets: [
      {
        id: 24,
        title: 'Add Documents (with Async Await)',
        code:
`async function addUsers() {
  await db.collection('users').add({
    id: 1,
    name: 'Bill',
    age: 47
  })
  console.log('first user added')
  await db.collection('users').add({
    id: 2,
    name: 'Paul',
    age: 34
  })
  console.log('second user added')
}
addUsers()`
      },
      {
        id: 25,
        title: 'Update Document (with Async Await)',
        code:
`async function updateUser() {
  let result = await db.collection('users')
    .doc({ id: 1 })
    .update({
      name: 'William'
    })
  console.log(result)
}
updateUser()`
      },
      {
        id: 26,
        title: 'Set Document (with Async Await)',
        code:
`async function setUser() {
  let result = await db.collection('users')
    .doc({ id: 2 })
    .set({
      id: 4, 
      name: 'Pauline',
      age: 27
    })
    console.log(result)
}
setUser()`
      },
      {
        id: 27,
        title: 'Get Collection & Catch Errors (with Async Await)',
        code:
`async function getUsers() {
  try {
    let users = await db.collection('users')
      .orderBy('age')
      .get()
    console.log('users: ', users)
  }
  catch(error) {
    console.log('error: ', error)
  }
}
getUsers()

// test the error by passing nothing into collection()`
      }
    ]
  },

  {
    sectionTitle: 'Config',
    codeSnippets: [
      {
        id: 28,
        title: 'Disable Localbase debug logs',
        code: 
`db.config.debug = false

// from now on, you won't see any localbase debug logs`
      },
      {
        id: 29,
        title: 'Enable Localbase debug logs',
        code: 
`db.config.debug = true

// from now on, you will see localbase debug logs`
      }
    ]
  },

]
export default codeSnippetSections