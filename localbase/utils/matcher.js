function getNestedValue(obj, path) {
  if (!obj || typeof obj !== 'object') return undefined
  if (!path.includes('.')) return obj[path]
  const keys = path.split('.')
  let current = obj
  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined
    }
    current = current[key]
  }
  return current
}

export function evaluateCondition(recordValue, operator, targetValue) {
  switch (operator) {
    case '==':
    case '===':
      if (recordValue instanceof Date && targetValue instanceof Date) {
        return recordValue.getTime() === targetValue.getTime()
      }
      return recordValue === targetValue

    case '!=':
    case '<>':
      if (recordValue instanceof Date && targetValue instanceof Date) {
        return recordValue.getTime() !== targetValue.getTime()
      }
      return recordValue !== targetValue

    case '>':
    case 'gt':
      if (recordValue instanceof Date && targetValue instanceof Date) {
        return recordValue.getTime() > targetValue.getTime()
      }
      return recordValue > targetValue

    case '>=':
    case 'gte':
      if (recordValue instanceof Date && targetValue instanceof Date) {
        return recordValue.getTime() >= targetValue.getTime()
      }
      return recordValue >= targetValue

    case '<':
    case 'lt':
      if (recordValue instanceof Date && targetValue instanceof Date) {
        return recordValue.getTime() < targetValue.getTime()
      }
      return recordValue < targetValue

    case '<=':
    case 'lte':
      if (recordValue instanceof Date && targetValue instanceof Date) {
        return recordValue.getTime() <= targetValue.getTime()
      }
      return recordValue <= targetValue

    case 'in':
      if (!Array.isArray(targetValue)) return false
      return targetValue.some(t => {
        if (recordValue instanceof Date && t instanceof Date) {
          return recordValue.getTime() === t.getTime()
        }
        return recordValue === t
      })

    case 'not-in':
      if (!Array.isArray(targetValue)) return true
      return !targetValue.some(t => {
        if (recordValue instanceof Date && t instanceof Date) {
          return recordValue.getTime() === t.getTime()
        }
        return recordValue === t
      })

    case 'array-contains':
      if (!Array.isArray(recordValue)) return false
      return recordValue.some(item => {
        if (item instanceof Date && targetValue instanceof Date) {
          return item.getTime() === targetValue.getTime()
        }
        return item === targetValue
      })

    case 'array-contains-any':
      if (!Array.isArray(recordValue) || !Array.isArray(targetValue)) return false
      return targetValue.some(target => recordValue.includes(target))

    case 'between':
      if (!Array.isArray(targetValue) || targetValue.length !== 2) return false
      const [min, max] = targetValue
      if (recordValue instanceof Date) {
        const val = recordValue.getTime()
        const minVal = min instanceof Date ? min.getTime() : min
        const maxVal = max instanceof Date ? max.getTime() : max
        return val >= minVal && val <= maxVal
      }
      return recordValue >= min && recordValue <= max

    default:
      return false
  }
}

export function matchesAllFilters(record, filters) {
  if (!filters || !filters.length) return true

  return filters.every(filter => {
    const recordValue = getNestedValue(record, filter.field)
    return evaluateCondition(recordValue, filter.operator, filter.value)
  })
}

export default {
  evaluateCondition,
  matchesAllFilters,
  getNestedValue
}
