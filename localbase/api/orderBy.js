export default function orderBy(property, direction) {
  if (property) this.orderByProperty = property
  if (direction) this.orderByDirection = direction
  return this
}