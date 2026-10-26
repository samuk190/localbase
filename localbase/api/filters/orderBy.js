export default function orderBy(...args) {
  if (!this.orderByClauses) {
    this.orderByClauses = []
  }

  if (!args.length) {
    this.userErrors.push("No field name specified in orderBy() method. Use a string e.g. 'name'")
    return this
  }

  // Support orderBy(['l_name', 'f_name'])
  if (Array.isArray(args[0])) {
    for (const prop of args[0]) {
      if (typeof prop === 'string') {
        this.orderByClauses.push({ property: prop, direction: 'asc' })
      }
    }
    return this
  }

  // Support orderBy('l_name', 'f_name') where second param is another field (Issue #15)
  // vs orderBy('name', 'desc')
  const [first, second] = args
  if (typeof first !== 'string') {
    this.userErrors.push("Property in orderBy() method must be a string, e.g. 'name'")
    return this
  }

  if (second === 'asc' || second === 'desc') {
    this.orderByProperty = first
    this.orderByDirection = second
    this.orderByClauses.push({ property: first, direction: second })
  } else if (typeof second === 'string') {
    // Both are fields with default 'asc'
    this.orderByProperty = first
    this.orderByDirection = 'asc'
    this.orderByClauses.push({ property: first, direction: 'asc' })
    this.orderByClauses.push({ property: second, direction: 'asc' })
  } else {
    this.orderByProperty = first
    this.orderByDirection = 'asc'
    this.orderByClauses.push({ property: first, direction: 'asc' })
  }

  return this
}
