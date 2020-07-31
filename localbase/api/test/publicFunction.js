import privateFunction from './privateFunction'

export default function publicFunction() {
  console.log('publicFunction')
  this.test = 'set by publicFunction'
  privateFunction.call(this, 'John', 'id1')
  console.log('this.test: ', this.test)
}