export default function offset(skipCount) {
  if (typeof skipCount !== 'number' || skipCount < 0) {
    this.userErrors.push('Parameter passed to .offset() / .skip() must be a non-negative number, e.g. 10')
    return this
  }
  this.offsetBy = Math.floor(skipCount)
  return this
}
