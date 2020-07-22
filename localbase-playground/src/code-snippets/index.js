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
        id: 17,
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
        id: 16,
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
        id: 13,
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
        id: 14,
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
        id: 15,
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
    ]
  },

]
export default codeSnippetSections