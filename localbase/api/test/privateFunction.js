export default function privateFunction(name, id) {
  console.log('name: ', name)
  console.log('id: ', id)
  console.log('privateFunction')
  this.test = 'set by privateFunction'
}