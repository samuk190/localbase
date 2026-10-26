import isSubset from '../../utils/isSubset'
import reset from '../../api-utils/reset'
import showUserErrors from '../../api-utils/showUserErrors'

export default function exists() {
  const collectionName = this.collectionName
  const docSelectionCriteria = this.docSelectionCriteria

  if (!collectionName || !docSelectionCriteria) {
    this.userErrors.push('Both collection and doc criteria must be specified before calling .exists()')
    showUserErrors.call(this)
    return Promise.reject(new Error('Invalid selection for .exists()'))
  }

  if (typeof docSelectionCriteria === 'string') {
    return this.lf[collectionName].getItem(docSelectionCriteria).then(val => {
      reset.call(this)
      return val !== null && val !== undefined
    })
  }

  // Object criteria search
  let found = false
  return this.lf[collectionName]
    .iterate(val => {
      if (isSubset(val, docSelectionCriteria)) {
        found = true
        return true // Stop iteration early
      }
    })
    .then(() => {
      reset.call(this)
      return found
    })
}
