import logger from '../utils/logger.js'
import reset from '../api-utils/reset.js'

export default function error(message) {
  reset.call(this)
  logger.error.call(this, message)
  return (`Error: ${ message }`)
}