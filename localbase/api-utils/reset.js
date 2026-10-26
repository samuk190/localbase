export default function reset() {
  this.collectionName = null
  this.orderByProperty = null
  this.orderByDirection = null
  this.orderByClauses = []
  this.queryFilters = []
  this.limitBy = null
  this.docSelectionCriteria = null
  this.userErrors = []
}