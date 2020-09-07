export default function doc(docSelectionCriteria) {
  if (!docSelectionCriteria) {
    this.userErrors.push('No document criteria specified in doc() method. Use a string (with a key) or an object (with criteria) e.g. { id: 1 }')
  }
  else if (typeof docSelectionCriteria !== 'string' && typeof docSelectionCriteria !== 'object') {
    this.userErrors.push('Document criteria specified in doc() method must not be a number or boolean. Use a string (with a key) or an object (with criteria) e.g. { id: 1 }')
  }
  else {
    this.docSelectionCriteria = docSelectionCriteria
  }
  return this
}