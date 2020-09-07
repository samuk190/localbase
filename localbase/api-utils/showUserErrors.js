import logger from '../utils/logger'
import reset from './reset'

export default function showUserErrors() {
  for (let i = 0; i < this.userErrors.length; i++) {
    logger.error.call(this, this.userErrors[i])
  }
  reset.call(this)
}