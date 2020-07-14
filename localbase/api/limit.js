export default function limit(limitBy) {
  if (limitBy) this.limitBy = limitBy
  console.log('this.limitBy: ', this.limitBy)
  return this
}