export default function doc(docSelectionCriteria) {
  if (docSelectionCriteria === null || docSelectionCriteria === undefined) {
    this.userErrors.push('No document criteria specified in doc() method. Use a string/number (key) or an object (criteria) e.g. { id: 1 }')
    return this
  }
  if (typeof docSelectionCriteria !== 'string' && typeof docSelectionCriteria !== 'number' && typeof docSelectionCriteria !== 'object') {
    this.userErrors.push('Document criteria specified in doc() method must be a string, number, or object.')
    return this
  }
  this.docSelectionCriteria = docSelectionCriteria
  return this
}
