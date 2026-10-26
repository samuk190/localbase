import isSubset from '../../utils/isSubset'
import { matchesAllFilters } from '../../utils/matcher'
import reset from '../../api-utils/reset'
import showUserErrors from '../../api-utils/showUserErrors'

export default function count() {
  const collectionName = this.collectionName
  const queryFilters = this.queryFilters || []

  if (!collectionName) {
    this.userErrors.push('No collection name specified before calling .count()')
    showUserErrors.call(this)
    return Promise.reject(new Error('No collection specified'))
  }

  // Fast-path: O(1) count if no filters applied
  if (!queryFilters.length) {
    return this.lf[collectionName].length().then(len => {
      reset.call(this)
      return len
    })
  }

  // Filtered count without accumulating records into memory
  let total = 0
  return this.lf[collectionName]
    .iterate((value) => {
      if (matchesAllFilters(value, queryFilters)) {
        total++
      }
    })
    .then(() => {
      reset.call(this)
      return total
    })
}
