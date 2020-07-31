import logger from '../utils/logger'

export default function error(message) {
  this.reset()
  logger.error.call(this, message)
  return (`Error: ${ message }`)
}