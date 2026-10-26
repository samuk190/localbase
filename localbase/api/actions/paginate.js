import reset from '../../api-utils/reset'
import showUserErrors from '../../api-utils/showUserErrors'
import { matchesAllFilters } from '../../utils/matcher'

function compareValues(a, b) {
  if (a === b) return 0
  if (a === undefined || a === null) return 1
  if (b === undefined || b === null) return -1
  if (typeof a === 'number' && typeof b === 'number') return a - b
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime()
  return a.toString().localeCompare(b.toString())
}

export default async function paginate(options = { page: 1, limit: 10 }) {
  const collectionName = this.collectionName
  const queryFilters = [...(this.queryFilters || [])]
  const orderByClauses = [...(this.orderByClauses || [])]

  const page = Math.max(1, parseInt(options.page || 1, 10))
  const limit = Math.max(1, parseInt(options.limit || options.pageSize || 10, 10))
  const skip = (page - 1) * limit

  if (!collectionName) {
    this.userErrors.push('No collection name specified before calling .paginate()')
    showUserErrors.call(this)
    return Promise.reject(new Error('No collection specified'))
  }

  let totalRows = 0
  let matchedRows = []

  await this.lf[collectionName].iterate((value, key) => {
    if (matchesAllFilters(value, queryFilters)) {
      totalRows++
      matchedRows.push(options.keys ? { key, data: value } : value)
    }
  })

  // Sort if order clauses defined
  if (orderByClauses.length) {
    matchedRows.sort((itemA, itemB) => {
      const a = options.keys ? itemA.data : itemA
      const b = options.keys ? itemB.data : itemB

      for (const clause of orderByClauses) {
        const valA = a[clause.property]
        const valB = b[clause.property]
        const diff = compareValues(valA, valB)
        if (diff !== 0) {
          return clause.direction === 'desc' ? -diff : diff
        }
      }
      return 0
    })
  }

  const rows = matchedRows.slice(skip, skip + limit)
  const totalPages = Math.ceil(totalRows / limit)

  reset.call(this)

  return {
    total_rows: totalRows,
    row_limit: limit,
    total_page: totalPages,
    current_page: page,
    rows: rows
  }
}
