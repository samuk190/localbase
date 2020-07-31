import logger from '../utils/logger'
import reset from '../api-utils/reset'

export default function error(message) {
  reset.call(this)
  logger.error.call(this, message)
  return (`Error: ${ message }`)
}