export default function reset() {
  console.log('reset')
  this.collectionName = null
  this.editType = 'db'
  this.orderByProperty = null
  this.orderByDirection = null
  this.limitBy = null
  this.docSelectionCriteria = null
}