export default function where(field, operator, value) {
  if (!field || typeof field !== 'string') {
    this.userErrors.push('First parameter in where() method must be a string field name, e.g. "age"')
    return this
  }

  // Shorthand where('name', 'Bill') -> where('name', '==', 'Bill')
  if (value === undefined && operator !== undefined) {
    value = operator
    operator = '=='
  }

  const validOperators = [
    '==', '===', '!=', '<>', '>', '>=', '<', '<=',
    'gt', 'gte', 'lt', 'lte',
    'in', 'not-in', 'array-contains', 'array-contains-any', 'between'
  ]

  if (!validOperators.includes(operator)) {
    this.userErrors.push(
      `Invalid operator "${operator}" in where() method. Supported operators: ${validOperators.join(', ')}`
    )
    return this
  }

  if (!this.queryFilters) {
    this.queryFilters = []
  }

  this.queryFilters.push({ field, operator, value })
  return this
}
