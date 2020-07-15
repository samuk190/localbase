export default function selectionLevel() {
  let level
  if (!this.collectionName && !this.docSelectionCriteria) level = 'db'
  else if (this.collectionName && !this.docSelectionCriteria) level = 'collection'
  else if (this.collectionName && this.docSelectionCriteria) level = 'doc'
  return level
}