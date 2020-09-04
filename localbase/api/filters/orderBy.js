export default function orderBy(property, direction) {
  if (!property) {
    this.selectorAndFilterErrors.push("No field name specified in orderBy() method. Use a string e.g. 'name'")
  }
  else if (typeof property !== 'string') {
    this.selectorAndFilterErrors.push("First parameter in orderBy() method must be a string (a field name) e.g. 'name'")
  }
  else {
    this.orderByProperty = property
  }
  if (direction) {
    if (direction !== 'asc' && direction !== 'desc') {
      this.selectorAndFilterErrors.push("Second parameter in orderBy() method must be a string set to 'asc' or 'desc'.")
    }
    else {
      this.orderByDirection = direction
    }
  }
  return this
}