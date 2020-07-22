export default function doc(docSelectionCriteria) {
  if (!docSelectionCriteria) this.docSelectionCriteria = 'undefined'
  else this.docSelectionCriteria = docSelectionCriteria
  return this
}