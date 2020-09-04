export default function limit(limitBy) {
  if (!limitBy) {
    this.selectorAndFilterErrors.push("No integer specified in limit() method.")
  }
  else if (!Number.isInteger(limitBy)) {
    this.selectorAndFilterErrors.push("Limit parameter in limit() method must be an integer (e.g. 3) and not a float, boolean, string or object.")
  }
  else {
    this.limitBy = limitBy
  }
  return this
}