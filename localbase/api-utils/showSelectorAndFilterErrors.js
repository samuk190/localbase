import error from './error'
import reset from '../api-utils/reset'

export default function showSelectorAndFilterErrors(message) {
  for (let i = 0; i < this.selectorAndFilterErrors.length; i++) {
    error.call(
      this,
      this.selectorAndFilterErrors[i]
    )
  }
  reset.call(this)
}