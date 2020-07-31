import logger from '../utils/logger'
import reset from '../api-utils/reset'

export default function success(message, data) {
  reset.call(this)
  logger.log.call(this, message, data)
  return (`Success: ${ message } ${ JSON.stringify(data) }`)
}